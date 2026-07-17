import {
  FieldValue,
  getFirestore,
  Timestamp,
  type DocumentData,
  type Firestore,
} from 'firebase-admin/firestore';

import {
  calculateRetryDelayMs,
  parseFounderCampaign,
  parseFounderClaim,
} from './contracts.js';
import {
  findActiveEntitlement,
  RevenueCatApiError,
  type RevenueCatClient,
  type RevenueCatCustomerEntitlements,
} from './revenueCatClient.js';
import { customerDeletionTombstoneRef } from './revenueCatDeletion.js';

const LEASE_DURATION_MS = 2 * 60 * 1000;
const RECONCILIATION_BATCH_SIZE = 80;
const RECONCILIATION_CONCURRENCY = 5;

type GrantWork = Readonly<{
  attemptCount: number;
  campaignId: string;
  entitlementId: string;
  expiresAt: Timestamp;
  firebaseUid: string;
  revenueCatCustomerId: string;
}>;

export class GrantOutboxProcessor {
  constructor(
    private readonly revenueCat: RevenueCatClient,
    private readonly firestore: Firestore = getFirestore(),
    private readonly now: () => Timestamp = Timestamp.now,
  ) {}

  async process(outboxId: string): Promise<void> {
    const work = await this.acquireLease(outboxId);
    if (!work) {
      return;
    }

    try {
      const customer = await this.revenueCat.getActiveEntitlements(
        work.revenueCatCustomerId,
      );
      if (!customer.exists) {
        await this.scheduleRetry(outboxId, work, {
          code: 'customer_not_found',
          retryable: true,
        });
        return;
      }

      const activeEntitlement = findActiveEntitlement(
        customer,
        work.entitlementId,
      );
      if (activeEntitlement) {
        if (entitlementCoversGrant(customer, work)) {
          await this.finalizeGrant(outboxId, work);
        } else {
          await this.markManualReview(
            outboxId,
            work,
            'active_entitlement_expiry_mismatch',
          );
        }
        return;
      }

      await this.revenueCat.grantEntitlement(
        work.revenueCatCustomerId,
        work.entitlementId,
        work.expiresAt.toMillis(),
      );
      await this.finalizeGrant(outboxId, work);
    } catch (error) {
      if (error instanceof RevenueCatApiError && error.statusCode === 409) {
        await this.reconcileConflict(outboxId, work);
        return;
      }

      if (error instanceof RevenueCatApiError && error.retryable) {
        await this.scheduleRetry(outboxId, work, error);
        return;
      }

      const code =
        error instanceof RevenueCatApiError
          ? error.code
          : 'unexpected_worker_error';
      await this.markManualReview(outboxId, work, code);
    }
  }

  async reconcileDue(): Promise<number> {
    const now = this.now();
    const snapshots = await this.firestore
      .collection('monetizationGrantOutbox')
      .where('processAfter', '<=', now)
      .orderBy('processAfter', 'asc')
      .limit(RECONCILIATION_BATCH_SIZE)
      .get();
    const ids = snapshots.docs.map(document => document.id);

    for (
      let index = 0;
      index < ids.length;
      index += RECONCILIATION_CONCURRENCY
    ) {
      const batch = ids.slice(index, index + RECONCILIATION_CONCURRENCY);
      await Promise.allSettled(batch.map(outboxId => this.process(outboxId)));
    }

    return ids.length;
  }

