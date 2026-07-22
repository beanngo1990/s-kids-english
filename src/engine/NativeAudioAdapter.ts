import { NativeModules } from 'react-native';

import {
  configureAudioManager,
  type AudioAdapter,
  type SoundEffect,
} from './AudioManager';

type SkidsAudioModule = {
  play?: (effect: SoundEffect) => Promise<boolean>;
  playUri?: (uri: string) => Promise<boolean>;
  stopSpeech?: () => Promise<boolean>;
};

const nativeAudio = NativeModules.SkidsAudio as SkidsAudioModule | undefined;

const nativeAudioAdapter: AudioAdapter = {
  playAudioUri: async uri => {
    const didPlay = await nativeAudio?.playUri?.(uri);
    if (didPlay !== true) {
      throw new Error(`Unable to play audio uri: ${uri}`);
    }
  },
  playSound: async effect => {
    await nativeAudio?.play?.(effect);
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
