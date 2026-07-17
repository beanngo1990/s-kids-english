let mockAppStateListener:
  | ((state: 'active' | 'background' | 'inactive') => void)
  | null = null;

const mockRemoveAppStateListener = jest.fn();

jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(
      (
        _event: string,
        listener: typeof mockAppStateListener,
      ): { remove: () => void } => {
        mockAppStateListener = listener;
        return { remove: mockRemoveAppStateListener };
      },
    ),
    currentState: 'active',
  },
}));

import {
  getParentAccessSnapshot,
  grantParentAccess,
  revokeParentAccess,
  setParentPurchaseFlowActive,
  startParentAccessSessionLifecycle,
  subscribeParentAccess,
} from '../src/engine/ParentAccessSession';

const lifecycleCleanups: Array<() => void> = [];

afterEach(() => {
  for (const cleanup of lifecycleCleanups.splice(0)) {
    cleanup();
  }
  setParentPurchaseFlowActive(false);
  revokeParentAccess();
  mockAppStateListener = null;
  jest.clearAllMocks();
});

test('grants and revokes access while notifying active subscribers once per change', () => {
  const listener = jest.fn();
  const unsubscribe = subscribeParentAccess(listener);

  expect(getParentAccessSnapshot()).toEqual({ isGranted: false });

  grantParentAccess();
  grantParentAccess();

  expect(getParentAccessSnapshot()).toEqual({ isGranted: true });
  expect(listener).toHaveBeenCalledTimes(1);

  unsubscribe();
  revokeParentAccess();

  expect(getParentAccessSnapshot()).toEqual({ isGranted: false });
  expect(listener).toHaveBeenCalledTimes(1);
});

test('revokes an unlocked session when the app leaves the foreground', () => {
  startLifecycle();
  grantParentAccess();

  mockAppStateListener?.('inactive');

  expect(getParentAccessSnapshot()).toEqual({ isGranted: false });

  grantParentAccess();
  mockAppStateListener?.('active');

  expect(getParentAccessSnapshot()).toEqual({ isGranted: true });
});

test('keeps access during a purchase flow and revokes it after that exception ends', () => {
  startLifecycle();
  grantParentAccess();
  setParentPurchaseFlowActive(true);

  mockAppStateListener?.('background');

  expect(getParentAccessSnapshot()).toEqual({ isGranted: true });

  setParentPurchaseFlowActive(false);
  mockAppStateListener?.('background');

  expect(getParentAccessSnapshot()).toEqual({ isGranted: false });
});

test('shares one AppState subscription until the last lifecycle owner stops', () => {
  const mockAddAppStateListener = getMockAddAppStateListener();
  const stopFirstOwner = startLifecycle();
  const stopSecondOwner = startLifecycle();

  expect(mockAddAppStateListener).toHaveBeenCalledTimes(1);
  expect(mockAddAppStateListener).toHaveBeenCalledWith(
    'change',
    expect.any(Function),
  );

  stopFirstOwner();
  expect(mockRemoveAppStateListener).not.toHaveBeenCalled();

  stopSecondOwner();
  expect(mockRemoveAppStateListener).toHaveBeenCalledTimes(1);

  startLifecycle();
  expect(mockAddAppStateListener).toHaveBeenCalledTimes(2);
});

function startLifecycle() {
  const cleanup = startParentAccessSessionLifecycle();
  let isActive = true;
  const trackedCleanup = () => {
    if (!isActive) {
      return;
    }
    isActive = false;
    cleanup();
  };
  lifecycleCleanups.push(trackedCleanup);
  return trackedCleanup;
}

function getMockAddAppStateListener(): jest.Mock {
  const reactNativeMock = jest.requireMock('react-native') as {
    AppState: { addEventListener: jest.Mock };
  };
  return reactNativeMock.AppState.addEventListener;
}
