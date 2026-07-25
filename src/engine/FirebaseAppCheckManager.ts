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
  const token = await getFirebaseAppCheckToken(true);
  return Boolean(token && token.length > 0);
}

export async function getFirebaseAppCheckToken(
  forceRefresh = false,
): Promise<string | null> {
  if (!initializationPromise) {
    initializationPromise = initialize().catch(() => null);
  }

  const appCheck = await initializationPromise;
  if (!appCheck) {
    return null;
  }

  try {
    const tokenResult = await getToken(appCheck, forceRefresh);
    const token = tokenResult.token.trim();
    return token.length > 0 ? token : null;
  } catch {
    return null;
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
