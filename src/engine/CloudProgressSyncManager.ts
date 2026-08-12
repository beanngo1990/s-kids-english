import { getApps } from '@react-native-firebase/app';
import {
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type DocumentSnapshot,
} from '@react-native-firebase/firestore';
import { AppState, type AppStateStatus } from 'react-native';

import {
  CLOUD_PARENT_SETTINGS_DOCUMENT_ID,
  CLOUD_PARENT_SETTINGS_SCHEMA_VERSION,
  CLOUD_PROGRESS_DOCUMENT_ID,
  CLOUD_PROGRESS_SCHEMA_VERSION,
  CLOUD_PROGRESS_SYNC_CONSENT_VERSION,
} from '../config/cloudProgressSync';
import {
  areCloudParentSettingsEqual,
  getCloudParentSettingsFingerprint,
  getCloudParentSettingsUpdatedAtMs,
  parseCloudParentSettingsData,
  toCloudParentSettingsData,
  type CloudParentSettingsData,
} from './CloudParentSettingsMerge';
import {
  areProgressSnapshotsEqual,
  getCloudProgressFingerprint,
  mergeProgressSnapshots,
  toCloudProgressData,
} from './CloudProgressMerge';
import {
  clearAllCloudProgressSyncState,
  clearCloudProgressSyncState,
  getCloudProgressSyncState,
  initialCloudProgressSyncState,
  saveCloudProgressSyncState,
  type CloudProgressSyncState,
} from './CloudProgressSyncState';
import {
  getParentSettings,
  saveParentSettingsFromCloud,
  saveParentSettings,
  subscribeParentSettings,
  type CloudProgressSyncPreference,
  type ParentSettings,
} from './ParentSettingsManager';
import {
  initialParentAuthSnapshot,
  subscribeParentAuth,
  type ParentAuthSnapshot,
} from './ParentAuthManager';
import {
  getProgress,
  normalizeProgress,
  subscribeProgress,
  type LocalProgress,
  updateProgressFromCloud,
} from './ProgressManager';

export type CloudProgressSyncStatus =
  | 'accountMismatch'
  | 'connecting'
  | 'disabled'
  | 'error'
  | 'loading'
  | 'pending'
  | 'synced'
  | 'syncing'
  | 'waitingForSignIn';

export type CloudProgressSyncErrorCode =
  | 'accountMismatch'
  | 'firebaseUnavailable'
  | 'invalidRemoteData'
  | 'networkUnavailable'
  | 'notSignedIn'
  | 'permissionDenied'
  | 'unknown';

export type CloudProgressSyncSnapshot = {
  consentOwnerUid?: string;
  errorCode?: CloudProgressSyncErrorCode;
  hasStoredConsent: boolean;
  isEnabledForCurrentAccount: boolean;
  isReady: boolean;
  lastSyncedAt?: string;
  status: CloudProgressSyncStatus;
};

export const initialCloudProgressSyncSnapshot: CloudProgressSyncSnapshot = {
  hasStoredConsent: false,
  isEnabledForCurrentAccount: false,
  isReady: false,
  status: 'loading',
};

export class CloudProgressSyncError extends Error {
  readonly cause?: unknown;
  readonly code: CloudProgressSyncErrorCode;

  constructor(
    code: CloudProgressSyncErrorCode,
    message: string,
    cause?: unknown,
  ) {
    super(message);
    this.name = 'CloudProgressSyncError';
    this.code = code;
    this.cause = cause;
  }
}

type SyncListener = (snapshot: CloudProgressSyncSnapshot) => void;

export const CLOUD_PROGRESS_REMOTE_READ_COOLDOWN_MS = 5 * 60 * 1000;
export const CLOUD_PROGRESS_BACKGROUND_WRITE_COOLDOWN_MS = 90 * 1000;
export const CLOUD_PROGRESS_ACTIVE_SUBSCRIBE_DELAY_MS = 1500;
export const CLOUD_PROGRESS_INITIAL_BACKOFF_MS = 60 * 1000;
export const CLOUD_PROGRESS_MAX_BACKOFF_MS = 15 * 60 * 1000;

const syncListeners = new Set<SyncListener>();

let authSnapshot: ParentAuthSnapshot = initialParentAuthSnapshot;
let appIsActive = AppState.currentState !== 'background';
let shouldDelayNextRemoteStart = false;
let currentSettings: ParentSettings | null = null;
let localSyncState: CloudProgressSyncState = initialCloudProgressSyncState;
let localSyncStateLoading = false;
let localSyncStateReady = false;
let remoteUnsubscribe: (() => void) | null = null;
let remoteStartTimer: ReturnType<typeof setTimeout> | null = null;
let remoteStartTimerUid: string | null = null;
let activeUid: string | null = null;
let pendingProgress: LocalProgress | null = null;
let pendingParentSettings: ParentSettings | null = null;
let remoteGeneration = 0;
let initializedGeneration: number | null = null;
let flushingGeneration: number | null = null;
let isApplyingCloudParentSettings = false;
let parentSettingsWriting = false;
let remoteHandling = Promise.resolve();
let parentSettingsHandling = Promise.resolve();
let started = false;
let syncSnapshot = initialCloudProgressSyncSnapshot;

