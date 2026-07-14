import AsyncStorage from '@react-native-async-storage/async-storage';

import { lessons } from '../data/lessons';
import { getLessonReward, type LessonReward } from '../data/rewards';
import { DEFAULT_THEME_ID, themes } from '../data/themes';
import { recordActivity } from './DailyActivityTracker';
import type { Lesson, VocabularyItem } from '../types/lesson';
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

export async function getProgress(): Promise<LocalProgress> {
  const rawProgress = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);

  if (!rawProgress) {
    return emptyProgress;
  }

  return normalizeProgress(JSON.parse(rawProgress));
}

export async function saveProgress(progress: LocalProgress) {
  const nextProgress = normalizeProgress({
    ...progress,
    updatedAt: new Date().toISOString(),
  });

  await AsyncStorage.setItem(
    PROGRESS_STORAGE_KEY,
    JSON.stringify(nextProgress),
  );

  return nextProgress;
}

export async function resetProgress() {
  await AsyncStorage.removeItem(PROGRESS_STORAGE_KEY);
}

export async function completeLessonProgress(
  lesson: Lesson,
): Promise<ProgressCompletionResult> {
  try {
    const currentProgress = await getProgress();
    const learnedVocabulary = getLessonVocabulary(lesson);
    const completedSceneIds = addUnique(
      currentProgress.completedSceneIds,
      lesson.scenes.map(scene => getSceneProgressId(lesson.id, scene.id)),
    );

    const nextCompletedLessonIds = addUnique(currentProgress.completedLessonIds, [
      lesson.id,
    ]);
    const nextCompletedReviewGameIds = lesson.reviewGame
      ? addUnique(currentProgress.completedReviewGameIds, [
          lesson.reviewGame.id,
        ])
      : currentProgress.completedReviewGameIds;
      
    const isNewReviewGame = nextCompletedReviewGameIds.length > currentProgress.completedReviewGameIds.length;
    const gainedXP = isNewReviewGame ? 2 : 1;

    const oldLevel = calculateLevelFromXP(currentProgress.totalXP);
    const newTotalXP = currentProgress.totalXP + gainedXP;
    const newLevel = calculateLevelFromXP(newTotalXP);
    const leveledUp = newLevel > oldLevel;
    const lessonReward = getLessonReward(lesson.id);
    const unlockedSticker =
      lessonReward &&
      nextCompletedLessonIds.includes(lesson.id) &&
      !currentProgress.earnedStickerIds.includes(lessonReward.stickerId)
        ? lessonReward
        : undefined;
    const earnedAt = unlockedSticker ? new Date().toISOString() : undefined;
    
    await saveProgress({
      ...currentProgress,
      completedLessonIds: nextCompletedLessonIds,
      completedReviewGameIds: nextCompletedReviewGameIds,
      completedSceneIds,
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
      currentLessonProgress: undefined,
    });
    
    return { xpGained: gainedXP, leveledUp, newLevel, unlockedSticker };
  } catch {
    return { xpGained: 0, leveledUp: false, newLevel: 1 };
  }
}

export async function saveActiveThemeId(activeThemeId: string) {
  const currentProgress = await getProgress();

  return saveProgress({
    ...currentProgress,
    activeThemeId,
  });
}

export async function saveEarnedAchievementRecords(
  records: EarnedAchievementRecord[],
) {
  if (records.length === 0) {
    return getProgress();
  }

  const currentProgress = await getProgress();

  return saveProgress({
    ...currentProgress,
    earnedAchievementRecords: addAchievementRecords(
      currentProgress.earnedAchievementRecords,
      records,
    ),
  });
}

export async function saveCurrentStepProgress(
  lessonId: string,
  sceneId: string,
  stepId: string
) {
  try {
    const currentProgress = await getProgress();
    await saveProgress({
      ...currentProgress,
      currentLessonProgress: { lessonId, sceneId, stepId },
    });
  } catch {
    // best effort
  }
}

