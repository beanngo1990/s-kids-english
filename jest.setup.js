/* global jest */

require('react-native-gesture-handler/jestSetup');

const mockAsyncStorage = new Map();

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    clear: jest.fn(() => {
      mockAsyncStorage.clear();
      return Promise.resolve();
    }),
    getItem: jest.fn(key => Promise.resolve(mockAsyncStorage.get(key) ?? null)),
    removeItem: jest.fn(key => {
      mockAsyncStorage.delete(key);
      return Promise.resolve();
    }),
    setItem: jest.fn((key, value) => {
      mockAsyncStorage.set(key, value);
      return Promise.resolve();
    }),
  },
}));

const mockPurchases = {
  ENTITLEMENT_VERIFICATION_MODE: {
    INFORMATIONAL: 'INFORMATIONAL',
  },
  LOG_LEVEL: {
    ERROR: 'ERROR',
    WARN: 'WARN',
  },
  PACKAGE_TYPE: {
    ANNUAL: 'ANNUAL',
    LIFETIME: 'LIFETIME',
    MONTHLY: 'MONTHLY',
  },
  PURCHASES_ERROR_CODE: {
    CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
    INSUFFICIENT_PERMISSIONS_ERROR: 'INSUFFICIENT_PERMISSIONS_ERROR',
    INVALID_CREDENTIALS_ERROR: 'INVALID_CREDENTIALS_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    OFFLINE_CONNECTION_ERROR: 'OFFLINE_CONNECTION_ERROR',
    PAYMENT_PENDING_ERROR: 'PAYMENT_PENDING_ERROR',
    PRODUCT_REQUEST_TIMED_OUT_ERROR: 'PRODUCT_REQUEST_TIMED_OUT_ERROR',
    PURCHASE_CANCELLED_ERROR: 'PURCHASE_CANCELLED_ERROR',
    PURCHASE_NOT_ALLOWED_ERROR: 'PURCHASE_NOT_ALLOWED_ERROR',
  },
  VERIFICATION_RESULT: {
    FAILED: 'FAILED',
  },
  addCustomerInfoUpdateListener: jest.fn(),
  configure: jest.fn(),
  getCustomerInfo: jest.fn(),
  getOfferings: jest.fn(),
  invalidateCustomerInfoCache: jest.fn(),
  logIn: jest.fn(),
  logOut: jest.fn(),
  purchasePackage: jest.fn(),
  removeCustomerInfoUpdateListener: jest.fn(),
  restorePurchases: jest.fn(),
  setLogHandler: jest.fn(),
};

jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: mockPurchases,
}));
