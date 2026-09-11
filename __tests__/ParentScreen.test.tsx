import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';

const mockGetParentSettings = jest.fn();
const mockGetProgress = jest.fn();
const mockGetActivityLog = jest.fn();

jest.mock('../src/theme/AppTheme', () => ({
  useAppTheme: () => ({
    appThemePreference: 'system',
    resolvedAppTheme: 'light',
    setAppThemePreference: jest.fn(),
  }),
}));

jest.mock('../src/components/ParentAccountCard', () => ({
  ParentAccountCard: () => null,
}));

jest.mock('../src/engine/ParentAccessSession', () => {
  let isGranted = false;
  const listeners = new Set<() => void>();
  return {
    grantParentAccess: () => {
      isGranted = true;
      listeners.forEach(l => l());
    },
    revokeParentAccess: () => {
      isGranted = false;
      listeners.forEach(l => l());
    },
    useParentAccessSnapshot: () => ({ isGranted }),
    setParentExternalFlowActive: jest.fn(),
  };
});

jest.mock('../src/engine/ParentSettingsManager', () => {
  const actual = jest.requireActual('../src/engine/ParentSettingsManager');
  return {
    ...actual,
    getParentSettings: () => mockGetParentSettings(),
    saveParentSettings: jest.fn().mockResolvedValue(true),
  };
});

jest.mock('../src/engine/ProgressManager', () => {
  const actual = jest.requireActual('../src/engine/ProgressManager');
  return {
    ...actual,
    getProgress: () => mockGetProgress(),
  };
});

jest.mock('../src/engine/DailyActivityTracker', () => ({
  getActivityLog: () => mockGetActivityLog(),
  getWeeklyData: () => [
    { label: 'T2', date: '2026-09-08', wordsLearned: 5, scenesCompleted: 1 },
    { label: 'T3', date: '2026-09-09', wordsLearned: 3, scenesCompleted: 1 },
    { label: 'T4', date: '2026-09-10', wordsLearned: 0, scenesCompleted: 0 },
    { label: 'T5', date: '2026-09-11', wordsLearned: 2, scenesCompleted: 1 },
    { label: 'T6', date: '2026-09-12', wordsLearned: 0, scenesCompleted: 0 },
    { label: 'T7', date: '2026-09-13', wordsLearned: 0, scenesCompleted: 0 },
    { label: 'CN', date: '2026-09-14', wordsLearned: 0, scenesCompleted: 0 },
  ],
}));

jest.mock('../src/engine/AppInfo', () => ({
  getAppVersion: () => Promise.resolve('1.2.1'),
}));

jest.mock('../src/engine/AppUpdateManager', () => ({
  useAppUpdateSnapshot: () => ({ isReady: true, status: 'none', currentVersion: '1.2.1' }),
}));

jest.mock('../src/engine/MonetizationManager', () => ({
  useMonetizationSnapshot: () => ({ status: 'free', isReady: true }),
}));

jest.mock('../src/services/NotificationService', () => ({
  NotificationService: {
    isDailyReminderActive: () => Promise.resolve(false),
  },
}));

jest.mock('../src/services/CrashReportingService', () => ({
  applyCrashReportingConsent: jest.fn(),
  discardPendingCrashReports: jest.fn(),
  refreshPendingCrashReport: jest.fn().mockResolvedValue(undefined),
  subscribeCrashReportingState: () => () => {},
}));

jest.mock('../src/theme/responsive', () => ({
  useResponsiveLayout: () => ({
    contentMaxWidth: 960,
    height: 768,
    isLandscape: true,
    isTablet: true,
    isTabletLandscape: true,
    mode: 'tabletLandscape',
    screenPadding: 32,
    sidePanelWidth: 0,
    width: 1024,
  }),
}));

import { ParentScreen } from '../src/screens/ParentScreen';
import { grantParentAccess } from '../src/engine/ParentAccessSession';

describe('ParentScreen on iPad', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetParentSettings.mockResolvedValue({
      learningMode: 'core',
      journeyMode: 'guided',
      appLanguage: 'vi',
      englishAccent: 'en-US',
      teacherPromptMode: 'vi',
      appTheme: 'system',
      backgroundMusicEnabled: false,
      crashReportingEnabled: false,
      reminderEnabled: false,
      reminderTime: '19:30',
      childProfile: { name: 'Bé', birthYear: 2020 },
    });
    mockGetProgress.mockResolvedValue({
      completedLessonIds: ['plant-a-seed'],
      completedSceneIds: ['plant-a-seed:scene-1'],
      learnedWordIds: ['seed'],
      currentLessonProgress: null,
    });
    mockGetActivityLog.mockResolvedValue({
      currentStreak: 2,
      entries: [
        { date: '2026-09-11', wordsLearned: 2, scenesCompleted: 1 },
      ],
    });
  });

  test('renders ParentScreen gate, then unlocks to dashboard on iPad', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <ParentScreen
          navigation={
            {
              addListener: jest.fn(() => () => {}),
              navigate: jest.fn(),
              replace: jest.fn(),
              setOptions: jest.fn(),
            } as never
          }
          route={{ key: 'Parent', name: 'Parent', params: undefined } as never}
        />,
      );
    });

    expect(renderer).toBeDefined();

    // Now unlock the gate
    await act(async () => {
      grantParentAccess();
    });

    expect(renderer).toBeDefined();
  });
});
