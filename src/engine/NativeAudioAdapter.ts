import { NativeModules } from 'react-native';

import {
  configureAudioManager,
  type AudioAdapter,
  type SoundEffect,
} from './AudioManager';
import type {
  NativeVoiceActivityOptions,
  VoiceRecordingStopReason,
} from './VoiceEndpointDetector';

type SkidsAudioModule = {
  checkRecordPermission?: () => Promise<boolean>;
  getVoiceRecordingActivity?: (sessionId: string) => Promise<unknown>;
  getVoiceRecordingLevel?: () => Promise<number | null>;
  play?: (effect: SoundEffect) => Promise<boolean>;
  playBackgroundMusic?: (uri: string, volume: number) => Promise<boolean>;
  playUri?: (uri: string) => Promise<boolean>;
  requestRecordPermission?: () => Promise<boolean>;
  requestTargetWordRecognitionPermission?: () => Promise<boolean>;
  setBackgroundMusicVolume?: (volume: number) => Promise<boolean>;
  startVoiceActivityRecording?: (
    options: NativeVoiceActivityOptions,
  ) => Promise<unknown>;
  startVoiceRecording?: () => Promise<string | null>;
  stopBackgroundMusic?: () => Promise<boolean>;
  stopSpeech?: () => Promise<boolean>;
  stopVoiceActivityRecording?: (
    sessionId: string,
    reason: VoiceRecordingStopReason,
  ) => Promise<unknown>;
  stopVoiceRecording?: () => Promise<string | null>;
};

const nativeAudio = NativeModules.SkidsAudio as SkidsAudioModule | undefined;

const nativeAudioAdapter: AudioAdapter = {
  playBackgroundMusic: async (uri, volume) => {
    const didPlay = await nativeAudio?.playBackgroundMusic?.(uri, volume);
    if (didPlay !== true) {
      throw new Error(`Unable to play background music uri: ${uri}`);
    }
  },
  playAudioUri: async uri => {
    const didPlay = await nativeAudio?.playUri?.(uri);
    if (didPlay !== true) {
      throw new Error(`Unable to play audio uri: ${uri}`);
    }
  },
  playSound: async effect => {
    await nativeAudio?.play?.(effect);
  },
  setBackgroundMusicVolume: async volume => {
    await nativeAudio?.setBackgroundMusicVolume?.(volume);
  },
  stopBackgroundMusic: async () => {
    await nativeAudio?.stopBackgroundMusic?.();
  },
  stopSpeech: async () => {
    await nativeAudio?.stopSpeech?.();
  },
};

export function configureNativeAudioAdapter() {
  if (nativeAudio?.play && nativeAudio.playUri) {
    configureAudioManager(nativeAudioAdapter);
  }
}
