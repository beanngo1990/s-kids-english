import { type SKidsIconName } from '../assets/icons/skids';
import type { Lesson, Scene } from '../types/lesson';

const sceneIconById: Record<string, SKidsIconName> = {
  'after-lunch': 'afterLunch',
  'bath-finish': 'bathFinish',
  'bath-prep': 'bathPrep',
  'bath-rinse': 'bathRinse',
  bathroom: 'bathroom',
  bedroom: 'bedroom',
  'bedtime-story': 'bedtimeStory',
  breakfast: 'breakfast',
  'calm-room': 'calmRoom',
  classroom: 'classroom',
  'clear-dinner': 'clearDinner',
  'creative-play': 'creativePlay',
  'dinner-cleanup': 'dinnerCleanup',
  'dinner-prep': 'dinnerPrep',
  'dinner-table': 'dinnerTable',
  'friend-games': 'friendGames',
  'go-to-school': 'goToSchool',
  'going-home': 'goingHome',
  'home-arrival': 'homeArrival',
  'home-toy-corner': 'homeToyCorner',
  'lunch-box': 'lunchBox',
  'lunch-table': 'lunchTable',
  playground: 'playground',
  'playtime-rest': 'playtimeRest',
  school: 'school',
  'school-supplies': 'schoolSupplies',
  'teacher-instructions': 'teacherInstructions',
  'ride-home': 'rideHome',
  'sleep-ready': 'sleepReady',
  'sort-and-dry': 'sortAndDry',
  'snack-cleanup': 'snackCleanup',
  'snack-prep': 'snackPrep',
  'snack-table': 'snackTable',
  'spot-clean': 'spotClean',
  'toy-cleanup': 'toyCleanup',
};

const lessonIconById: Record<string, SKidsIconName> = {
  'after-dinner-cleanup': 'clearDinner',
  'afternoon-bath': 'bathPrep',
  'afternoon-home': 'homeArrival',
  'at-school': 'classroom',
  bedtime: 'bedtimeStory',
  'family-dinner': 'dinnerTable',
  'lunch-time': 'lunchBox',
  'morning-routine': 'goToSchool',
  'home-play': 'homeToyCorner',
  playtime: 'playground',
  'snack-time': 'snackPrep',
};

export function getLessonIconName(lesson: Pick<Lesson, 'id'>): SKidsIconName {
  return lessonIconById[lesson.id] ?? 'map';
}

export function getSceneIconName(scene: Pick<Scene, 'id'>): SKidsIconName {
  return sceneIconById[scene.id] ?? 'star';
}

export function getMapSceneIconName(
  scene: Pick<Scene, 'id'>,
): SKidsIconName {
  return getSceneIconName(scene);
}
