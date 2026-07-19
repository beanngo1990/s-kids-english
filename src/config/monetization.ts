import { Platform } from 'react-native';

import { revenueCatTestStoreApiKey } from './revenueCatTestStoreKey';

export const PREMIUM_ENTITLEMENT_ID = 'premium';
export const DEFAULT_PREMIUM_OFFERING_ID = 'default';

export const monetizationConfig = {
  // RevenueCat public SDK keys are safe to ship in the app, but must be supplied
  // from the SKidsEnglish RevenueCat project before store testing.
  revenueCatAppleApiKey: '',
  revenueCatGoogleApiKey: '',
  privacyPolicyUrl: '',
  termsOfUseUrl: '',
} as const;

export const storeProductIds = {
  android: {
    annual: 'premium:annual',
    lifetime: 'premium_lifetime',
    monthly: 'premium:monthly',
  },
  ios: {
    annual: 'com.seduforge.skidsenglish.premium.annual',
    lifetime: 'com.seduforge.skidsenglish.premium.lifetime',
    monthly: 'com.seduforge.skidsenglish.premium.monthly',
  },
} as const;

export const remoteMonetizationConfigKeys = {
  founderPremiumCutoffAt: 'founder_premium_cutoff_at',
  founderPremiumDurationDays: 'founder_premium_duration_days',
  premiumPurchaseEnabled: 'premium_purchase_enabled',
} as const;

export const DEFAULT_FOUNDER_PREMIUM_DURATION_DAYS = 365;

export type RevenueCatPlatform = 'android' | 'ios';

export function normalizeRevenueCatApiKey(
  key: string,
  platform: RevenueCatPlatform,
  allowTestStore: boolean,
): string | null {
  const normalizedKey = key.trim();
  if (normalizedKey.length === 0) {
    return null;
  }

  const platformPrefix = platform === 'ios' ? 'appl_' : 'goog_';
  if (
    !normalizedKey.startsWith(platformPrefix) &&
    !(allowTestStore && normalizedKey.startsWith('test_'))
  ) {
    return null;
  }

  return normalizedKey;
}

export function selectRevenueCatApiKey(
  platform: RevenueCatPlatform,
  productionPlatformKey: string,
  debugTestStoreKey: string,
  allowTestStore: boolean,
): string | null {
  const normalizedDebugKey = normalizeRevenueCatApiKey(
    debugTestStoreKey,
    platform,
    allowTestStore,
  );

  if (normalizedDebugKey?.startsWith('test_')) {
    return normalizedDebugKey;
  }

  return normalizeRevenueCatApiKey(
    productionPlatformKey,
    platform,
    allowTestStore,
  );
}

export function getRevenueCatPlatformApiKey(): string | null {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return null;
  }

  const platform = Platform.OS;
  const key =
    platform === 'ios'
      ? monetizationConfig.revenueCatAppleApiKey
      : monetizationConfig.revenueCatGoogleApiKey;

  // Metro resolves the ignored local Test Store module only for debug
  // bundles. Release bundles always receive the tracked empty fallback.
  return selectRevenueCatApiKey(
    platform,
    key,
    revenueCatTestStoreApiKey,
    __DEV__,
  );
}