export function startCloudProgressSync() {
  if (started) {
    return;
  }

  started = true;
  appIsActive = AppState.currentState !== 'background';

  AppState.addEventListener('change', handleAppStateChange);

  subscribeParentAuth(nextAuthSnapshot => {
    authSnapshot = nextAuthSnapshot;
    reconcileSyncState();
  });

  subscribeParentSettings(settings => {
    currentSettings = settings;
    reconcileSyncState();
    if (!isApplyingCloudParentSettings && activeUid) {
      requestParentSettingsWrite(
        activeUid,
        settings,
        remoteGeneration,
      );
    }
  });

  subscribeProgress(change => {
    if (change.source === 'local' && activeUid) {
      updatePendingLocalProgress(
        activeUid,
        change.progress,
        remoteGeneration,
      );
    }
  });

  loadLocalSyncState();

  getParentSettings()
    .then(settings => {
      currentSettings = settings;
      reconcileSyncState();
    })
    .catch(error => {
      updateSyncSnapshot({
        errorCode: getCloudProgressSyncErrorCode(error),
        isReady: true,
        status: 'error',
      });
    });
}

export function subscribeCloudProgressSync(listener: SyncListener) {
  syncListeners.add(listener);
  listener(syncSnapshot);

  return () => {
    syncListeners.delete(listener);
  };
}

export async function enableCloudProgressSync() {
  const user = authSnapshot.user;
  if (!user) {
    throw new CloudProgressSyncError(
      'notSignedIn',
      'A parent account must be signed in before enabling cloud sync.',
    );
  }

  const existingPreference = currentSettings?.cloudProgressSync;
  if (
    existingPreference?.enabled &&
    existingPreference.ownerUid &&
    existingPreference.ownerUid !== user.uid
  ) {
    throw new CloudProgressSyncError(
      'accountMismatch',
      'Cloud sync consent belongs to a different parent account.',
    );
  }

  await saveParentSettings({
    cloudProgressSync: {
      consentedAt: new Date().toISOString(),
      consentVersion: CLOUD_PROGRESS_SYNC_CONSENT_VERSION,
      enabled: true,
      ownerUid: user.uid,
    },
  }, { touchUpdatedAt: false });
}

export async function disableCloudProgressSync() {
  await saveParentSettings({
    cloudProgressSync: { enabled: false },
  }, { touchUpdatedAt: false });
}

export async function disableAndDeleteCloudProgress() {
  const user = authSnapshot.user;
  if (!user) {
    throw new CloudProgressSyncError(
      'notSignedIn',
      'A parent account must be signed in before deleting cloud data.',
    );
  }

  const preference = currentSettings?.cloudProgressSync;
  if (
    preference?.ownerUid &&
    preference.ownerUid !== user.uid
  ) {
    throw new CloudProgressSyncError(
      'accountMismatch',
      'Cloud sync consent belongs to a different parent account.',
    );
  }

  await disableCloudProgressSync();

  try {
    await deleteDoc(getCloudProgressReference(user.uid));
    await deleteDoc(getCloudParentSettingsReference(user.uid));
    await clearLocalSyncCheckpoint(user.uid);
  } catch (error) {
    throw normalizeCloudProgressSyncError(error);
  }
}

export async function deleteCloudProgressForCurrentParent() {
  const user = authSnapshot.user;
  if (!user) {
    throw new CloudProgressSyncError(
      'notSignedIn',
      'A parent account must be signed in before deleting cloud data.',
    );
  }

  await saveParentSettings({
    cloudProgressSync: { enabled: false },
  }, { touchUpdatedAt: false });

  try {
    await deleteDoc(getCloudProgressReference(user.uid));
    await deleteDoc(getCloudParentSettingsReference(user.uid));
    await clearLocalSyncCheckpoint(user.uid);
  } catch (error) {
    throw normalizeCloudProgressSyncError(error);
  }
}

export async function clearLocalCloudProgressSyncData() {
  stopRemoteSync();
  pendingParentSettings = null;
  parentSettingsHandling = Promise.resolve();
  localSyncState = initialCloudProgressSyncState;
  localSyncStateReady = true;
  updateSyncSnapshot({
    consentOwnerUid: undefined,
    errorCode: undefined,
    hasStoredConsent: false,
    isEnabledForCurrentAccount: false,
    isReady: true,
    lastSyncedAt: undefined,
    status: 'disabled',
  });
  localSyncState = await clearAllCloudProgressSyncState();
}

export function retryCloudProgressSync() {
  if (!localSyncStateReady) {
    loadLocalSyncState();
    return;
  }

  if (!appIsActive) {
    return;
  }

  if (!activeUid) {
    reconcileSyncState();
    return;
  }

  const uid = activeUid;
  stopRemoteSync();
  requestRemoteSync(uid, { force: true });
}

export function getCloudProgressSyncErrorCode(error: unknown) {
  if (error instanceof CloudProgressSyncError) {
    return error.code;
  }

  const code = getErrorCode(error);
  if (code.includes('permission-denied')) {
    return 'permissionDenied';
  }

  if (
    code.includes('network-request-failed') ||
    code.includes('unavailable')
  ) {
    return 'networkUnavailable';
  }

  if (isFirebaseUnavailableError(error)) {
    return 'firebaseUnavailable';
  }

  return 'unknown';
}

