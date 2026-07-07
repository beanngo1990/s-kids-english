import type { LearningMode } from './lesson';

export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  ThemeLibrary: undefined;
  LessonList: undefined;
  LessonPack: {
    lessonId: string;
  };
  ScenePlayer: {
    lessonId: string;
    learningMode?: LearningMode;
    sceneId?: string;
  };
  ReviewGame: {
    lessonId: string;
    learningMode?: LearningMode;
  };
  ReviewLibrary: undefined;
  Reward: { 
    lessonId: string; 
    playedWordIds?: string[]; 
    xpGained?: number; 
    leveledUp?: boolean;
    newLevel?: number;
    unlockedSticker?: { id: string; stickerId: string; stickerName: string; title: string; };
  };
  Parent: undefined;
};
