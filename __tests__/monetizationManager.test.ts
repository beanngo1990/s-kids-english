import type { CustomerInfo } from 'react-native-purchases';

jest.mock('../src/engine/ParentAuthManager', () => ({
  initialParentAuthSnapshot: { isReady: false, user: null },
  subscribeParentAuth: jest.fn(() => jest.fn()),
}));

jest.mock('../src/services/RemoteMonetizationConfig', () => ({
  getRemoteMonetizationConfigSnapshot: jest.fn(() => ({
    premiumPurchaseEnabled: true,
  })),
}));

import {
  classifyPurchaseError,
  mapCustomerInfoToMonetizationSnapshot,
  type MonetizationSnapshot,
  type MonetizationProductType,
} from '../src/engine/MonetizationManager';
import { canAccessLesson } from '../src/engine/ContentAccessPolicy';
import {
  getProgress,
  resetProgress,
  saveProgress,
  type LocalProgress,
} from '../src/engine/ProgressManager';
import type { ParentAuthSnapshot } from '../src/engine/ParentAuthManager';

const signedInAuthSnapshot: ParentAuthSnapshot = {
  isReady: true,
  user: {
    providerIds: ['google.com'],
    uid: 'parent-uid',
  },
};

const baseSnapshot: MonetizationSnapshot = {
  isAuthReady: true,
  isConfigured: true,
  isSignedIn: true,
  packages: [],
  pendingAction: null,
  status: 'free',
  willRenew: false,
};

describe('RevenueCat CustomerInfo mapping', () => {
  test.each<{
    entitlement: Partial<TestEntitlement>;
    expectedProductType: MonetizationProductType;
    label: string;
  }>([
    {
      entitlement: {
        productIdentifier: 'com.seduforge.skidsenglish.premium.monthly',
        productPlanIdentifier: null,
      },
      expectedProductType: 'monthly',
      label: 'iOS monthly product',
    },
    {
      entitlement: {
        productIdentifier: 'premium',
        productPlanIdentifier: 'annual',
      },
      expectedProductType: 'annual',
      label: 'Android annual base plan',
    },
    {
      entitlement: {
        expirationDate: null,
        productIdentifier: 'com.seduforge.skidsenglish.premium.lifetime',
        productPlanIdentifier: null,
        willRenew: false,
      },
      expectedProductType: 'lifetime',
      label: 'lifetime non-consumable',
    },
    {
      entitlement: {
        productIdentifier: 'founder-premium-2026-v1',
        productPlanIdentifier: null,
        store: 'PROMOTIONAL',
        willRenew: false,
      },
      expectedProductType: 'promotional',
      label: 'promotional grant',
    },
  ])(
    'maps an active $label entitlement',
    ({ entitlement, expectedProductType }) => {
      const expirationDate =
        entitlement.expirationDate ??
        (expectedProductType === 'lifetime'
          ? null
          : '2027-07-16T00:00:00.000Z');
      const customerInfo = makeCustomerInfo({
        ...entitlement,
        expirationDate,
      });

      const result = mapCustomerInfoToMonetizationSnapshot(
        baseSnapshot,
        customerInfo,
        signedInAuthSnapshot,
      );

      expect(result).toMatchObject({
        activeProductType: expectedProductType,
        errorCode: undefined,
        expirationDate: expirationDate ?? undefined,
        isAuthReady: true,
        isConfigured: true,
        isSignedIn: true,
        managementUrl: 'https://store.example/manage',
        pendingAction: null,
        status: 'premium',
        userId: 'parent-uid',
        willRenew: entitlement.willRenew ?? true,
      });
    },
  );

  test.each([
    ['entitlement verification', 'FAILED', 'VERIFIED'],
    ['entitlements container verification', 'VERIFIED', 'FAILED'],
  ])(
    'rejects Premium when %s fails',
    (_label, entitlementVerification, containerVerification) => {
      const customerInfo = makeCustomerInfo(
        { verification: entitlementVerification },
        containerVerification,
      );

      const result = mapCustomerInfoToMonetizationSnapshot(
        baseSnapshot,
        customerInfo,
        signedInAuthSnapshot,
      );

      expect(result).toMatchObject({
        activeProductType: undefined,
        errorCode: 'verificationFailed',
        expirationDate: undefined,
        status: 'unavailable',
        willRenew: false,
      });
    },
  );

  test.each(['VERIFIED', 'VERIFIED_ON_DEVICE', 'NOT_REQUESTED'])(
    'accepts an active entitlement with %s verification',
    verification => {
      const customerInfo = makeCustomerInfo({ verification }, verification);

      const result = mapCustomerInfoToMonetizationSnapshot(
        baseSnapshot,
        customerInfo,
        signedInAuthSnapshot,
      );

      expect(result.status).toBe('premium');
      expect(result.errorCode).toBeUndefined();
    },
  );

  test.each([
    ['inactive entitlement', makeCustomerInfo({ isActive: false })],
    ['missing active entitlement', makeCustomerInfo(null)],
  ])('clears stale Premium for an expired %s', (_label, customerInfo) => {
    const stalePremiumSnapshot: MonetizationSnapshot = {
      ...baseSnapshot,
      activeProductType: 'annual',
      errorCode: 'network',
      expirationDate: '2026-07-15T00:00:00.000Z',
      status: 'premium',
      willRenew: true,
    };

    const result = mapCustomerInfoToMonetizationSnapshot(
      stalePremiumSnapshot,
      customerInfo,
      signedInAuthSnapshot,
    );

    expect(result).toMatchObject({
      activeProductType: undefined,
      errorCode: undefined,
      expirationDate: undefined,
      status: 'free',
      willRenew: false,
    });
  });

  test('never exposes Premium while the parent is signed out', () => {
    const customerInfo = makeCustomerInfo();

    const result = mapCustomerInfoToMonetizationSnapshot(
      baseSnapshot,
      customerInfo,
      { isReady: true, user: null },
    );

    expect(result.status).toBe('signedOut');
    expect(result.isSignedIn).toBe(false);
    expect(result.userId).toBeUndefined();
  });

  test.each([
    ['expiration', makeCustomerInfo({ isActive: false })],
    ['refund', makeCustomerInfo(null)],
  ])(
    'a RevenueCat %s locks the next Premium boundary without deleting progress',
    async (_label, customerInfo) => {
      await resetProgress();
      const storedProgress = await saveProgress(makeLearnedProgress());
      const stalePremiumSnapshot: MonetizationSnapshot = {
        ...baseSnapshot,
        activeProductType: 'annual',
        expirationDate: '2026-07-15T00:00:00.000Z',
        status: 'premium',
        willRenew: true,
      };

      const result = mapCustomerInfoToMonetizationSnapshot(
        stalePremiumSnapshot,
        customerInfo,
        signedInAuthSnapshot,
      );

      expect(result.status).toBe('free');
      expect(canAccessLesson('bedtime', result)).toBe(false);
      expect(await getProgress()).toEqual(storedProgress);
    },
  );
});

