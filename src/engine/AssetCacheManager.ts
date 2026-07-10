import { NativeModules } from 'react-native';

import { getRemoteAssetUrl, remoteAssetsConfig } from '../config/remoteAssets';
import { resolveBundledAudioUri } from './AudioAssetRegistry';

type SkidsAssetCacheModule = {
  clearCache?: () => Promise<boolean>;
  getCachedAssetUrl?: (remoteUrl: string, cacheKey: string) => Promise<string>;
  prefetchAssets?: (assets: {remoteUrl: string, cacheKey: string}[]) => Promise<boolean>;
};

const nativeAssetCache = NativeModules.SkidsAssetCache as
  | SkidsAssetCacheModule
  | undefined;

export async function resolveRemoteAssetUri(assetKey: string) {
  const remoteUrl = getRemoteAssetUrl(assetKey);

  if (!remoteUrl) {
    return resolveBundledAudioUri(assetKey);
  }

  if (!remoteAssetsConfig.cacheRemoteAssets || !nativeAssetCache?.getCachedAssetUrl) {
    return remoteUrl;
  }

  try {
    return await nativeAssetCache.getCachedAssetUrl(remoteUrl, assetKey);
  } catch {
    return resolveBundledAudioUri(assetKey) ?? remoteUrl;
  }
}

export async function clearRemoteAssetCache() {
  return nativeAssetCache?.clearCache?.() ?? false;
}

export async function prefetchRemoteAssets(
  assets: { remoteUrl: string; cacheKey: string }[],
) {
  if (!remoteAssetsConfig.cacheRemoteAssets || !nativeAssetCache?.prefetchAssets) {
    return false;
  }

  const validAssets = assets.filter(asset => Boolean(asset.remoteUrl && asset.cacheKey));
  
  if (validAssets.length === 0) {
    return false;
  }

  try {
    return await nativeAssetCache.prefetchAssets(validAssets);
  } catch {
    return false;
  }
}
