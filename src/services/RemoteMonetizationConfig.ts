import { useSyncExternalStore } from 'react';
import remoteConfig from '@react-native-firebase/remote-config';

import {
  DEFAULT_FOUNDER_PREMIUM_DURATION_DAYS,
  remoteMonetizationConfigKeys,
} from '../config/monetization';
import {
  refreshRemoteConfig,
  startRemoteConfig,
  subscribeRemoteConfigUpdates,
} from './RemoteConfigService';

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
    const instance = await refreshRemoteConfig();
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
  return subscribeRemoteConfigUpdates(
    Object.values(remoteMonetizationConfigKeys),
    applyRemoteValues,
    () => {
      updateSnapshot({ ...snapshot, errorCode: 'fetchFailed' });
    },
  );
}

async function initializeRemoteConfig() {
  try {
    const instance = await startRemoteConfig();
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
