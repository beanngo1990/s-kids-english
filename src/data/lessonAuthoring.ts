import type {
  AssetRef,
  EntityId,
  PercentRect,
  SceneEffect,
  SceneObject,
  SceneSoundEffect,
  SceneStep,
  SceneStepType,
  VocabularyItem,
} from '../types/lesson';

export function rect(
  x: number,
  y: number,
  width: number,
  height: number,
): PercentRect {
  return { height, width, x, y };
}

export function imageAsset(id: EntityId, source: string): AssetRef {
  return {
    id,
    source,
    type: 'image',
  };
}

export function spriteAsset(id: EntityId, source: string): AssetRef {
  return {
    id,
    source,
    type: 'sprite',
  };
}

export function characterObject(
  id: EntityId,
  source: string,
  position: PercentRect,
): SceneObject {
  return {
    id,
    asset: spriteAsset(`${id}-asset`, source),
    defaultAnimation: 'wave',
    isInteractive: false,
    position,
    role: 'character',
  };
}

type LearningObjectInput = {
  id: EntityId;
  assetId?: EntityId;
  assetSource: string;
  defaultAnimation?: string;
  isInteractive?: boolean;
  position: PercentRect;
  touchArea?: PercentRect;
  vocab: VocabularyItem;
};

export function learningObject({
  id,
  assetId,
  assetSource,
  defaultAnimation,
  isInteractive = true,
  position,
  touchArea,
  vocab,
}: LearningObjectInput): SceneObject {
  return {
    id,
    asset: imageAsset(assetId ?? vocab.word, assetSource),
    defaultAnimation,
    isInteractive,
    position,
    role: 'learning',
    touchArea,
    vocabId: vocab.id,
  };
}

type BaseStepInput = {
  id: EntityId;
  effects?: SceneEffect[];
  failFeedbackEn?: string;
  failFeedbackVi?: string;
  instructionEn?: string;
  instructionVi: string;
  nextStepId?: EntityId;
  promptText?: string;
  successFeedbackEn?: string;
  successFeedbackVi: string;
  targetObjectIds: EntityId[];
  type: SceneStepType;
};

export function listenStep(input: BaseStepInput): SceneStep {
  return {
    ...input,
    interaction: {
      targetObjectId: input.targetObjectIds[0],
      type: 'listen',
    },
  };
}

type TapStepInput = Omit<BaseStepInput, 'targetObjectIds'> & {
  correctObjectIds?: EntityId[];
  targetObjectId: EntityId;
  targetObjectIds?: EntityId[];
};

export function tapStep({
  correctObjectIds,
  targetObjectId,
  targetObjectIds,
  ...input
}: TapStepInput): SceneStep {
  return {
    ...input,
    interaction: {
      correctObjectIds: correctObjectIds ?? [targetObjectId],
      targetObjectId,
      type: 'tap',
    },
    targetObjectIds: targetObjectIds ?? [targetObjectId],
  };
}

type DragStepInput = TapStepInput & {
  dropZoneId: EntityId;
};

export function dragStep({
  correctObjectIds,
  dropZoneId,
  targetObjectId,
  targetObjectIds,
  ...input
}: DragStepInput): SceneStep {
  return {
    ...input,
    interaction: {
      correctObjectIds: correctObjectIds ?? [targetObjectId],
      dropZoneId,
      targetObjectId,
      type: 'drag',
    },
    targetObjectIds: targetObjectIds ?? [targetObjectId],
  };
}

export const lessonEffects = {
  animation(animation: string, targetObjectId: EntityId): SceneEffect {
    return {
      animation,
      targetObjectId,
      type: 'animation',
    };
  },
  bounce(targetObjectId: EntityId): SceneEffect {
    return lessonEffects.animation('bounce', targetObjectId);
  },
  sound(sound: SceneSoundEffect): SceneEffect {
    return {
      sound,
      type: 'sound',
    };
  },
  sparkle(targetObjectId: EntityId): SceneEffect {
    return lessonEffects.animation('sparkle', targetObjectId);
  },
};
