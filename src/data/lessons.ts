import type { Lesson } from '../types/lesson';
import { assertValidLessons } from './lessonValidation';
import { atSchoolLesson } from './lessons/atSchool';
import { morningRoutineLesson } from './lessons/morningRoutine';

const lessonCatalog: Lesson[] = [morningRoutineLesson, atSchoolLesson];

assertValidLessons(lessonCatalog);

export const lessons = lessonCatalog;

export { atSchoolLesson, morningRoutineLesson };
