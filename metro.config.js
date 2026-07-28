const path = require('node:path');

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const monetizationConfigPath = path.resolve(
  __dirname,
  'src/config/monetization.ts',
);
const revenueCatTestStoreFallbackPath = path.resolve(
  __dirname,
  'src/config/revenueCatTestStoreKey.ts',
);
const revenueCatTestStoreLocalPath = path.resolve(
  __dirname,
  'src/config/revenueCatTestStoreKey.local.ts',
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

      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
