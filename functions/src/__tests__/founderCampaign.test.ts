import assert from 'node:assert/strict';
import test from 'node:test';

import { Timestamp } from 'firebase-admin/firestore';

import {
  founderClaimExpiration,
  getCampaignAvailability,
  getExistingClaimResponse,
  type FounderCampaign,
  type FounderCampaignResponse,
  type FounderClaim,
  type FounderRemoteGate,
} from '../contracts.js';
import {
  FounderCampaignService,
  type FounderCampaignReadState,
  type FounderCampaignStore,
} from '../founderCampaign.js';
import type {
  RevenueCatClient,
  RevenueCatCustomerEntitlements,
} from '../revenueCatClient.js';

const fixedNow = Timestamp.fromDate(new Date('2026-07-16T00:00:00.000Z'));
const baseCampaign: FounderCampaign = {
  capacity: 500,
  durationDays: 365,
  entitlementLookupKey: 'premium',
  grantedCount: 0,
  reservedCount: 0,
  revenueCatEntitlementId: 'entlPremium123',
  status: 'ready',
};
const enabledGate: FounderRemoteGate = {
  campaignId: 'founder-premium-2026-v1',
  enabled: true,
};

test('status is available and claim creates one idempotent reservation', async () => {
  const store = new AtomicFakeStore(baseCampaign);
  const service = makeService(store);

  assert.deepEqual(await service.getStatus('parent-1'), {
    status: 'available',
  });

  const results = await Promise.all(
    Array.from({ length: 20 }, () => service.claim('parent-1')),
  );
  assert.equal(
    results.every(result => result.status === 'processing'),
    true,
  );
  assert.equal(store.reservedCount, 1);
});

test('an existing grant stays visible after the Remote Config flag is off', async () => {
  const store = new AtomicFakeStore(baseCampaign);
  await store.reserve(enabledGate.campaignId, 'parent-1', fixedNow);
  store.setClaimStatus('parent-1', 'granted');
  const service = makeService(store, {
    campaignId: enabledGate.campaignId,
    enabled: false,
  });

  assert.equal((await service.getStatus('parent-1')).status, 'granted');
  assert.equal((await service.claim('parent-1')).status, 'alreadyClaimed');
  assert.equal((await service.getStatus('parent-2')).status, 'notAvailable');
});

test('active Premium and a missing RevenueCat customer never reserve quota', async () => {
  const activeStore = new AtomicFakeStore(baseCampaign);
  const activeService = makeService(activeStore, enabledGate, {
    activeEntitlements: [{ entitlementId: 'entlPremium123', expiresAt: null }],
    exists: true,
  });
  assert.equal(
    (await activeService.claim('premium-parent')).status,
    'alreadyPremium',
  );
  assert.equal(activeStore.reservedCount, 0);

  const missingStore = new AtomicFakeStore(baseCampaign);
  const missingService = makeService(missingStore, enabledGate, {
    activeEntitlements: [],
    exists: false,
  });
  assert.equal(
    (await missingService.claim('missing-parent')).status,
    'retryableError',
  );
  assert.equal(missingStore.reservedCount, 0);
});

test('550 concurrent unique claims reserve exactly the 500-account capacity', async () => {
  const store = new AtomicFakeStore(baseCampaign);
  const service = makeService(store);
  const results = await Promise.all(
    Array.from({ length: 550 }, (_, index) => service.claim(`parent-${index}`)),
  );

  assert.equal(
    results.filter(result => result.status === 'processing').length,
    500,
  );
  assert.equal(
    results.filter(result => result.status === 'soldOut').length,
    50,
  );
  assert.equal(store.reservedCount, 500);
  assert.equal(store.claimCount, 500);
});

test('disabled, paused, expired and sold-out campaigns fail closed', async () => {
  const cases: ReadonlyArray<{
    campaign: FounderCampaign;
    gate?: FounderRemoteGate;
    name: string;
    status: 'notAvailable' | 'soldOut';
  }> = [
    {
      campaign: baseCampaign,
      gate: { ...enabledGate, enabled: false },
      name: 'Remote Config disabled',
      status: 'notAvailable',
    },
    {
      campaign: { ...baseCampaign, status: 'paused' },
      name: 'backend paused',
      status: 'notAvailable',
    },
    {
      campaign: { ...baseCampaign, status: 'closed' },
      name: 'backend closed',
      status: 'notAvailable',
    },
    {
      campaign: {
        ...baseCampaign,
        endsAt: fixedNow,
      },
      name: 'expired at the server timestamp',
      status: 'notAvailable',
    },
    {
      campaign: {
        ...baseCampaign,
        startsAt: Timestamp.fromMillis(fixedNow.toMillis() + 1),
      },
      name: 'not started',
      status: 'notAvailable',
    },
    {
      campaign: { ...baseCampaign, reservedCount: 500 },
      name: 'capacity exhausted',
      status: 'soldOut',
    },
  ];

  for (const scenario of cases) {
    const store = new AtomicFakeStore(scenario.campaign);
    const revenueCat = new FakeRevenueCat({
      activeEntitlements: [],
      exists: true,
    });
    const service = new FounderCampaignService(
      store,
      revenueCat,
      async () => scenario.gate ?? enabledGate,
      () => fixedNow,
    );

    assert.equal(
      (await service.claim(`parent-${scenario.name}`)).status,
      scenario.status,
      scenario.name,
    );
    assert.equal(store.reservedCount, scenario.campaign.reservedCount);
    assert.equal(store.claimCount, 0);
    assert.equal(revenueCat.lookupCount, 0);
  }
});

