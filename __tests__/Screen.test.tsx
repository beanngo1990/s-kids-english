import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';

import { KidRouteHeader } from '../src/components/KidRouteHeader';
import { Screen } from '../src/components/Screen';

test('renders a fixed header outside its scroll view', () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;

  act(() => {
    renderer = ReactTestRenderer.create(
      <Screen fixedHeader={<View testID="fixed-header" />} scroll>
        <View testID="scrolling-content" />
      </Screen>,
    );
  });

  const scrollView = renderer!.root.findByType(ScrollView);
  expect(scrollView.findAllByProps({ testID: 'fixed-header' })).toHaveLength(0);
  expect(scrollView.findByProps({ testID: 'scrolling-content' })).toBeDefined();

  act(() => renderer!.unmount());
});

test('renders the shared kid route header with a semantic back action', () => {
  const onClose = jest.fn();
  let renderer: ReactTestRenderer.ReactTestRenderer;

  act(() => {
    renderer = ReactTestRenderer.create(
      <KidRouteHeader
        action="back"
        onAction={onClose}
        title="Bộ sưu tập"
      />,
    );
  });

  const text = renderer!.root.findAllByType(Text).map(node => node.props.children);
  expect(text).toContain('Bộ sưu tập');
  expect(text).not.toContain('Home');

  const backButton = renderer!.root.findByProps({
    accessibilityLabel: 'Quay lại',
  });
  act(() => backButton.props.onPress());
  expect(onClose).toHaveBeenCalledTimes(1);

  act(() => renderer!.unmount());
});

test('renders a close action for immersive routes', () => {
  const onClose = jest.fn();
  let renderer: ReactTestRenderer.ReactTestRenderer;

  act(() => {
    renderer = ReactTestRenderer.create(
      <KidRouteHeader
        action="close"
        onAction={onClose}
        title="Sân chơi Sticker"
      />,
    );
  });

  const closeButton = renderer!.root.findByProps({
    accessibilityLabel: 'Đóng',
  });
  act(() => closeButton.props.onPress());
  expect(onClose).toHaveBeenCalledTimes(1);

  act(() => renderer!.unmount());
});
