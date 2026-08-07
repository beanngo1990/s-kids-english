import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

import { playAudioUri } from './AudioManager';

type VoiceRecordingPermissionCopy = {
  buttonNegative: string;
  buttonPositive: string;
  message: string;
  title: string;
};

export type VoiceRecordingPermissionStatus =
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'unavailable';

type VoiceRecordingPermissionRequestOptions = {
  source: 'automatic' | 'manual';
};

type SkidsAudioModule = {
  getVoiceRecordingLevel?: () => Promise<number | null>;
  startVoiceRecording?: () => Promise<string | null>;
  stopVoiceRecording?: () => Promise<string | null>;
  checkRecordPermission?: () => Promise<boolean>;
  requestRecordPermission?: () => Promise<boolean>;
};

const nativeAudio = NativeModules.SkidsAudio as SkidsAudioModule | undefined;
let lastKnownPermissionStatus: Exclude<
  VoiceRecordingPermissionStatus,
  'unavailable'
> | null = null;

export function isVoiceRecorderAvailable() {
  return Boolean(
    nativeAudio?.startVoiceRecording && nativeAudio.stopVoiceRecording,
  );
}

export async function requestVoiceRecordingPermission(
  copy: VoiceRecordingPermissionCopy,
  options: VoiceRecordingPermissionRequestOptions,
): Promise<VoiceRecordingPermissionStatus> {
  if (!isVoiceRecorderAvailable()) {
    return 'unavailable';
  }

  if (Platform.OS === 'ios') {
    if (
      nativeAudio?.checkRecordPermission &&
      (await nativeAudio.checkRecordPermission())
    ) {
      return rememberPermissionStatus('granted');
    }
    if (
      lastKnownPermissionStatus === 'blocked' ||
      !nativeAudio?.requestRecordPermission
    ) {
      return lastKnownPermissionStatus ?? 'unavailable';
    }

    const isGranted = await nativeAudio.requestRecordPermission();
    return rememberPermissionStatus(isGranted ? 'granted' : 'blocked');
  }

  if (Platform.OS !== 'android') {
    return rememberPermissionStatus('granted');
  }

  const permission = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;
  const alreadyGranted = await PermissionsAndroid.check(permission);

  if (alreadyGranted) {
    return rememberPermissionStatus('granted');
  }

  if (lastKnownPermissionStatus === 'blocked') {
    return 'blocked';
  }

  if (
    options.source === 'automatic' &&
    lastKnownPermissionStatus === 'denied'
  ) {
    return 'denied';
  }

  const result = await PermissionsAndroid.request(permission, copy);

  if (result === PermissionsAndroid.RESULTS.GRANTED) {
    return rememberPermissionStatus('granted');
  }
  if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    return rememberPermissionStatus('blocked');
  }

  return rememberPermissionStatus('denied');
}

export async function checkVoiceRecordingPermission(): Promise<VoiceRecordingPermissionStatus> {
  if (!isVoiceRecorderAvailable()) {
    return 'unavailable';
  }

  if (Platform.OS === 'ios') {
    if (!nativeAudio?.checkRecordPermission) {
      return lastKnownPermissionStatus ?? 'unavailable';
    }

    const isGranted = await nativeAudio.checkRecordPermission();
    return isGranted
      ? rememberPermissionStatus('granted')
      : lastKnownPermissionStatus ?? 'denied';
  }

  if (Platform.OS === 'android') {
    const isGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    );
    return isGranted
      ? rememberPermissionStatus('granted')
      : lastKnownPermissionStatus ?? 'denied';
  }

  return rememberPermissionStatus('granted');
}

export async function startVoiceRecording() {
  if (!nativeAudio?.startVoiceRecording) {
    return null;
  }

  return nativeAudio.startVoiceRecording();
}

export async function stopVoiceRecording() {
  if (!nativeAudio?.stopVoiceRecording) {
    return null;
  }

  return nativeAudio.stopVoiceRecording();
}

export async function getVoiceRecordingLevel() {
  if (!nativeAudio?.getVoiceRecordingLevel) {
    return null;
  }

  return nativeAudio.getVoiceRecordingLevel();
}

export async function playVoiceRecording(recordingUri: string) {
  await playAudioUri(recordingUri);
}

function rememberPermissionStatus(
  status: Exclude<VoiceRecordingPermissionStatus, 'unavailable'>,
) {
  lastKnownPermissionStatus = status;
  return status;
}
