import React from 'react';
import { StyleSheet, Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ScenePlayer } from '../src/engine/ScenePlayer';
import {
  cancelNarration,
  playTeacherPromptNarration,
  speakVi,
  speakWord,
} from '../src/engine/AudioManager';
import { prefetchAssets } from '../src/engine/AssetRegistry';
import {
  prefetchRemoteAssets,
  prepareRemoteAssets,
} from '../src/engine/AssetCacheManager';
import { AppButton } from '../src/components/AppButton';
import { SpeakPracticeControls } from '../src/components/SpeakPracticeControls';
import { SceneObjectRenderer } from '../src/engine/SceneObjectRenderer';
import { KidIconButton } from '../src/components/KidIconButton';
import {
  defaultParentSettings,
  getParentSettings,
} from '../src/engine/ParentSettingsManager';
import { remoteAssetsConfig } from '../src/config/remoteAssets';
import type { LearningMode, Scene } from '../src/types/lesson';
import { darkColors, setActiveColorScheme } from '../src/theme/colors';
import { saveVoiceRecordingCandidate } from '../src/engine/VoiceRecordingStore';

jest.mock('../src/engine/AudioManager', () => {
  const speakViMock = jest.fn((_text: string) => Promise.resolve());
  const speakWordMock = jest.fn((_text: string) => Promise.resolve());
  let narrationGeneration = 0;

  const playSegment = async (
    language: 'en' | 'vi',
    text: string,
    session: { isActive: () => boolean } | undefined,
  ): Promise<'completed' | 'cancelled' | 'failed'> => {
    if (session && !session.isActive()) {
      return 'cancelled';
    }

    try {
      await (language === 'en' ? speakWordMock(text) : speakViMock(text));
    } catch {
      return session && !session.isActive() ? 'cancelled' : 'failed';
    }

    return session && !session.isActive() ? 'cancelled' : 'completed';
  };

  const playTeacherPromptNarrationMock = jest.fn(
    async (
      segments: Array<{ language: 'en' | 'vi'; text: string }>,
      _accent?: string,
      session?: { isActive: () => boolean },
    ): Promise<'completed' | 'cancelled' | 'failed'> => {
      for (const segment of segments) {
        const playbackResult = await playSegment(
          segment.language,
          segment.text,
          session,
        );
        if (playbackResult !== 'completed') {
          return playbackResult;
        }
      }

      return session && !session.isActive() ? 'cancelled' : 'completed';
    },
  );

  return {
    cancelNarration: jest.fn(() => {
      narrationGeneration += 1;
      return Promise.resolve();
    }),
    playCorrectSound: jest.fn(() => Promise.resolve()),
    playSoundEffect: jest.fn(() => Promise.resolve()),
    playTapSound: jest.fn(() => Promise.resolve()),
    playTeacherPromptNarration: playTeacherPromptNarrationMock,
    playWordNarration: jest.fn(
      (text: string, _accent?: string, session?: { isActive: () => boolean }) =>
        playSegment('en', text, session),
    ),
    playWrongSound: jest.fn(() => Promise.resolve()),
    speakTeacherPromptSegments: jest.fn(
      async (
        segments: Array<{ language: 'en' | 'vi'; text: string }>,
        accent?: string,
        session?: { isActive: () => boolean },
      ) => {
        await playTeacherPromptNarrationMock(segments, accent, session);
      },
    ),
    speakVi: speakViMock,
    speakWord: speakWordMock,
    startNarrationSession: jest.fn(() => {
      const generation = narrationGeneration + 1;
      narrationGeneration = generation;
      return {
        isActive: () => narrationGeneration === generation,
        ready: Promise.resolve(),
      };
    }),
  };
});

jest.mock('../src/engine/AssetRegistry', () => ({
  prefetchAssets: jest.fn(() => Promise.resolve(true)),
  resolveAsset: jest.fn(() => undefined),
}));

jest.mock('../src/data/audioManifest', () => ({
  getViAudioAsset: jest.fn((text: string) => ({
    key: `test/audio/vi/${text}.wav`,
    text,
  })),
  getWordAudioAsset: jest.fn((text: string, accent = 'en-US') => ({
    key: `test/audio/${accent}/${text}.wav`,
    text,
  })),
}));

