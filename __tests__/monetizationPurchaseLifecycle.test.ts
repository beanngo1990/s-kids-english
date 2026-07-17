import type { CustomerInfo, PurchasesPackage } from 'react-native-purchases';

import type { ParentAuthSnapshot } from '../src/engine/ParentAuthManager';

let mockAuthListener:
  | ((snapshot: ParentAuthSnapshot) => void)
  | undefined;
let mockPremiumPurchaseEnabled = true;
let mockRevenueCatApiKey: string | null = 'test-public-sdk-key';

jest.mock('../src/config/monetization', () => ({
  DEFAULT_PREMIUM_OFFERING_ID: 'default',
  PREMIUM_ENTITLEMENT_ID: 'premium',
  getRevenueCatPlatformApiKey: () => mockRevenueCatApiKey,
  storeProductIds: {
    android: {
      annual: 'premium:annual',
      lifetime: 'premium_lifetime',
      monthly: 'premium:monthly',
    },
    ios: {
      annual: 'premium.annual',
      lifetime: 'premium.lifetime',
      monthly: 'premium.monthly',
    },
  },
}));

jest.mock('../src/engine/ParentAuthManager', () => ({
  initialParentAuthSnapshot: { isReady: false, user: null },
  subscribeParentAuth: jest.fn(
    (listener: (snapshot: ParentAuthSnapshot) => void) => {
      mockAuthListener = listener;
      return jest.fn();
    },
  ),
}));

jest.mock('../src/engine/ParentAccessSession', () => ({
  setParentPurchaseFlowActive: jest.fn(),
}));

jest.mock('../src/services/RemoteMonetizationConfig', () => ({
  getRemoteMonetizationConfigSnapshot: jest.fn(() => ({
    premiumPurchaseEnabled: mockPremiumPurchaseEnabled,
  })),
}));

type MonetizationManagerModule =
  typeof import('../src/engine/MonetizationManager');
type ContentAccessPolicyModule =
  typeof import('../src/engine/ContentAccessPolicy');
type ParentAccessSessionModule =
  typeof import('../src/engine/ParentAccessSession');
type PurchasesModule = typeof import('react-native-purchases');

const signedIn = (uid: string): ParentAuthSnapshot => ({
  isReady: true,
  user: { providerIds: ['google.com'], uid },
});

