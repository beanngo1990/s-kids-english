export const FREE_LESSON_IDS = ['morning-routine', 'at-school'] as const;

export type ContentAccessStatus =
  | 'initializing'
  | 'signedOut'
  | 'free'
  | 'premium'
  | 'unavailable';

export type ContentAccessSnapshot = Readonly<{
  status: ContentAccessStatus;
}>;

const freeLessonIds = new Set<string>(FREE_LESSON_IDS);

export function isFreeLesson(lessonId: string): boolean {
  return freeLessonIds.has(lessonId);
}

export function canAccessLesson(
  lessonId: string,
  monetizationSnapshot: ContentAccessSnapshot,
): boolean {
  return (
    isFreeLesson(lessonId) || monetizationSnapshot.status === 'premium'
  );
}

export function canAccessScene(
  lessonId: string,
  _sceneId: string,
  monetizationSnapshot: ContentAccessSnapshot,
): boolean {
  return canAccessLesson(lessonId, monetizationSnapshot);
}

export function canAccessReview(
  lessonId: string,
  monetizationSnapshot: ContentAccessSnapshot,
): boolean {
  return canAccessLesson(lessonId, monetizationSnapshot);
}
