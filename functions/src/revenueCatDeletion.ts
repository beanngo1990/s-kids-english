import { createHash, randomUUID } from 'node:crypto';

import {
  FieldValue,
  getFirestore,
  Timestamp,
  type DocumentReference,
  type Firestore,
} from 'firebase-admin/firestore';

import type { RevenueCatClient } from './revenueCatClient.js';

export const CUSTOMER_DELETION_TOMBSTONES_COLLECTION =
  'monetizationCustomerDeletionTombstones';

// The grant worker lease is two minutes. A deletion request that observes an
// active lease waits until that lease boundary before deleting RevenueCat so
// an already-running HTTP grant cannot recreate the customer after DELETE.
const UNKNOWN_ACTIVE_LEASE_SAFETY_MS = 2 * 60 * 1000;

// RevenueCat requests time out after ten seconds and the callable itself after
// thirty seconds. This longer Firestore lease serializes concurrent account
// deletion calls while still allowing a crashed invocation to be recovered.
const CUSTOMER_DELETION_LEASE_MS = 45 * 1000;

export type RevenueCatCustomerDeletionResult =
  | 'alreadyDeleted'
  | 'deleted'
  | 'retryableError';

type DeletionPreparation = Readonly<{
  completed: boolean;
  safeAfter: Timestamp;
}>;

type DeletionLease =
  | Readonly<{ status: 'acquired'; leaseId: string }>
  | Readonly<{ status: 'busy' }>
  | Readonly<{ status: 'completed' }>;

export function customerDeletionTombstoneId(firebaseUid: string): string {
  return `customer_${createHash('sha256').update(firebaseUid).digest('hex')}`;
}

export function customerDeletionTombstoneRef(
  firestore: Firestore,
  firebaseUid: string,
): DocumentReference {
  return firestore
    .collection(CUSTOMER_DELETION_TOMBSTONES_COLLECTION)
    .doc(customerDeletionTombstoneId(firebaseUid));
}

/**
 * Coordinates irreversible RevenueCat deletion with the founder grant
 * ledger. The tombstone is written before any external DELETE, permanently
 * blocks new reservations for this Firebase UID, and is intentionally kept
 * after Firebase Auth deletion so a previously used reservation is not
 * returned to the campaign.
 */
export class RevenueCatDeletionCoordinator {
  constructor(
    private readonly revenueCat: RevenueCatClient,
    private readonly firestore: Firestore = getFirestore(),
    private readonly now: () => Timestamp = Timestamp.now,
  ) {}

  async deleteCustomer(
    firebaseUid: string,
  ): Promise<RevenueCatCustomerDeletionResult> {
    const preparation = await this.prepareDeletion(firebaseUid);
    if (preparation.completed) {
      return 'alreadyDeleted';
    }

    if (preparation.safeAfter.toMillis() > this.now().toMillis()) {
      return 'retryableError';
    }

    const lease = await this.acquireDeletionLease(firebaseUid);
    if (lease.status === 'completed') {
      return 'alreadyDeleted';
    }
    if (lease.status === 'busy') {
      return 'retryableError';
    }

    let result: 'deleted' | 'alreadyDeleted';
    try {
      result = await this.revenueCat.deleteCustomer(firebaseUid);
    } catch (error) {
      // The tombstone and blocked ledgers stay in place. Releasing only this
      // invocation's lease lets an idempotent RevenueCat DELETE be retried.
      await this.releaseDeletionLease(firebaseUid, lease.leaseId);
      throw error;
    }

    await this.finalizeDeletion(firebaseUid);
    return result;
  }

