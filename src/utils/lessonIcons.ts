import { type SKidsIconName } from '../assets/icons/skids';
import type { Lesson, Scene } from '../types/lesson';

const sceneIconById: Record<string, SKidsIconName> = {
  'after-lunch': 'afterLunch',
  'animal-gate': 'animalGate',
  'bath-finish': 'bathFinish',
  'bath-prep': 'bathPrep',
  'bath-rinse': 'bathRinse',
  'beach-bag': 'beachBag',
  bathroom: 'bathroom',
  bedroom: 'bedroom',
  'bedtime-story': 'bedtimeStory',
  'book-corner': 'bookCorner',
  breakfast: 'breakfast',
  'checkout-counter': 'supermarketCheckout',
  'calm-room': 'calmRoom',
  classroom: 'classroom',
  'clear-dinner': 'clearDinner',
  'clinic-room': 'clinicRoom',
  'creative-play': 'creativePlay',
  'dinner-cleanup': 'dinnerCleanup',
  'dinner-prep': 'dinnerPrep',
  'dinner-table': 'dinnerTable',
  'friend-games': 'friendGames',
  'family-visit': 'familyVisit',
  'farm-yard': 'farmYard',
  'fresh-foods': 'freshFoods',
  'garden-help': 'gardenHelp',
  'go-to-school': 'goToSchool',
  'goodbye-home': 'goodbyeHome',
  'going-home': 'goingHome',
  'health-check': 'healthCheck',
  'home-arrival': 'homeArrival',
  'home-toy-corner': 'homeToyCorner',
  'library-card': 'libraryCard',
  'lunch-box': 'lunchBox',
  'lunch-table': 'lunchTable',
  'medicine-care': 'medicineCare',
  'park-entrance': 'parkEntrance',
  'park-games': 'parkGames',
  'park-picnic': 'parkPicnic',
  'party-games': 'partyGames',
  'party-prep': 'partyPrep',
  'party-table': 'partyTable',
  playground: 'playground',
  'playtime-rest': 'playtimeRest',
  school: 'school',
  'school-supplies': 'schoolSupplies',
  'sand-play': 'beachSand',
  'sea-safety': 'beachSafety',
  'teacher-instructions': 'teacherInstructions',
  'ride-home': 'rideHome',
  'sleep-ready': 'sleepReady',
  'sort-and-dry': 'sortAndDry',
  'snack-cleanup': 'snackCleanup',
  'snack-prep': 'snackPrep',
  'snack-table': 'snackTable',
  'spot-clean': 'spotClean',
  'shopping-list': 'supermarketList',
  'toy-cleanup': 'toyCleanup',
  'story-circle': 'storyCircle',
  'zoo-path': 'zooPath',
};

const lessonIconById: Record<string, SKidsIconName> = {
  'after-dinner-cleanup': 'clearDinner',
  'afternoon-bath': 'bathPrep',
  'afternoon-home': 'homeArrival',
  'animal-trip': 'animalGate',
  'at-school': 'classroom',
  'beach-day': 'beachSand',
  bedtime: 'bedtimeStory',
  'birthday-party': 'partyTable',
  'doctor-visit': 'clinicRoom',
  'family-dinner': 'dinnerTable',
  'grandparents-visit': 'familyVisit',
  'lunch-time': 'lunchBox',
  'morning-routine': 'goToSchool',
  'home-play': 'homeToyCorner',
  'library-visit': 'libraryCard',
  'park-visit': 'parkEntrance',
  playtime: 'playground',
  'snack-time': 'snackPrep',
  'supermarket-trip': 'supermarketCart',
};

const lessonMilestoneIconById: Record<string, SKidsIconName> = {
  'after-dinner-cleanup': 'milestoneAfterDinnerCleanup',
  'afternoon-bath': 'milestoneAfternoonBath',
  'afternoon-home': 'milestoneAfternoonHome',
  'animal-trip': 'milestoneAnimalTrip',
  'at-school': 'milestoneAtSchool',
  'beach-day': 'milestoneBeachDay',
  bedtime: 'milestoneBedtime',
  'birthday-party': 'milestoneBirthdayParty',
  'doctor-visit': 'milestoneDoctorVisit',
  'family-dinner': 'milestoneFamilyDinner',
  'grandparents-visit': 'milestoneGrandparentsVisit',
  'home-play': 'milestoneHomePlay',
  'library-visit': 'milestoneLibraryVisit',
  'lunch-time': 'milestoneLunchTime',
  'morning-routine': 'milestoneMorningRoutine',
  'park-visit': 'milestoneParkVisit',
  playtime: 'milestonePlaytime',
  'snack-time': 'milestoneSnackTime',
  'supermarket-trip': 'milestoneSupermarketTrip',
};

export function getLessonIconName(lesson: Pick<Lesson, 'id'>): SKidsIconName {
  return lessonIconById[lesson.id] ?? 'map';
}

export function getLessonMilestoneIconName(
  lesson: Pick<Lesson, 'id'>,
): SKidsIconName {
  return lessonMilestoneIconById[lesson.id] ?? 'star';
}

export function getSceneIconName(scene: Pick<Scene, 'id'>): SKidsIconName {
  return sceneIconById[scene.id] ?? 'star';
}

export function getMapSceneIconName(scene: Pick<Scene, 'id'>): SKidsIconName {
  return getSceneIconName(scene);
}
