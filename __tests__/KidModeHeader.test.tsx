import React from 'react';
import { AccessibilityInfo, StyleSheet, Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

import { KidModeHeader } from '../src/components/KidModeHeader';
import { playTapSound } from '../src/engine/AudioManager';

const mockUseWindowDimensions = jest.fn();

jest.mock('../src/engine/AudioManager', () => ({
  playTapSound: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native', () => {
  const actual = jest.requireActual('react-native');

  return new Proxy(actual, {
    get(target, property, receiver) {
      if (property === 'useWindowDimensions') {
        return mockUseWindowDimensions;
      }

      return Reflect.get(target, property, receiver);
    },
  });
});

beforeEach(() => {
  jest.clearAllMocks();
  const mockReduceMotion =
    AccessibilityInfo.isReduceMotionEnabled as jest.MockedFunction<
      typeof AccessibilityInfo.isReduceMotionEnabled
    >;
  mockReduceMotion.mockResolvedValue(true);
  mockUseWindowDimensions.mockReturnValue({
    fontScale: 1,
    height: 844,
    scale: 3,
    width: 440,
  });
});

afterEach(() => {
  jest.useRealTimers();
});

test('keeps the full level label on wider kid headers', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <KidModeHeader
        onOpenParent={() => undefined}
        onOpenThemeLibrary={() => undefined}
        totalXP={0}
      />,
    );
  });

  expect(getTextValues(tree)).toContain('Cấp 1');

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('uses a balanced icon badge for the level on narrow kid headers', async () => {
  mockUseWindowDimensions.mockReturnValue({
    fontScale: 1,
    height: 844,
    scale: 3,
    width: 390,
  });

  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <KidModeHeader
        onOpenParent={() => undefined}
        onOpenThemeLibrary={() => undefined}
        totalXP={0}
      />,
    );
  });

  const textValues = getTextValues(tree);
  const progressButton = tree?.root.findByProps({
    testID: 'kid-level-progress',
  });

  expect(textValues).toContain('1');
  expect(textValues).not.toContain('Cấp 1');
  expect(progressButton?.props.accessibilityLabel).toContain('cấp 1');
  expect(progressButton?.props.accessibilityRole).toBe('button');
  const progressCards = progressButton?.findAll(node => {
    const flattenedStyle = StyleSheet.flatten(node.props.style);

    return (
      flattenedStyle?.height === 46 &&
      flattenedStyle?.minWidth === 46 &&
      flattenedStyle?.width === 46
    );
  });
  expect(progressCards?.length).toBeGreaterThan(0);

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('plays tap feedback before opening the theme library', async () => {
  const onOpenThemeLibrary = jest.fn();
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <KidModeHeader
        onOpenParent={() => undefined}
        onOpenThemeLibrary={onOpenThemeLibrary}
        totalXP={0}
      />,
    );
  });

  const themeLibraryButton = tree?.root.findByProps({
    accessibilityLabel: 'Đổi chủ đề bản đồ',
  });

  await ReactTestRenderer.act(async () => {
    themeLibraryButton?.props.onPress();
  });

  expect(playTapSound).toHaveBeenCalledTimes(1);
  expect(onOpenThemeLibrary).toHaveBeenCalledTimes(1);

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('shows a short level hint when the acorn badge is pressed', async () => {
  jest.useFakeTimers();
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <KidModeHeader onOpenParent={() => undefined} totalXP={182} />,
    );
  });

  const progressButton = tree?.root.findByProps({
    testID: 'kid-level-progress',
  });

  await ReactTestRenderer.act(async () => {
    progressButton?.props.onPress();
  });

  expect(playTapSound).toHaveBeenCalledTimes(1);
  expect(getTextValues(tree)).toEqual(
    expect.arrayContaining([
      'Cấp 8',
      'Còn 43 hạt dẻ nữa để lên Cấp 9!',
    ]),
  );
  expect(
    tree?.root.findByProps({ testID: 'kid-level-progress-hint' }),
  ).toBeDefined();

  ReactTestRenderer.act(() => {
    jest.advanceTimersByTime(3000);
  });
  expect(
    tree?.root.findAllByProps({ testID: 'kid-level-progress-hint' }),
  ).toHaveLength(0);

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

function getTextValues(tree: ReactTestRenderer.ReactTestRenderer | undefined) {
  return (
    tree?.root
      .findAllByType(Text)
      .flatMap(node => flattenText(node.props.children)) ?? []
  );
}

function flattenText(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value];
  }

  if (typeof value === 'number') {
    return [String(value)];
  }

  if (Array.isArray(value)) {
    return value.flatMap(flattenText);
  }

  return [];
}
