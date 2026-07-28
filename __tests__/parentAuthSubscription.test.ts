let mockAuthStateListener:
  | ((user: Record<string, unknown> | null) => void)
  | undefined;

const mockAuth = {
  currentUser: null as Record<string, unknown> | null,
};
const mockAuthObserverUnsubscribe = jest.fn();
const mockGoogleSignIn = jest.fn();
const mockGoogleGetTokens = jest.fn();
const mockSignInWithCredential = jest.fn();

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

jest.mock('@react-native-firebase/app', () => ({
  getApps: jest.fn(() => [{}]),
}));

jest.mock('@react-native-firebase/auth', () => ({
  AppleAuthProvider: {
    PROVIDER_ID: 'apple.com',
    credential: jest.fn(),
  },
  GoogleAuthProvider: {
    PROVIDER_ID: 'google.com',
    credential: jest.fn(() => ({ provider: 'google.com' })),
  },
  deleteUser: jest.fn(),
  getAuth: jest.fn(() => mockAuth),
  onAuthStateChanged: jest.fn(
    (_auth, listener: typeof mockAuthStateListener) => {
      mockAuthStateListener = listener;
      return mockAuthObserverUnsubscribe;
    },
  ),
  revokeToken: jest.fn(),
  signInWithCredential: (...args: unknown[]) =>
    mockSignInWithCredential(...args),
  signOut: jest.fn(),
}));

jest.mock('@invertase/react-native-apple-authentication', () => ({
  __esModule: true,
  default: {
    Error: { CANCELED: 'ERR_CANCELED' },
    Operation: { LOGIN: 1, REFRESH: 2 },
    Scope: { EMAIL: 1, FULL_NAME: 2 },
    isSupported: false,
    performRequest: jest.fn(),
  },
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    getTokens: (...args: unknown[]) => mockGoogleGetTokens(...args),
    hasPlayServices: jest.fn(() => Promise.resolve()),
    signIn: (...args: unknown[]) => mockGoogleSignIn(...args),
  },
  isCancelledResponse: jest.fn(() => false),
  isErrorWithCode: jest.fn(() => false),
  isSuccessResponse: jest.fn(() => true),
  statusCodes: {
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  },
}));

import {
  signInParentWithGoogle,
  subscribeParentAuth,
  type ParentAuthSnapshot,
} from '../src/engine/ParentAuthManager';

test('publishes a Google sign-in result even before the native auth observer responds', async () => {
  const receivedSnapshots: ParentAuthSnapshot[] = [];
  const signedInUser = {
    displayName: 'Parent',
    email: 'parent@example.test',
    providerData: [{ providerId: 'google.com' }],
    uid: 'parent-google-uid',
  };

  mockGoogleSignIn.mockResolvedValue({
    data: { idToken: 'id-token' },
  });
  mockGoogleGetTokens.mockResolvedValue({ accessToken: 'access-token' });
  mockSignInWithCredential.mockResolvedValue({ user: signedInUser });

  const unsubscribe = subscribeParentAuth(snapshot => {
    receivedSnapshots.push(snapshot);
  });

  expect(receivedSnapshots).toContainEqual({ isReady: true, user: null });
  expect(mockAuthStateListener).toBeDefined();

  await expect(signInParentWithGoogle()).resolves.toMatchObject({
    providerIds: ['google.com'],
    uid: 'parent-google-uid',
  });

  expect(receivedSnapshots.at(-1)).toMatchObject({
    isReady: true,
    user: {
      providerIds: ['google.com'],
      uid: 'parent-google-uid',
    },
  });

  unsubscribe();
  expect(mockAuthObserverUnsubscribe).toHaveBeenCalledTimes(1);
});
