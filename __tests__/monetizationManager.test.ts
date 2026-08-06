import type { CustomerInfo } from 'react-native-purchases';

let mockFounderPremiumCutoffAt = '';
let mockFounderPremiumDurationDays = 365;

jest.mock('../src/engine/ParentAuthManager', () => ({
  initialParentAuthSnapshot: { isReady: false, user: null },
  subscribeParentAuth: jest.fn(() => jest.fn()),
}));

jest.mock('../src/services/RemoteMonetizationConfig', () => ({
  getRemoteMonetizationConfigSnapshot: jest.fn(() => ({
    founderPremiumCutoffAt: mockFounderPremiumCutoffAt,
    founderPremiumDurationDays: mockFounderPremiumDurationDays,
    premiumPurchaseEnabled: true,
  })),
  subscribeRemoteMonetizationConfig: jest.fn(() => jest.fn()),
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
  founderAccessActive: false,
  isAuthReady: true,
  isConfigured: true,
  isSignedIn: true,
  packages: [],
  pendingAction: null,
  status: 'free',
  willRenew: false,
};

describe('RevenueCat CustomerInfo mapping', () => {
  beforeEach(() => {
    mockFounderPremiumCutoffAt = '';
    mockFounderPremiumDurationDays = 365;
  });

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

  test('keeps a signed-out customer locked without a store entitlement', () => {
    const customerInfo = makeCustomerInfo(null);

    const result = mapCustomerInfoToMonetizationSnapshot(
      baseSnapshot,
      customerInfo,
      { isReady: true, user: null },
    );

    expect(result.status).toBe('signedOut');
    expect(result.isSignedIn).toBe(false);
    expect(result.userId).toBeUndefined();
    expect(canAccessLesson('bedtime', result)).toBe(false);
  });

  test('exposes verified store Premium while the parent is signed out', () => {
    const customerInfo = makeCustomerInfo();

    const result = mapCustomerInfoToMonetizationSnapshot(
      baseSnapshot,
      customerInfo,
      { isReady: true, user: null },
    );

    expect(result).toMatchObject({
      activeProductType: 'monthly',
      isSignedIn: false,
      premiumSource: 'revenueCat',
      status: 'premium',
      userId: undefined,
      willRenew: true,
    });
    expect(canAccessLesson('bedtime', result)).toBe(true);
  });

  test('opens Founder Premium for a signed-in customer first seen by the cutoff', () => {
    mockFounderPremiumCutoffAt = '2026-07-10T00:00:00.000Z';
    const customerInfo = makeCustomerInfo(null, 'VERIFIED', {
      firstSeen: '2026-07-09T00:00:00.000Z',
      requestDate: '2026-07-12T00:00:00.000Z',
    });

    const result = mapCustomerInfoToMonetizationSnapshot(
      baseSnapshot,
      customerInfo,
      signedInAuthSnapshot,
      Date.parse('2026-07-12T00:00:00.000Z'),
    );

    expect(result).toMatchObject({
      activeProductType: 'founder',
      expirationDate: '2027-07-09T00:00:00.000Z',
      founderAccessActive: true,
      premiumSource: 'founder',
      status: 'premium',
      willRenew: false,
    });
    expect(canAccessLesson('bedtime', result)).toBe(true);
  });

  test('keeps an eligible Founder record signed out until a parent signs in', () => {
    mockFounderPremiumCutoffAt = '2026-07-10T00:00:00.000Z';
    const customerInfo = makeCustomerInfo(null, 'VERIFIED', {
      firstSeen: '2026-07-09T00:00:00.000Z',
      requestDate: '2026-07-12T00:00:00.000Z',
    });

    const result = mapCustomerInfoToMonetizationSnapshot(
      baseSnapshot,
      customerInfo,
      { isReady: true, user: null },
      Date.parse('2026-07-12T00:00:00.000Z'),
    );

    expect(result).toMatchObject({
      activeProductType: undefined,
      founderAccessActive: true,
      premiumSource: undefined,
      status: 'signedOut',
    });
  });

  test('keeps a verified store entitlement ahead of Founder access', () => {
    mockFounderPremiumCutoffAt = '2026-07-10T00:00:00.000Z';
    const customerInfo = makeCustomerInfo({}, 'VERIFIED', {
      firstSeen: '2026-07-09T00:00:00.000Z',
      requestDate: '2026-07-12T00:00:00.000Z',
    });

    const result = mapCustomerInfoToMonetizationSnapshot(
      baseSnapshot,
      customerInfo,
      signedInAuthSnapshot,
      Date.parse('2026-07-12T00:00:00.000Z'),
    );

    expect(result).toMatchObject({
      activeProductType: 'monthly',
      founderAccessActive: true,
      premiumSource: 'revenueCat',
      status: 'premium',
      willRenew: true,
    });
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
  dates: Readonly<{ firstSeen: string; requestDate: string }> = {
    firstSeen: '2026-07-01T00:00:00.000Z',
    requestDate: '2026-07-16T00:00:00.000Z',
  },
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
    firstSeen: dates.firstSeen,
    managementURL: 'https://store.example/manage',
    requestDate: dates.requestDate,
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
