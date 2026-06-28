import { type SKidsIconName } from '../assets/icons/skids';
import type { Lesson, Scene } from '../types/lesson';

const sceneIconById: Record<string, SKidsIconName> = {
  bathroom: 'bathroom',
  bedroom: 'bedroom',
  breakfast: 'breakfast',
  school: 'school',
};

const lessonIconById: Record<string, SKidsIconName> = {
  'morning-routine': 'map',
};

export function getLessonIconName(lesson: Pick<Lesson, 'id'>): SKidsIconName {
  return lessonIconById[lesson.id] ?? 'map';
}

export function getSceneIconName(scene: Pick<Scene, 'id'>): SKidsIconName {
  return sceneIconById[scene.id] ?? 'star';
}
