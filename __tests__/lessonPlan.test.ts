import {
  getLessonCompletionPercent,
  getLessonPlanSelection,
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

test('lesson plan selection keeps preset and custom states mutually exclusive', () => {
  const allLessonIds = ['lesson-a', 'lesson-b', 'lesson-c'];
  const gentleLessonIds = ['lesson-a', 'lesson-b'];

  expect(
    getLessonPlanSelection(allLessonIds, allLessonIds, gentleLessonIds, false),
  ).toBe('full');
  expect(
    getLessonPlanSelection(
      gentleLessonIds,
      allLessonIds,
      gentleLessonIds,
      false,
    ),
  ).toBe('gentle');
  expect(
    getLessonPlanSelection(['lesson-a'], allLessonIds, gentleLessonIds, false),
  ).toBe('custom');
  expect(
    getLessonPlanSelection(allLessonIds, allLessonIds, gentleLessonIds, true),
  ).toBe('custom');
});