  private async prepareDeletion(
    firebaseUid: string,
  ): Promise<DeletionPreparation> {
    const requestedAt = this.now();
    const tombstoneRef = customerDeletionTombstoneRef(
      this.firestore,
      firebaseUid,
    );
    const existing = await this.firestore.runTransaction(async transaction => {
      const snapshot = await transaction.get(tombstoneRef);
      const data = snapshot.data();
      if (data?.status === 'completed') {
        return {
          completed: true,
          safeAfter: requestedAt,
        } satisfies DeletionPreparation;
      }

      if (!snapshot.exists) {
        transaction.create(tombstoneRef, {
          requestedAt,
          safeAfter: requestedAt,
          status: 'requested',
          updatedAt: requestedAt,
        });
      }

      return {
        completed: false,
        safeAfter:
          data?.safeAfter instanceof Timestamp ? data.safeAfter : requestedAt,
      } satisfies DeletionPreparation;
    });
    if (existing.completed) {
      return existing;
    }

    // Creating the tombstone first makes the subsequent queries safe: founder
    // reservation transactions read this same document and cannot commit a
    // new claim or outbox after the tombstone is visible.
    const [outboxes, claimRefs] = await Promise.all([
      this.firestore
        .collection('monetizationGrantOutbox')
        .where('firebaseUid', '==', firebaseUid)
        .get(),
      this.listFounderClaimRefs(firebaseUid),
    ]);

    let safeAfterMillis = existing.safeAfter.toMillis();
    for (const outbox of outboxes.docs) {
      safeAfterMillis = Math.max(
        safeAfterMillis,
        await this.blockOutbox(firebaseUid, outbox.ref, requestedAt),
      );
    }
    for (const claimRef of claimRefs) {
      await this.blockClaim(claimRef, requestedAt);
    }

    const safeAfter = Timestamp.fromMillis(safeAfterMillis);
    return this.firestore.runTransaction(async transaction => {
      const snapshot = await transaction.get(tombstoneRef);
      if (snapshot.data()?.status === 'completed') {
        return {
          completed: true,
          safeAfter: requestedAt,
        } satisfies DeletionPreparation;
      }

      const storedSafeAfter = snapshot.data()?.safeAfter;
      const mergedSafeAfter =
        storedSafeAfter instanceof Timestamp &&
        storedSafeAfter.toMillis() > safeAfter.toMillis()
          ? storedSafeAfter
          : safeAfter;
      transaction.set(
        tombstoneRef,
        {
          safeAfter: mergedSafeAfter,
          updatedAt: requestedAt,
        },
        { merge: true },
      );
      return {
        completed: false,
        safeAfter: mergedSafeAfter,
      } satisfies DeletionPreparation;
    });
  }

  private async listFounderClaimRefs(
    firebaseUid: string,
  ): Promise<readonly DocumentReference[]> {
    // Claims use the Firebase UID as their document ID. Enumerating the small
    // server-owned campaign collection avoids a collection-group index and
    // also finds orphan claims whose outbox was removed or corrupted.
    const campaigns = await this.firestore
      .collection('monetizationCampaigns')
      .select()
      .get();
    return campaigns.docs.map(campaign =>
      campaign.ref.collection('claims').doc(firebaseUid),
    );
  }

  private async blockOutbox(
    firebaseUid: string,
    outboxRef: DocumentReference,
    requestedAt: Timestamp,
  ): Promise<number> {
    return this.firestore.runTransaction(async transaction => {
      const outboxSnapshot = await transaction.get(outboxRef);
      const outbox = outboxSnapshot.data();
      if (!outboxSnapshot.exists || outbox?.firebaseUid !== firebaseUid) {
        return requestedAt.toMillis();
      }

      const storedDeletionSafeAfter =
        outbox.deletionSafeAfter instanceof Timestamp
          ? outbox.deletionSafeAfter.toMillis()
          : requestedAt.toMillis();
      let safeAfterMillis = Math.max(
        requestedAt.toMillis(),
        storedDeletionSafeAfter,
      );
      if (outbox.status === 'processing') {
        safeAfterMillis =
          outbox.leaseExpiresAt instanceof Timestamp
            ? Math.max(safeAfterMillis, outbox.leaseExpiresAt.toMillis())
            : Math.max(
                safeAfterMillis,
                requestedAt.toMillis() + UNKNOWN_ACTIVE_LEASE_SAFETY_MS,
              );
      }

      if (outbox.status !== 'done') {
        transaction.update(
          outboxRef,
          outboxDeletionBlockUpdate(
            requestedAt,
            Timestamp.fromMillis(safeAfterMillis),
          ),
        );
      }

      return safeAfterMillis;
    });
  }

  private async blockClaim(
    claimRef: DocumentReference,
    requestedAt: Timestamp,
  ): Promise<void> {
    await this.firestore.runTransaction(async transaction => {
      const claimSnapshot = await transaction.get(claimRef);
      if (!claimSnapshot.exists || claimSnapshot.data()?.status === 'granted') {
        return;
      }
      transaction.update(claimRef, claimDeletionBlockUpdate(requestedAt));
    });
  }