jest.mock('../src/engine/AssetCacheManager', () => ({
  prefetchRemoteAssets: jest.fn(() => Promise.resolve(true)),
  prepareRemoteAssets: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('../src/engine/ParentSettingsManager', () => {
  const actual = jest.requireActual<
    typeof import('../src/engine/ParentSettingsManager')
  >('../src/engine/ParentSettingsManager');

  return {
    ...actual,
    getParentSettings: jest.fn(() =>
      Promise.resolve(actual.defaultParentSettings),
    ),
    subscribeParentSettings: jest.fn(() => jest.fn()),
  };
});

jest.mock('../src/engine/VoiceRecordingStore', () => ({
  saveVoiceRecordingCandidate: jest.fn(() => Promise.resolve()),
}));

const mockedSpeakVi = speakVi as jest.MockedFunction<typeof speakVi>;
const mockedSpeakWord = speakWord as jest.MockedFunction<typeof speakWord>;
const mockedCancelNarration = cancelNarration as jest.MockedFunction<
  typeof cancelNarration
>;
const mockedPlayTeacherPromptNarration =
  playTeacherPromptNarration as jest.MockedFunction<
    typeof playTeacherPromptNarration
  >;
const mockedGetParentSettings = getParentSettings as jest.MockedFunction<
  typeof getParentSettings
>;
const mockedSaveVoiceRecordingCandidate =
  saveVoiceRecordingCandidate as jest.MockedFunction<
    typeof saveVoiceRecordingCandidate
  >;
const mockedPrefetchAssets = prefetchAssets as jest.MockedFunction<
  typeof prefetchAssets
>;
const mockedPrefetchRemoteAssets = prefetchRemoteAssets as jest.MockedFunction<
  typeof prefetchRemoteAssets
>;
const mockedPrepareRemoteAssets = prepareRemoteAssets as jest.MockedFunction<
  typeof prepareRemoteAssets
>;
const mutableRemoteAssetsConfig = remoteAssetsConfig as {
  allowMissingLessonAudio: boolean;
};

const listenScene: Scene = {
  background: {
    id: 'background',
    source: 'background',
    type: 'image',
  },
  id: 'listen-scene',
  objects: [],
  steps: [
    {
      id: 'listen-step',
      instructionVi: 'Con hãy nghe cô nhé.',
      interaction: { type: 'listen' },
      successFeedbackVi: 'Giỏi lắm!',
      targetObjectIds: [],
      type: 'intro',
    },
  ],
  titleEn: 'Listen',
  titleVi: 'Lắng nghe',
};

test('HUD shows the selected mode and progress within the current scene', async () => {
  const tree = await renderScenePlayer(listenScene, 'challenge');

  expect(getTextValues(tree)).toContain('Khó · cảnh 1/1 · bước 1/1');
});

const teachListenScene: Scene = {
  ...listenScene,
  id: 'teach-listen-scene',
  objects: [
    {
      asset: {
        id: 'bed',
        source: 'bed',
        type: 'image',
      },
      id: 'bed',
      isInteractive: true,
      position: { height: 20, width: 20, x: 20, y: 20 },
      role: 'learning',
      vocabId: 'vocab-blanket',
    },
  ],
  steps: [
    {
      ...listenScene.steps[0],
      id: 'teach-listen-step',
      instructionVi: 'Tiếp theo là cái chăn nhé.',
      interaction: { targetObjectId: 'bed', type: 'listen' },
      targetObjectIds: ['bed'],
      type: 'teach',
      vocabId: 'vocab-blanket',
    },
  ],
  vocabulary: [
    {
      id: 'vocab-blanket',
      level: 'easy',
      meaningVi: 'cái chăn',
      type: 'noun',
      word: 'blanket',
    },
  ],
};

const teachTapScene: Scene = {
  ...teachListenScene,
  id: 'teach-tap-scene',
  steps: [
    {
      ...teachListenScene.steps[0],
      id: 'teach-tap-step',
      instructionVi: 'Chạm vào vòi bình tưới nhé.',
      interaction: {
        correctObjectIds: ['bed'],
        targetObjectId: 'bed',
        type: 'tap',
      },
      successFeedbackVi: 'Vòi bình giúp rót nước nhẹ nhàng.',
    },
  ],
  titleEn: 'First watering',
  titleVi: 'Tưới lần đầu',
  vocabulary: [
    {
      id: 'vocab-blanket',
      level: 'easy',
      meaningVi: 'vòi bình tưới',
      type: 'noun',
      word: 'spout',
    },
  ],
};

const optionalTeachListenScene: Scene = {
  ...teachListenScene,
  id: 'optional-teach-listen-scene',
  steps: [
    {
      ...teachListenScene.steps[0],
      speechPractice: 'optional',
    },
  ],
};

const practiceDragScene: Scene = {
  background: {
    id: 'background',
    source: 'background',
    type: 'image',
  },
  dropZones: [
    {
      id: 'table-zone',
      position: { height: 30, width: 40, x: 15, y: 15 },
    },
  ],
  id: 'practice-drag-scene',
  objects: [
    {
      asset: {
        id: 'pencil',
        source: 'pencil',
        type: 'image',
      },
      id: 'pencil',
      isInteractive: true,
      position: { height: 20, width: 20, x: 20, y: 20 },
      role: 'learning',
      vocabId: 'vocab-pencil',
    },
  ],
  steps: [
    {
      id: 'place-pencil',
      instructionVi: 'Đặt bút chì lên bàn.',
      interaction: {
        correctObjectIds: ['pencil'],
        dropZoneId: 'table-zone',
        targetObjectId: 'pencil',
        type: 'drag',
      },
      nextStepId: 'next-step',
      promptText: 'pencil',
      successFeedbackVi: 'Bút chì đã ở trên bàn.',
      targetObjectIds: ['pencil'],
      type: 'practice',
      vocabId: 'vocab-pencil',
    },
    {
      id: 'next-step',
      instructionVi: 'Đây là bước tiếp theo.',
      interaction: { type: 'listen' },
      successFeedbackVi: 'Giỏi lắm!',
      targetObjectIds: [],
      type: 'intro',
    },
  ],
  titleEn: 'Practice',
  titleVi: 'Luyện tập',
  vocabulary: [
    {
      id: 'vocab-pencil',
      level: 'easy',
      meaningVi: 'bút chì',
      type: 'noun',
      word: 'pencil',
    },
  ],
};

const practiceRetryScene: Scene = {
  ...practiceDragScene,
  dropZones: undefined,
  id: 'practice-retry-scene',
  objects: [
    ...practiceDragScene.objects,
    {
      asset: {
        id: 'eraser',
        source: 'eraser',
        type: 'image',
      },
      id: 'eraser',
      isInteractive: true,
      position: { height: 20, width: 20, x: 60, y: 20 },
      role: 'learning',
    },
  ],
  steps: [
    {
      ...practiceDragScene.steps[0],
      failFeedbackVi: 'Chưa đúng, thử lại nhé.',
      interaction: {
        correctObjectIds: ['pencil'],
        targetObjectId: 'pencil',
        type: 'tap',
      },
    },
    practiceDragScene.steps[1],
  ],
};

const autoSpeechPracticeScene: Scene = {
  ...practiceRetryScene,
  id: 'auto-speech-practice-scene',
  steps: [
    {
      ...practiceRetryScene.steps[0],
      speechPractice: 'auto',
    },
    practiceRetryScene.steps[1],
  ],
};

const optionalSpeechPracticeScene: Scene = {
  ...practiceRetryScene,
  id: 'optional-speech-practice-scene',
  steps: [
    {
      ...practiceRetryScene.steps[0],
      speechPractice: 'optional',
    },
    practiceRetryScene.steps[1],
  ],
};

const reviewChoiceScene: Scene = {
  ...practiceRetryScene,
  id: 'review-choice-scene',
  steps: [
    {
      ...practiceRetryScene.steps[0],
      id: 'choose-pencil',
      interaction: {
        correctObjectIds: ['pencil'],
        targetObjectId: 'pencil',
        type: 'tap',
      },
      targetObjectIds: ['pencil', 'eraser'],
      type: 'review',
    },
  ],
};

const sceneStateScene: Scene = {
  background: {
    id: 'state-background',
    source: 'state-background',
    type: 'image',
  },
  id: 'scene-state-scene',
  objects: [
    {
      asset: { id: 'pot-empty', source: 'pot-empty', type: 'image' },
      id: 'pot',
      isInteractive: false,
      position: { height: 20, width: 20, x: 40, y: 50 },
      role: 'decoration',
      variants: [
        {
          asset: { id: 'pot-filled', source: 'pot-filled', type: 'image' },
          id: 'filled',
        },
      ],
    },
    {
      asset: { id: 'seed', source: 'seed', type: 'image' },
      id: 'seed',
      isInteractive: true,
      position: { height: 10, width: 10, x: 20, y: 60 },
      role: 'learning',
    },
    {
      asset: { id: 'sprout', source: 'sprout', type: 'image' },
      id: 'sprout',
      initialVisibility: 'hidden',
      isInteractive: false,
      position: { height: 18, width: 18, x: 42, y: 38 },
      role: 'decoration',
    },
    {
      asset: { id: 'stone', source: 'stone', type: 'image' },
      id: 'stone',
      isInteractive: true,
      position: { height: 10, width: 10, x: 70, y: 60 },
      role: 'decoration',
    },
  ],
  steps: [
    {
      failFeedbackVi: 'Đó chưa phải hạt giống.',
      id: 'plant-seed',
      instructionVi: 'Chạm vào hạt giống nhé.',
      interaction: {
        correctObjectIds: ['seed'],
        targetObjectId: 'seed',
        type: 'tap',
      },
      successFeedbackVi: 'Hạt giống đã được trồng rồi!',
      successStateChanges: [
        {
          targetObjectId: 'pot',
          type: 'setObjectVariant',
          variantId: 'filled',
        },
        { targetObjectId: 'seed', type: 'hideObject' },
        { targetObjectId: 'sprout', type: 'showObject' },
      ],
      targetObjectIds: ['seed'],
      type: 'practice',
    },
  ],
  titleEn: 'Scene state',
  titleVi: 'Trạng thái scene',
};

beforeEach(() => {
  mockedCancelNarration.mockClear();
  mockedPlayTeacherPromptNarration.mockClear();
  mockedSpeakVi.mockReset();
  mockedSpeakVi.mockResolvedValue();
  mockedSpeakWord.mockReset();
  mockedSpeakWord.mockResolvedValue();
  mockedGetParentSettings.mockReset();
  mockedGetParentSettings.mockResolvedValue(defaultParentSettings);
  mockedSaveVoiceRecordingCandidate.mockClear();
  mockedPrefetchAssets.mockReset();
  mockedPrefetchAssets.mockResolvedValue(true);
  mockedPrefetchRemoteAssets.mockReset();
  mockedPrefetchRemoteAssets.mockResolvedValue(true);
  mockedPrepareRemoteAssets.mockReset();
  mockedPrepareRemoteAssets.mockResolvedValue(true);
  mutableRemoteAssetsConfig.allowMissingLessonAudio = false;
});

afterEach(() => {
  jest.useRealTimers();
  setActiveColorScheme('light');
});

test('uses a readable dark surface for the lesson HUD', async () => {
  setActiveColorScheme('dark');
  const tree = await renderScenePlayer(listenScene);
  const title = tree.root
    .findAllByType(Text)
    .find(node => node.props.children === 'Lắng nghe');

  expect(title).toBeDefined();
  expect(StyleSheet.flatten(title?.props.style).color).toBe(darkColors.text);
  expect(StyleSheet.flatten(title?.parent?.props.style).backgroundColor).toBe(
    darkColors.surface,
  );

  await ReactTestRenderer.act(async () => {
    tree.unmount();
  });
});

test('preloads base, hidden and variant object images for scene state', async () => {
  const tree = await renderScenePlayer(sceneStateScene);
  const preloadedSources = mockedPrefetchAssets.mock.calls.flatMap(
    ([sources]) => sources,
  );

  expect(preloadedSources).toEqual(
    expect.arrayContaining([
      'state-background',
      'pot-empty',
      'pot-filled',
      'seed',
      'sprout',
      'stone',
    ]),
  );

  await ReactTestRenderer.act(async () => {
    tree.unmount();
  });
});

test('keeps the action instruction visible when a step has no vocabulary', async () => {
  const tree = await renderScenePlayer(sceneStateScene);

  expect(getTextValues(tree)).toContain('Chạm vào hạt giống nhé.');

  await ReactTestRenderer.act(async () => {
    tree.unmount();
  });
});

test('keeps scene object state unchanged after an incorrect interaction', async () => {
  const tree = await renderScenePlayer(sceneStateScene);

  expect(findSceneObject(tree, 'sprout')).toBeUndefined();
  await ReactTestRenderer.act(async () => {
    findSceneObject(tree, 'stone')?.props.onPress('stone');
    await flushPromises();
  });

  expect(findSceneObject(tree, 'pot')?.props.object.asset.source).toBe(
    'pot-empty',
  );
  expect(findSceneObject(tree, 'seed')).toBeDefined();
  expect(findSceneObject(tree, 'sprout')).toBeUndefined();

  await ReactTestRenderer.act(async () => {
    tree.unmount();
  });
});

test('applies scene object state immediately after a correct interaction', async () => {
  const tree = await renderScenePlayer(sceneStateScene);

  await ReactTestRenderer.act(async () => {
    findSceneObject(tree, 'seed')?.props.onPress('seed');
    await flushPromises();
  });

  expect(findSceneObject(tree, 'pot')?.props.object.asset.source).toBe(
    'pot-filled',
  );
  expect(findSceneObject(tree, 'seed')).toBeUndefined();
  expect(findSceneObject(tree, 'sprout')).toBeDefined();

  await ReactTestRenderer.act(async () => {
    tree.unmount();
  });
});

test('keeps choices visible for success feedback and cleans them on advance', async () => {
  jest.useFakeTimers();
  const delayedCleanupScene: Scene = {
    ...sceneStateScene,
    id: 'delayed-cleanup-scene',
    steps: [
      {
        ...sceneStateScene.steps[0],
        afterSuccessStateChanges: [
          { targetObjectId: 'seed', type: 'hideObject' },
          { targetObjectId: 'stone', type: 'hideObject' },
        ],
        id: 'choose-seed',
        successStateChanges: undefined,
        targetObjectIds: ['seed', 'stone'],
      },
      {
        id: 'next-step',
        instructionEn: 'The choices are clear now.',
        instructionVi: 'Mình sang bước tiếp theo nhé.',
        interaction: { targetObjectId: 'pot', type: 'listen' },
        successFeedbackEn: 'Ready for the next action.',
        successFeedbackVi: 'Mình sẵn sàng rồi.',
        targetObjectIds: ['pot'],
        type: 'practice',
      },
    ],
  };
  const tree = await renderScenePlayer(delayedCleanupScene);

  await ReactTestRenderer.act(async () => {
    findSceneObject(tree, 'seed')?.props.onPress('seed');
    await flushPromises();
  });

  expect(findSceneObject(tree, 'seed')).toBeDefined();
  expect(findSceneObject(tree, 'stone')).toBeDefined();
  expect(findSceneObject(tree, 'seed')?.props.effect).toBe('sparkle');
  expect(findSceneObject(tree, 'stone')?.props.isDimmed).toBe(true);

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(121);
    await flushPromises();
    await flushPromises();
  });
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(261);
    await flushPromises();
    await flushPromises();
  });

  expect(findSceneObject(tree, 'seed')).toBeUndefined();
  expect(findSceneObject(tree, 'stone')).toBeUndefined();
  expect(
    tree.root
      .findAllByType(KidIconButton)
      .some(node => node.props.accessibilityLabel === 'Tiếp tục'),
  ).toBe(true);

  await ReactTestRenderer.act(async () => {
    tree.unmount();
  });
});

