import type { Lesson } from '../types/lesson';
import { assertValidLessons } from './lessonValidation';
import { atSchoolLesson } from './lessons/atSchool';
import { lunchTimeLesson } from './lessons/lunchTime';
import { morningRoutineLesson } from './lessons/morningRoutine';
import { playtimeLesson } from './lessons/playtime';

const lessonCatalog: Lesson[] = [
  morningRoutineLesson,
  atSchoolLesson,
  playtimeLesson,
  lunchTimeLesson,
];

assertValidLessons(lessonCatalog);

export const lessons = lessonCatalog;

export {
  atSchoolLesson,
  lunchTimeLesson,
  morningRoutineLesson,
  playtimeLesson,
};
