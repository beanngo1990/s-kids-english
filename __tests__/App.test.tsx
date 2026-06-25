/**
 * @format
 */

import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

import { HomeScreen } from '../src/screens/HomeScreen';

test('renders the home screen', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <HomeScreen
        navigation={{ navigate: jest.fn() } as never}
        route={{ key: 'Home', name: 'Home' } as never}
      />,
    );
  });

  const textValues = tree?.root
    .findAllByType(Text)
    .map(node => node.props.children);

  expect(textValues).toContain('Bắt đầu học');
});
