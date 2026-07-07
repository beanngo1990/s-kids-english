export const remoteAssetsConfig = {
  /**
   * Public R2 URL for remote asset loading.
   */
  baseUrl: 'https://pub-4b4ed99067d94d3f8d25b7270982970a.r2.dev/v1',
  cacheRemoteAssets: true,
  preferRemoteImages: true,
};

export function getRemoteAssetUrl(assetKey: string) {
  if (!remoteAssetsConfig.baseUrl) {
    return undefined;
  }

  const baseUrl = remoteAssetsConfig.baseUrl.replace(/\/+$/u, '');
  const normalizedKey = assetKey.replace(/^\/+/u, '');

  return `${baseUrl}/${normalizedKey}`;
}
