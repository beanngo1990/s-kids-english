import type { Lesson } from '../types/lesson';
import { assertValidLessons } from './lessonValidation';
import { morningRoutineLesson } from './lessons/morningRoutine';

const lessonCatalog: Lesson[] = [morningRoutineLesson];

assertValidLessons(lessonCatalog);

export const lessons = lessonCatalog;

export { morningRoutineLesson };
