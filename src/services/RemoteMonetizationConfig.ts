import { useSyncExternalStore } from 'react';
import remoteConfig from '@react-native-firebase/remote-config';

import {
  DEFAULT_FOUNDER_PREMIUM_DURATION_DAYS,
  remoteMonetizationConfigKeys,
} from '../config/monetization';

export type RemoteMonetizationConfigErrorCode =
  | 'firebaseUnavailable'
  | 'fetchFailed';

export type RemoteMonetizationConfigSnapshot = Readonly<{
  errorCode?: RemoteMonetizationConfigErrorCode;
  founderPremiumCutoffAt: string;
  founderPremiumDurationDays: number;
  isReady: boolean;
  premiumPurchaseEnabled: boolean;
}>;

const defaults = {
  [remoteMonetizationConfigKeys.founderPremiumCutoffAt]: '',
  [remoteMonetizationConfigKeys.founderPremiumDurationDays]:
    DEFAULT_FOUNDER_PREMIUM_DURATION_DAYS,
  [remoteMonetizationConfigKeys.premiumPurchaseEnabled]: true,
};

const listeners = new Set<() => void>();

let snapshot: RemoteMonetizationConfigSnapshot = {
  founderPremiumCutoffAt: '',
  founderPremiumDurationDays: DEFAULT_FOUNDER_PREMIUM_DURATION_DAYS,
  isReady: false,
  premiumPurchaseEnabled: true,
};
let startPromise: Promise<void> | null = null;

export function getRemoteMonetizationConfigSnapshot() {
  return snapshot;
}

export function subscribeRemoteMonetizationConfig(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useRemoteMonetizationConfig() {
  return useSyncExternalStore(
    subscribeRemoteMonetizationConfig,
    getRemoteMonetizationConfigSnapshot,
    getRemoteMonetizationConfigSnapshot,
  );
}

export function startRemoteMonetizationConfig() {
  if (!startPromise) {
    startPromise = initializeRemoteConfig();
  }

  return startPromise;
}

export async function refreshRemoteMonetizationConfig() {
  await startRemoteMonetizationConfig();

  try {
    const instance = remoteConfig();
    await instance.fetchAndActivate();
    applyRemoteValues(instance);
  } catch {
    updateSnapshot({
      ...snapshot,
      errorCode: 'fetchFailed',
      isReady: true,
    });
  }

  return snapshot;
}

export function subscribeRemoteMonetizationConfigUpdates() {
  try {
    const instance = remoteConfig();
    return instance.onConfigUpdate({
      complete: () => undefined,
      error: () => {
        updateSnapshot({ ...snapshot, errorCode: 'fetchFailed' });
      },
      next: async update => {
        const relevantKeys = new Set(Object.values(remoteMonetizationConfigKeys));
        const hasRelevantUpdate = Array.from(update.getUpdatedKeys()).some(key =>
          relevantKeys.has(
            key as (typeof remoteMonetizationConfigKeys)[keyof typeof remoteMonetizationConfigKeys],
          ),
        );

        if (!hasRelevantUpdate) {
          return;
        }

        await instance.activate();
        applyRemoteValues(instance);
      },
    });
  } catch {
    return () => undefined;
  }
}

async function initializeRemoteConfig() {
  try {
    const instance = remoteConfig();
    await instance.setDefaults(defaults);
    await instance.setConfigSettings({
      fetchTimeMillis: 10_000,
      minimumFetchIntervalMillis: __DEV__ ? 0 : 60 * 60 * 1000,
    });
    applyRemoteValues(instance);
    await instance.fetchAndActivate();
    applyRemoteValues(instance);
  } catch {
    updateSnapshot({
      ...snapshot,
      errorCode: 'firebaseUnavailable',
      isReady: true,
    });
  }
}

function applyRemoteValues(instance: ReturnType<typeof remoteConfig>) {
  const founderPremiumCutoffAt = instance
    .getValue(remoteMonetizationConfigKeys.founderPremiumCutoffAt)
    .asString()
    .trim();

  updateSnapshot({
    errorCode: undefined,
    founderPremiumCutoffAt,
    founderPremiumDurationDays: instance
      .getValue(remoteMonetizationConfigKeys.founderPremiumDurationDays)
      .asNumber(),
    isReady: true,
    premiumPurchaseEnabled: instance
      .getValue(remoteMonetizationConfigKeys.premiumPurchaseEnabled)
      .asBoolean(),
  });
}

function updateSnapshot(nextSnapshot: RemoteMonetizationConfigSnapshot) {
  snapshot = nextSnapshot;
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      // Remote-config observers are isolated from the shared service.
    }
  }
}
