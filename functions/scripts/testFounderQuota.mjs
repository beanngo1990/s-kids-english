import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';

import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

import { grantOutboxId } from '../lib/contracts.js';
import { FirestoreFounderCampaignStore } from '../lib/founderCampaign.js';
import { GrantOutboxProcessor } from '../lib/grantOutbox.js';
import { RevenueCatApiError } from '../lib/revenueCatClient.js';
import {
  customerDeletionTombstoneRef,
  RevenueCatDeletionCoordinator,
} from '../lib/revenueCatDeletion.js';

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  throw new Error(
    'FIRESTORE_EMULATOR_HOST is required; run via npm run test:founder-quota.',
  );
}

const PROJECT_ID = 'demo-skidsenglish';
const CAMPAIGN_ID = 'founder-premium-2026-v1';
// Keep the emulator integration test small enough to finish deterministically.
// The pure service suite separately exercises 550 simultaneous claims against
// the production capacity of 500; Phase 3 owns full callable load testing.
const CAPACITY = 10;
const CLAIM_ATTEMPTS = 12;
const CONCURRENCY = 2;
const RESERVED_AT = Timestamp.fromDate(new Date('2026-07-16T00:00:00.000Z'));

if (getApps().length === 0) {
  initializeApp({ projectId: PROJECT_ID });
}
const firestore = getFirestore();
const campaignRef = firestore
  .collection('monetizationCampaigns')
  .doc(CAMPAIGN_ID);

await campaignRef.set({
  capacity: CAPACITY,
  createdAt: RESERVED_AT,
  durationDays: 365,
  entitlementLookupKey: 'premium',
  grantedCount: 0,
  kind: 'revenuecat_granted_entitlement',
  reservedCount: 0,
  revenueCatEntitlementId: 'entlEmulatorPremium',
  status: 'ready',
  updatedAt: RESERVED_AT,
});

const store = new FirestoreFounderCampaignStore(firestore);
const results = new Array(CLAIM_ATTEMPTS);
let nextClaimIndex = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (nextClaimIndex < CLAIM_ATTEMPTS) {
      const claimIndex = nextClaimIndex;
      nextClaimIndex += 1;
      results[claimIndex] = await reserveWithContentionRetry(
        store,
        `parent-${claimIndex}`,
      );
    }
  }),
);
const finalCampaign = (await campaignRef.get()).data();
const claimSnapshot = await campaignRef.collection('claims').get();

assert.equal(
  results.filter(result => result.status === 'processing').length,
  CAPACITY,
);
assert.equal(
  results.filter(result => result.status === 'soldOut').length,
  CLAIM_ATTEMPTS - CAPACITY,
);
assert.equal(finalCampaign?.reservedCount, CAPACITY);
assert.equal(claimSnapshot.size, CAPACITY);

console.log(
  `Founder quota emulator test passed at concurrency ${CONCURRENCY}: ${CAPACITY} reserved, ${
    CLAIM_ATTEMPTS - CAPACITY
  } sold out.`,
);

async function reserveWithContentionRetry(store, firebaseUid) {
  let lastError;
  for (let attempt = 1; attempt <= 12; attempt += 1) {
    try {
      return await store.reserve(CAMPAIGN_ID, firebaseUid, RESERVED_AT);
    } catch (error) {
      lastError = error;
      await delay(Math.min(20 * attempt, 200));
    }
  }
  throw lastError;
}

async function testOutboxExactlyOnce(firestore) {
  const campaignId = 'outbox-exactly-once';
  const firebaseUid = 'outbox-parent';
  const expiresAt = Timestamp.fromDate(new Date('2027-07-16T00:00:00.000Z'));
  const { campaignRef, claimRef, outboxRef } = await seedOutboxLedger(
    firestore,
    campaignId,
    firebaseUid,
    expiresAt,
  );
  const revenueCat = new FakeRevenueCatClient();
  const processor = new GrantOutboxProcessor(
    revenueCat,
    firestore,
    () => RESERVED_AT,
  );

  // Duplicate Firestore events may execute at the same time. Only one lease
  // may reach RevenueCat and only one finalization may increment the counter.
  await Promise.all([
    processor.process(outboxRef.id),
    processor.process(outboxRef.id),
    processor.process(outboxRef.id),
  ]);

  const [campaign, claim, outbox] = await Promise.all([
    campaignRef.get(),
    claimRef.get(),
    outboxRef.get(),
  ]);
  assert.equal(campaign.data()?.grantedCount, 1);
  assert.equal(claim.data()?.status, 'granted');
  assert.equal(outbox.data()?.status, 'done');
  assert.equal(outbox.data()?.processAfter, undefined);
  assert.equal(revenueCat.grantCalls, 1);
}

