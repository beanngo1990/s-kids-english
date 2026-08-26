import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { lessons } from '../src/data/lessons';
import { playWordNarration } from '../src/engine/AudioManager';
import {
  clearAllSceneVocabularyLayouts,
  loadSceneVocabularyLayout,
  saveSceneVocabularyLayout,
} from '../src/engine/SceneVocabularyLayoutStore';
import {
  getDefaultSceneVocabularyPositions,
  getSceneVocabularyPlayItems,
} from '../src/games/sceneVocabularyItems';
import { SceneVocabularyPlaygroundScreen } from '../src/screens/SceneVocabularyPlaygroundScreen';

let mockReduceMotion = false;

jest.mock('../src/engine/AudioManager', () => ({
  playTapSound: jest.fn(() => Promise.resolve()),
  playWordNarration: jest.fn(() => Promise.resolve('completed')),
  speakVi: jest.fn(() => Promise.resolve()),
  speakWord: jest.fn(() => Promise.resolve()),
  startNarrationSession: jest.fn(() => ({
    isActive: () => true,
    ready: Promise.resolve(),
  })),
}));

jest.mock('../src/engine/AssetRegistry', () => ({
  prefetchAssets: jest.fn(() => Promise.resolve(true)),
  resolveAsset: jest.fn((source: string) => ({ uri: `test://${source}` })),
}));

jest.mock('../src/engine/useContentAccess', () => ({
  useContentAccess: () => ({
    isAccessGranted: true,
    isResolving: false,
  }),
}));

jest.mock('../src/theme/motion', () => ({
  useReducedMotion: () => mockReduceMotion,
}));

beforeEach(async () => {
  jest.clearAllMocks();
  await clearAllSceneVocabularyLayouts();
});

afterEach(() => {
  mockReduceMotion = false;
  jest.useRealTimers();
});

