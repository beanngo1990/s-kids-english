import {
  getViAudioAsset,
  getWordAudioAssets,
  type RemoteAudioAsset,
} from '../data/audioManifest';
import type { TeacherPromptSegment } from '../i18n/teacherPrompts';
import { DEFAULT_ENGLISH_ACCENT, type EnglishAccent } from '../types/audio';
import type { SceneSoundEffect } from '../types/lesson';
import { resolveRemoteAssetUri } from './AssetCacheManager';
import { getParentSettings } from './ParentSettingsManager';

type SpeechLanguage = EnglishAccent | 'vi-VN';
export type SoundEffect = SceneSoundEffect;

type SpeechOptions = {
  language: SpeechLanguage;
  pitch: number;
  rate: number;
};

export type NarrationSession = {
  isActive: () => boolean;
  ready: Promise<void>;
};

export type NarrationPlaybackResult = 'completed' | 'cancelled' | 'failed';

export type AudioAdapter = {
  playBackgroundMusic?: (uri: string, volume: number) => Promise<void> | void;
  playAudioUri?: (uri: string) => Promise<void> | void;
  speak?: (text: string, options: SpeechOptions) => Promise<void> | void;
  playSound?: (effect: SoundEffect) => Promise<void> | void;
  setBackgroundMusicVolume?: (volume: number) => Promise<void> | void;
  stopBackgroundMusic?: () => Promise<void> | void;
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
let narrationGeneration = 0;
let stopSpeechQueue = Promise.resolve();
let backgroundMusicBaseVolume = 0.16;
let backgroundMusicDuckDepth = 0;
let isBackgroundMusicPlaying = false;

export const DEFAULT_BACKGROUND_MUSIC_VOLUME = 0.16;
const DUCKED_BACKGROUND_MUSIC_VOLUME = 0.035;

export function configureAudioManager(nextAdapter: AudioAdapter | null) {
  narrationGeneration += 1;
  stopSpeechQueue = Promise.resolve();
  backgroundMusicBaseVolume = DEFAULT_BACKGROUND_MUSIC_VOLUME;
  backgroundMusicDuckDepth = 0;
  isBackgroundMusicPlaying = false;
  adapter = nextAdapter;
}

export function startNarrationSession(): NarrationSession {
  const generation = narrationGeneration + 1;
  narrationGeneration = generation;

  return {
    isActive: () => narrationGeneration === generation,
    ready: queueStopSpeech(),
  };
}

export function cancelNarration() {
  narrationGeneration += 1;
  return queueStopSpeech();
}

export async function speakWord(
  word: string,
  accent?: EnglishAccent,
  requestedSession?: NarrationSession,
) {
  await playWordNarration(word, accent, requestedSession);
}

export async function playWordNarration(
  word: string,
  accent?: EnglishAccent,
  requestedSession?: NarrationSession,
): Promise<NarrationPlaybackResult> {
  const session = requestedSession ?? startNarrationSession();
  await session.ready;
  if (!session.isActive()) {
    return 'cancelled';
  }

  const selectedAccent = accent ?? (await getSelectedEnglishAccent());
  if (!session.isActive()) {
    return 'cancelled';
  }

  for (const audioAsset of getWordAudioAssets(word, selectedAccent)) {
    if (!session.isActive()) {
      return 'cancelled';
    }
    const playbackResult = await playAudioAsset(audioAsset, session);
    if (playbackResult === 'completed' || playbackResult === 'cancelled') {
      return playbackResult;
    }
  }

  if (!session.isActive()) {
    return 'cancelled';
  }
  return speakWithResult(
    word,
    {
      language: selectedAccent,
      pitch: 1,
      rate: 0.9,
    },
    session,
  );
}

export async function speakVi(
  text: string,
  requestedSession?: NarrationSession,
) {
  await playVietnameseNarration(text, requestedSession);
}

export async function playVietnameseNarration(
  text: string,
  requestedSession?: NarrationSession,
): Promise<NarrationPlaybackResult> {
  const session = requestedSession ?? startNarrationSession();
  await session.ready;
  if (!session.isActive()) {
    return 'cancelled';
  }

  const audioAsset = getViAudioAsset(text);
  if (audioAsset) {
    const playbackResult = await playAudioAsset(audioAsset, session);
    if (playbackResult === 'completed' || playbackResult === 'cancelled') {
      return playbackResult;
    }
  }

  if (!session.isActive()) {
    return 'cancelled';
  }
  return speakWithResult(
    text,
    {
      language: 'vi-VN',
      pitch: 1,
      rate: 0.9,
    },
    session,
  );
}

export async function speakTeacherPromptSegments(
  segments: TeacherPromptSegment[],
  accent?: EnglishAccent,
  requestedSession?: NarrationSession,
) {
  await playTeacherPromptNarration(segments, accent, requestedSession);
}

export async function playTeacherPromptNarration(
  segments: TeacherPromptSegment[],
  accent?: EnglishAccent,
  requestedSession?: NarrationSession,
): Promise<NarrationPlaybackResult> {
  const session = requestedSession ?? startNarrationSession();
  await session.ready;

  for (const segment of segments) {
    if (!session.isActive()) {
      return 'cancelled';
    }

    const playbackResult =
      segment.language === 'en'
        ? await playWordNarration(segment.text, accent, session)
        : await playVietnameseNarration(segment.text, session);
    if (playbackResult !== 'completed') {
      return playbackResult;
    }
  }

  return session.isActive() ? 'completed' : 'cancelled';
}

async function getSelectedEnglishAccent(): Promise<EnglishAccent> {
  try {
    return (await getParentSettings()).englishAccent;
  } catch {
    return DEFAULT_ENGLISH_ACCENT;
  }
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

export async function playAudioUri(
  uri: string,
  requestedSession?: NarrationSession,
) {
  return playAudioUriWithResult(uri, requestedSession);
}

export async function playBackgroundMusicUri(
  uri: string,
  volume = DEFAULT_BACKGROUND_MUSIC_VOLUME,
) {
  const audioAdapter = adapter;
  if (!audioAdapter?.playBackgroundMusic) {
    isBackgroundMusicPlaying = false;
    return false;
  }

  backgroundMusicBaseVolume = clampVolume(volume);
  try {
    await audioAdapter.playBackgroundMusic(
      uri,
      getCurrentBackgroundMusicVolume(),
    );
    isBackgroundMusicPlaying = true;
    return true;
  } catch {
    isBackgroundMusicPlaying = false;
    return false;
  }
}

export async function stopBackgroundMusic() {
  const audioAdapter = adapter;
  isBackgroundMusicPlaying = false;

  if (!audioAdapter?.stopBackgroundMusic) {
    return false;
  }

  try {
    await audioAdapter.stopBackgroundMusic();
    return true;
  } catch {
    return false;
  }
}

async function playAudioUriWithResult(
  uri: string,
  requestedSession?: NarrationSession,
): Promise<NarrationPlaybackResult> {
  const session = requestedSession ?? startNarrationSession();
  await session.ready;
  if (!session.isActive()) {
    return 'cancelled';
  }

  const audioAdapter = adapter;
  if (!audioAdapter?.playAudioUri) {
    return 'failed';
  }

  try {
    await duckBackgroundMusicWhile(() => audioAdapter.playAudioUri?.(uri));
    return session.isActive() ? 'completed' : 'cancelled';
  } catch {
    return session.isActive() ? 'failed' : 'cancelled';
  }
}

async function speakWithResult(
  text: string,
  options: SpeechOptions,
  session: NarrationSession,
): Promise<NarrationPlaybackResult> {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return session.isActive() ? 'completed' : 'cancelled';
  }

  if (!session.isActive()) {
    return 'cancelled';
  }

  const audioAdapter = adapter;
  try {
    if (audioAdapter?.speak) {
      await duckBackgroundMusicWhile(() =>
        audioAdapter.speak?.(trimmedText, options),
      );
      return session.isActive() ? 'completed' : 'cancelled';
    }

    if (__DEV__) {
      console.warn(
        '[AudioManager] No native AudioAdapter configured for speech. ' +
          'Fallback to Web Speech API (might not work in React Native CLI). ' +
          'Please configure adapter with react-native-tts or expo-speech.',
      );
    }

    const didSpeak = await duckBackgroundMusicWhile(() =>
      speakWithWebSpeech(trimmedText, options),
    );
    if (!session.isActive()) {
      return 'cancelled';
    }
    return didSpeak ? 'completed' : 'failed';
  } catch {
    return session.isActive() ? 'failed' : 'cancelled';
  }
}

async function playAudioAsset(
  asset: RemoteAudioAsset,
  session: NarrationSession,
): Promise<NarrationPlaybackResult> {
  const audioAdapter = adapter;
  if (!audioAdapter?.playAudioUri || !session.isActive()) {
    return session.isActive() ? 'failed' : 'cancelled';
  }

  const audioUri = await resolveRemoteAssetUri(asset.key);
  if (!session.isActive()) {
    return 'cancelled';
  }
  if (!audioUri) {
    return 'failed';
  }

  try {
    await duckBackgroundMusicWhile(() =>
      audioAdapter.playAudioUri?.(audioUri),
    );
    return session.isActive() ? 'completed' : 'cancelled';
  } catch {
    return session.isActive() ? 'failed' : 'cancelled';
  }
}

async function duckBackgroundMusicWhile<T>(
  action: () => Promise<T> | T,
): Promise<T> {
  backgroundMusicDuckDepth += 1;
  await applyBackgroundMusicVolume();

  try {
    return await action();
  } finally {
    backgroundMusicDuckDepth = Math.max(0, backgroundMusicDuckDepth - 1);
    await applyBackgroundMusicVolume();
  }
}

async function applyBackgroundMusicVolume() {
  if (!isBackgroundMusicPlaying || !adapter?.setBackgroundMusicVolume) {
    return;
  }

  try {
    await adapter.setBackgroundMusicVolume(getCurrentBackgroundMusicVolume());
  } catch {
    // Background music should never interrupt lesson audio.
  }
}

function getCurrentBackgroundMusicVolume() {
  return backgroundMusicDuckDepth > 0
    ? Math.min(backgroundMusicBaseVolume, DUCKED_BACKGROUND_MUSIC_VOLUME)
    : backgroundMusicBaseVolume;
}

function clampVolume(volume: number) {
  if (!Number.isFinite(volume)) {
    return DEFAULT_BACKGROUND_MUSIC_VOLUME;
  }

  return Math.min(1, Math.max(0, volume));
}

function queueStopSpeech() {
  const stopRequest = stopSpeechQueue.then(async () => {
    try {
      await adapter?.stopSpeech?.();
    } catch {
      // A newer narration can still proceed when native stop is unavailable.
    }
    try {
      (globalThis as AudioGlobal).speechSynthesis?.cancel();
    } catch {
      // Web speech is only a development fallback.
    }
  });
  stopSpeechQueue = stopRequest.catch(() => undefined);
  return stopRequest;
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
          'Please configure adapter with react-native-sound or expo-av.',
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
    return Promise.resolve(false);
  }

  return new Promise<boolean>(resolve => {
    try {
      const utterance = new SpeechSynthesisUtteranceClass(text);
      utterance.lang = options.language;
      utterance.pitch = options.pitch;
      utterance.rate = options.rate;
      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);

      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    } catch {
      resolve(false);
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