function loadLocalSyncState() {
  if (localSyncStateLoading) {
    return;
  }

  localSyncStateLoading = true;
  getCloudProgressSyncState()
    .then(state => {
      localSyncState = state;
      localSyncStateReady = true;
      reconcileSyncState();
    })
    .catch(error => {
      updateSyncSnapshot({
        errorCode: getCloudProgressSyncErrorCode(error),
        isReady: true,
        status: 'error',
      });
    })
    .finally(() => {
      localSyncStateLoading = false;
    });
}

function handleAppStateChange(nextState: AppStateStatus) {
  if (nextState === 'background' && appIsActive) {
    appIsActive = false;
    flushSessionAndStopRemoteSync();
    return;
  }

  if (nextState === 'active' && !appIsActive) {
    appIsActive = true;
    shouldDelayNextRemoteStart = true;
    reconcileSyncState();
  }
}

function flushSessionAndStopRemoteSync() {
  const uid = activeUid;
  const generation = remoteGeneration;
  const hasPendingProgress = Boolean(pendingProgress);
  const hasWriteInFlight = flushingGeneration === generation;

  if (
    uid &&
    hasPendingProgress &&
    initializedGeneration === generation
  ) {
    flushCloudWrites(uid, generation);
  }

  stopRemoteSync();

  if (currentSettings?.cloudProgressSync.enabled) {
    updateSyncSnapshot({
      status:
        hasPendingProgress || hasWriteInFlight ? 'pending' : 'synced',
    });
  }
}

function reconcileSyncState() {
  if (!currentSettings || !authSnapshot.isReady || !localSyncStateReady) {
    updateSyncSnapshot({
      hasStoredConsent: Boolean(
        currentSettings?.cloudProgressSync.enabled,
      ),
      isEnabledForCurrentAccount: false,
      isReady: false,
      status: 'loading',
    });
    return;
  }

  const preference = currentSettings.cloudProgressSync;
  const hasStoredConsent = preference.enabled;
  const user = authSnapshot.user;

  if (!hasStoredConsent) {
    stopRemoteSync();
    updateSyncSnapshot({
      consentOwnerUid: undefined,
      errorCode: undefined,
      hasStoredConsent: false,
      isEnabledForCurrentAccount: false,
      isReady: true,
      status: 'disabled',
    });
    return;
  }

  if (!user) {
    stopRemoteSync();
    updateSyncSnapshot({
      consentOwnerUid: preference.ownerUid,
      errorCode: undefined,
      hasStoredConsent: true,
      isEnabledForCurrentAccount: false,
      isReady: true,
      status: 'waitingForSignIn',
    });
    return;
  }

  if (preference.ownerUid !== user.uid) {
    stopRemoteSync();
    updateSyncSnapshot({
      consentOwnerUid: preference.ownerUid,
      errorCode: 'accountMismatch',
      hasStoredConsent: true,
      isEnabledForCurrentAccount: false,
      isReady: true,
      status: 'accountMismatch',
    });
    return;
  }

  updateSyncSnapshot({
    consentOwnerUid: preference.ownerUid,
    hasStoredConsent: true,
    isEnabledForCurrentAccount: true,
    isReady: true,
    lastSyncedAt:
      localSyncState.ownerUid === user.uid
        ? localSyncState.lastSyncedAt
        : undefined,
  });

  if (!appIsActive) {
    stopRemoteSync();
    updateSyncSnapshot({
      status: hasConfirmedCheckpointForUid(user.uid)
        ? 'synced'
        : 'pending',
    });
    return;
  }

  if (activeUid !== user.uid) {
    const delayMs = shouldDelayNextRemoteStart
      ? CLOUD_PROGRESS_ACTIVE_SUBSCRIBE_DELAY_MS
      : 0;
    shouldDelayNextRemoteStart = false;
    requestRemoteSync(user.uid, { delayMs });
  }
}

function requestRemoteSync(
  uid: string,
  options: { delayMs?: number; force?: boolean } = {},
) {
  if (!appIsActive || !isConsentActiveForUid(uid)) {
    return;
  }

  if (activeUid === uid || remoteStartTimerUid === uid) {
    return;
  }

  if (!options.force) {
    const backoffUntil = getCloudSyncBackoffUntil(uid);
    if (backoffUntil && backoffUntil > Date.now()) {
      scheduleRemoteStartTimer(uid, backoffUntil - Date.now(), false);
      return;
    }

    const remoteReadCooldownUntil = getRemoteReadCooldownUntil(uid);
    if (
      remoteReadCooldownUntil &&
      remoteReadCooldownUntil > Date.now()
    ) {
      updateLocalDirtyStatus(uid);
      scheduleRemoteStartTimer(
        uid,
        remoteReadCooldownUntil - Date.now(),
        false,
      );
      return;
    }
  }

  const delayMs = options.delayMs ?? 0;
  if (delayMs <= 0) {
    startRemoteSync(uid);
    return;
  }

  updateSyncSnapshot({
    errorCode: undefined,
    isEnabledForCurrentAccount: true,
    status: 'connecting',
  });
  scheduleRemoteStartTimer(uid, delayMs, Boolean(options.force));
}

