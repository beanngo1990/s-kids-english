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
  Reward: {
    lessonId: string;
  };
  Parent: undefined;
};
