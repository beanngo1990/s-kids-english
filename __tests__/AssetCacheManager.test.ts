import { NativeModules } from 'react-native';

import { remoteAssetsConfig } from '../src/config/remoteAssets';
import {
  prefetchRemoteAssets,
  prepareRemoteAssets,
} from '../src/engine/AssetCacheManager';

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

test('retries a transient foreground cache failure', async () => {
  const getCachedAssetUrl = jest
    .fn()
    .mockRejectedValueOnce(new Error('temporary network failure'))
    .mockResolvedValueOnce('file:///cached/prompt.wav');
  NativeModules.SkidsAssetCache = { getCachedAssetUrl };

  await expect(prepareRemoteAssets([validAsset])).resolves.toBe(true);
  expect(getCachedAssetUrl).toHaveBeenCalledTimes(2);
});

test('shares an in-flight foreground preparation for the same asset', async () => {
  let finishPreparation: ((uri: string) => void) | undefined;
  const getCachedAssetUrl = jest.fn(
    () =>
      new Promise<string>(resolve => {
        finishPreparation = resolve;
      }),
  );
  NativeModules.SkidsAssetCache = { getCachedAssetUrl };

  const firstPreparation = prepareRemoteAssets([validAsset]);
  const secondPreparation = prepareRemoteAssets([validAsset]);
  await Promise.resolve();

  expect(getCachedAssetUrl).toHaveBeenCalledTimes(1);
  finishPreparation?.('file:///cached/prompt.wav');
  await expect(
    Promise.all([firstPreparation, secondPreparation]),
  ).resolves.toEqual([true, true]);
});

test('splits background prefetch into small native batches', async () => {
  const prefetchAssets = jest.fn().mockResolvedValue(true);
  NativeModules.SkidsAssetCache = { prefetchAssets };
  const assets = Array.from({ length: 9 }, (_, index) => ({
    cacheKey: `lessons/example/audio/vi/prompt-${index}.wav`,
    remoteUrl: `http://127.0.0.1:8787/prompt-${index}.wav`,
  }));

  await expect(prefetchRemoteAssets(assets)).resolves.toBe(true);
  expect(prefetchAssets.mock.calls.map(([batch]) => batch.length)).toEqual([
    4, 4, 1,
  ]);
});
