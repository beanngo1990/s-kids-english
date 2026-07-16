import { configureAudioManager, speakWord } from '../src/engine/AudioManager';
import { getWordAudioAssets } from '../src/data/audioManifest';
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
