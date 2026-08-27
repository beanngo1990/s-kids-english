import React from 'react';
import { StyleSheet, Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

import { KidPressable } from '../src/components/KidPressable';
import { playTapSound } from '../src/engine/AudioManager';

jest.mock('../src/engine/AudioManager', () => ({
  playTapSound: jest.fn(() => Promise.resolve()),
}));

const mockPlayTapSound = playTapSound as jest.MockedFunction<
  typeof playTapSound
>;

afterEach(() => {
  jest.restoreAllMocks();
  mockPlayTapSound.mockClear();
});

test('throttles repeated presses and keeps reduced-motion feedback static', async () => {
  const onPress = jest.fn();
  const nowSpy = jest
    .spyOn(Date, 'now')
    .mockReturnValueOnce(1000)
    .mockReturnValueOnce(1100)
    .mockReturnValueOnce(1400);
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <KidPressable
        accessibilityLabel="Nút của bé"
        onPress={onPress}
        playSound
        reducedMotion
        testID="kid-pressable-under-test"
      >
        <Text>Chạm</Text>
      </KidPressable>,
    );
  });

  const pressable = tree?.root
    .findAll(
      node =>
        node.type !== KidPressable &&
        node.props.testID === 'kid-pressable-under-test' &&
        typeof node.props.onPress === 'function',
    )
    .at(0);
  const flattenedStyle = StyleSheet.flatten(pressable?.props.style);

  await ReactTestRenderer.act(() => {
    pressable?.props.onPress({});
    pressable?.props.onPress({});
    pressable?.props.onPress({});
  });

  expect(flattenedStyle?.transform).toBeUndefined();
  expect(onPress).toHaveBeenCalledTimes(2);
  expect(mockPlayTapSound).toHaveBeenCalledTimes(2);
  expect(nowSpy).toHaveBeenCalledTimes(3);

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});
