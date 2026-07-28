import {
  cancelNarration,
  configureAudioManager,
  playBackgroundMusicUri,
  playTeacherPromptNarration,
  playVietnameseNarration,
  playWordNarration,
  speakWord,
  startNarrationSession,
} from '../src/engine/AudioManager';
import {
  getViAudioAsset,
  getWordAudioAssets,
} from '../src/data/audioManifest';
import { resolveRemoteAssetUri } from '../src/engine/AssetCacheManager';
import {
  defaultParentSettings,
  getParentSettings,
} from '../src/engine/ParentSettingsManager';

jest.mock('../src/data/audioManifest', () => ({
  getViAudioAsset: jest.fn(),
  getWordAudioAsset: jest.fn(),
  getWordAudioAssets: jest.fn(),
}));

jest.mock('../src/engine/AssetCacheManager', () => ({
  resolveRemoteAssetUri: jest.fn(),
}));

jest.mock('../src/engine/ParentSettingsManager', () => ({
  ...jest.requireActual('../src/engine/ParentSettingsManager'),
  getParentSettings: jest.fn(),
}));

const enUsWaterKey =
  'lessons/morning-routine/bathroom/audio/en-US/neural2-c-r1/water.wav';
const enGbWaterKey =
  'lessons/morning-routine/bathroom/audio/en-GB/neural2-c-r1/water.wav';
const legacyWaterKey = 'lessons/morning-routine/bathroom/audio/en/water.wav';

const mockedGetParentSettings = getParentSettings as jest.MockedFunction<
  typeof getParentSettings
>;
const mockedGetWordAudioAssets = getWordAudioAssets as jest.MockedFunction<
  typeof getWordAudioAssets
>;
const mockedGetViAudioAsset = getViAudioAsset as jest.MockedFunction<
  typeof getViAudioAsset
>;
const mockedResolveRemoteAssetUri =
  resolveRemoteAssetUri as jest.MockedFunction<typeof resolveRemoteAssetUri>;
const actualAudioManifest = jest.requireActual<
  typeof import('../src/data/audioManifest')
>('../src/data/audioManifest');

const playAudioUri = jest.fn((_uri: string) => Promise.resolve());

beforeEach(() => {
  jest.clearAllMocks();
  configureAudioManager({ playAudioUri });
});

afterEach(() => {
  configureAudioManager(null);
});

test('looks up the production versioned key for each English accent', () => {
  expect(actualAudioManifest.getWordAudioAsset('water')?.key).toBe(
    enUsWaterKey,
  );
  expect(actualAudioManifest.getWordAudioAsset('water', 'en-GB')?.key).toBe(
    enGbWaterKey,
  );
  expect(
    actualAudioManifest
      .getWordAudioAssets('water', 'en-GB')
      .map(asset => asset.key),
  ).toEqual([enGbWaterKey, enUsWaterKey, legacyWaterKey]);
});

test('uses the versioned en-US asset key by default', async () => {
  mockedGetParentSettings.mockResolvedValue(defaultParentSettings);
  mockedGetWordAudioAssets.mockReturnValue([
    {
      key: enUsWaterKey,
      text: 'water',
    },
  ]);
  mockedResolveRemoteAssetUri.mockResolvedValue(
    'file:///cache/en-US-water.wav',
  );

  await speakWord('water');

  expect(mockedGetWordAudioAssets).toHaveBeenCalledWith('water', 'en-US');
  expect(mockedResolveRemoteAssetUri).toHaveBeenCalledWith(enUsWaterKey);
  expect(playAudioUri).toHaveBeenCalledWith('file:///cache/en-US-water.wav');
});

test('ducks background music while required narration audio plays', async () => {
  const playBackgroundMusic = jest.fn(() => Promise.resolve());
  const setBackgroundMusicVolume = jest.fn(() => Promise.resolve());
  configureAudioManager({
    playAudioUri,
    playBackgroundMusic,
    setBackgroundMusicVolume,
    stopBackgroundMusic: jest.fn(),
  });
  mockedGetWordAudioAssets.mockReturnValue([
    {
      key: enUsWaterKey,
      text: 'water',
    },
  ]);
  mockedResolveRemoteAssetUri.mockResolvedValue(
    'file:///cache/en-US-water.wav',
  );

  await expect(
    playBackgroundMusicUri('file:///app/sungy-background.mp3', 0.16),
  ).resolves.toBe(true);

  let finishPlayback: (() => void) | undefined;
  let markPlaybackStarted: (() => void) | undefined;
  const playbackStarted = new Promise<void>(resolve => {
    markPlaybackStarted = resolve;
  });
  playAudioUri.mockImplementationOnce(
    () =>
      new Promise<void>(resolve => {
        finishPlayback = resolve;
        markPlaybackStarted?.();
      }),
  );

  const playback = speakWord('water', 'en-US');
  await playbackStarted;

  expect(setBackgroundMusicVolume).toHaveBeenCalledWith(0.035);

  finishPlayback?.();
  await playback;

  expect(setBackgroundMusicVolume).toHaveBeenLastCalledWith(0.16);
});

test('uses the versioned en-GB asset key from parent settings', async () => {
  mockedGetParentSettings.mockResolvedValue({
    ...defaultParentSettings,
    englishAccent: 'en-GB',
  });
  mockedGetWordAudioAssets.mockReturnValue([
    {
      key: enGbWaterKey,
      text: 'water',
    },
  ]);
  mockedResolveRemoteAssetUri.mockResolvedValue(
    'file:///cache/en-GB-water.wav',
  );

  await speakWord('water');

  expect(mockedGetWordAudioAssets).toHaveBeenCalledWith('water', 'en-GB');
  expect(mockedResolveRemoteAssetUri).toHaveBeenCalledWith(enGbWaterKey);
  expect(playAudioUri).toHaveBeenCalledWith('file:///cache/en-GB-water.wav');
});

