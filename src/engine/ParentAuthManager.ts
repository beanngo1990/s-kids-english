import { Platform } from 'react-native';
import { getApps } from '@react-native-firebase/app';
import {
  AppleAuthProvider,
  GoogleAuthProvider,
  deleteUser,
  getAuth,
  onAuthStateChanged,
  revokeToken,
  signInWithCredential,
  signOut,
  type Auth,
  type User,
} from '@react-native-firebase/auth';
import appleAuth from '@invertase/react-native-apple-authentication';
import {
  GoogleSignin,
  isCancelledResponse,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import {
  firebaseAuthConfig,
  hasGoogleIosClientId,
  hasGoogleWebClientId,
} from '../config/firebaseAuth';

export type ParentAuthProvider = 'apple' | 'google' | 'unknown';

export type ParentAuthUser = {
  displayName?: string;
  email?: string;
  providerIds: string[];
  uid: string;
};

export type ParentAuthErrorCode =
  | 'appleUnavailable'
  | 'cancelled'
  | 'missingAppleAuthorizationCode'
  | 'missingAppleIdentityToken'
  | 'missingFirebaseConfig'
  | 'missingGoogleUrlScheme'
  | 'missingGoogleWebClientId'
  | 'operationNotAllowed'
  | 'playServicesUnavailable'
  | 'requiresRecentLogin'
  | 'signInInProgress'
  | 'unknown';

export type ParentAuthSnapshot = {
  configurationError?: ParentAuthErrorCode;
  isReady: boolean;
  user: ParentAuthUser | null;
};

export const initialParentAuthSnapshot: ParentAuthSnapshot = {
  isReady: false,
  user: null,
};

export class ParentAuthError extends Error {
  readonly cause?: unknown;
  readonly code: ParentAuthErrorCode;

  constructor(code: ParentAuthErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'ParentAuthError';
    this.code = code;
    this.cause = cause;
  }
}

let configuredGoogleWebClientId: string | null = null;
let authObserverInitialized = false;
let authObserverUnsubscribe: (() => void) | null = null;
let parentAuthSnapshot = initialParentAuthSnapshot;
const parentAuthListeners = new Set<
  (snapshot: ParentAuthSnapshot) => void
>();

export function subscribeParentAuth(
  listener: (snapshot: ParentAuthSnapshot) => void,
) {
  parentAuthListeners.add(listener);
  listener(parentAuthSnapshot);
  ensureParentAuthObserver();

  return () => {
    parentAuthListeners.delete(listener);

    if (parentAuthListeners.size > 0) {
      return;
    }

    authObserverUnsubscribe?.();
    authObserverUnsubscribe = null;
    authObserverInitialized = false;
    parentAuthSnapshot = initialParentAuthSnapshot;
  };
}

export async function signInParentWithGoogle() {
  const auth = getConfiguredAuth();
  configureGoogleSignIn();

  try {
    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
    }

    const response = await GoogleSignin.signIn();

    if (isCancelledResponse(response)) {
      throw new ParentAuthError('cancelled', 'Google sign-in was cancelled.');
    }

    if (!isSuccessResponse(response)) {
      throw new ParentAuthError(
        'unknown',
        'Google sign-in returned an unsupported response.',
      );
    }

    const idToken = response.data.idToken;
    if (!idToken) {
      throw new ParentAuthError(
        'missingGoogleWebClientId',
        'Google sign-in did not return an ID token.',
      );
    }

    const { accessToken } = await GoogleSignin.getTokens();
    const credential = GoogleAuthProvider.credential(idToken, accessToken);
    const result = await signInWithCredential(auth, credential);
    const user = mapFirebaseUser(result.user);
    publishParentAuthSnapshot({ isReady: true, user });
    return user;
  } catch (error) {
    throw normalizeParentAuthError(error);
  }
}

