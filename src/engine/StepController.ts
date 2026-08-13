import type {
  EntityId,
  Scene,
  SceneInteractionType,
  SceneSoundEffect,
  SceneStateChange,
  SceneStep,
} from '../types/lesson';

export type StepInteractionStatus = 'correct' | 'incorrect' | 'ignored';
export type StepObjectEffectAnimation = 'bounce' | 'shake' | 'sparkle';

export type StepObjectEffect = {
  targetObjectId: EntityId;
  animation: StepObjectEffectAnimation;
};

export type StepInteractionResult = {
  status: StepInteractionStatus;
  feedbackEn?: string;
  feedbackVi?: string;
  effectObjectIds: EntityId[];
  objectEffects: StepObjectEffect[];
  stateChanges: SceneStateChange[];
  soundEffect?: SceneSoundEffect;
  nextStep?: SceneStep;
  isSceneComplete: boolean;
};

const interactiveStepTypes: readonly SceneInteractionType[] = [
  'tap',
  'find',
  'drag',
];

export function getInitialStep(scene: Scene) {
  return scene.steps[0];
}

export function getStepById(scene: Scene, stepId?: EntityId) {
  if (!stepId) {
    return getInitialStep(scene);
  }

  return scene.steps.find(step => step.id === stepId);
}

export function getStepIndex(scene: Scene, stepId: EntityId) {
  return Math.max(
    0,
    scene.steps.findIndex(step => step.id === stepId),
  );
}

export function getNextStep(scene: Scene, currentStep: SceneStep) {
  if (currentStep.nextStepId) {
    return scene.steps.find(step => step.id === currentStep.nextStepId);
  }

  const currentIndex = getStepIndex(scene, currentStep.id);
  return scene.steps[currentIndex + 1];
}

export function canPressObjects(step: SceneStep) {
  return interactiveStepTypes.includes(step.interaction.type);
}

export function isListenStep(step: SceneStep) {
  return step.interaction.type === 'listen';
}

export function isStepTargetObject(step: SceneStep, objectId: EntityId) {
  return step.targetObjectIds.includes(objectId);
}

export function getStepHintObjectIds(step: SceneStep): EntityId[] {
  const correctIds = step.interaction.correctObjectIds;

  if (correctIds?.length) {
    return correctIds;
  }

  return step.interaction.targetObjectId
    ? [step.interaction.targetObjectId]
    : step.targetObjectIds;
}

export function shouldDimObjectForStep(step: SceneStep, objectId: EntityId) {
  if (
    step.type !== 'intro' &&
    step.type !== 'teach' &&
    step.type !== 'practice'
  ) {
    return false;
  }

  return step.targetObjectIds.length > 0 && !isStepTargetObject(step, objectId);
}

export function resolveContinueInteraction(
  scene: Scene,
  step: SceneStep,
): StepInteractionResult {
  if (!isListenStep(step)) {
    return {
      effectObjectIds: [],
      objectEffects: [],
      stateChanges: [],
      isSceneComplete: false,
      status: 'ignored',
    };
  }

  return buildCorrectResult(scene, step);
}

export function resolveObjectInteraction(
  scene: Scene,
  step: SceneStep,
  objectId: EntityId,
): StepInteractionResult {
  if (!canPressObjects(step)) {
    return {
      effectObjectIds: [],
      objectEffects: [],
      stateChanges: [],
      isSceneComplete: false,
      status: 'ignored',
    };
  }

  if (isCorrectObject(step, objectId)) {
    return buildCorrectResult(scene, step, objectId);
  }

  return {
    effectObjectIds: [objectId],
    feedbackEn: step.failFeedbackEn,
    feedbackVi: step.failFeedbackVi ?? 'Thử lại nhé.',
    isSceneComplete: false,
    objectEffects: [],
    stateChanges: [],
    status: 'incorrect',
  };
}

export function resolveDragInteraction(
  scene: Scene,
  step: SceneStep,
  objectId: EntityId,
  isInsideDropZone: boolean,
): StepInteractionResult {
  if (step.interaction.type !== 'drag') {
    return {
      effectObjectIds: [],
      objectEffects: [],
      stateChanges: [],
      isSceneComplete: false,
      status: 'ignored',
    };
  }

  if (isCorrectObject(step, objectId) && isInsideDropZone) {
    return buildCorrectResult(scene, step, objectId);
  }

  return {
    effectObjectIds: [objectId],
    feedbackEn: step.failFeedbackEn,
    feedbackVi: step.failFeedbackVi ?? 'Kéo vào vùng đúng nhé.',
    isSceneComplete: false,
    objectEffects: [],
    stateChanges: [],
    status: 'incorrect',
  };
}

function isCorrectObject(step: SceneStep, objectId: EntityId) {
  const correctIds = step.interaction.correctObjectIds;

  if (correctIds?.length) {
    return correctIds.includes(objectId);
  }

  return step.interaction.targetObjectId === objectId;
}

function buildCorrectResult(
  scene: Scene,
  step: SceneStep,
  objectId?: EntityId,
): StepInteractionResult {
  const nextStep = getNextStep(scene, step);
  const objectEffects = getSuccessObjectEffects(step, objectId);

  return {
    effectObjectIds: objectEffects.map(effect => effect.targetObjectId),
    feedbackEn: step.successFeedbackEn,
    feedbackVi: step.successFeedbackVi,
    isSceneComplete: !nextStep,
    nextStep,
    objectEffects,
    soundEffect: getSuccessSoundEffect(step),
    stateChanges: step.successStateChanges ?? [],
    status: 'correct',
  };
}

function getSuccessObjectEffects(
  step: SceneStep,
  objectId?: EntityId,
): StepObjectEffect[] {
  const explicitObjectEffects =
    step.effects
      ?.map(effect => {
        if (
          effect.type !== 'animation' ||
          !effect.targetObjectId ||
          !isSupportedObjectEffectAnimation(effect.animation)
        ) {
          return undefined;
        }

        return {
          animation: effect.animation,
          targetObjectId: effect.targetObjectId,
        };
      })
      .filter((effect): effect is StepObjectEffect => Boolean(effect)) ?? [];

  const explicitTargetIds = new Set(
    explicitObjectEffects.map(effect => effect.targetObjectId),
  );
  // targetObjectIds describes every object participating in the step, which
  // can include distractors. For an interactive success, only the object the
  // child actually selected receives the implicit celebration. Authors can
  // still celebrate additional objects with explicit animation effects.
  const fallbackTargets = objectId
    ? [objectId]
    : step.interaction.targetObjectId
      ? [step.interaction.targetObjectId]
      : step.targetObjectIds;

  const fallbackObjectEffects = Array.from(new Set(fallbackTargets))
    .filter(targetId => !explicitTargetIds.has(targetId))
    .map(targetId => ({
      animation: 'sparkle' as const,
      targetObjectId: targetId,
    }));

  return dedupeObjectEffects([
    ...explicitObjectEffects,
    ...fallbackObjectEffects,
  ]);
}

function getSuccessSoundEffect(step: SceneStep) {
  return step.effects?.find(effect => effect.type === 'sound')?.sound;
}

function dedupeObjectEffects(objectEffects: StepObjectEffect[]) {
  const seenTargetIds = new Set<EntityId>();

  return objectEffects.filter(effect => {
    if (seenTargetIds.has(effect.targetObjectId)) {
      return false;
    }

    seenTargetIds.add(effect.targetObjectId);
    return true;
  });
}

function isSupportedObjectEffectAnimation(
  animation?: string,
): animation is StepObjectEffectAnimation {
  return animation === 'bounce' || animation === 'shake' || animation === 'sparkle';
}
