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

const assetBatchSize = 4;
const foregroundRetryDelayMs = 300;
const inFlightForegroundPreparations = new Map<string, Promise<boolean>>();

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

  let allAssetsReady = true;
  for (const assetBatch of chunkAssets(validAssets)) {
    try {
      const isBatchReady = await nativeCache.prefetchAssets(assetBatch);
      allAssetsReady = isBatchReady && allAssetsReady;
    } catch {
      allAssetsReady = false;
    }
  }

  return allAssetsReady;
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

  let allAssetsReady = true;
  for (const assetBatch of chunkAssets(validAssets)) {
    const preparedAssets = await Promise.all(
      assetBatch.map(asset => prepareForegroundAsset(nativeCache, asset)),
    );
    allAssetsReady = preparedAssets.every(Boolean) && allAssetsReady;
  }

  return allAssetsReady;
}

async function prepareForegroundAsset(
  nativeCache: SkidsAssetCacheModule,
  asset: RemoteAssetCacheEntry,
) {
  const firstAttemptReady = await prepareForegroundAssetOnce(
    nativeCache,
    asset,
  );
  if (firstAttemptReady) {
    return true;
  }

  await wait(foregroundRetryDelayMs);
  return prepareForegroundAssetOnce(nativeCache, asset);
}

function prepareForegroundAssetOnce(
  nativeCache: SkidsAssetCacheModule,
  asset: RemoteAssetCacheEntry,
) {
  const preparationKey = `${asset.cacheKey}\n${asset.remoteUrl}`;
  const inFlightPreparation =
    inFlightForegroundPreparations.get(preparationKey);
  if (inFlightPreparation) {
    return inFlightPreparation;
  }

  let preparation: Promise<boolean>;
  preparation = (async () => {
    try {
      const uri = await nativeCache.getCachedAssetUrl?.(
        asset.remoteUrl,
        asset.cacheKey,
      );
      return uri?.startsWith('file:') === true;
    } catch {
      return false;
    }
  })().finally(() => {
    if (inFlightForegroundPreparations.get(preparationKey) === preparation) {
      inFlightForegroundPreparations.delete(preparationKey);
    }
  });

  inFlightForegroundPreparations.set(preparationKey, preparation);
  return preparation;
}

function chunkAssets(assets: RemoteAssetCacheEntry[]) {
  const batches: RemoteAssetCacheEntry[][] = [];
  for (let index = 0; index < assets.length; index += assetBatchSize) {
    batches.push(assets.slice(index, index + assetBatchSize));
  }
  return batches;
}

function wait(durationMs: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, durationMs);
  });
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
