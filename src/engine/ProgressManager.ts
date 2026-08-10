import AsyncStorage from '@react-native-async-storage/async-storage';

import { getSceneForLearningMode } from '../data/learningModes';
import { lessons } from '../data/lessons';
import { getLessonReward, type LessonReward } from '../data/rewards';
import { DEFAULT_THEME_ID, themes } from '../data/themes';
import { recordActivity } from './DailyActivityTracker';
import type {
  LearningMode,
  Lesson,
  Scene,
  VocabularyItem,
} from '../types/lesson';
import {
  getSceneProgressId,
  isSceneProgressComplete,
} from '../utils/lessonProgress';

const PROGRESS_STORAGE_KEY = '@skidsenglish/progress/v1';

export type WordProgress = {
  wordId: string;
  masteryLevel: number;
  correctCount: number;
  wrongCount: number;
  lastReviewedAt: string;
};

export type EarnedStickerRecord = {
  stickerId: string;
  lessonId?: string;
  earnedAt?: string;
  source: 'legacy' | 'lesson';
};

export type EarnedAchievementRecord = {
  achievementId: string;
  stickerId: string;
  earnedAt?: string;
};

export type LocalProgress = {
  activeThemeId: string;
  completedLessonIds: string[];
  completedReviewGameIds: string[];
  completedSceneIds: string[];
  learnedWordIds: string[];
  earnedStickerIds: string[];
  earnedStickerRecords: EarnedStickerRecord[];
  earnedAchievementRecords: EarnedAchievementRecord[];
  vocabularyProgress: Record<string, WordProgress>;
  totalXP: number;
  currentLessonProgress?: {
    lessonId: string;
    sceneId: string;
    stepId: string;
  };
  updatedAt?: string;
};

export type ProgressCompletionResult = {
  xpGained: number;
  leveledUp: boolean;
  newLevel: number;
  unlockedSticker?: LessonReward;
};

export type ProgressChangeSource = 'cloud' | 'local';

export type ProgressChange = {
  progress: LocalProgress;
  source: ProgressChangeSource;
};

export type ProgressListener = (change: ProgressChange) => void;

type LearningScopeOptions = {
  learningMode?: LearningMode;
};

type ProgressUpdate<TResult> = {
  progress: LocalProgress;
  result: TResult;
};

type ProgressUpdater<TResult> = (
  currentProgress: LocalProgress,
) => ProgressUpdate<TResult>;

const emptyProgress: LocalProgress = {
  activeThemeId: DEFAULT_THEME_ID,
  completedLessonIds: [],
  completedReviewGameIds: [],
  completedSceneIds: [],
  earnedStickerIds: [],
  earnedStickerRecords: [],
  earnedAchievementRecords: [],
  learnedWordIds: [],
  vocabularyProgress: {},
  totalXP: 0,
};

const progressListeners = new Set<ProgressListener>();
let progressOperationQueue: Promise<void> = Promise.resolve();

export function subscribeProgress(listener: ProgressListener) {
  progressListeners.add(listener);

  return () => {
    progressListeners.delete(listener);
  };
}

export function getProgress(): Promise<LocalProgress> {
  return enqueueProgressOperation(readProgressFromStorage);
}

async function readProgressFromStorage(): Promise<LocalProgress> {
  const rawProgress = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);

  if (!rawProgress) {
    return emptyProgress;
  }

  return normalizeProgress(JSON.parse(rawProgress));
}

export function saveProgress(progress: LocalProgress) {
  return enqueueProgressOperation(() => persistProgress(progress, 'local'));
}

export function saveProgressFromCloud(progress: LocalProgress) {
  return enqueueProgressOperation(() => persistProgress(progress, 'cloud'));
}

export function updateProgressFromCloud(
  updater: (currentProgress: LocalProgress) => LocalProgress,
): Promise<LocalProgress> {
  return applyProgressUpdate(
    currentProgress => ({
      progress: updater(currentProgress),
      result: undefined,
    }),
    'cloud',
  ).then(update => update.progress);
}

async function persistProgress(
  progress: LocalProgress,
  source: ProgressChangeSource,
) {
  const nextProgress = normalizeProgress(
    source === 'local'
      ? { ...progress, updatedAt: new Date().toISOString() }
      : progress,
  );

  await AsyncStorage.setItem(
    PROGRESS_STORAGE_KEY,
    JSON.stringify(nextProgress),
  );

  notifyProgressChanged({ progress: nextProgress, source });

  return nextProgress;
}

