import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { AppButton } from '../src/components/AppButton';
import { lessons } from '../src/data/lessons';
import {
  resetParentSettings,
  saveParentSettings,
} from '../src/engine/ParentSettingsManager';
import {
  getProgress,
  normalizeProgress,
  resetProgress,
  saveProgress,
} from '../src/engine/ProgressManager';
import { RewardScreen } from '../src/screens/RewardScreen';
import { ReviewGameScreen } from '../src/screens/ReviewGameScreen';
import { getSceneProgressId } from '../src/utils/lessonProgress';

jest.mock('../src/engine/AudioManager', () => ({
  playCompleteSound: jest.fn(() => Promise.resolve()),
  playTapSound: jest.fn(() => Promise.resolve()),
  speakTeacherPromptSegments: jest.fn(() => Promise.resolve()),
  speakVi: jest.fn(() => Promise.resolve()),
  speakWord: jest.fn(() => Promise.resolve()),
}));

jest.mock('../src/engine/MonetizationManager', () => ({
  getMonetizationSnapshot: () => ({ status: 'premium' }),
  useMonetizationSnapshot: () => ({ status: 'premium' }),
}));

jest.mock('../src/engine/useContentAccess', () => ({
  useContentAccess: () => ({
    isAccessGranted: true,
    isResolving: false,
  }),
}));

jest.mock('../src/games/GameRegistry', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');

  return {
    GamePlayer: () =>
      ReactModule.createElement(View, { testID: 'review-game-player' }),
    resolveReviewGameType: () => 'memory',
  };
});

jest.mock('react-native-confetti-cannon', () => () => null);

beforeEach(async () => {
  jest.clearAllMocks();
  await resetParentSettings();
  await resetProgress();
});

test('next lesson from Reward opens its pack and keeps the active theme aligned', async () => {
  const boundaryIndex = lessons.findIndex(
    (lesson, index) =>
      index < lessons.length - 1 &&
      lessons[index + 1].themeId !== lesson.themeId,
  );
  const lesson = lessons[boundaryIndex];
  const nextLesson = lessons[boundaryIndex + 1];

  expect(lesson).toBeDefined();
  expect(nextLesson).toBeDefined();

  await saveProgress(
    normalizeProgress({
      activeThemeId: lesson.themeId,
    }),
  );

  const navigation = createNavigation();
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <RewardScreen
        navigation={navigation as never}
        route={{
          key: 'Reward',
          name: 'Reward',
          params: {
            gameType: 'memory',
            lessonId: lesson.id,
            sourceScreen: 'ReviewGame',
          },
        }}
      />,
    );
    await flushPromises();
  });

  const nextButton = tree?.root
    .findAllByType(AppButton)
    .find(node => node.props.title === 'Bài tiếp theo');

  expect(nextButton).toBeDefined();

  await ReactTestRenderer.act(async () => {
    nextButton?.props.onPress();
    await flushPromises();
  });

  expect(navigation.replace).toHaveBeenCalledWith('LessonPack', {
    lessonId: nextLesson.id,
  });
  expect(navigation.replace).not.toHaveBeenCalledWith(
    'ReviewGame',
    expect.anything(),
  );
  expect((await getProgress()).activeThemeId).toBe(nextLesson.themeId);

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('guided mode redirects an unfinished lesson review back to its pack', async () => {
  const lesson = lessons[0];
  const navigation = createNavigation();
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <ReviewGameScreen
        navigation={navigation as never}
        route={createReviewRoute(lesson.id)}
      />,
    );
    await flushPromises();
  });

  expect(navigation.replace).toHaveBeenCalledWith('LessonPack', {
    lessonId: lesson.id,
    openedFromParent: false,
  });
  expect(
    tree?.root.findAllByProps({ testID: 'review-game-player' }),
  ).toHaveLength(0);

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('guided mode allows review after every lesson scene is complete', async () => {
  const lesson = lessons[0];
  await saveProgress(
    normalizeProgress({
      completedSceneIds: lesson.scenes.map(scene =>
        getSceneProgressId(lesson.id, scene.id),
      ),
    }),
  );

  const navigation = createNavigation();
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <ReviewGameScreen
        navigation={navigation as never}
        route={createReviewRoute(lesson.id)}
      />,
    );
    await flushPromises();
  });

  expect(navigation.replace).not.toHaveBeenCalled();
  expect(
    tree?.root.findAllByProps({ testID: 'review-game-player' }).length,
  ).toBeGreaterThan(0);

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('free journey mode keeps review available before scene completion', async () => {
  await saveParentSettings({ journeyMode: 'free' });

  const lesson = lessons[0];
  const navigation = createNavigation();
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <ReviewGameScreen
        navigation={navigation as never}
        route={createReviewRoute(lesson.id)}
      />,
    );
    await flushPromises();
  });

  expect(navigation.replace).not.toHaveBeenCalled();
  expect(
    tree?.root.findAllByProps({ testID: 'review-game-player' }).length,
  ).toBeGreaterThan(0);

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

function createNavigation() {
  return {
    canGoBack: jest.fn(() => true),
    goBack: jest.fn(),
    navigate: jest.fn(),
    replace: jest.fn(),
  };
}

function createReviewRoute(lessonId: string) {
  return {
    key: 'ReviewGame',
    name: 'ReviewGame' as const,
    params: { lessonId },
  };
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}