async function testOutboxRetryPreservesReservation(firestore) {
  const campaignId = 'outbox-retry';
  const firebaseUid = 'retry-parent';
  const expiresAt = Timestamp.fromDate(new Date('2027-07-16T00:00:00.000Z'));
  const { campaignRef, claimRef, outboxRef } = await seedOutboxLedger(
    firestore,
    campaignId,
    firebaseUid,
    expiresAt,
  );
  const processor = new GrantOutboxProcessor(
    new RetryableRevenueCatClient(),
    firestore,
    () => RESERVED_AT,
  );

  await processor.process(outboxRef.id);

  const [campaign, claim, outbox] = await Promise.all([
    campaignRef.get(),
    claimRef.get(),
    outboxRef.get(),
  ]);
  assert.equal(campaign.data()?.reservedCount, 1);
  assert.equal(campaign.data()?.grantedCount, 0);
  assert.equal(claim.data()?.status, 'granting');
  assert.equal(outbox.data()?.status, 'pending');
  assert.ok(outbox.data()?.nextAttemptAt instanceof Timestamp);
  assert.equal(outbox.data()?.lastErrorCode, 'http_429_rate_limit_error');
}

async function testOutboxRetryMatrix(firestore) {
  const failures = [
    {
      code: 'http_423_resource_locked',
      statusCode: 423,
    },
    {
      code: 'http_500_server_error',
      statusCode: 500,
    },
    {
      code: 'http_503_service_unavailable',
      statusCode: 503,
    },
    {
      code: 'network_or_timeout',
      statusCode: undefined,
    },
  ];

  for (const failure of failures) {
    const campaignId = `outbox-retry-${failure.statusCode ?? 'timeout'}`;
    const firebaseUid = `retry-parent-${failure.statusCode ?? 'timeout'}`;
    const expiresAt = Timestamp.fromDate(new Date('2027-07-16T00:00:00.000Z'));
    const { campaignRef, claimRef, outboxRef } = await seedOutboxLedger(
      firestore,
      campaignId,
      firebaseUid,
      expiresAt,
    );
    const revenueCat = new GrantFailureRevenueCatClient(
      new RevenueCatApiError({
        code: failure.code,
        retryable: true,
        statusCode: failure.statusCode,
      }),
    );
    const processor = new GrantOutboxProcessor(
      revenueCat,
      firestore,
      () => RESERVED_AT,
    );

    await processor.process(outboxRef.id);

    const [campaign, claim, outbox] = await Promise.all([
      campaignRef.get(),
      claimRef.get(),
      outboxRef.get(),
    ]);
    assert.equal(campaign.data()?.reservedCount, 1, failure.code);
    assert.equal(campaign.data()?.grantedCount, 0, failure.code);
    assert.equal(claim.data()?.status, 'granting', failure.code);
    assert.equal(outbox.data()?.status, 'pending', failure.code);
    assert.equal(outbox.data()?.lastErrorCode, failure.code);
    assert.ok(outbox.data()?.nextAttemptAt instanceof Timestamp);
    assert.equal(revenueCat.grantCalls, 1);
  }
}

