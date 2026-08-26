import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { AppButton } from '../src/components/AppButton';
import { lessons } from '../src/data/lessons';
import {
  resetParentSettings,
  saveParentSettings,
} from '../src/engine/ParentSettingsManager';
import {
  normalizeProgress,
  resetProgress,
  saveProgress,
} from '../src/engine/ProgressManager';
import { LessonPackScreen } from '../src/screens/LessonPackScreen';
import { getSceneProgressId } from '../src/utils/lessonProgress';

jest.mock('../src/engine/AudioManager', () => ({
  playTapSound: jest.fn(() => Promise.resolve()),
  speakVi: jest.fn(() => Promise.resolve()),
  speakWord: jest.fn(() => Promise.resolve()),
}));

jest.mock('../src/engine/useContentAccess', () => ({
  useContentAccess: () => ({
    isAccessGranted: true,
    isResolving: false,
  }),
}));

beforeEach(async () => {
  jest.clearAllMocks();
  await resetParentSettings();
  await resetProgress();
});

test('completed scene offers a direct vocabulary playground shortcut', async () => {
  const lesson = lessons[0];
  const scene = lesson.scenes[0];
  await saveParentSettings({ learningMode: 'expanded' });
  await saveProgress(
    normalizeProgress({
      completedSceneIds: [getSceneProgressId(lesson.id, scene.id)],
    }),
  );
  const navigation = {
    addListener: jest.fn(() => jest.fn()),
    canGoBack: jest.fn(() => true),
    goBack: jest.fn(),
    navigate: jest.fn(),
    replace: jest.fn(),
  };
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <LessonPackScreen
        navigation={navigation as never}
        route={{
          key: 'LessonPack',
          name: 'LessonPack',
          params: { lessonId: lesson.id },
        }}
      />,
    );
    await flushPromises();
  });

  const playgroundButton = tree?.root
    .findAllByType(AppButton)
    .find(node => node.props.title === 'Chơi với từ');
  expect(playgroundButton).toBeDefined();

  await ReactTestRenderer.act(async () => {
    playgroundButton?.props.onPress();
    await flushPromises();
  });
  expect(navigation.navigate).toHaveBeenCalledWith(
    'SceneVocabularyPlayground',
    {
      learningMode: 'expanded',
      lessonId: lesson.id,
      openedFromParent: false,
      sceneId: scene.id,
    },
  );

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}
