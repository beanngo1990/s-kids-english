import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  areProgressSnapshotsEqual,
  getCloudProgressFingerprint,
  mergeProgressSnapshots,
  toCloudProgressData,
} from '../src/engine/CloudProgressMerge';
import {
  clearCloudProgressSyncState,
  getCloudProgressSyncState,
  saveCloudProgressSyncState,
} from '../src/engine/CloudProgressSyncState';
import {
  getProgress,
  normalizeProgress,
  saveProgress,
  saveProgressFromCloud,
  subscribeProgress,
} from '../src/engine/ProgressManager';

beforeEach(async () => {
  await AsyncStorage.clear();
});

test('merges monotonic progress without dropping achievements from either device', () => {
  const first = normalizeProgress({
    completedLessonIds: ['lesson-a'],
    completedSceneIds: ['lesson-a:scene-a'],
    currentLessonProgress: {
      lessonId: 'lesson-a',
      sceneId: 'scene-b',
      stepId: 'step-a',
    },
    earnedStickerIds: ['sticker-a'],
    earnedStickerRecords: [
      {
        earnedAt: '2026-07-10T08:00:00.000Z',
        source: 'lesson',
        stickerId: 'sticker-a',
      },
    ],
    totalXP: 12,
    updatedAt: '2026-07-10T08:00:00.000Z',
    vocabularyProgress: {
      hello: {
        correctCount: 2,
        lastReviewedAt: '2026-07-10T08:00:00.000Z',
        masteryLevel: 1,
        wordId: 'hello',
        wrongCount: 0,
      },
    },
  });
  const second = normalizeProgress({
    completedLessonIds: ['lesson-b'],
    completedSceneIds: ['lesson-b:scene-a'],
    currentLessonProgress: {
      lessonId: 'lesson-b',
      sceneId: 'scene-a',
      stepId: 'step-b',
    },
    earnedAchievementRecords: [
      {
        achievementId: 'achievement-a',
        stickerId: 'achievement-sticker-a',
      },
    ],
    learnedWordIds: ['hello', 'goodbye'],
    totalXP: 18,
    updatedAt: '2026-07-11T08:00:00.000Z',
    vocabularyProgress: {
      hello: {
        correctCount: 1,
        lastReviewedAt: '2026-07-11T08:00:00.000Z',
        masteryLevel: 2,
        wordId: 'hello',
        wrongCount: 1,
      },
    },
  });

  const merged = mergeProgressSnapshots(first, second);

  expect(merged.completedLessonIds).toEqual(['lesson-a', 'lesson-b']);
  expect(merged.completedSceneIds).toEqual([
    'lesson-a:scene-a',
    'lesson-b:scene-a',
  ]);
  expect(merged.currentLessonProgress).toEqual(
    second.currentLessonProgress,
  );
  expect(merged.earnedStickerIds).toContain('sticker-a');
  expect(merged.earnedAchievementRecords).toEqual(
    second.earnedAchievementRecords,
  );
  expect(merged.learnedWordIds).toEqual(['goodbye', 'hello']);
  expect(merged.totalXP).toBe(18);
  expect(merged.vocabularyProgress.hello).toMatchObject({
    correctCount: 2,
    lastReviewedAt: '2026-07-11T08:00:00.000Z',
    masteryLevel: 2,
    wrongCount: 1,
  });
});

test('cloud serialization is deterministic and removes undefined record fields', () => {
  const first = normalizeProgress({
    completedLessonIds: ['lesson-b', 'lesson-a'],
    earnedStickerIds: ['sticker-a'],
  });
  const second = normalizeProgress({
    completedLessonIds: ['lesson-a', 'lesson-b'],
    earnedStickerIds: ['sticker-a'],
  });

  expect(areProgressSnapshotsEqual(first, second)).toBe(true);

  const serialized = toCloudProgressData(first);
  expect(serialized.completedLessonIds).toEqual(['lesson-a', 'lesson-b']);
  expect(serialized.earnedStickerRecords).toEqual([
    { source: 'legacy', stickerId: 'sticker-a' },
  ]);
  expect(JSON.stringify(serialized)).not.toContain('undefined');
});

test('cloud fingerprint ignores client timestamps but detects progress changes', () => {
  const first = normalizeProgress({
    totalXP: 4,
    updatedAt: '2026-07-15T08:00:00.000Z',
  });
  const timestampOnlyChange = normalizeProgress({
    totalXP: 4,
    updatedAt: '2026-07-15T09:00:00.000Z',
  });
  const progressChange = normalizeProgress({
    totalXP: 5,
    updatedAt: '2026-07-15T09:00:00.000Z',
  });

  expect(getCloudProgressFingerprint(timestampOnlyChange)).toBe(
    getCloudProgressFingerprint(first),
  );
  expect(getCloudProgressFingerprint(progressChange)).not.toBe(
    getCloudProgressFingerprint(first),
  );
});