async function testManualReviewMismatches(firestore) {
  const expiresAt = Timestamp.fromDate(new Date('2027-07-16T00:00:00.000Z'));

  const identityLedger = await seedOutboxLedger(
    firestore,
    'outbox-identity-mismatch',
    'identity-parent',
    expiresAt,
  );
  await identityLedger.claimRef.update({
    revenueCatCustomerId: 'different-parent',
  });
  const identityRevenueCat = new FakeRevenueCatClient();
  await new GrantOutboxProcessor(
    identityRevenueCat,
    firestore,
    () => RESERVED_AT,
  ).process(identityLedger.outboxRef.id);
  assert.equal(
    (await identityLedger.claimRef.get()).data()?.lastErrorCode,
    'customer_identity_mismatch',
  );
  assert.equal(
    (await identityLedger.outboxRef.get()).data()?.status,
    'manualReview',
  );
  assert.equal(identityRevenueCat.grantCalls, 0);

  const entitlementLedger = await seedOutboxLedger(
    firestore,
    'outbox-entitlement-mismatch',
    'entitlement-parent',
    expiresAt,
  );
  await entitlementLedger.claimRef.update({
    revenueCatEntitlementId: 'entlUnexpectedPremium',
  });
  const entitlementRevenueCat = new FakeRevenueCatClient();
  await new GrantOutboxProcessor(
    entitlementRevenueCat,
    firestore,
    () => RESERVED_AT,
  ).process(entitlementLedger.outboxRef.id);
  assert.equal(
    (await entitlementLedger.claimRef.get()).data()?.lastErrorCode,
    'entitlement_identity_mismatch',
  );
  assert.equal(
    (await entitlementLedger.outboxRef.get()).data()?.status,
    'manualReview',
  );
  assert.equal(entitlementRevenueCat.grantCalls, 0);

  const expiryLedger = await seedOutboxLedger(
    firestore,
    'outbox-expiry-mismatch',
    'expiry-parent',
    expiresAt,
  );
  const expiryRevenueCat = new FakeRevenueCatClient();
  expiryRevenueCat.activeEntitlements = [
    {
      entitlementId: 'entlEmulatorPremium',
      expiresAt: expiresAt.toMillis() - 1,
    },
  ];
  await new GrantOutboxProcessor(
    expiryRevenueCat,
    firestore,
    () => RESERVED_AT,
  ).process(expiryLedger.outboxRef.id);
  assert.equal(
    (await expiryLedger.claimRef.get()).data()?.lastErrorCode,
    'active_entitlement_expiry_mismatch',
  );
  assert.equal(
    (await expiryLedger.outboxRef.get()).data()?.status,
    'manualReview',
  );
  assert.equal(expiryRevenueCat.grantCalls, 0);
}

async function testOutboxConflictReconciliation(firestore) {
  const campaignId = 'outbox-conflict';
  const firebaseUid = 'conflict-parent';
  const expiresAt = Timestamp.fromDate(new Date('2027-07-16T00:00:00.000Z'));
  const { campaignRef, claimRef, outboxRef } = await seedOutboxLedger(
    firestore,
    campaignId,
    firebaseUid,
    expiresAt,
  );
  const processor = new GrantOutboxProcessor(
    new ConflictRevenueCatClient(expiresAt.toMillis()),
    firestore,
    () => RESERVED_AT,
  );

  await processor.process(outboxRef.id);

  const [campaign, claim, outbox] = await Promise.all([
    campaignRef.get(),
    claimRef.get(),
    outboxRef.get(),
  ]);
  assert.equal(campaign.data()?.grantedCount, 1);
  assert.equal(claim.data()?.status, 'granted');
  assert.equal(outbox.data()?.status, 'done');
}

async function testPendingDeletionPermanentlyBlocksGrant(firestore) {
  const campaignId = 'deletion-pending';
  const firebaseUid = 'deletion-pending-parent';
  const expiresAt = Timestamp.fromDate(new Date('2027-07-16T00:00:00.000Z'));
  const { campaignRef, claimRef, outboxRef } = await seedOutboxLedger(
    firestore,
    campaignId,
    firebaseUid,
    expiresAt,
  );
  const revenueCat = new DeletionRevenueCatClient();
  const coordinator = new RevenueCatDeletionCoordinator(
    revenueCat,
    firestore,
    () => RESERVED_AT,
  );

  assert.equal(await coordinator.deleteCustomer(firebaseUid), 'deleted');
  await new GrantOutboxProcessor(
    revenueCat,
    firestore,
    () => RESERVED_AT,
  ).process(outboxRef.id);

  const [campaign, claim, outbox, tombstone] = await Promise.all([
    campaignRef.get(),
    claimRef.get(),
    outboxRef.get(),
    customerDeletionTombstoneRef(firestore, firebaseUid).get(),
  ]);
  assert.equal(campaign.data()?.reservedCount, 1);
  assert.equal(campaign.data()?.grantedCount, 0);
  assert.equal(claim.exists, false);
  assert.equal(outbox.exists, false);
  assert.equal(tombstone.data()?.status, 'completed');
  assert.equal(revenueCat.grantCalls, 0);
  assert.equal(revenueCat.deleteCalls, 1);

  // The hashed tombstone makes deletion and future claim attempts idempotent
  // without retaining the raw UID in a claim document path.
  assert.equal(await coordinator.deleteCustomer(firebaseUid), 'alreadyDeleted');
  assert.equal(revenueCat.deleteCalls, 1);
  const store = new FirestoreFounderCampaignStore(firestore);
  assert.equal(
    (await store.reserve(campaignId, firebaseUid, RESERVED_AT)).status,
    'notAvailable',
  );
  assert.equal((await campaignRef.get()).data()?.reservedCount, 1);
}

