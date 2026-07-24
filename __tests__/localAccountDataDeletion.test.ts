import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../src/engine/CloudProgressSyncManager', () => {
  const { clearAllCloudProgressSyncState } = jest.requireActual(
    '../src/engine/CloudProgressSyncState',
  );

  return {
    clearLocalCloudProgressSyncData: jest.fn(() =>
      clearAllCloudProgressSyncState(),
    ),
  };
});

jest.mock('../src/services/NotificationService', () => ({
  NotificationService: {
    cancelDailyReminder: jest.fn(() => Promise.resolve()),
  },
}));

import { clearLocalCloudProgressSyncData } from '../src/engine/CloudProgressSyncManager';
import {
  getCloudProgressSyncState,
  saveCloudProgressSyncState,
} from '../src/engine/CloudProgressSyncState';
import { getActivityLog, recordActivity } from '../src/engine/DailyActivityTracker';
import {
  defaultChildProfile,
  getParentSettings,
  saveParentSettings,
} from '../src/engine/ParentSettingsManager';
import {
  getProgress,
  normalizeProgress,
  saveProgress,
} from '../src/engine/ProgressManager';
import { deleteLocalAccountData } from '../src/services/LocalAccountDataDeletion';
import { NotificationService } from '../src/services/NotificationService';

const mockClearLocalCloudSync =
  clearLocalCloudProgressSyncData as jest.MockedFunction<
    typeof clearLocalCloudProgressSyncData
  >;
const mockCancelDailyReminder =
  NotificationService.cancelDailyReminder as jest.MockedFunction<
    typeof NotificationService.cancelDailyReminder
  >;

describe('local account data deletion', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    mockCancelDailyReminder.mockResolvedValue(undefined);
  });

  test('removes local account stores without clearing unrelated AsyncStorage keys', async () => {
    await AsyncStorage.setItem('@external/library-key', 'keep-me');
    await saveParentSettings({
      appLanguage: 'en',
      childProfile: {
        avatarEmoji: '🌟',
        name: 'Minh',
      },
      hasCompletedOnboarding: true,
      reminderEnabled: true,
      reminderTime: '20:15',
    });
    await saveProgress(
      normalizeProgress({
        completedLessonIds: ['lesson-a'],
        learnedWordIds: ['word-a'],
        totalXP: 42,
      }),
    );
    await recordActivity('scene', 2);
    await saveCloudProgressSyncState({
      lastSyncedAt: '2026-07-24T00:00:00.000Z',
      lastSyncedFingerprint: 'fingerprint-a',
      ownerUid: 'parent-a',
    });

    await deleteLocalAccountData();

    await expect(AsyncStorage.getItem('@external/library-key')).resolves.toBe(
      'keep-me',
    );
    await expect(getParentSettings()).resolves.toMatchObject({
      appLanguage: 'vi',
      childProfile: defaultChildProfile,
      hasCompletedOnboarding: false,
      reminderEnabled: false,
    });
    await expect(getProgress()).resolves.toMatchObject({
      completedLessonIds: [],
      learnedWordIds: [],
      totalXP: 0,
    });
    await expect(getActivityLog()).resolves.toMatchObject({
      currentStreak: 0,
      entries: [],
      longestStreak: 0,
    });
    await expect(getCloudProgressSyncState()).resolves.toEqual({});
    expect(mockClearLocalCloudSync).toHaveBeenCalledTimes(1);
    expect(mockCancelDailyReminder).toHaveBeenCalledTimes(1);
  });

  test('still clears persisted account data when reminder cancellation fails', async () => {
    mockCancelDailyReminder.mockRejectedValueOnce(
      new Error('notification unavailable'),
    );
    await saveParentSettings({ hasCompletedOnboarding: true });
    await saveProgress(normalizeProgress({ totalXP: 10 }));
    await recordActivity('word');

    await expect(deleteLocalAccountData()).resolves.toBeUndefined();

    await expect(getParentSettings()).resolves.toMatchObject({
      hasCompletedOnboarding: false,
    });
    await expect(getProgress()).resolves.toMatchObject({ totalXP: 0 });
    await expect(getActivityLog()).resolves.toMatchObject({ entries: [] });
  });
});
