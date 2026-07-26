import type { ImageSourcePropType } from 'react-native';

import { getSceneForLearningMode } from '../data/learningModes';
import { resolveAsset } from '../engine/AssetRegistry';
import type {
  LearningMode,
  Lesson,
  Scene,
  SceneObject,
  VocabularyItem,
} from '../types/lesson';

export type ReviewGameItem = {
  id: string;
  imageSource: ImageSourcePropType;
  meaningVi: string;
  word: string;
};

const defaultReviewItemCount = 4;
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
      scene.vocabulary?.forEach(item => {
        vocabularyById.set(item.id, item);
      });

      getRenderableObjects(scene).forEach(object => {
        if (object.vocabId && !objectByVocabId.has(object.vocabId)) {
          objectByVocabId.set(object.vocabId, object);
        }
      });
    });

  const configuredIds = getConfiguredVocabularyIds(lesson.reviewGame?.config);
  const candidateIds =
    configuredIds.length > 0
      ? configuredIds
      : shuffle(Array.from(vocabularyById.keys()));
  const maxItems = getReviewItemCount(lesson.reviewGame?.config, learningMode);

  return candidateIds
    .map(vocabId =>
      createReviewGameItem(
        vocabularyById.get(vocabId),
        objectByVocabId.get(vocabId),
      ),
    )
    .filter((item): item is ReviewGameItem => Boolean(item))
    .slice(0, maxItems);
}

export function getReviewItemCount(
  config: Record<string, unknown> | undefined,
  learningMode: LearningMode,
) {
  const pairCount = config?.pairCount ?? config?.maxPairs;

  if (typeof pairCount === 'number' && Number.isFinite(pairCount)) {
    return Math.max(2, Math.min(maxReviewItemCount, Math.floor(pairCount)));
  }

  if (learningMode === 'expanded') {
    return 5;
  }
  if (learningMode === 'challenge') {
    return 6;
  }

  return defaultReviewItemCount;
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
    meaningVi: vocabularyItem.meaningVi,
    word: vocabularyItem.word,
  };
}

function getRenderableObjects(scene: Scene) {
  return scene.character ? [scene.character, ...scene.objects] : scene.objects;
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}