test('falls back from the selected accent to en-US and legacy assets', async () => {
  mockedGetParentSettings.mockResolvedValue({
    ...defaultParentSettings,
    englishAccent: 'en-GB',
  });
  mockedGetWordAudioAssets.mockReturnValue([
    { key: enGbWaterKey, text: 'water' },
    { key: enUsWaterKey, text: 'water' },
    { key: legacyWaterKey, text: 'water' },
  ]);
  mockedResolveRemoteAssetUri.mockImplementation(key =>
    Promise.resolve(`file:///cache/${key}`),
  );
  playAudioUri
    .mockRejectedValueOnce(new Error('en-GB unavailable'))
    .mockRejectedValueOnce(new Error('en-US unavailable'))
    .mockResolvedValueOnce();

  await speakWord('water');

  expect(playAudioUri.mock.calls.map(([uri]) => uri)).toEqual([
    `file:///cache/${enGbWaterKey}`,
    `file:///cache/${enUsWaterKey}`,
    `file:///cache/${legacyWaterKey}`,
  ]);
});

test('does not retry fallback assets after narration is cancelled', async () => {
  mockedGetWordAudioAssets.mockReturnValue([
    { key: enGbWaterKey, text: 'water' },
    { key: enUsWaterKey, text: 'water' },
    { key: legacyWaterKey, text: 'water' },
  ]);
  mockedResolveRemoteAssetUri.mockImplementation(key =>
    Promise.resolve(`file:///cache/${key}`),
  );

  let rejectPlayback: ((reason?: unknown) => void) | undefined;
  let markPlaybackStarted: (() => void) | undefined;
  const playbackStarted = new Promise<void>(resolve => {
    markPlaybackStarted = resolve;
  });
  playAudioUri.mockImplementationOnce(
    () =>
      new Promise<void>((_, reject) => {
        rejectPlayback = reject;
        markPlaybackStarted?.();
      }),
  );

  const narrationSession = startNarrationSession();
  const playback = speakWord('water', 'en-GB', narrationSession);
  await playbackStarted;
  await cancelNarration();
  rejectPlayback?.(new Error('interrupted by newer narration'));
  await playback;

  expect(playAudioUri).toHaveBeenCalledTimes(1);
  expect(playAudioUri).toHaveBeenCalledWith(`file:///cache/${enGbWaterKey}`);
});

test('reports failure when native candidates fail and no speech fallback exists', async () => {
  const consoleWarning = jest
    .spyOn(console, 'warn')
    .mockImplementation(() => undefined);
  mockedGetWordAudioAssets.mockReturnValue([
    { key: enUsWaterKey, text: 'water' },
  ]);
  mockedResolveRemoteAssetUri.mockResolvedValue(
    'file:///cache/en-US-water.wav',
  );
  playAudioUri.mockRejectedValueOnce(new Error('decoder failed'));

  await expect(playWordNarration('water', 'en-US')).resolves.toBe('failed');
  consoleWarning.mockRestore();
});

test('reports failure when Vietnamese native playback fails', async () => {
  const viKey = 'lessons/test/audio/vi/feedback.wav';
  const consoleWarning = jest
    .spyOn(console, 'warn')
    .mockImplementation(() => undefined);
  mockedGetViAudioAsset.mockReturnValue({
    key: viKey,
    text: 'Bút chì đã ở trên bàn.',
  });
  mockedResolveRemoteAssetUri.mockResolvedValue(
    'file:///cache/vi-feedback.wav',
  );
  playAudioUri.mockRejectedValueOnce(new Error('decoder failed'));

  await expect(
    playVietnameseNarration('Bút chì đã ở trên bàn.'),
  ).resolves.toBe('failed');
  consoleWarning.mockRestore();
});

test('cancels a bilingual sequence before its stale English segment starts', async () => {
  const viKey = 'lessons/test/audio/vi/feedback.wav';
  mockedGetViAudioAsset.mockReturnValue({
    key: viKey,
    text: 'Tốt lắm.',
  });
  mockedGetWordAudioAssets.mockReturnValue([
    { key: enUsWaterKey, text: 'Great job!' },
  ]);
  mockedResolveRemoteAssetUri.mockImplementation(key =>
    Promise.resolve(`file:///cache/${key}`),
  );

  let rejectVietnamesePlayback: ((reason?: unknown) => void) | undefined;
  let markVietnamesePlaybackStarted: (() => void) | undefined;
  const vietnamesePlaybackStarted = new Promise<void>(resolve => {
    markVietnamesePlaybackStarted = resolve;
  });
  playAudioUri.mockImplementationOnce(
    () =>
      new Promise<void>((_, reject) => {
        rejectVietnamesePlayback = reject;
        markVietnamesePlaybackStarted?.();
      }),
  );

  const narrationSession = startNarrationSession();
  const playback = playTeacherPromptNarration(
    [
      { language: 'vi', text: 'Tốt lắm.' },
      { language: 'en', text: 'Great job!' },
    ],
    'en-US',
    narrationSession,
  );
  await vietnamesePlaybackStarted;
  await cancelNarration();
  rejectVietnamesePlayback?.(new Error('interrupted by newer narration'));

  await expect(playback).resolves.toBe('cancelled');
  expect(mockedGetWordAudioAssets).not.toHaveBeenCalled();
  expect(playAudioUri).toHaveBeenCalledTimes(1);
});
