const path = require('node:path');

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const monetizationConfigPath = path.resolve(
  __dirname,
  'src/config/monetization.ts',
);
const audioManagerPath = path.resolve(
  __dirname,
  'src/engine/AudioManager.ts',
);
const scenePlayerPath = path.resolve(
  __dirname,
  'src/engine/ScenePlayer.tsx',
);
const audioManifestFallbackPath = path.resolve(
  __dirname,
  'src/data/audioManifest.ts',
);
const audioManifestLocalPath = path.resolve(
  __dirname,
  'src/data/audioManifest.local.ts',
);
const localAudioPreviewFallbackPath = path.resolve(
  __dirname,
  'src/config/localAudioPreview.ts',
);
const localAudioPreviewLocalPath = path.resolve(
  __dirname,
  'src/config/localAudioPreview.local.ts',
);
const remoteAssetsConfigPath = path.resolve(
  __dirname,
  'src/config/remoteAssets.ts',
);
const revenueCatTestStoreFallbackPath = path.resolve(
  __dirname,
  'src/config/revenueCatTestStoreKey.ts',
);
const revenueCatTestStoreLocalPath = path.resolve(
  __dirname,
  'src/config/revenueCatTestStoreKey.local.ts',
);
const remoteAssetOverridesFallbackPath = path.resolve(
  __dirname,
  'src/config/remoteAssetOverrides.ts',
);
const remoteAssetOverridesLocalPath = path.resolve(
  __dirname,
  'src/config/remoteAssetOverrides.local.ts',
);

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      const isRevenueCatTestStoreKeyRequest =
        context.originModulePath === monetizationConfigPath &&
        moduleName === './revenueCatTestStoreKey';

      if (isRevenueCatTestStoreKeyRequest) {
        const useLocalDebugKey =
          context.dev && context.doesFileExist(revenueCatTestStoreLocalPath);

        return {
          filePath: useLocalDebugKey
            ? revenueCatTestStoreLocalPath
            : revenueCatTestStoreFallbackPath,
          type: 'sourceFile',
        };
      }

      const isRemoteAssetOverridesRequest =
        context.originModulePath === remoteAssetsConfigPath &&
        moduleName === './remoteAssetOverrides';

      if (isRemoteAssetOverridesRequest) {
        const useLocalAssetOverrides =
          context.dev && context.doesFileExist(remoteAssetOverridesLocalPath);

        return {
          filePath: useLocalAssetOverrides
            ? remoteAssetOverridesLocalPath
            : remoteAssetOverridesFallbackPath,
          type: 'sourceFile',
        };
      }

      const isAudioManifestRequest =
        (context.originModulePath === audioManagerPath ||
          context.originModulePath === scenePlayerPath) &&
        moduleName === '../data/audioManifest';

      if (isAudioManifestRequest) {
        const useLocalAudioManifest =
          context.dev && context.doesFileExist(audioManifestLocalPath);

        return {
          filePath: useLocalAudioManifest
            ? audioManifestLocalPath
            : audioManifestFallbackPath,
          type: 'sourceFile',
        };
      }

      const isLocalAudioPreviewRequest =
        context.originModulePath === scenePlayerPath &&
        moduleName === '../config/localAudioPreview';

      if (isLocalAudioPreviewRequest) {
        const useLocalAudioPreview =
          context.dev && context.doesFileExist(localAudioPreviewLocalPath);

        return {
          filePath: useLocalAudioPreview
            ? localAudioPreviewLocalPath
            : localAudioPreviewFallbackPath,
          type: 'sourceFile',
        };
      }

      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
