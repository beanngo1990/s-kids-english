import {
  getDefaultSceneVocabularyPositions,
  getSceneVocabularyPlayItems,
} from '../src/games/sceneVocabularyItems';
import { getSceneForLearningMode } from '../src/data/learningModes';
import { lessons } from '../src/data/lessons';
import type { LearningMode, Scene } from '../src/types/lesson';

const scene: Scene = {
  background: {
    id: 'background',
    source: 'lessons/test/scene/images/background.webp',
    type: 'image',
  },
  id: 'scene',
  objects: [
    {
      asset: {
        id: 'apple-base',
        source: 'lessons/test/scene/images/apple.webp',
        type: 'image',
      },
      id: 'apple-object',
      isInteractive: true,
      position: { height: 20, width: 20, x: 10, y: 10 },
      role: 'learning',
      variants: [
        {
          asset: {
            id: 'apple-sliced',
            source: 'lessons/test/scene/images/apple-sliced.webp',
            type: 'image',
          },
          id: 'sliced',
        },
      ],
      vocabId: 'apple',
    },
    {
      asset: {
        id: 'bowl-empty',
        source: 'lessons/test/scene/images/bowl-empty.webp',
        type: 'image',
      },
      id: 'bowl-object',
      isInteractive: true,
      learningScope: { minMode: 'expanded' },
      position: { height: 20, width: 20, x: 35, y: 10 },
      role: 'learning',
      variants: [
        {
          asset: {
            id: 'bowl-filled',
            source: 'lessons/test/scene/images/bowl-filled.webp',
            type: 'image',
          },
          id: 'filled',
        },
      ],
    },
    {
      asset: {
        id: 'carrot-base',
        source: 'lessons/test/scene/images/carrot.webp',
        type: 'image',
      },
      id: 'carrot-object',
      isInteractive: true,
      learningScope: { minMode: 'challenge' },
      position: { height: 20, width: 20, x: 60, y: 10 },
      role: 'learning',
      vocabId: 'carrot',
    },
  ],
  steps: [
    {
      id: 'slice-apple',
      instructionVi: 'Chạm vào quả táo.',
      interaction: { correctObjectIds: ['apple-object'], type: 'tap' },
      successFeedbackVi: 'Đúng rồi.',
      successStateChanges: [
        {
          targetObjectId: 'apple-object',
          type: 'setObjectVariant',
          variantId: 'sliced',
        },
      ],
      targetObjectIds: ['apple-object'],
      type: 'teach',
      vocabId: 'apple',
    },
    {
      id: 'fill-bowl',
      instructionVi: 'Chạm vào chiếc bát.',
      interaction: { correctObjectIds: ['bowl-object'], type: 'tap' },
      learningScope: { minMode: 'expanded' },
      successFeedbackVi: 'Đúng rồi.',
      successStateChanges: [
        {
          targetObjectId: 'bowl-object',
          type: 'setObjectVariant',
          variantId: 'filled',
        },
      ],
      targetObjectIds: ['bowl-object'],
      type: 'teach',
      vocabId: 'fill-the-bowl',
    },
  ],
  titleEn: 'Test scene',
  titleVi: 'Cảnh thử nghiệm',
  vocabulary: [
    {
      id: 'apple',
      level: 'easy',
      meaningVi: 'quả táo',
      type: 'noun',
      word: 'apple',
    },
    {
      id: 'word-without-visual',
      level: 'easy',
      meaningVi: 'xin chào',
      type: 'phrase',
      word: 'hello',
    },
    {
      id: 'fill-the-bowl',
      learningScope: { minMode: 'expanded' },
      level: 'medium',
      meaningVi: 'đổ đầy bát',
      type: 'phrase',
      word: 'fill the bowl',
    },
    {
      id: 'carrot',
      learningScope: { minMode: 'challenge' },
      level: 'hard',
      meaningVi: 'cà rốt',
      type: 'noun',
      word: 'carrot',
    },
  ],
};

test('scene vocabulary playground keeps only in-scope words with visuals', () => {
  expect(
    getSceneVocabularyPlayItems(scene, 'core').map(item => item.word),
  ).toEqual(['apple']);
  expect(
    getSceneVocabularyPlayItems(scene, 'expanded').map(item => item.word),
  ).toEqual(['apple', 'fill the bowl']);
  expect(
    getSceneVocabularyPlayItems(scene, 'challenge').map(item => item.word),
  ).toEqual(['apple', 'fill the bowl', 'carrot']);
});

