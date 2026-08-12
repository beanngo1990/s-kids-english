import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { AppState, Platform, type AppStateStatus } from 'react-native';

import {
  OPTIONAL_UPDATE_REMINDER_DELAY_MS,
  REMOTE_APP_UPDATE_POLICY_KEY,
} from '../config/appUpdate';
import {
  refreshRemoteConfig,
  startRemoteConfig,
  subscribeRemoteConfigUpdates,
} from '../services/RemoteConfigService';
import { getAppVersion } from './AppInfo';
import {
  evaluateAppUpdatePolicy,
  parseAppUpdatePolicy,
  parseOptionalUpdateDismissal,
  type AppUpdateStatus,
} from './AppUpdatePolicy';

const APP_UPDATE_PROMPT_STORAGE_KEY =
  '@skidsenglish/app-update-prompt/v1';

export type AppUpdateErrorCode =
  | 'configInvalid'
  | 'fetchFailed'
  | 'unsupportedPlatform'
  | 'versionUnavailable';

export type AppUpdateSnapshot = Readonly<{
  currentVersion?: string;
  errorCode?: AppUpdateErrorCode;
  isReady: boolean;
  latestVersion?: string;
  minimumSupportedVersion?: string;
  status: AppUpdateStatus;
  storeUrl?: string;
}>;

const listeners = new Set<() => void>();

let snapshot: AppUpdateSnapshot = {
  isReady: false,
  status: 'none',
};
let hasStarted = false;
let refreshPromise: Promise<void> | null = null;
let appStateSubscription: { remove: () => void } | null = null;
let unsubscribeRemoteUpdates: (() => void) | null = null;

export function getAppUpdateSnapshot() {
  return snapshot;
}

export function subscribeAppUpdate(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAppUpdateSnapshot() {
  return useSyncExternalStore(
    subscribeAppUpdate,
    getAppUpdateSnapshot,
    getAppUpdateSnapshot,
  );
}

export function startAppUpdateManager() {
  if (hasStarted) {
    return stopAppUpdateManager;
  }

  hasStarted = true;
  appStateSubscription = AppState.addEventListener(
    'change',
    handleAppStateChange,
  );
  checkForAppUpdate(false).catch(() => undefined);

  return stopAppUpdateManager;
}

export function stopAppUpdateManager() {
  hasStarted = false;
  appStateSubscription?.remove();
  appStateSubscription = null;
  unsubscribeRemoteUpdates?.();
  unsubscribeRemoteUpdates = null;
}

export function checkForAppUpdate(forceRefresh = true) {
  if (!refreshPromise) {
    refreshPromise = runAppUpdateCheck(forceRefresh).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function dismissOptionalAppUpdate() {
  if (snapshot.status !== 'optional' || !snapshot.latestVersion) {
    return;
  }

  const dismissal = {
    dismissedAt: new Date().toISOString(),
    latestVersion: snapshot.latestVersion,
  };

  updateSnapshot({ ...snapshot, status: 'none' });
  await AsyncStorage.setItem(
    APP_UPDATE_PROMPT_STORAGE_KEY,
    JSON.stringify(dismissal),
  ).catch(() => undefined);
}

async function runAppUpdateCheck(forceRefresh: boolean) {
  try {
    const instance = forceRefresh
      ? await refreshRemoteConfig()
      : await startRemoteConfig();
    await applyRemotePolicy(instance);
    ensureRemoteUpdatesSubscribed();
  } catch {
    updateSnapshot({
      ...snapshot,
      errorCode: 'fetchFailed',
      isReady: true,
      status: 'none',
    });
  }
}

async function applyRemotePolicy(
  instance: Awaited<ReturnType<typeof startRemoteConfig>>,
) {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    updateSnapshot({
      errorCode: 'unsupportedPlatform',
      isReady: true,
      status: 'none',
    });
    return;
  }

  const currentVersion = await getAppVersion();
  if (!currentVersion) {
    updateSnapshot({
      errorCode: 'versionUnavailable',
      isReady: true,
      status: 'none',
    });
    return;
  }

  const policy = parseAppUpdatePolicy(
    instance.getValue(REMOTE_APP_UPDATE_POLICY_KEY).asString(),
    Platform.OS,
  );
  if (!policy) {
    updateSnapshot({
      currentVersion,
      errorCode: 'configInvalid',
      isReady: true,
      status: 'none',
    });
    return;
  }

  const dismissal = await readOptionalUpdateDismissal();
  const decision = evaluateAppUpdatePolicy({
    currentVersion,
    dismissal,
    now: Date.now(),
    optionalReminderDelayMs: OPTIONAL_UPDATE_REMINDER_DELAY_MS,
    policy,
  });
  if (!decision) {
    updateSnapshot({
      currentVersion,
      errorCode: 'configInvalid',
      isReady: true,
      status: 'none',
    });
    return;
  }

  updateSnapshot({
    currentVersion,
    errorCode: undefined,
    isReady: true,
    latestVersion: decision.latestVersion,
    minimumSupportedVersion: decision.minimumSupportedVersion,
    status: decision.status,
    storeUrl: decision.storeUrl,
  });
}

async function readOptionalUpdateDismissal() {
  try {
    return parseOptionalUpdateDismissal(
      await AsyncStorage.getItem(APP_UPDATE_PROMPT_STORAGE_KEY),
    );
  } catch {
    return null;
  }
}

function handleAppStateChange(nextState: AppStateStatus) {
  if (nextState === 'active') {
    checkForAppUpdate(true).catch(() => undefined);
  }
}

function ensureRemoteUpdatesSubscribed() {
  if (!hasStarted || unsubscribeRemoteUpdates) {
    return;
  }

  unsubscribeRemoteUpdates = subscribeRemoteConfigUpdates(
    [REMOTE_APP_UPDATE_POLICY_KEY],
    instance => applyRemotePolicy(instance),
    () => undefined,
  );
}

function updateSnapshot(nextSnapshot: AppUpdateSnapshot) {
  snapshot = nextSnapshot;
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      // App-update observers are isolated from the shared manager.
    }
  }
}
