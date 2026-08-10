import {
  normalizeProgress,
  normalizeStickerPlaygroundState,
  type EarnedAchievementRecord,
  type EarnedStickerRecord,
  type LocalProgress,
  type WordProgress,
} from './ProgressManager';
import {
  STICKER_PLAYGROUND_BACKGROUND_IDS,
  type StickerPlaygroundBoard,
  type StickerPlaygroundState,
} from '../types/stickerPlayground';

export function mergeProgressSnapshots(
  first: LocalProgress,
  second: LocalProgress,
): LocalProgress {
  const local = normalizeProgress(first);
  const remote = normalizeProgress(second);
  const latest = getLatestSnapshot(local, remote);

  return normalizeProgress({
    activeThemeId: latest.activeThemeId,
    completedLessonIds: mergeIds(
      local.completedLessonIds,
      remote.completedLessonIds,
    ),
    completedReviewGameIds: mergeIds(
      local.completedReviewGameIds,
      remote.completedReviewGameIds,
    ),
    completedSceneIds: mergeIds(
      local.completedSceneIds,
      remote.completedSceneIds,
    ),
    currentLessonProgress: latest.currentLessonProgress,
    earnedAchievementRecords: mergeAchievementRecords(
      local.earnedAchievementRecords,
      remote.earnedAchievementRecords,
    ),
    earnedStickerIds: mergeIds(
      local.earnedStickerIds,
      remote.earnedStickerIds,
    ),
    earnedStickerRecords: mergeStickerRecords(
      local.earnedStickerRecords,
      remote.earnedStickerRecords,
    ),
    learnedWordIds: mergeIds(local.learnedWordIds, remote.learnedWordIds),
    stickerPlayground: mergeStickerPlaygroundStates(
      local.stickerPlayground,
      remote.stickerPlayground,
    ),
    totalXP: Math.max(local.totalXP, remote.totalXP),
    updatedAt: latestTimestamp(local.updatedAt, remote.updatedAt),
    vocabularyProgress: mergeVocabularyProgress(
      local.vocabularyProgress,
      remote.vocabularyProgress,
    ),
  });
}

function mergeStickerPlaygroundStates(
  first: StickerPlaygroundState,
  second: StickerPlaygroundState,
) {
  const firstState = normalizeStickerPlaygroundState(first);
  const secondState = normalizeStickerPlaygroundState(second);
  const latestState = chooseLatestPlaygroundValue(firstState, secondState);
  const boards = STICKER_PLAYGROUND_BACKGROUND_IDS.reduce(
    (result, backgroundId) => {
      result[backgroundId] = chooseLatestPlaygroundValue(
        firstState.boards[backgroundId],
        secondState.boards[backgroundId],
      );
      return result;
    },
    {} as Record<
      (typeof STICKER_PLAYGROUND_BACKGROUND_IDS)[number],
      StickerPlaygroundBoard
    >,
  );

  return normalizeStickerPlaygroundState({
    activeBackgroundId: latestState.activeBackgroundId,
    boards,
    updatedAt: latestTimestamp(firstState.updatedAt, secondState.updatedAt),
  });
}

function chooseLatestPlaygroundValue<
  TValue extends { updatedAt?: string },
>(first: TValue, second: TValue) {
  const firstTimestamp = toTimestamp(first.updatedAt);
  const secondTimestamp = toTimestamp(second.updatedAt);

  if (firstTimestamp !== secondTimestamp) {
    return firstTimestamp > secondTimestamp ? first : second;
  }

  return JSON.stringify(first).localeCompare(JSON.stringify(second)) >= 0
    ? first
    : second;
}

export function areProgressSnapshotsEqual(
  first: LocalProgress,
  second: LocalProgress,
) {
  return (
    JSON.stringify(toCloudProgressData(first)) ===
    JSON.stringify(toCloudProgressData(second))
  );
}

export function getCloudProgressFingerprint(progress: LocalProgress) {
  const semanticEntries = Object.entries(toCloudProgressData(progress)).filter(
    ([key]) => key !== 'updatedAt',
  );

  return JSON.stringify(Object.fromEntries(semanticEntries));
}

export function toCloudProgressData(progress: LocalProgress) {
  const normalized = mergeProgressSnapshots(progress, progress);

  return {
    activeThemeId: normalized.activeThemeId,
    completedLessonIds: normalized.completedLessonIds,
    completedReviewGameIds: normalized.completedReviewGameIds,
    completedSceneIds: normalized.completedSceneIds,
    ...(normalized.currentLessonProgress
      ? {
          currentLessonProgress: {
            lessonId: normalized.currentLessonProgress.lessonId,
            sceneId: normalized.currentLessonProgress.sceneId,
            stepId: normalized.currentLessonProgress.stepId,
          },
        }
      : {}),
    earnedAchievementRecords: normalized.earnedAchievementRecords.map(
      record => ({
        achievementId: record.achievementId,
        ...(record.earnedAt ? { earnedAt: record.earnedAt } : {}),
        stickerId: record.stickerId,
      }),
    ),
    earnedStickerIds: normalized.earnedStickerIds,
    earnedStickerRecords: normalized.earnedStickerRecords.map(record => ({
      ...(record.earnedAt ? { earnedAt: record.earnedAt } : {}),
      ...(record.lessonId ? { lessonId: record.lessonId } : {}),
      source: record.source,
      stickerId: record.stickerId,
    })),
    learnedWordIds: normalized.learnedWordIds,
    totalXP: normalized.totalXP,
    ...(normalized.updatedAt ? { updatedAt: normalized.updatedAt } : {}),
    vocabularyProgress: Object.fromEntries(
      Object.entries(normalized.vocabularyProgress)
        .sort(([firstId], [secondId]) => firstId.localeCompare(secondId))
        .map(([wordId, item]) => [wordId, item]),
    ),
  };
}