test('rolls back scene object state when required success feedback fails', async () => {
  jest.useFakeTimers();
  const tree = await renderScenePlayer(sceneStateScene);
  mockedPlayTeacherPromptNarration.mockResolvedValueOnce('failed');

  await ReactTestRenderer.act(async () => {
    findSceneObject(tree, 'seed')?.props.onPress('seed');
    await flushPromises();
    await flushPromises();
  });
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(120);
    await flushPromises();
    await flushPromises();
  });

  expect(getTextValues(tree)).toContain('Bài học chưa sẵn sàng');
  const retryButton = tree.root
    .findAllByType(AppButton)
    .find(node => node.props.title === 'Thử lại');
  expect(retryButton).toBeDefined();

  await ReactTestRenderer.act(async () => {
    retryButton?.props.onPress();
    await flushPromises();
    await flushPromises();
    await flushPromises();
    await flushPromises();
  });

  expect(findSceneObject(tree, 'pot')?.props.object.asset.source).toBe(
    'pot-empty',
  );
  expect(findSceneObject(tree, 'seed')).toBeDefined();
  expect(findSceneObject(tree, 'sprout')).toBeUndefined();

  await ReactTestRenderer.act(async () => {
    tree.unmount();
  });
});

test('resets scene object state when the active scene changes', async () => {
  const renderPlayer = (activeScene: Scene) => (
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 800, width: 400, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      <ScenePlayer scene={activeScene} />
    </SafeAreaProvider>
  );
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(renderPlayer(sceneStateScene));
    await flushPromises();
    await flushPromises();
    await flushPromises();
    await flushPromises();
  });
  if (!tree) {
    throw new Error('ScenePlayer did not render.');
  }
  const renderedTree = tree;

  await ReactTestRenderer.act(async () => {
    findSceneObject(renderedTree, 'seed')?.props.onPress('seed');
    await flushPromises();
  });
  expect(findSceneObject(renderedTree, 'sprout')).toBeDefined();

  await ReactTestRenderer.act(async () => {
    renderedTree.update(renderPlayer(listenScene));
    await flushPromises();
    await flushPromises();
    await flushPromises();
    await flushPromises();
  });
  await ReactTestRenderer.act(async () => {
    renderedTree.update(renderPlayer(sceneStateScene));
    await flushPromises();
    await flushPromises();
    await flushPromises();
    await flushPromises();
  });

  expect(findSceneObject(renderedTree, 'pot')?.props.object.asset.source).toBe(
    'pot-empty',
  );
  expect(findSceneObject(renderedTree, 'seed')).toBeDefined();
  expect(findSceneObject(renderedTree, 'sprout')).toBeUndefined();

  await ReactTestRenderer.act(async () => {
    renderedTree.unmount();
  });
});

