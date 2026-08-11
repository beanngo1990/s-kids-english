import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';

let mockStatus: 'none' | 'optional' | 'required' = 'optional';

const mockPlayTapSound = jest.fn(() => Promise.resolve());
const mockSpeakVi = jest.fn((_text: string) => Promise.resolve());
const mockSpeakWord = jest.fn((_text: string) => Promise.resolve());

jest.mock('../src/engine/AppUpdateManager', () => ({
  useAppUpdateSnapshot: () => ({
    currentVersion: '1.0',
    isReady: true,
    latestVersion: '1.1',
    minimumSupportedVersion: '1.0',
    status: mockStatus,
    storeUrl: 'https://apps.apple.com/app/id123456789',
  }),
}));

jest.mock('../src/engine/AudioManager', () => ({
  playTapSound: () => mockPlayTapSound(),
  speakVi: (text: string) => mockSpeakVi(text),
  speakWord: (text: string) => mockSpeakWord(text),
}));

jest.mock('../src/engine/ParentAccessSession', () => ({
  grantParentAccess: jest.fn(),
  setParentExternalFlowActive: jest.fn(),
  useParentAccessSnapshot: () => ({ isGranted: false }),
}));

jest.mock('../src/components/mascot', () => ({
  MascotImage: (props: {
    accessibilityLabel?: string;
    onPress?: () => void;
  }) => {
    const ReactModule = require('react') as typeof React;
    const { Pressable } =
      require('react-native') as typeof import('react-native');
    return ReactModule.createElement(Pressable, {
      ...props,
      testID: 'app-update-mascot',
    });
  },
}));

import { AppUpdateGate } from '../src/components/AppUpdateGate';
import { AppButton } from '../src/components/AppButton';

beforeEach(() => {
  mockStatus = 'optional';
  jest.clearAllMocks();
});

test('does not interrupt Kid Mode for an optional update', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await act(() => {
    renderer = ReactTestRenderer.create(
      <AppUpdateGate>
        <Text>App content</Text>
      </AppUpdateGate>,
    );
  });

  expect(
    renderer?.root
      .findAllByType(AppButton)
      .some(button => button.props.title === 'Cập nhật ngay'),
  ).toBe(false);
  expect(mockSpeakVi).not.toHaveBeenCalled();
  expect(mockSpeakWord).not.toHaveBeenCalled();

  await act(() => renderer?.unmount());
});

test('autoplays a child-friendly required prompt and replays it from Sungy', async () => {
  mockStatus = 'required';
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await act(() => {
    renderer = ReactTestRenderer.create(
      <AppUpdateGate>
        <Text>App content</Text>
      </AppUpdateGate>,
    );
  });

  expect(mockSpeakVi).toHaveBeenCalledTimes(1);
  expect(mockSpeakVi).toHaveBeenCalledWith('Bé ơi, gọi ba mẹ giúp Sungy nhé!');

  const mascot = renderer?.root.findByProps({ testID: 'app-update-mascot' });
  await act(() => mascot?.props.onPress());

  expect(mockPlayTapSound).toHaveBeenCalledTimes(1);
  expect(mockSpeakVi).toHaveBeenCalledTimes(2);

  await act(() => renderer?.unmount());
});

test('shows one parent-icon action and gates the store for a required update', async () => {
  mockStatus = 'required';
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await act(() => {
    renderer = ReactTestRenderer.create(
      <AppUpdateGate>
        <Text>App content</Text>
      </AppUpdateGate>,
    );
  });

  const childActions = renderer?.root.findAllByType(AppButton) ?? [];
  expect(childActions).toHaveLength(1);
  expect(childActions[0]?.props).toMatchObject({
    iconName: 'parentGate',
    title: 'Gọi ba mẹ',
  });

  await act(() => childActions[0]?.props.onPress());

  const textValues =
    renderer?.root.findAllByType(Text).map(node => node.props.children) ?? [];
  expect(textValues).toContain('Xác nhận dành cho ba mẹ');
  expect(textValues).toContain(
    'Ba mẹ giải phép tính này để mở cửa hàng và cập nhật ứng dụng.',
  );
  expect(
    renderer?.root
      .findAllByType(AppButton)
      .some(button => button.props.title === 'Để sau'),
  ).toBe(false);

  await act(() => renderer?.unmount());
});
