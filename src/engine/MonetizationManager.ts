import { useSyncExternalStore } from 'react';
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
import { getRemoteMonetizationConfigSnapshot } from '../services/RemoteMonetizationConfig';

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
  | 'promotional';

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
  isAuthReady: boolean;
  isConfigured: boolean;
  isSignedIn: boolean;
  managementUrl?: string;
  packages: readonly MonetizationPackage[];
  pendingAction: MonetizationPendingAction;
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
  | 'failed'
  | 'restored'
  | 'signInRequired'
  | 'unavailable'
  | 'withoutPremium';

export type PurchaseErrorDisposition = 'cancelled' | 'failed' | 'pending';

const initialSnapshot: MonetizationSnapshot = {
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
let customerInfoListener: CustomerInfoUpdateListener | null = null;
let lifecycleSubscriberCount = 0;
let identityOperation = 0;
let revenueCatLogoutOperation: Promise<CustomerInfo> | null = null;

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
      detachCustomerInfoListener();
    }
  };
}

export async function refreshMonetization(options?: { invalidate?: boolean }) {
  if (!configured) {
    return snapshot;
  }

  updateSnapshot({ ...snapshot, pendingAction: 'refresh' });

  try {
    if (options?.invalidate) {
      await Purchases.invalidateCustomerInfoCache();
    }

    const [customerInfo] = await Promise.all([
      Purchases.getCustomerInfo(),
      refreshOfferings(),
    ]);
    applyCustomerInfo(customerInfo, latestAuthSnapshot);
  } catch (error) {
    updateSnapshot({
      ...snapshot,
      errorCode: normalizeErrorCode(error),
      pendingAction: null,
      status: snapshot.status === 'premium' ? snapshot.status : 'unavailable',
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
    applyCustomerInfo(result.customerInfo, latestAuthSnapshot);
    return getMonetizationSnapshot().status === 'premium'
      ? 'purchased'
      : 'failed';
  } catch (error) {
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

  updateSnapshot({
    ...snapshot,
    errorCode: undefined,
    pendingAction: 'restore',
  });
  setParentPurchaseFlowActive(true);

  try {
    const customerInfo = await Purchases.restorePurchases();
    applyCustomerInfo(customerInfo, latestAuthSnapshot);
    return snapshot.status === 'premium' ? 'restored' : 'withoutPremium';
  } catch (error) {
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

  if (!authSnapshot.isReady) {
    updateSnapshot({
      ...snapshot,
      isAuthReady: false,
      pendingAction: 'identity',
      status: 'initializing',
    });
    return;
  }

  const apiKey = getRevenueCatPlatformApiKey();
  if (!apiKey) {
    updateSnapshot({
      ...snapshot,
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
      ...snapshot,
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
    ...snapshot,
    errorCode: undefined,
    isAuthReady: true,
    isSignedIn: Boolean(userId),
    pendingAction: 'identity',
    status: 'initializing',
    userId,
  });

  try {
    if (!configured) {
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

    updateSnapshot({
      ...snapshot,
      errorCode: configured ? 'identityFailed' : normalizeErrorCode(error),
      isAuthReady: true,
      isConfigured: configured,
      isSignedIn: Boolean(userId),
      pendingAction: null,
      status: 'unavailable',
      userId,
    });
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
    isAuthReady: true,
    isConfigured: configured,
    isSignedIn: false,
    packages: [],
    pendingAction: null,
    status: 'signedOut',
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
  updateSnapshot(
    mapCustomerInfoToMonetizationSnapshot(snapshot, customerInfo, authSnapshot),
  );
}

export function mapCustomerInfoToMonetizationSnapshot(
  currentSnapshot: MonetizationSnapshot,
  customerInfo: CustomerInfo,
  authSnapshot: ParentAuthSnapshot,
): MonetizationSnapshot {
  const entitlement = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
  const verificationFailed = Boolean(
    entitlement?.verification === Purchases.VERIFICATION_RESULT.FAILED ||
      customerInfo.entitlements.verification ===
        Purchases.VERIFICATION_RESULT.FAILED,
  );
  const hasPremium = Boolean(entitlement?.isActive && !verificationFailed);

  return {
    ...currentSnapshot,
    activeProductType: hasPremium
      ? getActiveProductType(entitlement)
      : undefined,
    errorCode: verificationFailed ? 'verificationFailed' : undefined,
    expirationDate: hasPremium
      ? entitlement?.expirationDate ?? undefined
      : undefined,
    isAuthReady: authSnapshot.isReady,
    isConfigured: true,
    isSignedIn: Boolean(authSnapshot.user),
    managementUrl: customerInfo.managementURL ?? undefined,
    pendingAction: null,
    status: !authSnapshot.user
      ? 'signedOut'
      : verificationFailed
      ? 'unavailable'
      : hasPremium
      ? 'premium'
      : 'free',
    userId: authSnapshot.user?.uid,
    willRenew: hasPremium ? Boolean(entitlement?.willRenew) : false,
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

function attachCustomerInfoListener() {
  if (!configured || customerInfoListener) {
    return;
  }

  customerInfoListener = customerInfo => {
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
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      // Monetization observers must not break the shared purchase lifecycle.
    }
  }
}
