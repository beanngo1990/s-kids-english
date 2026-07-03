import type { Lesson } from '../types/lesson';
import { assertValidLessons } from './lessonValidation';
import { assertValidThemes } from './themeValidation';
import { themes } from './themes';
import { afterDinnerCleanupLesson } from './lessons/afterDinnerCleanup';
import { afternoonBathLesson } from './lessons/afternoonBath';
import { afternoonHomeLesson } from './lessons/afternoonHome';
import { atSchoolLesson } from './lessons/atSchool';
import { bedtimeLesson } from './lessons/bedtime';
import { familyDinnerLesson } from './lessons/familyDinner';
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
  afternoonBathLesson,
  familyDinnerLesson,
  afterDinnerCleanupLesson,
  bedtimeLesson,
];

assertValidLessons(lessonCatalog);
assertValidThemes(themes, lessonCatalog);

export const lessons = lessonCatalog;

export {
  afterDinnerCleanupLesson,
  afternoonBathLesson,
  afternoonHomeLesson,
  atSchoolLesson,
  bedtimeLesson,
  familyDinnerLesson,
  homePlayLesson,
  lunchTimeLesson,
  morningRoutineLesson,
  playtimeLesson,
  snackTimeLesson,
};