export function resetProgress() {
  return enqueueProgressOperation(async () => {
    await AsyncStorage.removeItem(PROGRESS_STORAGE_KEY);
    notifyProgressChanged({ progress: emptyProgress, source: 'local' });
  });
}

function enqueueProgressOperation<TResult>(
  operation: () => Promise<TResult>,
): Promise<TResult> {
  const result = progressOperationQueue.then(operation);
  progressOperationQueue = result.then(
    () => undefined,
    () => undefined,
  );

  return result;
}

function applyProgressUpdate<TResult>(
  updater: ProgressUpdater<TResult>,
  source: ProgressChangeSource = 'local',
) {
  return enqueueProgressOperation(async () => {
    const currentProgress = await readProgressFromStorage();
    const update = updater(currentProgress);

    if (update.progress === currentProgress) {
      return update;
    }

    const progress = await persistProgress(update.progress, source);
    return { progress, result: update.result };
  });
}

function updateProgress(
  updater: (currentProgress: LocalProgress) => LocalProgress,
) {
  return applyProgressUpdate(currentProgress => ({
    progress: updater(currentProgress),
    result: undefined,
  })).then(update => update.progress);
}

export async function completeLessonProgress(
  lesson: Lesson,
  options: LearningScopeOptions = {},
): Promise<ProgressCompletionResult> {
  try {
    const learnedVocabulary = getProgressVocabulary(lesson, options);
    const lessonReward = getLessonReward(lesson.id);

    const update = await applyProgressUpdate(currentProgress => {
      const completedSceneIds = addUnique(
        currentProgress.completedSceneIds,
        lesson.scenes.map(scene => getSceneProgressId(lesson.id, scene.id)),
      );
      const nextCompletedLessonIds = addUnique(
        currentProgress.completedLessonIds,
        [lesson.id],
      );
      const nextCompletedReviewGameIds = lesson.reviewGame
        ? addUnique(currentProgress.completedReviewGameIds, [
            lesson.reviewGame.id,
          ])
        : currentProgress.completedReviewGameIds;
      const isNewReviewGame =
        nextCompletedReviewGameIds.length >
        currentProgress.completedReviewGameIds.length;
      const gainedXP = isNewReviewGame ? 2 : 1;
      const oldLevel = calculateLevelFromXP(currentProgress.totalXP);
      const newTotalXP = currentProgress.totalXP + gainedXP;
      const newLevel = calculateLevelFromXP(newTotalXP);
      const unlockedSticker =
        lessonReward &&
        nextCompletedLessonIds.includes(lesson.id) &&
        !currentProgress.earnedStickerIds.includes(lessonReward.stickerId)
          ? lessonReward
          : undefined;
      const earnedAt = unlockedSticker ? new Date().toISOString() : undefined;

      return {
        progress: {
          ...currentProgress,
          completedLessonIds: nextCompletedLessonIds,
          completedReviewGameIds: nextCompletedReviewGameIds,
          completedSceneIds,
          currentLessonProgress: undefined,
          earnedStickerIds: addUnique(
            currentProgress.earnedStickerIds,
            unlockedSticker ? [unlockedSticker.stickerId] : [],
          ),
          earnedStickerRecords: unlockedSticker
            ? addStickerRecord(currentProgress.earnedStickerRecords, {
                earnedAt,
                lessonId: lesson.id,
                source: 'lesson',
                stickerId: unlockedSticker.stickerId,
              })
            : currentProgress.earnedStickerRecords,
          learnedWordIds: addUnique(
            currentProgress.learnedWordIds,
            learnedVocabulary.map(item => item.id),
          ),
          totalXP: newTotalXP,
        },
        result: {
          leveledUp: newLevel > oldLevel,
          newLevel,
          unlockedSticker,
          xpGained: gainedXP,
        },
      };
    });

    return update.result;
  } catch {
    return { xpGained: 0, leveledUp: false, newLevel: 1 };
  }
}

export async function saveActiveThemeId(activeThemeId: string) {
  return updateProgress(currentProgress => ({
    ...currentProgress,
    activeThemeId,
  }));
}

export async function saveEarnedAchievementRecords(
  records: EarnedAchievementRecord[],
) {
  if (records.length === 0) {
    return getProgress();
  }

  return updateProgress(currentProgress => ({
    ...currentProgress,
    earnedAchievementRecords: addAchievementRecords(
      currentProgress.earnedAchievementRecords,
      records,
    ),
  }));
}

