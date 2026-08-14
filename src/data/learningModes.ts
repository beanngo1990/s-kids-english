import type {
  EntityId,
  LearningMode,
  LearningScope,
  Scene,
  SceneObject,
  SceneStateChange,
} from '../types/lesson';

export const learningModes: readonly LearningMode[] = [
  'core',
  'expanded',
  'challenge',
];

export const learningModeLabels: Record<LearningMode, string> = {
  challenge: 'Thử thách',
  core: 'Cơ bản',
  expanded: 'Mở rộng',
};

const learningModeRank: Record<LearningMode, number> = {
  core: 0,
  expanded: 1,
  challenge: 2,
};

type ScopedItem = {
  learningScope?: LearningScope;
};

export function getAvailableLearningModes(scene: Scene, childAge?: number) {
  return learningModes.filter(mode => supportsLearningMode(scene, mode, childAge));
}

export function getSceneForLearningMode(
  scene: Scene,
  mode: LearningMode,
  childAge?: number,
) {
  const vocabulary =
    scene.vocabulary?.filter(item => isInLearningScope(item, mode, childAge)) ??
    [];
  const vocabularyIds = new Set(vocabulary.map(item => item.id));
  const character =
    !scene.character || isInLearningScope(scene.character, mode, childAge)
      ? scene.character
      : undefined;
  const objects = scene.objects.filter(
    object =>
      isInLearningScope(object, mode, childAge) &&
      (!object.vocabId || vocabularyIds.has(object.vocabId)),
  );
  const objectIds = new Set([
    ...(character ? [character.id] : []),
    ...objects.map(object => object.id),
  ]);
  const objectsById = new Map(
    [...(character ? [character] : []), ...objects].map(object => [
      object.id,
      object,
    ]),
  );
  const dropZones =
    scene.dropZones?.filter(dropZone =>
      isInLearningScope(dropZone, mode, childAge),
    ) ?? [];
  const dropZoneIds = new Set(dropZones.map(dropZone => dropZone.id));
  const steps = scene.steps.filter(
    step =>
      isInLearningScope(step, mode, childAge) &&
      (!step.vocabId || vocabularyIds.has(step.vocabId)) &&
      areStepObjectsAvailable(step.targetObjectIds, objectIds) &&
      (!step.interaction.targetObjectId ||
        objectIds.has(step.interaction.targetObjectId)) &&
      (!step.interaction.correctObjectIds ||
        areStepObjectsAvailable(step.interaction.correctObjectIds, objectIds)) &&
      (!step.interaction.dropZoneId ||
        dropZoneIds.has(step.interaction.dropZoneId)),
  );
  const stepIds = new Set(steps.map(step => step.id));

  return {
    ...scene,
    character,
    dropZones,
    objects,
    steps: steps.map(step => {
      const shouldRemoveNextStep =
        step.nextStepId !== undefined && !stepIds.has(step.nextStepId);
      const successStateChanges = step.successStateChanges?.filter(change =>
        isStateChangeAvailable(change, objectsById),
      );
      const afterSuccessStateChanges = step.afterSuccessStateChanges?.filter(
        change => isStateChangeAvailable(change, objectsById),
      );
      const didFilterStateChanges =
        successStateChanges?.length !== step.successStateChanges?.length;
      const didFilterAfterSuccessStateChanges =
        afterSuccessStateChanges?.length !==
        step.afterSuccessStateChanges?.length;

      if (
        !shouldRemoveNextStep &&
        !didFilterStateChanges &&
        !didFilterAfterSuccessStateChanges
      ) {
        return step;
      }

      return {
        ...step,
        ...(didFilterAfterSuccessStateChanges
          ? { afterSuccessStateChanges }
          : {}),
        ...(didFilterStateChanges ? { successStateChanges } : {}),
        ...(shouldRemoveNextStep ? { nextStepId: undefined } : {}),
      };
    }),
    vocabulary,
  };
}

export function isInLearningScope(
  item: ScopedItem | undefined,
  mode: LearningMode,
  childAge?: number,
) {
  const scope = item?.learningScope;
  const minMode = scope?.minMode ?? 'core';
  if (childAge !== undefined && scope?.minAge && childAge < scope.minAge) {
    return false;
  }

  return learningModeRank[mode] >= learningModeRank[minMode];
}

function supportsLearningMode(
  scene: Scene,
  mode: LearningMode,
  childAge?: number,
) {
  if (mode === 'core') {
    return true;
  }

  return (
    scene.vocabulary?.some(item =>
      isMinMode(item.learningScope, mode, childAge),
    ) ||
    scene.objects.some(item => isMinMode(item.learningScope, mode, childAge)) ||
    scene.steps.some(item => isMinMode(item.learningScope, mode, childAge))
  );
}

function isMinMode(
  scope: LearningScope | undefined,
  mode: LearningMode,
  childAge?: number,
) {
  if (childAge !== undefined && scope?.minAge && childAge < scope.minAge) {
    return false;
  }

  return scope?.minMode === mode;
}

function areStepObjectsAvailable(
  objectIds: readonly EntityId[],
  availableObjectIds: Set<EntityId>,
) {
  return objectIds.every(objectId => availableObjectIds.has(objectId));
}

function isStateChangeAvailable(
  change: SceneStateChange,
  availableObjects: Map<EntityId, SceneObject>,
) {
  const targetObject = availableObjects.get(change.targetObjectId);

  if (!targetObject) {
    return false;
  }

  return (
    change.type !== 'setObjectVariant' ||
    targetObject.variants?.some(variant => variant.id === change.variantId) ===
      true
  );
}
