import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { configureNativeAudioAdapter } from './src/engine/NativeAudioAdapter';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme/colors';

configureNativeAudioAdapter();

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
