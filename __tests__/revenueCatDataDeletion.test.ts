jest.mock('@react-native-firebase/functions', () => ({
  getFunctions: jest.fn(),
  httpsCallable: jest.fn(),
}));

jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(),
}));

jest.mock('../src/engine/CloudProgressSyncManager', () => ({
  deleteCloudProgressForCurrentParent: jest.fn(),
}));

jest.mock('../src/engine/FirebaseAppCheckManager', () => ({
  ensureFirebaseAppCheckToken: jest.fn(),
}));

jest.mock('../src/engine/MonetizationManager', () => ({
  resetMonetizationAfterAccountDeletion: jest.fn(),
}));

jest.mock('../src/engine/ParentAuthManager', () => ({
  deleteParentAccount: jest.fn(),
}));

import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import { getAuth } from '@react-native-firebase/auth';

import { deleteCloudProgressForCurrentParent } from '../src/engine/CloudProgressSyncManager';
import { ensureFirebaseAppCheckToken } from '../src/engine/FirebaseAppCheckManager';
import { resetMonetizationAfterAccountDeletion } from '../src/engine/MonetizationManager';
import { deleteParentAccount } from '../src/engine/ParentAuthManager';
import {
  deleteCurrentParentAccountData,
  deleteRevenueCatCustomerData,
  normalizeRevenueCatDataDeletionResponse,
  REVENUE_CAT_DATA_DELETION_FUNCTIONS_REGION,
} from '../src/services/RevenueCatDataDeletion';

const mockCallable = jest.fn();
const mockGetIdToken = jest.fn();
const mockGetAuth = getAuth as jest.MockedFunction<typeof getAuth>;
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
const mockEnsureAppCheckToken =
  ensureFirebaseAppCheckToken as jest.MockedFunction<
    typeof ensureFirebaseAppCheckToken
  >;
const mockDeleteParentAccount = deleteParentAccount as jest.MockedFunction<
  typeof deleteParentAccount
>;
const mockResetMonetization =
  resetMonetizationAfterAccountDeletion as jest.MockedFunction<
    typeof resetMonetizationAfterAccountDeletion
  >;

describe('RevenueCat account deletion', () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    mockGetAuth.mockReturnValue({
      currentUser: { getIdToken: mockGetIdToken },
    } as never);
    mockGetIdToken.mockResolvedValue('firebase-id-token');
    mockEnsureAppCheckToken.mockResolvedValue(true);
    mockGetFunctions.mockReturnValue({ app: 'test-app' } as never);
    mockHttpsCallable.mockReturnValue(mockCallable as never);
    mockDeleteCloudProgress.mockResolvedValue(undefined);
    mockDeleteParentAccount.mockResolvedValue(undefined);
    mockResetMonetization.mockResolvedValue(undefined);
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
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

    expect(mockGetIdToken).toHaveBeenCalledWith(true);
    expect(mockEnsureAppCheckToken).toHaveBeenCalledTimes(1);
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

  test('reports App Check/security rejection from an unauthenticated callable', async () => {
    mockCallable.mockRejectedValue({
      code: 'functions/unauthenticated',
      message: 'Unauthenticated',
    });

    await expect(deleteRevenueCatCustomerData()).resolves.toBe(
      'appCheckRequired',
    );
  });

  test('does not call the backend when Firebase Auth or App Check is missing', async () => {
    mockGetAuth.mockReturnValue({ currentUser: null } as never);

    await expect(deleteRevenueCatCustomerData()).resolves.toBe(
      'authRequired',
    );
    expect(mockCallable).not.toHaveBeenCalled();

    mockGetAuth.mockReturnValue({
      currentUser: { getIdToken: mockGetIdToken },
    } as never);
    mockGetIdToken.mockResolvedValue('firebase-id-token');
    mockEnsureAppCheckToken.mockResolvedValue(false);

    await expect(deleteRevenueCatCustomerData()).resolves.toBe(
      'appCheckRequired',
    );
    expect(mockCallable).not.toHaveBeenCalled();
  });

  test('treats a missing or failed backend as retryable', async () => {
    mockCallable.mockRejectedValue({ code: 'functions/not-found' });

    await expect(deleteRevenueCatCustomerData()).resolves.toBe(
      'retryableError',
    );
  });

  test('deletes cloud data and RevenueCat before Auth, then clears the SDK', async () => {
    const events: string[] = [];
    mockGetIdToken.mockImplementation(async () => {
      events.push('authToken');
      return 'firebase-id-token';
    });
    mockEnsureAppCheckToken.mockImplementation(async () => {
      events.push('appCheck');
      return true;
    });
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

    expect(events).toEqual([
      'authToken',
      'appCheck',
      'cloud',
      'revenueCat',
      'auth',
      'localSdk',
    ]);
  });

  test('keeps Firebase Auth when RevenueCat deletion is unconfirmed', async () => {
    mockCallable.mockRejectedValue({ code: 'functions/internal' });

    await expect(deleteCurrentParentAccountData()).resolves.toBe(
      'retryableError',
    );

    expect(mockDeleteParentAccount).not.toHaveBeenCalled();
    expect(mockResetMonetization).not.toHaveBeenCalled();
  });

  test('keeps cloud and Firebase Auth when the security context is unavailable', async () => {
    mockEnsureAppCheckToken.mockResolvedValue(false);

    await expect(deleteCurrentParentAccountData()).resolves.toBe(
      'appCheckRequired',
    );

    expect(mockDeleteCloudProgress).not.toHaveBeenCalled();
    expect(mockCallable).not.toHaveBeenCalled();
    expect(mockDeleteParentAccount).not.toHaveBeenCalled();
    expect(mockResetMonetization).not.toHaveBeenCalled();
  });
});
