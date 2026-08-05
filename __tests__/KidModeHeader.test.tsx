import React from 'react';
import { StyleSheet, Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

import { KidModeHeader } from '../src/components/KidModeHeader';

const mockUseWindowDimensions = jest.fn();

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
  mockUseWindowDimensions.mockReturnValue({
    fontScale: 1,
    height: 844,
    scale: 3,
    width: 440,
  });
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
  const progressbar = tree?.root.findByProps({
    accessibilityRole: 'progressbar',
  });

  expect(textValues).toContain('1');
  expect(textValues).not.toContain('Cấp 1');
  expect(progressbar?.props.accessibilityLabel).toContain('cấp 1');
  expect(StyleSheet.flatten(progressbar?.props.style)).toMatchObject({
    height: 46,
    minWidth: 46,
    width: 46,
  });

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
