import { type SKidsIconName } from '../assets/icons/skids';
import type { Lesson, Scene } from '../types/lesson';

const sceneIconById: Record<string, SKidsIconName> = {
  'bedtime-story': 'star',
  'calm-room': 'star',
  'clear-dinner': 'star',
  'bath-finish': 'star',
  'bath-prep': 'bathroom',
  'bath-rinse': 'bathroom',
  bathroom: 'bathroom',
  bedroom: 'bedroom',
  breakfast: 'breakfast',
  'go-to-school': 'school',
  classroom: 'school',
  'creative-play': 'star',
  'dinner-cleanup': 'star',
  'dinner-prep': 'breakfast',
  'dinner-table': 'breakfast',
  'friend-games': 'star',
  'after-lunch': 'breakfast',
  'going-home': 'school',
  'home-arrival': 'star',
  'home-toy-corner': 'star',
  'lunch-box': 'breakfast',
  'lunch-table': 'breakfast',
  playground: 'school',
  'playtime-rest': 'star',
  school: 'school',
  'school-supplies': 'school',
  'teacher-instructions': 'listen',
  'ride-home': 'map',
  'sleep-ready': 'star',
  'sort-and-dry': 'star',
  'snack-cleanup': 'star',
  'snack-prep': 'breakfast',
  'snack-table': 'breakfast',
  'spot-clean': 'star',
  'toy-cleanup': 'star',
};

const lessonIconById: Record<string, SKidsIconName> = {
  'after-dinner-cleanup': 'star',
  'afternoon-bath': 'bathroom',
  'afternoon-home': 'map',
  'at-school': 'school',
  bedtime: 'star',
  'family-dinner': 'breakfast',
  'lunch-time': 'breakfast',
  'morning-routine': 'map',
  'home-play': 'star',
  playtime: 'star',
  'snack-time': 'breakfast',
};

export function getLessonIconName(lesson: Pick<Lesson, 'id'>): SKidsIconName {
  return lessonIconById[lesson.id] ?? 'map';
}

export function getSceneIconName(scene: Pick<Scene, 'id'>): SKidsIconName {
  return sceneIconById[scene.id] ?? 'star';
}