test('keeps every word on the picture for listening, moving and restoring', async () => {
  jest.useFakeTimers();
  const lesson = lessons[0];
  const scene = lesson.scenes[0];
  const learningMode = 'core' as const;
  const items = getSceneVocabularyPlayItems(scene, learningMode);
  const navigation = {
    canGoBack: jest.fn(() => true),
    goBack: jest.fn(),
    navigate: jest.fn(),
    replace: jest.fn(),
  };
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <GestureHandlerRootView>
        <SceneVocabularyPlaygroundScreen
          navigation={navigation as never}
          route={{
            key: 'SceneVocabularyPlayground',
            name: 'SceneVocabularyPlayground',
            params: {
              learningMode,
              lessonId: lesson.id,
              sceneId: scene.id,
            },
          }}
        />
      </GestureHandlerRootView>,
    );
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(
    new Set(
      tree?.root
        .findAll(
          node =>
            typeof node.props.testID === 'string' &&
            node.props.testID.startsWith('scene-vocabulary-object-'),
        )
        .map(node => node.props.testID),
    ),
  ).toEqual(new Set(items.map(item => `scene-vocabulary-object-${item.id}`)));
  expect(
    tree?.root.findAll(
      node => node.props.testID === 'scene-vocabulary-tray-toggle',
    ),
  ).toHaveLength(0);
  expect(
    tree?.root.findAll(
      node =>
        typeof node.props.testID === 'string' &&
        node.props.testID.startsWith('scene-vocabulary-delete-'),
    ),
  ).toHaveLength(0);
  expect(
    tree?.root.findAll(node => node.props.children === 'Xong rồi'),
  ).toHaveLength(0);

  const firstItem = items[0];
  const placedObject = tree?.root.findAll(
    node => node.props.testID === `scene-vocabulary-object-${firstItem.id}`,
  )[0];
  expect(placedObject).toBeDefined();

  ReactTestRenderer.act(() => {
    placedObject?.props.onAccessibilityTap();
  });
  expect(playWordNarration).toHaveBeenCalledWith(
    firstItem.word,
    undefined,
    expect.objectContaining({ isActive: expect.any(Function) }),
  );
  expect(
    tree?.root.findAll(
      node => node.props.testID === `scene-vocabulary-halo-${firstItem.id}`,
    ).length,
  ).toBeGreaterThan(0);
  expect(
    tree?.root.findAll(
      node => node.props.testID === `scene-vocabulary-sparkles-${firstItem.id}`,
    ).length,
  ).toBeGreaterThan(0);
  const wordFeedback = tree?.root.findAll(
    node => node.props.testID === `scene-vocabulary-word-${firstItem.id}`,
  )[0];
  expect(wordFeedback).toBeDefined();
  expect(
    wordFeedback?.findAll(node => node.props.children === firstItem.word)
      .length,
  ).toBeGreaterThan(0);

  ReactTestRenderer.act(() => {
    jest.advanceTimersByTime(1900);
  });
  expect(
    tree?.root.findAll(
      node => node.props.testID === `scene-vocabulary-word-${firstItem.id}`,
    ),
  ).toHaveLength(0);

  const placementDetector = tree?.root.findAll(node =>
    node.props.gesture?.gestures?.some(
      (gesture: { config?: { testID?: string } }) =>
        gesture.config?.testID === `scene-vocabulary-placement-${firstItem.id}`,
    ),
  )[0];
  const placementGestures = placementDetector?.props.gesture.gestures as
    | Array<{
        config?: { maxDist?: number; minDist?: number; testID?: string };
      }>
    | undefined;
  expect(placementGestures).toBeDefined();
  expect(
    placementGestures?.find(
      gesture =>
        gesture.config?.testID === `scene-vocabulary-placement-${firstItem.id}`,
    )?.config?.minDist,
  ).toBe(6);
  expect(
    placementGestures?.find(gesture => gesture.config?.maxDist !== undefined)
      ?.config?.maxDist,
  ).toBe(5);

  const canvas = tree?.root.findAll(
    node =>
      node.props.testID === 'scene-vocabulary-canvas' &&
      typeof node.props.onLayout === 'function',
  )[0];
  ReactTestRenderer.act(() => {
    canvas?.props.onLayout({
      nativeEvent: { layout: { height: 640, width: 320 } },
    });
  });

  const updatedPlacementDetector = tree?.root.findAll(node =>
    node.props.gesture?.gestures?.some(
      (gesture: { config?: { testID?: string } }) =>
        gesture.config?.testID === `scene-vocabulary-placement-${firstItem.id}`,
    ),
  )[0];
  const placementGesture =
    updatedPlacementDetector?.props.gesture.gestures.find(
      (candidate: { config?: { testID?: string } }) =>
        candidate.config?.testID ===
        `scene-vocabulary-placement-${firstItem.id}`,
    ) as
      | {
          config?: {
            onActivate?: () => void;
            onDeactivate?: () => void;
            onUpdate?: (event: {
              translationX: number;
              translationY: number;
            }) => void;
          };
        }
      | undefined;
  ReactTestRenderer.act(() => {
    placementGesture?.config?.onActivate?.();
    placementGesture?.config?.onUpdate?.({
      translationX: 32,
      translationY: 64,
    });
    placementGesture?.config?.onDeactivate?.();
  });

  const defaultPosition = getDefaultSceneVocabularyPositions(items).find(
    position => position.itemId === firstItem.id,
  );
  const savedPlacements = await loadSceneVocabularyLayout(
    lesson.id,
    scene.id,
    learningMode,
  );
  expect(savedPlacements).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        itemId: firstItem.id,
        x: Math.min(0.94, (defaultPosition?.x ?? 0) + 0.1),
        y: Math.min(0.92, (defaultPosition?.y ?? 0) + 0.1),
      }),
    ]),
  );

  const resetButton = tree?.root.findAll(
    node => node.props.testID === 'scene-vocabulary-reset',
  )[0];
  ReactTestRenderer.act(() => {
    resetButton?.props.onPress();
  });
  expect(
    tree?.root.findAll(
      node => node.props.testID === `scene-vocabulary-object-${firstItem.id}`,
    ).length,
  ).toBeGreaterThan(0);
  await expect(
    loadSceneVocabularyLayout(lesson.id, scene.id, learningMode),
  ).resolves.toEqual([]);

  const closeButton = tree?.root.findAll(
    node => node.props.testID === 'scene-vocabulary-close',
  )[0];
  ReactTestRenderer.act(() => {
    closeButton?.props.onPress();
  });
  expect(navigation.goBack).toHaveBeenCalledTimes(1);

  expect(
    tree?.root.findAll(node => node.props.testID === 'scene-vocabulary-back'),
  ).toHaveLength(0);

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('restores a saved object position when the playground opens again', async () => {
  const lesson = lessons[0];
  const scene = lesson.scenes[0];
  const learningMode = 'core' as const;
  const firstItem = getSceneVocabularyPlayItems(scene, learningMode)[0];
  await saveSceneVocabularyLayout(lesson.id, scene.id, learningMode, [
    { itemId: firstItem.id, x: 0.82, y: 0.74, zIndex: 42 },
    { itemId: 'removed-vocabulary-item', x: 0.1, y: 0.1, zIndex: 80 },
  ]);
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <GestureHandlerRootView>
        <SceneVocabularyPlaygroundScreen
          navigation={
            {
              canGoBack: jest.fn(() => true),
              goBack: jest.fn(),
              navigate: jest.fn(),
              replace: jest.fn(),
            } as never
          }
          route={{
            key: 'SceneVocabularyPlayground',
            name: 'SceneVocabularyPlayground',
            params: {
              learningMode,
              lessonId: lesson.id,
              sceneId: scene.id,
            },
          }}
        />
      </GestureHandlerRootView>,
    );
    await Promise.resolve();
    await Promise.resolve();
  });

  const canvas = tree?.root.findAll(
    node =>
      node.props.testID === 'scene-vocabulary-canvas' &&
      typeof node.props.onLayout === 'function',
  )[0];
  ReactTestRenderer.act(() => {
    canvas?.props.onLayout({
      nativeEvent: { layout: { height: 640, width: 320 } },
    });
  });

  const placedObject = tree?.root.findAll(
    node =>
      node.props.testID === `scene-vocabulary-object-${firstItem.id}` &&
      typeof node.props.onAccessibilityTap === 'function',
  )[0];
  const placedObjectStyle = StyleSheet.flatten(placedObject?.props.style);
  const transforms = placedObjectStyle.transform as Array<
    Record<string, { __getValue: () => number }>
  >;
  expect(transforms[0].translateX.__getValue()).toBeCloseTo(0.82 * 320);
  expect(transforms[1].translateY.__getValue()).toBeCloseTo(0.74 * 640);
  expect(placedObjectStyle.zIndex).toBe(42);

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('keeps tap feedback calm when Reduce Motion is enabled', async () => {
  mockReduceMotion = true;
  const lesson = lessons[0];
  const scene = lesson.scenes[0];
  const learningMode = 'core' as const;
  const firstItem = getSceneVocabularyPlayItems(scene, learningMode)[0];
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <GestureHandlerRootView>
        <SceneVocabularyPlaygroundScreen
          navigation={
            {
              canGoBack: jest.fn(() => true),
              goBack: jest.fn(),
              navigate: jest.fn(),
              replace: jest.fn(),
            } as never
          }
          route={{
            key: 'SceneVocabularyPlayground',
            name: 'SceneVocabularyPlayground',
            params: {
              learningMode,
              lessonId: lesson.id,
              sceneId: scene.id,
            },
          }}
        />
      </GestureHandlerRootView>,
    );
    await Promise.resolve();
  });

  const placedObject = tree?.root.findAll(
    node => node.props.testID === `scene-vocabulary-object-${firstItem.id}`,
  )[0];
  ReactTestRenderer.act(() => {
    placedObject?.props.onAccessibilityTap();
  });

  expect(
    tree?.root.findAll(
      node => node.props.testID === `scene-vocabulary-halo-${firstItem.id}`,
    ).length,
  ).toBeGreaterThan(0);
  expect(
    tree?.root.findAll(
      node => node.props.testID === `scene-vocabulary-word-${firstItem.id}`,
    ).length,
  ).toBeGreaterThan(0);
  expect(
    tree?.root.findAll(
      node => node.props.testID === `scene-vocabulary-sparkles-${firstItem.id}`,
    ),
  ).toHaveLength(0);

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('wraps a long phrase inside an adaptive bubble without truncating it', async () => {
  const longestVisualEntry = lessons
    .flatMap(lesson =>
      lesson.scenes.flatMap(scene =>
        getSceneVocabularyPlayItems(scene, 'challenge').map(item => ({
          item,
          lesson,
          scene,
        })),
      ),
    )
    .sort((left, right) => right.item.word.length - left.item.word.length)[0];
  expect(longestVisualEntry.item.word.length).toBeGreaterThan(26);
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <GestureHandlerRootView>
        <SceneVocabularyPlaygroundScreen
          navigation={
            {
              canGoBack: jest.fn(() => true),
              goBack: jest.fn(),
              navigate: jest.fn(),
              replace: jest.fn(),
            } as never
          }
          route={{
            key: 'SceneVocabularyPlayground',
            name: 'SceneVocabularyPlayground',
            params: {
              learningMode: 'challenge',
              lessonId: longestVisualEntry.lesson.id,
              sceneId: longestVisualEntry.scene.id,
            },
          }}
        />
      </GestureHandlerRootView>,
    );
    await Promise.resolve();
  });

  const canvas = tree?.root.findAll(
    node =>
      node.props.testID === 'scene-vocabulary-canvas' &&
      typeof node.props.onLayout === 'function',
  )[0];
  ReactTestRenderer.act(() => {
    canvas?.props.onLayout({
      nativeEvent: { layout: { height: 640, width: 320 } },
    });
  });

  const placedObject = tree?.root.findAll(
    node =>
      node.props.testID ===
      `scene-vocabulary-object-${longestVisualEntry.item.id}`,
  )[0];
  ReactTestRenderer.act(() => {
    placedObject?.props.onAccessibilityTap();
  });

  const wordBubble = tree?.root.findAll(
    node =>
      node.props.testID ===
      `scene-vocabulary-word-${longestVisualEntry.item.id}`,
  )[0];
  const bubbleStyle = StyleSheet.flatten(wordBubble?.props.style);
  expect(bubbleStyle.width).toBeGreaterThan(160);
  expect(bubbleStyle.width).toBeLessThanOrEqual(296);

  const wordText = wordBubble?.findAll(
    node => node.props.children === longestVisualEntry.item.word,
  )[0];
  const wordTextStyle = StyleSheet.flatten(wordText?.props.style);
  expect(wordText?.props.numberOfLines).toBeUndefined();
  expect(wordTextStyle.fontSize).toBe(18);
  expect(wordTextStyle.lineHeight).toBe(24);

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});
