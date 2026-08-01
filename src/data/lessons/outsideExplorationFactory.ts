import type {
  LearningScope,
  Lesson,
  PercentRect,
  ReviewGame,
  Scene,
  SceneObject,
  SceneStep,
  VocabularyItem,
  VocabularyLevel,
  VocabularyType,
} from '../../types/lesson';
import {
  characterObject,
  imageAsset,
  lessonEffects,
  rect,
} from '../lessonAuthoring';

type OutsideLearningTier = 'core' | 'expanded' | 'challenge';

export type OutsideVocabularySpec = {
  key: string;
  word: string;
  meaningVi: string;
  labelVi: string;
  type?: VocabularyType;
  tier?: OutsideLearningTier;
  practice?: 'drag' | 'tap';
  assetName?: string;
  failHintEn?: string;
  failHintVi?: string;
  position?: PercentRect;
  practiceInstructionEn?: string;
  practiceInstructionVi?: string;
  successFeedbackEn?: string;
  successFeedbackVi?: string;
  teachInstructionVi?: string;
  teachSuccessFeedbackVi?: string;
  touchArea?: PercentRect;
};

export type OutsideSceneSpec = {
  id: string;
  titleVi: string;
  titleEn: string;
  thumbnailEmoji: string;
  introVi: string;
  introEn: string;
  introSuccessVi: string;
  introSuccessEn: string;
  completionVi: string;
  completionEn: string;
  characterPosition?: PercentRect;
  dropZonePosition?: PercentRect;
  dropZoneTouchArea?: PercentRect;
  vocabulary: OutsideVocabularySpec[];
};

export type OutsideReviewRef = {
  sceneId: string;
  key: string;
};

export type OutsideLessonSpec = {
  id: string;
  themeId: string;
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  descriptionEn: string;
  thumbnailEmoji: string;
  parentTipVi: string;
  reviewTitleVi: string;
  reviewType?: ReviewGame['type'];
  reviewVocabulary: OutsideReviewRef[];
  scenes: OutsideSceneSpec[];
};

const expandedScope = {
  minAge: 4,
  minMode: 'expanded',
} satisfies LearningScope;

const challengeScope = {
  minAge: 5,
  minMode: 'challenge',
} satisfies LearningScope;

const objectPositions = [
  rect(8, 20, 20, 20),
  rect(39, 18, 20, 20),
  rect(70, 20, 20, 20),
  rect(12, 50, 19, 19),
  rect(41, 49, 19, 19),
  rect(70, 50, 19, 19),
  rect(18, 76, 18, 16),
  rect(43, 76, 18, 16),
  rect(68, 76, 18, 16),
] as const;

export function makeOutsideExplorationLesson(spec: OutsideLessonSpec): Lesson {
  const vocabularyIdsByRef = new Map<string, string>();
  const scenes = spec.scenes.map(scene =>
    makeScene(spec.id, scene, vocabularyIdsByRef),
  );

  return {
    id: spec.id,
    themeId: spec.themeId,
    titleVi: spec.titleVi,
    titleEn: spec.titleEn,
    descriptionVi: spec.descriptionVi,
    descriptionEn: spec.descriptionEn,
    thumbnailEmoji: spec.thumbnailEmoji,
    ageRange: {
      min: 3,
      max: 5,
      label: '3-5 tuổi',
    },
    metadata: {
      parentTipVi: spec.parentTipVi,
    },
    scenes,
    reviewGame: {
      id: `${spec.id}-review`,
      titleVi: spec.reviewTitleVi,
      type: spec.reviewType ?? 'memory',
      config: {
        vocabularyIds: spec.reviewVocabulary
          .map(ref =>
            vocabularyIdsByRef.get(reviewRefKey(ref.sceneId, ref.key)),
          )
          .filter((id): id is string => Boolean(id)),
      },
    },
  };
}

