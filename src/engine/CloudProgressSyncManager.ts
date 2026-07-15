import { getApps } from '@react-native-firebase/app';
import {
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type DocumentSnapshot,
} from '@react-native-firebase/firestore';

import {
  CLOUD_PROGRESS_DOCUMENT_ID,
  CLOUD_PROGRESS_SCHEMA_VERSION,
  CLOUD_PROGRESS_SYNC_CONSENT_VERSION,
} from '../config/cloudProgressSync';
import {
  areProgressSnapshotsEqual,
  mergeProgressSnapshots,
  toCloudProgressData,
} from './CloudProgressMerge';
import {
  getParentSettings,
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
  saveProgressFromCloud,
  subscribeProgress,
  type LocalProgress,
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

const syncListeners = new Set<SyncListener>();

let authSnapshot: ParentAuthSnapshot = initialParentAuthSnapshot;
let currentSettings: ParentSettings | null = null;
let remoteUnsubscribe: (() => void) | null = null;
let activeUid: string | null = null;
let pendingProgress: LocalProgress | null = null;
let remoteGeneration = 0;
let initializedGeneration: number | null = null;
let flushingGeneration: number | null = null;
let remoteHandling = Promise.resolve();
let started = false;
let syncSnapshot = initialCloudProgressSyncSnapshot;

export function startCloudProgressSync() {
  if (started) {
    return;
  }

  started = true;

  subscribeParentAuth(nextAuthSnapshot => {
    authSnapshot = nextAuthSnapshot;
    reconcileSyncState();
  });

  subscribeParentSettings(settings => {
    currentSettings = settings;
    reconcileSyncState();
  });

  subscribeProgress(change => {
    if (change.source === 'local' && activeUid) {
      enqueueCloudWrite(change.progress, remoteGeneration);
    }
  });

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
  });
}

export async function disableCloudProgressSync() {
  await saveParentSettings({
    cloudProgressSync: { enabled: false },
  });
}

export async function disableAndDeleteCloudProgress() {
  const user = authSnapshot.user;
  if (!user) {
    throw new CloudProgressSyncError(
      'notSignedIn',
      'A parent account must be signed in before deleting cloud progress.',
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
  } catch (error) {
    throw normalizeCloudProgressSyncError(error);
  }
}

export async function deleteCloudProgressForCurrentParent() {
  const user = authSnapshot.user;
  if (!user) {
    throw new CloudProgressSyncError(
      'notSignedIn',
      'A parent account must be signed in before deleting cloud progress.',
    );
  }

  await saveParentSettings({
    cloudProgressSync: { enabled: false },
  });

  try {
    await deleteDoc(getCloudProgressReference(user.uid));
  } catch (error) {
    throw normalizeCloudProgressSyncError(error);
  }
}

export function retryCloudProgressSync() {
  if (!activeUid) {
    reconcileSyncState();
    return;
  }

  const uid = activeUid;
  stopRemoteSync();
  startRemoteSync(uid);
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

function reconcileSyncState() {
  if (!currentSettings || !authSnapshot.isReady) {
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
  });

  if (activeUid !== user.uid) {
    startRemoteSync(user.uid);
  }
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
  } catch (error) {
    handleRemoteError(error, generation);
  }
}

function stopRemoteSync() {
  remoteGeneration += 1;
  remoteUnsubscribe?.();
  remoteUnsubscribe = null;
  activeUid = null;
  pendingProgress = null;
  initializedGeneration = null;
  remoteHandling = Promise.resolve();
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

  if (!snapshot.exists()) {
    initializedGeneration = generation;
    const localProgress = await getProgress();
    enqueueCloudWrite(localProgress, generation);
    return;
  }

  const remoteProgress = parseCloudProgressDocument(snapshot.data(), uid);
  if (!remoteProgress) {
    throw new CloudProgressSyncError(
      'invalidRemoteData',
      'The cloud progress document has an unsupported schema.',
    );
  }

  const localProgress = await getProgress();
  if (!isActiveSync(uid, generation)) {
    return;
  }

  let mergedProgress = mergeProgressSnapshots(
    localProgress,
    remoteProgress,
  );

  if (!areProgressSnapshotsEqual(localProgress, mergedProgress)) {
    mergedProgress = await saveProgressFromCloud(mergedProgress);
  }

  if (!isActiveSync(uid, generation)) {
    return;
  }

  initializedGeneration = generation;
  const progressToUpload = pendingProgress
    ? mergeProgressSnapshots(mergedProgress, pendingProgress)
    : mergedProgress;

  if (!areProgressSnapshotsEqual(remoteProgress, progressToUpload)) {
    enqueueCloudWrite(progressToUpload, generation);
    return;
  }

  pendingProgress = null;

  const hasPendingWrites = snapshot.metadata.hasPendingWrites;
  updateSyncSnapshot({
    errorCode: undefined,
    lastSyncedAt:
      getServerTimestampIso(snapshot.data()?.serverUpdatedAt) ??
      syncSnapshot.lastSyncedAt,
    status: hasPendingWrites ? 'pending' : 'synced',
  });
}

function enqueueCloudWrite(progress: LocalProgress, generation: number) {
  if (!activeUid || generation !== remoteGeneration) {
    return;
  }

  pendingProgress = pendingProgress
    ? mergeProgressSnapshots(pendingProgress, progress)
    : progress;
  if (initializedGeneration === generation) {
    flushCloudWrites(activeUid, generation);
  }
}

async function flushCloudWrites(uid: string, generation: number) {
  if (flushingGeneration === generation) {
    return;
  }

  flushingGeneration = generation;

  try {
    while (pendingProgress && isActiveSync(uid, generation)) {
      const progress = pendingProgress;
      pendingProgress = null;
      const preference = getActivePreference(uid);

      updateSyncSnapshot({ errorCode: undefined, status: 'syncing' });

      await setDoc(getCloudProgressReference(uid), {
        consentedAt: new Date(preference.consentedAt ?? Date.now()),
        consentVersion: CLOUD_PROGRESS_SYNC_CONSENT_VERSION,
        ownerUid: uid,
        progress: toCloudProgressData(progress),
        schemaVersion: CLOUD_PROGRESS_SCHEMA_VERSION,
        serverUpdatedAt: serverTimestamp(),
      });

      if (isActiveSync(uid, generation)) {
        updateSyncSnapshot({
          errorCode: undefined,
          lastSyncedAt: new Date().toISOString(),
          status: 'synced',
        });
      }
    }
  } catch (error) {
    if (isActiveSync(uid, generation)) {
      handleRemoteError(error, generation);
    }
  } finally {
    if (flushingGeneration === generation) {
      flushingGeneration = null;
    }
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

function handleRemoteError(error: unknown, generation: number) {
  if (generation !== remoteGeneration) {
    return;
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
