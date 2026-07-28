import { useEffect, useState } from 'react';

import {
  canAccessLesson,
  canAccessReview,
  canAccessScene,
} from './ContentAccessPolicy';
import { useMonetizationSnapshot } from './MonetizationManager';

type ContentAccessTarget =
  | Readonly<{
      kind: 'lesson';
      lessonId: string;
    }>
  | Readonly<{
      kind: 'review';
      lessonId: string;
    }>
  | Readonly<{
      kind: 'scene';
      lessonId: string;
      sceneId: string;
    }>;

type ContentAccessDecision = Readonly<{
  isAccessGranted: boolean;
  isResolving: boolean;
}>;

export function useContentAccess(
  target: ContentAccessTarget,
  options?: Readonly<{ latchWhenGranted?: boolean }>,
): ContentAccessDecision {
  const monetizationSnapshot = useMonetizationSnapshot();
  const targetKey = getTargetKey(target);
  const canAccessNow = getCanAccessNow(target, monetizationSnapshot);
  const latchWhenGranted = options?.latchWhenGranted === true;
  const [latchedTargetKey, setLatchedTargetKey] = useState<string | null>(() =>
    latchWhenGranted && canAccessNow ? targetKey : null,
  );

  useEffect(() => {
    if (latchWhenGranted && canAccessNow) {
      setLatchedTargetKey(targetKey);
    }
  }, [canAccessNow, latchWhenGranted, targetKey]);

  const hasLatchedAccess =
    latchWhenGranted && latchedTargetKey === targetKey;
  const isAccessGranted = canAccessNow || hasLatchedAccess;

  return {
    isAccessGranted,
    isResolving:
      !isAccessGranted && monetizationSnapshot.status === 'initializing',
  };
}

function getCanAccessNow(
  target: ContentAccessTarget,
  monetizationSnapshot: ReturnType<typeof useMonetizationSnapshot>,
) {
  switch (target.kind) {
    case 'lesson':
      return canAccessLesson(target.lessonId, monetizationSnapshot);
    case 'review':
      return canAccessReview(target.lessonId, monetizationSnapshot);
    case 'scene':
      return canAccessScene(
        target.lessonId,
        target.sceneId,
        monetizationSnapshot,
      );
  }
}

function getTargetKey(target: ContentAccessTarget) {
  switch (target.kind) {
    case 'scene':
      return `${target.kind}:${target.lessonId}:${target.sceneId}`;
    case 'lesson':
    case 'review':
      return `${target.kind}:${target.lessonId}`;
  }
}
