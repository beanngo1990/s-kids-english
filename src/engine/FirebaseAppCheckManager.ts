import { getApps } from '@react-native-firebase/app';
import {
  initializeAppCheck,
  ReactNativeFirebaseAppCheckProvider,
} from '@react-native-firebase/app-check';

let initializationPromise: Promise<void> | null = null;

export function startFirebaseAppCheck() {
  if (!initializationPromise) {
    initializationPromise = initialize().catch(() => undefined);
  }

  return initializationPromise;
}

async function initialize() {
  if (getApps().length === 0) {
    return;
  }

  const provider = new ReactNativeFirebaseAppCheckProvider();
  provider.configure({
    android: { provider: __DEV__ ? 'debug' : 'playIntegrity' },
    apple: {
      provider: __DEV__ ? 'debug' : 'appAttestWithDeviceCheckFallback',
    },
  });

  await initializeAppCheck(undefined, {
    isTokenAutoRefreshEnabled: true,
    provider,
  });
}
