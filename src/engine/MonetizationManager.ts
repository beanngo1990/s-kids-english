import { useSyncExternalStore } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import Purchases, {
  type CustomerInfo,
  type CustomerInfoUpdateListener,
  type PurchasesEntitlementInfo,
  type PurchasesPackage,
} from 'react-native-purchases';

import {
  DEFAULT_PREMIUM_OFFERING_ID,
  getRevenueCatPlatformApiKey,
  PREMIUM_ENTITLEMENT_ID,
  storeProductIds,
} from '../config/monetization';
import {
  initialParentAuthSnapshot,
  subscribeParentAuth,
  type ParentAuthSnapshot,
} from './ParentAuthManager';
import { setParentPurchaseFlowActive } from './ParentAccessSession';
import {
  getRemoteMonetizationConfigSnapshot,
  subscribeRemoteMonetizationConfig,
} from '../services/RemoteMonetizationConfig';
import { evaluateFounderAccess } from './FounderAccessPolicy';

export type MonetizationStatus =
  | 'initializing'
  | 'signedOut'
  | 'free'
  | 'premium'
  | 'unavailable';

export type MonetizationProductType =
  | 'monthly'
  | 'annual'
  | 'lifetime'
  | 'founder'
  | 'promotional';

export type MonetizationPremiumSource = 'founder' | 'revenueCat';

export type MonetizationPendingAction =
  | 'identity'
  | 'purchase'
  | 'refresh'
  | 'restore'
  | null;

export type MonetizationErrorCode =
  | 'configurationMissing'
  | 'firebaseUnavailable'
  | 'identityFailed'
  | 'network'
  | 'offeringsUnavailable'
  | 'purchaseNotAllowed'
  | 'store'
  | 'unknown'
  | 'verificationFailed';

export type MonetizationPackageType = 'monthly' | 'annual' | 'lifetime';

export type MonetizationPackage = Readonly<{
  currencyCode: string;
  description: string;
  identifier: string;
  packageType: MonetizationPackageType;
  price: number;
  pricePerMonthString?: string;
  priceString: string;
  subscriptionPeriod?: string;
  title: string;
}>;

export type MonetizationSnapshot = Readonly<{
  activeProductType?: MonetizationProductType;
  errorCode?: MonetizationErrorCode;
  expirationDate?: string;
  founderAccessActive: boolean;
  founderAccessExpirationDate?: string;
  isAuthReady: boolean;
  isConfigured: boolean;
  isSignedIn: boolean;
  managementUrl?: string;
  packages: readonly MonetizationPackage[];
  pendingAction: MonetizationPendingAction;
  premiumSource?: MonetizationPremiumSource;
  status: MonetizationStatus;
  userId?: string;
  willRenew: boolean;
}>;

export type PurchaseResult =
  | 'alreadyPremium'
  | 'cancelled'
  | 'failed'
  | 'pending'
  | 'purchased'
  | 'signInRequired'
  | 'unavailable';

export type RestoreResult =
  | 'cancelled'
  | 'failed'
  | 'restored'
  | 'signInRequired'
  | 'unavailable'
  | 'withoutPremium';

export type PurchaseErrorDisposition = 'cancelled' | 'failed' | 'pending';

const initialSnapshot: MonetizationSnapshot = {
  founderAccessActive: false,
  isAuthReady: false,
  isConfigured: false,
  isSignedIn: false,
  packages: [],
  pendingAction: null,
  status: 'initializing',
  willRenew: false,
};

const listeners = new Set<() => void>();
const nativePackages = new Map<string, PurchasesPackage>();

let snapshot = initialSnapshot;
let latestAuthSnapshot = initialParentAuthSnapshot;
let configured = false;
let configuredUserId: string | null = null;
let authUnsubscribe: (() => void) | null = null;
let remoteConfigUnsubscribe: (() => void) | null = null;
let appStateSubscription: { remove(): void } | null = null;
let customerInfoListener: CustomerInfoUpdateListener | null = null;
let latestCustomerInfo: CustomerInfo | null = null;
let lifecycleSubscriberCount = 0;
let identityOperation = 0;
let revenueCatLogHandlerConfigured = false;
let revenueCatLogoutOperation: Promise<CustomerInfo> | null = null;
let founderExpirationTimer: ReturnType<typeof setTimeout> | null = null;

const MAX_EXPIRATION_TIMER_MILLIS = 2_147_000_000;

export function getMonetizationSnapshot(): MonetizationSnapshot {
  return snapshot;
}

