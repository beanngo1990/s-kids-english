import { NativeModules } from 'react-native';

import { getRemoteAssetUrl, remoteAssetsConfig } from '../config/remoteAssets';
import { resolveBundledAudioUri } from './AudioAssetRegistry';

type SkidsAssetCacheModule = {
  clearCache?: () => Promise<boolean>;
  getCachedAssetUrl?: (remoteUrl: string, cacheKey: string) => Promise<string>;
  prefetchAssets?: (
    assets: { remoteUrl: string; cacheKey: string }[],
  ) => Promise<boolean>;
  setAppCheckToken?: (token: string) => void;
};

export type RemoteAssetCacheEntry = {
  cacheKey: string;
  remoteUrl: string;
};

function getNativeAssetCache() {
  return NativeModules.SkidsAssetCache as SkidsAssetCacheModule | undefined;
}

export function setNativeAssetCacheAppCheckToken(token: string) {
  const nativeCache = getNativeAssetCache();
  if (token && nativeCache?.setAppCheckToken) {
    try {
      nativeCache.setAppCheckToken(token);
    } catch {
      // Native module might be unavailable or unlinked in certain dev environments
    }
  }
}

export async function syncAppCheckTokenToNativeCache(
  getTokenFn?: () => Promise<string | null>,
) {
  try {
    const fetchToken =
      getTokenFn ??
      (async () => {
        const { getFirebaseAppCheckToken } = await import(
          './FirebaseAppCheckManager'
        );
        return getFirebaseAppCheckToken(false);
      });
    const token = await fetchToken();
    if (token) {
      setNativeAssetCacheAppCheckToken(token);
    }
  } catch {
    // App Check is optional and best-effort
  }
}

export async function resolveRemoteAssetUri(assetKey: string) {
  const bundledAudioUri = resolveBundledAudioUri(assetKey);
  if (bundledAudioUri) {
    return bundledAudioUri;
  }

  const remoteUrl = getRemoteAssetUrl(assetKey);

  if (!remoteUrl) {
    return undefined;
  }

  const nativeCache = getNativeAssetCache();
  if (!remoteAssetsConfig.cacheRemoteAssets || !nativeCache?.getCachedAssetUrl) {
    return remoteUrl;
  }

  try {
    return await nativeCache.getCachedAssetUrl(remoteUrl, assetKey);
  } catch {
    return remoteUrl;
  }
}

export async function clearRemoteAssetCache() {
  return getNativeAssetCache()?.clearCache?.() ?? false;
}

export async function prefetchRemoteAssets(
  assets: RemoteAssetCacheEntry[],
) {
  const nativeCache = getNativeAssetCache();
  if (!remoteAssetsConfig.cacheRemoteAssets || !nativeCache?.prefetchAssets) {
    return false;
  }

  const validAssets = getUniqueValidAssets(assets);

  if (validAssets.length === 0) {
    return false;
  }

  try {
    return await nativeCache.prefetchAssets(validAssets);
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
  const validAssets = getUniqueValidAssets(assets);
  if (validAssets.length === 0) {
    return false;
  }

  // Cache-disabled dev modes stream directly from the configured asset URL.
  if (!remoteAssetsConfig.cacheRemoteAssets) {
    return true;
  }

  const nativeCache = getNativeAssetCache();
  if (!nativeCache?.getCachedAssetUrl) {
    return false;
  }

  const preparedAssets = await Promise.all(
    validAssets.map(async asset => {
      try {
        const uri = await nativeCache.getCachedAssetUrl?.(
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
