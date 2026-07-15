import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { configureNativeAudioAdapter } from './src/engine/NativeAudioAdapter';
import { startCloudProgressSync } from './src/engine/CloudProgressSyncManager';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AppThemeProvider, useAppTheme } from './src/theme/AppTheme';

configureNativeAudioAdapter();

function App() {
  useEffect(() => {
    startCloudProgressSync();
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
