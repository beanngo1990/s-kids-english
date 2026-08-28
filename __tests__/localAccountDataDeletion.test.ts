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
import {
  getActivityLog,
  recordActivity,
} from '../src/engine/DailyActivityTracker';
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
import {
  loadSceneVocabularyLayout,
  loadSceneVocabularyMeaningEnabled,
  saveSceneVocabularyLayout,
  saveSceneVocabularyMeaningEnabled,
} from '../src/engine/SceneVocabularyLayoutStore';
import { deleteLocalAccountData } from '../src/services/LocalAccountDataDeletion';
import { NotificationService } from '../src/services/NotificationService';
import {
  configureVoiceRecordingFileAdapter,
  getVoiceRecordingSamples,
  upsertVoiceRecordingSample,
} from '../src/engine/VoiceRecordingStore';

const mockClearLocalCloudSync =
  clearLocalCloudProgressSyncData as jest.MockedFunction<
    typeof clearLocalCloudProgressSyncData
  >;
const mockCancelDailyReminder =
  NotificationService.cancelDailyReminder as jest.MockedFunction<
    typeof NotificationService.cancelDailyReminder
  >;
const mockClearStoredVoiceRecordings = jest.fn(() => Promise.resolve(true));
const mockDeleteStoredVoiceRecording = jest.fn(() => Promise.resolve(true));

describe('local account data deletion', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    configureVoiceRecordingFileAdapter({
      clearStoredVoiceRecordings: mockClearStoredVoiceRecordings,
      deleteStoredVoiceRecording: mockDeleteStoredVoiceRecording,
      promoteVoiceRecording: (_tempUri, recordingId) =>
        Promise.resolve(`file:///voice-recordings/${recordingId}.wav`),
    });
    mockCancelDailyReminder.mockResolvedValue(undefined);
    mockClearStoredVoiceRecordings.mockResolvedValue(true);
    mockDeleteStoredVoiceRecording.mockResolvedValue(true);
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
      voiceRecordingLibrary: {
        consentedAt: '2026-08-01T08:00:00.000Z',
        consentVersion: 1,
        enabled: true,
        updatedAt: '2026-08-01T08:00:00.000Z',
      },
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
    await saveSceneVocabularyLayout('lesson-a', 'scene-a', 'core', [
      { itemId: 'word-a', x: 0.72, y: 0.64, zIndex: 4 },
    ]);
    await saveSceneVocabularyMeaningEnabled(true);
    await upsertVoiceRecordingSample({
      accent: 'en-US',
      createdAt: '2026-08-01T08:00:00.000Z',
      durationMs: 1200,
      encounterId: 'encounter-a',
      id: 'recording_a',
      lessonId: 'lesson-a',
      sceneId: 'scene-a',
      stepId: 'step-a',
      themeId: 'theme-a',
      uri: 'file:///voice-recordings/recording_a.wav',
      vocabId: 'word-a',
      word: 'hello',
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
      voiceRecordingLibrary: { enabled: false },
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
    await expect(
      loadSceneVocabularyLayout('lesson-a', 'scene-a', 'core'),
    ).resolves.toEqual([]);
    await expect(loadSceneVocabularyMeaningEnabled()).resolves.toBe(false);
    await expect(getVoiceRecordingSamples()).resolves.toEqual([]);
    expect(mockClearLocalCloudSync).toHaveBeenCalledTimes(1);
    expect(mockCancelDailyReminder).toHaveBeenCalledTimes(1);
    expect(mockClearStoredVoiceRecordings).toHaveBeenCalledTimes(1);
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

  test('clears recording metadata and reports a native file deletion failure', async () => {
    await saveParentSettings({
      hasCompletedOnboarding: true,
      voiceRecordingLibrary: { enabled: true },
    });
    await upsertVoiceRecordingSample({
      accent: 'en-US',
      createdAt: '2026-08-01T08:00:00.000Z',
      durationMs: 1200,
      encounterId: 'encounter-a',
      id: 'recording_a',
      lessonId: 'lesson-a',
      sceneId: 'scene-a',
      stepId: 'step-a',
      themeId: 'theme-a',
      uri: 'file:///voice-recordings/recording_a.wav',
      vocabId: 'word-a',
      word: 'hello',
    });
    mockClearStoredVoiceRecordings.mockRejectedValueOnce(
      new Error('native deletion failed'),
    );

    await expect(deleteLocalAccountData()).rejects.toThrow(
      'Could not delete all local voice recording files.',
    );

    await expect(getVoiceRecordingSamples()).resolves.toEqual([]);
    await expect(getParentSettings()).resolves.toMatchObject({
      hasCompletedOnboarding: false,
      voiceRecordingLibrary: { enabled: false },
    });
  });
});
