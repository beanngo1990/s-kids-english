import type { ImageSourcePropType } from 'react-native';

import { getSceneForLearningMode } from '../data/learningModes';
import { resolveAsset } from '../engine/AssetRegistry';
import type {
  LearningMode,
  Lesson,
  Scene,
  SceneObject,
  VocabularyItem,
  VocabularyLevel,
} from '../types/lesson';
import {
  compareVocabularyLevels,
  getReviewDifficultyProfile,
  isVocabularyLevelAvailable,
} from './difficulty';

export type ReviewGameItem = {
  id: string;
  imageSource: ImageSourcePropType;
  level: VocabularyLevel;
  meaningVi: string;
  visualId: string;
  word: string;
};

export type LessonVocabularyVisual = Pick<
  ReviewGameItem,
  'imageSource' | 'visualId'
>;

const maxReviewItemCount = 6;

export function getReviewGameItems(
  lesson: Lesson,
  learningMode: LearningMode,
): ReviewGameItem[] {
  const { objectByVocabId, vocabularyById } = collectVocabularyContext(
    lesson,
    learningMode,
  );
  const vocabularyVisuals = createVocabularyVisuals(objectByVocabId);
  const configuredIds = getConfiguredVocabularyIds(lesson.reviewGame?.config);
  const maxItems = getReviewItemCount(lesson.reviewGame?.config, learningMode);
  const availableItems = Array.from(vocabularyById.values())
    .filter(item => isVocabularyLevelAvailable(item.level, learningMode))
    .map(item => createReviewGameItem(item, vocabularyVisuals.get(item.id)))
    .filter((item): item is ReviewGameItem => Boolean(item));
  const availableItemsById = new Map(
    availableItems.map(item => [item.id, item]),
  );
  const authoredItems = configuredIds
    .map(vocabId => availableItemsById.get(vocabId))
    .filter((item): item is ReviewGameItem => Boolean(item));
  const authoredIds = new Set(authoredItems.map(item => item.id));
  const supplementalItems = availableItems.filter(
    item => !authoredIds.has(item.id),
  );

  return selectReviewItems(
    authoredItems,
    supplementalItems,
    learningMode,
    maxItems,
  );
}

export function getLessonVocabularyVisuals(
  lesson: Lesson,
  learningMode: LearningMode,
): Map<string, LessonVocabularyVisual> {
  const { objectByVocabId } = collectVocabularyContext(lesson, learningMode);
  return createVocabularyVisuals(objectByVocabId);
}

function collectVocabularyContext(
  lesson: Lesson,
  learningMode: LearningMode,
) {
  const vocabularyById = new Map<string, VocabularyItem>();
  const objectByVocabId = new Map<string, SceneObject>();

  lesson.scenes
    .map(scene => getSceneForLearningMode(scene, learningMode))
    .forEach(scene => {
      const renderableObjects = getRenderableObjects(scene);
      const objectById = new Map(
        renderableObjects.map(object => [object.id, object]),
      );

      scene.vocabulary?.forEach(item => {
        vocabularyById.set(item.id, item);
      });

      renderableObjects.forEach(object => {
        if (object.vocabId && !objectByVocabId.has(object.vocabId)) {
          objectByVocabId.set(object.vocabId, object);
        }
      });

      scene.steps.forEach(step => {
        if (!step.vocabId || objectByVocabId.has(step.vocabId)) {
          return;
        }

        const representativeObject = step.targetObjectIds
          .map(objectId => objectById.get(objectId))
          .find((object): object is SceneObject => Boolean(object));
        if (representativeObject) {
          objectByVocabId.set(step.vocabId, representativeObject);
        }
      });
    });

  return { objectByVocabId, vocabularyById };
}

export function getReviewItemCount(
  config: Record<string, unknown> | undefined,
  learningMode: LearningMode,
) {
  const pairCount = config?.pairCount ?? config?.maxPairs;

  if (typeof pairCount === 'number' && Number.isFinite(pairCount)) {
    return Math.max(2, Math.min(maxReviewItemCount, Math.floor(pairCount)));
  }

  return getReviewDifficultyProfile(learningMode).itemCount;
}

function selectReviewItems(
  authoredItems: ReviewGameItem[],
  supplementalItems: ReviewGameItem[],
  learningMode: LearningMode,
  maxItems: number,
) {
  const selectedItems: ReviewGameItem[] = [];
  for (const item of authoredItems) {
    if (selectedItems.length >= maxItems) {
      break;
    }
    if (!selectedItems.some(selected => selected.visualId === item.visualId)) {
      selectedItems.push(item);
    }
  }
  const remainingItems = [...supplementalItems];
  const minimumLevelCounts: Partial<Record<VocabularyLevel, number>> =
    learningMode === 'challenge'
      ? { hard: 1, medium: 1 }
      : learningMode === 'expanded'
      ? { medium: 1 }
      : {};

  for (const level of ['medium', 'hard'] as const) {
    const minimumCount = minimumLevelCounts[level] ?? 0;
    while (
      selectedItems.length < maxItems &&
      selectedItems.filter(item => item.level === level).length < minimumCount
    ) {
      const nextIndex = remainingItems.findIndex(
        item =>
          item.level === level &&
          !selectedItems.some(selected => selected.visualId === item.visualId),
      );
      if (nextIndex < 0) {
        break;
      }
      selectedItems.push(remainingItems.splice(nextIndex, 1)[0]);
    }
  }

  remainingItems.sort((left, right) =>
    compareVocabularyLevels(left.level, right.level),
  );
  for (const item of remainingItems) {
    if (selectedItems.length >= maxItems) {
      break;
    }
    if (!selectedItems.some(selected => selected.visualId === item.visualId)) {
      selectedItems.push(item);
    }
  }

  return selectedItems.sort((left, right) =>
    compareVocabularyLevels(left.level, right.level),
  );
}

function getConfiguredVocabularyIds(
  config: Record<string, unknown> | undefined,
) {
  const vocabularyIds = config?.vocabularyIds;

  return Array.isArray(vocabularyIds)
    ? vocabularyIds.filter(
        (vocabId): vocabId is string => typeof vocabId === 'string',
      )
    : [];
}

function createReviewGameItem(
  vocabularyItem: VocabularyItem | undefined,
  visual: LessonVocabularyVisual | undefined,
) {
  if (!vocabularyItem || !visual) {
    return undefined;
  }

  return {
    id: vocabularyItem.id,
    imageSource: visual.imageSource,
    level: vocabularyItem.level,
    meaningVi: vocabularyItem.meaningVi,
    visualId: visual.visualId,
    word: vocabularyItem.word,
  };
}

function createVocabularyVisuals(
  objectByVocabId: Map<string, SceneObject>,
) {
  const visuals = new Map<string, LessonVocabularyVisual>();

  objectByVocabId.forEach((object, vocabId) => {
    const imageSource = resolveAsset(object.asset.source);
    if (imageSource) {
      visuals.set(vocabId, { imageSource, visualId: object.id });
    }
  });

  return visuals;
}

function getRenderableObjects(scene: Scene) {
  return scene.character ? [scene.character, ...scene.objects] : scene.objects;
}