export async function signInParentWithApple() {
  if (!isAppleSignInAvailable()) {
    throw new ParentAuthError(
      'appleUnavailable',
      'Apple sign-in is not available on this device.',
    );
  }

  const auth = getConfiguredAuth();

  try {
    const response = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    if (!response.identityToken) {
      throw new ParentAuthError(
        'missingAppleIdentityToken',
        'Apple sign-in did not return an identity token.',
      );
    }

    const credential = AppleAuthProvider.credential(
      response.identityToken,
      response.nonce,
    );
    const result = await signInWithCredential(auth, credential);
    const user = mapFirebaseUser(result.user);
    publishParentAuthSnapshot({ isReady: true, user });
    return user;
  } catch (error) {
    throw normalizeParentAuthError(error);
  }
}

export async function signOutParent() {
  const auth = getConfiguredAuth();
  await signOut(auth);
  publishParentAuthSnapshot({ isReady: true, user: null });

  try {
    await GoogleSignin.signOut();
  } catch {
    // Firebase Auth owns the app session; Google SDK sign-out is best-effort.
  }
}

export async function deleteParentAccount() {
  const auth = getConfiguredAuth();
  const user = auth.currentUser;

  if (!user) {
    return;
  }

  try {
    if (hasProvider(user, AppleAuthProvider.PROVIDER_ID)) {
      try {
        await revokeAppleToken(auth);
      } catch (appleError) {
        const code = getParentAuthErrorCode(appleError);
        if (code === 'cancelled') {
          throw appleError;
        }
        console.warn(
          'Apple token revocation failed, proceeding with Firebase account deletion:',
          appleError,
        );
      }
    }

    await deleteUser(user);
    publishParentAuthSnapshot({ isReady: true, user: null });
  } catch (error) {
    throw normalizeParentAuthError(error);
  }
}

export function getParentAuthErrorCode(error: unknown): ParentAuthErrorCode {
  if (error instanceof ParentAuthError) {
    return error.code;
  }

  const code = getErrorCode(error);
  const message = getErrorMessage(error);

  if (
    code === appleAuth.Error.CANCELED ||
    code === statusCodes.SIGN_IN_CANCELLED ||
    message.includes('cancelled') ||
    message.includes('canceled')
  ) {
    return 'cancelled';
  }

  if (code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
    return 'playServicesUnavailable';
  }

  if (code === statusCodes.IN_PROGRESS) {
    return 'signInInProgress';
  }

  if (
    message.includes('missing support for the following URL schemes') ||
    message.includes('missing support for the following URL scheme')
  ) {
    return 'missingGoogleUrlScheme';
  }

  if (code.includes('requires-recent-login')) {
    return 'requiresRecentLogin';
  }

  if (
    code.includes('operation-not-allowed') ||
    message.includes('operation-not-allowed')
  ) {
    return 'operationNotAllowed';
  }

  if (isFirebaseConfigError(error)) {
    return 'missingFirebaseConfig';
  }

  return 'unknown';
}

export function isAppleSignInAvailable() {
  return Platform.OS === 'ios' && appleAuth.isSupported;
}

export function isGoogleSignInConfigured() {
  return hasGoogleWebClientId();
}

export function getParentAuthProviders(user: ParentAuthUser) {
  return user.providerIds.map(providerId => {
    if (providerId === GoogleAuthProvider.PROVIDER_ID) {
      return 'google';
    }

    if (providerId === AppleAuthProvider.PROVIDER_ID) {
      return 'apple';
    }

    return 'unknown';
  }) satisfies ParentAuthProvider[];
}

