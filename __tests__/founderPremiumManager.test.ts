jest.mock('@react-native-firebase/functions', () => ({
  getFunctions: jest.fn(),
  httpsCallable: jest.fn(),
}));

jest.mock('../src/engine/MonetizationManager', () => ({
  getMonetizationSnapshot: jest.fn(),
  refreshMonetization: jest.fn(),
}));

import { getFunctions, httpsCallable } from '@react-native-firebase/functions';

import {
  FOUNDER_PREMIUM_FUNCTIONS_REGION,
  claimFounderPremium,
  confirmFounderPremiumEntitlement,
  getFounderPremiumStatus,
  normalizeFounderPremiumResponse,
} from '../src/engine/FounderPremiumManager';
import {
  getMonetizationSnapshot,
  refreshMonetization,
} from '../src/engine/MonetizationManager';

const mockCallable = jest.fn();
const mockGetFunctions = getFunctions as jest.MockedFunction<
  typeof getFunctions
>;
const mockHttpsCallable = httpsCallable as jest.MockedFunction<
  typeof httpsCallable
>;
const mockGetMonetizationSnapshot =
  getMonetizationSnapshot as jest.MockedFunction<
    typeof getMonetizationSnapshot
  >;
const mockRefreshMonetization = refreshMonetization as jest.MockedFunction<
  typeof refreshMonetization
>;

describe('FounderPremiumManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFunctions.mockReturnValue({ app: 'test-app' } as never);
    mockHttpsCallable.mockReturnValue(mockCallable as never);
    mockGetMonetizationSnapshot.mockReturnValue({ status: 'free' } as never);
    mockRefreshMonetization.mockResolvedValue({ status: 'free' } as never);
  });

  test.each([
    'available',
    'granted',
    'processing',
    'alreadyClaimed',
    'alreadyPremium',
    'notAvailable',
    'soldOut',
    'signInRequired',
    'retryableError',
  ] as const)('accepts normalized backend status %s', status => {
    expect(
      normalizeFounderPremiumResponse({
        expiresAt: '2027-07-16T00:00:00.000Z',
        status,
      }),
    ).toEqual({
      expiresAt: '2027-07-16T00:00:00.000Z',
      status,
    });
  });

  test('fails closed when the callable payload is malformed', () => {
    expect(normalizeFounderPremiumResponse({ status: 'reserved' })).toEqual({
      status: 'retryableError',
    });
    expect(normalizeFounderPremiumResponse(null)).toEqual({
      status: 'retryableError',
    });
  });

  test('calls claim without UID, campaign ID, or any request body', async () => {
    mockCallable.mockResolvedValue({ data: { status: 'processing' } });

    await expect(claimFounderPremium()).resolves.toEqual({
      status: 'processing',
    });

    expect(mockGetFunctions).toHaveBeenCalledWith(
      undefined,
      FOUNDER_PREMIUM_FUNCTIONS_REGION,
    );
    expect(mockHttpsCallable).toHaveBeenCalledWith(
      expect.anything(),
      'claimFounderPremium',
      { timeout: 15_000 },
    );
    expect(mockCallable).toHaveBeenCalledWith();
  });

  test('maps an unauthenticated callable error to signInRequired', async () => {
    mockCallable.mockRejectedValue({ code: 'functions/unauthenticated' });

    await expect(getFounderPremiumStatus()).resolves.toEqual({
      status: 'signInRequired',
    });
  });

  test('confirms a grant only after RevenueCat reports active Premium', async () => {
    mockGetMonetizationSnapshot.mockReturnValue({ status: 'premium' } as never);

    const result = await confirmFounderPremiumEntitlement(
      { status: 'granted' },
      { attempts: 1, delayMillis: 0 },
    );

    expect(result).toEqual({
      entitlementActive: true,
      response: { status: 'granted' },
    });
    expect(mockRefreshMonetization).toHaveBeenCalledWith({ invalidate: true });
    expect(mockCallable).not.toHaveBeenCalled();
  });

  test('keeps access locked when the backend grant is not active in RevenueCat', async () => {
    mockCallable.mockResolvedValue({ data: { status: 'granted' } });

    const result = await confirmFounderPremiumEntitlement(
      { status: 'processing' },
      { attempts: 1, delayMillis: 0 },
    );

    expect(result).toEqual({
      entitlementActive: false,
      response: { status: 'granted' },
    });
    expect(mockRefreshMonetization).toHaveBeenCalledWith({ invalidate: true });
  });

  test('opens only after a later CustomerInfo refresh confirms Premium', async () => {
    let customerInfoStatus: 'free' | 'premium' = 'free';
    mockGetMonetizationSnapshot.mockImplementation(
      () => ({ status: customerInfoStatus } as never),
    );
    mockRefreshMonetization.mockImplementation(
      async () => ({ status: customerInfoStatus } as never),
    );
    mockCallable.mockResolvedValue({ data: { status: 'granted' } });

    const beforeCustomerInfo = await confirmFounderPremiumEntitlement(
      { status: 'granted' },
      { attempts: 1, delayMillis: 0 },
    );

    expect(beforeCustomerInfo.entitlementActive).toBe(false);

    customerInfoStatus = 'premium';
    const afterCustomerInfo = await confirmFounderPremiumEntitlement(
      beforeCustomerInfo.response,
      { attempts: 1, delayMillis: 0 },
    );

    expect(afterCustomerInfo).toEqual({
      entitlementActive: true,
      response: { status: 'granted' },
    });
    expect(mockRefreshMonetization).toHaveBeenCalledTimes(2);
  });
});
