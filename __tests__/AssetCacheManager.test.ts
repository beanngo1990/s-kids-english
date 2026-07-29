import { NativeModules } from 'react-native';

import { remoteAssetsConfig } from '../src/config/remoteAssets';
import { prepareRemoteAssets } from '../src/engine/AssetCacheManager';

jest.mock('../src/config/remoteAssets', () => ({
  getRemoteAssetUrl: jest.fn(),
  remoteAssetsConfig: {
    cacheRemoteAssets: true,
  },
}));

jest.mock('../src/engine/AudioAssetRegistry', () => ({
  resolveBundledAudioUri: jest.fn(),
}));

const mutableRemoteAssetsConfig = remoteAssetsConfig as {
  cacheRemoteAssets: boolean;
};
const validAsset = {
  cacheKey: 'lessons/example/audio/vi/prompt.wav',
  remoteUrl: 'http://127.0.0.1:8787/v1/lessons/example/audio/vi/prompt.wav',
};

beforeEach(() => {
  mutableRemoteAssetsConfig.cacheRemoteAssets = true;
  delete NativeModules.SkidsAssetCache;
});

test('treats valid remote URLs as ready when cache is disabled', async () => {
  mutableRemoteAssetsConfig.cacheRemoteAssets = false;

  await expect(prepareRemoteAssets([validAsset])).resolves.toBe(true);
});

test('rejects empty asset entries even when cache is disabled', async () => {
  mutableRemoteAssetsConfig.cacheRemoteAssets = false;

  await expect(
    prepareRemoteAssets([{ cacheKey: '', remoteUrl: '' }]),
  ).resolves.toBe(false);
});

test('still requires the native cache when caching is enabled', async () => {
  await expect(prepareRemoteAssets([validAsset])).resolves.toBe(false);
});
