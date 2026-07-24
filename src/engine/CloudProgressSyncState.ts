import AsyncStorage from '@react-native-async-storage/async-storage';

const CLOUD_PROGRESS_SYNC_STATE_STORAGE_KEY =
  '@skidsenglish/cloud-progress-sync-state/v1';

export type CloudProgressSyncState = {
  failureCount?: number;
  lastRemoteCheckedAt?: string;
  lastSyncedAt?: string;
  lastSyncedFingerprint?: string;
  lastSyncedSettingsFingerprint?: string;
  lastSyncedSettingsUpdatedAt?: string;
  lastWriteAttemptedAt?: string;
  nextRetryAt?: string;
  ownerUid?: string;
};

export const initialCloudProgressSyncState: CloudProgressSyncState = {};

export async function getCloudProgressSyncState() {
  const rawState = await AsyncStorage.getItem(
    CLOUD_PROGRESS_SYNC_STATE_STORAGE_KEY,
  );

  if (!rawState) {
    return initialCloudProgressSyncState;
  }

  return normalizeCloudProgressSyncState(JSON.parse(rawState));
}

export async function saveCloudProgressSyncState(
  state: CloudProgressSyncState,
) {
  const normalized = normalizeCloudProgressSyncState(state);
  await AsyncStorage.setItem(
    CLOUD_PROGRESS_SYNC_STATE_STORAGE_KEY,
    JSON.stringify(normalized),
  );
  return normalized;
}

export async function clearCloudProgressSyncState(ownerUid: string) {
  const currentState = await getCloudProgressSyncState();
  if (currentState.ownerUid !== ownerUid) {
    return currentState;
  }

  await AsyncStorage.removeItem(CLOUD_PROGRESS_SYNC_STATE_STORAGE_KEY);
  return initialCloudProgressSyncState;
}

export async function clearAllCloudProgressSyncState() {
  await AsyncStorage.removeItem(CLOUD_PROGRESS_SYNC_STATE_STORAGE_KEY);
  return initialCloudProgressSyncState;
}

function normalizeCloudProgressSyncState(
  value: unknown,
): CloudProgressSyncState {
  if (!isRecord(value)) {
    return initialCloudProgressSyncState;
  }

  const ownerUid = normalizeNonEmptyString(value.ownerUid);
  const failureCount = normalizeFailureCount(value.failureCount);
  const lastRemoteCheckedAt = normalizeIsoTimestamp(
    value.lastRemoteCheckedAt,
  );
  const lastSyncedAt = normalizeIsoTimestamp(value.lastSyncedAt);
  const lastSyncedFingerprint = normalizeNonEmptyString(
    value.lastSyncedFingerprint,
  );
  const lastSyncedSettingsFingerprint = normalizeNonEmptyString(
    value.lastSyncedSettingsFingerprint,
  );
  const lastSyncedSettingsUpdatedAt = normalizeIsoTimestamp(
    value.lastSyncedSettingsUpdatedAt,
  );
  const lastWriteAttemptedAt = normalizeIsoTimestamp(
    value.lastWriteAttemptedAt,
  );
  const nextRetryAt = normalizeIsoTimestamp(value.nextRetryAt);

  if (!ownerUid) {
    return initialCloudProgressSyncState;
  }

  return {
    ...(failureCount ? { failureCount } : {}),
    ...(lastRemoteCheckedAt ? { lastRemoteCheckedAt } : {}),
    ...(lastSyncedAt ? { lastSyncedAt } : {}),
    ...(lastSyncedFingerprint ? { lastSyncedFingerprint } : {}),
    ...(lastSyncedSettingsFingerprint
      ? { lastSyncedSettingsFingerprint }
      : {}),
    ...(lastSyncedSettingsUpdatedAt
      ? { lastSyncedSettingsUpdatedAt }
      : {}),
    ...(lastWriteAttemptedAt ? { lastWriteAttemptedAt } : {}),
    ...(nextRetryAt ? { nextRetryAt } : {}),
    ownerUid,
  };
}

function normalizeNonEmptyString(value: unknown) {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function normalizeIsoTimestamp(value: unknown) {
  return typeof value === 'string' &&
    !Number.isNaN(new Date(value).getTime())
    ? value
    : undefined;
}

function normalizeFailureCount(value: unknown) {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
    ? Math.min(value, 10)
    : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
