import type { ImageSourcePropType } from 'react-native';

import { getSceneForLearningMode } from '../data/learningModes';
import type {
  AssetRef,
  LearningMode,
  Lesson,
  PercentRect,
  Scene,
  SceneObject,
  SceneStateChange,
  SceneStep,
  VocabularyItem,
  VocabularyType,
} from '../types/lesson';
import { resolveAsset } from './AssetRegistry';

export type VocabularyVisual = {
  assetSource: string;
  imageSource: ImageSourcePropType;
  match: 'direct' | 'step';
  objectId: string;
  position: PercentRect;
  variantId?: string;
  visualId: string;
};

export type SceneVocabularyVisualEntry = {
  visual: VocabularyVisual;
  vocabulary: VocabularyItem;
};

const vocabularyTypePriority: Record<VocabularyType, number> = {
  noun: 0,
  verb: 1,
  adjective: 2,
  phrase: 3,
};

/**
 * Resolves the exact object artwork visible when each vocabulary teach step
 * starts. This keeps lesson review visuals aligned with the authored scene
 * timeline instead of always falling back to an object's base asset.
 */
export function getSceneVocabularyVisualEntries(
  sourceScene: Scene,
  learningMode: LearningMode,
): SceneVocabularyVisualEntry[] {
  const scene = getSceneForLearningMode(sourceScene, learningMode);
  const objects = getRenderableObjects(scene);
  const objectsById = new Map(objects.map(object => [object.id, object]));
  const variantTimeline = createVariantTimeline(scene, objects);

  return scene.vocabulary.flatMap(vocabulary => {
    const step = scene.steps.find(item => item.vocabId === vocabulary.id);
    const directObject = objects.find(
      object => object.vocabId === vocabulary.id,
    );
    const stepObject = step
      ? getStepCandidateIds(step)
          .map(objectId => objectsById.get(objectId))
          .find((object): object is SceneObject => Boolean(object))
      : undefined;
    const object = directObject ?? stepObject;

    if (!object) {
      return [];
    }

    const variantId = step
      ? variantTimeline.get(step.id)?.get(object.id)
      : object.initialVariantId;
    const variant = object.variants?.find(item => item.id === variantId);
    const asset: AssetRef = variant?.asset ?? object.asset;
    const position = variant?.position ?? object.position;
    const imageSource = resolveAsset(asset.source);

    if (!imageSource) {
      return [];
    }

    return [
      {
        visual: {
          assetSource: asset.source,
          imageSource,
          match: directObject ? 'direct' : 'step',
          objectId: object.id,
          position,
          variantId,
          visualId: variantId ? `${object.id}:${variantId}` : object.id,
        },
        vocabulary,
      },
    ];
  });
}

/**
 * Keeps the strongest vocabulary label for each distinct visual. Concrete
 * nouns win visual conflicts, followed by direct vocab-object ownership and
 * then authored order.
 */
export function getUniqueSceneVocabularyVisualEntries(
  sourceScene: Scene,
  learningMode: LearningMode,
): SceneVocabularyVisualEntry[] {
  const entries = getSceneVocabularyVisualEntries(sourceScene, learningMode);
  const rankedEntries = entries
    .map((entry, index) => ({ entry, index }))
    .sort((left, right) => {
      const typePriority =
        vocabularyTypePriority[left.entry.vocabulary.type] -
        vocabularyTypePriority[right.entry.vocabulary.type];
      if (typePriority !== 0) {
        return typePriority;
      }

      const matchPriority =
        getMatchPriority(left.entry.visual.match) -
        getMatchPriority(right.entry.visual.match);
      return matchPriority === 0 ? left.index - right.index : matchPriority;
    });
  const selectedIndexes = new Set<number>();
  const claimedVisuals: VocabularyVisual[] = [];

  rankedEntries.forEach(({ entry, index }) => {
    if (
      claimedVisuals.some(visual =>
        areVocabularyVisualsEquivalent(visual, entry.visual),
      )
    ) {
      return;
    }

    claimedVisuals.push(entry.visual);
    selectedIndexes.add(index);
  });

  return entries.filter((_, index) => selectedIndexes.has(index));
}

export function getLessonVocabularyVisuals(
  lesson: Lesson,
  learningMode: LearningMode,
): Map<string, VocabularyVisual> {
  const visuals = new Map<string, VocabularyVisual>();

  lesson.scenes.forEach(scene => {
    getSceneVocabularyVisualEntries(scene, learningMode).forEach(entry => {
      if (!visuals.has(entry.vocabulary.id)) {
        visuals.set(entry.vocabulary.id, entry.visual);
      }
    });
  });

  return visuals;
}

export function hasSceneVocabularyVisuals(
  scene: Scene,
  learningMode: LearningMode,
): boolean {
  return getUniqueSceneVocabularyVisualEntries(scene, learningMode).length > 0;
}

export function areVocabularyVisualsEquivalent(
  left: Pick<VocabularyVisual, 'assetSource' | 'visualId'>,
  right: Pick<VocabularyVisual, 'assetSource' | 'visualId'>,
): boolean {
  return (
    left.visualId === right.visualId || left.assetSource === right.assetSource
  );
}

function createVariantTimeline(
  scene: Scene,
  objects: SceneObject[],
): Map<string, Map<string, string | undefined>> {
  const currentVariants = new Map<string, string | undefined>(
    objects.map(object => [object.id, object.initialVariantId]),
  );
  const variantsBeforeStep = new Map<string, Map<string, string | undefined>>();

  scene.steps.forEach(step => {
    variantsBeforeStep.set(step.id, new Map(currentVariants));
    applyVariantChanges(currentVariants, step.successStateChanges);
    applyVariantChanges(currentVariants, step.afterSuccessStateChanges);
  });

  return variantsBeforeStep;
}

function applyVariantChanges(
  variants: Map<string, string | undefined>,
  changes: SceneStateChange[] | undefined,
) {
  changes?.forEach(change => {
    if (change.type === 'setObjectVariant') {
      variants.set(change.targetObjectId, change.variantId);
    }
  });
}

function getStepCandidateIds(step: SceneStep) {
  return [
    ...step.targetObjectIds,
    ...(step.interaction.correctObjectIds ?? []),
    ...(step.interaction.targetObjectId
      ? [step.interaction.targetObjectId]
      : []),
  ];
}

function getMatchPriority(match: VocabularyVisual['match']): number {
  return match === 'direct' ? 0 : 1;
}

function getRenderableObjects(scene: Scene): SceneObject[] {
  return scene.character ? [scene.character, ...scene.objects] : scene.objects;
}
