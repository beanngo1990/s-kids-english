import AsyncStorage from '@react-native-async-storage/async-storage';

const mockOpenURL = jest.fn();
const mockRequestReview = jest.fn();
let mockPlatformOS: 'android' | 'ios' = 'ios';

jest.mock('react-native', () => ({
  Linking: {
    openURL: (url: string) => mockOpenURL(url),
  },
  NativeModules: {
    SkidsAppReview: {
      requestReview: () => mockRequestReview(),
    },
  },
  Platform: {
    get OS() {
      return mockPlatformOS;
    },
  },
}));

import {
  APP_REVIEW_STORAGE_KEY,
  evaluateAppReviewEligibility,
  getAppReviewStoreUrl,
  initializeAppReviewTracking,
  openAppReviewStore,
  parseAppReviewState,
  requestAutomaticAppReview,
  type AppReviewEligibilityInput,
  type AppReviewState,
} from '../src/engine/AppReviewManager';

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = Date.parse('2026-08-11T12:00:00.000Z');

beforeEach(async () => {
  await AsyncStorage.clear();
  mockOpenURL.mockReset();
  mockRequestReview.mockReset();
  mockRequestReview.mockResolvedValue(true);
  mockPlatformOS = 'ios';
});

test('initializes and preserves local review tracking state', async () => {
  const initial = await initializeAppReviewTracking(NOW);

  expect(initial).toEqual({
    attempts: [],
    firstSeenAt: '2026-08-11T12:00:00.000Z',
    schemaVersion: 1,
  });

  const stored = await AsyncStorage.getItem(APP_REVIEW_STORAGE_KEY);
  expect(parseAppReviewState(stored)).toEqual(initial);
  await expect(initializeAppReviewTracking(NOW + DAY_MS)).resolves.toEqual(
    initial,
  );
});

test('requires app age, three active days, and three completed lessons', () => {
  const state = createState({ firstSeenDaysAgo: 8 });
  const eligibleInput = createEligibleInput();

  expect(evaluateAppReviewEligibility(state, eligibleInput)).toBe(true);
  expect(
    evaluateAppReviewEligibility(createState({ firstSeenDaysAgo: 6 }), eligibleInput),
  ).toBe(false);
  expect(
    evaluateAppReviewEligibility(state, {
      ...eligibleInput,
      activityEntries: eligibleInput.activityEntries.slice(0, 2),
    }),
  ).toBe(false);
  expect(
    evaluateAppReviewEligibility(state, {
      ...eligibleInput,
      completedLessonCount: 2,
    }),
  ).toBe(false);
});

test('limits attempts by app version, cooldown, and annual window', () => {
  const eligibleInput = createEligibleInput();

  expect(
    evaluateAppReviewEligibility(
      createState({ attempts: [{ appVersion: '1.0', daysAgo: 100 }] }),
      eligibleInput,
    ),
  ).toBe(false);
  expect(
    evaluateAppReviewEligibility(
      createState({ attempts: [{ appVersion: '0.9', daysAgo: 30 }] }),
      eligibleInput,
    ),
  ).toBe(false);
  expect(
    evaluateAppReviewEligibility(
      createState({
        attempts: [
          { appVersion: '0.8', daysAgo: 300 },
          { appVersion: '0.9', daysAgo: 100 },
        ],
      }),
      eligibleInput,
    ),
  ).toBe(false);
  expect(
    evaluateAppReviewEligibility(
      createState({ attempts: [{ appVersion: '0.9', daysAgo: 366 }] }),
      eligibleInput,
    ),
  ).toBe(true);
});

test('requests the native prompt and records only the attempt, not a rating', async () => {
  const state = createState({ firstSeenDaysAgo: 8 });
  await AsyncStorage.setItem(APP_REVIEW_STORAGE_KEY, JSON.stringify(state));

  await expect(requestAutomaticAppReview(createEligibleInput())).resolves.toBe(
    'requested',
  );
  expect(mockRequestReview).toHaveBeenCalledTimes(1);

  const stored = parseAppReviewState(
    await AsyncStorage.getItem(APP_REVIEW_STORAGE_KEY),
  );
  expect(stored?.attempts).toEqual([
    {
      appVersion: '1.0',
      attemptedAt: '2026-08-11T12:00:00.000Z',
    },
  ]);

  await expect(requestAutomaticAppReview(createEligibleInput())).resolves.toBe(
    'ineligible',
  );
  expect(mockRequestReview).toHaveBeenCalledTimes(1);
});

test('does not consume an attempt when the native prompt is unavailable', async () => {
  await AsyncStorage.setItem(
    APP_REVIEW_STORAGE_KEY,
    JSON.stringify(createState({ firstSeenDaysAgo: 8 })),
  );
  mockRequestReview.mockResolvedValue(false);

  await expect(requestAutomaticAppReview(createEligibleInput())).resolves.toBe(
    'unavailable',
  );
  expect(
    parseAppReviewState(await AsyncStorage.getItem(APP_REVIEW_STORAGE_KEY))
      ?.attempts,
  ).toEqual([]);
});

test('builds safe store review links and uses an Android web fallback', async () => {
  expect(getAppReviewStoreUrl(undefined, 'ios')).toBe(
    'https://apps.apple.com/app/id6790650146?action=write-review',
  );
  expect(
    getAppReviewStoreUrl('https://apps.apple.com/app/id123456789', 'ios'),
  ).toBe('https://apps.apple.com/app/id123456789?action=write-review');
  expect(
    getAppReviewStoreUrl(
      'https://apps.apple.com/app/id123456789?action=write-review',
      'ios',
    ),
  ).toBe('https://apps.apple.com/app/id123456789?action=write-review');
  expect(getAppReviewStoreUrl('https://example.com/fake', 'ios')).toBe(
    'https://apps.apple.com/app/id6790650146?action=write-review',
  );

  mockPlatformOS = 'android';
  mockOpenURL
    .mockRejectedValueOnce(new Error('Play Store unavailable'))
    .mockResolvedValueOnce(undefined);

  await expect(openAppReviewStore()).resolves.toBe(true);
  expect(mockOpenURL).toHaveBeenNthCalledWith(
    1,
    'market://details?id=com.seduforge.skidsenglish',
  );
  expect(mockOpenURL).toHaveBeenNthCalledWith(
    2,
    'https://play.google.com/store/apps/details?id=com.seduforge.skidsenglish',
  );
});

function createEligibleInput(): AppReviewEligibilityInput {
  return {
    activityEntries: [
      createActivityEntry('2026-08-08'),
      createActivityEntry('2026-08-09'),
      createActivityEntry('2026-08-10'),
    ],
    appVersion: '1.0',
    completedLessonCount: 3,
    now: NOW,
  };
}

function createActivityEntry(date: string) {
  return {
    date,
    scenesCompleted: 1,
    wordsLearned: 0,
  };
}

function createState({
  attempts = [],
  firstSeenDaysAgo = 30,
}: {
  attempts?: Array<{ appVersion: string; daysAgo: number }>;
  firstSeenDaysAgo?: number;
}): AppReviewState {
  return {
    attempts: attempts.map(attempt => ({
      appVersion: attempt.appVersion,
      attemptedAt: new Date(NOW - attempt.daysAgo * DAY_MS).toISOString(),
    })),
    firstSeenAt: new Date(NOW - firstSeenDaysAgo * DAY_MS).toISOString(),
    schemaVersion: 1,
  };
}