test('keeps loading visible until the required scene audio is cached', async () => {
  let finishAudioPreload: (() => void) | undefined;
  mockedPrepareRemoteAssets.mockImplementationOnce(
    () =>
      new Promise<boolean>(resolve => {
        finishAudioPreload = () => resolve(true);
      }),
  );

  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 800, width: 400, x: 0, y: 0 },
          insets: { bottom: 0, left: 0, right: 0, top: 0 },
        }}
      >
        <ScenePlayer scene={listenScene} />
      </SafeAreaProvider>,
    );
    await flushPromises();
    await flushPromises();
  });

  expect(getTextValues(tree)).toContain('Sungy đang chuẩn bị bài cho bé...');
  expect(mockedSpeakVi).not.toHaveBeenCalled();

  await ReactTestRenderer.act(async () => {
    finishAudioPreload?.();
    await flushPromises();
    await flushPromises();
  });

  expect(mockedSpeakVi).toHaveBeenCalledWith('Con hãy nghe cô nhé.');

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('blocks the lesson when required audio fails and retries the preload', async () => {
  mockedPrepareRemoteAssets.mockResolvedValueOnce(false);

  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 800, width: 400, x: 0, y: 0 },
          insets: { bottom: 0, left: 0, right: 0, top: 0 },
        }}
      >
        <ScenePlayer scene={listenScene} />
      </SafeAreaProvider>,
    );
    await flushPromises();
    await flushPromises();
    await flushPromises();
  });

  expect(getTextValues(tree)).toContain('Bài học chưa sẵn sàng');
  expect(mockedSpeakVi).not.toHaveBeenCalled();

  const retryButton = tree?.root
    .findAllByType(AppButton)
    .find(node => node.props.title === 'Thử lại');
  expect(retryButton).toBeDefined();

  await ReactTestRenderer.act(async () => {
    retryButton?.props.onPress();
    await flushPromises();
    await flushPromises();
    await flushPromises();
  });

  expect(mockedPrepareRemoteAssets.mock.calls.length).toBeGreaterThanOrEqual(2);
  expect(getTextValues(tree)).not.toContain('Bài học chưa sẵn sàng');
  expect(mockedSpeakVi).toHaveBeenCalledWith('Con hãy nghe cô nhé.');

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('allows local QA to continue when unpublished lesson audio is allowed', async () => {
  mutableRemoteAssetsConfig.allowMissingLessonAudio = true;
  mockedPrepareRemoteAssets.mockResolvedValue(false);

  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 800, width: 400, x: 0, y: 0 },
          insets: { bottom: 0, left: 0, right: 0, top: 0 },
        }}
      >
        <ScenePlayer scene={listenScene} />
      </SafeAreaProvider>,
    );
    await flushPromises();
    await flushPromises();
    await flushPromises();
    await flushPromises();
    await flushPromises();
  });

  expect(mockedPrepareRemoteAssets).not.toHaveBeenCalled();
  expect(getTextValues(tree)).not.toContain('Bài học chưa sẵn sàng');
  expect(mockedSpeakVi).not.toHaveBeenCalled();
  expect(
    tree?.root
      .findAllByType(KidIconButton)
      .some(node => node.props.accessibilityLabel === 'Tiếp tục'),
  ).toBe(true);

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('blocks the lesson when a required image is unavailable', async () => {
  jest.useFakeTimers();
  mockedPrefetchAssets.mockResolvedValue(false);

  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 800, width: 400, x: 0, y: 0 },
          insets: { bottom: 0, left: 0, right: 0, top: 0 },
        }}
      >
        <ScenePlayer scene={listenScene} />
      </SafeAreaProvider>,
    );
    await flushPromises();
    await flushPromises();
    await flushPromises();
  });

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(301);
    await flushPromises();
    await flushPromises();
  });

  expect(mockedPrefetchAssets).toHaveBeenCalledWith(['background']);
  expect(mockedPrefetchAssets).toHaveBeenCalledTimes(2);
  expect(getTextValues(tree)).toContain('Bài học chưa sẵn sàng');
  expect(getTextValues(tree)).not.toContain('Tiếp tục');
  expect(mockedSpeakVi).not.toHaveBeenCalled();

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('recovers automatically when a required image fails transiently', async () => {
  jest.useFakeTimers();
  mockedPrefetchAssets.mockResolvedValueOnce(false).mockResolvedValueOnce(true);

  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 800, width: 400, x: 0, y: 0 },
          insets: { bottom: 0, left: 0, right: 0, top: 0 },
        }}
      >
        <ScenePlayer scene={listenScene} />
      </SafeAreaProvider>,
    );
    await flushPromises();
  });

  expect(getTextValues(tree)).toContain('Sungy đang chuẩn bị bài cho bé...');

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(301);
    await flushPromises();
    await flushPromises();
    await flushPromises();
  });

  expect(mockedPrefetchAssets).toHaveBeenCalledTimes(2);
  expect(getTextValues(tree)).not.toContain('Bài học chưa sẵn sàng');
  expect(mockedSpeakVi).toHaveBeenCalledWith('Con hãy nghe cô nhé.');

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('does not say the teacher is speaking while step audio is still preparing', async () => {
  let finishStepPreparation: (() => void) | undefined;
  let finishInstruction: (() => void) | undefined;
  let instructionPreparationCount = 0;
  mockedPrepareRemoteAssets.mockImplementation(assets => {
    const includesInstruction = assets.some(asset =>
      asset.cacheKey.includes('Con hãy nghe cô nhé.'),
    );
    if (includesInstruction) {
      instructionPreparationCount += 1;
      if (instructionPreparationCount === 2) {
        return new Promise<boolean>(resolve => {
          finishStepPreparation = () => resolve(true);
        });
      }
    }
    return Promise.resolve(true);
  });
  mockedSpeakVi.mockImplementationOnce(
    () =>
      new Promise<void>(resolve => {
        finishInstruction = resolve;
      }),
  );

  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 800, width: 400, x: 0, y: 0 },
          insets: { bottom: 0, left: 0, right: 0, top: 0 },
        }}
      >
        <ScenePlayer scene={listenScene} />
      </SafeAreaProvider>,
    );
    await flushPromises();
    await flushPromises();
  });

  expect(getTextValues(tree)).toContain('Đang chuẩn bị giọng cô...');
  expect(getTextValues(tree)).not.toContain('Cô đang nói...');
  expect(mockedSpeakVi).not.toHaveBeenCalled();

  await ReactTestRenderer.act(async () => {
    finishStepPreparation?.();
    await flushPromises();
    await flushPromises();
  });

  expect(getTextValues(tree)).toContain('Cô đang nói...');
  expect(mockedSpeakVi).toHaveBeenCalledWith('Con hãy nghe cô nhé.');

  await ReactTestRenderer.act(async () => {
    finishInstruction?.();
    await flushPromises();
    tree?.unmount();
  });
});

