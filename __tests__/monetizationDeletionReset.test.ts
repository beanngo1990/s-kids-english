import type { CustomerInfo } from 'react-native-purchases';

jest.mock('../src/config/monetization', () => ({
  DEFAULT_PREMIUM_OFFERING_ID: 'default',
  PREMIUM_ENTITLEMENT_ID: 'premium',
  getRevenueCatPlatformApiKey: () => 'test-public-sdk-key',
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
  subscribeParentAuth: jest.fn(),
}));

jest.mock('../src/engine/ParentAccessSession', () => ({
  setParentPurchaseFlowActive: jest.fn(),
}));

jest.mock('../src/services/RemoteMonetizationConfig', () => ({
  getRemoteMonetizationConfigSnapshot: jest.fn(() => ({
    premiumPurchaseEnabled: true,
  })),
}));

import Purchases from 'react-native-purchases';

import {
  getMonetizationSnapshot,
  resetMonetizationAfterAccountDeletion,
  startMonetization,
} from '../src/engine/MonetizationManager';
import {
  subscribeParentAuth,
  type ParentAuthSnapshot,
} from '../src/engine/ParentAuthManager';

const mockSubscribeParentAuth = subscribeParentAuth as jest.MockedFunction<
  typeof subscribeParentAuth
>;
const mockGetCustomerInfo = Purchases.getCustomerInfo as jest.MockedFunction<
  typeof Purchases.getCustomerInfo
>;
const mockGetOfferings = Purchases.getOfferings as jest.MockedFunction<
  typeof Purchases.getOfferings
>;
const mockInvalidateCustomerInfoCache =
  Purchases.invalidateCustomerInfoCache as jest.MockedFunction<
    typeof Purchases.invalidateCustomerInfoCache
  >;
const mockLogOut = Purchases.logOut as jest.MockedFunction<
  typeof Purchases.logOut
>;

test('account deletion shares one RevenueCat logout with the auth observer', async () => {
  let authListener: ((snapshot: ParentAuthSnapshot) => void) | undefined;
  const customerInfo = {
    entitlements: { active: {}, verification: 'VERIFIED' },
    managementURL: null,
  } as unknown as CustomerInfo;
  let resolveLogout: ((value: CustomerInfo) => void) | undefined;

  mockSubscribeParentAuth.mockImplementation(listener => {
    authListener = listener;
    return () => undefined;
  });
  mockGetCustomerInfo.mockResolvedValue(customerInfo);
  mockGetOfferings.mockResolvedValue({ all: {}, current: null } as never);
  mockInvalidateCustomerInfoCache.mockResolvedValue(undefined);
  mockLogOut.mockReturnValue(
    new Promise(resolve => {
      resolveLogout = resolve;
    }),
  );

  const stopMonetization = startMonetization();
  authListener?.({
    isReady: true,
    user: { providerIds: ['google.com'], uid: 'parent-uid' },
  });
  await flushPromises();

  authListener?.({ isReady: true, user: null });
  const resetPromise = resetMonetizationAfterAccountDeletion();
  await Promise.resolve();

  expect(mockLogOut).toHaveBeenCalledTimes(1);
  resolveLogout?.(customerInfo);
  await resetPromise;
  await flushPromises();

  expect(mockInvalidateCustomerInfoCache).toHaveBeenCalledTimes(1);
  expect(mockLogOut).toHaveBeenCalledTimes(1);
  expect(getMonetizationSnapshot()).toEqual({
    isAuthReady: true,
    isConfigured: true,
    isSignedIn: false,
    packages: [],
    pendingAction: null,
    status: 'signedOut',
    willRenew: false,
  });

  stopMonetization();
});

function flushPromises() {
  return new Promise<void>(resolve => {
    setImmediate(resolve);
  });
}
