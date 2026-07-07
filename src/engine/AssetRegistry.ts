import type { ImageSourcePropType } from 'react-native';

import { getRemoteAssetUrl, remoteAssetsConfig } from '../config/remoteAssets';

/**
 * Image asset registry.
 *
 * Previously contained bundled require() calls for all lesson images.
 * Now empty — images are loaded from Cloudflare R2 via remoteAssetsConfig.
 * Local files are kept on disk for development and upload workflows.
 */
const registry: Record<string, ImageSourcePropType> = {};

/**
 * Resolves a string path from data into a React Native ImageSource.
 * Prefers remote URL from R2 when configured, falls back to bundled or URI.
 */
export function resolveAsset(source: string): ImageSourcePropType | undefined {
  if (remoteAssetsConfig.preferRemoteImages) {
    const remoteAssetUrl = getRemoteAssetUrl(source);
    if (remoteAssetUrl) {
      return { uri: remoteAssetUrl };
    }
  }

  if (registry[source]) {
    return registry[source];
  }

  if (/^(https?:|file:|content:|data:)/u.test(source)) {
    return { uri: source };
  }

  return undefined;
}