test('keeps Continue unavailable until success feedback audio is prepared', async () => {
  let finishFeedbackPreparation: (() => void) | undefined;
  mockedPrepareRemoteAssets.mockImplementation(assets => {
    const isStepFeedbackPreparation =
      assets.length > 1 &&
      assets.some(asset => asset.cacheKey.includes('Giỏi lắm!'));
    if (isStepFeedbackPreparation) {
      return new Promise<boolean>(resolve => {
        finishFeedbackPreparation = () => resolve(true);
      });
    }
    return Promise.resolve(true);
  });

  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 800, width: 400, x: 0, y: 0 },
          insets: { bottom: 0, left: 0, right: 0, top: 0 },
        }}
      >
        <ScenePlayer scene={listenScene} />
      </SafeAreaProvider>,
    );
    await flushPromises();
    await flushPromises();
    await flushPromises();
  });

  expect(getTextValues(tree)).toContain('Đang chuẩn bị lời cô...');
  expect(getTextValues(tree)).not.toContain('Tiếp tục');

  await ReactTestRenderer.act(async () => {
    finishFeedbackPreparation?.();
    await flushPromises();
    await flushPromises();
  });

  expect(getTextValues(tree)).toContain('Tiếp tục');

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('does not start the step transition timer while success feedback is preparing', async () => {
  jest.useFakeTimers();
  const sceneWithNextStep: Scene = {
    ...listenScene,
    steps: [
      {
        ...listenScene.steps[0],
        nextStepId: 'next-listen-step',
      },
      {
        ...listenScene.steps[0],
        id: 'next-listen-step',
        instructionVi: 'Đây là bước tiếp theo.',
      },
    ],
  };
  let finishClickedFeedbackPreparation: (() => void) | undefined;

  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 800, width: 400, x: 0, y: 0 },
          insets: { bottom: 0, left: 0, right: 0, top: 0 },
        }}
      >
        <ScenePlayer scene={sceneWithNextStep} />
      </SafeAreaProvider>,
    );
    await flushPromises();
    await flushPromises();
    await flushPromises();
  });

  const continueButton = tree?.root
    .findAllByType(KidIconButton)
    .find(node => node.props.accessibilityLabel === 'Tiếp tục');
  expect(continueButton).toBeDefined();

  mockedPrepareRemoteAssets.mockImplementationOnce(
    () =>
      new Promise<boolean>(resolve => {
        finishClickedFeedbackPreparation = () => resolve(true);
      }),
  );

  await ReactTestRenderer.act(async () => {
    continueButton?.props.onPress();
    await flushPromises();
  });

  expect(getTextValues(tree)).toContain('Đang chuẩn bị lời cô...');
  expect(getTextValues(tree)).toContain('Giỏi lắm!');

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(6000);
    await flushPromises();
  });

  expect(mockedSpeakVi).not.toHaveBeenCalledWith('Đây là bước tiếp theo.');
  expect(getTextValues(tree)).toContain('Giỏi lắm!');

  await ReactTestRenderer.act(async () => {
    finishClickedFeedbackPreparation?.();
    await flushPromises();
    await flushPromises();
  });
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(120);
    await flushPromises();
    await flushPromises();
  });
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(260);
    await flushPromises();
    await flushPromises();
    await flushPromises();
  });

  expect(mockedSpeakVi).toHaveBeenCalledWith('Đây là bước tiếp theo.');

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test.each(['vi', 'bilingual'] as const)(
  'cancels in-flight step audio before playing success feedback in %s mode',
  async teacherPromptMode => {
    jest.useFakeTimers();
    mockedGetParentSettings.mockResolvedValue({
      ...defaultParentSettings,
      teacherPromptMode,
    });
    let finishInstruction: (() => void) | undefined;
    let finishFeedback: (() => void) | undefined;
    mockedSpeakVi.mockImplementation(text => {
      if (text === 'Đặt bút chì lên bàn.') {
        return new Promise<void>(resolve => {
          finishInstruction = resolve;
        });
      }

      if (text === 'Bút chì đã ở trên bàn.') {
        finishInstruction?.();
        return new Promise<void>(resolve => {
          finishFeedback = resolve;
        });
      }

      return Promise.resolve();
    });

    let tree: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <SafeAreaProvider
          initialMetrics={{
            frame: { height: 800, width: 400, x: 0, y: 0 },
            insets: { bottom: 0, left: 0, right: 0, top: 0 },
          }}
        >
          <ScenePlayer scene={practiceDragScene} />
        </SafeAreaProvider>,
      );
      await flushPromises();
      await flushPromises();
      await flushPromises();
    });

    expect(mockedSpeakVi).toHaveBeenCalledWith('Đặt bút chì lên bàn.');

    const pencil = tree?.root
      .findAllByType(SceneObjectRenderer)
      .find(node => node.props.object.id === 'pencil');
    expect(pencil).toBeDefined();

    await ReactTestRenderer.act(async () => {
      pencil?.props.onDragEnd('pencil', { dx: 0, dy: 0 });
      await flushPromises();
    });
    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(120);
      await flushPromises();
      await flushPromises();
    });

    expect(mockedSpeakVi).toHaveBeenCalledWith('Bút chì đã ở trên bàn.');

    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(100);
      await flushPromises();
      await flushPromises();
    });

    const spokenWords = mockedSpeakWord.mock.calls.map(([text]) => text);
    expect(spokenWords).not.toContain('pencil');
    expect(spokenWords).not.toContain('Drag the pencil.');
    expect(mockedSpeakVi).not.toHaveBeenCalledWith('Đây là bước tiếp theo.');

    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(4000);
      await flushPromises();
      await flushPromises();
    });

    expect(mockedSpeakVi).not.toHaveBeenCalledWith('Đây là bước tiếp theo.');
    expect(
      getTextValues(tree).some(
        value =>
          typeof value === 'string' && value.includes('Bút chì đã ở trên bàn.'),
      ),
    ).toBe(true);

    await ReactTestRenderer.act(async () => {
      finishFeedback?.();
      await flushPromises();
      await flushPromises();
    });
    if (teacherPromptMode === 'bilingual') {
      expect(mockedSpeakWord.mock.calls.map(([text]) => text)).toContain(
        'The pencil is on the table.',
      );
    }
    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(260);
      await flushPromises();
      await flushPromises();
      await flushPromises();
    });

    expect(mockedSpeakVi).toHaveBeenCalledWith('Đây là bước tiếp theo.');

    await ReactTestRenderer.act(async () => {
      tree?.unmount();
    });
  },
);

test('drops stale bilingual failure audio when a quick retry succeeds', async () => {
  jest.useFakeTimers();
  mockedGetParentSettings.mockResolvedValue({
    ...defaultParentSettings,
    teacherPromptMode: 'bilingual',
  });
  let finishFailure: (() => void) | undefined;
  mockedSpeakVi.mockImplementation(text => {
    if (text === 'Chưa đúng, thử lại nhé.') {
      return new Promise<void>(resolve => {
        finishFailure = resolve;
      });
    }

    if (text === 'Bút chì đã ở trên bàn.') {
      finishFailure?.();
      return new Promise<void>(() => undefined);
    }

    return Promise.resolve();
  });

  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 800, width: 400, x: 0, y: 0 },
          insets: { bottom: 0, left: 0, right: 0, top: 0 },
        }}
      >
        <ScenePlayer scene={practiceRetryScene} />
      </SafeAreaProvider>,
    );
    await flushPromises();
    await flushPromises();
    await flushPromises();
  });

  mockedSpeakVi.mockClear();
  mockedSpeakWord.mockClear();
  const objects = tree?.root.findAllByType(SceneObjectRenderer) ?? [];
  const eraser = objects.find(node => node.props.object.id === 'eraser');
  const pencil = objects.find(node => node.props.object.id === 'pencil');

  await ReactTestRenderer.act(async () => {
    eraser?.props.onPress('eraser');
    await flushPromises();
  });
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(400);
    await flushPromises();
    await flushPromises();
  });

  expect(mockedSpeakVi).toHaveBeenCalledWith('Chưa đúng, thử lại nhé.');
  expect(
    mockedPlayTeacherPromptNarration.mock.calls.some(([segments]) =>
      segments.some(
        segment =>
          segment.language === 'en' && segment.text === 'Tap the pencil.',
      ),
    ),
  ).toBe(true);

  await ReactTestRenderer.act(async () => {
    pencil?.props.onPress('pencil');
    await flushPromises();
  });
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(120);
    await flushPromises();
    await flushPromises();
  });

  expect(mockedSpeakVi).toHaveBeenCalledWith('Bút chì đã ở trên bàn.');
  expect(mockedSpeakWord.mock.calls.map(([text]) => text)).not.toContain(
    'Tap the pencil.',
  );

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('renders failure feedback text without blocking a retry', async () => {
  jest.useFakeTimers();

  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 800, width: 400, x: 0, y: 0 },
          insets: { bottom: 0, left: 0, right: 0, top: 0 },
        }}
      >
        <ScenePlayer scene={practiceRetryScene} />
      </SafeAreaProvider>,
    );
    await flushPromises();
    await flushPromises();
    await flushPromises();
  });

  const findObject = (objectId: string) =>
    tree?.root
      .findAllByType(SceneObjectRenderer)
      .find(node => node.props.object.id === objectId);

  await ReactTestRenderer.act(async () => {
    findObject('eraser')?.props.onPress('eraser');
    await flushPromises();
  });

  expect(getTextValues(tree)).toContain('Chưa đúng, thử lại nhé.');
  expect(findObject('pencil')?.props.isDisabled).toBe(false);

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(401);
    findObject('pencil')?.props.onPress('pencil');
    await flushPromises();
    await flushPromises();
  });

  expect(getTextValues(tree)).toContain('Bút chì đã ở trên bàn.');
  expect(getTextValues(tree)).not.toContain('Chưa đúng, thử lại nhé.');

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('renders temporary info feedback when replaying an instruction', async () => {
  jest.useFakeTimers();

  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 800, width: 400, x: 0, y: 0 },
          insets: { bottom: 0, left: 0, right: 0, top: 0 },
        }}
      >
        <ScenePlayer scene={practiceRetryScene} />
      </SafeAreaProvider>,
    );
    await flushPromises();
    await flushPromises();
    await flushPromises();
  });

  const replayButton = tree?.root
    .findAllByType(KidIconButton)
    .find(node => node.props.accessibilityLabel === 'Nghe lại hướng dẫn');

  expect(replayButton).toBeDefined();
  expect(getTextValues(tree)).toContain('Đặt bút chì lên bàn.');

  await ReactTestRenderer.act(async () => {
    replayButton?.props.onPress();
    await flushPromises();
  });

  expect(getTextValues(tree)).toContain('Đặt bút chì lên bàn.');

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(1301);
    await flushPromises();
  });

  expect(getTextValues(tree)).toContain('Đặt bút chì lên bàn.');

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('dims unrelated learning objects while a retry hint is active', async () => {
  jest.useFakeTimers();

  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 800, width: 400, x: 0, y: 0 },
          insets: { bottom: 0, left: 0, right: 0, top: 0 },
        }}
      >
        <ScenePlayer scene={practiceRetryScene} />
      </SafeAreaProvider>,
    );
    await flushPromises();
    await flushPromises();
    await flushPromises();
  });

  const findObject = (objectId: string) =>
    tree?.root
      .findAllByType(SceneObjectRenderer)
      .find(node => node.props.object.id === objectId);

  expect(findObject('eraser')?.props.isDimmed).toBe(false);

  await ReactTestRenderer.act(async () => {
    findObject('eraser')?.props.onPress('eraser');
    await flushPromises();
  });

  expect(findObject('eraser')?.props.isDimmed).toBe(false);

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(401);
    await flushPromises();
  });

  await ReactTestRenderer.act(async () => {
    findObject('eraser')?.props.onPress('eraser');
    await flushPromises();
  });

  expect(findObject('pencil')?.props.isTargeted).toBe(true);
  expect(findObject('eraser')?.props.isDimmed).toBe(true);

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(700);
    await flushPromises();
  });

  expect(findObject('eraser')?.props.isDimmed).toBe(false);

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('shows an auto hint after seven idle seconds and dims unrelated objects', async () => {
  jest.useFakeTimers();
  mutableRemoteAssetsConfig.allowMissingLessonAudio = true;
  const tree = await renderScenePlayer(practiceRetryScene);
  const pencil = () => findSceneObject(tree, 'pencil');
  const eraser = () => findSceneObject(tree, 'eraser');

  expect(pencil()?.props.isTargeted).toBe(false);
  expect(pencil()?.props.isInteractionTarget).toBe(true);
  expect(eraser()?.props.isInteractionTarget).toBe(false);
  expect(eraser()?.props.isDimmed).toBe(false);

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(6999);
    await flushPromises();
  });

  expect(pencil()?.props.isTargeted).toBe(false);
  expect(eraser()?.props.isDimmed).toBe(false);

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(1);
    await flushPromises();
  });

  expect(pencil()?.props.isTargeted).toBe(true);
  expect(eraser()?.props.isDimmed).toBe(true);

  await ReactTestRenderer.act(async () => {
    tree.unmount();
  });
});

