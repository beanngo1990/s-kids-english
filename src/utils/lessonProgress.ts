import type { Scene } from '../types/lesson';

export function getSceneProgressId(lessonId: string, sceneId: string) {
  return `${lessonId}:${sceneId}`;
}

export function isSceneProgressComplete(
  completedSceneIds: Set<string>,
  lessonId: string | undefined,
  sceneId: string,
) {
  if (lessonId && completedSceneIds.has(getSceneProgressId(lessonId, sceneId))) {
    return true;
  }

  return completedSceneIds.has(sceneId);
}

export function getNextScene(
  scenes: Scene[],
  completedSceneIds: Set<string>,
  lessonId?: string,
) {
  return (
    scenes.find(
      scene => !isSceneProgressComplete(completedSceneIds, lessonId, scene.id),
    ) ?? scenes[0]
  );
}

export function isLessonComplete(
  scenes: Scene[],
  completedSceneIds: Set<string>,
  lessonId?: string,
) {
  return (
    scenes.length > 0 &&
    scenes.every(scene =>
      isSceneProgressComplete(completedSceneIds, lessonId, scene.id),
    )
  );
}

export function getCompletedSceneCount(
  scenes: Scene[],
  completedSceneIds: Set<string>,
  lessonId?: string,
) {
  return scenes.filter(scene =>
    isSceneProgressComplete(completedSceneIds, lessonId, scene.id),
  ).length;
}

export function isSceneUnlocked(
  scenes: Scene[],
  scene: Scene,
  completedSceneIds: Set<string>,
  lessonId?: string,
) {
  if (isSceneProgressComplete(completedSceneIds, lessonId, scene.id)) {
    return true;
  }

  return getNextScene(scenes, completedSceneIds, lessonId)?.id === scene.id;
}
