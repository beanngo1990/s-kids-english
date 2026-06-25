import { lessons } from '../data/lessons';
import type { LearningStats } from '../types/progress';

export function getDemoProgress(): LearningStats {
  return {
    currentStreak: 3,
    lastLessonTitle: lessons[0].titleVi,
    lessonsCompleted: 1,
    minutesLearned: 8,
    starsEarned: 3,
  };
}
