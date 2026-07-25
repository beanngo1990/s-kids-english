import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { syncAppCheckTokenToNativeCache } from './src/engine/AssetCacheManager';
import { configureNativeAudioAdapter } from './src/engine/NativeAudioAdapter';
import { startCloudProgressSync } from './src/engine/CloudProgressSyncManager';
import { startFirebaseAppCheck } from './src/engine/FirebaseAppCheckManager';
import { startMonetization } from './src/engine/MonetizationManager';
import { startParentAccessSessionLifecycle } from './src/engine/ParentAccessSession';
import { AppNavigator } from './src/navigation/AppNavigator';
import { startRemoteMonetizationConfig } from './src/services/RemoteMonetizationConfig';
import { AppThemeProvider, useAppTheme } from './src/theme/AppTheme';

configureNativeAudioAdapter();

function App() {
  useEffect(() => {
    startFirebaseAppCheck()
      .then(() => syncAppCheckTokenToNativeCache())
      .catch(() => undefined);
    startCloudProgressSync();

    startRemoteMonetizationConfig().catch(() => undefined);
    const stopMonetization = startMonetization();
    const stopParentAccessLifecycle = startParentAccessSessionLifecycle();

    return () => {
      stopMonetization();
      stopParentAccessLifecycle();
    };
  }, []);

  return (
    <AppThemeProvider>
      <ThemedApp />
    </AppThemeProvider>
  );
}

function ThemedApp() {
  const { colorScheme, colors } = useAppTheme();

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
