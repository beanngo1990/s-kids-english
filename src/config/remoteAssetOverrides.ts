export type RemoteAssetOverrides = Readonly<{
  allowMissingLessonAudio?: boolean;
  baseUrl?: string;
  cacheRemoteAssets?: boolean;
  preferRemoteImages?: boolean;
}>;

export const remoteAssetOverrides: RemoteAssetOverrides = {};
