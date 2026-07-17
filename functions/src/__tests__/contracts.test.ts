import assert from 'node:assert/strict';
import test from 'node:test';

import { Timestamp } from 'firebase-admin/firestore';

import {
  calculateRetryDelayMs,
  getCampaignAvailability,
  grantOutboxId,
  parseFounderCampaign,
} from '../contracts.js';

const now = Timestamp.fromDate(new Date('2026-07-16T00:00:00.000Z'));

test('campaign parser requires the RevenueCat internal entitlement ID', () => {
  assert.equal(
    parseFounderCampaign({
      capacity: 500,
      durationDays: 365,
      entitlementLookupKey: 'premium',
      grantedCount: 0,
      kind: 'revenuecat_granted_entitlement',
      reservedCount: 0,
      status: 'ready',
    }),
    null,
  );

  assert.deepEqual(
    parseFounderCampaign({
      capacity: 500,
      durationDays: 365,
      entitlementLookupKey: 'premium',
      grantedCount: 0,
      kind: 'revenuecat_granted_entitlement',
      reservedCount: 0,
      revenueCatEntitlementId: 'entl123_founder',
      status: 'ready',
    }),
    {
      capacity: 500,
      durationDays: 365,
      endsAt: undefined,
      entitlementLookupKey: 'premium',
      grantedCount: 0,
      reservedCount: 0,
      revenueCatEntitlementId: 'entl123_founder',
      startsAt: undefined,
      status: 'ready',
    },
  );
});

test('campaign availability uses reservedCount and the server time window', () => {
  const campaign = parseFounderCampaign({
    capacity: 500,
    durationDays: 365,
    endsAt: Timestamp.fromDate(new Date('2026-07-17T00:00:00.000Z')),
    entitlementLookupKey: 'premium',
    grantedCount: 200,
    kind: 'revenuecat_granted_entitlement',
    reservedCount: 499,
    revenueCatEntitlementId: 'entl123',
    startsAt: Timestamp.fromDate(new Date('2026-07-15T00:00:00.000Z')),
    status: 'ready',
  });
  assert.ok(campaign);
  assert.equal(getCampaignAvailability(campaign, now), 'available');
  assert.equal(
    getCampaignAvailability({ ...campaign, reservedCount: 500 }, now),
    'soldOut',
  );
  assert.equal(
    getCampaignAvailability({ ...campaign, status: 'paused' }, now),
    'notAvailable',
  );
  assert.equal(
    getCampaignAvailability(
      {
        ...campaign,
        startsAt: Timestamp.fromDate(new Date('2026-07-16T00:00:01.000Z')),
      },
      now,
    ),
    'notAvailable',
  );
});

test('retry backoff is exponential, honors server delay and stays capped', () => {
  assert.equal(calculateRetryDelayMs(1), 30_000);
  assert.equal(calculateRetryDelayMs(2), 60_000);
  assert.equal(calculateRetryDelayMs(2, 180_000), 180_000);
  assert.equal(calculateRetryDelayMs(99), 6 * 60 * 60 * 1000);
  assert.equal(
    calculateRetryDelayMs(1, 48 * 60 * 60 * 1000),
    24 * 60 * 60 * 1000,
  );
});

test('outbox IDs are deterministic and never expose a raw Firebase UID', () => {
  const first = grantOutboxId('founder-premium-2026-v1', 'parent/uid@example');
  const second = grantOutboxId('founder-premium-2026-v1', 'parent/uid@example');
  assert.equal(first, second);
  assert.match(first, /^founder_[a-f0-9]{64}$/);
  assert.equal(first.includes('parent'), false);
  assert.equal(first.includes('/'), false);
});
