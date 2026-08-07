jest.mock('react-native', () => ({
  NativeModules: {
    SkidsAudio: {
      startVoiceRecording: jest.fn(),
      stopVoiceRecording: jest.fn(),
    },
  },
  PermissionsAndroid: {
    PERMISSIONS: {
      RECORD_AUDIO: 'android.permission.RECORD_AUDIO',
    },
    RESULTS: {
      DENIED: 'denied',
      GRANTED: 'granted',
      NEVER_ASK_AGAIN: 'never_ask_again',
    },
    check: jest.fn(),
    request: jest.fn(),
  },
  Platform: {
    OS: 'android',
  },
}));

jest.mock('../src/engine/AudioManager', () => ({
  playAudioUri: jest.fn(() => Promise.resolve()),
}));

import { PermissionsAndroid } from 'react-native';

import {
  checkVoiceRecordingPermission,
  requestVoiceRecordingPermission,
} from '../src/engine/VoiceRecorder';

const mockedCheckPermission =
  PermissionsAndroid.check as jest.MockedFunction<
    typeof PermissionsAndroid.check
  >;
const mockedRequestPermission =
  PermissionsAndroid.request as jest.MockedFunction<
    typeof PermissionsAndroid.request
  >;
const permissionCopy = {
  buttonNegative: 'Later',
  buttonPositive: 'Allow',
  message: 'Microphone is needed.',
  title: 'Practice speaking',
};

beforeEach(async () => {
  jest.clearAllMocks();
  mockedCheckPermission.mockResolvedValue(true);
  await checkVoiceRecordingPermission();
  mockedCheckPermission.mockClear();
  mockedCheckPermission.mockResolvedValue(false);
});

test('suppresses repeated automatic permission prompts after a denial', async () => {
  mockedRequestPermission.mockResolvedValue(PermissionsAndroid.RESULTS.DENIED);

  await expect(
    requestVoiceRecordingPermission(permissionCopy, { source: 'automatic' }),
  ).resolves.toBe('denied');
  await expect(
    requestVoiceRecordingPermission(permissionCopy, { source: 'automatic' }),
  ).resolves.toBe('denied');

  expect(mockedRequestPermission).toHaveBeenCalledTimes(1);
});

test('allows a manual retry after a simple denial', async () => {
  mockedRequestPermission
    .mockResolvedValueOnce(PermissionsAndroid.RESULTS.DENIED)
    .mockResolvedValueOnce(PermissionsAndroid.RESULTS.GRANTED);

  await expect(
    requestVoiceRecordingPermission(permissionCopy, { source: 'automatic' }),
  ).resolves.toBe('denied');
  await expect(
    requestVoiceRecordingPermission(permissionCopy, { source: 'manual' }),
  ).resolves.toBe('granted');

  expect(mockedRequestPermission).toHaveBeenCalledTimes(2);
});

test('maps never-ask-again to blocked and avoids another system request', async () => {
  mockedRequestPermission.mockResolvedValue(
    PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
  );

  await expect(
    requestVoiceRecordingPermission(permissionCopy, { source: 'automatic' }),
  ).resolves.toBe('blocked');
  await expect(
    requestVoiceRecordingPermission(permissionCopy, { source: 'manual' }),
  ).resolves.toBe('blocked');

  expect(mockedRequestPermission).toHaveBeenCalledTimes(1);
});

test('refreshes a blocked session after permission is granted in Settings', async () => {
  mockedRequestPermission.mockResolvedValue(
    PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
  );
  await requestVoiceRecordingPermission(permissionCopy, {
    source: 'automatic',
  });
  mockedCheckPermission.mockResolvedValue(true);

  await expect(checkVoiceRecordingPermission()).resolves.toBe('granted');
});
