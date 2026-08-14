import type {
  AssetRef,
  EntityId,
  LearningScope,
  PercentRect,
  SceneEffect,
  SceneObject,
  SceneObjectPresentation,
  SceneObjectRole,
  SceneObjectVariant,
  SceneObjectVisibility,
  SceneSoundEffect,
  SceneStateChange,
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

type StatefulObjectOptions = {
  initialVariantId?: EntityId;
  initialVisibility?: SceneObjectVisibility;
  variants?: SceneObjectVariant[];
};

type SceneObjectInput = StatefulObjectOptions & {
  assetId?: EntityId;
  assetSource: string;
  defaultAnimation?: string;
  id: EntityId;
  isInteractive?: boolean;
  learningScope?: LearningScope;
  position: PercentRect;
  presentation?: SceneObjectPresentation;
  role?: SceneObjectRole;
  touchArea?: PercentRect;
  vocabId?: EntityId;
};

export function sceneObject({
  assetId,
  assetSource,
  defaultAnimation,
  id,
  initialVariantId,
  initialVisibility,
  isInteractive = false,
  learningScope,
  position,
  presentation,
  role = 'decoration',
  touchArea,
  variants,
  vocabId,
}: SceneObjectInput): SceneObject {
  return {
    asset: imageAsset(assetId ?? `${id}-asset`, assetSource),
    defaultAnimation,
    id,
    initialVariantId,
    initialVisibility,
    isInteractive,
    learningScope,
    position,
    presentation,
    role,
    touchArea,
    variants,
    vocabId,
  };
}

export function characterObject(
  id: EntityId,
  source: string,
  position: PercentRect,
  stateOptions: StatefulObjectOptions = {},
): SceneObject {
  return {
    ...stateOptions,
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
  initialVariantId?: EntityId;
  initialVisibility?: SceneObjectVisibility;
  learningScope?: LearningScope;
  position: PercentRect;
  touchArea?: PercentRect;
  variants?: SceneObjectVariant[];
  vocab: VocabularyItem;
};

export function learningObject({
  id,
  assetId,
  assetSource,
  defaultAnimation,
  isInteractive = true,
  initialVariantId,
  initialVisibility,
  learningScope,
  position,
  touchArea,
  variants,
  vocab,
}: LearningObjectInput): SceneObject {
  return {
    id,
    asset: imageAsset(assetId ?? vocab.word, assetSource),
    defaultAnimation,
    initialVariantId,
    initialVisibility,
    isInteractive,
    learningScope,
    position,
    role: 'learning',
    touchArea,
    variants,
    vocabId: vocab.id,
  };
}

type ObjectVariantInput = {
  assetId?: EntityId;
  assetSource: string;
  id: EntityId;
  position?: PercentRect;
  touchArea?: PercentRect;
};

export function objectVariant({
  assetId,
  assetSource,
  id,
  position,
  touchArea,
}: ObjectVariantInput): SceneObjectVariant {
  return {
    asset: imageAsset(assetId ?? `${id}-asset`, assetSource),
    id,
    position,
    touchArea,
  };
}

type BaseStepInput = {
  afterSuccessStateChanges?: SceneStateChange[];
  id: EntityId;
  effects?: SceneEffect[];
  failFeedbackEn?: string;
  failFeedbackVi?: string;
  instructionEn?: string;
  instructionVi: string;
  learningScope?: LearningScope;
  nextStepId?: EntityId;
  promptText?: string;
  speechPractice?: SceneStep['speechPractice'];
  successStateChanges?: SceneStateChange[];
  successFeedbackEn?: string;
  successFeedbackVi: string;
  targetObjectIds: EntityId[];
  type: SceneStepType;
  vocabId?: EntityId;
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

export function findStep({
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
      type: 'find',
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

export const sceneStateChanges = {
  hide(targetObjectId: EntityId): SceneStateChange {
    return { targetObjectId, type: 'hideObject' };
  },
  setVariant(
    targetObjectId: EntityId,
    variantId: EntityId,
  ): SceneStateChange {
    return { targetObjectId, type: 'setObjectVariant', variantId };
  },
  show(targetObjectId: EntityId): SceneStateChange {
    return { targetObjectId, type: 'showObject' };
  },
};