function scheduleRemoteStartTimer(
  uid: string,
  delayMs: number,
  force: boolean,
) {
  clearRemoteStartTimer();
  remoteStartTimerUid = uid;
  remoteStartTimer = setTimeout(() => {
    remoteStartTimer = null;
    remoteStartTimerUid = null;
    requestRemoteSync(uid, { force });
  }, delayMs);
}

function startRemoteSync(uid: string) {
  stopRemoteSync();

  const generation = remoteGeneration;
  activeUid = uid;
  remoteHandling = Promise.resolve();
  updateSyncSnapshot({
    errorCode: undefined,
    isEnabledForCurrentAccount: true,
    status: 'connecting',
  });

  try {
    const reference = getCloudProgressReference(uid);
    remoteUnsubscribe = onSnapshot(
      reference,
      { includeMetadataChanges: true },
      snapshot => {
        remoteHandling = remoteHandling
          .then(() => handleRemoteSnapshot(snapshot, uid, generation))
          .catch(error => {
            handleRemoteError(error, generation);
          });
      },
      error => {
        handleRemoteError(error, generation);
      },
    );
    parentSettingsHandling = parentSettingsHandling
      .then(() => syncRemoteParentSettings(uid, generation))
      .catch(error => {
        handleRemoteError(error, generation);
      });
  } catch (error) {
    handleRemoteError(error, generation);
  }
}

function stopRemoteSync() {
  clearRemoteStartTimer();
  remoteGeneration += 1;
  remoteUnsubscribe?.();
  remoteUnsubscribe = null;
  activeUid = null;
  pendingProgress = null;
  pendingParentSettings = null;
  initializedGeneration = null;
  remoteHandling = Promise.resolve();
  parentSettingsHandling = Promise.resolve();
}

function clearRemoteStartTimer() {
  if (remoteStartTimer) {
    clearTimeout(remoteStartTimer);
  }
  remoteStartTimer = null;
  remoteStartTimerUid = null;
}

async function handleRemoteSnapshot(
  snapshot: DocumentSnapshot,
  uid: string,
  generation: number,
) {
  if (!isActiveSync(uid, generation)) {
    return;
  }

  // A cache miss is not proof that another device has never created the document.
  if (
    initializedGeneration !== generation &&
    snapshot.metadata.fromCache
  ) {
    updateSyncSnapshot({
      errorCode: undefined,
      status: snapshot.metadata.hasPendingWrites ? 'pending' : 'connecting',
    });
    return;
  }

  const wasInitialized = initializedGeneration === generation;

  if (!snapshot.exists()) {
    initializedGeneration = generation;
    await markRemoteChecked(uid);
    const localProgress = await getProgress();
    if (!isActiveSync(uid, generation)) {
      return;
    }

    const progressToUpload = pendingProgress
      ? mergeProgressSnapshots(localProgress, pendingProgress)
      : localProgress;
    queueCloudWrite(progressToUpload, generation);
    if (!wasInitialized) {
      flushCloudWrites(uid, generation, {
        respectCooldown: hasConfirmedCheckpointForUid(uid),
      });
    }
    return;
  }

  const remoteProgress = parseCloudProgressDocument(snapshot.data(), uid);
  if (!remoteProgress) {
    throw new CloudProgressSyncError(
      'invalidRemoteData',
      'The cloud progress document has an unsupported schema.',
    );
  }

  await markRemoteChecked(uid);

  const mergedProgress = await updateProgressFromCloud(currentProgress => {
    if (!isActiveSync(uid, generation)) {
      return currentProgress;
    }

    const nextProgress = mergeProgressSnapshots(
      currentProgress,
      remoteProgress,
    );

    return areProgressSnapshotsEqual(currentProgress, nextProgress)
      ? currentProgress
      : nextProgress;
  });

  if (!isActiveSync(uid, generation)) {
    return;
  }

  initializedGeneration = generation;
  const progressToUpload = pendingProgress
    ? mergeProgressSnapshots(mergedProgress, pendingProgress)
    : mergedProgress;

  if (!haveSameCloudProgress(remoteProgress, progressToUpload)) {
    queueCloudWrite(progressToUpload, generation);
    if (!wasInitialized) {
      flushCloudWrites(uid, generation);
    }
    return;
  }

  pendingProgress = null;

  const hasPendingWrites = snapshot.metadata.hasPendingWrites;
  const serverSyncedAt = getServerTimestampIso(
    snapshot.data()?.serverUpdatedAt,
  );
  if (!hasPendingWrites) {
    await markLocalSyncCheckpoint(
      uid,
      progressToUpload,
      serverSyncedAt ?? new Date().toISOString(),
    );
    if (pendingProgress && !isProgressDirty(uid, pendingProgress)) {
      pendingProgress = null;
    }
  }

  if (!isActiveSync(uid, generation)) {
    return;
  }

  updateSyncSnapshot({
    errorCode: undefined,
    lastSyncedAt: serverSyncedAt ?? syncSnapshot.lastSyncedAt,
    status: hasPendingWrites || pendingProgress ? 'pending' : 'synced',
  });
}