function makeScene(
  lessonId: string,
  spec: OutsideSceneSpec,
  vocabularyIdsByRef: Map<string, string>,
): Scene {
  const vocabulary = spec.vocabulary.map(item => {
    const vocabularyItem = makeVocabularyItem(lessonId, spec.id, item);
    vocabularyIdsByRef.set(reviewRefKey(spec.id, item.key), vocabularyItem.id);
    return vocabularyItem;
  });
  const vocabularyByKey = new Map(
    vocabulary.map((item, index) => [spec.vocabulary[index].key, item]),
  );
  const objects = spec.vocabulary.map((item, index) =>
    makeLearningObject({
      item,
      lessonId,
      sceneId: spec.id,
      position:
        item.position ??
        objectPositions[index] ??
        objectPositions[objectPositions.length - 1],
      vocabulary: vocabularyByKey.get(item.key),
    }),
  );
  const characterId = `${spec.id}-baby`;
  const zoneId = `${spec.id}-action-zone`;

  return {
    id: spec.id,
    titleVi: spec.titleVi,
    titleEn: spec.titleEn,
    thumbnailEmoji: spec.thumbnailEmoji,
    background: imageAsset(
      `${spec.id}-bg`,
      sceneImageSource(lessonId, spec.id, 'background'),
    ),
    character: characterObject(
      characterId,
      sceneImageSource(lessonId, spec.id, 'baby'),
      spec.characterPosition ?? rect(39, 37, 22, 34),
    ),
    vocabulary,
    objects,
    dropZones: [
      {
        id: zoneId,
        position: spec.dropZonePosition ?? rect(33, 70, 34, 24),
        touchArea: spec.dropZoneTouchArea ?? rect(27, 64, 46, 34),
      },
    ],
    steps: [
      makeIntroStep(spec, characterId),
      ...spec.vocabulary.flatMap(item =>
        makeVocabularySteps({
          item,
          objectId: `${spec.id}-${item.key}`,
          sceneId: spec.id,
          vocabulary: vocabularyByKey.get(item.key),
          zoneId,
        }),
      ),
    ],
    completionReward: {
      stars: 3,
      messageVi: spec.completionVi,
      messageEn: spec.completionEn,
    },
  };
}

function makeVocabularyItem(
  lessonId: string,
  sceneId: string,
  spec: OutsideVocabularySpec,
): VocabularyItem {
  const tier = spec.tier ?? 'core';

  return {
    id: `vocab-${lessonId}-${sceneId}-${spec.key}`,
    word: spec.word,
    meaningVi: spec.meaningVi,
    level: getLevel(tier),
    type: spec.type ?? 'noun',
    learningScope: getLearningScope(tier),
  };
}

function makeLearningObject({
  item,
  lessonId,
  position,
  sceneId,
  vocabulary,
}: {
  item: OutsideVocabularySpec;
  lessonId: string;
  position: PercentRect;
  sceneId: string;
  vocabulary: VocabularyItem | undefined;
}): SceneObject {
  return {
    id: `${sceneId}-${item.key}`,
    asset: imageAsset(
      `${sceneId}-${item.key}-asset`,
      sceneImageSource(lessonId, sceneId, item.assetName ?? item.key),
    ),
    defaultAnimation: getDefaultAnimation(item),
    isInteractive: true,
    learningScope: getLearningScope(item.tier ?? 'core'),
    position,
    role: 'learning',
    touchArea:
      item.touchArea ??
      rect(
        position.x - 4,
        position.y - 4,
        position.width + 8,
        position.height + 8,
      ),
    vocabId: vocabulary?.id,
  };
}

function makeIntroStep(spec: OutsideSceneSpec, characterId: string): SceneStep {
  return {
    id: `${spec.id}-intro`,
    type: 'intro',
    targetObjectIds: [characterId],
    instructionVi: spec.introVi,
    instructionEn: spec.introEn,
    promptText: spec.titleEn,
    interaction: {
      targetObjectId: characterId,
      type: 'listen',
    },
    successFeedbackVi: spec.introSuccessVi,
    successFeedbackEn: spec.introSuccessEn,
    effects: [lessonEffects.bounce(characterId)],
  };
}

