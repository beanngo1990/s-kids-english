const path = require('node:path');

jest.mock('@react-native/metro-config', () => ({
  getDefaultConfig: () => ({}),
  mergeConfig: (_defaults, config) => config,
}));

const metroConfig = require('../metro.config');

const repositoryRoot = path.resolve(__dirname, '..');
const monetizationConfigPath = path.resolve(
  repositoryRoot,
  'src/config/monetization.ts',
);
const fallbackPath = path.resolve(
  repositoryRoot,
  'src/config/revenueCatTestStoreKey.ts',
);
const localPath = path.resolve(
  repositoryRoot,
  'src/config/revenueCatTestStoreKey.local.ts',
);

function resolveTestStoreKey({ dev, localFileExists }) {
  const fallbackResolver = jest.fn();
  const result = metroConfig.resolver.resolveRequest(
    {
      dev,
      doesFileExist: filePath => localFileExists && filePath === localPath,
      originModulePath: monetizationConfigPath,
      resolveRequest: fallbackResolver,
    },
    './revenueCatTestStoreKey',
    'android',
  );

  expect(fallbackResolver).not.toHaveBeenCalled();
  return result;
}

describe('RevenueCat Test Store Metro isolation', () => {
  test('uses the ignored local module only in a debug bundle', () => {
    expect(resolveTestStoreKey({ dev: true, localFileExists: true })).toEqual({
      filePath: localPath,
      type: 'sourceFile',
    });
  });

  test('uses the tracked empty fallback when the local module is absent', () => {
    expect(resolveTestStoreKey({ dev: true, localFileExists: false })).toEqual({
      filePath: fallbackPath,
      type: 'sourceFile',
    });
  });

  test('always uses the tracked empty fallback in a release bundle', () => {
    expect(resolveTestStoreKey({ dev: false, localFileExists: true })).toEqual({
      filePath: fallbackPath,
      type: 'sourceFile',
    });
  });
});