async function syncRemoteParentSettings(uid: string, generation: number) {
  if (!isActiveSync(uid, generation)) {
    return;
  }

  const initialLocalSettings =
    currentSettings ?? (await getParentSettings());
  if (!isActiveSync(uid, generation)) {
    return;
  }

  const snapshot = await getDoc(getCloudParentSettingsReference(uid));
  if (!isActiveSync(uid, generation)) {
    return;
  }

  if (!snapshot.exists()) {
    await writeCloudParentSettings(uid, initialLocalSettings);
    const cloudSettings = toCloudParentSettingsData(initialLocalSettings);
    const lastSyncedAt = new Date().toISOString();
    await markParentSettingsSyncCheckpoint(
      uid,
      cloudSettings,
      lastSyncedAt,
    );
    updateParentSettingsSyncStatus(uid, generation, lastSyncedAt);
    return;
  }

  const remoteSettings = parseCloudParentSettingsDocument(
    snapshot.data(),
    uid,
  );
  if (!remoteSettings) {
    throw new CloudProgressSyncError(
      'invalidRemoteData',
      'The cloud parent settings document has an unsupported schema.',
    );
  }

  const latestLocalSettings = currentSettings ?? (await getParentSettings());
  if (!isActiveSync(uid, generation)) {
    return;
  }

  const localSettings = toCloudParentSettingsData(latestLocalSettings);
  const hasCheckpoint = hasConfirmedParentSettingsCheckpointForUid(uid);
  const settingsAreEqual = areCloudParentSettingsEqual(
    localSettings,
    remoteSettings,
  );

  if (!hasCheckpoint) {
    const cloudSettings = settingsAreEqual
      ? localSettings
      : toCloudParentSettingsData(
          await applyCloudParentSettings(remoteSettings),
        );
    const serverSyncedAt =
      getServerTimestampIso(snapshot.data()?.serverUpdatedAt) ??
      new Date().toISOString();
    await markParentSettingsSyncCheckpoint(
      uid,
      cloudSettings,
      serverSyncedAt,
    );
    updateParentSettingsSyncStatus(uid, generation, serverSyncedAt);
    return;
  }

  if (settingsAreEqual) {
    const lastSyncedAt =
      getServerTimestampIso(snapshot.data()?.serverUpdatedAt) ??
      new Date().toISOString();
    await markParentSettingsSyncCheckpoint(
      uid,
      localSettings,
      lastSyncedAt,
    );
    updateParentSettingsSyncStatus(uid, generation, lastSyncedAt);
    return;
  }

  const remoteUpdatedAtMs =
    getCloudParentSettingsUpdatedAtMs(remoteSettings);
  const localUpdatedAtMs = getCloudParentSettingsUpdatedAtMs(localSettings);

  if (remoteUpdatedAtMs > localUpdatedAtMs) {
    const appliedSettings = await applyCloudParentSettings(remoteSettings);
    const cloudSettings = toCloudParentSettingsData(appliedSettings);
    const serverSyncedAt =
      getServerTimestampIso(snapshot.data()?.serverUpdatedAt) ??
      new Date().toISOString();
    await markParentSettingsSyncCheckpoint(
      uid,
      cloudSettings,
      serverSyncedAt,
    );
    updateParentSettingsSyncStatus(uid, generation, serverSyncedAt);
    return;
  }

  await writeCloudParentSettings(uid, latestLocalSettings);
  const lastSyncedAt = new Date().toISOString();
  await markParentSettingsSyncCheckpoint(uid, localSettings, lastSyncedAt);
  updateParentSettingsSyncStatus(uid, generation, lastSyncedAt);
}

function requestParentSettingsWrite(
  uid: string,
  settings: ParentSettings,
  generation: number,
) {
  if (
    !isActiveSync(uid, generation) ||
    !isConsentActiveForUid(uid) ||
    !isParentSettingsDirty(uid, settings)
  ) {
    return;
  }

  pendingParentSettings = settings;
  updateSyncSnapshot({ errorCode: undefined, status: 'pending' });

  if (parentSettingsWriting) {
    return;
  }

  parentSettingsHandling = parentSettingsHandling
    .then(() => flushPendingParentSettingsWrites(uid, generation))
    .catch(error => {
      handleRemoteError(error, generation);
    });
}

async function flushPendingParentSettingsWrites(
  uid: string,
  generation: number,
) {
  if (parentSettingsWriting) {
    return;
  }

  parentSettingsWriting = true;

  try {
    while (pendingParentSettings && isActiveSync(uid, generation)) {
      const settingsToWrite = pendingParentSettings;
      pendingParentSettings = null;

      if (!isParentSettingsDirty(uid, settingsToWrite)) {
        continue;
      }

      updateSyncSnapshot({ errorCode: undefined, status: 'syncing' });
      await writeCloudParentSettings(uid, settingsToWrite);

      const cloudSettings = toCloudParentSettingsData(settingsToWrite);
      const lastSyncedAt = new Date().toISOString();
      await markParentSettingsSyncCheckpoint(
        uid,
        cloudSettings,
        lastSyncedAt,
      );
      updateParentSettingsSyncStatus(uid, generation, lastSyncedAt);
    }
  } finally {
    parentSettingsWriting = false;
  }
}

