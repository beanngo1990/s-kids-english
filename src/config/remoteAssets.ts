import {
  remoteAssetRelease,
  remoteImageRevision,
} from './generatedAssetRelease';

const publicAssetRoot = 'https://assets.sungy.net';

export const remoteAssetsConfig = {
  /**
   * Public R2 URL for remote asset loading.
   */
  baseUrl: `${publicAssetRoot}/${remoteAssetRelease}`,
  cacheRemoteAssets: true,
  preferRemoteImages: true,
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
