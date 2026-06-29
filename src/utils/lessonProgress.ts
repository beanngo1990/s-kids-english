import type { Scene } from '../types/lesson';

export function getNextScene(
  scenes: Scene[],
  completedSceneIds: Set<string>,
) {
  return scenes.find(scene => !completedSceneIds.has(scene.id)) ?? scenes[0];
}

export function isLessonComplete(
  scenes: Scene[],
  completedSceneIds: Set<string>,
) {
  return scenes.length > 0 && scenes.every(scene => completedSceneIds.has(scene.id));
}

export function getCompletedSceneCount(
  scenes: Scene[],
  completedSceneIds: Set<string>,
) {
  return scenes.filter(scene => completedSceneIds.has(scene.id)).length;
}

export function isSceneUnlocked(
  scenes: Scene[],
  scene: Scene,
  completedSceneIds: Set<string>,
) {
  if (completedSceneIds.has(scene.id)) {
    return true;
  }

  return getNextScene(scenes, completedSceneIds)?.id === scene.id;
}
