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

export type LocalProgress = {
  activeThemeId: string;
  completedLessonIds: string[];
  completedReviewGameIds: string[];
  completedSceneIds: string[];
  learnedWordIds: string[];
  earnedStickerIds: string[];
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

    return await saveProgress({
      ...currentProgress,
      completedLessonIds: addUnique(currentProgress.completedLessonIds, [
        lesson.id,
      ]),
      completedReviewGameIds: lesson.reviewGame
        ? addUnique(currentProgress.completedReviewGameIds, [
            lesson.reviewGame.id,
          ])
        : currentProgress.completedReviewGameIds,
      completedSceneIds,
      earnedStickerIds: addUnique(
        currentProgress.earnedStickerIds,
        lessonReward ? [lessonReward.stickerId] : [],
      ),
      learnedWordIds: addUnique(
        currentProgress.learnedWordIds,
        learnedVocabulary.map(item => item.id),
      ),
      currentLessonProgress: undefined,
    });
  } catch {
    return emptyProgress;
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
      currentLessonProgress:
        currentProgress.currentLessonProgress?.lessonId === lessonId &&
        currentProgress.currentLessonProgress?.sceneId === sceneId
          ? undefined
          : currentProgress.currentLessonProgress,
    });
  } catch {
    // best effort
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
