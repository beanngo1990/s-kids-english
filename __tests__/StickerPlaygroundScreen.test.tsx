import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppButton } from '../src/components/AppButton';
import {
  getLocalizedLessonRewardName,
  lessonRewards,
} from '../src/data/rewards';
import {
  normalizeProgress,
  resetProgress,
  saveProgress,
} from '../src/engine/ProgressManager';
import { StickerPlaygroundScreen } from '../src/screens/StickerPlaygroundScreen';
import { StickerCollectionScreen } from '../src/screens/StickerCollectionScreen';

jest.mock('../src/engine/AudioManager', () => ({
  playCompleteSound: jest.fn(() => Promise.resolve()),
  playTapSound: jest.fn(() => Promise.resolve()),
}));

beforeEach(async () => {
  await resetProgress();
});

test('adds an unlocked sticker from the tray to the playground canvas', async () => {
  jest.useFakeTimers();
  const reward = lessonRewards[0];
  expect(reward).toBeDefined();
  if (!reward) {
    throw new Error('Lesson reward catalog is empty.');
  }
  const stickerName = getLocalizedLessonRewardName(reward, 'vi');

  await saveProgress(
    normalizeProgress({ earnedStickerIds: [reward.stickerId] }),
  );
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <GestureHandlerRootView>
        <StickerPlaygroundScreen
          navigation={{ navigate: jest.fn() } as never}
          route={{ key: 'StickerPlayground', name: 'StickerPlayground' }}
        />
      </GestureHandlerRootView>,
    );
  });
  await ReactTestRenderer.act(async () => undefined);

  const trayItem = tree?.root.find(
    node =>
      node.props.accessibilityRole === 'button' &&
      node.props.accessibilityLabel === stickerName &&
      typeof node.props.onPress === 'function',
  );
  expect(trayItem).toBeDefined();

  const backgroundSelector = tree?.root.findByProps({
    testID: 'sticker-background-selector',
  });
  const backgroundSelectorStyle = StyleSheet.flatten(
    backgroundSelector?.props.style,
  );
  expect(backgroundSelectorStyle).toMatchObject({ flex: 1, minWidth: 0 });

  expect(
    tree?.root.findAllByProps({ testID: 'sticker-save-status' }),
  ).toHaveLength(0);

  ReactTestRenderer.act(() => {
    trayItem?.props.onPress();
  });

  const saveStatus = tree?.root.findByProps({
    testID: 'sticker-save-status',
  });
  expect(saveStatus?.props.numberOfLines).toBe(1);

  const matchingStickerNodes = tree?.root.findAll(
    node => node.props.accessibilityLabel === stickerName,
  );
  expect(matchingStickerNodes?.length).toBeGreaterThan(1);

  ReactTestRenderer.act(() => {
    trayItem?.props.onPress();
  });
  const matchingStickerNodesAfterSecondTap = tree?.root.findAll(
    node => node.props.accessibilityLabel === stickerName,
  );
  expect(matchingStickerNodesAfterSecondTap).toHaveLength(
    matchingStickerNodes?.length ?? 0,
  );

  const placedTrayItem = tree?.root.find(
    node =>
      node.props.accessibilityLabel === stickerName &&
      node.props.accessibilityState?.selected === true,
  );
  expect(placedTrayItem).toBeDefined();

  await ReactTestRenderer.act(async () => {
    jest.runOnlyPendingTimers();
  });
  ReactTestRenderer.act(() => {
    tree?.unmount();
  });
  jest.useRealTimers();
});

test('unlocked sticker collection offers a shortcut to Sticker Playground', async () => {
  const reward = lessonRewards[0];
  expect(reward).toBeDefined();
  if (!reward) {
    throw new Error('Lesson reward catalog is empty.');
  }

  await saveProgress(
    normalizeProgress({ earnedStickerIds: [reward.stickerId] }),
  );
  const navigation = { navigate: jest.fn() };
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <StickerCollectionScreen
        navigation={navigation as never}
        route={{
          key: 'StickerCollection',
          name: 'StickerCollection',
          params: undefined,
        }}
      />,
    );
    await Promise.resolve();
    await Promise.resolve();
  });

  const decorateButton = tree?.root
    .findAllByType(AppButton)
    .find(node => node.props.title === 'Mang sticker đi trang trí');

  expect(decorateButton).toBeDefined();
  ReactTestRenderer.act(() => {
    decorateButton?.props.onPress();
  });
  expect(navigation.navigate).toHaveBeenCalledWith('StickerPlayground');

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});
