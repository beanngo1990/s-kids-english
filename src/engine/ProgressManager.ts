import AsyncStorage from '@react-native-async-storage/async-storage';

import { getLessonReward } from '../data/rewards';
import type { Lesson, VocabularyItem } from '../types/lesson';

const PROGRESS_STORAGE_KEY = '@skidsenglish/progress/v1';

export type LocalProgress = {
  completedLessonIds: string[];
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
  completedLessonIds: [],
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

    return await saveProgress({
      ...currentProgress,
      completedLessonIds: addUnique(currentProgress.completedLessonIds, [
        lesson.id,
      ]),
      completedSceneIds: addUnique(
        currentProgress.completedSceneIds,
        lesson.scenes.map(scene => scene.id),
      ),
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

export async function saveSceneProgress(sceneId: string) {
  try {
    const currentProgress = await getProgress();
    await saveProgress({
      ...currentProgress,
      completedSceneIds: addUnique(currentProgress.completedSceneIds, [sceneId]),
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
    completedLessonIds: normalizeStringArray(progress.completedLessonIds),
    completedSceneIds: normalizeStringArray(progress.completedSceneIds),
    earnedStickerIds: normalizeStringArray(progress.earnedStickerIds),
    learnedWordIds: normalizeStringArray(progress.learnedWordIds),
    currentLessonProgress: progress.currentLessonProgress,
    updatedAt:
      typeof progress.updatedAt === 'string' ? progress.updatedAt : undefined,
  };
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
