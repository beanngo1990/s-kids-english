import { getFunctions, httpsCallable } from '@react-native-firebase/functions';

import {
  getMonetizationSnapshot,
  refreshMonetization,
} from './MonetizationManager';

export const FOUNDER_PREMIUM_FUNCTIONS_REGION = 'asia-southeast1';

export type FounderPremiumStatus =
  | 'available'
  | 'granted'
  | 'processing'
  | 'alreadyClaimed'
  | 'alreadyPremium'
  | 'notAvailable'
  | 'soldOut'
  | 'signInRequired'
  | 'retryableError';

export type FounderPremiumResponse = Readonly<{
  expiresAt?: string;
  status: FounderPremiumStatus;
}>;

export type FounderPremiumConfirmation = Readonly<{
  entitlementActive: boolean;
  response: FounderPremiumResponse;
}>;

type ConfirmationOptions = Readonly<{
  attempts?: number;
  delayMillis?: number;
}>;

const knownStatuses = new Set<FounderPremiumStatus>([
  'available',
  'granted',
  'processing',
  'alreadyClaimed',
  'alreadyPremium',
  'notAvailable',
  'soldOut',
  'signInRequired',
  'retryableError',
]);

export async function getFounderPremiumStatus(): Promise<FounderPremiumResponse> {
  return callFounderPremiumFunction('getFounderPremiumStatus');
}

export async function claimFounderPremium(): Promise<FounderPremiumResponse> {
  return callFounderPremiumFunction('claimFounderPremium');
}

/**
 * A backend grant is only a request outcome. Premium remains locked until the
 * RevenueCat SDK returns an active, verified `premium` entitlement.
 */
export async function confirmFounderPremiumEntitlement(
  initialResponse: FounderPremiumResponse,
  options: ConfirmationOptions = {},
): Promise<FounderPremiumConfirmation> {
  const attempts = Math.max(1, options.attempts ?? 4);
  const delayMillis = Math.max(0, options.delayMillis ?? 1_500);
  let latestResponse = initialResponse;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    await refreshMonetization({ invalidate: true });

    if (getMonetizationSnapshot().status === 'premium') {
      return {
        entitlementActive: true,
        response: latestResponse,
      };
    }

    latestResponse = await getFounderPremiumStatus();
    if (!shouldConfirmFounderPremiumStatus(latestResponse.status)) {
      break;
    }

    if (attempt < attempts - 1 && delayMillis > 0) {
      await wait(delayMillis);
    }
  }

  return {
    entitlementActive: false,
    response: latestResponse,
  };
}

export function normalizeFounderPremiumResponse(
  value: unknown,
): FounderPremiumResponse {
  if (!isRecord(value) || !isFounderPremiumStatus(value.status)) {
    return { status: 'retryableError' };
  }

  const expiresAt =
    typeof value.expiresAt === 'string' && value.expiresAt.trim().length > 0
      ? value.expiresAt
      : undefined;

  return {
    expiresAt,
    status: value.status,
  };
}

export function shouldConfirmFounderPremiumStatus(
  status: FounderPremiumStatus,
) {
  return (
    status === 'granted' ||
    status === 'processing' ||
    status === 'alreadyClaimed' ||
    status === 'alreadyPremium'
  );
}

async function callFounderPremiumFunction(
  functionName: 'claimFounderPremium' | 'getFounderPremiumStatus',
): Promise<FounderPremiumResponse> {
  try {
    const callable = httpsCallable<void, unknown>(
      getFunctions(undefined, FOUNDER_PREMIUM_FUNCTIONS_REGION),
      functionName,
      { timeout: 15_000 },
    );
    // Auth and App Check are attached by Firebase. UID/campaign data is never
    // accepted from the mobile client, so the callable has no request body.
    const result = await callable();
    return normalizeFounderPremiumResponse(result.data);
  } catch (error) {
    return { status: normalizeCallableError(error) };
  }
}

function normalizeCallableError(error: unknown): FounderPremiumStatus {
  const code = getStringField(error, 'code');

  if (code === 'unauthenticated' || code === 'functions/unauthenticated') {
    return 'signInRequired';
  }

  if (
    code === 'resource-exhausted' ||
    code === 'functions/resource-exhausted'
  ) {
    return 'soldOut';
  }

  if (
    code === 'failed-precondition' ||
    code === 'functions/failed-precondition' ||
    code === 'permission-denied' ||
    code === 'functions/permission-denied'
  ) {
    return 'notAvailable';
  }

  return 'retryableError';
}

function isFounderPremiumStatus(value: unknown): value is FounderPremiumStatus {
  return (
    typeof value === 'string' &&
    knownStatuses.has(value as FounderPremiumStatus)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getStringField(value: unknown, key: string) {
  if (!isRecord(value)) {
    return undefined;
  }

  return typeof value[key] === 'string' ? value[key] : undefined;
}

function wait(delayMillis: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, delayMillis);
  });
}
