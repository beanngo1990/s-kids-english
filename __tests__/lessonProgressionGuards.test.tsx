import React from 'react';
import { Image, Text } from 'react-native';
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
import { getReviewGameItems } from '../src/games/reviewItems';
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

test('next lesson from Reward opens its next scene and keeps the active theme aligned', async () => {
  const boundaryIndex = lessons.findIndex(
    (lesson, index) =>
      index < lessons.length - 1 &&
      lessons[index + 1].themeId !== lesson.themeId,
  );
  const lesson = lessons[boundaryIndex];
  const nextLesson = lessons[boundaryIndex + 1];

  expect(lesson).toBeDefined();
  expect(nextLesson).toBeDefined();
  expect(nextLesson.scenes.length).toBeGreaterThan(1);

  await saveProgress(
    normalizeProgress({
      activeThemeId: lesson.themeId,
      completedSceneIds: [
        getSceneProgressId(nextLesson.id, nextLesson.scenes[0].id),
      ],
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
            learningMode: 'challenge',
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

  expect(navigation.reset).toHaveBeenCalledWith({
    index: 1,
    routes: [
      { name: 'Home', params: { activeTab: 'map' } },
      {
        name: 'ScenePlayer',
        params: {
          learningMode: 'challenge',
          lessonId: nextLesson.id,
          sceneId: nextLesson.scenes[1].id,
        },
      },
    ],
  });
  expect((await getProgress()).activeThemeId).toBe(nextLesson.themeId);

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('Reward map action always ends on the Home map', async () => {
  const lesson = lessons[0];
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

  const mapButton = tree?.root
    .findAllByType(AppButton)
    .find(node => node.props.title === 'Bản đồ');

  expect(mapButton).toBeDefined();
  ReactTestRenderer.act(() => {
    mapButton?.props.onPress();
  });
  expect(navigation.reset).toHaveBeenCalledWith({
    index: 0,
    routes: [{ name: 'Home', params: { activeTab: 'map' } }],
  });

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('new sticker reward offers collection and decoration shortcuts', async () => {
  const lesson = lessons[0];
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
            lessonId: lesson.id,
            unlockedSticker: {
              id: 'reward-test',
              stickerId: 'sticker-test',
              stickerName: 'Sticker test',
              title: 'Sticker test',
            },
          },
        }}
      />,
    );
    await flushPromises();
  });

  const decorateButton = tree?.root
    .findAllByType(AppButton)
    .find(node => node.props.title === 'Trang trí ngay');

  expect(decorateButton).toBeDefined();
  ReactTestRenderer.act(() => {
    decorateButton?.props.onPress();
  });
  expect(navigation.reset).toHaveBeenCalledWith({
    index: 1,
    routes: [
      { name: 'Home', params: { activeTab: 'play' } },
      { name: 'StickerPlayground' },
    ],
  });

  const collectionButton = tree?.root
    .findAllByType(AppButton)
    .find(node => node.props.title === 'Xem bộ sưu tập');

  expect(collectionButton).toBeDefined();
  ReactTestRenderer.act(() => {
    collectionButton?.props.onPress();
  });
  expect(navigation.navigate).toHaveBeenCalledWith('StickerCollection', {
    highlightedStickerId: 'sticker-test',
  });

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('Reward renders the same six vocabulary visuals used by the review game', async () => {
  const lesson = lessons.find(item => item.id === 'play-with-the-puppy');
  expect(lesson).toBeDefined();
  if (!lesson) {
    throw new Error('Play with the Puppy lesson is missing.');
  }

  const navigation = createNavigation();
  const reviewItems = getReviewGameItems(lesson, 'challenge');
  const words = reviewItems.map(item => item.word);
  const playedWordIds = reviewItems.map(item => item.id);
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  expect(words).toEqual([
    'play',
    'ball',
    'roll',
    'catch',
    'hold',
    'your turn',
  ]);

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <RewardScreen
        navigation={navigation as never}
        route={{
          key: 'Reward',
          name: 'Reward',
          params: {
            lessonId: lesson.id,
            learningMode: 'challenge',
            playedWordIds,
            sourceScreen: 'ReviewGame',
          },
        }}
      />,
    );
    await flushPromises();
  });

  words.forEach(word => {
    const wordLabel = tree?.root
      .findAllByType(Text)
      .find(node => node.props.children === word);

    expect(wordLabel).toBeDefined();
    expect(wordLabel?.parent?.findAllByType(Image)).toHaveLength(1);
  });

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('reward replay preserves the selected challenge mode', async () => {
  const lesson = lessons[0];
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
            lessonId: lesson.id,
            learningMode: 'challenge',
            sourceScreen: 'ScenePlayer',
          },
        }}
      />,
    );
    await flushPromises();
  });

  const replayButton = tree?.root
    .findAllByType(AppButton)
    .find(node => node.props.title === 'Chơi lại');

  expect(replayButton).toBeDefined();
  ReactTestRenderer.act(() => {
    replayButton?.props.onPress();
  });
  expect(navigation.reset).toHaveBeenCalledWith({
    index: 1,
    routes: [
      { name: 'Home', params: { activeTab: 'map' } },
      {
        name: 'ScenePlayer',
        params: {
          learningMode: 'challenge',
          lessonId: lesson.id,
        },
      },
    ],
  });

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('reward replay preserves the selected review game and learning mode', async () => {
  const lesson = lessons[0];
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
            gameType: 'matching',
            lessonId: lesson.id,
            learningMode: 'expanded',
            sourceScreen: 'ReviewGame',
          },
        }}
      />,
    );
    await flushPromises();
  });

  const replayButton = tree?.root
    .findAllByType(AppButton)
    .find(node => node.props.title === 'Chơi lại');

  expect(replayButton).toBeDefined();
  ReactTestRenderer.act(() => {
    replayButton?.props.onPress();
  });
  expect(navigation.reset).toHaveBeenCalledWith({
    index: 1,
    routes: [
      { name: 'Home', params: { activeTab: 'map' } },
      {
        name: 'ReviewGame',
        params: {
          gameType: 'matching',
          learningMode: 'expanded',
          lessonId: lesson.id,
        },
      },
    ],
  });

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
    reset: jest.fn(),
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
