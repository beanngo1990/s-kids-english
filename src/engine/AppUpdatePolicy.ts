export type AppUpdatePlatform = 'android' | 'ios';
export type AppUpdateStatus = 'none' | 'optional' | 'required';

export type AppUpdatePolicy = Readonly<
  | {
      enabled: false;
      schemaVersion: 1;
    }
  | {
      enabled: true;
      latestVersion: string;
      minimumSupportedVersion: string;
      schemaVersion: 1;
      storeUrl: string;
    }
>;

export type OptionalUpdateDismissal = Readonly<{
  dismissedAt: string;
  latestVersion: string;
}>;

export type AppUpdateDecision = Readonly<{
  latestVersion?: string;
  minimumSupportedVersion?: string;
  status: AppUpdateStatus;
  storeUrl?: string;
}>;

type VersionParts = readonly [number, number, number];

const versionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)(?:\.(0|[1-9]\d*))?$/;

export function parseAppVersion(version: string): VersionParts | null {
  const match = versionPattern.exec(version.trim());
  if (!match) {
    return null;
  }

  const parts = [
    Number(match[1]),
    Number(match[2]),
    Number(match[3] ?? 0),
  ] as const;

  return parts.every(Number.isSafeInteger) ? parts : null;
}

export function compareAppVersions(first: string, second: string) {
  const firstParts = parseAppVersion(first);
  const secondParts = parseAppVersion(second);
  if (!firstParts || !secondParts) {
    return null;
  }

  for (let index = 0; index < firstParts.length; index += 1) {
    if (firstParts[index] < secondParts[index]) {
      return -1;
    }
    if (firstParts[index] > secondParts[index]) {
      return 1;
    }
  }

  return 0;
}

export function parseAppUpdatePolicy(
  rawPolicy: string,
  platform: AppUpdatePlatform,
): AppUpdatePolicy | null {
  let value: unknown;
  try {
    value = JSON.parse(rawPolicy);
  } catch {
    return null;
  }

  if (!isRecord(value) || value.schemaVersion !== 1) {
    return null;
  }

  if (value.enabled === false) {
    return { enabled: false, schemaVersion: 1 };
  }

  if (value.enabled !== true) {
    return null;
  }

  const minimumSupportedVersion = readNonEmptyString(
    value.minimumSupportedVersion,
  );
  const latestVersion = readNonEmptyString(value.latestVersion);
  const storeUrls = value.storeUrls;
  const storeUrl = isRecord(storeUrls)
    ? readNonEmptyString(storeUrls[platform])
    : null;

  if (
    !minimumSupportedVersion ||
    !latestVersion ||
    !storeUrl ||
    !parseAppVersion(minimumSupportedVersion) ||
    !parseAppVersion(latestVersion) ||
    compareAppVersions(minimumSupportedVersion, latestVersion) === 1 ||
    !isAllowedStoreUrl(storeUrl, platform)
  ) {
    return null;
  }

  return {
    enabled: true,
    latestVersion,
    minimumSupportedVersion,
    schemaVersion: 1,
    storeUrl,
  };
}

export function evaluateAppUpdatePolicy({
  currentVersion,
  dismissal,
  now,
  optionalReminderDelayMs,
  policy,
}: {
  currentVersion: string;
  dismissal: OptionalUpdateDismissal | null;
  now: number;
  optionalReminderDelayMs: number;
  policy: AppUpdatePolicy;
}): AppUpdateDecision | null {
  if (!parseAppVersion(currentVersion)) {
    return null;
  }

  if (!policy.enabled) {
    return { status: 'none' };
  }

  const minimumComparison = compareAppVersions(
    currentVersion,
    policy.minimumSupportedVersion,
  );
  const latestComparison = compareAppVersions(
    currentVersion,
    policy.latestVersion,
  );

  if (minimumComparison === null || latestComparison === null) {
    return null;
  }

  const policyDetails = {
    latestVersion: policy.latestVersion,
    minimumSupportedVersion: policy.minimumSupportedVersion,
    storeUrl: policy.storeUrl,
  };

  if (minimumComparison < 0) {
    return { ...policyDetails, status: 'required' };
  }

  if (latestComparison >= 0) {
    return { ...policyDetails, status: 'none' };
  }

  if (
    dismissal?.latestVersion === policy.latestVersion &&
    isRecentDismissal(dismissal.dismissedAt, now, optionalReminderDelayMs)
  ) {
    return { ...policyDetails, status: 'none' };
  }

  return { ...policyDetails, status: 'optional' };
}

export function parseOptionalUpdateDismissal(
  rawValue: string | null,
): OptionalUpdateDismissal | null {
  if (!rawValue) {
    return null;
  }

  try {
    const value: unknown = JSON.parse(rawValue);
    if (!isRecord(value)) {
      return null;
    }

    const dismissedAt = readNonEmptyString(value.dismissedAt);
    const latestVersion = readNonEmptyString(value.latestVersion);
    if (
      !dismissedAt ||
      !latestVersion ||
      !parseAppVersion(latestVersion) ||
      !Number.isFinite(Date.parse(dismissedAt))
    ) {
      return null;
    }

    return { dismissedAt, latestVersion };
  } catch {
    return null;
  }
}

function isRecentDismissal(
  dismissedAt: string,
  now: number,
  reminderDelayMs: number,
) {
  const dismissedAtTime = Date.parse(dismissedAt);
  return (
    Number.isFinite(dismissedAtTime) &&
    dismissedAtTime <= now &&
    now - dismissedAtTime < reminderDelayMs
  );
}

function isAllowedStoreUrl(url: string, platform: AppUpdatePlatform) {
  const normalizedUrl = url.toLowerCase();
  if (platform === 'android') {
    return (
      normalizedUrl.startsWith('https://play.google.com/store/apps/details?') ||
      normalizedUrl.startsWith('market://details?')
    );
  }

  return (
    normalizedUrl.startsWith('https://apps.apple.com/') ||
    normalizedUrl.startsWith('https://itunes.apple.com/') ||
    normalizedUrl.startsWith('itms-apps://apps.apple.com/') ||
    normalizedUrl.startsWith('itms-apps://itunes.apple.com/')
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readNonEmptyString(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
}

