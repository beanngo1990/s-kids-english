import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ScenePlayer } from '../src/engine/ScenePlayer';
import { speakVi } from '../src/engine/AudioManager';
import { SceneObjectRenderer } from '../src/engine/SceneObjectRenderer';
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
  prefetchAssets: jest.fn(() => Promise.resolve()),
  resolveAsset: jest.fn(() => undefined),
}));

jest.mock('../src/engine/AssetCacheManager', () => ({
  prefetchRemoteAssets: jest.fn(() => Promise.resolve()),
}));

jest.mock('../src/engine/ParentSettingsManager', () => ({
  getParentSettings: jest.fn(() =>
    Promise.resolve({
      appLanguage: 'vi',
      enableSceneEditor: false,
      teacherPromptMode: 'vi',
    }),
  ),
  subscribeParentSettings: jest.fn(() => jest.fn()),
}));

const mockedSpeakVi = speakVi as jest.MockedFunction<typeof speakVi>;

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
  expect(tree?.root.findByType(SceneObjectRenderer).props.isDisabled).toBe(true);
});

function getTextValues(tree: ReactTestRenderer.ReactTestRenderer | undefined) {
  return tree?.root.findAllByType(Text).map(node => node.props.children) ?? [];
}

function flushPromises() {
  return Promise.resolve();
}