export async function saveCurrentStepProgress(
  lessonId: string,
  sceneId: string,
  stepId: string
) {
  try {
    await updateProgress(currentProgress => ({
      ...currentProgress,
      currentLessonProgress: { lessonId, sceneId, stepId },
    }));
  } catch {
    // best effort
  }
}

export async function saveLearnedWord(wordId: string) {
  try {
    const update = await applyProgressUpdate(currentProgress => {
      const isNew = !currentProgress.learnedWordIds.includes(wordId);

      return {
        progress: {
          ...currentProgress,
          learnedWordIds: addUnique(currentProgress.learnedWordIds, [wordId]),
        },
        result: { isNew },
      };
    });

    if (update.result.isNew) {
      recordActivity('word', 1);
    }
  } catch {
    // best effort
  }
}

export async function saveVocabularyInteraction(
  wordId: string,
  isFirstTry: boolean,
) {
  try {
    // Reward XP
    const gainedXP = 0; // Removing direct XP from card interactions to avoid spam // Bonus for blooming a flower!

    await updateProgress(currentProgress => {
      const existingWordProgress = currentProgress.vocabularyProgress[wordId] || {
        wordId,
        masteryLevel: 0,
        correctCount: 0,
        wrongCount: 0,
        lastReviewedAt: new Date().toISOString(),
      };
      const nextCorrectCount =
        existingWordProgress.correctCount + (isFirstTry ? 1 : 0);
      const nextWrongCount =
        existingWordProgress.wrongCount + (isFirstTry ? 0 : 1);

      // Simple mastery calculation: correct - wrong, max 3
      const score = nextCorrectCount - nextWrongCount;
      const nextMasteryLevel = Math.max(
        0,
        Math.min(3, Math.floor(score / 2)),
      );
      const nextWordProgress: WordProgress = {
        ...existingWordProgress,
        correctCount: nextCorrectCount,
        wrongCount: nextWrongCount,
        masteryLevel: nextMasteryLevel,
        lastReviewedAt: new Date().toISOString(),
      };

      return {
        ...currentProgress,
        learnedWordIds: addUnique(currentProgress.learnedWordIds, [wordId]),
        vocabularyProgress: {
          ...currentProgress.vocabularyProgress,
          [wordId]: nextWordProgress,
        },
        totalXP: currentProgress.totalXP + gainedXP,
      };
    });

    return { xpGained: gainedXP };
  } catch {
    return { xpGained: 0 };
  }
}

export async function saveSceneProgress(
  lessonId: string,
  sceneId: string,
  options: LearningScopeOptions = {},
): Promise<ProgressCompletionResult> {
  try {
    const lesson = lessons.find(item => item.id === lessonId);
    const update = await applyProgressUpdate(currentProgress => {
      const completedSceneIds = addUnique(currentProgress.completedSceneIds, [
        getSceneProgressId(lessonId, sceneId),
      ]);
      const completedSceneIdSet = new Set(completedSceneIds);
      const isLessonNowComplete = Boolean(
        lesson &&
          lesson.scenes.every(scene =>
            isSceneProgressComplete(
              completedSceneIdSet,
              lesson.id,
              scene.id,
            ),
          ),
      );
      const shouldCompleteLessonNow = Boolean(
        isLessonNowComplete && !lesson?.reviewGame,
      );
      const learnedVocabulary = shouldCompleteLessonNow && lesson
        ? getProgressVocabulary(lesson, options)
        : [];
      const isNewScene =
        completedSceneIds.length > currentProgress.completedSceneIds.length;
      const gainedXP = isNewScene ? 3 : 1;
      const nextCompletedLessonIds = shouldCompleteLessonNow
        ? addUnique(currentProgress.completedLessonIds, [lessonId])
        : currentProgress.completedLessonIds;
      const oldLevel = calculateLevelFromXP(currentProgress.totalXP);
      const newTotalXP = currentProgress.totalXP + gainedXP;
      const newLevel = calculateLevelFromXP(newTotalXP);

      return {
        progress: {
          ...currentProgress,
          completedLessonIds: nextCompletedLessonIds,
          completedSceneIds,
          currentLessonProgress:
            currentProgress.currentLessonProgress?.lessonId === lessonId &&
            currentProgress.currentLessonProgress?.sceneId === sceneId
              ? undefined
              : currentProgress.currentLessonProgress,
          learnedWordIds: shouldCompleteLessonNow
            ? addUnique(
                currentProgress.learnedWordIds,
                learnedVocabulary.map(item => item.id),
              )
            : currentProgress.learnedWordIds,
          totalXP: newTotalXP,
        },
        result: {
          leveledUp: newLevel > oldLevel,
          newLevel,
          xpGained: gainedXP,
        },
      };
    });

    recordActivity('scene', 1);
    return update.result;
  } catch {
    return { xpGained: 0, leveledUp: false, newLevel: 1 };
  }
}

