import AsyncStorage from '@react-native-async-storage/async-storage';

import { getLessonReward } from '../data/rewards';
import type { Lesson, VocabularyItem } from '../types/lesson';

const PROGRESS_STORAGE_KEY = '@skidsenglish/progress/v1';

export type LocalProgress = {
  completedLessonIds: string[];
  completedSceneIds: string[];
  learnedWordIds: string[];
  earnedStickerIds: string[];
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
  const currentProgress = await getProgress();
  const lessonReward = getLessonReward(lesson.id);
  const learnedVocabulary = getLessonVocabulary(lesson);

  return saveProgress({
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
    updatedAt: currentProgress.updatedAt,
  });
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
