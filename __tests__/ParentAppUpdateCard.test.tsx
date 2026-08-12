import React from 'react';
import { Linking } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';

let mockStatus: 'none' | 'optional' | 'required' = 'optional';

const mockDismissOptionalAppUpdate = jest.fn(() => Promise.resolve());

jest.mock('../src/engine/AppUpdateManager', () => ({
  dismissOptionalAppUpdate: () => mockDismissOptionalAppUpdate(),
  useAppUpdateSnapshot: () => ({
    currentVersion: '1.0',
    isReady: true,
    latestVersion: '1.1',
    minimumSupportedVersion: '1.0',
    status: mockStatus,
    storeUrl: 'https://apps.apple.com/app/id123456789',
  }),
}));

const mockSetParentExternalFlowActive = jest.fn();

jest.mock('../src/engine/ParentAccessSession', () => ({
  setParentExternalFlowActive: (isActive: boolean) =>
    mockSetParentExternalFlowActive(isActive),
}));

import { AppButton } from '../src/components/AppButton';
import { ParentAppUpdateCard } from '../src/components/ParentAppUpdateCard';

beforeEach(() => {
  mockStatus = 'optional';
  jest.clearAllMocks();
});

test('lets a parent postpone an optional update from Parent Mode', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await act(() => {
    renderer = ReactTestRenderer.create(<ParentAppUpdateCard />);
  });

  const laterButton = renderer?.root.findByProps({ title: 'Để sau' });
  await act(() => laterButton?.props.onPress());

  expect(mockDismissOptionalAppUpdate).toHaveBeenCalledTimes(1);

  await act(() => renderer?.unmount());
});

test('opens the store directly because Parent Mode is already unlocked', async () => {
  const openUrl = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await act(() => {
    renderer = ReactTestRenderer.create(<ParentAppUpdateCard />);
  });

  const updateButton = renderer?.root.findByProps({ title: 'Cập nhật ngay' });
  await act(() => updateButton?.props.onPress());

  expect(openUrl).toHaveBeenCalledWith(
    'https://apps.apple.com/app/id123456789',
  );
  expect(mockSetParentExternalFlowActive.mock.calls).toEqual([[true], [false]]);

  openUrl.mockRestore();
  await act(() => renderer?.unmount());
});

test('stays hidden when there is no optional update', async () => {
  mockStatus = 'required';
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await act(() => {
    renderer = ReactTestRenderer.create(<ParentAppUpdateCard />);
  });

  expect(renderer?.root.findAllByType(AppButton)).toHaveLength(0);

  await act(() => renderer?.unmount());
});