  private async acquireLease(outboxId: string): Promise<GrantWork | null> {
    const outboxRef = this.firestore
      .collection('monetizationGrantOutbox')
      .doc(outboxId);
    const now = this.now();

    return this.firestore.runTransaction(async transaction => {
      const outboxSnapshot = await transaction.get(outboxRef);
      const outbox = outboxSnapshot.data();
      if (!outboxSnapshot.exists || !canAcquireOutbox(outbox, now)) {
        return null;
      }

      const campaignId = readNonEmptyString(outbox?.campaignId);
      const firebaseUid = readNonEmptyString(outbox?.firebaseUid);
      if (!campaignId || !firebaseUid) {
        transaction.update(
          outboxRef,
          manualReviewUpdate(now, 'invalid_outbox'),
        );
        return null;
      }

      const campaignRef = this.firestore
        .collection('monetizationCampaigns')
        .doc(campaignId);
      const claimRef = campaignRef.collection('claims').doc(firebaseUid);
      const campaignSnapshot = await transaction.get(campaignRef);
      const claimSnapshot = await transaction.get(claimRef);
      const deletionTombstoneSnapshot = await transaction.get(
        customerDeletionTombstoneRef(this.firestore, firebaseUid),
      );

      if (deletionTombstoneSnapshot.exists) {
        transaction.update(
          outboxRef,
          manualReviewUpdate(now, 'account_deletion_requested'),
        );
        if (
          claimSnapshot.exists &&
          claimSnapshot.data()?.status !== 'granted'
        ) {
          transaction.update(
            claimRef,
            manualReviewUpdate(now, 'account_deletion_requested'),
          );
        }
        return null;
      }

      const campaign = parseFounderCampaign(campaignSnapshot.data());
      const claim = parseFounderClaim(claimSnapshot.data());

      if (!campaign || !claim) {
        transaction.update(
          outboxRef,
          manualReviewUpdate(now, 'invalid_campaign_or_claim'),
        );
        if (claimSnapshot.exists) {
          transaction.update(
            claimRef,
            manualReviewUpdate(now, 'invalid_campaign_or_claim'),
          );
        }
        return null;
      }

      if (claim.status === 'granted') {
        transaction.update(outboxRef, doneUpdate(now));
        return null;
      }

      if (claim.status === 'manualReview') {
        transaction.update(
          outboxRef,
          manualReviewUpdate(now, 'claim_in_manual_review'),
        );
        return null;
      }

      if (claim.revenueCatCustomerId !== firebaseUid) {
        transaction.update(
          outboxRef,
          manualReviewUpdate(now, 'customer_identity_mismatch'),
        );
        transaction.update(
          claimRef,
          manualReviewUpdate(now, 'customer_identity_mismatch'),
        );
        return null;
      }

      if (claim.revenueCatEntitlementId !== campaign.revenueCatEntitlementId) {
        transaction.update(
          outboxRef,
          manualReviewUpdate(now, 'entitlement_identity_mismatch'),
        );
        transaction.update(
          claimRef,
          manualReviewUpdate(now, 'entitlement_identity_mismatch'),
        );
        return null;
      }

      const attemptCount =
        Math.max(
          claim.attemptCount,
          readNonNegativeInteger(outbox?.attemptCount) ?? 0,
        ) + 1;
      const leaseExpiresAt = Timestamp.fromMillis(
        now.toMillis() + LEASE_DURATION_MS,
      );
      transaction.update(outboxRef, {
        attemptCount,
        lastAttemptAt: now,
        leaseExpiresAt,
        processAfter: leaseExpiresAt,
        status: 'processing',
        updatedAt: now,
      });
      transaction.update(claimRef, {
        attemptCount,
        lastAttemptAt: now,
        status: 'granting',
        updatedAt: now,
      });

      return {
        attemptCount,
        campaignId,
        entitlementId: claim.revenueCatEntitlementId,
        expiresAt: claim.expiresAt,
        firebaseUid,
        revenueCatCustomerId: claim.revenueCatCustomerId,
      };
    });
  }

  private async reconcileConflict(
    outboxId: string,
    work: GrantWork,
  ): Promise<void> {
    try {
      const customer = await this.revenueCat.getActiveEntitlements(
        work.revenueCatCustomerId,
      );
      if (customer.exists && entitlementCoversGrant(customer, work)) {
        await this.finalizeGrant(outboxId, work);
        return;
      }

      const activeEntitlement = findActiveEntitlement(
        customer,
        work.entitlementId,
      );
      if (activeEntitlement) {
        await this.markManualReview(outboxId, work, 'conflict_expiry_mismatch');
        return;
      }

      await this.scheduleRetry(outboxId, work, {
        code: 'grant_conflict_unresolved',
        retryable: true,
      });
    } catch (error) {
      const normalized =
        error instanceof RevenueCatApiError
          ? error
          : { code: 'conflict_reconciliation_failed', retryable: true };
      await this.scheduleRetry(outboxId, work, normalized);
    }
  }

  private async finalizeGrant(
    outboxId: string,
    work: GrantWork,
  ): Promise<void> {
    const outboxRef = this.firestore
      .collection('monetizationGrantOutbox')
      .doc(outboxId);
    const campaignRef = this.firestore
      .collection('monetizationCampaigns')
      .doc(work.campaignId);
    const claimRef = campaignRef.collection('claims').doc(work.firebaseUid);
    const now = this.now();

    await this.firestore.runTransaction(async transaction => {
      const outboxSnapshot = await transaction.get(outboxRef);
      const campaignSnapshot = await transaction.get(campaignRef);
      const claimSnapshot = await transaction.get(claimRef);
      const outbox = outboxSnapshot.data();
      const campaign = parseFounderCampaign(campaignSnapshot.data());
      const claim = parseFounderClaim(claimSnapshot.data());

      if (outbox?.status === 'done') {
        return;
      }

      if (!outboxSnapshot.exists || !outbox || !campaign || !claim) {
        throw new Error('Cannot finalize an invalid founder grant ledger.');
      }

      if (claim.status === 'granted') {
        transaction.update(outboxRef, doneUpdate(now));
        return;
      }

      if (claim.status === 'manualReview' || outbox.status === 'manualReview') {
        return;
      }

      transaction.update(claimRef, {
        grantedAt: now,
        lastErrorCode: FieldValue.delete(),
        nextAttemptAt: FieldValue.delete(),
        status: 'granted',
        updatedAt: now,
      });
      transaction.update(outboxRef, doneUpdate(now));
      transaction.update(campaignRef, {
        grantedCount: campaign.grantedCount + 1,
        updatedAt: now,
      });
    });
  }

