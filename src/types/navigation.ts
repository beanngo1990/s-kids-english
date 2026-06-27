import type { LearningMode } from './lesson';

export type RootStackParamList = {
  Home: undefined;
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
