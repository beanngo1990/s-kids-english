import {
  getLessonCompletionPercent,
  haveSameLessonIds,
} from '../src/utils/lessonPlan';

test('lesson plan completion percent reflects completed enabled lessons', () => {
  expect(getLessonCompletionPercent(1, 11)).toBe(9);
  expect(getLessonCompletionPercent(11, 11)).toBe(100);
  expect(getLessonCompletionPercent(0, 0)).toBe(0);
});

test('lesson plan id comparison ignores order but not missing lessons', () => {
  expect(haveSameLessonIds(['lesson-b', 'lesson-a'], ['lesson-a', 'lesson-b']))
    .toBe(true);
  expect(haveSameLessonIds(['lesson-a', 'lesson-a'], ['lesson-a', 'lesson-b']))
    .toBe(false);
});