async function applyCloudParentSettings(
  settings: CloudParentSettingsData,
) {
  isApplyingCloudParentSettings = true;
  try {
    const nextSettings = await saveParentSettingsFromCloud({
      ...settings,
      visibleLessonIds: settings.visibleLessonIds,
    });
    currentSettings = nextSettings;
    return nextSettings;
  } finally {
    isApplyingCloudParentSettings = false;
  }
}

async function writeCloudParentSettings(
  uid: string,
  settings: ParentSettings,
) {
  const preference = getActivePreference(uid);
  await setDoc(getCloudParentSettingsReference(uid), {
    consentedAt: new Date(preference.consentedAt ?? Date.now()),
    consentVersion: CLOUD_PROGRESS_SYNC_CONSENT_VERSION,
    ownerUid: uid,
    schemaVersion: CLOUD_PARENT_SETTINGS_SCHEMA_VERSION,
    serverUpdatedAt: serverTimestamp(),
    settings: toCloudParentSettingsData(settings),
  });
}

function updateParentSettingsSyncStatus(
  uid: string,
  generation: number,
  lastSyncedAt: string,
) {
  if (!isActiveSync(uid, generation)) {
    return;
  }

  updateSyncSnapshot({
    errorCode: undefined,
    lastSyncedAt,
    status:
      pendingProgress || pendingParentSettings
        ? 'pending'
        : initializedGeneration === generation
          ? 'synced'
          : 'connecting',
  });
}

function queueCloudWrite(progress: LocalProgress, generation: number) {
  if (!activeUid || generation !== remoteGeneration) {
    return;
  }

  pendingProgress = pendingProgress
    ? mergeProgressSnapshots(pendingProgress, progress)
    : progress;
  updateSyncSnapshot({ errorCode: undefined, status: 'pending' });
}

function updatePendingLocalProgress(
  uid: string,
  progress: LocalProgress,
  generation: number,
) {
  if (activeUid !== uid || generation !== remoteGeneration) {
    return;
  }

  const nextPendingProgress = pendingProgress
    ? mergeProgressSnapshots(pendingProgress, progress)
    : progress;

  if (!isProgressDirty(uid, nextPendingProgress)) {
    pendingProgress = null;
    if (flushingGeneration !== generation) {
      updateSyncSnapshot({ errorCode: undefined, status: 'synced' });
    }
    return;
  }

  pendingProgress = nextPendingProgress;
  updateSyncSnapshot({ errorCode: undefined, status: 'pending' });
}

async function flushCloudWrites(
  uid: string,
  generation: number,
  options: { respectCooldown?: boolean } = {},
) {
  if (
    flushingGeneration === generation ||
    !pendingProgress ||
    !isActiveSync(uid, generation)
  ) {
    return;
  }

  if (isAutomaticSyncBackedOff(uid)) {
    updateSyncSnapshot({ status: 'pending' });
    return;
  }

  if (
    options.respectCooldown !== false &&
    getBackgroundWriteCooldownRemainingMs(uid) > 0
  ) {
    updateSyncSnapshot({ status: 'pending' });
    return;
  }

  flushingGeneration = generation;
  const progress = pendingProgress;
  pendingProgress = null;
  let writeCompleted = false;

  try {
    const preference = getActivePreference(uid);
    updateSyncSnapshot({ errorCode: undefined, status: 'syncing' });
    await markCloudWriteAttempted(uid);

    await setDoc(getCloudProgressReference(uid), {
      consentedAt: new Date(preference.consentedAt ?? Date.now()),
      consentVersion: CLOUD_PROGRESS_SYNC_CONSENT_VERSION,
      ownerUid: uid,
      progress: toCloudProgressData(progress),
      schemaVersion: CLOUD_PROGRESS_SCHEMA_VERSION,
      serverUpdatedAt: serverTimestamp(),
    });
    writeCompleted = true;

    const lastSyncedAt = new Date().toISOString();
    if (isConsentActiveForUid(uid)) {
      await markLocalSyncCheckpoint(uid, progress, lastSyncedAt);
      await clearCloudSyncBackoff(uid);
    }

    if (isActiveSync(uid, generation)) {
      updateSyncSnapshot({
        errorCode: undefined,
        lastSyncedAt,
        status: pendingProgress ? 'pending' : 'synced',
      });
    }
  } catch (error) {
    if (isActiveSync(uid, generation)) {
      if (!writeCompleted) {
        pendingProgress = pendingProgress
          ? mergeProgressSnapshots(progress, pendingProgress)
          : progress;
      }
      handleRemoteError(error, generation);
    }
  } finally {
    if (flushingGeneration === generation) {
      flushingGeneration = null;
    }
  }
}

function haveSameCloudProgress(
  first: LocalProgress,
  second: LocalProgress,
) {
  return (
    getCloudProgressFingerprint(first) ===
    getCloudProgressFingerprint(second)
  );
}

