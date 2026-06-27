export type RootStackParamList = {
  Home: undefined;
  LessonList: undefined;
  LessonPack: {
    lessonId: string;
  };
  ScenePlayer: {
    lessonId: string;
    sceneId?: string;
  };
  Reward: {
    lessonId: string;
  };
  Parent: undefined;
};
