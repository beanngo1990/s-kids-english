import React from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

import { SceneObjectRenderer } from '../src/engine/SceneObjectRenderer';
import { resolveAsset } from '../src/engine/AssetRegistry';
import { getActiveColors } from '../src/theme/colors';
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

  expect(StyleSheet.flatten(image?.props.style).opacity).toBeUndefined();
  expect(image?.props.onLoadStart).toBeUndefined();
});

test('uses the image silhouette for a targeted-object highlight', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SceneObjectRenderer
        effect="none"
        isDimmed={false}
        isDisabled={false}
        isTargeted
        label="cái đầu"
        object={headObject}
        onPress={() => undefined}
      />,
    );
  });

  const loadingImages = tree?.root.findAllByType(Animated.Image) ?? [];
  expect(loadingImages).toHaveLength(1);

  await ReactTestRenderer.act(async () => {
    loadingImages[0]?.props.onLoad();
  });

  const images = tree?.root.findAllByType(Animated.Image) ?? [];
  const tintedImages = images.filter(image => {
    const flattenedStyle = StyleSheet.flatten(image.props.style);
    return typeof flattenedStyle?.tintColor === 'string';
  });
  const fullColorImage = images.find(image => {
    const flattenedStyle = StyleSheet.flatten(image.props.style);
    return flattenedStyle?.tintColor === undefined;
  });

  expect(images).toHaveLength(3);
  expect(tintedImages).toHaveLength(2);
  expect(fullColorImage).toBeDefined();
  expect(
    StyleSheet.flatten(fullColorImage?.props.style).opacity,
  ).toBeUndefined();
  expect(fullColorImage?.props.onLoadStart).toBeUndefined();
  expect(
    tintedImages.map(image => StyleSheet.flatten(image.props.style).tintColor),
  ).toEqual([getActiveColors().focusOutline, getActiveColors().white]);
  expect(
    tintedImages.every(
      image => image.props.source === fullColorImage?.props.source,
    ),
  ).toBe(true);

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('raises an interaction target above overlapping siblings without showing a hint', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SceneObjectRenderer
        effect="none"
        isDimmed={false}
        isDisabled={false}
        isInteractionTarget
        isTargeted={false}
        label="cái đầu"
        object={headObject}
        onPress={() => undefined}
      />,
    );
  });

  const wrapper = tree?.root.findAllByType(Animated.View)[0];
  expect(StyleSheet.flatten(wrapper?.props.style).zIndex).toBe(2);
  expect(tree?.root.findAllByType(Animated.Image)).toHaveLength(1);

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});

test('magnifies a small target visually but not while it is draggable', async () => {
  const smallObject: SceneObject = {
    ...headObject,
    position: { height: 5, width: 5, x: 40, y: 20 },
  };
  const springSpy = jest.spyOn(Animated, 'spring');
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SceneObjectRenderer
        effect="none"
        isDimmed={false}
        isDisabled={false}
        isTargeted
        label="vật nhỏ"
        object={smallObject}
        onPress={() => undefined}
        stageSize={{ height: 480, width: 320 }}
      />,
    );
  });

  expect(
    springSpy.mock.calls.some(([, config]) => config.toValue === 1.22),
  ).toBe(true);

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
  springSpy.mockClear();

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SceneObjectRenderer
        effect="none"
        isDimmed={false}
        isDisabled={false}
        isDraggable
        isTargeted
        label="vật nhỏ"
        object={smallObject}
        onPress={() => undefined}
        stageSize={{ height: 480, width: 320 }}
      />,
    );
  });

  expect(
    springSpy.mock.calls.some(
      ([, config]) =>
        typeof config.toValue === 'number' && config.toValue > 1,
    ),
  ).toBe(false);

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
  springSpy.mockRestore();
});

test('notifies the scene when a draggable gesture begins', async () => {
  const onDragStart = jest.fn();
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SceneObjectRenderer
        effect="none"
        isDimmed={false}
        isDisabled={false}
        isDraggable
        isTargeted={false}
        label="cái đầu"
        object={headObject}
        onDragStart={onDragStart}
        onPress={() => undefined}
      />,
    );
  });

  const dragWrapper = tree?.root
    .findAllByType(Animated.View)
    .find(node => typeof node.props.onResponderGrant === 'function');
  expect(dragWrapper).toBeDefined();

  await ReactTestRenderer.act(async () => {
    dragWrapper?.props.onResponderGrant({
      touchHistory: {
        indexOfSingleActiveTouch: 0,
        numberActiveTouches: 1,
        touchBank: [
          {
            currentPageX: 10,
            currentPageY: 20,
            currentTimeStamp: 1,
            touchActive: true,
          },
        ],
      },
    });
  });

  expect(onDragStart).toHaveBeenCalledWith('head');

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});
