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

const maxReviewItemCount = 6;

export function getReviewGameItems(
  lesson: Lesson,
  learningMode: LearningMode,
): ReviewGameItem[] {
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

  const configuredIds = getConfiguredVocabularyIds(lesson.reviewGame?.config);
  const maxItems = getReviewItemCount(lesson.reviewGame?.config, learningMode);
  const availableItems = Array.from(vocabularyById.values())
    .filter(item => isVocabularyLevelAvailable(item.level, learningMode))
    .map(item => createReviewGameItem(item, objectByVocabId.get(item.id)))
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
  object: SceneObject | undefined,
) {
  if (!vocabularyItem || !object) {
    return undefined;
  }

  const imageSource = resolveAsset(object.asset.source);
  if (!imageSource) {
    return undefined;
  }

  return {
    id: vocabularyItem.id,
    imageSource,
    level: vocabularyItem.level,
    meaningVi: vocabularyItem.meaningVi,
    visualId: object.id,
    word: vocabularyItem.word,
  };
}

function getRenderableObjects(scene: Scene) {
  return scene.character ? [scene.character, ...scene.objects] : scene.objects;
}