function makeVocabularySteps({
  item,
  objectId,
  sceneId,
  vocabulary,
  zoneId,
}: {
  item: OutsideVocabularySpec;
  objectId: string;
  sceneId: string;
  vocabulary: VocabularyItem | undefined;
  zoneId: string;
}): SceneStep[] {
  const learningScope = getLearningScope(item.tier ?? 'core');
  const teachStep: SceneStep = {
    id: `${sceneId}-teach-${item.key}`,
    type: 'teach',
    targetObjectIds: [objectId],
    instructionVi:
      item.teachInstructionVi ??
      (item.type === 'phrase'
        ? `Mình học câu ${item.meaningVi} nhé.`
        : `Đây là ${item.labelVi}.`),
    interaction: {
      targetObjectId: objectId,
      type: 'listen',
    },
    promptText: item.word,
    successFeedbackVi:
      item.teachSuccessFeedbackVi ??
      (item.type === 'phrase'
        ? `Câu này nghĩa là ${item.meaningVi}.`
        : `Từ này nghĩa là ${item.meaningVi}.`),
    effects: [lessonEffects.sparkle(objectId)],
    learningScope,
    vocabId: vocabulary?.id,
  };

  const practiceType = item.practice ?? 'tap';
  const practiceStep: SceneStep =
    practiceType === 'drag'
      ? {
          id: `${sceneId}-drag-${item.key}`,
          type: 'practice',
          targetObjectIds: [objectId],
          instructionVi:
            item.practiceInstructionVi ??
            `Kéo ${item.labelVi} vào vùng sáng nhé.`,
          instructionEn:
            item.practiceInstructionEn ?? getPracticeInstructionEn(item),
          interaction: {
            correctObjectIds: [objectId],
            dropZoneId: zoneId,
            targetObjectId: objectId,
            type: 'drag',
          },
          promptText: item.word,
          successFeedbackVi:
            item.successFeedbackVi ??
            `Tốt lắm, bé đã chọn đúng ${item.labelVi}.`,
          successFeedbackEn:
            item.successFeedbackEn ?? getPracticeSuccessEn(item),
          failFeedbackVi: item.failHintVi ?? `Thử tìm ${item.labelVi} nhé.`,
          failFeedbackEn: item.failHintEn ?? getPracticeFailEn(item),
          effects: [
            lessonEffects.sound('correct'),
            lessonEffects.bounce(objectId),
          ],
          learningScope,
          vocabId: vocabulary?.id,
        }
      : {
          id: `${sceneId}-tap-${item.key}`,
          type: 'practice',
          targetObjectIds: [objectId],
          instructionVi:
            item.practiceInstructionVi ?? `Chạm vào ${item.labelVi} nhé.`,
          instructionEn:
            item.practiceInstructionEn ?? getPracticeInstructionEn(item),
          interaction: {
            correctObjectIds: [objectId],
            targetObjectId: objectId,
            type: 'tap',
          },
          promptText: item.word,
          successFeedbackVi:
            item.successFeedbackVi ?? `Đúng rồi, đó là ${item.labelVi}.`,
          successFeedbackEn:
            item.successFeedbackEn ?? getPracticeSuccessEn(item),
          failFeedbackVi: item.failHintVi ?? `Thử tìm ${item.labelVi} nhé.`,
          failFeedbackEn: item.failHintEn ?? getPracticeFailEn(item),
          effects: [
            lessonEffects.sound('correct'),
            lessonEffects.bounce(objectId),
          ],
          learningScope,
          vocabId: vocabulary?.id,
        };

  return [teachStep, practiceStep];
}

function getPracticeInstructionEn(item: OutsideVocabularySpec) {
  if (item.practice === 'drag') {
    return item.type === 'phrase'
      ? 'Drag the matching action card into the glowing circle.'
      : `Drag the ${item.word} into the glowing circle.`;
  }

  return item.type === 'phrase' ? 'Tap the matching action card.' : undefined;
}

function getPracticeSuccessEn(item: OutsideVocabularySpec) {
  return item.type === 'phrase' ? 'Great job!' : undefined;
}

function getPracticeFailEn(item: OutsideVocabularySpec) {
  return item.type === 'phrase'
    ? 'Look for the matching action card.'
    : undefined;
}

function getLearningScope(
  tier: OutsideLearningTier,
): LearningScope | undefined {
  if (tier === 'expanded') {
    return expandedScope;
  }
  if (tier === 'challenge') {
    return challengeScope;
  }
  return undefined;
}

function getLevel(tier: OutsideLearningTier): VocabularyLevel {
  if (tier === 'expanded') {
    return 'medium';
  }
  if (tier === 'challenge') {
    return 'hard';
  }
  return 'easy';
}

function getDefaultAnimation(spec: OutsideVocabularySpec) {
  if (spec.practice === 'drag') {
    return 'wiggle';
  }
  if (spec.type === 'phrase') {
    return 'sparkle';
  }
  return 'bounce';
}

function sceneImageSource(
  lessonId: string,
  sceneId: string,
  imageName: string,
) {
  return `lessons/${lessonId}/${sceneId}/images/${imageName}.webp`;
}

function reviewRefKey(sceneId: string, key: string) {
  return `${sceneId}:${key}`;
}