function isProgressDirty(uid: string, progress: LocalProgress) {
  return (
    !hasConfirmedCheckpointForUid(uid) ||
    localSyncState.lastSyncedFingerprint !==
      getCloudProgressFingerprint(progress)
  );
}

function isParentSettingsDirty(uid: string, settings: ParentSettings) {
  return (
    !hasConfirmedParentSettingsCheckpointForUid(uid) ||
    localSyncState.lastSyncedSettingsFingerprint !==
      getCloudParentSettingsFingerprint(
        toCloudParentSettingsData(settings),
      )
  );
}

function hasConfirmedCheckpointForUid(uid: string) {
  return Boolean(
    localSyncState.ownerUid === uid &&
      localSyncState.lastSyncedFingerprint,
  );
}

function hasConfirmedParentSettingsCheckpointForUid(uid: string) {
  return Boolean(
    localSyncState.ownerUid === uid &&
      localSyncState.lastSyncedSettingsFingerprint,
  );
}

function getCloudSyncBackoffUntil(uid: string) {
  if (localSyncState.ownerUid !== uid) {
    return null;
  }

  const retryAt = getTimestampMs(localSyncState.nextRetryAt);
  return retryAt;
}

function getRemoteReadCooldownUntil(uid: string) {
  if (localSyncState.ownerUid !== uid) {
    return null;
  }

  if (!hasConfirmedCheckpointForUid(uid)) {
    return null;
  }

  const lastRemoteCheckedAt = getTimestampMs(
    localSyncState.lastRemoteCheckedAt,
  );
  if (!lastRemoteCheckedAt) {
    return null;
  }

  return lastRemoteCheckedAt + CLOUD_PROGRESS_REMOTE_READ_COOLDOWN_MS;
}

function isAutomaticSyncBackedOff(uid: string) {
  if (localSyncState.ownerUid !== uid) {
    return false;
  }

  const nextRetryAt = getTimestampMs(localSyncState.nextRetryAt);
  return Boolean(nextRetryAt && nextRetryAt > Date.now());
}

function getBackgroundWriteCooldownRemainingMs(uid: string) {
  if (localSyncState.ownerUid !== uid) {
    return 0;
  }

  const lastWriteAttemptedAt = getTimestampMs(
    localSyncState.lastWriteAttemptedAt,
  );
  if (!lastWriteAttemptedAt) {
    return 0;
  }

  return Math.max(
    0,
    lastWriteAttemptedAt +
      CLOUD_PROGRESS_BACKGROUND_WRITE_COOLDOWN_MS -
      Date.now(),
  );
}

async function updateLocalDirtyStatus(uid: string) {
  try {
    const localProgress = await getProgress();
    if (
      appIsActive &&
      activeUid !== uid &&
      remoteStartTimerUid !== uid &&
      isConsentActiveForUid(uid)
    ) {
      updateSyncSnapshot({
        status: isProgressDirty(uid, localProgress)
          ? 'pending'
          : 'synced',
      });
    }
  } catch (error) {
    updateSyncSnapshot({
      errorCode: getCloudProgressSyncErrorCode(error),
      status: 'error',
    });
  }
}

function isConsentActiveForUid(uid: string) {
  const preference = currentSettings?.cloudProgressSync;
  return Boolean(preference?.enabled && preference.ownerUid === uid);
}

async function saveLocalSyncState(nextState: CloudProgressSyncState) {
  const savedState = await saveCloudProgressSyncState(nextState);
  if (
    !savedState.ownerUid ||
    savedState.ownerUid === currentSettings?.cloudProgressSync.ownerUid
  ) {
    localSyncState = savedState;
  }
  return savedState;
}

async function markLocalSyncCheckpoint(
  uid: string,
  progress: LocalProgress,
  lastSyncedAt: string,
) {
  if (!isConsentActiveForUid(uid)) {
    return;
  }

  const savedState = await saveLocalSyncState({
    ...getStateForUid(uid),
    lastSyncedAt,
    lastSyncedFingerprint: getCloudProgressFingerprint(progress),
    ownerUid: uid,
  });

  if (isConsentActiveForUid(uid)) {
    localSyncState = savedState;
  }
}

async function markParentSettingsSyncCheckpoint(
  uid: string,
  settings: CloudParentSettingsData,
  lastSyncedAt: string,
) {
  if (!isConsentActiveForUid(uid)) {
    return;
  }

  const savedState = await saveLocalSyncState({
    ...getStateForUid(uid),
    lastSyncedAt,
    lastSyncedSettingsFingerprint:
      getCloudParentSettingsFingerprint(settings),
    lastSyncedSettingsUpdatedAt: settings.updatedAt,
    ownerUid: uid,
  });

  if (isConsentActiveForUid(uid)) {
    localSyncState = savedState;
  }
}

async function markRemoteChecked(uid: string) {
  await saveLocalSyncState({
    ...getStateForUid(uid),
    failureCount: undefined,
    lastRemoteCheckedAt: new Date().toISOString(),
    nextRetryAt: undefined,
    ownerUid: uid,
  });
}

async function markCloudWriteAttempted(uid: string) {
  await saveLocalSyncState({
    ...getStateForUid(uid),
    lastWriteAttemptedAt: new Date().toISOString(),
    ownerUid: uid,
  });
}