export function getLessonVocabulary(lesson: Lesson) {
  return getVocabularyFromScenes(lesson.scenes);
}

export function getLessonVocabularyForLearningMode(
  lesson: Lesson,
  learningMode: LearningMode,
) {
  return getVocabularyFromScenes(
    lesson.scenes.map(scene => getSceneForLearningMode(scene, learningMode)),
  );
}

function getVocabularyFromScenes(scenes: readonly Scene[]) {
  const vocabularyById = new Map<string, VocabularyItem>();

  scenes.forEach(scene => {
    scene.vocabulary?.forEach(item => {
      vocabularyById.set(item.id, item);
    });
  });

  return Array.from(vocabularyById.values());
}

function getProgressVocabulary(
  lesson: Lesson,
  options: LearningScopeOptions,
) {
  return options.learningMode
    ? getLessonVocabularyForLearningMode(lesson, options.learningMode)
    : getLessonVocabulary(lesson);
}

export function normalizeProgress(value: unknown): LocalProgress {
  const progress = isRecord(value) ? value : {};
  const earnedStickerRecords = normalizeStickerRecords(
    progress.earnedStickerRecords,
    progress.earnedStickerIds,
  );
  const earnedStickerIds = addUnique(
    normalizeStringArray(progress.earnedStickerIds),
    earnedStickerRecords.map(record => record.stickerId),
  );

  return {
    activeThemeId: normalizeThemeId(progress.activeThemeId),
    completedLessonIds: normalizeStringArray(progress.completedLessonIds),
    completedReviewGameIds: normalizeStringArray(
      progress.completedReviewGameIds,
    ),
    completedSceneIds: normalizeStringArray(progress.completedSceneIds),
    earnedStickerIds,
    earnedStickerRecords,
    earnedAchievementRecords: normalizeAchievementRecords(
      progress.earnedAchievementRecords,
    ),
    learnedWordIds: normalizeStringArray(progress.learnedWordIds),
    vocabularyProgress: normalizeVocabularyProgress(
      progress.vocabularyProgress,
    ),
    totalXP: normalizeNonNegativeNumber(progress.totalXP),
    currentLessonProgress: normalizeCurrentLessonProgress(
      progress.currentLessonProgress,
    ),
    updatedAt:
      typeof progress.updatedAt === 'string' ? progress.updatedAt : undefined,
  };
}

function notifyProgressChanged(change: ProgressChange) {
  for (const listener of progressListeners) {
    try {
      listener(change);
    } catch {
      // Progress persistence must not fail because a sync listener failed.
    }
  }
}

function normalizeThemeId(value: unknown) {
  if (
    typeof value === 'string' &&
    themes.some(theme => theme.id === value)
  ) {
    return value;
  }

  return DEFAULT_THEME_ID;
}

function normalizeCurrentLessonProgress(value: unknown) {
  const progress = value as LocalProgress['currentLessonProgress'];

  if (
    progress &&
    typeof progress.lessonId === 'string' &&
    typeof progress.sceneId === 'string' &&
    typeof progress.stepId === 'string'
  ) {
    return progress;
  }

  return undefined;
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function normalizeVocabularyProgress(value: unknown) {
  if (!isRecord(value)) {
    return {};
  }

  const normalized: Record<string, WordProgress> = {};

  Object.entries(value).forEach(([key, item]) => {
    if (!isRecord(item)) {
      return;
    }

    const wordId =
      typeof item.wordId === 'string' && item.wordId.length > 0
        ? item.wordId
        : key;
    if (wordId.length === 0) {
      return;
    }

    normalized[wordId] = {
      correctCount: normalizeNonNegativeNumber(item.correctCount),
      lastReviewedAt:
        typeof item.lastReviewedAt === 'string'
          ? item.lastReviewedAt
          : new Date(0).toISOString(),
      masteryLevel: Math.min(
        3,
        normalizeNonNegativeNumber(item.masteryLevel),
      ),
      wordId,
      wrongCount: normalizeNonNegativeNumber(item.wrongCount),
    };
  });

  return normalized;
}

function normalizeNonNegativeNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, value)
    : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function addUnique(existingIds: string[], nextIds: string[]) {
  return Array.from(new Set([...existingIds, ...nextIds]));
}

