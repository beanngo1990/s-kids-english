jest.mock('@react-native-firebase/functions', () => ({
  getFunctions: jest.fn(),
  httpsCallable: jest.fn(),
}));

jest.mock('../src/engine/CloudProgressSyncManager', () => ({
  deleteCloudProgressForCurrentParent: jest.fn(),
}));

jest.mock('../src/engine/MonetizationManager', () => ({
  resetMonetizationAfterAccountDeletion: jest.fn(),
}));

jest.mock('../src/engine/ParentAuthManager', () => ({
  deleteParentAccount: jest.fn(),
}));

import { getFunctions, httpsCallable } from '@react-native-firebase/functions';

import { deleteCloudProgressForCurrentParent } from '../src/engine/CloudProgressSyncManager';
import { resetMonetizationAfterAccountDeletion } from '../src/engine/MonetizationManager';
import { deleteParentAccount } from '../src/engine/ParentAuthManager';
import {
  deleteCurrentParentAccountData,
  deleteRevenueCatCustomerData,
  normalizeRevenueCatDataDeletionResponse,
  REVENUE_CAT_DATA_DELETION_FUNCTIONS_REGION,
} from '../src/services/RevenueCatDataDeletion';

const mockCallable = jest.fn();
const mockGetFunctions = getFunctions as jest.MockedFunction<
  typeof getFunctions
>;
const mockHttpsCallable = httpsCallable as jest.MockedFunction<
  typeof httpsCallable
>;
const mockDeleteCloudProgress =
  deleteCloudProgressForCurrentParent as jest.MockedFunction<
    typeof deleteCloudProgressForCurrentParent
  >;
const mockDeleteParentAccount = deleteParentAccount as jest.MockedFunction<
  typeof deleteParentAccount
>;
const mockResetMonetization =
  resetMonetizationAfterAccountDeletion as jest.MockedFunction<
    typeof resetMonetizationAfterAccountDeletion
  >;

describe('RevenueCat account deletion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFunctions.mockReturnValue({ app: 'test-app' } as never);
    mockHttpsCallable.mockReturnValue(mockCallable as never);
    mockDeleteCloudProgress.mockResolvedValue(undefined);
    mockDeleteParentAccount.mockResolvedValue(undefined);
    mockResetMonetization.mockResolvedValue(undefined);
  });

  test.each([
    [{ success: true }, 'success'],
    [{ status: 'success' }, 'success'],
    [{ status: 'deleted' }, 'success'],
    [{ status: 'alreadyDeleted' }, 'success'],
    [{ status: 'notFound' }, 'retryableError'],
    [null, 'retryableError'],
  ] as const)('normalizes backend payload %#', (payload, expected) => {
    expect(normalizeRevenueCatDataDeletionResponse(payload)).toBe(expected);
  });

  test('calls the regional callable without sending a UID or request body', async () => {
    mockCallable.mockResolvedValue({ data: { status: 'deleted' } });

    await expect(deleteRevenueCatCustomerData()).resolves.toBe('success');

    expect(mockGetFunctions).toHaveBeenCalledWith(
      undefined,
      REVENUE_CAT_DATA_DELETION_FUNCTIONS_REGION,
    );
    expect(mockHttpsCallable).toHaveBeenCalledWith(
      expect.anything(),
      'deleteRevenueCatCustomerData',
      { timeout: 15_000 },
    );
    expect(mockCallable).toHaveBeenCalledWith();
  });

  test('treats a missing or failed backend as retryable', async () => {
    mockCallable.mockRejectedValue({ code: 'functions/not-found' });

    await expect(deleteRevenueCatCustomerData()).resolves.toBe(
      'retryableError',
    );
  });

  test('deletes cloud data and RevenueCat before Auth, then clears the SDK', async () => {
    const events: string[] = [];
    mockDeleteCloudProgress.mockImplementation(async () => {
      events.push('cloud');
    });
    mockCallable.mockImplementation(async () => {
      events.push('revenueCat');
      return { data: { status: 'deleted' } };
    });
    mockDeleteParentAccount.mockImplementation(async () => {
      events.push('auth');
    });
    mockResetMonetization.mockImplementation(async () => {
      events.push('localSdk');
    });

    await expect(deleteCurrentParentAccountData()).resolves.toBe('success');

    expect(events).toEqual(['cloud', 'revenueCat', 'auth', 'localSdk']);
  });

  test('keeps Firebase Auth when RevenueCat deletion is unconfirmed', async () => {
    mockCallable.mockRejectedValue({ code: 'functions/internal' });

    await expect(deleteCurrentParentAccountData()).resolves.toBe(
      'retryableError',
    );

    expect(mockDeleteParentAccount).not.toHaveBeenCalled();
    expect(mockResetMonetization).not.toHaveBeenCalled();
  });
});