test('auto hint highlights only the correct option in a multi-choice step', async () => {
  jest.useFakeTimers();
  mutableRemoteAssetsConfig.allowMissingLessonAudio = true;
  const tree = await renderScenePlayer(reviewChoiceScene);
  const pencil = () => findSceneObject(tree, 'pencil');
  const eraser = () => findSceneObject(tree, 'eraser');

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(7000);
    await flushPromises();
  });

  expect(pencil()?.props.isTargeted).toBe(true);
  expect(eraser()?.props.isTargeted).toBe(false);
  expect(eraser()?.props.isDimmed).toBe(true);

  await ReactTestRenderer.act(async () => {
    tree.unmount();
  });
});

test('replaying a multi-choice instruction animates only the correct option', async () => {
  mutableRemoteAssetsConfig.allowMissingLessonAudio = true;
  const tree = await renderScenePlayer(reviewChoiceScene);
  const pencil = () => findSceneObject(tree, 'pencil');
  const eraser = () => findSceneObject(tree, 'eraser');
  const replayButton = tree.root
    .findAllByType(KidIconButton)
    .find(node => node.props.accessibilityLabel === 'Nghe lại hướng dẫn');

  await ReactTestRenderer.act(async () => {
    replayButton?.props.onPress();
    await flushPromises();
  });

  expect(pencil()?.props.effect).toBe('bounce');
  expect(eraser()?.props.effect).toBe('none');

  await ReactTestRenderer.act(async () => {
    tree.unmount();
  });
});

test('starts the auto-hint delay after instruction audio finishes', async () => {
  jest.useFakeTimers();
  let finishInstruction: (() => void) | undefined;
  mockedSpeakVi.mockImplementationOnce(
    () =>
      new Promise<void>(resolve => {
        finishInstruction = resolve;
      }),
  );
  const tree = await renderScenePlayer(practiceRetryScene);
  const pencil = () => findSceneObject(tree, 'pencil');

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(10000);
    await flushPromises();
  });

  expect(pencil()?.props.isTargeted).toBe(false);

  await ReactTestRenderer.act(async () => {
    finishInstruction?.();
    await flushPromises();
  });
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(100);
    await flushPromises();
    await flushPromises();
  });

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(6999);
    await flushPromises();
  });
  expect(pencil()?.props.isTargeted).toBe(false);

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(1);
    await flushPromises();
  });
  expect(pencil()?.props.isTargeted).toBe(true);

  await ReactTestRenderer.act(async () => {
    tree.unmount();
  });
});

test('clears and restarts the auto hint after an object interaction', async () => {
  jest.useFakeTimers();
  mutableRemoteAssetsConfig.allowMissingLessonAudio = true;
  const tree = await renderScenePlayer(practiceRetryScene);
  const pencil = () => findSceneObject(tree, 'pencil');
  const eraser = () => findSceneObject(tree, 'eraser');

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(7000);
    await flushPromises();
  });
  expect(pencil()?.props.isTargeted).toBe(true);

  await ReactTestRenderer.act(async () => {
    eraser()?.props.onPress('eraser');
    await flushPromises();
  });
  expect(pencil()?.props.isTargeted).toBe(false);

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(120);
    await flushPromises();
    await flushPromises();
  });
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(6999);
    await flushPromises();
  });
  expect(pencil()?.props.isTargeted).toBe(false);

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(1);
    await flushPromises();
  });
  expect(pencil()?.props.isTargeted).toBe(true);

  await ReactTestRenderer.act(async () => {
    tree.unmount();
  });
});

test('keeps the auto hint paused while failure feedback audio is playing', async () => {
  jest.useFakeTimers();
  mutableRemoteAssetsConfig.allowMissingLessonAudio = true;
  let finishFeedback: (() => void) | undefined;
  mockedSpeakVi.mockImplementation(text => {
    if (text !== 'Chưa đúng, thử lại nhé.') {
      return Promise.resolve();
    }

    return new Promise<void>(resolve => {
      finishFeedback = resolve;
    });
  });
  const tree = await renderScenePlayer(practiceRetryScene);
  const pencil = () => findSceneObject(tree, 'pencil');
  const eraser = () => findSceneObject(tree, 'eraser');

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(7000);
    await flushPromises();
  });
  expect(pencil()?.props.isTargeted).toBe(true);

  await ReactTestRenderer.act(async () => {
    eraser()?.props.onPress('eraser');
    jest.advanceTimersByTime(120);
    await flushPromises();
  });
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(10000);
    await flushPromises();
  });
  expect(pencil()?.props.isTargeted).toBe(false);
  expect(getTextValues(tree)).toContain('Chưa đúng, thử lại nhé.');

  await ReactTestRenderer.act(async () => {
    finishFeedback?.();
    await flushPromises();
    await flushPromises();
  });
  expect(getTextValues(tree)).not.toContain('Chưa đúng, thử lại nhé.');

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(7000);
    await flushPromises();
  });
  expect(pencil()?.props.isTargeted).toBe(true);

  await ReactTestRenderer.act(async () => {
    tree.unmount();
  });
});

