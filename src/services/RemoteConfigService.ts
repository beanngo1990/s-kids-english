import remoteConfig from '@react-native-firebase/remote-config';

import {
  DEFAULT_REMOTE_APP_UPDATE_POLICY,
  REMOTE_APP_UPDATE_POLICY_KEY,
} from '../config/appUpdate';
import {
  DEFAULT_FOUNDER_PREMIUM_DURATION_DAYS,
  remoteMonetizationConfigKeys,
} from '../config/monetization';

const defaults = {
  [REMOTE_APP_UPDATE_POLICY_KEY]: DEFAULT_REMOTE_APP_UPDATE_POLICY,
  [remoteMonetizationConfigKeys.founderPremiumCutoffAt]: '',
  [remoteMonetizationConfigKeys.founderPremiumDurationDays]:
    DEFAULT_FOUNDER_PREMIUM_DURATION_DAYS,
  [remoteMonetizationConfigKeys.premiumPurchaseEnabled]: true,
};

type RemoteConfigInstance = ReturnType<typeof remoteConfig>;

let startPromise: Promise<RemoteConfigInstance> | null = null;
let hasStarted = false;

export function startRemoteConfig() {
  if (!startPromise) {
    startPromise = initializeRemoteConfig().catch(error => {
      startPromise = null;
      throw error;
    });
  }

  return startPromise;
}

export async function refreshRemoteConfig() {
  if (!hasStarted) {
    return startRemoteConfig();
  }

  const instance = remoteConfig();
  await instance.fetchAndActivate();
  return instance;
}

export function subscribeRemoteConfigUpdates(
  relevantKeys: readonly string[],
  onUpdate: (instance: RemoteConfigInstance) => void | Promise<void>,
  onError: () => void,
) {
  try {
    const instance = remoteConfig();
    const keySet = new Set(relevantKeys);
    return instance.onConfigUpdate({
      complete: () => undefined,
      error: onError,
      next: async update => {
        const hasRelevantUpdate = Array.from(update.getUpdatedKeys()).some(key =>
          keySet.has(key),
        );

        if (!hasRelevantUpdate) {
          return;
        }

        await instance.activate();
        await onUpdate(instance);
      },
    });
  } catch {
    return () => undefined;
  }
}

async function initializeRemoteConfig() {
  const instance = remoteConfig();
  await instance.setDefaults(defaults);
  await instance.setConfigSettings({
    fetchTimeMillis: 10_000,
    minimumFetchIntervalMillis: __DEV__ ? 0 : 60 * 60 * 1000,
  });
  await instance.fetchAndActivate();
  hasStarted = true;
  return instance;
}

