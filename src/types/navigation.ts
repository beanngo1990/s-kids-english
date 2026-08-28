import type { LearningMode } from './lesson';

export type RootStackParamList = {
  Onboarding: undefined;
  Home: { activeTab?: 'map' | 'play' } | undefined;
  ThemeLibrary: undefined;
  LessonList: undefined;
  LessonPack: {
    lessonId: string;
    openedFromParent?: boolean;
  };
  ScenePlayer: {
    lessonId: string;
    learningMode?: LearningMode;
    openedFromParent?: boolean;
    sceneId?: string;
  };
  SceneVocabularyPlayground: {
    lessonId: string;
    learningMode?: LearningMode;
    openedFromParent?: boolean;
    sceneId: string;
  };
  ReviewGame: {
    lessonId: string;
    learningMode?: LearningMode;
    openedFromParent?: boolean;
    gameType?: 'matching' | 'memory' | 'listenAndChoose' | 'random';
  };
  ReviewLibrary: undefined;
  Reward: {
    lessonId: string;
    learningMode?: LearningMode;
    playedWordIds?: string[];
    xpGained?: number;
    leveledUp?: boolean;
    newLevel?: number;
    unlockedSticker?: {
      id: string;
      stickerId: string;
      stickerName: string;
      stickerNameEn?: string;
      stickerNameVi?: string;
      title: string;
    };
    gameType?: 'matching' | 'memory' | 'listenAndChoose' | 'random';
    sourceScreen?: 'ScenePlayer' | 'ReviewGame' | 'LessonPack';
  };
  StickerCollection: {
    highlightedStickerId?: string;
  } | undefined;
  StickerPlayground: undefined;
  Parent: {
    intent?: 'dashboard' | 'premium' | 'founderPromo';
    lessonId?: string;
  } | undefined;
  ParentLessonPlan: undefined;
  ParentVoiceLibrary: undefined;
  Premium: undefined;
};
