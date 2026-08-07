import React from 'react';
import { ScrollView, View } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';

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
