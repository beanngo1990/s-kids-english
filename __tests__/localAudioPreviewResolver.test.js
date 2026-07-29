const path = require('node:path');

jest.mock('@react-native/metro-config', () => ({
  getDefaultConfig: () => ({}),
  mergeConfig: (_defaults, config) => config,
}));

const metroConfig = require('../metro.config');

const repositoryRoot = path.resolve(__dirname, '..');
const audioManagerPath = path.resolve(
  repositoryRoot,
  'src/engine/AudioManager.ts',
);
const scenePlayerPath = path.resolve(
  repositoryRoot,
  'src/engine/ScenePlayer.tsx',
);
const manifestFallbackPath = path.resolve(
  repositoryRoot,
  'src/data/audioManifest.ts',
);
const manifestLocalPath = path.resolve(
  repositoryRoot,
  'src/data/audioManifest.local.ts',
);
const previewConfigFallbackPath = path.resolve(
  repositoryRoot,
  'src/config/localAudioPreview.ts',
);
const previewConfigLocalPath = path.resolve(
  repositoryRoot,
  'src/config/localAudioPreview.local.ts',
);

function resolveModule({
  dev,
  localFileExists,
  moduleName,
  originModulePath,
}) {
  const fallbackResolver = jest.fn();
  const result = metroConfig.resolver.resolveRequest(
    {
      dev,
      doesFileExist: filePath =>
        localFileExists &&
        (filePath === manifestLocalPath ||
          filePath === previewConfigLocalPath),
      originModulePath,
      resolveRequest: fallbackResolver,
    },
    moduleName,
    'android',
  );

  expect(fallbackResolver).not.toHaveBeenCalled();
  return result;
}

describe('local audio preview Metro isolation', () => {
  test.each([audioManagerPath, scenePlayerPath])(
    'uses the ignored audio manifest for a dev consumer %s',
    originModulePath => {
      expect(
        resolveModule({
          dev: true,
          localFileExists: true,
          moduleName: '../data/audioManifest',
          originModulePath,
        }),
      ).toEqual({
        filePath: manifestLocalPath,
        type: 'sourceFile',
      });
    },
  );

  test('uses the ignored lesson scope in a dev bundle', () => {
    expect(
      resolveModule({
        dev: true,
        localFileExists: true,
        moduleName: '../config/localAudioPreview',
        originModulePath: scenePlayerPath,
      }),
    ).toEqual({
      filePath: previewConfigLocalPath,
      type: 'sourceFile',
    });
  });

  test('uses tracked fallbacks when local preview files are absent', () => {
    expect(
      resolveModule({
        dev: true,
        localFileExists: false,
        moduleName: '../data/audioManifest',
        originModulePath: audioManagerPath,
      }),
    ).toEqual({
      filePath: manifestFallbackPath,
      type: 'sourceFile',
    });
    expect(
      resolveModule({
        dev: true,
        localFileExists: false,
        moduleName: '../config/localAudioPreview',
        originModulePath: scenePlayerPath,
      }),
    ).toEqual({
      filePath: previewConfigFallbackPath,
      type: 'sourceFile',
    });
  });

  test('never resolves ignored preview files in a release bundle', () => {
    expect(
      resolveModule({
        dev: false,
        localFileExists: true,
        moduleName: '../data/audioManifest',
        originModulePath: audioManagerPath,
      }),
    ).toEqual({
      filePath: manifestFallbackPath,
      type: 'sourceFile',
    });
    expect(
      resolveModule({
        dev: false,
        localFileExists: true,
        moduleName: '../config/localAudioPreview',
        originModulePath: scenePlayerPath,
      }),
    ).toEqual({
      filePath: previewConfigFallbackPath,
      type: 'sourceFile',
    });
  });
});
