import { type SKidsIconName } from '../assets/icons/skids';
import type { Lesson, Scene } from '../types/lesson';

const sceneIconById: Record<string, SKidsIconName> = {
  bathroom: 'bathroom',
  bedroom: 'bedroom',
  breakfast: 'breakfast',
  classroom: 'school',
  'friend-games': 'star',
  'after-lunch': 'breakfast',
  'lunch-box': 'breakfast',
  'lunch-table': 'breakfast',
  playground: 'school',
  'playtime-rest': 'star',
  school: 'school',
  'school-supplies': 'school',
  'teacher-instructions': 'listen',
};

const lessonIconById: Record<string, SKidsIconName> = {
  'at-school': 'school',
  'lunch-time': 'breakfast',
  'morning-routine': 'map',
  playtime: 'star',
};

export function getLessonIconName(lesson: Pick<Lesson, 'id'>): SKidsIconName {
  return lessonIconById[lesson.id] ?? 'map';
}

export function getSceneIconName(scene: Pick<Scene, 'id'>): SKidsIconName {
  return sceneIconById[scene.id] ?? 'star';
}
