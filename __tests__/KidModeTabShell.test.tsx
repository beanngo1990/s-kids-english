import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

import { KidModeTabShell } from '../src/components/KidModeTabShell';

jest.mock('../src/theme/motion', () => ({
  useReducedMotion: () => true,
}));

jest.mock('../src/engine/AudioManager', () => ({
  playTapSound: jest.fn(() => Promise.resolve()),
}));

test('switches panes without rendering their heavy content again', async () => {
  const renderCounts = { map: 0, play: 0 };
  const mapPane = <RenderProbe name="map" renderCounts={renderCounts} />;
  const playPane = <RenderProbe name="play" renderCounts={renderCounts} />;
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <KidModeTabShell mapPane={mapPane} playPane={playPane} />,
    );
  });

  expect(renderCounts).toEqual({ map: 1, play: 1 });
  expectPaneState(tree!, 'map');

  await ReactTestRenderer.act(() => {
    tree?.root
      .findByProps({ accessibilityLabel: 'Mở khu chơi' })
      .props.onPress();
  });

  expect(renderCounts).toEqual({ map: 1, play: 1 });
  expectPaneState(tree!, 'play');

  await ReactTestRenderer.act(() => {
    tree?.root
      .findByProps({ accessibilityLabel: 'Mở bản đồ bài học' })
      .props.onPress();
  });

  expect(renderCounts).toEqual({ map: 1, play: 1 });
  expectPaneState(tree!, 'map');

  await ReactTestRenderer.act(() => tree?.unmount());
});

test('honors a requested tab from navigation', async () => {
  const mapPane = <Text>Map content</Text>;
  const playPane = <Text>Play content</Text>;
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <KidModeTabShell
        mapPane={mapPane}
        playPane={playPane}
        requestedTab="play"
      />,
    );
  });

  expectPaneState(tree!, 'play');
  await ReactTestRenderer.act(() => tree?.unmount());
});

function RenderProbe({
  name,
  renderCounts,
}: {
  name: 'map' | 'play';
  renderCounts: Record<'map' | 'play', number>;
}) {
  renderCounts[name] += 1;
  return <Text>{name}</Text>;
}

function expectPaneState(
  tree: ReactTestRenderer.ReactTestRenderer,
  activePane: 'map' | 'play',
) {
  const mapPane = tree.root.find(
    node => node.type === View && node.props.testID === 'kid-mode-map-pane',
  );
  const playPane = tree.root.find(
    node => node.type === View && node.props.testID === 'kid-mode-play-pane',
  );
  const active = activePane === 'map' ? mapPane : playPane;
  const hidden = activePane === 'map' ? playPane : mapPane;

  expect(StyleSheet.flatten(active.props.style).display).toBeUndefined();
  expect(active.props.pointerEvents).toBe('auto');
  expect(active.props.accessibilityElementsHidden).toBe(false);
  expect(StyleSheet.flatten(hidden.props.style).display).toBe('none');
  expect(hidden.props.pointerEvents).toBe('none');
  expect(hidden.props.accessibilityElementsHidden).toBe(true);
}
