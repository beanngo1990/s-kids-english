export const remoteAssetsConfig = {
  /**
   * Set this to your public R2/custom-domain base URL later, for example:
   * https://assets.s-kids-english.com
   */
  baseUrl: '',
  cacheRemoteAssets: true,
  preferRemoteImages: false,
};

export function getRemoteAssetUrl(assetKey: string) {
  if (!remoteAssetsConfig.baseUrl) {
    return undefined;
  }

  const baseUrl = remoteAssetsConfig.baseUrl.replace(/\/+$/u, '');
  const normalizedKey = assetKey.replace(/^\/+/u, '');

  return `${baseUrl}/${normalizedKey}`;
}
