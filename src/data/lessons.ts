import type { Lesson } from '../types/lesson';
import { assertValidLessons } from './lessonValidation';
import { assertValidThemes } from './themeValidation';
import { themes } from './themes';
import { afterDinnerCleanupLesson } from './lessons/afterDinnerCleanup';
import { afternoonBathLesson } from './lessons/afternoonBath';
import { afternoonHomeLesson } from './lessons/afternoonHome';
import { animalTripLesson } from './lessons/animalTrip';
import { atSchoolLesson } from './lessons/atSchool';
import { bedtimeLesson } from './lessons/bedtime';
import { beachDayLesson } from './lessons/beachDay';
import { birthdayPartyLesson } from './lessons/birthdayParty';
import { doctorVisitLesson } from './lessons/doctorVisit';
import { familyDinnerLesson } from './lessons/familyDinner';
import { grandparentsVisitLesson } from './lessons/grandparentsVisit';
import { homePlayLesson } from './lessons/homePlay';
import { libraryVisitLesson } from './lessons/libraryVisit';
import { lunchTimeLesson } from './lessons/lunchTime';
import { morningRoutineLesson } from './lessons/morningRoutine';
import { parkVisitLesson } from './lessons/parkVisit';
import { playtimeLesson } from './lessons/playtime';
import { snackTimeLesson } from './lessons/snackTime';
import { supermarketTripLesson } from './lessons/supermarketTrip';

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
  supermarketTripLesson,
  parkVisitLesson,
  beachDayLesson,
  animalTripLesson,
  libraryVisitLesson,
  doctorVisitLesson,
  birthdayPartyLesson,
  grandparentsVisitLesson,
];

assertValidLessons(lessonCatalog);
assertValidThemes(themes, lessonCatalog);

export const lessons = lessonCatalog;

export {
  afterDinnerCleanupLesson,
  afternoonBathLesson,
  afternoonHomeLesson,
  animalTripLesson,
  atSchoolLesson,
  bedtimeLesson,
  beachDayLesson,
  birthdayPartyLesson,
  doctorVisitLesson,
  familyDinnerLesson,
  grandparentsVisitLesson,
  homePlayLesson,
  libraryVisitLesson,
  lunchTimeLesson,
  morningRoutineLesson,
  parkVisitLesson,
  playtimeLesson,
  snackTimeLesson,
  supermarketTripLesson,
};