describe('Monetization purchase and identity lifecycle', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockAuthListener = undefined;
    mockPremiumPurchaseEnabled = true;
    mockRevenueCatApiKey = 'test-public-sdk-key';
  });

  describe('purchase result matrix', () => {
    test('returns purchased and opens access only for an active entitlement', async () => {
      const harness = await startSignedInHarness();
      harness.purchases.purchasePackage.mockResolvedValue({
        customerInfo: makeCustomerInfo('premium'),
      } as never);

      await expect(
        harness.manager.purchaseMonetizationPackage('monthly-package'),
      ).resolves.toBe('purchased');

      expect(harness.manager.getMonetizationSnapshot()).toMatchObject({
        activeProductType: 'monthly',
        pendingAction: null,
        status: 'premium',
        userId: 'parent-a',
      });
      expect(
        harness.access.canAccessLesson(
          'bedtime',
          harness.manager.getMonetizationSnapshot(),
        ),
      ).toBe(true);
      expect(harness.setParentPurchaseFlowActive.mock.calls).toEqual([
        [true],
        [false],
      ]);
      harness.stop();
    });

    test('does not unlock when the store resolves without active Premium', async () => {
      const harness = await startSignedInHarness();
      harness.purchases.purchasePackage.mockResolvedValue({
        customerInfo: makeCustomerInfo('free'),
      } as never);

      await expect(
        harness.manager.purchaseMonetizationPackage('monthly-package'),
      ).resolves.toBe('failed');

      expect(harness.manager.getMonetizationSnapshot().status).toBe('free');
      expect(
        harness.access.canAccessLesson(
          'bedtime',
          harness.manager.getMonetizationSnapshot(),
        ),
      ).toBe(false);
      harness.stop();
    });

    test.each([
      [
        'cancelled',
        { code: 'PURCHASE_CANCELLED_ERROR' },
        'cancelled',
        undefined,
      ],
      ['pending', { code: 'PAYMENT_PENDING_ERROR' }, 'pending', undefined],
      ['network failure', { code: 'NETWORK_ERROR' }, 'failed', 'network'],
      [
        'store failure',
        { code: 'STORE_PROBLEM_ERROR' },
        'failed',
        'store',
      ],
    ] as const)(
      'keeps Premium locked after a %s purchase',
      async (_label, error, expectedResult, expectedErrorCode) => {
        const harness = await startSignedInHarness();
        harness.purchases.purchasePackage.mockRejectedValue(error);

        await expect(
          harness.manager.purchaseMonetizationPackage('monthly-package'),
        ).resolves.toBe(expectedResult);

        expect(harness.manager.getMonetizationSnapshot()).toMatchObject({
          errorCode: expectedErrorCode,
          pendingAction: null,
          status: 'free',
        });
        expect(
          harness.access.canAccessLesson(
            'bedtime',
            harness.manager.getMonetizationSnapshot(),
          ),
        ).toBe(false);
        expect(harness.setParentPurchaseFlowActive.mock.calls).toEqual([
          [true],
          [false],
        ]);
        harness.stop();
      },
    );

    test('does not start a store purchase when the kill switch is off', async () => {
      mockPremiumPurchaseEnabled = false;
      const harness = await startSignedInHarness();

      await expect(
        harness.manager.purchaseMonetizationPackage('monthly-package'),
      ).resolves.toBe('unavailable');

      expect(harness.purchases.purchasePackage).not.toHaveBeenCalled();
      harness.stop();
    });
  });

  describe('restore result matrix', () => {
    test('requires a signed-in parent before invoking the store', async () => {
      const harness = loadHarness();

      await expect(
        harness.manager.restoreMonetizationPurchases(),
      ).resolves.toBe('signInRequired');
      expect(harness.purchases.restorePurchases).not.toHaveBeenCalled();
    });

    test('is unavailable when RevenueCat has not been configured', async () => {
      mockRevenueCatApiKey = null;
      const harness = await startSignedInHarness();

      await expect(
        harness.manager.restoreMonetizationPurchases(),
      ).resolves.toBe('unavailable');
      expect(harness.purchases.restorePurchases).not.toHaveBeenCalled();
      harness.stop();
    });

    test('returns restored only when restored CustomerInfo has Premium', async () => {
      const harness = await startSignedInHarness();
      harness.purchases.restorePurchases.mockResolvedValue(
        makeCustomerInfo('premium'),
      );

      await expect(
        harness.manager.restoreMonetizationPurchases(),
      ).resolves.toBe('restored');
      expect(harness.manager.getMonetizationSnapshot().status).toBe('premium');
      harness.stop();
    });

    test('returns withoutPremium and keeps access locked for an empty restore', async () => {
      const harness = await startSignedInHarness();
      harness.purchases.restorePurchases.mockResolvedValue(
        makeCustomerInfo('free'),
      );

      await expect(
        harness.manager.restoreMonetizationPurchases(),
      ).resolves.toBe('withoutPremium');
      expect(harness.manager.getMonetizationSnapshot().status).toBe('free');
      harness.stop();
    });

    test('returns failed, clears pending state and classifies restore errors', async () => {
      const harness = await startSignedInHarness();
      harness.purchases.restorePurchases.mockRejectedValue({
        code: 'NETWORK_ERROR',
      });

      await expect(
        harness.manager.restoreMonetizationPurchases(),
      ).resolves.toBe('failed');
      expect(harness.manager.getMonetizationSnapshot()).toMatchObject({
        errorCode: 'network',
        pendingAction: null,
        status: 'free',
      });
      harness.stop();
    });

    test('restore remains available when new purchases are disabled', async () => {
      mockPremiumPurchaseEnabled = false;
      const harness = await startSignedInHarness();
      harness.purchases.restorePurchases.mockResolvedValue(
        makeCustomerInfo('premium'),
      );

      await expect(
        harness.manager.restoreMonetizationPurchases(),
      ).resolves.toBe('restored');
      expect(harness.purchases.restorePurchases).toHaveBeenCalledTimes(1);
      harness.stop();
    });
  });

  describe('account identity isolation', () => {
    test('locks access during account switch and applies only the new account result', async () => {
      const harness = await startSignedInHarness({
        initialCustomerInfo: makeCustomerInfo('premium'),
      });
      let resolveLogin:
        | ((result: { created: boolean; customerInfo: CustomerInfo }) => void)
        | undefined;
      harness.purchases.logIn.mockReturnValue(
        new Promise(resolve => {
          resolveLogin = resolve;
        }),
      );
      harness.purchases.getCustomerInfo.mockResolvedValue(
        makeCustomerInfo('free'),
      );

      mockAuthListener?.(signedIn('parent-b'));

      expect(harness.manager.getMonetizationSnapshot()).toMatchObject({
        pendingAction: 'identity',
        status: 'initializing',
        userId: 'parent-b',
      });
      expect(
        harness.access.canAccessLesson(
          'bedtime',
          harness.manager.getMonetizationSnapshot(),
        ),
      ).toBe(false);

      resolveLogin?.({
        created: false,
        customerInfo: makeCustomerInfo('free'),
      });
      await flushPromises();

      expect(harness.manager.getMonetizationSnapshot()).toMatchObject({
        activeProductType: undefined,
        status: 'free',
        userId: 'parent-b',
        willRenew: false,
      });
      expect(harness.purchases.logIn).toHaveBeenCalledWith('parent-b');
      harness.stop();
    });

    test('never exposes the previous entitlement after logout', async () => {
      const harness = await startSignedInHarness({
        initialCustomerInfo: makeCustomerInfo('premium'),
      });
      let resolveLogout: ((customerInfo: CustomerInfo) => void) | undefined;
      harness.purchases.logOut.mockReturnValue(
        new Promise(resolve => {
          resolveLogout = resolve;
        }),
      );
      harness.purchases.getCustomerInfo.mockResolvedValue(
        makeCustomerInfo('free'),
      );

      mockAuthListener?.({ isReady: true, user: null });

      expect(harness.manager.getMonetizationSnapshot().status).toBe(
        'initializing',
      );
      expect(
        harness.access.canAccessLesson(
          'bedtime',
          harness.manager.getMonetizationSnapshot(),
        ),
      ).toBe(false);

      resolveLogout?.(makeCustomerInfo('premium'));
      await flushPromises();

      expect(harness.manager.getMonetizationSnapshot()).toMatchObject({
        activeProductType: undefined,
        isSignedIn: false,
        status: 'signedOut',
        userId: undefined,
        willRenew: false,
      });
      expect(
        harness.access.canAccessLesson(
          'bedtime',
          harness.manager.getMonetizationSnapshot(),
        ),
      ).toBe(false);
      harness.stop();
    });
  });
});

