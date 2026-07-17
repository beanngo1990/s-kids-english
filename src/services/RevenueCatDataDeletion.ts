import { getFunctions, httpsCallable } from '@react-native-firebase/functions';

import { deleteCloudProgressForCurrentParent } from '../engine/CloudProgressSyncManager';
import { resetMonetizationAfterAccountDeletion } from '../engine/MonetizationManager';
import { deleteParentAccount } from '../engine/ParentAuthManager';

export const REVENUE_CAT_DATA_DELETION_FUNCTIONS_REGION = 'asia-southeast1';

export type RevenueCatDataDeletionResult = 'retryableError' | 'success';

/**
 * Deletes server-owned RevenueCat data for the authenticated parent. Firebase
 * Auth and App Check attach identity/attestation; the client never sends a UID.
 */
export async function deleteRevenueCatCustomerData(): Promise<RevenueCatDataDeletionResult> {
  try {
    const callable = httpsCallable<void, unknown>(
      getFunctions(undefined, REVENUE_CAT_DATA_DELETION_FUNCTIONS_REGION),
      'deleteRevenueCatCustomerData',
      { timeout: 15_000 },
    );
    const response = await callable();
    return normalizeRevenueCatDataDeletionResponse(response.data);
  } catch {
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
  await deleteCloudProgressForCurrentParent();

  const revenueCatResult = await deleteRevenueCatCustomerData();
  if (revenueCatResult !== 'success') {
    return revenueCatResult;
  }

  await deleteParentAccount();
  await resetMonetizationAfterAccountDeletion();
  return 'success';
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
