/**
 * @format
 */

import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

import { HomeScreen } from '../src/screens/HomeScreen';
import { OnboardingScreen } from '../src/screens/OnboardingScreen';

let mockMonetizationStatus = 'free';

jest.mock('../src/engine/MonetizationManager', () => {
  return {
    getMonetizationSnapshot: () => ({ status: mockMonetizationStatus }),
    useMonetizationSnapshot: () => ({ status: mockMonetizationStatus }),
  };
});

beforeEach(() => {
  mockMonetizationStatus = 'free';
});

test('renders the home screen', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <HomeScreen
        navigation={
          {
            addListener: jest.fn(() => jest.fn()),
            navigate: jest.fn(),
          } as never
        }
        route={{ key: 'Home', name: 'Home' } as never}
      />,
    );
  });

  const textValues = tree?.root
    .findAllByType(Text)
    .map(node => node.props.children);

  await ReactTestRenderer.act(() => {
    tree?.unmount();
  });

  expect(textValues).toContain('S-Kids');
  expect(textValues).not.toContain('Premium');
  expect(textValues).toContain('Bản đồ');
  expect(textValues).toContain('Chơi');
  expect(textValues).not.toContain('Chơi ngay');
  expect(textValues).toContain('Ở Trường Của Bé');
  expect(textValues).toContain('Giờ Ra Chơi');
  expect(textValues).toContain('Bữa trưa của bé');
  expect(textValues).toContain('Về nhà buổi chiều');
  expect(textValues).toContain('Bữa xế của bé');
  expect(textValues).toContain('Chơi ở nhà');
  expect(textValues).toContain('Tắm rửa buổi chiều');
  expect(textValues).toContain('Bữa tối của gia đình');
  expect(textValues).toContain('Dọn dẹp sau bữa tối');
  expect(textValues).toContain('Giờ đi ngủ');
});

test('shows the Premium badge in the home header for active access', async () => {
  mockMonetizationStatus = 'premium';
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <HomeScreen
        navigation={
          {
            addListener: jest.fn(() => jest.fn()),
            navigate: jest.fn(),
          } as never
        }
        route={{ key: 'Home', name: 'Home' } as never}
      />,
    );
  });

  const hasPremiumAccessibilityLabel = tree?.root
    .findAll(
      node =>
        typeof node.props.accessibilityLabel === 'string' &&
        node.props.accessibilityLabel.includes(
          'S-Kids Premium đang hoạt động',
        ),
    )
    .some(Boolean);

  await ReactTestRenderer.act(() => {
    tree?.unmount();
  });

  expect(hasPremiumAccessibilityLabel).toBe(true);
});

test('renders parent onboarding before first use', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <OnboardingScreen
        navigation={{ replace: jest.fn() } as never}
        route={{ key: 'Onboarding', name: 'Onboarding' } as never}
      />,
    );
  });

  const textValues = tree?.root
    .findAllByType(Text)
    .map(node => node.props.children);

  await ReactTestRenderer.act(() => {
    tree?.unmount();
  });

  expect(textValues).toContain('Chọn độ khó cho bé');
  expect(textValues).toContain('Dễ');
  expect(textValues).toContain('Vừa');
  expect(textValues).toContain('Khó');
});
