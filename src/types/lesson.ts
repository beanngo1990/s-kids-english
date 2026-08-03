import type { SKidsIconName } from '../assets/icons/skids';

/** Mã định danh dùng chung cho lesson, scene, object và step. */
export type EntityId = string;

/** Vùng hình chữ nhật theo phần trăm để layout co giãn theo màn hình. */
export type PercentRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  flipX?: boolean;
};

/** Tham chiếu asset nội bộ để sau này đổi sang image, lottie hoặc audio dễ hơn. */
export type AssetRef = {
  id: EntityId;
  type: 'image' | 'audio' | 'lottie' | 'sprite';
  source: string;
};

/** Độ khó của từ vựng trong bài học. */
export type VocabularyLevel = 'easy' | 'medium' | 'hard';

/** Mức học đang chọn cho cùng một scene. */
export type LearningMode = 'core' | 'expanded' | 'challenge';

/** Điều kiện mở nội dung theo tuổi hoặc mức hiểu biết. */
export type LearningScope = {
  minAge?: number;
  minMode?: LearningMode;
};

/** Loại từ vựng để engine chọn cách dạy và kiểm tra phù hợp. */
export type VocabularyType = 'noun' | 'verb' | 'adjective' | 'phrase';

/** Một từ hoặc cụm từ tiếng Anh bé sẽ học trong scene. */
export type VocabularyItem = {
  id: EntityId;
  word: string;
  meaningVi: string;
  phonetic?: string;
  audio?: AssetRef;
  learningScope?: LearningScope;
  level: VocabularyLevel;
  type: VocabularyType;
};

/** Vai trò của object trong scene để engine biết object có thể tương tác ra sao. */
export type SceneObjectRole =
  | 'learning'
  | 'decoration'
  | 'dropZone'
  | 'character';

/** Tên animation mặc định cho object, ví dụ idle, bounce hoặc wave. */
export type SceneAnimation = string;

/** Tên sound effect ngắn, vui, chạy local hoặc qua remote cache. */
export type SceneSoundEffect =
  | 'clap'
  | 'complete'
  | 'correct'
  | 'ding'
  | 'tap'
  | 'wrong'
  | 'yay';

/** Một object hiển thị trong scene, có vị trí phần trăm và trạng thái tương tác. */
export type SceneObject = {
  id: EntityId;
  vocabId?: EntityId;
  role: SceneObjectRole;
  asset: AssetRef;
  position: PercentRect;
  touchArea?: PercentRect;
  isInteractive: boolean;
  defaultAnimation?: SceneAnimation;
  learningScope?: LearningScope;
};

/** Khu vực thả object trong các bài kéo thả. */
export type DropZone = {
  id: EntityId;
  position: PercentRect;
  touchArea?: PercentRect;
  learningScope?: LearningScope;
};

/** Loại step trong scene, từ giới thiệu tới ôn tập. */
export type SceneStepType = 'intro' | 'teach' | 'practice' | 'review';

/** Kiểu tương tác mà bé cần thực hiện ở một step. */
export type SceneInteractionType = 'listen' | 'tap' | 'drag' | 'find';

/** Cấu hình tương tác của step, trỏ tới object hoặc drop zone liên quan. */
export type SceneInteraction = {
  type: SceneInteractionType;
  targetObjectId?: EntityId;
  dropZoneId?: EntityId;
  correctObjectIds?: EntityId[];
};

/** Hiệu ứng nhẹ sau khi bé trả lời đúng hoặc sai. */
export type SceneEffect = {
  type: 'sound' | 'animation' | 'highlight';
  targetObjectId?: EntityId;
  asset?: AssetRef;
  animation?: SceneAnimation;
  sound?: SceneSoundEffect;
};

/** Một bước học nhỏ trong scene với hướng dẫn, tương tác và phản hồi. */
export type SceneStep = {
  id: EntityId;
  type: SceneStepType;
  targetObjectIds: EntityId[];
  instructionVi: string;
  instructionEn?: string;
  promptText?: string;
  interaction: SceneInteraction;
  successFeedbackVi: string;
  successFeedbackEn?: string;
  failFeedbackVi?: string;
  failFeedbackEn?: string;
  effects?: SceneEffect[];
  learningScope?: LearningScope;
  nextStepId?: EntityId;
  vocabId?: EntityId;
};

/** Phần thưởng nhận được sau khi hoàn thành một scene. */
export type SceneReward = {
  stars: number;
  badgeId?: EntityId;
  messageVi?: string;
  messageEn?: string;
};

/** Một mini-scene học tương tác gồm nền, object, drop zone và các step. */
export type Scene = {
  id: EntityId;
  titleVi: string;
  titleEn: string;
  thumbnailEmoji?: string;
  background: AssetRef;
  character?: SceneObject;
  vocabulary?: VocabularyItem[];
  objects: SceneObject[];
  dropZones?: DropZone[];
  steps: SceneStep[];
  completionReward?: SceneReward;
};

/** Độ tuổi phù hợp của bài học. */
export type AgeRange = {
  min: number;
  max: number;
  label?: string;
};

/** Game ôn tập cuối bài, có thể mở rộng bằng config riêng cho từng game. */
export type ReviewGame = {
  id: EntityId;
  type: 'matching' | 'memory' | 'listenAndChoose' | 'random';
  titleVi: string;
  config?: Record<string, unknown>;
};

/** Một chủ đề/lộ trình gom nhiều gói bài thành một bản đồ dài. */
export type LessonTheme = {
  id: EntityId;
  titleVi: string;
  titleEn?: string;
  iconName?: SKidsIconName;
  thumbnailEmoji: string;
  descriptionVi?: string;
  descriptionEn?: string;
  lessonIds: EntityId[];
};

/** Một gói bài học gồm nhiều mini-scene và game ôn tập tùy chọn. */
export type Lesson = {
  id: EntityId;
  themeId: EntityId;
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  descriptionEn?: string;
  thumbnailEmoji?: string;
  ageRange: AgeRange;
  scenes: Scene[];
  reviewGame?: ReviewGame;
  metadata?: {
    parentTipVi?: string;
    [key: string]: unknown;
  };
};