export function subscribeMonetization(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useMonetizationSnapshot() {
  return useSyncExternalStore(
    subscribeMonetization,
    getMonetizationSnapshot,
    getMonetizationSnapshot,
  );
}

export function startMonetization() {
  lifecycleSubscriberCount += 1;

  if (lifecycleSubscriberCount === 1) {
    attachCustomerInfoListener();
    reapplyLatestCustomerInfo();
    remoteConfigUnsubscribe = subscribeRemoteMonetizationConfig(() => {
      reapplyLatestCustomerInfo();
    });
    appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    authUnsubscribe = subscribeParentAuth(nextAuthSnapshot => {
      latestAuthSnapshot = nextAuthSnapshot;
      handleAuthSnapshot(nextAuthSnapshot).catch(() => undefined);
    });
  }

  return () => {
    lifecycleSubscriberCount = Math.max(0, lifecycleSubscriberCount - 1);
    if (lifecycleSubscriberCount === 0) {
      authUnsubscribe?.();
      authUnsubscribe = null;
      remoteConfigUnsubscribe?.();
      remoteConfigUnsubscribe = null;
      appStateSubscription?.remove();
      appStateSubscription = null;
      detachCustomerInfoListener();
      clearFounderExpirationTimer();
    }
  };
}

export async function refreshMonetization(options?: { invalidate?: boolean }) {
  if (!configured) {
    return snapshot;
  }

  const operation = identityOperation;
  const authSnapshot = latestAuthSnapshot;
  updateSnapshot({ ...snapshot, pendingAction: 'refresh' });

  try {
    if (options?.invalidate) {
      await Purchases.invalidateCustomerInfoCache();
    }

    const [customerInfo] = await Promise.all([
      Purchases.getCustomerInfo(),
      refreshOfferings(),
    ]);
    if (operation !== identityOperation) {
      return snapshot;
    }

    applyCustomerInfo(customerInfo, authSnapshot);
  } catch (error) {
    if (operation !== identityOperation) {
      return snapshot;
    }

    const currentAccessSnapshot = latestCustomerInfo
      ? mapCustomerInfoToMonetizationSnapshot(
          snapshot,
          latestCustomerInfo,
          latestAuthSnapshot,
        )
      : snapshot;
    updateSnapshot({
      ...currentAccessSnapshot,
      errorCode: normalizeErrorCode(error),
      pendingAction: null,
      status:
        currentAccessSnapshot.status === 'premium'
          ? currentAccessSnapshot.status
          : 'unavailable',
    });
  }

  return snapshot;
}

export async function purchaseMonetizationPackage(
  packageIdentifier: string,
): Promise<PurchaseResult> {
  if (!latestAuthSnapshot.user) {
    return 'signInRequired';
  }

  if (
    !configured ||
    !getRemoteMonetizationConfigSnapshot().premiumPurchaseEnabled
  ) {
    return 'unavailable';
  }

  if (snapshot.status === 'premium') {
    return 'alreadyPremium';
  }

  const operation = identityOperation;
  const authSnapshot = latestAuthSnapshot;
  const packageToPurchase = nativePackages.get(packageIdentifier);
  if (!packageToPurchase) {
    updateSnapshot({ ...snapshot, errorCode: 'offeringsUnavailable' });
    return 'unavailable';
  }

  updateSnapshot({
    ...snapshot,
    errorCode: undefined,
    pendingAction: 'purchase',
  });
  setParentPurchaseFlowActive(true);

  try {
    const result = await Purchases.purchasePackage(packageToPurchase);
    if (operation !== identityOperation) {
      return 'cancelled';
    }

    applyCustomerInfo(result.customerInfo, authSnapshot);
    return getMonetizationSnapshot().status === 'premium'
      ? 'purchased'
      : 'failed';
  } catch (error) {
    if (operation !== identityOperation) {
      return 'cancelled';
    }

    const errorDisposition = classifyPurchaseError(error);

    if (errorDisposition === 'cancelled') {
      updateSnapshot({ ...snapshot, pendingAction: null });
      return 'cancelled';
    }

    if (errorDisposition === 'pending') {
      updateSnapshot({ ...snapshot, pendingAction: null });
      return 'pending';
    }

    updateSnapshot({
      ...snapshot,
      errorCode: normalizeErrorCode(error),
      pendingAction: null,
    });
    return 'failed';
  } finally {
    setParentPurchaseFlowActive(false);
  }
}

export async function restoreMonetizationPurchases(): Promise<RestoreResult> {
  if (!latestAuthSnapshot.user) {
    return 'signInRequired';
  }

  if (!configured) {
    return 'unavailable';
  }

  const operation = identityOperation;
  const authSnapshot = latestAuthSnapshot;
  updateSnapshot({
    ...snapshot,
    errorCode: undefined,
    pendingAction: 'restore',
  });
  setParentPurchaseFlowActive(true);

  try {
    const customerInfo = await Purchases.restorePurchases();
    if (operation !== identityOperation) {
      return 'cancelled';
    }

    applyCustomerInfo(customerInfo, authSnapshot);
    return snapshot.premiumSource === 'revenueCat'
      ? 'restored'
      : 'withoutPremium';
  } catch (error) {
    if (operation !== identityOperation) {
      return 'cancelled';
    }

    updateSnapshot({
      ...snapshot,
      errorCode: normalizeErrorCode(error),
      pendingAction: null,
    });
    return 'failed';
  } finally {
    setParentPurchaseFlowActive(false);
  }
}

/**
 * Clears all parent-bound RevenueCat state after Firebase Auth account
 * deletion. Logging out is shared with the auth observer so both paths cannot
 * race into duplicate SDK logout calls.
 */
export async function resetMonetizationAfterAccountDeletion(): Promise<void> {
  identityOperation += 1;
  latestAuthSnapshot = { isReady: true, user: null };
  latestCustomerInfo = null;
  clearFounderExpirationTimer();
  nativePackages.clear();
  updateSnapshot(createSignedOutSnapshot());

  if (!configured) {
    return;
  }

  try {
    await Purchases.invalidateCustomerInfoCache();
  } catch {
    // Account deletion has already succeeded. Cache cleanup is best-effort and
    // must not surface an error that suggests the account still exists.
  }

  try {
    await logOutRevenueCatIdentity();
  } catch {
    // The server may already have deleted this RevenueCat customer. The local
    // snapshot remains cleared and the next authenticated identity logs in
    // explicitly.
  }

  if (!latestAuthSnapshot.user) {
    nativePackages.clear();
    updateSnapshot(createSignedOutSnapshot());
  }
}

async function handleAuthSnapshot(authSnapshot: ParentAuthSnapshot) {
  const operation = ++identityOperation;
  const userId = authSnapshot.user?.uid;
  latestCustomerInfo = null;
  clearFounderExpirationTimer();
  detachCustomerInfoListener();

  if (!authSnapshot.isReady) {
    updateSnapshot({
      ...clearPremiumAccessMetadata(snapshot),
      isAuthReady: false,
      pendingAction: 'identity',
      status: 'initializing',
    });
    return;
  }

  const apiKey = getRevenueCatPlatformApiKey();
  if (!apiKey) {
    updateSnapshot({
      ...clearPremiumAccessMetadata(snapshot),
      errorCode: 'configurationMissing',
      isAuthReady: true,
      isConfigured: false,
      isSignedIn: Boolean(userId),
      pendingAction: null,
      status: 'unavailable',
      userId,
    });
    return;
  }

  if (authSnapshot.configurationError && !userId) {
    updateSnapshot({
      ...clearPremiumAccessMetadata(snapshot),
      errorCode: 'firebaseUnavailable',
      isAuthReady: true,
      isSignedIn: false,
      pendingAction: null,
      status: 'unavailable',
      userId: undefined,
    });
    return;
  }

  updateSnapshot({
    ...clearPremiumAccessMetadata(snapshot),
    errorCode: undefined,
    isAuthReady: true,
    isSignedIn: Boolean(userId),
    pendingAction: 'identity',
    status: 'initializing',
    userId,
  });

  try {
    if (!configured) {
      configureRevenueCatLogHandler();
      Purchases.configure({
        apiKey,
        appUserID: userId ?? null,
        automaticDeviceIdentifierCollectionEnabled: false,
        diagnosticsEnabled: false,
        entitlementVerificationMode:
          Purchases.ENTITLEMENT_VERIFICATION_MODE.INFORMATIONAL,
        pendingTransactionsForPrepaidPlansEnabled: true,
      });
      configured = true;
      configuredUserId = userId ?? null;
      attachCustomerInfoListener();
    } else if (configuredUserId !== (userId ?? null)) {
      if (userId) {
        if (revenueCatLogoutOperation) {
          await revenueCatLogoutOperation.catch(() => undefined);
          if (operation !== identityOperation) {
            return;
          }
        }

        const result = await Purchases.logIn(userId);
        configuredUserId = userId;
        if (operation === identityOperation) {
          applyCustomerInfo(result.customerInfo, authSnapshot);
        }
      } else if (configuredUserId) {
        const customerInfo = await logOutRevenueCatIdentity();
        if (customerInfo && operation === identityOperation) {
          applyCustomerInfo(customerInfo, authSnapshot);
        }
      }
    }

    if (!userId && revenueCatLogoutOperation) {
      await revenueCatLogoutOperation;
    }

    if (operation !== identityOperation) {
      return;
    }

    const [customerInfo] = await Promise.all([
      Purchases.getCustomerInfo(),
      refreshOfferings(),
    ]);

    if (operation === identityOperation) {
      applyCustomerInfo(customerInfo, authSnapshot);
    }
  } catch (error) {
    if (operation !== identityOperation) {
      return;
    }

    if (latestCustomerInfo) {
      const resolvedSnapshot = mapCustomerInfoToMonetizationSnapshot(
        snapshot,
        latestCustomerInfo,
        authSnapshot,
      );
      updateSnapshot({
        ...resolvedSnapshot,
        errorCode: normalizeErrorCode(error),
        pendingAction: null,
      });
      return;
    }

    updateSnapshot({
      ...clearPremiumAccessMetadata(snapshot),
      errorCode: configured ? 'identityFailed' : normalizeErrorCode(error),
      isAuthReady: true,
      isConfigured: configured,
      isSignedIn: Boolean(userId),
      pendingAction: null,
      status: 'unavailable',
      userId,
    });
  } finally {
    if (operation === identityOperation) {
      attachCustomerInfoListener();
    }
  }
}

async function logOutRevenueCatIdentity(): Promise<CustomerInfo | undefined> {
  if (!configured) {
    return undefined;
  }

  if (revenueCatLogoutOperation) {
    return revenueCatLogoutOperation;
  }

  if (!configuredUserId) {
    return undefined;
  }

  // Clear synchronously so another auth snapshot reuses this in-flight logout
  // instead of starting a second SDK identity transition.
  configuredUserId = null;
  const operation = Purchases.logOut();
  revenueCatLogoutOperation = operation;

  try {
    return await operation;
  } finally {
    if (revenueCatLogoutOperation === operation) {
      revenueCatLogoutOperation = null;
    }
  }
}

function createSignedOutSnapshot(): MonetizationSnapshot {
  return {
    founderAccessActive: false,
    isAuthReady: true,
    isConfigured: configured,
    isSignedIn: false,
    packages: [],
    pendingAction: null,
    status: 'signedOut',
    willRenew: false,
  };
}

function clearPremiumAccessMetadata(
  currentSnapshot: MonetizationSnapshot,
): MonetizationSnapshot {
  return {
    ...currentSnapshot,
    activeProductType: undefined,
    expirationDate: undefined,
    founderAccessActive: false,
    founderAccessExpirationDate: undefined,
    managementUrl: undefined,
    premiumSource: undefined,
    willRenew: false,
  };
}

async function refreshOfferings() {
  if (!configured) {
    return;
  }

  try {
    const offerings = await Purchases.getOfferings();
    const offering =
      offerings.current ?? offerings.all[DEFAULT_PREMIUM_OFFERING_ID] ?? null;
    nativePackages.clear();

    const mappedPackages = (offering?.availablePackages ?? [])
      .map(mapPackage)
      .filter((item): item is MonetizationPackage => Boolean(item))
      .sort((first, second) => packageOrder(first) - packageOrder(second));

    updateSnapshot({
      ...snapshot,
      errorCode: mappedPackages.length > 0 ? undefined : 'offeringsUnavailable',
      packages: mappedPackages,
    });
  } catch {
    updateSnapshot({ ...snapshot, errorCode: 'offeringsUnavailable' });
  }
}

function mapPackage(
  nativePackage: PurchasesPackage,
): MonetizationPackage | null {
  const packageType = normalizePackageType(nativePackage);
  if (!packageType) {
    return null;
  }

  nativePackages.set(nativePackage.identifier, nativePackage);
  const { product } = nativePackage;

  return {
    currencyCode: product.currencyCode,
    description: product.description,
    identifier: nativePackage.identifier,
    packageType,
    price: product.price,
    pricePerMonthString: product.pricePerMonthString ?? undefined,
    priceString: product.priceString,
    subscriptionPeriod: product.subscriptionPeriod ?? undefined,
    title: product.title,
  };
}

function normalizePackageType(
  nativePackage: PurchasesPackage,
): MonetizationPackageType | null {
  if (nativePackage.packageType === Purchases.PACKAGE_TYPE.MONTHLY) {
    return 'monthly';
  }

  if (nativePackage.packageType === Purchases.PACKAGE_TYPE.ANNUAL) {
    return 'annual';
  }

  if (nativePackage.packageType === Purchases.PACKAGE_TYPE.LIFETIME) {
    return 'lifetime';
  }

  return null;
}

function packageOrder(item: MonetizationPackage) {
  if (item.packageType === 'monthly') {
    return 0;
  }

  if (item.packageType === 'annual') {
    return 1;
  }

  return 2;
}

function applyCustomerInfo(
  customerInfo: CustomerInfo,
  authSnapshot: ParentAuthSnapshot,
) {
  latestCustomerInfo = customerInfo;
  updateSnapshot(
    mapCustomerInfoToMonetizationSnapshot(snapshot, customerInfo, authSnapshot),
  );
}

export function mapCustomerInfoToMonetizationSnapshot(
  currentSnapshot: MonetizationSnapshot,
  customerInfo: CustomerInfo,
  authSnapshot: ParentAuthSnapshot,
  deviceNowMillis = Date.now(),
): MonetizationSnapshot {
  const entitlement = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
  const verificationFailed = Boolean(
    entitlement?.verification === Purchases.VERIFICATION_RESULT.FAILED ||
      customerInfo.entitlements.verification ===
        Purchases.VERIFICATION_RESULT.FAILED,
  );
  const hasRevenueCatPremium = Boolean(
    entitlement?.isActive && !verificationFailed,
  );
  const remoteConfig = getRemoteMonetizationConfigSnapshot();
  const founderAccess = evaluateFounderAccess(
    customerInfo,
    {
      cutoffAt: remoteConfig.founderPremiumCutoffAt,
      durationDays: remoteConfig.founderPremiumDurationDays,
    },
    deviceNowMillis,
  );
  const founderAccessActive = founderAccess.isActive && !verificationFailed;
  const hasFounderPremium = Boolean(
    authSnapshot.user && founderAccessActive && !hasRevenueCatPremium,
  );
  const hasPremium = Boolean(
    authSnapshot.user && (hasRevenueCatPremium || hasFounderPremium),
  );

  return {
    ...currentSnapshot,
    activeProductType: hasPremium
      ? hasRevenueCatPremium
        ? getActiveProductType(entitlement)
        : 'founder'
      : undefined,
    errorCode: verificationFailed ? 'verificationFailed' : undefined,
    expirationDate: hasPremium
      ? hasRevenueCatPremium
        ? entitlement?.expirationDate ?? undefined
        : founderAccess.expirationDate
      : undefined,
    founderAccessActive,
    founderAccessExpirationDate: founderAccessActive
      ? founderAccess.expirationDate
      : undefined,
    isAuthReady: authSnapshot.isReady,
    isConfigured: true,
    isSignedIn: Boolean(authSnapshot.user),
    managementUrl: customerInfo.managementURL ?? undefined,
    pendingAction: null,
    premiumSource: hasPremium
      ? hasRevenueCatPremium
        ? 'revenueCat'
        : 'founder'
      : undefined,
    status: !authSnapshot.user
      ? 'signedOut'
      : verificationFailed
      ? 'unavailable'
      : hasPremium
      ? 'premium'
      : 'free',
    userId: authSnapshot.user?.uid,
    willRenew:
      hasPremium && hasRevenueCatPremium
        ? Boolean(entitlement?.willRenew)
        : false,
  };
}

function getActiveProductType(
  entitlement: PurchasesEntitlementInfo | undefined,
): MonetizationProductType | undefined {
  if (!entitlement) {
    return undefined;
  }

  if (entitlement.store === 'PROMOTIONAL') {
    return 'promotional';
  }

  if (!entitlement.expirationDate) {
    return 'lifetime';
  }

  const productId = entitlement.productIdentifier;
  const productPlanId = entitlement.productPlanIdentifier;
  if (productId === storeProductIds.ios.annual || productPlanId === 'annual') {
    return 'annual';
  }

  if (
    productId === storeProductIds.ios.monthly ||
    productPlanId === 'monthly'
  ) {
    return 'monthly';
  }

  return 'monthly';
}

function configureRevenueCatLogHandler() {
  if (revenueCatLogHandlerConfigured || !__DEV__) {
    return;
  }

  Purchases.setLogHandler((logLevel, message) => {
    const formattedMessage = `[RevenueCat] ${message}`;
    if (logLevel === Purchases.LOG_LEVEL.ERROR) {
      console.warn(formattedMessage);
      return;
    }

    if (logLevel === Purchases.LOG_LEVEL.WARN) {
      console.warn(formattedMessage);
    }
  });
  revenueCatLogHandlerConfigured = true;
}

function attachCustomerInfoListener() {
  if (!configured || customerInfoListener) {
    return;
  }

  const listenerIdentityOperation = identityOperation;
  customerInfoListener = customerInfo => {
    if (listenerIdentityOperation !== identityOperation) {
      return;
    }

    applyCustomerInfo(customerInfo, latestAuthSnapshot);
  };
  Purchases.addCustomerInfoUpdateListener(customerInfoListener);
}

function detachCustomerInfoListener() {
  if (!customerInfoListener) {
    return;
  }

  Purchases.removeCustomerInfoUpdateListener(customerInfoListener);
  customerInfoListener = null;
}

function normalizeErrorCode(error: unknown): MonetizationErrorCode {
  const purchasesErrorCode = getPurchasesErrorCode(error);

  if (
    purchasesErrorCode === Purchases.PURCHASES_ERROR_CODE.NETWORK_ERROR ||
    purchasesErrorCode ===
      Purchases.PURCHASES_ERROR_CODE.OFFLINE_CONNECTION_ERROR ||
    purchasesErrorCode ===
      Purchases.PURCHASES_ERROR_CODE.PRODUCT_REQUEST_TIMED_OUT_ERROR
  ) {
    return 'network';
  }

  if (
    purchasesErrorCode ===
      Purchases.PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR ||
    purchasesErrorCode ===
      Purchases.PURCHASES_ERROR_CODE.INSUFFICIENT_PERMISSIONS_ERROR
  ) {
    return 'purchaseNotAllowed';
  }

  if (
    purchasesErrorCode === Purchases.PURCHASES_ERROR_CODE.CONFIGURATION_ERROR ||
    purchasesErrorCode ===
      Purchases.PURCHASES_ERROR_CODE.INVALID_CREDENTIALS_ERROR
  ) {
    return 'configurationMissing';
  }

  if (purchasesErrorCode) {
    return 'store';
  }

  return 'unknown';
}

export function classifyPurchaseError(
  error: unknown,
): PurchaseErrorDisposition {
  const purchasesErrorCode = getPurchasesErrorCode(error);

  if (
    getBooleanField(error, 'userCancelled') ||
    purchasesErrorCode ===
      Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
  ) {
    return 'cancelled';
  }

  if (
    purchasesErrorCode === Purchases.PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR
  ) {
    return 'pending';
  }

  return 'failed';
}

function getPurchasesErrorCode(error: unknown) {
  if (isRecord(error) && typeof error.code === 'string') {
    return error.code;
  }

  return '';
}

function getBooleanField(error: unknown, field: string) {
  return isRecord(error) && error[field] === true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function updateSnapshot(nextSnapshot: MonetizationSnapshot) {
  snapshot = nextSnapshot;
  scheduleFounderExpiration(nextSnapshot);
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      // Monetization observers must not break the shared purchase lifecycle.
    }
  }
}