async function clearCloudSyncBackoff(uid: string) {
  await saveLocalSyncState({
    ...getStateForUid(uid),
    failureCount: undefined,
    nextRetryAt: undefined,
    ownerUid: uid,
  });
}

function markCloudSyncFailure(uid: string) {
  const failureCount = Math.min(
    (localSyncState.ownerUid === uid
      ? localSyncState.failureCount ?? 0
      : 0) + 1,
    10,
  );
  const delayMs = Math.min(
    CLOUD_PROGRESS_INITIAL_BACKOFF_MS * 2 ** (failureCount - 1),
    CLOUD_PROGRESS_MAX_BACKOFF_MS,
  );

  saveLocalSyncState({
    ...getStateForUid(uid),
    failureCount,
    nextRetryAt: new Date(Date.now() + delayMs).toISOString(),
    ownerUid: uid,
  }).catch(() => {
    // The user-visible sync error is already emitted by the caller.
  });
}

function getStateForUid(uid: string): CloudProgressSyncState {
  return localSyncState.ownerUid === uid ? localSyncState : {};
}

async function clearLocalSyncCheckpoint(uid: string) {
  const nextState = await clearCloudProgressSyncState(uid);
  if (localSyncState.ownerUid === uid) {
    localSyncState = nextState;
  }
}

function getActivePreference(uid: string): CloudProgressSyncPreference {
  const preference = currentSettings?.cloudProgressSync;
  if (
    !preference?.enabled ||
    preference.ownerUid !== uid ||
    !preference.consentedAt
  ) {
    throw new CloudProgressSyncError(
      'accountMismatch',
      'Cloud sync consent is no longer active for this account.',
    );
  }

  return preference;
}

function getCloudProgressReference(uid: string) {
  if (getApps().length === 0) {
    throw new CloudProgressSyncError(
      'firebaseUnavailable',
      'Firebase native configuration is missing.',
    );
  }

  return doc(
    getFirestore(),
    'users',
    uid,
    'progress',
    CLOUD_PROGRESS_DOCUMENT_ID,
  );
}

function getCloudParentSettingsReference(uid: string) {
  if (getApps().length === 0) {
    throw new CloudProgressSyncError(
      'firebaseUnavailable',
      'Firebase native configuration is missing.',
    );
  }

  return doc(
    getFirestore(),
    'users',
    uid,
    'settings',
    CLOUD_PARENT_SETTINGS_DOCUMENT_ID,
  );
}

function parseCloudProgressDocument(value: unknown, uid: string) {
  if (!isRecord(value)) {
    return null;
  }

  if (
    value.schemaVersion !== CLOUD_PROGRESS_SCHEMA_VERSION ||
    value.consentVersion !== CLOUD_PROGRESS_SYNC_CONSENT_VERSION ||
    value.ownerUid !== uid ||
    !isRecord(value.progress)
  ) {
    return null;
  }

  return normalizeProgress(value.progress);
}

function parseCloudParentSettingsDocument(value: unknown, uid: string) {
  if (!isRecord(value)) {
    return null;
  }

  if (
    value.schemaVersion !== CLOUD_PARENT_SETTINGS_SCHEMA_VERSION ||
    value.consentVersion !== CLOUD_PROGRESS_SYNC_CONSENT_VERSION ||
    value.ownerUid !== uid ||
    !isRecord(value.settings)
  ) {
    return null;
  }

  return parseCloudParentSettingsData(value.settings);
}

function handleRemoteError(error: unknown, generation: number) {
  if (generation !== remoteGeneration) {
    return;
  }

  if (activeUid) {
    markCloudSyncFailure(activeUid);
  }

  updateSyncSnapshot({
    errorCode: getCloudProgressSyncErrorCode(error),
    isReady: true,
    status: 'error',
  });
}

function updateSyncSnapshot(
  next: Partial<CloudProgressSyncSnapshot>,
) {
  syncSnapshot = { ...syncSnapshot, ...next };

  for (const listener of syncListeners) {
    try {
      listener(syncSnapshot);
    } catch {
      // UI subscribers must not break the sync engine.
    }
  }
}

function isActiveSync(uid: string, generation: number) {
  return activeUid === uid && remoteGeneration === generation;
}

function getServerTimestampIso(value: unknown) {
  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof value.toDate === 'function'
  ) {
    const date = value.toDate();
    return date instanceof Date ? date.toISOString() : undefined;
  }

  return undefined;
}

function getTimestampMs(value: string | undefined) {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function getErrorCode(error: unknown) {
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return error.code.toLowerCase();
  }

  return '';
}

function isFirebaseUnavailableError(error: unknown) {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error);

  return (
    message.includes('no firebase app') ||
    message.includes('firebase app') && message.includes('initialize')
  );
}

function normalizeCloudProgressSyncError(error: unknown) {
  if (error instanceof CloudProgressSyncError) {
    return error;
  }

  return new CloudProgressSyncError(
    getCloudProgressSyncErrorCode(error),
    error instanceof Error ? error.message : 'Cloud progress sync failed.',
    error,
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