test('clears the auto hint when replaying the instruction', async () => {
  jest.useFakeTimers();
  mutableRemoteAssetsConfig.allowMissingLessonAudio = true;
  const tree = await renderScenePlayer(practiceRetryScene);
  const pencil = () => findSceneObject(tree, 'pencil');
  const replayButton = tree.root
    .findAllByType(KidIconButton)
    .find(node => node.props.accessibilityLabel === 'Nghe lại hướng dẫn');

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(7000);
    await flushPromises();
  });
  expect(pencil()?.props.isTargeted).toBe(true);

  await ReactTestRenderer.act(async () => {
    replayButton?.props.onPress();
    await flushPromises();
  });
  expect(pencil()?.props.isTargeted).toBe(false);

  await ReactTestRenderer.act(async () => {
    tree.unmount();
  });
});

test('clears and restarts the auto hint when dragging begins', async () => {
  jest.useFakeTimers();
  mutableRemoteAssetsConfig.allowMissingLessonAudio = true;
  const tree = await renderScenePlayer(practiceDragScene);
  const pencil = () => findSceneObject(tree, 'pencil');

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(7000);
    await flushPromises();
  });
  expect(pencil()?.props.isTargeted).toBe(true);

  await ReactTestRenderer.act(async () => {
    pencil()?.props.onDragStart('pencil');
    await flushPromises();
  });
  expect(pencil()?.props.isTargeted).toBe(false);

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(6999);
    await flushPromises();
  });
  expect(pencil()?.props.isTargeted).toBe(false);

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(1);
    await flushPromises();
  });
  expect(pencil()?.props.isTargeted).toBe(true);

  await ReactTestRenderer.act(async () => {
    tree.unmount();
  });
});

test('shows retry instead of advancing when success narration times out', async () => {
  jest.useFakeTimers();
  mockedSpeakVi.mockImplementation(text =>
    text === 'Bút chì đã ở trên bàn.'
      ? new Promise<void>(() => undefined)
      : Promise.resolve(),
  );

  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 800, width: 400, x: 0, y: 0 },
          insets: { bottom: 0, left: 0, right: 0, top: 0 },
        }}
      >
        <ScenePlayer scene={practiceDragScene} />
      </SafeAreaProvider>,
    );
    await flushPromises();
    await flushPromises();
    await flushPromises();
  });

  const pencil = tree?.root
    .findAllByType(SceneObjectRenderer)
    .find(node => node.props.object.id === 'pencil');
  await ReactTestRenderer.act(async () => {
    pencil?.props.onDragEnd('pencil', { dx: 0, dy: 0 });
    await flushPromises();
    await flushPromises();
  });
  const cancelCallsBeforeTimeout = mockedCancelNarration.mock.calls.length;
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(15120);
    await flushPromises();
    await flushPromises();
  });

  expect(getTextValues(tree)).toContain('Bài học chưa sẵn sàng');
  expect(mockedCancelNarration.mock.calls.length).toBeGreaterThan(
    cancelCallsBeforeTimeout,
  );
  expect(mockedSpeakVi).not.toHaveBeenCalledWith('Đây là bước tiếp theo.');

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('shows retry instead of advancing when native feedback playback fails', async () => {
  jest.useFakeTimers();
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 800, width: 400, x: 0, y: 0 },
          insets: { bottom: 0, left: 0, right: 0, top: 0 },
        }}
      >
        <ScenePlayer scene={practiceDragScene} />
      </SafeAreaProvider>,
    );
    await flushPromises();
    await flushPromises();
    await flushPromises();
  });

  mockedPlayTeacherPromptNarration.mockResolvedValueOnce('failed');
  const pencil = tree?.root
    .findAllByType(SceneObjectRenderer)
    .find(node => node.props.object.id === 'pencil');
  await ReactTestRenderer.act(async () => {
    pencil?.props.onDragEnd('pencil', { dx: 0, dy: 0 });
    await flushPromises();
  });
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(120);
    await flushPromises();
    await flushPromises();
  });

  expect(getTextValues(tree)).toContain('Bài học chưa sẵn sàng');
  expect(mockedSpeakVi).not.toHaveBeenCalledWith('Đây là bước tiếp theo.');

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(15260);
    await flushPromises();
  });
  expect(mockedSpeakVi).not.toHaveBeenCalledWith('Đây là bước tiếp theo.');

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('does not advance when required success feedback audio is unavailable', async () => {
  jest.useFakeTimers();
  const sceneWithNextStep: Scene = {
    ...listenScene,
    steps: [
      {
        ...listenScene.steps[0],
        nextStepId: 'next-listen-step',
      },
      {
        ...listenScene.steps[0],
        id: 'next-listen-step',
        instructionVi: 'Đây là bước tiếp theo.',
      },
    ],
  };

  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 800, width: 400, x: 0, y: 0 },
          insets: { bottom: 0, left: 0, right: 0, top: 0 },
        }}
      >
        <ScenePlayer scene={sceneWithNextStep} />
      </SafeAreaProvider>,
    );
    await flushPromises();
    await flushPromises();
    await flushPromises();
  });

  const continueButton = tree?.root
    .findAllByType(KidIconButton)
    .find(node => node.props.accessibilityLabel === 'Tiếp tục');
  expect(continueButton).toBeDefined();

  mockedPrepareRemoteAssets.mockResolvedValueOnce(false);
  await ReactTestRenderer.act(async () => {
    continueButton?.props.onPress();
    await flushPromises();
    await flushPromises();
  });

  expect(getTextValues(tree)).toContain('Bài học chưa sẵn sàng');

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(10000);
    await flushPromises();
    await flushPromises();
  });

  expect(mockedSpeakVi).not.toHaveBeenCalledWith('Đây là bước tiếp theo.');

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('opens on entry-step audio and warms later scene audio in background', async () => {
  jest.useFakeTimers();
  mockedPrefetchRemoteAssets.mockResolvedValue(false);
  const sceneWithLaterAudio: Scene = {
    ...listenScene,
    steps: [
      listenScene.steps[0],
      {
        ...listenScene.steps[0],
        id: 'later-step',
        instructionVi: 'Câu hướng dẫn tải nền.',
      },
    ],
  };

  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 800, width: 400, x: 0, y: 0 },
          insets: { bottom: 0, left: 0, right: 0, top: 0 },
        }}
      >
        <ScenePlayer scene={sceneWithLaterAudio} />
      </SafeAreaProvider>,
    );
    await flushPromises();
    await flushPromises();
  });

  const initialAudioKeys = mockedPrepareRemoteAssets.mock.calls.flatMap(
    ([assets]) => assets.map(asset => asset.cacheKey),
  );
  expect(initialAudioKeys).toContain('test/audio/vi/Con hãy nghe cô nhé..wav');
  expect(initialAudioKeys).not.toContain(
    'test/audio/vi/Câu hướng dẫn tải nền..wav',
  );
  expect(initialAudioKeys).toContain('test/audio/vi/Giỏi lắm!.wav');
  expect(getTextValues(tree)).not.toContain('Bài học chưa sẵn sàng');

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(501);
    await flushPromises();
    await flushPromises();
  });

  const backgroundAudioKeys = mockedPrefetchRemoteAssets.mock.calls.flatMap(
    ([assets]) => assets.map(asset => asset.cacheKey),
  );
  expect(backgroundAudioKeys).toContain(
    'test/audio/vi/Câu hướng dẫn tải nền..wav',
  );
  expect(getTextValues(tree)).not.toContain('Bài học chưa sẵn sàng');

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('only shows Continue after the required instruction finishes playing', async () => {
  let finishInstruction: (() => void) | undefined;
  mockedSpeakVi.mockImplementationOnce(
    () =>
      new Promise<void>(resolve => {
        finishInstruction = resolve;
      }),
  );

  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 800, width: 400, x: 0, y: 0 },
          insets: { bottom: 0, left: 0, right: 0, top: 0 },
        }}
      >
        <ScenePlayer scene={listenScene} />
      </SafeAreaProvider>,
    );
    await flushPromises();
    await flushPromises();
  });

  expect(getTextValues(tree)).toContain('Cô đang nói...');
  expect(getTextValues(tree)).not.toContain('Tiếp tục');

  await ReactTestRenderer.act(async () => {
    finishInstruction?.();
    await flushPromises();
  });

  expect(getTextValues(tree)).toContain('Tiếp tục');

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('hides Continue while a teach-and-listen instruction is playing', async () => {
  mockedSpeakVi.mockImplementationOnce(() => new Promise<void>(() => {}));

  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 800, width: 400, x: 0, y: 0 },
          insets: { bottom: 0, left: 0, right: 0, top: 0 },
        }}
      >
        <ScenePlayer scene={teachListenScene} />
      </SafeAreaProvider>,
    );
    await flushPromises();
    await flushPromises();
  });

  expect(getTextValues(tree)).toContain('Cô đang nói...');
  expect(getTextValues(tree)).not.toContain('Tiếp tục');
  expect(tree?.root.findByType(SceneObjectRenderer).props.isDisabled).toBe(
    true,
  );
  expect(tree?.root.findByType(SceneObjectRenderer).props.isTargeted).toBe(
    true,
  );

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('keeps the microphone idle for optional teach-and-listen practice', async () => {
  jest.useFakeTimers();
  const tree = await renderScenePlayer(optionalTeachListenScene);

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(101);
    await flushPromises();
    await flushPromises();
  });
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(121);
    await flushPromises();
    await flushPromises();
  });
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(61);
    await flushPromises();
    await flushPromises();
  });

  const practice = tree.root.findByType(SpeakPracticeControls);
  expect(practice.props.word).toBe('blanket');
  expect(practice.props.autoStartRequestId).toBe(0);
  expect(practice.props.autoStartWithPrompt).toBe(false);
  expect(practice.props.onContinue).toEqual(expect.any(Function));

  await ReactTestRenderer.act(async () => {
    tree.unmount();
  });
});

