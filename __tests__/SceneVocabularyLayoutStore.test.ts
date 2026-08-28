import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  SCENE_VOCABULARY_LAYOUTS_STORAGE_KEY,
  clearAllSceneVocabularyLayouts,
  clearSceneVocabularyLayout,
  getSceneVocabularyLayoutKey,
  loadSceneVocabularyLayout,
  loadSceneVocabularyMeaningEnabled,
  saveSceneVocabularyLayout,
  saveSceneVocabularyMeaningEnabled,
} from '../src/engine/SceneVocabularyLayoutStore';

describe('SceneVocabularyLayoutStore', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test('keeps a separate placement layout for each scene and learning mode', async () => {
    await Promise.all([
      saveSceneVocabularyLayout('lesson-a', 'scene-a', 'core', [
        { itemId: 'apple', x: 0.2, y: 0.3, zIndex: 2 },
      ]),
      saveSceneVocabularyLayout('lesson-a', 'scene-a', 'challenge', [
        { itemId: 'apple', x: 0.8, y: 0.7, zIndex: 9 },
      ]),
      saveSceneVocabularyLayout('lesson-a', 'scene-b', 'core', [
        { itemId: 'ball', x: 0.4, y: 0.6, zIndex: 4 },
      ]),
    ]);

    await expect(
      loadSceneVocabularyLayout('lesson-a', 'scene-a', 'core'),
    ).resolves.toEqual([{ itemId: 'apple', x: 0.2, y: 0.3, zIndex: 2 }]);
    await expect(
      loadSceneVocabularyLayout('lesson-a', 'scene-a', 'challenge'),
    ).resolves.toEqual([{ itemId: 'apple', x: 0.8, y: 0.7, zIndex: 9 }]);
    await expect(
      loadSceneVocabularyLayout('lesson-a', 'scene-b', 'core'),
    ).resolves.toEqual([{ itemId: 'ball', x: 0.4, y: 0.6, zIndex: 4 }]);
  });

  test('normalizes malformed persisted placements without losing valid data', async () => {
    const layoutKey = getSceneVocabularyLayoutKey(
      'lesson-a',
      'scene-a',
      'expanded',
    );
    await AsyncStorage.setItem(
      SCENE_VOCABULARY_LAYOUTS_STORAGE_KEY,
      JSON.stringify({
        layouts: {
          [layoutKey]: {
            placements: [
              { itemId: 'apple', x: -2, y: 1.4, zIndex: 3.6 },
              { itemId: '', x: 0.5, y: 0.5, zIndex: 2 },
              { itemId: 'broken', x: 'left', y: 0.5, zIndex: 2 },
            ],
            updatedAt: 'not-a-date',
          },
          malformed: {
            placements: [{ itemId: 'ignored', x: 0.5, y: 0.5, zIndex: 1 }],
          },
        },
        version: 1,
      }),
    );

    await expect(
      loadSceneVocabularyLayout('lesson-a', 'scene-a', 'expanded'),
    ).resolves.toEqual([{ itemId: 'apple', x: 0, y: 1, zIndex: 4 }]);
    await expect(loadSceneVocabularyMeaningEnabled()).resolves.toBe(false);
  });

  test('remembers one device-wide meaning preference independently of layouts', async () => {
    await expect(loadSceneVocabularyMeaningEnabled()).resolves.toBe(false);

    await saveSceneVocabularyMeaningEnabled(true);
    await saveSceneVocabularyLayout('lesson-a', 'scene-a', 'core', [
      { itemId: 'apple', x: 0.2, y: 0.3, zIndex: 2 },
    ]);
    await clearSceneVocabularyLayout('lesson-a', 'scene-a', 'core');

    await expect(loadSceneVocabularyMeaningEnabled()).resolves.toBe(true);

    await saveSceneVocabularyMeaningEnabled(false);
    await expect(
      AsyncStorage.getItem(SCENE_VOCABULARY_LAYOUTS_STORAGE_KEY),
    ).resolves.toBeNull();
  });

  test('clears one layout independently and can clear the complete local store', async () => {
    await saveSceneVocabularyLayout('lesson-a', 'scene-a', 'core', [
      { itemId: 'apple', x: 0.2, y: 0.3, zIndex: 2 },
    ]);
    await saveSceneVocabularyLayout('lesson-a', 'scene-b', 'core', [
      { itemId: 'ball', x: 0.4, y: 0.6, zIndex: 4 },
    ]);

    await clearSceneVocabularyLayout('lesson-a', 'scene-a', 'core');

    await expect(
      loadSceneVocabularyLayout('lesson-a', 'scene-a', 'core'),
    ).resolves.toEqual([]);
    await expect(
      loadSceneVocabularyLayout('lesson-a', 'scene-b', 'core'),
    ).resolves.toHaveLength(1);

    await clearAllSceneVocabularyLayouts();

    await expect(
      AsyncStorage.getItem(SCENE_VOCABULARY_LAYOUTS_STORAGE_KEY),
    ).resolves.toBeNull();
  });
});
