import { Platform } from 'react-native';
import {
  checkForUnsentReports,
  deleteUnsentReports,
  getCrashlytics,
  sendUnsentReports,
  setAttributes,
  setCrashlyticsCollectionEnabled,
  setUserId,
  type Crashlytics,
} from '@react-native-firebase/crashlytics';

import { APP_VERSION } from '../config/appInfo';
import {
  getParentSettings,
  subscribeParentSettings,
} from '../engine/ParentSettingsManager';

let hasStarted = false;
let unsubscribeSettings: (() => void) | null = null;

export type CrashReportingState = {
  hasPendingCrashReport: boolean;
  isAvailable: boolean;
};

type CrashReportingStateListener = (state: CrashReportingState) => void;

const crashReportingListeners = new Set<CrashReportingStateListener>();

let crashReportingState: CrashReportingState = {
  hasPendingCrashReport: false,
  isAvailable: true,
};

export function startCrashReporting() {
  if (hasStarted) {
    return stopCrashReporting;
  }

  hasStarted = true;

  getParentSettings()
    .then(settings =>
      applyCrashReportingConsent(settings.crashReportingEnabled),
    )
    .catch(() => undefined);

  unsubscribeSettings = subscribeParentSettings(settings => {
    applyCrashReportingConsent(settings.crashReportingEnabled).catch(
      () => undefined,
    );
  });

  return stopCrashReporting;
}

export function stopCrashReporting() {
  unsubscribeSettings?.();
  unsubscribeSettings = null;
  hasStarted = false;
}

export function getCrashReportingState() {
  return crashReportingState;
}

export function subscribeCrashReportingState(
  listener: CrashReportingStateListener,
) {
  crashReportingListeners.add(listener);
  listener(crashReportingState);

  return () => {
    crashReportingListeners.delete(listener);
  };
}

type CrashReportingConsentOptions = {
  discardUnsentReports?: boolean;
  sendPendingReports?: boolean;
};

export async function applyCrashReportingConsent(
  enabled: boolean,
  options: CrashReportingConsentOptions = {},
) {
  const instance = getCrashlyticsInstance();
  if (!instance) {
    setCrashReportingState({
      hasPendingCrashReport: false,
      isAvailable: false,
    });
    return false;
  }

  setCrashReportingState({ isAvailable: true });

  if (!enabled) {
    await setCrashlyticsCollectionEnabled(instance, false);
    await setUserId(instance, '');
    if (options.discardUnsentReports) {
      await deleteUnsentReports(instance);
      setCrashReportingState({ hasPendingCrashReport: false });
    } else {
      await refreshPendingCrashReport(instance);
    }
    return true;
  }

  await setUserId(instance, '');
  await setAttributes(instance, {
    app_version: APP_VERSION,
    crash_reporting_scope: 'technical_diagnostics_only',
    platform: Platform.OS,
  });

  if (
    options.sendPendingReports !== false &&
    !instance.isCrashlyticsCollectionEnabled
  ) {
    const hasPendingReport = await checkForPendingCrashReport(instance);
    if (hasPendingReport) {
      sendUnsentReports(instance);
    }
  }

  await setCrashlyticsCollectionEnabled(instance, true);
  setCrashReportingState({ hasPendingCrashReport: false });

  return true;
}

export async function refreshPendingCrashReport(instance?: Crashlytics) {
  const resolvedInstance = instance ?? getCrashlyticsInstance();
  if (!resolvedInstance) {
    setCrashReportingState({
      hasPendingCrashReport: false,
      isAvailable: false,
    });
    return false;
  }

  setCrashReportingState({ isAvailable: true });

  if (resolvedInstance.isCrashlyticsCollectionEnabled) {
    setCrashReportingState({ hasPendingCrashReport: false });
    return false;
  }

  const hasPendingReport = await checkForPendingCrashReport(resolvedInstance);
  setCrashReportingState({ hasPendingCrashReport: hasPendingReport });
  return hasPendingReport;
}

export async function discardPendingCrashReports() {
  const instance = getCrashlyticsInstance();
  if (!instance) {
    setCrashReportingState({
      hasPendingCrashReport: false,
      isAvailable: false,
    });
    return false;
  }

  setCrashReportingState({ isAvailable: true });
  await setCrashlyticsCollectionEnabled(instance, false);
  await deleteUnsentReports(instance);
  await setUserId(instance, '');
  setCrashReportingState({ hasPendingCrashReport: false });
  return true;
}

function getCrashlyticsInstance(): Crashlytics | null {
  try {
    return getCrashlytics();
  } catch {
    return null;
  }
}

async function checkForPendingCrashReport(instance: Crashlytics) {
  try {
    return await checkForUnsentReports(instance);
  } catch {
    return false;
  }
}

function setCrashReportingState(nextState: Partial<CrashReportingState>) {
  const resolvedState = {
    ...crashReportingState,
    ...nextState,
  };

  if (
    resolvedState.hasPendingCrashReport ===
      crashReportingState.hasPendingCrashReport &&
    resolvedState.isAvailable === crashReportingState.isAvailable
  ) {
    return;
  }

  crashReportingState = resolvedState;
  for (const listener of crashReportingListeners) {
    try {
      listener(crashReportingState);
    } catch {
      // Crash reporting state listeners should not break app startup.
    }
  }
}
