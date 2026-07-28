import { NativeModules } from 'react-native';

import {
  setNativeAssetCacheAppCheckToken,
  syncAppCheckTokenToNativeCache,
} from '../src/engine/AssetCacheManager';

describe('App Check Native Cache Synchronization', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('passes app check token to native module when setNativeAssetCacheAppCheckToken is called', () => {
    const mockSetToken = jest.fn();
    (NativeModules as Record<string, unknown>).SkidsAssetCache = {
      setAppCheckToken: mockSetToken,
    };

    setNativeAssetCacheAppCheckToken('test-app-check-token-123');

    expect(mockSetToken).toHaveBeenCalledWith('test-app-check-token-123');
  });

  test('syncs token from getter function to Native Asset Cache module', async () => {
    const mockSetToken = jest.fn();
    (NativeModules as Record<string, unknown>).SkidsAssetCache = {
      setAppCheckToken: mockSetToken,
    };

    const mockGetToken = jest.fn().mockResolvedValue('firebase-test-token-456');

    await syncAppCheckTokenToNativeCache(mockGetToken);

    expect(mockSetToken).toHaveBeenCalledWith('firebase-test-token-456');
  });

  test('handles case when app check token is null gracefully without calling native module', async () => {
    const mockSetToken = jest.fn();
    (NativeModules as Record<string, unknown>).SkidsAssetCache = {
      setAppCheckToken: mockSetToken,
    };

    const mockGetToken = jest.fn().mockResolvedValue(null);

    await syncAppCheckTokenToNativeCache(mockGetToken);

    expect(mockSetToken).not.toHaveBeenCalled();
  });
});