async function testProcessingDeletionWaitsOutAnAcquiredLease(firestore) {
  const campaignId = 'deletion-processing';
  const firebaseUid = 'deletion-processing-parent';
  const expiresAt = Timestamp.fromDate(new Date('2027-07-16T00:00:00.000Z'));
  const { campaignRef, claimRef, outboxRef } = await seedOutboxLedger(
    firestore,
    campaignId,
    firebaseUid,
    expiresAt,
  );
  const leaseExpiresAt = Timestamp.fromMillis(
    RESERVED_AT.toMillis() + 2 * 60 * 1000,
  );
  await Promise.all([
    outboxRef.update({
      attemptCount: 1,
      leaseExpiresAt,
      processAfter: leaseExpiresAt,
      status: 'processing',
    }),
    claimRef.update({ attemptCount: 1, status: 'granting' }),
  ]);
  let now = RESERVED_AT;
  const revenueCat = new DeletionRevenueCatClient();
  const coordinator = new RevenueCatDeletionCoordinator(
    revenueCat,
    firestore,
    () => now,
  );

  assert.equal(await coordinator.deleteCustomer(firebaseUid), 'retryableError');
  assert.equal(revenueCat.deleteCalls, 0);
  assert.equal((await claimRef.get()).data()?.status, 'manualReview');
  assert.equal((await outboxRef.get()).data()?.status, 'manualReview');
  assert.ok(
    (await outboxRef.get()).data()?.deletionSafeAfter instanceof Timestamp,
  );

  // A second callable delivery must retain the original processing lease
  // boundary even though the outbox is now manualReview and its worker lease
  // fields have been cleared.
  assert.equal(await coordinator.deleteCustomer(firebaseUid), 'retryableError');
  assert.equal(revenueCat.deleteCalls, 0);

  now = Timestamp.fromMillis(leaseExpiresAt.toMillis() + 1);
  assert.equal(await coordinator.deleteCustomer(firebaseUid), 'deleted');
  assert.equal(revenueCat.deleteCalls, 1);
  assert.equal((await claimRef.get()).exists, false);
  assert.equal((await outboxRef.get()).exists, false);
  assert.equal((await campaignRef.get()).data()?.reservedCount, 1);
  assert.equal(revenueCat.grantCalls, 0);
}

async function testDeletionFailureKeepsGrantBlockedForRetry(firestore) {
  const campaignId = 'deletion-transient';
  const firebaseUid = 'deletion-transient-parent';
  const expiresAt = Timestamp.fromDate(new Date('2027-07-16T00:00:00.000Z'));
  const { campaignRef, claimRef, outboxRef } = await seedOutboxLedger(
    firestore,
    campaignId,
    firebaseUid,
    expiresAt,
  );
  const revenueCat = new DeletionRevenueCatClient(1);
  const coordinator = new RevenueCatDeletionCoordinator(
    revenueCat,
    firestore,
    () => RESERVED_AT,
  );

  await assert.rejects(
    () => coordinator.deleteCustomer(firebaseUid),
    error =>
      error instanceof RevenueCatApiError &&
      error.code === 'http_503_service_unavailable',
  );
  assert.equal((await claimRef.get()).data()?.status, 'manualReview');
  assert.equal((await outboxRef.get()).data()?.status, 'manualReview');
  assert.equal((await campaignRef.get()).data()?.reservedCount, 1);

  // A redelivered outbox event cannot grant while external deletion is being
  // retried, even though the first RevenueCat DELETE failed.
  await new GrantOutboxProcessor(
    revenueCat,
    firestore,
    () => RESERVED_AT,
  ).process(outboxRef.id);
  assert.equal(revenueCat.grantCalls, 0);

  assert.equal(await coordinator.deleteCustomer(firebaseUid), 'deleted');
  assert.equal(revenueCat.deleteCalls, 2);
  assert.equal((await claimRef.get()).exists, false);
  assert.equal((await outboxRef.get()).exists, false);
  assert.equal((await campaignRef.get()).data()?.reservedCount, 1);
}

