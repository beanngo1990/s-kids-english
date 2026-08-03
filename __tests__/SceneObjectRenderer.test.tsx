import React from 'react';
import { Text } from 'react-native';
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