test('opens speech practice after completing a teach-and-tap interaction', async () => {
  jest.useFakeTimers();
  const tree = await renderScenePlayer(teachTapScene);

  expect(tree.root.findAllByType(SpeakPracticeControls)).toHaveLength(0);

  await ReactTestRenderer.act(async () => {
    findSceneObject(tree, 'bed')?.props.onPress('bed');
    await flushPromises();
  });

  expect(getTextValues(tree)).toContain('Vòi bình giúp rót nước nhẹ nhàng.');

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(121);
    await flushPromises();
    await flushPromises();
  });
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(261);
    await flushPromises();
    await flushPromises();
  });

  const practice = tree.root.findByType(SpeakPracticeControls);
  expect(practice.props.word).toBe('spout');
  expect(practice.props).not.toHaveProperty('meaning');
  expect(practice.props.autoStartRequestId).toBeGreaterThan(0);
  expect(practice.props.autoStartWithPrompt).toBe(true);
  expect(practice.props.onContinue).toEqual(expect.any(Function));

  await ReactTestRenderer.act(async () => {
    practice.props.onBusyChange(false);
    await flushPromises();
  });
  await ReactTestRenderer.act(async () => {
    tree.root.findByType(SpeakPracticeControls).props.onContinue();
    await flushPromises();
  });

  expect(tree.root.findAllByType(SpeakPracticeControls)).toHaveLength(0);

  await ReactTestRenderer.act(async () => {
    tree.unmount();
  });
});

test.each([
  ['auto', autoSpeechPracticeScene, true],
  ['optional', optionalSpeechPracticeScene, false],
] as const)(
  'opens %s speech practice after a vocabulary interaction',
  async (_mode, scene, shouldAutoStart) => {
    jest.useFakeTimers();
    const tree = await renderScenePlayer(scene);

    await ReactTestRenderer.act(async () => {
      findSceneObject(tree, 'pencil')?.props.onPress('pencil');
      await flushPromises();
    });
    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(121);
      await flushPromises();
      await flushPromises();
    });
    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(261);
      await flushPromises();
      await flushPromises();
    });

    const practice = tree.root.findByType(SpeakPracticeControls);
    expect(practice.props.word).toBe('pencil');
    expect(practice.props.autoStartRequestId > 0).toBe(shouldAutoStart);
    expect(practice.props.autoStartWithPrompt).toBe(shouldAutoStart);
    expect(practice.props.onContinue).toEqual(expect.any(Function));

    await ReactTestRenderer.act(async () => {
      practice.props.onContinue();
      await flushPromises();
    });

    expect(tree.root.findAllByType(SpeakPracticeControls)).toHaveLength(0);

    await ReactTestRenderer.act(async () => {
      tree.unmount();
    });
  },
);

test('saves spoken vocabulary locally when the parent enables the library', async () => {
  mockedGetParentSettings.mockResolvedValue({
    ...defaultParentSettings,
    voiceRecordingLibrary: {
      consentedAt: '2026-08-11T08:00:00.000Z',
      consentVersion: 1,
      enabled: true,
    },
  });

  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 800, width: 400, x: 0, y: 0 },
          insets: { bottom: 0, left: 0, right: 0, top: 0 },
        }}
      >
        <ScenePlayer lessonId="bedtime" scene={teachListenScene} />
      </SafeAreaProvider>,
    );
    await flushPromises();
    await flushPromises();
    await flushPromises();
    await flushPromises();
  });

  const practice = tree?.root.findByType(SpeakPracticeControls);
  expect(practice?.props.onRecordingReady).toEqual(expect.any(Function));

  await ReactTestRenderer.act(async () => {
    await practice?.props.onRecordingReady({
      durationMs: 1840,
      stopReason: 'endOfSpeech',
      uri: 'file:///cache/skids_voice_test.wav',
    });
  });

  expect(mockedSaveVoiceRecordingCandidate).toHaveBeenCalledWith(
    expect.objectContaining({
      accent: 'en-US',
      durationMs: 1840,
      lessonId: 'bedtime',
      sceneId: 'teach-listen-scene',
      stepId: 'teach-listen-step',
      tempUri: 'file:///cache/skids_voice_test.wav',
      themeId: 'mot-ngay-cua-be',
      vocabId: 'vocab-blanket',
      word: 'blanket',
    }),
  );

  const firstEncounterId =
    mockedSaveVoiceRecordingCandidate.mock.calls[0][0].encounterId;
  await ReactTestRenderer.act(async () => {
    await practice?.props.onRecordingReady({
      durationMs: 2010,
      stopReason: 'manual',
      uri: 'file:///cache/skids_voice_retry.wav',
    });
  });

  expect(mockedSaveVoiceRecordingCandidate.mock.calls[1][0].encounterId).toBe(
    firstEncounterId,
  );

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

function getTextValues(tree: ReactTestRenderer.ReactTestRenderer | undefined) {
  return tree?.root.findAllByType(Text).map(node => node.props.children) ?? [];
}

async function renderScenePlayer(
  scene: Scene,
  learningMode: LearningMode = 'core',
) {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 800, width: 400, x: 0, y: 0 },
          insets: { bottom: 0, left: 0, right: 0, top: 0 },
        }}
      >
        <ScenePlayer learningMode={learningMode} scene={scene} />
      </SafeAreaProvider>,
    );
    await flushPromises();
    await flushPromises();
    await flushPromises();
    await flushPromises();
  });

  if (!tree) {
    throw new Error('ScenePlayer did not render.');
  }

  return tree;
}

function findSceneObject(
  tree: ReactTestRenderer.ReactTestRenderer,
  objectId: string,
) {
  return tree.root
    .findAllByType(SceneObjectRenderer)
    .find(node => node.props.object.id === objectId);
}

function flushPromises() {
  return Promise.resolve();
}
