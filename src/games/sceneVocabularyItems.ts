import type { ImageSourcePropType } from 'react-native';

import { getUniqueSceneVocabularyVisualEntries } from '../engine/VocabularyVisualResolver';
import type { LearningMode, PercentRect, Scene } from '../types/lesson';

export type SceneVocabularyPlayItem = {
  assetSource: string;
  id: string;
  imageSource: ImageSourcePropType;
  initialPosition: NormalizedVocabularyPosition;
  meaningVi: string;
  visualId: string;
  word: string;
};

export type NormalizedVocabularyPosition = {
  x: number;
  y: number;
};

export type SceneVocabularyDefaultPosition = NormalizedVocabularyPosition & {
  itemId: string;
};

const nearbyOffsets: readonly NormalizedVocabularyPosition[] = [
  { x: 0, y: 0 },
  { x: 0.12, y: 0 },
  { x: -0.12, y: 0 },
  { x: 0, y: 0.12 },
  { x: 0, y: -0.12 },
  { x: 0.1, y: 0.1 },
  { x: -0.1, y: 0.1 },
  { x: 0.1, y: -0.1 },
  { x: -0.1, y: -0.1 },
];

const fallbackGrid: readonly NormalizedVocabularyPosition[] = [
  { x: 0.16, y: 0.22 },
  { x: 0.39, y: 0.22 },
  { x: 0.62, y: 0.22 },
  { x: 0.84, y: 0.22 },
  { x: 0.16, y: 0.46 },
  { x: 0.39, y: 0.46 },
  { x: 0.62, y: 0.46 },
  { x: 0.84, y: 0.46 },
  { x: 0.16, y: 0.7 },
  { x: 0.39, y: 0.7 },
  { x: 0.62, y: 0.7 },
  { x: 0.84, y: 0.7 },
];

/**
 * Builds the visual vocabulary playground for one scene. Words without an
 * authored, unique visual are intentionally omitted from this image-first
 * activity while remaining available to the lesson and non-visual review.
 */
export function getSceneVocabularyPlayItems(
  sourceScene: Scene,
  learningMode: LearningMode,
): SceneVocabularyPlayItem[] {
  return getUniqueSceneVocabularyVisualEntries(sourceScene, learningMode).map(
    ({ visual, vocabulary }) => ({
      assetSource: visual.assetSource,
      id: vocabulary.id,
      imageSource: visual.imageSource,
      initialPosition: getNormalizedRectCenter(visual.position),
      meaningVi: vocabulary.meaningVi,
      visualId: visual.visualId,
      word: vocabulary.word,
    }),
  );
}

/**
 * Creates a complete, deterministic starting layout. Authored object centers
 * are preferred, while nearby offsets and a safe grid keep distinct visuals
 * from fully covering each other.
 */
export function getDefaultSceneVocabularyPositions(
  items: readonly SceneVocabularyPlayItem[],
): SceneVocabularyDefaultPosition[] {
  const positions: SceneVocabularyDefaultPosition[] = [];

  items.forEach((item, index) => {
    const fallback = fallbackGrid[index % fallbackGrid.length];
    const anchor = item.initialPosition ?? fallback;
    const candidates = [
      ...nearbyOffsets.map(offset => ({
        x: clamp(anchor.x + offset.x, 0.08, 0.92),
        y: clamp(anchor.y + offset.y, 0.12, 0.88),
      })),
      ...fallbackGrid,
    ];
    const position =
      candidates.find(candidate => isPositionFree(candidate, positions)) ??
      fallback;

    positions.push({ itemId: item.id, ...position });
  });

  return positions;
}

function getNormalizedRectCenter(
  rect: PercentRect,
): NormalizedVocabularyPosition {
  return {
    x: clamp((rect.x + rect.width / 2) / 100, 0, 1),
    y: clamp((rect.y + rect.height / 2) / 100, 0, 1),
  };
}

function isPositionFree(
  candidate: NormalizedVocabularyPosition,
  existing: readonly SceneVocabularyDefaultPosition[],
) {
  return existing.every(
    position =>
      Math.abs(position.x - candidate.x) >= 0.105 ||
      Math.abs(position.y - candidate.y) >= 0.1,
  );
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}
