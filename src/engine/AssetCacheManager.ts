import { NativeModules } from 'react-native';

import { getRemoteAssetUrl, remoteAssetsConfig } from '../config/remoteAssets';
import { resolveBundledAudioUri } from './AudioAssetRegistry';

type SkidsAssetCacheModule = {
  clearCache?: () => Promise<boolean>;
  getCachedAssetUrl?: (remoteUrl: string, cacheKey: string) => Promise<string>;
  prefetchAssets?: (
    assets: { remoteUrl: string; cacheKey: string }[],
  ) => Promise<boolean>;
};

export type RemoteAssetCacheEntry = {
  cacheKey: string;
  remoteUrl: string;
};

const nativeAssetCache = NativeModules.SkidsAssetCache as
  | SkidsAssetCacheModule
  | undefined;

export async function resolveRemoteAssetUri(assetKey: string) {
  const bundledAudioUri = resolveBundledAudioUri(assetKey);
  if (bundledAudioUri) {
    return bundledAudioUri;
  }

  const remoteUrl = getRemoteAssetUrl(assetKey);

  if (!remoteUrl) {
    return undefined;
  }

  if (
    !remoteAssetsConfig.cacheRemoteAssets ||
    !nativeAssetCache?.getCachedAssetUrl
  ) {
    return remoteUrl;
  }

  try {
    return await nativeAssetCache.getCachedAssetUrl(remoteUrl, assetKey);
  } catch {
    return remoteUrl;
  }
}

export async function clearRemoteAssetCache() {
  return nativeAssetCache?.clearCache?.() ?? false;
}

export async function prefetchRemoteAssets(
  assets: RemoteAssetCacheEntry[],
) {
  if (
    !remoteAssetsConfig.cacheRemoteAssets ||
    !nativeAssetCache?.prefetchAssets
  ) {
    return false;
  }

  const validAssets = getUniqueValidAssets(assets);

  if (validAssets.length === 0) {
    return false;
  }

  try {
    return await nativeAssetCache.prefetchAssets(validAssets);
  } catch {
    return false;
  }
}

/**
 * Downloads assets through the foreground native path. Use this only for the
 * small set of files that the current/next UI action needs immediately; bulk
 * warming should continue to use prefetchRemoteAssets.
 */
export async function prepareRemoteAssets(
  assets: RemoteAssetCacheEntry[],
) {
  if (
    !remoteAssetsConfig.cacheRemoteAssets ||
    !nativeAssetCache?.getCachedAssetUrl
  ) {
    return false;
  }

  const validAssets = getUniqueValidAssets(assets);
  if (validAssets.length === 0) {
    return false;
  }

  const preparedAssets = await Promise.all(
    validAssets.map(async asset => {
      try {
        const uri = await nativeAssetCache.getCachedAssetUrl?.(
          asset.remoteUrl,
          asset.cacheKey,
        );
        return uri?.startsWith('file:') === true;
      } catch {
        return false;
      }
    }),
  );

  return preparedAssets.every(Boolean);
}

function getUniqueValidAssets(assets: RemoteAssetCacheEntry[]) {
  return Array.from(
    new Map(
      assets
        .filter(asset => Boolean(asset.remoteUrl && asset.cacheKey))
        .map(asset => [`${asset.cacheKey}\n${asset.remoteUrl}`, asset]),
    ).values(),
  );
}
