import { FREE_LESSON_IDS } from '../engine/ContentAccessPolicy';
import type { LocalProgress } from '../engine/ProgressManager';

type FreeContentProgressInput =
  | Pick<LocalProgress, 'completedLessonIds'>
  | null
  | undefined;

export type FreeContentProgress = Readonly<{
  completed: number;
  isComplete: boolean;
  total: number;
}>;

export function getFreeContentProgress(
  progress: FreeContentProgressInput,
): FreeContentProgress {
  const completedLessonIds = new Set(progress?.completedLessonIds ?? []);
  const completed = FREE_LESSON_IDS.filter(lessonId =>
    completedLessonIds.has(lessonId),
  ).length;
  const total = FREE_LESSON_IDS.length;

  return {
    completed,
    isComplete: total > 0 && completed === total,
    total,
  };
}

export function isFreeContentComplete(
  progress: FreeContentProgressInput,
): boolean {
  return getFreeContentProgress(progress).isComplete;
}
