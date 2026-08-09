jest.mock('react-native', () => ({
  NativeModules: {
    SkidsAudio: {
      checkRecordPermission: jest.fn(),
      getVoiceRecordingActivity: jest.fn(),
      getVoiceRecordingLevel: jest.fn(),
      requestRecordPermission: jest.fn(),
      requestTargetWordRecognitionPermission: jest.fn(),
      startVoiceActivityRecording: jest.fn(),
      startVoiceRecording: jest.fn(),
      stopVoiceActivityRecording: jest.fn(),
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

import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

import {
  checkVoiceRecordingPermission,
  getVoiceRecordingActivity,
  requestVoiceRecordingPermission,
  startVoiceRecording,
  stopVoiceRecording,
} from '../src/engine/VoiceRecorder';
import type { VoiceEndpointOptions } from '../src/engine/VoiceEndpointDetector';

const mockedCheckPermission = PermissionsAndroid.check as jest.MockedFunction<
  typeof PermissionsAndroid.check
>;
const mockedRequestPermission =
  PermissionsAndroid.request as jest.MockedFunction<
    typeof PermissionsAndroid.request
  >;
const mockedNativeAudio = NativeModules.SkidsAudio as {
  checkRecordPermission: jest.Mock;
  getVoiceRecordingActivity: jest.Mock;
  getVoiceRecordingLevel: jest.Mock;
  requestRecordPermission: jest.Mock;
  requestTargetWordRecognitionPermission: jest.Mock;
  startVoiceActivityRecording: jest.Mock;
  startVoiceRecording: jest.Mock;
  stopVoiceActivityRecording: jest.Mock;
  stopVoiceRecording: jest.Mock;
};
const permissionCopy = {
  buttonNegative: 'Later',
  buttonPositive: 'Allow',
  message: 'Microphone is needed.',
  title: 'Practice speaking',
};
const endpointOptions: VoiceEndpointOptions = {
  candidateGapMs: 160,
  maxDurationMs: 6700,
  minSpeechMs: 240,
  noSpeechTimeoutMs: 5200,
  silenceAfterSpeechMs: 750,
  targetLocale: 'en-GB',
  targetMatchPostRollMs: 350,
  targetText: 'sun',
};

beforeEach(async () => {
  jest.clearAllMocks();
  (Platform as { OS: string }).OS = 'android';
  mockedCheckPermission.mockResolvedValue(true);
  await checkVoiceRecordingPermission();
  mockedCheckPermission.mockClear();
  mockedCheckPermission.mockResolvedValue(false);
  mockedNativeAudio.checkRecordPermission.mockReset();
  mockedNativeAudio.requestRecordPermission.mockReset();
  mockedNativeAudio.requestTargetWordRecognitionPermission.mockReset();
  mockedNativeAudio.startVoiceActivityRecording.mockReset();
  mockedNativeAudio.getVoiceRecordingActivity.mockReset();
  mockedNativeAudio.stopVoiceActivityRecording.mockReset();
  mockedNativeAudio.startVoiceRecording.mockReset();
  mockedNativeAudio.stopVoiceRecording.mockReset();
});

test('prepares optional iOS target recognition for an existing microphone grant', async () => {
  (Platform as { OS: string }).OS = 'ios';
  mockedNativeAudio.checkRecordPermission.mockResolvedValue(true);
  mockedNativeAudio.requestTargetWordRecognitionPermission.mockRejectedValue(
    new Error('Speech permission unavailable'),
  );

  await expect(
    requestVoiceRecordingPermission(permissionCopy, { source: 'automatic' }),
  ).resolves.toBe('granted');

  expect(
    mockedNativeAudio.requestTargetWordRecognitionPermission,
  ).toHaveBeenCalledTimes(1);
  expect(mockedNativeAudio.requestRecordPermission).not.toHaveBeenCalled();
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

test('normalizes an enhanced native voice activity session and final snapshot', async () => {
  mockedNativeAudio.startVoiceActivityRecording.mockResolvedValue({
    detector: 'nativeVad',
    sessionId: 'native-session',
    uri: 'file://native-recording.m4a',
  });
  const nativeSnapshot = {
    detector: 'nativeVoiceActivity',
    elapsedMs: 1200,
    hadSpeech: true,
    phase: 'ended',
    sequence: 7,
    sessionId: 'native-session',
    shouldStop: true,
    speechDurationMs: 430,
    stopReason: 'targetWordMatch',
    targetMatchConfidence: 0.91,
    targetMatchState: 'matched',
    trailingSilenceMs: 750,
  };
  mockedNativeAudio.getVoiceRecordingActivity
    .mockResolvedValueOnce({ ...nativeSnapshot, sessionId: 'stale-session' })
    .mockResolvedValue(nativeSnapshot);
  mockedNativeAudio.stopVoiceActivityRecording.mockResolvedValue({
    finalSnapshot: nativeSnapshot,
    uri: 'file://native-recording.m4a',
  });

  const session = await startVoiceRecording(endpointOptions);
  expect(session).toEqual({
    detector: 'nativeVoiceActivity',
    sessionId: 'native-session',
    uri: 'file://native-recording.m4a',
  });
  if (!session) {
    throw new Error('Expected an enhanced recording session');
  }

  await expect(getVoiceRecordingActivity(session)).resolves.toBeNull();
  await expect(getVoiceRecordingActivity(session)).resolves.toEqual({
    ...nativeSnapshot,
    detector: 'nativeVoiceActivity',
  });
  await expect(stopVoiceRecording(session, 'targetWordMatch')).resolves.toEqual({
    finalSnapshot: { ...nativeSnapshot, detector: 'nativeVoiceActivity' },
    stopReason: 'targetWordMatch',
    uri: 'file://native-recording.m4a',
  });
  expect(mockedNativeAudio.startVoiceActivityRecording).toHaveBeenCalledWith(
    {
      maxDurationMs: endpointOptions.maxDurationMs,
      minSpeechMs: endpointOptions.minSpeechMs,
      noSpeechTimeoutMs: endpointOptions.noSpeechTimeoutMs,
      silenceAfterSpeechMs: endpointOptions.silenceAfterSpeechMs,
      targetLocale: endpointOptions.targetLocale,
      targetMatchPostRollMs: endpointOptions.targetMatchPostRollMs,
      targetText: endpointOptions.targetText,
    },
  );
  expect(mockedNativeAudio.stopVoiceActivityRecording).toHaveBeenCalledWith(
    'native-session',
    'targetWordMatch',
  );
});

test('falls back to legacy recording payloads when enhanced start is invalid', async () => {
  mockedNativeAudio.startVoiceActivityRecording.mockResolvedValue(null);
  mockedNativeAudio.startVoiceRecording.mockResolvedValue(
    'file://legacy-recording.m4a',
  );
  mockedNativeAudio.stopVoiceRecording.mockResolvedValue(
    'file://legacy-recording-final.m4a',
  );

  const session = await startVoiceRecording(endpointOptions);
  expect(session).toEqual({
    detector: 'levelFallback',
    sessionId: expect.stringMatching(/^level-fallback-/),
    uri: 'file://legacy-recording.m4a',
  });
  if (!session) {
    throw new Error('Expected a fallback recording session');
  }

  await expect(getVoiceRecordingActivity(session)).resolves.toBeNull();
  await expect(stopVoiceRecording(session, 'manual')).resolves.toEqual({
    finalSnapshot: null,
    stopReason: 'manual',
    uri: 'file://legacy-recording-final.m4a',
  });
  expect(mockedNativeAudio.stopVoiceActivityRecording).not.toHaveBeenCalled();
});

test('does not expose an unfinished legacy file when native stop fails', async () => {
  mockedNativeAudio.startVoiceActivityRecording.mockResolvedValue(null);
  mockedNativeAudio.startVoiceRecording.mockResolvedValue(
    'file://unfinished-recording.m4a',
  );
  mockedNativeAudio.stopVoiceRecording.mockResolvedValue(null);

  const session = await startVoiceRecording(endpointOptions);
  if (!session) {
    throw new Error('Expected a fallback recording session');
  }

  await expect(stopVoiceRecording(session, 'manual')).resolves.toEqual({
    finalSnapshot: null,
    stopReason: 'error',
    uri: null,
  });
});

test('does not expose the start URI when enhanced stop returns an empty URI', async () => {
  mockedNativeAudio.startVoiceActivityRecording.mockResolvedValue({
    detector: 'nativeVoiceActivity',
    sessionId: 'native-empty-stop-session',
    uri: 'file://unfinished-native-recording.caf',
  });
  mockedNativeAudio.stopVoiceActivityRecording.mockResolvedValue('');

  const session = await startVoiceRecording(endpointOptions);
  if (!session) {
    throw new Error('Expected an enhanced recording session');
  }

  await expect(stopVoiceRecording(session, 'manual')).resolves.toEqual({
    finalSnapshot: null,
    stopReason: 'error',
    uri: null,
  });
});

test('does not call the global legacy stop after a structured session error', async () => {
  mockedNativeAudio.startVoiceActivityRecording.mockResolvedValue({
    detector: 'nativeVoiceActivity',
    sessionId: 'stale-native-session',
    uri: 'file://stale-native-recording.caf',
  });
  mockedNativeAudio.stopVoiceActivityRecording.mockResolvedValue({
    finalSnapshot: null,
    stopReason: 'error',
    uri: null,
  });

  const session = await startVoiceRecording(endpointOptions);
  if (!session) {
    throw new Error('Expected an enhanced recording session');
  }

  await expect(stopVoiceRecording(session, 'interrupted')).resolves.toEqual({
    finalSnapshot: null,
    stopReason: 'error',
    uri: null,
  });
  expect(mockedNativeAudio.stopVoiceRecording).not.toHaveBeenCalled();
});
