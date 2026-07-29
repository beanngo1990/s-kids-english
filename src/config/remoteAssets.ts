import {
  remoteAssetRelease,
  remoteImageRevision,
} from './generatedAssetRelease';
import { remoteAssetOverrides } from './remoteAssetOverrides';

const publicAssetRoot = 'https://assets.sungy.net';
const defaultAssetBaseUrl = `${publicAssetRoot}/${remoteAssetRelease}`;

export const remoteAssetsConfig = {
  allowMissingLessonAudio:
    __DEV__ && (remoteAssetOverrides.allowMissingLessonAudio ?? false),
  /**
   * Public R2 URL for remote asset loading.
   */
  baseUrl: remoteAssetOverrides.baseUrl ?? defaultAssetBaseUrl,
  cacheRemoteAssets: remoteAssetOverrides.cacheRemoteAssets ?? true,
  preferRemoteImages: remoteAssetOverrides.preferRemoteImages ?? true,
};

export function getRemoteAssetUrl(assetKey: string) {
  if (!remoteAssetsConfig.baseUrl) {
    return undefined;
  }

  const baseUrl = remoteAssetsConfig.baseUrl.replace(/\/+$/u, '');
  const normalizedKey = assetKey.replace(/^\/+/u, '');

  const remoteUrl = `${baseUrl}/${normalizedKey}`;
  const isImage = /\.(?:avif|gif|jpe?g|png|webp)$/iu.test(normalizedKey);

  return isImage
    ? `${remoteUrl}?rev=${encodeURIComponent(remoteImageRevision)}`
    : remoteUrl;
}
