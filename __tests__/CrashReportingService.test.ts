import AsyncStorage from '@react-native-async-storage/async-storage';

const mockCrashlyticsInstance = {
  isCrashlyticsCollectionEnabled: false,
};

jest.mock('@react-native-firebase/crashlytics', () => ({
  __esModule: true,
  checkForUnsentReports: jest.fn(() => Promise.resolve(false)),
  deleteUnsentReports: jest.fn(() => Promise.resolve(undefined)),
  getCrashlytics: jest.fn(() => mockCrashlyticsInstance),
  sendUnsentReports: jest.fn(),
  setAttributes: jest.fn(() => Promise.resolve(null)),
  setCrashlyticsCollectionEnabled: jest.fn(() => Promise.resolve(null)),
  setUserId: jest.fn(() => Promise.resolve(null)),
}));

import { saveParentSettings } from '../src/engine/ParentSettingsManager';
import {
  applyCrashReportingConsent,
  discardPendingCrashReports,
  getCrashReportingState,
  refreshPendingCrashReport,
  startCrashReporting,
  stopCrashReporting,
  subscribeCrashReportingState,
} from '../src/services/CrashReportingService';

const crashlyticsMock = jest.requireMock('@react-native-firebase/crashlytics');
const mockCheckForUnsentReports =
  crashlyticsMock.checkForUnsentReports as jest.Mock;
const mockDeleteUnsentReports = crashlyticsMock.deleteUnsentReports as jest.Mock;
const mockGetCrashlytics = crashlyticsMock.getCrashlytics as jest.Mock;
const mockSendUnsentReports = crashlyticsMock.sendUnsentReports as jest.Mock;
const mockSetAttributes = crashlyticsMock.setAttributes as jest.Mock;
const mockSetCrashlyticsCollectionEnabled =
  crashlyticsMock.setCrashlyticsCollectionEnabled as jest.Mock;
const mockSetUserId = crashlyticsMock.setUserId as jest.Mock;

describe('CrashReportingService', () => {
  beforeEach(async () => {
    stopCrashReporting();
    mockCrashlyticsInstance.isCrashlyticsCollectionEnabled = false;
    mockGetCrashlytics.mockImplementation(() => mockCrashlyticsInstance);
    mockCheckForUnsentReports.mockResolvedValue(false);
    await AsyncStorage.clear();
    await refreshPendingCrashReport();
    jest.clearAllMocks();
  });

  afterEach(() => {
    stopCrashReporting();
  });

  test('keeps Crashlytics off and surfaces pending reports when parent has not opted in', async () => {
    mockCheckForUnsentReports.mockResolvedValue(true);

    await expect(applyCrashReportingConsent(false)).resolves.toBe(true);

    expect(mockSetCrashlyticsCollectionEnabled).toHaveBeenCalledWith(
      mockCrashlyticsInstance,
      false,
    );
    expect(mockCheckForUnsentReports).toHaveBeenCalledWith(
      mockCrashlyticsInstance,
    );
    expect(mockDeleteUnsentReports).not.toHaveBeenCalled();
    expect(mockSetUserId).toHaveBeenCalledWith(mockCrashlyticsInstance, '');
    expect(mockSetAttributes).not.toHaveBeenCalled();
    expect(getCrashReportingState().hasPendingCrashReport).toBe(true);
  });

  test('deletes pending reports only when parent chooses not to send them', async () => {
    await expect(discardPendingCrashReports()).resolves.toBe(true);

    expect(mockSetCrashlyticsCollectionEnabled).toHaveBeenCalledWith(
      mockCrashlyticsInstance,
      false,
    );
    expect(mockDeleteUnsentReports).toHaveBeenCalledWith(
      mockCrashlyticsInstance,
    );
    expect(mockSetUserId).toHaveBeenCalledWith(mockCrashlyticsInstance, '');
    expect(getCrashReportingState().hasPendingCrashReport).toBe(false);
  });

  test('enables technical crash reporting and sends pending reports after opt-in', async () => {
    mockCheckForUnsentReports.mockResolvedValue(true);

    await expect(applyCrashReportingConsent(true)).resolves.toBe(true);

    expect(mockCheckForUnsentReports).toHaveBeenCalledWith(
      mockCrashlyticsInstance,
    );
    expect(mockSendUnsentReports).toHaveBeenCalledWith(
      mockCrashlyticsInstance,
    );
    expect(mockDeleteUnsentReports).not.toHaveBeenCalled();
    expect(mockSetCrashlyticsCollectionEnabled).toHaveBeenCalledWith(
      mockCrashlyticsInstance,
      true,
    );
    expect(mockSetUserId).toHaveBeenCalledWith(mockCrashlyticsInstance, '');
    expect(mockSetAttributes).toHaveBeenCalledWith(
      mockCrashlyticsInstance,
      expect.objectContaining({
        crash_reporting_scope: 'technical_diagnostics_only',
        platform: expect.any(String),
      }),
    );
    expect(getCrashReportingState().hasPendingCrashReport).toBe(false);
  });

  test('does not check or send already-enabled reports on app startup', async () => {
    mockCrashlyticsInstance.isCrashlyticsCollectionEnabled = true;

    await expect(applyCrashReportingConsent(true)).resolves.toBe(true);

    expect(mockDeleteUnsentReports).not.toHaveBeenCalled();
    expect(mockCheckForUnsentReports).not.toHaveBeenCalled();
    expect(mockSendUnsentReports).not.toHaveBeenCalled();
    expect(mockSetCrashlyticsCollectionEnabled).toHaveBeenCalledWith(
      mockCrashlyticsInstance,
      true,
    );
  });

  test('does nothing when Crashlytics is unavailable', async () => {
    mockGetCrashlytics.mockImplementationOnce(() => {
      throw new Error('Crashlytics unavailable');
    });

    await expect(applyCrashReportingConsent(true)).resolves.toBe(false);

    expect(mockSetCrashlyticsCollectionEnabled).not.toHaveBeenCalled();
    expect(getCrashReportingState().isAvailable).toBe(false);
  });

  test('notifies subscribers when pending report state changes', async () => {
    const listener = jest.fn();
    const unsubscribe = subscribeCrashReportingState(listener);

    mockCheckForUnsentReports.mockResolvedValue(true);
    await refreshPendingCrashReport();

    expect(listener).toHaveBeenLastCalledWith(
      expect.objectContaining({ hasPendingCrashReport: true }),
    );

    unsubscribe();
  });

  test('syncs Crashlytics collection when parent settings change', async () => {
    await saveParentSettings(
      { crashReportingEnabled: false },
      { touchUpdatedAt: false },
    );

    startCrashReporting();
    await flushAsyncWork();

    expect(mockSetCrashlyticsCollectionEnabled).toHaveBeenLastCalledWith(
      mockCrashlyticsInstance,
      false,
    );

    await saveParentSettings(
      { crashReportingEnabled: true },
      { touchUpdatedAt: false },
    );
    await flushAsyncWork();

    expect(mockSetCrashlyticsCollectionEnabled).toHaveBeenLastCalledWith(
      mockCrashlyticsInstance,
      true,
    );
  });
});

async function flushAsyncWork() {
  await Promise.resolve();
  await Promise.resolve();
}