export async function saveLearnedWord(wordId: string) {
  try {
    const currentProgress = await getProgress();
    const isNew = !currentProgress.learnedWordIds.includes(wordId);
    await saveProgress({
      ...currentProgress,
      learnedWordIds: addUnique(currentProgress.learnedWordIds, [wordId]),
    });
    if (isNew) {
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
    const currentProgress = await getProgress();
    const existingWordProgress = currentProgress.vocabularyProgress[wordId] || {
      wordId,
      masteryLevel: 0,
      correctCount: 0,
      wrongCount: 0,
      lastReviewedAt: new Date().toISOString(),
    };

    const nextCorrectCount = existingWordProgress.correctCount + (isFirstTry ? 1 : 0);
    const nextWrongCount = existingWordProgress.wrongCount + (isFirstTry ? 0 : 1);
    
    // Simple mastery calculation: correct - wrong, max 3
    const score = nextCorrectCount - nextWrongCount;
    const nextMasteryLevel = Math.max(0, Math.min(3, Math.floor(score / 2)));

    const nextWordProgress: WordProgress = {
      ...existingWordProgress,
      correctCount: nextCorrectCount,
      wrongCount: nextWrongCount,
      masteryLevel: nextMasteryLevel,
      lastReviewedAt: new Date().toISOString(),
    };
    
    // Reward XP
    const gainedXP = 0; // Removing direct XP from card interactions to avoid spam // Bonus for blooming a flower!

    await saveProgress({
      ...currentProgress,
      learnedWordIds: addUnique(currentProgress.learnedWordIds, [wordId]),
      vocabularyProgress: {
        ...currentProgress.vocabularyProgress,
        [wordId]: nextWordProgress,
      },
      totalXP: currentProgress.totalXP + gainedXP,
    });
    
    return { xpGained: gainedXP };
  } catch {
    return { xpGained: 0 };
  }
}

export async function saveSceneProgress(
  lessonId: string,
  sceneId: string,
): Promise<ProgressCompletionResult> {
  try {
    const currentProgress = await getProgress();
    const lesson = lessons.find(item => item.id === lessonId);
    const completedSceneIds = addUnique(currentProgress.completedSceneIds, [
      getSceneProgressId(lessonId, sceneId),
    ]);
    const completedSceneIdSet = new Set(completedSceneIds);
    const isLessonNowComplete = Boolean(
      lesson &&
        lesson.scenes.every(scene =>
          isSceneProgressComplete(completedSceneIdSet, lesson.id, scene.id),
        ),
    );
    const shouldCompleteLessonNow = Boolean(
      isLessonNowComplete && !lesson?.reviewGame,
    );
    const learnedVocabulary = shouldCompleteLessonNow && lesson
      ? getLessonVocabulary(lesson)
      : [];

    const isNewScene = completedSceneIds.length > currentProgress.completedSceneIds.length;
    const gainedXP = isNewScene ? 3 : 1;

    const nextCompletedLessonIds = shouldCompleteLessonNow
      ? addUnique(currentProgress.completedLessonIds, [lessonId])
      : currentProgress.completedLessonIds;

    const oldLevel = calculateLevelFromXP(currentProgress.totalXP);
    const newTotalXP = currentProgress.totalXP + gainedXP;
    const newLevel = calculateLevelFromXP(newTotalXP);
    const leveledUp = newLevel > oldLevel;

    await saveProgress({
      ...currentProgress,
      completedLessonIds: nextCompletedLessonIds,
      completedSceneIds,
      learnedWordIds: shouldCompleteLessonNow
        ? addUnique(
            currentProgress.learnedWordIds,
            learnedVocabulary.map(item => item.id),
          )
        : currentProgress.learnedWordIds,
      totalXP: newTotalXP,
      currentLessonProgress:
        currentProgress.currentLessonProgress?.lessonId === lessonId &&
        currentProgress.currentLessonProgress?.sceneId === sceneId
          ? undefined
          : currentProgress.currentLessonProgress,
    });
    
    recordActivity('scene', 1);
    return { xpGained: gainedXP, leveledUp, newLevel };
  } catch {
    return { xpGained: 0, leveledUp: false, newLevel: 1 };
  }
}

export function getLessonVocabulary(lesson: Lesson) {
  const vocabularyById = new Map<string, VocabularyItem>();

  lesson.scenes.forEach(scene => {
    scene.vocabulary?.forEach(item => {
      vocabularyById.set(item.id, item);
    });
  });

  return Array.from(vocabularyById.values());
}

function normalizeProgress(value: unknown): LocalProgress {
  const progress = value as Partial<LocalProgress>;
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
    vocabularyProgress: progress.vocabularyProgress || {},
    totalXP: typeof progress.totalXP === 'number' && !Number.isNaN(progress.totalXP) ? progress.totalXP : 0,
    currentLessonProgress: normalizeCurrentLessonProgress(
      progress.currentLessonProgress,
    ),
    updatedAt:
      typeof progress.updatedAt === 'string' ? progress.updatedAt : undefined,
  };
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
    const currentProgress = await getProgress();
    await saveProgress({
      ...currentProgress,
      totalXP: currentProgress.totalXP + amount,
    });
  } catch {
    // best effort
  }
}
