import type { CustomerInfo } from 'react-native-purchases';

const DAY_MILLIS = 24 * 60 * 60 * 1000;
const MAX_DURATION_DAYS = 3650;
const TIMEZONE_SUFFIX = /(?:Z|[+-]\d{2}:\d{2})$/i;

export type FounderAccessConfig = Readonly<{
  cutoffAt: string;
  durationDays: number;
}>;

export type FounderAccessStatus =
  | 'active'
  | 'afterCutoff'
  | 'disabled'
  | 'expired'
  | 'invalid';

export type FounderAccessEvaluation = Readonly<{
  expirationDate?: string;
  isActive: boolean;
  isEligible: boolean;
  status: FounderAccessStatus;
}>;

type FounderCustomerInfo = Pick<CustomerInfo, 'firstSeen' | 'requestDate'>;

/**
 * Evaluates the local Founder access window recorded by RevenueCat.
 *
 * Remote Config is intentionally only an operational switch. It is not a
 * trusted entitlement source, so malformed or incomplete data always denies
 * access. Store entitlements are evaluated separately by MonetizationManager.
 */
export function evaluateFounderAccess(
  customerInfo: FounderCustomerInfo,
  config: FounderAccessConfig,
  deviceNowMillis = Date.now(),
): FounderAccessEvaluation {
  const normalizedCutoff =
    typeof config.cutoffAt === 'string' ? config.cutoffAt.trim() : '';
  if (!normalizedCutoff) {
    return inactive('disabled');
  }

  if (
    !Number.isInteger(config.durationDays) ||
    config.durationDays <= 0 ||
    config.durationDays > MAX_DURATION_DAYS ||
    !Number.isFinite(deviceNowMillis)
  ) {
    return inactive('invalid');
  }

  const cutoffMillis = parseTimestampWithTimezone(normalizedCutoff);
  const firstSeenMillis = parseTimestampWithTimezone(customerInfo.firstSeen);
  const requestDateMillis = parseTimestampWithTimezone(customerInfo.requestDate);

  if (
    cutoffMillis === null ||
    firstSeenMillis === null ||
    requestDateMillis === null ||
    firstSeenMillis > requestDateMillis
  ) {
    return inactive('invalid');
  }

  if (firstSeenMillis > cutoffMillis) {
    return inactive('afterCutoff');
  }

  const durationMillis = config.durationDays * DAY_MILLIS;
  const expirationMillis = firstSeenMillis + durationMillis;
  if (!Number.isSafeInteger(expirationMillis)) {
    return inactive('invalid');
  }

  const expiration = new Date(expirationMillis);
  if (!Number.isFinite(expiration.getTime())) {
    return inactive('invalid');
  }

  const expirationDate = expiration.toISOString();
  const effectiveNowMillis = Math.max(deviceNowMillis, requestDateMillis);
  if (effectiveNowMillis >= expirationMillis) {
    return {
      expirationDate,
      isActive: false,
      isEligible: true,
      status: 'expired',
    };
  }

  return {
    expirationDate,
    isActive: true,
    isEligible: true,
    status: 'active',
  };
}

function parseTimestampWithTimezone(value: string): number | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim();
  if (!normalizedValue || !TIMEZONE_SUFFIX.test(normalizedValue)) {
    return null;
  }

  const sourceCalendarDate = normalizedValue.match(
    /^(\d{4}-\d{2}-\d{2})T/,
  )?.[1];
  if (!sourceCalendarDate) {
    return null;
  }

  const calendarTimestamp = Date.parse(
    `${sourceCalendarDate}T00:00:00.000Z`,
  );
  if (
    !Number.isFinite(calendarTimestamp) ||
    new Date(calendarTimestamp).toISOString().slice(0, 10) !==
      sourceCalendarDate
  ) {
    return null;
  }

  const timestamp = Date.parse(normalizedValue);
  if (!Number.isFinite(timestamp)) {
    return null;
  }

  return timestamp;
}

function inactive(
  status: Exclude<FounderAccessStatus, 'active' | 'expired'>,
): FounderAccessEvaluation {
  return {
    isActive: false,
    isEligible: false,
    status,
  };
}
