import { type SKidsIconName } from '../assets/icons/skids';
import type { Lesson, Scene } from '../types/lesson';

const sceneIconById: Record<string, SKidsIconName> = {
  bathroom: 'bathroom',
  bedroom: 'bedroom',
  breakfast: 'breakfast',
  classroom: 'school',
  'creative-play': 'star',
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
  'snack-cleanup': 'star',
  'snack-prep': 'breakfast',
  'snack-table': 'breakfast',
  'toy-cleanup': 'star',
};

const lessonIconById: Record<string, SKidsIconName> = {
  'afternoon-home': 'map',
  'at-school': 'school',
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