function mergeIds(first: string[], second: string[]) {
  return Array.from(new Set([...first, ...second])).sort((left, right) =>
    left.localeCompare(right),
  );
}

function mergeVocabularyProgress(
  first: Record<string, WordProgress>,
  second: Record<string, WordProgress>,
) {
  const merged: Record<string, WordProgress> = {};
  const wordIds = mergeIds(Object.keys(first), Object.keys(second));

  wordIds.forEach(wordId => {
    const firstItem = first[wordId];
    const secondItem = second[wordId];

    if (!firstItem || !secondItem) {
      merged[wordId] = firstItem ?? secondItem;
      return;
    }

    merged[wordId] = {
      correctCount: Math.max(firstItem.correctCount, secondItem.correctCount),
      lastReviewedAt:
        latestTimestamp(
          firstItem.lastReviewedAt,
          secondItem.lastReviewedAt,
        ) ?? new Date(0).toISOString(),
      masteryLevel: Math.max(
        firstItem.masteryLevel,
        secondItem.masteryLevel,
      ),
      wordId,
      wrongCount: Math.max(firstItem.wrongCount, secondItem.wrongCount),
    };
  });

  return merged;
}

function mergeStickerRecords(
  first: EarnedStickerRecord[],
  second: EarnedStickerRecord[],
) {
  const merged = new Map<string, EarnedStickerRecord>();

  [...first, ...second].forEach(record => {
    const existing = merged.get(record.stickerId);
    if (!existing) {
      merged.set(record.stickerId, record);
      return;
    }

    merged.set(record.stickerId, {
      earnedAt: earliestTimestamp(existing.earnedAt, record.earnedAt),
      lessonId: firstDefinedAlphabetically(
        existing.lessonId,
        record.lessonId,
      ),
      source:
        existing.source === 'lesson' || record.source === 'lesson'
          ? 'lesson'
          : 'legacy',
      stickerId: record.stickerId,
    });
  });

  return Array.from(merged.values()).sort((left, right) =>
    left.stickerId.localeCompare(right.stickerId),
  );
}

function mergeAchievementRecords(
  first: EarnedAchievementRecord[],
  second: EarnedAchievementRecord[],
) {
  const merged = new Map<string, EarnedAchievementRecord>();

  [...first, ...second].forEach(record => {
    const existing = merged.get(record.achievementId);
    if (!existing) {
      merged.set(record.achievementId, record);
      return;
    }

    merged.set(record.achievementId, {
      achievementId: record.achievementId,
      earnedAt: earliestTimestamp(existing.earnedAt, record.earnedAt),
      stickerId:
        firstDefinedAlphabetically(
          existing.stickerId,
          record.stickerId,
        ) ?? record.stickerId,
    });
  });

  return Array.from(merged.values()).sort((left, right) =>
    left.achievementId.localeCompare(right.achievementId),
  );
}

function isAtLeastAsRecent(first?: string, second?: string) {
  return toTimestamp(first) >= toTimestamp(second);
}

function getLatestSnapshot(first: LocalProgress, second: LocalProgress) {
  const firstTimestamp = toTimestamp(first.updatedAt);
  const secondTimestamp = toTimestamp(second.updatedAt);

  if (firstTimestamp !== secondTimestamp) {
    return firstTimestamp > secondTimestamp ? first : second;
  }

  const firstTieBreaker = JSON.stringify([
    first.activeThemeId,
    first.currentLessonProgress ?? null,
  ]);
  const secondTieBreaker = JSON.stringify([
    second.activeThemeId,
    second.currentLessonProgress ?? null,
  ]);

  return firstTieBreaker.localeCompare(secondTieBreaker) >= 0
    ? first
    : second;
}

function latestTimestamp(first?: string, second?: string) {
  if (!first) {
    return second;
  }

  if (!second) {
    return first;
  }

  return isAtLeastAsRecent(first, second) ? first : second;
}

function earliestTimestamp(first?: string, second?: string) {
  if (!first) {
    return second;
  }

  if (!second) {
    return first;
  }

  return toTimestamp(first) <= toTimestamp(second) ? first : second;
}

function firstDefinedAlphabetically(first?: string, second?: string) {
  return [first, second]
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => left.localeCompare(right))[0];
}

function toTimestamp(value?: string) {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}
