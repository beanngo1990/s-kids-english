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
  };
  ReviewLibrary: undefined;
  Reward: {
    lessonId: string;
  };
  Parent: undefined;
};
