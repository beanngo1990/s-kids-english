import React from 'react';
import { Animated, Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

import { SceneObjectRenderer } from '../src/engine/SceneObjectRenderer';
import { resolveAsset } from '../src/engine/AssetRegistry';
import type { SceneObject } from '../src/types/lesson';

jest.mock('../src/engine/AssetRegistry', () => ({
  resolveAsset: jest.fn(() => ({
    uri: 'https://assets.sungy.net/v1/lessons/my-body/head-and-face/images/head.webp',
  })),
}));

const mockedResolveAsset = resolveAsset as jest.MockedFunction<
  typeof resolveAsset
>;

const headObject: SceneObject = {
  asset: {
    id: 'head',
    source: 'lessons/my-body/head-and-face/images/head.webp',
    type: 'image',
  },
  id: 'head',
  isInteractive: true,
  position: { height: 20, width: 20, x: 40, y: 20 },
  role: 'learning',
};

test('does not show fallback emoji while a remote image is still loading', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SceneObjectRenderer
        effect="none"
        isDimmed={false}
        isDisabled={false}
        isTargeted={false}
        label="cái đầu"
        object={headObject}
        onPress={() => undefined}
      />,
    );
  });

  expect(mockedResolveAsset).toHaveBeenCalledWith(headObject.asset.source);
  expect(
    tree?.root
      .findAllByType(Text)
      .some(node => node.props.accessibilityLabel === 'cái đầu placeholder'),
  ).toBe(false);
});

test('keeps a sourced image visible before native load callbacks fire', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SceneObjectRenderer
        effect="none"
        isDimmed={false}
        isDisabled={false}
        isTargeted={false}
        label="cái đầu"
        object={headObject}
        onPress={() => undefined}
      />,
    );
  });

  const image = tree?.root.findByType(Animated.Image);

  expect(getOpacityValue(image?.props.style)).toBe(1);
});

function getOpacityValue(style: unknown) {
  const styleEntries = Array.isArray(style) ? style : [style];

  for (const styleEntry of styleEntries) {
    if (!styleEntry || typeof styleEntry !== 'object') {
      continue;
    }

    const opacity = (styleEntry as { opacity?: unknown }).opacity;

    if (typeof opacity === 'number') {
      return opacity;
    }

    if (isAnimatedValueLike(opacity)) {
      const value = opacity.__getValue();
      return typeof value === 'number' ? value : undefined;
    }
  }

  return undefined;
}

function isAnimatedValueLike(
  value: unknown,
): value is { __getValue: () => unknown } {
  return (
    value !== null &&
    typeof value === 'object' &&
    '__getValue' in value &&
    typeof (value as { __getValue?: unknown }).__getValue === 'function'
  );
}