async function testCompletedGrantDeletionRetainsCampaignCounters(firestore) {
  const campaignId = 'deletion-completed-grant';
  const firebaseUid = 'deletion-completed-parent';
  const expiresAt = Timestamp.fromDate(new Date('2027-07-16T00:00:00.000Z'));
  const { campaignRef, claimRef, outboxRef } = await seedOutboxLedger(
    firestore,
    campaignId,
    firebaseUid,
    expiresAt,
  );
  await Promise.all([
    campaignRef.update({ grantedCount: 1 }),
    claimRef.update({ grantedAt: RESERVED_AT, status: 'granted' }),
    outboxRef.update({ completedAt: RESERVED_AT, status: 'done' }),
  ]);
  const revenueCat = new DeletionRevenueCatClient();
  revenueCat.activeEntitlements = [
    {
      entitlementId: 'entlEmulatorPremium',
      expiresAt: expiresAt.toMillis(),
    },
  ];

  assert.equal(
    await new RevenueCatDeletionCoordinator(
      revenueCat,
      firestore,
      () => RESERVED_AT,
    ).deleteCustomer(firebaseUid),
    'deleted',
  );

  const campaign = (await campaignRef.get()).data();
  assert.equal(campaign?.reservedCount, 1);
  assert.equal(campaign?.grantedCount, 1);
  assert.equal((await claimRef.get()).exists, false);
  assert.equal((await outboxRef.get()).exists, false);
  assert.deepEqual(revenueCat.activeEntitlements, []);
}

async function testOrphanClaimDeletionScrubsRawUid(firestore) {
  const campaignId = 'deletion-orphan-claim';
  const firebaseUid = 'deletion-orphan-parent';
  const expiresAt = Timestamp.fromDate(new Date('2027-07-16T00:00:00.000Z'));
  const { campaignRef, claimRef, outboxRef } = await seedOutboxLedger(
    firestore,
    campaignId,
    firebaseUid,
    expiresAt,
  );
  await outboxRef.delete();
  const revenueCat = new DeletionRevenueCatClient();

  assert.equal(
    await new RevenueCatDeletionCoordinator(
      revenueCat,
      firestore,
      () => RESERVED_AT,
    ).deleteCustomer(firebaseUid),
    'deleted',
  );

  const tombstone = await customerDeletionTombstoneRef(
    firestore,
    firebaseUid,
  ).get();
  assert.equal((await claimRef.get()).exists, false);
  assert.equal((await campaignRef.get()).data()?.reservedCount, 1);
  assert.equal(tombstone.data()?.status, 'completed');
  assert.equal(tombstone.id.includes(firebaseUid), false);
  assert.equal(JSON.stringify(tombstone.data()).includes(firebaseUid), false);
}

async function testConcurrentDeletionCallsUseOneExternalDelete(firestore) {
  const campaignId = 'deletion-concurrent';
  const firebaseUid = 'deletion-concurrent-parent';
  const expiresAt = Timestamp.fromDate(new Date('2027-07-16T00:00:00.000Z'));
  const { claimRef, outboxRef } = await seedOutboxLedger(
    firestore,
    campaignId,
    firebaseUid,
    expiresAt,
  );
  const revenueCat = new BlockingDeletionRevenueCatClient();
  const coordinator = new RevenueCatDeletionCoordinator(
    revenueCat,
    firestore,
    () => RESERVED_AT,
  );

  const firstDeletion = coordinator.deleteCustomer(firebaseUid);
  await revenueCat.waitUntilDeleteStarts();

  assert.equal(await coordinator.deleteCustomer(firebaseUid), 'retryableError');
  assert.equal(revenueCat.deleteCalls, 1);

  revenueCat.releaseDelete();
  assert.equal(await firstDeletion, 'deleted');
  assert.equal(revenueCat.deleteCalls, 1);
  assert.equal((await claimRef.get()).exists, false);
  assert.equal((await outboxRef.get()).exists, false);
  assert.equal(await coordinator.deleteCustomer(firebaseUid), 'alreadyDeleted');
  assert.equal(revenueCat.deleteCalls, 1);
}

