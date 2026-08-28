import {
  getEnabledLessonIds,
  getLessonCompletionPercent,
  getLessonPlanSelection,
  getRecommendedLessonIds,
  haveSameLessonIds,
  isOnlyVisibleLessonInTheme,
} from '../src/utils/lessonPlan';

test('lesson plan completion percent reflects completed enabled lessons', () => {
  expect(getLessonCompletionPercent(1, 11)).toBe(9);
  expect(getLessonCompletionPercent(11, 11)).toBe(100);
  expect(getLessonCompletionPercent(0, 0)).toBe(0);
});

test('lesson plan id comparison ignores order but not missing lessons', () => {
  expect(
    haveSameLessonIds(['lesson-b', 'lesson-a'], ['lesson-a', 'lesson-b']),
  ).toBe(true);
  expect(
    haveSameLessonIds(['lesson-a', 'lesson-a'], ['lesson-a', 'lesson-b']),
  ).toBe(false);
});

test('recommended lesson plan keeps one starting lesson from each theme', () => {
  expect(
    getRecommendedLessonIds([
      { lessonIds: ['theme-a-1', 'theme-a-2'] },
      { lessonIds: [] },
      { lessonIds: ['theme-b-1', 'theme-b-2'] },
      { lessonIds: ['theme-a-1', 'theme-c-1'] },
    ]),
  ).toEqual(['theme-a-1', 'theme-b-1', 'theme-c-1']);
});

test('lesson plan selection infers recommended, all and custom states', () => {
  const allLessonIds = ['lesson-a', 'lesson-b', 'lesson-c'];
  const recommendedLessonIds = ['lesson-a', 'lesson-b'];

  expect(getLessonPlanSelection(undefined, recommendedLessonIds)).toBe('all');
  expect(
    getLessonPlanSelection(recommendedLessonIds, recommendedLessonIds),
  ).toBe('recommended');
  expect(getLessonPlanSelection(['lesson-a'], recommendedLessonIds)).toBe(
    'custom',
  );
  expect(getLessonPlanSelection(allLessonIds, recommendedLessonIds)).toBe(
    'custom',
  );
  expect(
    getLessonPlanSelection(undefined, recommendedLessonIds, ['theme-a']),
  ).toBe('custom');
});

test('filters lessons from disabled themes without changing stored selections', () => {
  const storedLessonIds = ['theme-a-1', 'theme-a-2', 'theme-b-1'];

  expect(
    getEnabledLessonIds(
      storedLessonIds,
      storedLessonIds,
      [
        { id: 'theme-a', lessonIds: ['theme-a-1', 'theme-a-2'] },
        { id: 'theme-b', lessonIds: ['theme-b-1'] },
      ],
      ['theme-a'],
    ),
  ).toEqual(['theme-b-1']);
  expect(storedLessonIds).toEqual([
    'theme-a-1',
    'theme-a-2',
    'theme-b-1',
  ]);
});

test('protects only the final visible lesson inside its theme', () => {
  const themeLessonIds = ['lesson-a', 'lesson-b', 'lesson-c'];

  expect(
    isOnlyVisibleLessonInTheme('lesson-a', themeLessonIds, ['lesson-a']),
  ).toBe(true);
  expect(
    isOnlyVisibleLessonInTheme('lesson-a', themeLessonIds, [
      'lesson-a',
      'lesson-b',
    ]),
  ).toBe(false);
  expect(
    isOnlyVisibleLessonInTheme('lesson-c', themeLessonIds, ['lesson-a']),
  ).toBe(false);
});
