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
import { calmMyselfLesson } from './lessons/calmMyself';
import { doctorVisitLesson } from './lessons/doctorVisit';
import { dressMyselfLesson } from './lessons/dressMyself';
import { familyDinnerLesson } from './lessons/familyDinner';
import { fiveSensesLesson } from './lessons/fiveSenses';
import { gardenFriendsLesson } from './lessons/gardenFriends';
import { gardenToTableLesson } from './lessons/gardenToTable';
import { grandparentsVisitLesson } from './lessons/grandparentsVisit';
import { harvestDayLesson } from './lessons/harvestDay';
import { helpItGrowLesson } from './lessons/helpItGrow';
import { homePlayLesson } from './lessons/homePlay';
import { libraryVisitLesson } from './lessons/libraryVisit';
import { lunchTimeLesson } from './lessons/lunchTime';
import { morningRoutineLesson } from './lessons/morningRoutine';
import { myBodyLesson } from './lessons/myBody';
import { myFeelingsLesson } from './lessons/myFeelings';
import { parkVisitLesson } from './lessons/parkVisit';
import { personalCareLesson } from './lessons/personalCare';
import { plantASeedLesson } from './lessons/plantASeed';
import { playtimeLesson } from './lessons/playtime';
import { snackTimeLesson } from './lessons/snackTime';
import { speakingUpLesson } from './lessons/speakingUp';
import { supermarketTripLesson } from './lessons/supermarketTrip';
import { toiletRoutineLesson } from './lessons/toiletRoutine';

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
  myBodyLesson,
  fiveSensesLesson,
  myFeelingsLesson,
  calmMyselfLesson,
  personalCareLesson,
  dressMyselfLesson,
  toiletRoutineLesson,
  speakingUpLesson,
  plantASeedLesson,
  helpItGrowLesson,
  gardenFriendsLesson,
  harvestDayLesson,
  gardenToTableLesson,
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
  calmMyselfLesson,
  doctorVisitLesson,
  dressMyselfLesson,
  familyDinnerLesson,
  fiveSensesLesson,
  gardenFriendsLesson,
  gardenToTableLesson,
  grandparentsVisitLesson,
  harvestDayLesson,
  helpItGrowLesson,
  homePlayLesson,
  libraryVisitLesson,
  lunchTimeLesson,
  morningRoutineLesson,
  myBodyLesson,
  myFeelingsLesson,
  parkVisitLesson,
  personalCareLesson,
  plantASeedLesson,
  playtimeLesson,
  snackTimeLesson,
  speakingUpLesson,
  supermarketTripLesson,
  toiletRoutineLesson,
};