function loadHarness() {
  const purchases = (require('react-native-purchases') as PurchasesModule)
    .default as jest.Mocked<PurchasesModule['default']>;
  const manager = require('../src/engine/MonetizationManager') as MonetizationManagerModule;
  const access = require('../src/engine/ContentAccessPolicy') as ContentAccessPolicyModule;
  const { setParentPurchaseFlowActive } = require('../src/engine/ParentAccessSession') as ParentAccessSessionModule;

  return {
    access,
    manager,
    purchases,
    setParentPurchaseFlowActive:
      setParentPurchaseFlowActive as jest.MockedFunction<
        typeof setParentPurchaseFlowActive
      >,
  };
}

async function startSignedInHarness(options?: {
  initialCustomerInfo?: CustomerInfo;
}) {
  const harness = loadHarness();
  const nativePackage = makeNativePackage();
  harness.purchases.getCustomerInfo.mockResolvedValue(
    options?.initialCustomerInfo ?? makeCustomerInfo('free'),
  );
  harness.purchases.getOfferings.mockResolvedValue({
    all: {},
    current: {
      availablePackages: [nativePackage],
      identifier: 'default',
    },
  } as never);
  harness.purchases.invalidateCustomerInfoCache.mockResolvedValue(undefined);
  harness.purchases.logIn.mockResolvedValue({
    customerInfo: makeCustomerInfo('free'),
    created: false,
  } as never);
  harness.purchases.logOut.mockResolvedValue(makeCustomerInfo('free'));

  const stop = harness.manager.startMonetization();
  if (!mockAuthListener) {
    throw new Error('Monetization did not subscribe to parent auth.');
  }

  mockAuthListener(signedIn('parent-a'));
  await flushPromises();

  return { ...harness, nativePackage, stop };
}

function makeNativePackage(): PurchasesPackage {
  return {
    identifier: 'monthly-package',
    packageType: 'MONTHLY',
    product: {
      currencyCode: 'VND',
      description: 'Premium monthly',
      price: 59_000,
      pricePerMonthString: '59.000 ₫',
      priceString: '59.000 ₫',
      subscriptionPeriod: 'P1M',
      title: 'Premium monthly',
    },
  } as unknown as PurchasesPackage;
}

function makeCustomerInfo(status: 'free' | 'premium'): CustomerInfo {
  const entitlement = {
    expirationDate: '2027-07-16T00:00:00.000Z',
    isActive: true,
    productIdentifier: 'premium.monthly',
    productPlanIdentifier: null,
    store: 'APP_STORE',
    verification: 'VERIFIED',
    willRenew: true,
  };

  return {
    entitlements: {
      active: status === 'premium' ? { premium: entitlement } : {},
      verification: 'VERIFIED',
    },
    managementURL: 'https://store.example/manage',
  } as unknown as CustomerInfo;
}

function flushPromises() {
  return new Promise<void>(resolve => {
    setImmediate(resolve);
  });
}