function handleAppStateChange(nextState: AppStateStatus) {
  if (nextState === 'active') {
    reapplyLatestCustomerInfo();
  }
}

function reapplyLatestCustomerInfo() {
  if (!latestCustomerInfo) {
    return;
  }

  updateSnapshot(
    mapCustomerInfoToMonetizationSnapshot(
      snapshot,
      latestCustomerInfo,
      latestAuthSnapshot,
    ),
  );
}

function scheduleFounderExpiration(nextSnapshot: MonetizationSnapshot) {
  clearFounderExpirationTimer();
  if (
    !nextSnapshot.founderAccessActive ||
    !nextSnapshot.founderAccessExpirationDate
  ) {
    return;
  }

  const expirationMillis = Date.parse(
    nextSnapshot.founderAccessExpirationDate,
  );
  if (!Number.isFinite(expirationMillis)) {
    return;
  }

  const remainingMillis = expirationMillis - Date.now();
  founderExpirationTimer = setTimeout(
    reapplyLatestCustomerInfo,
    Math.max(0, Math.min(remainingMillis, MAX_EXPIRATION_TIMER_MILLIS)),
  );
}

function clearFounderExpirationTimer() {
  if (!founderExpirationTimer) {
    return;
  }

  clearTimeout(founderExpirationTimer);
  founderExpirationTimer = null;
}
