import type { Lesson } from '../types/lesson';
import { assertValidLessons } from './lessonValidation';
import { afternoonHomeLesson } from './lessons/afternoonHome';
import { atSchoolLesson } from './lessons/atSchool';
import { homePlayLesson } from './lessons/homePlay';
import { lunchTimeLesson } from './lessons/lunchTime';
import { morningRoutineLesson } from './lessons/morningRoutine';
import { playtimeLesson } from './lessons/playtime';
import { snackTimeLesson } from './lessons/snackTime';

const lessonCatalog: Lesson[] = [
  morningRoutineLesson,
  atSchoolLesson,
  playtimeLesson,
  lunchTimeLesson,
  afternoonHomeLesson,
  snackTimeLesson,
  homePlayLesson,
];

assertValidLessons(lessonCatalog);

export const lessons = lessonCatalog;

export {
  afternoonHomeLesson,
  atSchoolLesson,
  homePlayLesson,
  lunchTimeLesson,
  morningRoutineLesson,
  playtimeLesson,
  snackTimeLesson,
};
