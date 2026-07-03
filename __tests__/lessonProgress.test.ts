import { morningRoutineLesson } from '../src/data/lessons/morningRoutine';
import {
  getSceneProgressId,
  getCompletedSceneCount,
  getNextScene,
  isLessonComplete,
  isSceneProgressComplete,
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

test('lesson progress supports composite scene ids per lesson', () => {
  const lesson = morningRoutineLesson;
  const scenes = lesson.scenes;
  const completedProgress = new Set([
    getSceneProgressId(lesson.id, scenes[0].id),
  ]);

  expect(
    isSceneProgressComplete(completedProgress, lesson.id, scenes[0].id),
  ).toBe(true);
  expect(getCompletedSceneCount(scenes, completedProgress, lesson.id)).toBe(1);
  expect(getNextScene(scenes, completedProgress, lesson.id)?.id).toBe(
    scenes[1].id,
  );
  expect(
    isSceneUnlocked(scenes, scenes[1], completedProgress, lesson.id),
  ).toBe(true);
});
