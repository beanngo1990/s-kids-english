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
    credential: jest.fn(),
  },
  deleteUser: jest.fn(),
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
  revokeToken: jest.fn(),
  signInWithCredential: jest.fn(),
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
  GoogleSignin: {},
  isCancelledResponse: jest.fn(),
  isErrorWithCode: jest.fn(() => false),
  isSuccessResponse: jest.fn(),
  statusCodes: {
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  },
}));

import { getParentAuthErrorCode } from '../src/engine/ParentAuthManager';

test('classifies a missing Google iOS URL scheme', () => {
  const error = Object.assign(
    new Error(
      'Your app is missing support for the following URL schemes: example',
    ),
    { code: 'SIGN_IN_ERROR' },
  );

  expect(getParentAuthErrorCode(error)).toBe('missingGoogleUrlScheme');
});