function ensureParentAuthObserver() {
  if (authObserverInitialized) {
    return;
  }

  authObserverInitialized = true;

  try {
    const auth = getConfiguredAuth();

    // Native Firebase may restore a persisted account before it sends the
    // observer event. Reading currentUser here prevents an already-signed-in
    // parent from being rendered as signed out during that gap.
    publishParentAuthSnapshot({
      isReady: true,
      user: mapFirebaseUser(auth.currentUser),
    });

    authObserverUnsubscribe = onAuthStateChanged(
      auth,
      user => {
        publishParentAuthSnapshot({
          isReady: true,
          user: mapFirebaseUser(user),
        });
      },
      error => {
        publishParentAuthSnapshot({
          configurationError: getParentAuthErrorCode(error),
          isReady: true,
          user: null,
        });
      },
    );
  } catch (error) {
    publishParentAuthSnapshot({
      configurationError: getParentAuthErrorCode(error),
      isReady: true,
      user: null,
    });
  }
}

function publishParentAuthSnapshot(nextSnapshot: ParentAuthSnapshot) {
  if (isSameParentAuthSnapshot(parentAuthSnapshot, nextSnapshot)) {
    return;
  }

  parentAuthSnapshot = nextSnapshot;
  for (const listener of parentAuthListeners) {
    listener(parentAuthSnapshot);
  }
}

function isSameParentAuthSnapshot(
  first: ParentAuthSnapshot,
  second: ParentAuthSnapshot,
) {
  return (
    first.configurationError === second.configurationError &&
    first.isReady === second.isReady &&
    first.user?.uid === second.user?.uid
  );
}

function getConfiguredAuth() {
  try {
    if (getApps().length === 0) {
      throw new ParentAuthError(
        'missingFirebaseConfig',
        'Firebase has no configured default app.',
      );
    }

    return getAuth();
  } catch (error) {
    throw normalizeParentAuthError(error);
  }
}

function configureGoogleSignIn() {
  if (!hasGoogleWebClientId()) {
    throw new ParentAuthError(
      'missingGoogleWebClientId',
      'Google Web client ID is required for Firebase Google sign-in.',
    );
  }

  const webClientId = firebaseAuthConfig.googleWebClientId.trim();
  if (configuredGoogleWebClientId === webClientId) {
    return;
  }

  const iosClientId = firebaseAuthConfig.googleIosClientId.trim();
  const config =
    Platform.OS === 'ios' && hasGoogleIosClientId()
      ? { iosClientId, offlineAccess: false, webClientId }
      : { offlineAccess: false, webClientId };

  GoogleSignin.configure(config);
  configuredGoogleWebClientId = webClientId;
}

function mapFirebaseUser(user: User | null): ParentAuthUser | null {
  if (!user) {
    return null;
  }

  return {
    displayName: user.displayName || undefined,
    email: user.email || undefined,
    providerIds: user.providerData.map(provider => provider.providerId),
    uid: user.uid,
  };
}

async function revokeAppleToken(auth: Auth) {
  if (!isAppleSignInAvailable()) {
    return;
  }

  const response = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.REFRESH,
  });

  if (!response.authorizationCode) {
    throw new ParentAuthError(
      'missingAppleAuthorizationCode',
      'Apple sign-in did not return an authorization code.',
    );
  }

  await revokeToken(auth, response.authorizationCode);
}

function hasProvider(user: User, providerId: string) {
  return user.providerData.some(provider => provider.providerId === providerId);
}

function normalizeParentAuthError(error: unknown): ParentAuthError {
  if (error instanceof ParentAuthError) {
    return error;
  }

  return new ParentAuthError(
    getParentAuthErrorCode(error),
    getErrorMessage(error) || 'Firebase authentication failed.',
    error,
  );
}

function isFirebaseConfigError(error: unknown) {
  const code = getErrorCode(error);
  const message = getErrorMessage(error);

  return (
    code.includes('app/no-app') ||
    code.includes('core/no-app') ||
    message.includes('No Firebase App') ||
    message.includes('DEFAULT app') ||
    message.includes('no configured default app')
  );
}

function getErrorCode(error: unknown) {
  if (error instanceof ParentAuthError) {
    return error.code;
  }

  if (isErrorWithCode(error)) {
    return error.code;
  }

  if (isRecord(error) && typeof error.code === 'string') {
    return error.code;
  }

  return '';
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}
