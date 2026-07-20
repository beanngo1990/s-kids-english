import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ScenePlayer } from '../src/engine/ScenePlayer';
import { speakVi } from '../src/engine/AudioManager';
import { prefetchAssets } from '../src/engine/AssetRegistry';
import {
  prefetchRemoteAssets,
  prepareRemoteAssets,
} from '../src/engine/AssetCacheManager';
import { AppButton } from '../src/components/AppButton';
import { SceneObjectRenderer } from '../src/engine/SceneObjectRenderer';
import { KidIconButton } from '../src/components/KidIconButton';
import type { Scene } from '../src/types/lesson';

jest.mock('../src/engine/AudioManager', () => {
  const speakViMock = jest.fn((_text: string) => Promise.resolve());
  const speakWordMock = jest.fn((_text: string) => Promise.resolve());

  return {
    playCorrectSound: jest.fn(() => Promise.resolve()),
    playSoundEffect: jest.fn(() => Promise.resolve()),
    playTapSound: jest.fn(() => Promise.resolve()),
    playWrongSound: jest.fn(() => Promise.resolve()),
    speakTeacherPromptSegments: jest.fn(
      (segments: Array<{ language: 'en' | 'vi'; text: string }>) =>
        segments.reduce<Promise<void>>(
          (promise, segment) =>
            promise.then(() =>
              segment.language === 'en'
                ? speakWordMock(segment.text)
                : speakViMock(segment.text),
            ),
          Promise.resolve(),
        ),
    ),
    speakVi: speakViMock,
    speakWord: speakWordMock,
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

jest.mock('../src/engine/ParentSettingsManager', () => ({
  getParentSettings: jest.fn(() =>
    Promise.resolve({
      appLanguage: 'vi',
      enableSceneEditor: false,
      englishAccent: 'en-US',
      teacherPromptMode: 'vi',
    }),
  ),
  subscribeParentSettings: jest.fn(() => jest.fn()),
}));

const mockedSpeakVi = speakVi as jest.MockedFunction<typeof speakVi>;
const mockedPrefetchAssets = prefetchAssets as jest.MockedFunction<
  typeof prefetchAssets
>;
const mockedPrefetchRemoteAssets = prefetchRemoteAssets as jest.MockedFunction<
  typeof prefetchRemoteAssets
>;
const mockedPrepareRemoteAssets = prepareRemoteAssets as jest.MockedFunction<
  typeof prepareRemoteAssets
>;

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

beforeEach(() => {
  mockedSpeakVi.mockReset();
  mockedSpeakVi.mockResolvedValue();
  mockedPrefetchAssets.mockReset();
  mockedPrefetchAssets.mockResolvedValue(true);
  mockedPrefetchRemoteAssets.mockReset();
  mockedPrefetchRemoteAssets.mockResolvedValue(true);
  mockedPrepareRemoteAssets.mockReset();
  mockedPrepareRemoteAssets.mockResolvedValue(true);
});

afterEach(() => {
  jest.useRealTimers();
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

test('blocks the lesson when a required image is unavailable', async () => {
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

  expect(mockedPrefetchAssets).toHaveBeenCalledWith(['background']);
  expect(getTextValues(tree)).toContain('Bài học chưa sẵn sàng');
  expect(getTextValues(tree)).not.toContain('Tiếp tục');
  expect(mockedSpeakVi).not.toHaveBeenCalled();

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

test('blocks initial loading on required audio across the current scene', async () => {
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
  expect(initialAudioKeys).toContain(
    'test/audio/vi/Câu hướng dẫn tải nền..wav',
  );
  expect(initialAudioKeys).toContain('test/audio/vi/Giỏi lắm!.wav');

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

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

function getTextValues(tree: ReactTestRenderer.ReactTestRenderer | undefined) {
  return tree?.root.findAllByType(Text).map(node => node.props.children) ?? [];
}

function flushPromises() {
  return Promise.resolve();
}
