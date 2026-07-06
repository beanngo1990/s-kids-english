import AsyncStorage from '@react-native-async-storage/async-storage';

import { lessons } from '../data/lessons';
import { getLessonReward } from '../data/rewards';
import { DEFAULT_THEME_ID, themes } from '../data/themes';
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

export type LocalProgress = {
  activeThemeId: string;
  completedLessonIds: string[];
  completedReviewGameIds: string[];
  completedSceneIds: string[];
  learnedWordIds: string[];
  earnedStickerIds: string[];
  vocabularyProgress: Record<string, WordProgress>;
  totalXP: number;
  currentLessonProgress?: {
    lessonId: string;
    sceneId: string;
    stepId: string;
  };
  updatedAt?: string;
};

const emptyProgress: LocalProgress = {
  activeThemeId: DEFAULT_THEME_ID,
  completedLessonIds: [],
  completedReviewGameIds: [],
  completedSceneIds: [],
  earnedStickerIds: [],
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

export async function completeLessonProgress(lesson: Lesson) {
  try {
    const currentProgress = await getProgress();
    const lessonReward = getLessonReward(lesson.id);
    const learnedVocabulary = getLessonVocabulary(lesson);
    const completedSceneIds = addUnique(
      currentProgress.completedSceneIds,
      lesson.scenes.map(scene => getSceneProgressId(lesson.id, scene.id)),
    );

    const nextCompletedReviewGameIds = lesson.reviewGame
      ? addUnique(currentProgress.completedReviewGameIds, [
          lesson.reviewGame.id,
        ])
      : currentProgress.completedReviewGameIds;
      
    const isNewReviewGame = nextCompletedReviewGameIds.length > currentProgress.completedReviewGameIds.length;
    const gainedXP = isNewReviewGame ? 2 : 1; // 2 for new, 1 for replay

    await saveProgress({
      ...currentProgress,
      completedLessonIds: addUnique(currentProgress.completedLessonIds, [
        lesson.id,
      ]),
      completedReviewGameIds: nextCompletedReviewGameIds,
      completedSceneIds,
      earnedStickerIds: addUnique(
        currentProgress.earnedStickerIds,
        lessonReward ? [lessonReward.stickerId] : [],
      ),
      learnedWordIds: addUnique(
        currentProgress.learnedWordIds,
        learnedVocabulary.map(item => item.id),
      ),
      totalXP: currentProgress.totalXP + gainedXP,
      currentLessonProgress: undefined,
    });
    
    return { xpGained: gainedXP };
  } catch {
    return { xpGained: 0 };
  }
}

export async function saveActiveThemeId(activeThemeId: string) {
  const currentProgress = await getProgress();

  return saveProgress({
    ...currentProgress,
    activeThemeId,
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
    await saveProgress({
      ...currentProgress,
      learnedWordIds: addUnique(currentProgress.learnedWordIds, [wordId]),
    });
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

export async function saveSceneProgress(lessonId: string, sceneId: string) {
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
    const lessonReward = shouldCompleteLessonNow
      ? getLessonReward(lessonId)
      : undefined;
    const learnedVocabulary = shouldCompleteLessonNow && lesson
      ? getLessonVocabulary(lesson)
      : [];

    const isNewScene = completedSceneIds.length > currentProgress.completedSceneIds.length;
    const gainedXP = isNewScene ? 3 : 1; // 3 for new, 1 for replay

    await saveProgress({
      ...currentProgress,
      completedLessonIds: shouldCompleteLessonNow
        ? addUnique(currentProgress.completedLessonIds, [lessonId])
        : currentProgress.completedLessonIds,
      completedSceneIds,
      earnedStickerIds: shouldCompleteLessonNow
        ? addUnique(
            currentProgress.earnedStickerIds,
            lessonReward ? [lessonReward.stickerId] : [],
          )
        : currentProgress.earnedStickerIds,
      learnedWordIds: shouldCompleteLessonNow
        ? addUnique(
            currentProgress.learnedWordIds,
            learnedVocabulary.map(item => item.id),
          )
        : currentProgress.learnedWordIds,
      totalXP: currentProgress.totalXP + gainedXP,
      currentLessonProgress:
        currentProgress.currentLessonProgress?.lessonId === lessonId &&
        currentProgress.currentLessonProgress?.sceneId === sceneId
          ? undefined
          : currentProgress.currentLessonProgress,
    });
    
    return { xpGained: gainedXP };
  } catch {
    return { xpGained: 0 };
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

  return {
    activeThemeId: normalizeThemeId(progress.activeThemeId),
    completedLessonIds: normalizeStringArray(progress.completedLessonIds),
    completedReviewGameIds: normalizeStringArray(
      progress.completedReviewGameIds,
    ),
    completedSceneIds: normalizeStringArray(progress.completedSceneIds),
    earnedStickerIds: normalizeStringArray(progress.earnedStickerIds),
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
