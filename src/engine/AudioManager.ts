import {
  getViAudioAsset,
  getWordAudioAsset,
  type RemoteAudioAsset,
} from '../data/audioManifest';
import type { SceneSoundEffect } from '../types/lesson';
import { resolveRemoteAssetUri } from './AssetCacheManager';

type SpeechLanguage = 'en-US' | 'vi-VN';
export type SoundEffect = SceneSoundEffect;

type SpeechOptions = {
  language: SpeechLanguage;
  pitch: number;
  rate: number;
};

export type AudioAdapter = {
  playAudioUri?: (uri: string) => Promise<void> | void;
  speak?: (text: string, options: SpeechOptions) => Promise<void> | void;
  playSound?: (effect: SoundEffect) => Promise<void> | void;
  stopSpeech?: () => Promise<void> | void;
};

type WebSpeechSynthesis = {
  cancel: () => void;
  speak: (utterance: WebSpeechUtterance) => void;
};

type WebSpeechUtterance = {
  lang: string;
  onend?: () => void;
  onerror?: () => void;
  pitch: number;
  rate: number;
  text: string;
};

type WebAudioOscillator = {
  connect: (node: WebAudioGainNode) => void;
  frequency: {
    setValueAtTime: (value: number, time: number) => void;
  };
  start: (time?: number) => void;
  stop: (time?: number) => void;
  type: 'sine';
};

type WebAudioGainNode = {
  connect: (destination: unknown) => void;
  gain: {
    exponentialRampToValueAtTime: (value: number, time: number) => void;
    setValueAtTime: (value: number, time: number) => void;
  };
};

type WebAudioContext = {
  close?: () => Promise<void>;
  createGain: () => WebAudioGainNode;
  createOscillator: () => WebAudioOscillator;
  currentTime: number;
  destination: unknown;
};

type AudioGlobal = typeof globalThis & {
  AudioContext?: new () => WebAudioContext;
  SpeechSynthesisUtterance?: new (text: string) => WebSpeechUtterance;
  speechSynthesis?: WebSpeechSynthesis;
  webkitAudioContext?: new () => WebAudioContext;
};

let adapter: AudioAdapter | null = null;

export function configureAudioManager(nextAdapter: AudioAdapter | null) {
  adapter = nextAdapter;
}

export async function speakWord(word: string) {
  const audioAsset = getWordAudioAsset(word);
  if (audioAsset && (await playAudioAsset(audioAsset))) {
    return;
  }

  await speak(word, {
    language: 'en-US',
    pitch: 1.05,
    rate: 0.82,
  });
}

export async function speakVi(text: string) {
  const audioAsset = getViAudioAsset(text);
  if (audioAsset && (await playAudioAsset(audioAsset))) {
    return;
  }

  await speak(text, {
    language: 'vi-VN',
    pitch: 1,
    rate: 0.9,
  });
}

export async function playCorrectSound() {
  await playSound('correct');
}

export async function playWrongSound() {
  await playSound('wrong');
}

export async function playTapSound() {
  await playSound('tap');
}

export async function playCompleteSound() {
  await playSoundEffect('complete');
}

export async function playSoundEffect(effect: SoundEffect) {
  await playSound(effect);
}

export async function playAudioUri(uri: string) {
  await safely(async () => {
    if (!adapter?.playAudioUri) {
      return;
    }

    await adapter.playAudioUri(uri);
  });
}

async function speak(text: string, options: SpeechOptions) {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return;
  }

  await safely(async () => {
    if (adapter?.speak) {
      await adapter.speak(trimmedText, options);
      return;
    }

    if (__DEV__) {
      console.warn(
        '[AudioManager] No native AudioAdapter configured for speech. ' +
          'Fallback to Web Speech API (might not work in React Native CLI). ' +
          'Please configure adapter with react-native-tts or expo-speech.'
      );
    }

    await speakWithWebSpeech(trimmedText, options);
  });
}

async function playAudioAsset(asset: RemoteAudioAsset) {
  const audioAdapter = adapter;
  if (!audioAdapter?.playAudioUri) {
    return false;
  }

  const audioUri = await resolveRemoteAssetUri(asset.key);
  if (!audioUri) {
    return false;
  }

  try {
    await audioAdapter.playAudioUri(audioUri);
    return true;
  } catch {
    return false;
  }
}

async function playSound(effect: SoundEffect) {
  await safely(async () => {
    if (adapter?.playSound) {
      await adapter.playSound(effect);
      return;
    }

    if (__DEV__) {
      console.warn(
        '[AudioManager] No native AudioAdapter configured for sound effects. ' +
          'Fallback to Web Audio API (might not work in React Native CLI). ' +
          'Please configure adapter with react-native-sound or expo-av.'
      );
    }

    await playWebTone(effect);
  });
}

async function safely(action: () => Promise<void> | void) {
  try {
    await action();
  } catch {
    // Audio is best-effort. The lesson flow must keep working without it.
  }
}

function speakWithWebSpeech(text: string, options: SpeechOptions) {
  const audioGlobal = globalThis as AudioGlobal;
  const SpeechSynthesisUtteranceClass = audioGlobal.SpeechSynthesisUtterance;
  const speechSynthesis = audioGlobal.speechSynthesis;

  if (!speechSynthesis || !SpeechSynthesisUtteranceClass) {
    return Promise.resolve();
  }

  return new Promise<void>(resolve => {
    try {
      const utterance = new SpeechSynthesisUtteranceClass(text);
      utterance.lang = options.language;
      utterance.pitch = options.pitch;
      utterance.rate = options.rate;
      utterance.onend = resolve;
      utterance.onerror = resolve;

      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    } catch {
      resolve();
    }
  });
}

function playWebTone(effect: SoundEffect) {
  const audioGlobal = globalThis as AudioGlobal;
  const AudioContextClass =
    audioGlobal.AudioContext ?? audioGlobal.webkitAudioContext;

  if (!AudioContextClass) {
    return Promise.resolve();
  }

  return new Promise<void>(resolve => {
    try {
      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(getToneFrequency(effect), now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(getToneVolume(effect), now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.2);

      setTimeout(() => {
        context.close?.().catch(() => undefined);
        resolve();
      }, 220);
    } catch {
      resolve();
    }
  });
}

function getToneFrequency(effect: SoundEffect) {
  switch (effect) {
    case 'correct':
      return 660;
    case 'complete':
      return 784;
    case 'clap':
      return 520;
    case 'ding':
      return 880;
    case 'wrong':
      return 220;
    case 'yay':
      return 740;
    case 'tap':
      return 420;
    default:
      return 420;
  }
}

function getToneVolume(effect: SoundEffect) {
  return effect === 'wrong' ? 0.035 : 0.06;
}