test('Remote Config read failure never checks RevenueCat or reserves quota', async () => {
  const store = new AtomicFakeStore(baseCampaign);
  const revenueCat = new FakeRevenueCat({
    activeEntitlements: [],
    exists: true,
  });
  const service = new FounderCampaignService(
    store,
    revenueCat,
    async () => {
      throw new Error('Remote Config unavailable');
    },
    () => fixedNow,
  );

  assert.deepEqual(await service.claim('parent-remote-failure'), {
    status: 'retryableError',
  });
  assert.equal(store.readCount, 0);
  assert.equal(store.reservedCount, 0);
  assert.equal(revenueCat.lookupCount, 0);
});

test('duplicate UID and active Premium checks never consume extra quota', async () => {
  const duplicateStore = new AtomicFakeStore(baseCampaign);
  const duplicateRevenueCat = new FakeRevenueCat({
    activeEntitlements: [],
    exists: true,
  });
  const duplicateService = new FounderCampaignService(
    duplicateStore,
    duplicateRevenueCat,
    async () => enabledGate,
    () => fixedNow,
  );

  assert.equal((await duplicateService.claim('same-parent')).status, 'processing');
  assert.equal((await duplicateService.claim('same-parent')).status, 'processing');
  assert.equal(duplicateStore.reservedCount, 1);
  assert.equal(duplicateStore.claimCount, 1);
  // The existing claim is resolved before another RevenueCat lookup.
  assert.equal(duplicateRevenueCat.lookupCount, 1);

  const premiumStore = new AtomicFakeStore(baseCampaign);
  const premiumRevenueCat = new FakeRevenueCat({
    activeEntitlements: [
      { entitlementId: baseCampaign.revenueCatEntitlementId, expiresAt: null },
    ],
    exists: true,
  });
  const premiumService = new FounderCampaignService(
    premiumStore,
    premiumRevenueCat,
    async () => enabledGate,
    () => fixedNow,
  );

  const premiumResults = await Promise.all(
    Array.from({ length: 25 }, () => premiumService.claim('premium-parent')),
  );
  assert.equal(
    premiumResults.every(result => result.status === 'alreadyPremium'),
    true,
  );
  assert.equal(premiumStore.reservedCount, 0);
  assert.equal(premiumStore.claimCount, 0);
});

function makeService(
  store: AtomicFakeStore,
  gate: FounderRemoteGate = enabledGate,
  customer: RevenueCatCustomerEntitlements = {
    activeEntitlements: [],
    exists: true,
  },
): FounderCampaignService {
  return new FounderCampaignService(
    store,
    new FakeRevenueCat(customer),
    async () => gate,
    () => fixedNow,
  );
}

class FakeRevenueCat implements RevenueCatClient {
  lookupCount = 0;

  constructor(private readonly customer: RevenueCatCustomerEntitlements) {}

  async deleteCustomer(): Promise<'deleted'> {
    return 'deleted';
  }

  async getActiveEntitlements(): Promise<RevenueCatCustomerEntitlements> {
    this.lookupCount += 1;
    return this.customer;
  }

  async grantEntitlement(): Promise<void> {}
}

class AtomicFakeStore implements FounderCampaignStore {
  private campaign: FounderCampaign;
  private readonly claims = new Map<string, FounderClaim>();
  private operationQueue: Promise<void> = Promise.resolve();

  constructor(campaign: FounderCampaign) {
    this.campaign = campaign;
  }

  readCount = 0;

  get claimCount(): number {
    return this.claims.size;
  }

  get reservedCount(): number {
    return this.campaign.reservedCount;
  }

  async readState(
    _campaignId: string,
    firebaseUid: string,
  ): Promise<FounderCampaignReadState> {
    this.readCount += 1;
    const claim = this.claims.get(firebaseUid) ?? null;
    return {
      campaign: this.campaign,
      campaignExists: true,
      claim,
      claimExists: Boolean(claim),
    };
  }

  reserve(
    _campaignId: string,
    firebaseUid: string,
    reservedAt: Timestamp,
  ): Promise<FounderCampaignResponse> {
    return this.exclusive(async () => {
      const existingClaim = this.claims.get(firebaseUid);
      if (existingClaim) {
        return getExistingClaimResponse(existingClaim, true);
      }

      const availability = getCampaignAvailability(this.campaign, reservedAt);
      if (availability !== 'available') {
        return { status: availability };
      }

      const claim: FounderClaim = {
        attemptCount: 0,
        expiresAt: founderClaimExpiration(
          reservedAt,
          this.campaign.durationDays,
        ),
        revenueCatEntitlementId: this.campaign.revenueCatEntitlementId,
        revenueCatCustomerId: firebaseUid,
        status: 'reserved',
      };
      this.claims.set(firebaseUid, claim);
      this.campaign = {
        ...this.campaign,
        reservedCount: this.campaign.reservedCount + 1,
      };
      return getExistingClaimResponse(claim, false);
    });
  }

  setClaimStatus(firebaseUid: string, status: FounderClaim['status']): void {
    const claim = this.claims.get(firebaseUid);
    assert.ok(claim);
    this.claims.set(firebaseUid, { ...claim, status });
  }

  private async exclusive<T>(operation: () => Promise<T>): Promise<T> {
    const previous = this.operationQueue;
    let release: () => void = () => undefined;
    this.operationQueue = new Promise<void>(resolve => {
      release = resolve;
    });
    await previous;
    try {
      return await operation();
    } finally {
      release();
    }
  }
}