describe('RevenueCat purchase error classification', () => {
  test.each([
    ['SDK cancellation flag', { userCancelled: true }, 'cancelled'],
    [
      'purchase-cancelled error code',
      { code: 'PURCHASE_CANCELLED_ERROR' },
      'cancelled',
    ],
    [
      'payment-pending error code',
      { code: 'PAYMENT_PENDING_ERROR' },
      'pending',
    ],
    ['another store error', { code: 'STORE_PROBLEM_ERROR' }, 'failed'],
    ['an unstructured error', new Error('store failed'), 'failed'],
  ] as const)('classifies %s as %s', (_label, error, expected) => {
    expect(classifyPurchaseError(error)).toBe(expected);
  });
});

type TestEntitlement = {
  expirationDate: string | null;
  isActive: boolean;
  productIdentifier: string;
  productPlanIdentifier: string | null;
  store: string;
  verification: string;
  willRenew: boolean;
};

function makeCustomerInfo(
  entitlementOverrides: Partial<TestEntitlement> | null = {},
  containerVerification = 'VERIFIED',
): CustomerInfo {
  const entitlement = entitlementOverrides
    ? {
        expirationDate: '2027-07-16T00:00:00.000Z',
        isActive: true,
        productIdentifier: 'com.seduforge.skidsenglish.premium.monthly',
        productPlanIdentifier: null,
        store: 'APP_STORE',
        verification: 'VERIFIED',
        willRenew: true,
        ...entitlementOverrides,
      }
    : undefined;

  return {
    entitlements: {
      active: entitlement ? { premium: entitlement } : {},
      verification: containerVerification,
    },
    managementURL: 'https://store.example/manage',
  } as unknown as CustomerInfo;
}

function makeLearnedProgress(): LocalProgress {
  return {
    activeThemeId: 'mot-ngay-cua-be',
    completedLessonIds: ['bedtime'],
    completedReviewGameIds: ['bedtime-review'],
    completedSceneIds: ['bedtime:sleep'],
    earnedAchievementRecords: [],
    earnedStickerIds: ['sleepy-star'],
    earnedStickerRecords: [
      {
        lessonId: 'bedtime',
        source: 'lesson',
        stickerId: 'sleepy-star',
      },
    ],
    learnedWordIds: ['bed'],
    totalXP: 12,
    vocabularyProgress: {
      bed: {
        correctCount: 2,
        lastReviewedAt: '2026-07-16T00:00:00.000Z',
        masteryLevel: 2,
        wordId: 'bed',
        wrongCount: 0,
      },
    },
  };
}
