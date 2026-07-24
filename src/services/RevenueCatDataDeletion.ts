import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import { getAuth } from '@react-native-firebase/auth';

import { deleteCloudProgressForCurrentParent } from '../engine/CloudProgressSyncManager';
import { ensureFirebaseAppCheckToken } from '../engine/FirebaseAppCheckManager';
import { resetMonetizationAfterAccountDeletion } from '../engine/MonetizationManager';
import { deleteParentAccount } from '../engine/ParentAuthManager';
import { deleteLocalAccountData } from './LocalAccountDataDeletion';

export const REVENUE_CAT_DATA_DELETION_FUNCTIONS_REGION = 'asia-southeast1';

export type RevenueCatDataDeletionResult =
  | 'appCheckRequired'
  | 'authRequired'
  | 'retryableError'
  | 'success';

/**
 * Deletes server-owned RevenueCat data for the authenticated parent. Firebase
 * Auth and App Check attach identity/attestation; the client never sends a UID.
 */
export async function deleteRevenueCatCustomerData(): Promise<RevenueCatDataDeletionResult> {
  const securityResult = await prepareCallableSecurityContext();
  if (securityResult !== 'success') {
    return securityResult;
  }

  return callRevenueCatCustomerDeletion();
}

async function callRevenueCatCustomerDeletion(): Promise<RevenueCatDataDeletionResult> {
  try {
    const callable = httpsCallable<void, unknown>(
      getFunctions(undefined, REVENUE_CAT_DATA_DELETION_FUNCTIONS_REGION),
      'deleteRevenueCatCustomerData',
      { timeout: 15_000 },
    );
    const response = await callable();
    return normalizeRevenueCatDataDeletionResponse(response.data);
  } catch (error) {
    if (isUnauthenticatedCallableError(error)) {
      return 'appCheckRequired';
    }

    console.warn('RevenueCat deletion error:', error);
    // A missing/unreachable backend is a server failure. Never continue with
    // Firebase Auth deletion when RevenueCat cleanup is unconfirmed.
    return 'retryableError';
  }
}

/**
 * Runs irreversible deletion in dependency order. If any server cleanup step
 * fails, Firebase Auth remains available so the parent can safely retry.
 */
export async function deleteCurrentParentAccountData(): Promise<RevenueCatDataDeletionResult> {
  const securityResult = await prepareCallableSecurityContext();
  if (securityResult !== 'success') {
    return securityResult;
  }

  await deleteCloudProgressForCurrentParent();

  const revenueCatResult = await callRevenueCatCustomerDeletion();
  if (revenueCatResult !== 'success') {
    return revenueCatResult;
  }

  await deleteParentAccount();
  await resetMonetizationAfterAccountDeletion();
  await deleteLocalAccountData();
  return 'success';
}

async function prepareCallableSecurityContext(): Promise<RevenueCatDataDeletionResult> {
  let user;
  try {
    user = getAuth().currentUser;
  } catch {
    return 'authRequired';
  }

  if (!user) {
    return 'authRequired';
  }

  try {
    await user.getIdToken(true);
  } catch {
    return 'authRequired';
  }

  return (await ensureFirebaseAppCheckToken())
    ? 'success'
    : 'appCheckRequired';
}

export function normalizeRevenueCatDataDeletionResponse(
  value: unknown,
): RevenueCatDataDeletionResult {
  if (!isRecord(value)) {
    return 'retryableError';
  }

  if (value.success === true) {
    return 'success';
  }

  return value.status === 'success' ||
    value.status === 'deleted' ||
    value.status === 'alreadyDeleted'
    ? 'success'
    : 'retryableError';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isUnauthenticatedCallableError(error: unknown) {
  if (!isRecord(error)) {
    return false;
  }

  const code = typeof error.code === 'string' ? error.code : '';
  const message = typeof error.message === 'string' ? error.message : '';
  return (
    code === 'unauthenticated' ||
    code === 'functions/unauthenticated' ||
    message.toLowerCase().includes('unauthenticated')
  );
}
