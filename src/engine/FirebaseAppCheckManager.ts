import { getApps } from '@react-native-firebase/app';
import {
  getToken,
  type AppCheck,
  initializeAppCheck,
  ReactNativeFirebaseAppCheckProvider,
} from '@react-native-firebase/app-check';

let initializationPromise: Promise<AppCheck | null> | null = null;

export function startFirebaseAppCheck() {
  if (!initializationPromise) {
    initializationPromise = initialize().catch(() => null);
  }

  return initializationPromise.then(() => undefined);
}

export async function ensureFirebaseAppCheckToken() {
  if (!initializationPromise) {
    initializationPromise = initialize().catch(() => null);
  }

  const appCheck = await initializationPromise;
  if (!appCheck) {
    return false;
  }

  try {
    const tokenResult = await getToken(appCheck, true);
    return tokenResult.token.trim().length > 0;
  } catch {
    return false;
  }
}

async function initialize() {
  if (getApps().length === 0) {
    return null;
  }

  const provider = new ReactNativeFirebaseAppCheckProvider();
  provider.configure({
    android: { provider: __DEV__ ? 'debug' : 'playIntegrity' },
    apple: {
      provider: __DEV__ ? 'debug' : 'appAttestWithDeviceCheckFallback',
    },
  });

  return initializeAppCheck(undefined, {
    isTokenAutoRefreshEnabled: true,
    provider,
  });
}