  private async acquireDeletionLease(
    firebaseUid: string,
  ): Promise<DeletionLease> {
    const now = this.now();
    const tombstoneRef = customerDeletionTombstoneRef(
      this.firestore,
      firebaseUid,
    );
    const leaseId = randomUUID();

    return this.firestore.runTransaction(async transaction => {
      const snapshot = await transaction.get(tombstoneRef);
      const data = snapshot.data();
      if (data?.status === 'completed') {
        return { status: 'completed' } satisfies DeletionLease;
      }

      const safeAfter = data?.safeAfter;
      if (
        safeAfter instanceof Timestamp &&
        safeAfter.toMillis() > now.toMillis()
      ) {
        return { status: 'busy' } satisfies DeletionLease;
      }

      const currentLeaseExpiresAt = data?.deletionLeaseExpiresAt;
      if (
        data?.status === 'deleting' &&
        currentLeaseExpiresAt instanceof Timestamp &&
        currentLeaseExpiresAt.toMillis() > now.toMillis()
      ) {
        return { status: 'busy' } satisfies DeletionLease;
      }

      transaction.set(
        tombstoneRef,
        {
          deletionLeaseExpiresAt: Timestamp.fromMillis(
            now.toMillis() + CUSTOMER_DELETION_LEASE_MS,
          ),
          deletionLeaseId: leaseId,
          status: 'deleting',
          updatedAt: now,
        },
        { merge: true },
      );
      return { leaseId, status: 'acquired' } satisfies DeletionLease;
    });
  }

  private async releaseDeletionLease(
    firebaseUid: string,
    leaseId: string,
  ): Promise<void> {
    const now = this.now();
    const tombstoneRef = customerDeletionTombstoneRef(
      this.firestore,
      firebaseUid,
    );
    await this.firestore.runTransaction(async transaction => {
      const snapshot = await transaction.get(tombstoneRef);
      const data = snapshot.data();
      if (data?.status !== 'deleting' || data.deletionLeaseId !== leaseId) {
        return;
      }
      transaction.set(
        tombstoneRef,
        {
          deletionLeaseExpiresAt: FieldValue.delete(),
          deletionLeaseId: FieldValue.delete(),
          status: 'requested',
          updatedAt: now,
        },
        { merge: true },
      );
    });
  }

  private async finalizeDeletion(firebaseUid: string): Promise<void> {
    const completedAt = this.now();
    const tombstoneRef = customerDeletionTombstoneRef(
      this.firestore,
      firebaseUid,
    );
    const [outboxes, claimRefs] = await Promise.all([
      this.firestore
        .collection('monetizationGrantOutbox')
        .where('firebaseUid', '==', firebaseUid)
        .get(),
      this.listFounderClaimRefs(firebaseUid),
    ]);

    // Remove all raw UID-bearing ledgers only after RevenueCat confirmed the
    // DELETE. Campaign counters deliberately stay untouched so deleting an
    // account cannot return or double-consume founder capacity.
    for (const outbox of outboxes.docs) {
      await outbox.ref.delete();
    }
    for (const claimRef of claimRefs) {
      await claimRef.delete();
    }

    await tombstoneRef.set(
      {
        completedAt,
        deletionLeaseExpiresAt: FieldValue.delete(),
        deletionLeaseId: FieldValue.delete(),
        safeAfter: FieldValue.delete(),
        status: 'completed',
        updatedAt: completedAt,
      },
      { merge: true },
    );
  }
}

function outboxDeletionBlockUpdate(
  now: Timestamp,
  safeAfter: Timestamp,
): Readonly<Record<string, unknown>> {
  return {
    deletionRequestedAt: now,
    deletionSafeAfter: safeAfter,
    lastErrorCode: 'account_deletion_requested',
    leaseExpiresAt: FieldValue.delete(),
    nextAttemptAt: FieldValue.delete(),
    processAfter: FieldValue.delete(),
    status: 'manualReview',
    updatedAt: now,
  };
}

function claimDeletionBlockUpdate(
  now: Timestamp,
): Readonly<Record<string, unknown>> {
  return {
    deletionRequestedAt: now,
    lastErrorCode: 'account_deletion_requested',
    nextAttemptAt: FieldValue.delete(),
    status: 'manualReview',
    updatedAt: now,
  };
}