test('cloud fingerprint canonicalizes the resume pointer key order', () => {
  const first = normalizeProgress({
    currentLessonProgress: {
      lessonId: 'lesson-a',
      sceneId: 'scene-a',
      stepId: 'step-a',
    },
  });
  const reordered = normalizeProgress({
    currentLessonProgress: {
      stepId: 'step-a',
      sceneId: 'scene-a',
      lessonId: 'lesson-a',
    },
  });

  expect(getCloudProgressFingerprint(reordered)).toBe(
    getCloudProgressFingerprint(first),
  );
});

test('persists the last confirmed cloud fingerprint for its owner only', async () => {
  await saveCloudProgressSyncState({
    failureCount: 2,
    lastRemoteCheckedAt: '2026-07-15T07:59:00.000Z',
    lastSyncedAt: '2026-07-15T08:00:00.000Z',
    lastSyncedFingerprint: '{"totalXP":4}',
    lastWriteAttemptedAt: '2026-07-15T08:01:00.000Z',
    nextRetryAt: '2026-07-15T08:02:00.000Z',
    ownerUid: 'parent-a',
  });

  await clearCloudProgressSyncState('parent-b');
  await expect(getCloudProgressSyncState()).resolves.toMatchObject({
    failureCount: 2,
    lastRemoteCheckedAt: '2026-07-15T07:59:00.000Z',
    lastSyncedFingerprint: '{"totalXP":4}',
    lastWriteAttemptedAt: '2026-07-15T08:01:00.000Z',
    nextRetryAt: '2026-07-15T08:02:00.000Z',
    ownerUid: 'parent-a',
  });

  await clearCloudProgressSyncState('parent-a');
  await expect(getCloudProgressSyncState()).resolves.toEqual({});
});

test('persists sync scheduler state before a confirmed checkpoint exists', async () => {
  await saveCloudProgressSyncState({
    failureCount: 1,
    lastRemoteCheckedAt: '2026-07-15T08:00:00.000Z',
    lastWriteAttemptedAt: '2026-07-15T08:01:00.000Z',
    nextRetryAt: '2026-07-15T08:02:00.000Z',
    ownerUid: 'parent-a',
  });

  await expect(getCloudProgressSyncState()).resolves.toEqual({
    failureCount: 1,
    lastRemoteCheckedAt: '2026-07-15T08:00:00.000Z',
    lastWriteAttemptedAt: '2026-07-15T08:01:00.000Z',
    nextRetryAt: '2026-07-15T08:02:00.000Z',
    ownerUid: 'parent-a',
  });
});

test('merge tie-breaking is commutative for equal client timestamps', () => {
  const first = normalizeProgress({
    currentLessonProgress: {
      lessonId: 'lesson-a',
      sceneId: 'scene-a',
      stepId: 'step-a',
    },
    updatedAt: '2026-07-15T08:00:00.000Z',
  });
  const second = normalizeProgress({
    currentLessonProgress: {
      lessonId: 'lesson-b',
      sceneId: 'scene-b',
      stepId: 'step-b',
    },
    updatedAt: '2026-07-15T08:00:00.000Z',
  });

  expect(mergeProgressSnapshots(first, second)).toEqual(
    mergeProgressSnapshots(second, first),
  );
});

test('progress subscribers can distinguish local writes from cloud merges', async () => {
  const listener = jest.fn();
  const unsubscribe = subscribeProgress(listener);
  const progress = normalizeProgress({ totalXP: 4 });

  await saveProgress(progress);
  await saveProgressFromCloud(progress);
  unsubscribe();

  expect(listener).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({ source: 'local' }),
  );
  expect(listener).toHaveBeenNthCalledWith(
    2,
    expect.objectContaining({ source: 'cloud' }),
  );
});

test('cloud merges preserve the source update timestamp', async () => {
  const progress = normalizeProgress({
    totalXP: 4,
    updatedAt: '2026-07-15T08:00:00.000Z',
  });

  await saveProgressFromCloud(progress);

  await expect(getProgress()).resolves.toMatchObject({
    totalXP: 4,
    updatedAt: '2026-07-15T08:00:00.000Z',
  });
});

test('normalizes malformed remote vocabulary data before runtime use', () => {
  const progress = normalizeProgress({
    totalXP: -4,
    vocabularyProgress: {
      broken: 'not-an-object',
      hello: {
        correctCount: -2,
        lastReviewedAt: 42,
        masteryLevel: 99,
        wrongCount: 1,
      },
    },
  });

  expect(progress.totalXP).toBe(0);
  expect(progress.vocabularyProgress.broken).toBeUndefined();
  expect(progress.vocabularyProgress.hello).toEqual({
    correctCount: 0,
    lastReviewedAt: '1970-01-01T00:00:00.000Z',
    masteryLevel: 3,
    wordId: 'hello',
    wrongCount: 1,
  });
});