function addStickerRecord(
  existingRecords: EarnedStickerRecord[],
  nextRecord: EarnedStickerRecord,
) {
  if (
    existingRecords.some(record => record.stickerId === nextRecord.stickerId)
  ) {
    return existingRecords;
  }

  return [...existingRecords, nextRecord];
}

function addAchievementRecords(
  existingRecords: EarnedAchievementRecord[],
  nextRecords: EarnedAchievementRecord[],
) {
  const seenAchievementIds = new Set(
    existingRecords.map(record => record.achievementId),
  );
  const addedRecords: EarnedAchievementRecord[] = [];

  nextRecords.forEach(record => {
    if (seenAchievementIds.has(record.achievementId)) {
      return;
    }

    seenAchievementIds.add(record.achievementId);
    addedRecords.push(record);
  });

  return [...existingRecords, ...addedRecords];
}

function normalizeAchievementRecords(value: unknown) {
  const records: EarnedAchievementRecord[] = [];
  const seenAchievementIds = new Set<string>();

  if (!Array.isArray(value)) {
    return records;
  }

  value.forEach(item => {
    const record = item as Partial<EarnedAchievementRecord>;

    if (
      !record ||
      typeof record !== 'object' ||
      typeof record.achievementId !== 'string' ||
      typeof record.stickerId !== 'string' ||
      seenAchievementIds.has(record.achievementId)
    ) {
      return;
    }

    seenAchievementIds.add(record.achievementId);
    records.push({
      achievementId: record.achievementId,
      earnedAt:
        typeof record.earnedAt === 'string' ? record.earnedAt : undefined,
      stickerId: record.stickerId,
    });
  });

  return records;
}

function normalizeStickerRecords(
  value: unknown,
  earnedStickerIdsValue: unknown,
) {
  const records: EarnedStickerRecord[] = [];
  const seenStickerIds = new Set<string>();

  if (Array.isArray(value)) {
    value.forEach(item => {
      const record = item as Partial<EarnedStickerRecord>;

      if (
        !record ||
        typeof record !== 'object' ||
        typeof record.stickerId !== 'string' ||
        seenStickerIds.has(record.stickerId)
      ) {
        return;
      }

      seenStickerIds.add(record.stickerId);
      records.push({
        earnedAt:
          typeof record.earnedAt === 'string' ? record.earnedAt : undefined,
        lessonId:
          typeof record.lessonId === 'string' ? record.lessonId : undefined,
        source: record.source === 'lesson' ? 'lesson' : 'legacy',
        stickerId: record.stickerId,
      });
    });
  }

  normalizeStringArray(earnedStickerIdsValue).forEach(stickerId => {
    if (seenStickerIds.has(stickerId)) {
      return;
    }

    seenStickerIds.add(stickerId);
    records.push({
      source: 'legacy',
      stickerId,
    });
  });

  return records;
}

export function calculateLevelFromXP(xp: number): number {
  if (xp < 10) return 1;
  if (xp < 25) return 2;
  if (xp < 45) return 3;
  if (xp < 70) return 4;
  if (xp < 100) return 5;
  if (xp < 135) return 6;
  if (xp < 175) return 7;
  return 8 + Math.floor((xp - 175) / 50);
}

export function getLevelProgress(xp: number) {
  const level = calculateLevelFromXP(xp);
  let currentLevelXP = 0;
  let nextLevelXP = 0;

  if (level === 1) { currentLevelXP = 0; nextLevelXP = 10; }
  else if (level === 2) { currentLevelXP = 10; nextLevelXP = 25; }
  else if (level === 3) { currentLevelXP = 25; nextLevelXP = 45; }
  else if (level === 4) { currentLevelXP = 45; nextLevelXP = 70; }
  else if (level === 5) { currentLevelXP = 70; nextLevelXP = 100; }
  else if (level === 6) { currentLevelXP = 100; nextLevelXP = 135; }
  else if (level === 7) { currentLevelXP = 135; nextLevelXP = 175; }
  else {
    const baseXP = 175 + (level - 8) * 50;
    currentLevelXP = baseXP;
    nextLevelXP = baseXP + 50;
  }

  return {
    level,
    xpInLevel: xp - currentLevelXP,
    xpNeeded: nextLevelXP - currentLevelXP,
    progressPercent: Math.min(100, Math.max(0, Math.round(((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100))),
  };
}

export async function addXP(amount: number) {
  try {
    if (amount <= 0) return;
    await updateProgress(currentProgress => ({
      ...currentProgress,
      totalXP: currentProgress.totalXP + amount,
    }));
  } catch {
    // best effort
  }
}
