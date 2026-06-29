import { morningRoutineLesson } from '../src/data/lessons/morningRoutine';
import {
  getCompletedSceneCount,
  getNextScene,
  isLessonComplete,
  isSceneUnlocked,
} from '../src/utils/lessonProgress';

test('lesson progress unlocks only the first incomplete scene', () => {
  const scenes = morningRoutineLesson.scenes;
  const emptyProgress = new Set<string>();

  expect(getNextScene(scenes, emptyProgress)?.id).toBe(scenes[0].id);
  expect(isSceneUnlocked(scenes, scenes[0], emptyProgress)).toBe(true);
  expect(isSceneUnlocked(scenes, scenes[1], emptyProgress)).toBe(false);

  const afterFirstScene = new Set([scenes[0].id]);

  expect(getCompletedSceneCount(scenes, afterFirstScene)).toBe(1);
  expect(getNextScene(scenes, afterFirstScene)?.id).toBe(scenes[1].id);
  expect(isSceneUnlocked(scenes, scenes[0], afterFirstScene)).toBe(true);
  expect(isSceneUnlocked(scenes, scenes[1], afterFirstScene)).toBe(true);
  expect(isSceneUnlocked(scenes, scenes[2], afterFirstScene)).toBe(false);

  const completedProgress = new Set(scenes.map(scene => scene.id));

  expect(isLessonComplete(scenes, completedProgress)).toBe(true);
  expect(scenes.every(scene => isSceneUnlocked(scenes, scene, completedProgress))).toBe(
    true,
  );
});