test('scene vocabulary playground uses the visual shown when each word is taught', () => {
  const items = getSceneVocabularyPlayItems(scene, 'expanded');
  const directObjectItem = items.find(item => item.id === 'apple');
  const actionItem = items.find(item => item.id === 'fill-the-bowl');
  const fallbackItem = items.find(item => item.id === 'word-without-visual');

  expect(directObjectItem).toMatchObject({
    assetSource: 'lessons/test/scene/images/apple.webp',
    visualId: 'apple-object',
  });
  expect(actionItem).toMatchObject({
    assetSource: 'lessons/test/scene/images/bowl-empty.webp',
    visualId: 'bowl-object',
  });
  expect(fallbackItem).toBeUndefined();
});

test('default playground layout includes every visual and separates collisions', () => {
  const items = getSceneVocabularyPlayItems(scene, 'challenge');
  const positions = getDefaultSceneVocabularyPositions(items);
  const applePosition = positions.find(position => position.itemId === 'apple');

  expect(positions.map(position => position.itemId)).toEqual(
    items.map(item => item.id),
  );
  expect(applePosition).toMatchObject({ x: 0.2, y: 0.2 });
  expect(
    new Set(
      positions.map(
        position => `${position.x.toFixed(3)}:${position.y.toFixed(3)}`,
      ),
    ).size,
  ).toBe(positions.length);
  positions.forEach(position => {
    expect(position.x).toBeGreaterThanOrEqual(0.08);
    expect(position.x).toBeLessThanOrEqual(0.92);
    expect(position.y).toBeGreaterThanOrEqual(0.12);
    expect(position.y).toBeLessThanOrEqual(0.88);
  });
});

test('shared objects use their exact authored timeline variants without duplicates', () => {
  const lesson = lessons.find(item => item.id === 'feed-the-puppy');
  const fillTheBowlScene = lesson?.scenes.find(
    item => item.id === 'fill-the-bowl',
  );

  expect(fillTheBowlScene).toBeDefined();
  const items = getSceneVocabularyPlayItems(fillTheBowlScene!, 'challenge');
  const itemByWord = new Map(items.map(item => [item.word, item]));
  const visualAssetSources = items.flatMap(item =>
    item.assetSource ? [item.assetSource] : [],
  );
  const visualIds = items.flatMap(item =>
    item.visualId ? [item.visualId] : [],
  );

  expect(itemByWord.get('bowl')).toMatchObject({
    visualId: 'fill-the-bowl-story-bowl',
  });
  expect(itemByWord.get('ready')).toMatchObject({
    assetSource: 'lessons/feed-the-puppy/fill-the-bowl/images/bowl-ready.webp',
    visualId: 'fill-the-bowl-story-bowl:ready',
  });
  expect(itemByWord.get('meal')).toMatchObject({
    assetSource:
      'lessons/feed-the-puppy/fill-the-bowl/images/bowl-on-mat-filled.webp',
    visualId: 'fill-the-bowl-story-bowl:on-mat-filled',
  });
  expect(
    [itemByWord.get('food'), itemByWord.get('scoop')].filter(
      item => item?.assetSource,
    ),
  ).toHaveLength(1);
  expect(new Set(visualAssetSources).size).toBe(visualAssetSources.length);
  expect(new Set(visualIds).size).toBe(visualIds.length);
});

test('every catalog scene exposes only unique, resolvable vocabulary visuals', () => {
  const modes: LearningMode[] = ['core', 'expanded', 'challenge'];

  for (const lesson of lessons) {
    for (const catalogScene of lesson.scenes) {
      for (const mode of modes) {
        const expectedIds = getSceneForLearningMode(
          catalogScene,
          mode,
        ).vocabulary.map(item => item.id);
        const actualIds = getSceneVocabularyPlayItems(catalogScene, mode).map(
          item => item.id,
        );
        const positions = getDefaultSceneVocabularyPositions(
          getSceneVocabularyPlayItems(catalogScene, mode),
        );
        const items = getSceneVocabularyPlayItems(catalogScene, mode);
        const visualAssetSources = items.flatMap(item =>
          item.assetSource ? [item.assetSource] : [],
        );
        const visualIds = items.flatMap(item =>
          item.visualId ? [item.visualId] : [],
        );

        expect(actualIds.every(itemId => expectedIds.includes(itemId))).toBe(
          true,
        );
        expect(positions.map(position => position.itemId)).toEqual(actualIds);
        expect(items.every(item => Boolean(item.imageSource))).toBe(true);
        expect(
          new Set(
            positions.map(
              position => `${position.x.toFixed(3)}:${position.y.toFixed(3)}`,
            ),
          ).size,
        ).toBe(positions.length);
        expect(new Set(visualAssetSources).size).toBe(
          visualAssetSources.length,
        );
        expect(new Set(visualIds).size).toBe(visualIds.length);
      }
    }
  }
});