  private async scheduleRetry(
    outboxId: string,
    work: GrantWork,
    error: Readonly<{
      backoffMs?: number;
      code: string;
      retryable: boolean;
    }>,
  ): Promise<void> {
    const outboxRef = this.firestore
      .collection('monetizationGrantOutbox')
      .doc(outboxId);
    const claimRef = this.firestore
      .collection('monetizationCampaigns')
      .doc(work.campaignId)
      .collection('claims')
      .doc(work.firebaseUid);
    const now = this.now();
    const nextAttemptAt = Timestamp.fromMillis(
      now.toMillis() +
        calculateRetryDelayMs(work.attemptCount, error.backoffMs),
    );

    await this.firestore.runTransaction(async transaction => {
      const outboxSnapshot = await transaction.get(outboxRef);
      const claimSnapshot = await transaction.get(claimRef);
      const outbox = outboxSnapshot.data();
      const claim = parseFounderClaim(claimSnapshot.data());

      if (
        !outboxSnapshot.exists ||
        !claim ||
        outbox?.status === 'done' ||
        outbox?.status === 'manualReview' ||
        claim.status === 'granted' ||
        claim.status === 'manualReview'
      ) {
        return;
      }

      transaction.update(outboxRef, {
        lastErrorCode: error.code,
        leaseExpiresAt: FieldValue.delete(),
        nextAttemptAt,
        processAfter: nextAttemptAt,
        status: 'pending',
        updatedAt: now,
      });
      transaction.update(claimRef, {
        lastErrorCode: error.code,
        nextAttemptAt,
        status: 'granting',
        updatedAt: now,
      });
    });
  }

  private async markManualReview(
    outboxId: string,
    work: GrantWork,
    errorCode: string,
  ): Promise<void> {
    const outboxRef = this.firestore
      .collection('monetizationGrantOutbox')
      .doc(outboxId);
    const claimRef = this.firestore
      .collection('monetizationCampaigns')
      .doc(work.campaignId)
      .collection('claims')
      .doc(work.firebaseUid);
    const now = this.now();

    await this.firestore.runTransaction(async transaction => {
      const outboxSnapshot = await transaction.get(outboxRef);
      const claimSnapshot = await transaction.get(claimRef);
      const outbox = outboxSnapshot.data();
      const claim = parseFounderClaim(claimSnapshot.data());
      if (
        !outboxSnapshot.exists ||
        !claim ||
        outbox?.status === 'done' ||
        claim.status === 'granted'
      ) {
        return;
      }

      transaction.update(outboxRef, manualReviewUpdate(now, errorCode));
      transaction.update(claimRef, manualReviewUpdate(now, errorCode));
    });
  }
}

function canAcquireOutbox(
  outbox: DocumentData | undefined,
  now: Timestamp,
): boolean {
  if (
    !outbox ||
    (outbox.status !== 'pending' && outbox.status !== 'processing')
  ) {
    return false;
  }

  const processAfter = outbox.processAfter;
  if (
    processAfter instanceof Timestamp &&
    processAfter.toMillis() > now.toMillis()
  ) {
    return false;
  }

  const leaseExpiresAt = outbox.leaseExpiresAt;
  return !(
    outbox.status === 'processing' &&
    leaseExpiresAt instanceof Timestamp &&
    leaseExpiresAt.toMillis() > now.toMillis()
  );
}

function entitlementCoversGrant(
  customer: RevenueCatCustomerEntitlements,
  work: GrantWork,
): boolean {
  const entitlement = findActiveEntitlement(customer, work.entitlementId);
  return Boolean(
    entitlement &&
      (entitlement.expiresAt === null ||
        entitlement.expiresAt >= work.expiresAt.toMillis()),
  );
}

function doneUpdate(now: Timestamp): DocumentData {
  return {
    completedAt: now,
    lastErrorCode: FieldValue.delete(),
    leaseExpiresAt: FieldValue.delete(),
    nextAttemptAt: FieldValue.delete(),
    processAfter: FieldValue.delete(),
    status: 'done',
    updatedAt: now,
  };
}

function manualReviewUpdate(now: Timestamp, errorCode: string): DocumentData {
  return {
    lastErrorCode: errorCode,
    leaseExpiresAt: FieldValue.delete(),
    manualReviewAt: now,
    nextAttemptAt: FieldValue.delete(),
    processAfter: FieldValue.delete(),
    status: 'manualReview',
    updatedAt: now,
  };
}

function readNonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function readNonNegativeInteger(value: unknown): number | null {
  return Number.isInteger(value) && Number(value) >= 0 ? Number(value) : null;
}
