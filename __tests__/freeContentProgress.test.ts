import { FREE_LESSON_IDS } from '../src/engine/ContentAccessPolicy';
import {
  getFreeContentProgress,
  isFreeContentComplete,
} from '../src/utils/freeContentProgress';

test('tracks completion against the configured free lesson ids', () => {
  expect(getFreeContentProgress(null)).toEqual({
    completed: 0,
    isComplete: false,
    total: FREE_LESSON_IDS.length,
  });

  expect(
    getFreeContentProgress({
      completedLessonIds: [FREE_LESSON_IDS[0]],
    }),
  ).toEqual({
    completed: 1,
    isComplete: false,
    total: FREE_LESSON_IDS.length,
  });

  expect(
    isFreeContentComplete({
      completedLessonIds: [...FREE_LESSON_IDS],
    }),
  ).toBe(true);
});