async function seedOutboxLedger(firestore, campaignId, firebaseUid, expiresAt) {
  const campaignRef = firestore
    .collection('monetizationCampaigns')
    .doc(campaignId);
  const claimRef = campaignRef.collection('claims').doc(firebaseUid);
  const outboxRef = firestore
    .collection('monetizationGrantOutbox')
    .doc(grantOutboxId(campaignId, firebaseUid));
  await Promise.all([
    campaignRef.set({
      capacity: 1,
      createdAt: RESERVED_AT,
      durationDays: 365,
      entitlementLookupKey: 'premium',
      grantedCount: 0,
      kind: 'revenuecat_granted_entitlement',
      reservedCount: 1,
      revenueCatEntitlementId: 'entlEmulatorPremium',
      status: 'ready',
      updatedAt: RESERVED_AT,
    }),
    claimRef.set({
      attemptCount: 0,
      expiresAt,
      reservedAt: RESERVED_AT,
      revenueCatEntitlementId: 'entlEmulatorPremium',
      revenueCatCustomerId: firebaseUid,
      status: 'reserved',
      updatedAt: RESERVED_AT,
    }),
    outboxRef.set({
      attemptCount: 0,
      campaignId,
      createdAt: RESERVED_AT,
      firebaseUid,
      processAfter: RESERVED_AT,
      status: 'pending',
      updatedAt: RESERVED_AT,
    }),
  ]);
  return { campaignRef, claimRef, outboxRef };
}

class FakeRevenueCatClient {
  activeEntitlements = [];
  grantCalls = 0;

  async deleteCustomer() {
    return 'deleted';
  }

  async getActiveEntitlements() {
    return { activeEntitlements: this.activeEntitlements, exists: true };
  }

  async grantEntitlement(_customerId, entitlementId, expiresAtMillis) {
    this.grantCalls += 1;
    this.activeEntitlements = [{ entitlementId, expiresAt: expiresAtMillis }];
  }
}

class RetryableRevenueCatClient extends FakeRevenueCatClient {
  async getActiveEntitlements() {
    throw new RevenueCatApiError({
      backoffMs: 90_000,
      code: 'http_429_rate_limit_error',
      retryable: true,
      statusCode: 429,
    });
  }
}

class GrantFailureRevenueCatClient extends FakeRevenueCatClient {
  constructor(error) {
    super();
    this.error = error;
  }

  async grantEntitlement() {
    this.grantCalls += 1;
    throw this.error;
  }
}

class DeletionRevenueCatClient extends FakeRevenueCatClient {
  constructor(failedDeleteCount = 0) {
    super();
    this.deleteCalls = 0;
    this.failedDeleteCount = failedDeleteCount;
  }

  async deleteCustomer() {
    this.deleteCalls += 1;
    if (this.deleteCalls <= this.failedDeleteCount) {
      throw new RevenueCatApiError({
        code: 'http_503_service_unavailable',
        retryable: true,
        statusCode: 503,
      });
    }
    this.activeEntitlements = [];
    return 'deleted';
  }
}

class BlockingDeletionRevenueCatClient extends DeletionRevenueCatClient {
  constructor() {
    super();
    this.deleteStarted = new Promise(resolve => {
      this.resolveDeleteStarted = resolve;
    });
    this.deleteReleased = new Promise(resolve => {
      this.resolveDeleteReleased = resolve;
    });
  }

  async deleteCustomer() {
    this.deleteCalls += 1;
    this.resolveDeleteStarted();
    await this.deleteReleased;
    this.activeEntitlements = [];
    return 'deleted';
  }

  waitUntilDeleteStarts() {
    return this.deleteStarted;
  }

  releaseDelete() {
    this.resolveDeleteReleased();
  }
}

class ConflictRevenueCatClient extends FakeRevenueCatClient {
  constructor(expiresAtMillis) {
    super();
    this.expiresAtMillis = expiresAtMillis;
    this.lookupCount = 0;
  }

  async getActiveEntitlements() {
    this.lookupCount += 1;
    return {
      activeEntitlements:
        this.lookupCount > 1
          ? [
              {
                entitlementId: 'entlEmulatorPremium',
                expiresAt: this.expiresAtMillis,
              },
            ]
          : [],
      exists: true,
    };
  }

  async grantEntitlement() {
    throw new RevenueCatApiError({
      code: 'http_409_conflict_error',
      retryable: false,
      statusCode: 409,
    });
  }
}

await testOutboxExactlyOnce(firestore);
await testOutboxRetryPreservesReservation(firestore);
await testOutboxRetryMatrix(firestore);
await testManualReviewMismatches(firestore);
await testOutboxConflictReconciliation(firestore);
await testPendingDeletionPermanentlyBlocksGrant(firestore);
await testProcessingDeletionWaitsOutAnAcquiredLease(firestore);
await testDeletionFailureKeepsGrantBlockedForRetry(firestore);
await testCompletedGrantDeletionRetainsCampaignCounters(firestore);
await testOrphanClaimDeletionScrubsRawUid(firestore);
await testConcurrentDeletionCallsUseOneExternalDelete(firestore);
console.log('Founder outbox emulator tests passed.');
