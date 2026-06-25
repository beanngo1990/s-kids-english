import type {
  EntityId,
  Scene,
  SceneInteractionType,
  SceneStep,
} from '../types/lesson';

export type StepInteractionStatus = 'correct' | 'incorrect' | 'ignored';

export type StepInteractionResult = {
  status: StepInteractionStatus;
  feedbackVi?: string;
  effectObjectIds: EntityId[];
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

export function shouldDimObjectForStep(step: SceneStep, objectId: EntityId) {
  if (step.type !== 'teach' && step.type !== 'practice') {
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
      isSceneComplete: false,
      status: 'ignored',
    };
  }

  if (isCorrectObject(step, objectId)) {
    return buildCorrectResult(scene, step, objectId);
  }

  return {
    effectObjectIds: [objectId],
    feedbackVi: step.failFeedbackVi ?? 'Thử lại nhé.',
    isSceneComplete: false,
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
      isSceneComplete: false,
      status: 'ignored',
    };
  }

  if (isCorrectObject(step, objectId) && isInsideDropZone) {
    return buildCorrectResult(scene, step, objectId);
  }

  return {
    effectObjectIds: [objectId],
    feedbackVi: step.failFeedbackVi ?? 'Kéo vào vùng đúng nhé.',
    isSceneComplete: false,
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

  return {
    effectObjectIds: getSuccessEffectObjectIds(step, objectId),
    feedbackVi: step.successFeedbackVi,
    isSceneComplete: !nextStep,
    nextStep,
    status: 'correct',
  };
}

function getSuccessEffectObjectIds(step: SceneStep, objectId?: EntityId) {
  const effectTargetIds =
    step.effects
      ?.map(effect => effect.targetObjectId)
      .filter((targetId): targetId is EntityId => Boolean(targetId)) ?? [];

  return Array.from(
    new Set(
      [
        objectId,
        step.interaction.targetObjectId,
        ...step.targetObjectIds,
        ...effectTargetIds,
      ].filter((targetId): targetId is EntityId => Boolean(targetId)),
    ),
  );
}
