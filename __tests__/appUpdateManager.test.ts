import AsyncStorage from '@react-native-async-storage/async-storage';

let mockAppStateListener: ((state: 'active' | 'background') => void) | null =
  null;
let rawPolicy = '';

const mockRemoveAppStateListener = jest.fn();
const mockRemoteConfigInstance = {
  getValue: jest.fn(() => ({ asString: () => rawPolicy })),
};
const mockRefreshRemoteConfig = jest.fn(() =>
  Promise.resolve(mockRemoteConfigInstance),
);
const mockStartRemoteConfig = jest.fn(() =>
  Promise.resolve(mockRemoteConfigInstance),
);
const mockUnsubscribeRemoteConfig = jest.fn();

jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(
      (
        _event: string,
        listener: (state: 'active' | 'background') => void,
      ) => {
        mockAppStateListener = listener;
        return { remove: mockRemoveAppStateListener };
      },
    ),
    currentState: 'active',
  },
  Platform: { OS: 'ios' },
}));

jest.mock('../src/engine/AppInfo', () => ({
  getAppVersion: jest.fn(() => Promise.resolve('1.0.1')),
}));

jest.mock('../src/services/RemoteConfigService', () => ({
  refreshRemoteConfig: () => mockRefreshRemoteConfig(),
  startRemoteConfig: () => mockStartRemoteConfig(),
  subscribeRemoteConfigUpdates: jest.fn(() => mockUnsubscribeRemoteConfig),
}));

import {
  dismissOptionalAppUpdate,
  getAppUpdateSnapshot,
  startAppUpdateManager,
} from '../src/engine/AppUpdateManager';

test('checks on startup and foreground, snoozes optional prompts, and fails open', async () => {
  await AsyncStorage.clear();
  rawPolicy = createPolicy({
    latestVersion: '1.1',
    minimumSupportedVersion: '1.0',
  });

  const stopManager = startAppUpdateManager();
  await flushAsyncWork();

  expect(getAppUpdateSnapshot()).toMatchObject({
    currentVersion: '1.0.1',
    isReady: true,
    latestVersion: '1.1',
    status: 'optional',
  });

  await dismissOptionalAppUpdate();
  expect(getAppUpdateSnapshot().status).toBe('none');

  mockAppStateListener?.('active');
  await flushAsyncWork();
  expect(getAppUpdateSnapshot().status).toBe('none');

  rawPolicy = createPolicy({
    latestVersion: '2.0',
    minimumSupportedVersion: '2.0',
  });
  mockAppStateListener?.('active');
  await flushAsyncWork();
  expect(getAppUpdateSnapshot()).toMatchObject({
    minimumSupportedVersion: '2.0',
    status: 'required',
  });

  mockRefreshRemoteConfig.mockRejectedValueOnce(new Error('offline'));
  mockAppStateListener?.('active');
  await flushAsyncWork();
  expect(getAppUpdateSnapshot()).toMatchObject({
    errorCode: 'fetchFailed',
    status: 'none',
  });

  stopManager();
  expect(mockRemoveAppStateListener).toHaveBeenCalledTimes(1);
  expect(mockUnsubscribeRemoteConfig).toHaveBeenCalledTimes(1);
});

function createPolicy({
  latestVersion,
  minimumSupportedVersion,
}: {
  latestVersion: string;
  minimumSupportedVersion: string;
}) {
  return JSON.stringify({
    enabled: true,
    latestVersion,
    minimumSupportedVersion,
    schemaVersion: 1,
    storeUrls: {
      ios: 'https://apps.apple.com/app/id123456789',
    },
  });
}

async function flushAsyncWork() {
  for (let index = 0; index < 6; index += 1) {
    await Promise.resolve();
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}

