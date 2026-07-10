import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

import { playAudioUri } from './AudioManager';

type SkidsAudioModule = {
  getVoiceRecordingLevel?: () => Promise<number | null>;
  startVoiceRecording?: () => Promise<string | null>;
  stopVoiceRecording?: () => Promise<string | null>;
  requestRecordPermission?: () => Promise<boolean>;
};

const nativeAudio = NativeModules.SkidsAudio as SkidsAudioModule | undefined;

export function isVoiceRecorderAvailable() {
  return Boolean(
    nativeAudio?.startVoiceRecording && nativeAudio.stopVoiceRecording,
  );
}

export async function requestVoiceRecordingPermission() {
  if (Platform.OS === 'ios' && nativeAudio?.requestRecordPermission) {
    return nativeAudio.requestRecordPermission();
  }

  if (Platform.OS !== 'android') {
    return isVoiceRecorderAvailable();
  }

  const permission = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;
  const alreadyGranted = await PermissionsAndroid.check(permission);

  if (alreadyGranted) {
    return true;
  }

  const result = await PermissionsAndroid.request(permission, {
    buttonNegative: 'Để sau',
    buttonPositive: 'Cho phép',
    message: 'S-Kids English cần micro để bé nghe lại giọng của mình.',
    title: 'Cho bé luyện nói',
  });

  return result === PermissionsAndroid.RESULTS.GRANTED;
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
