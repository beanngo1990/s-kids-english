let mockAppStateListener:
  | ((state: 'active' | 'background' | 'inactive') => void)
  | null = null;
const mockRemoveAppStateListener = jest.fn();
const mockResolveAssetSource = jest.fn((_asset: unknown) => ({
  uri: 'asset:/ui/audio/music/sungy-background.mp3',
}));

jest.mock('react-native', () => ({
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(
      (
        _event: string,
        listener: (state: 'active' | 'background' | 'inactive') => void,
      ) => {
        mockAppStateListener = listener;
        return { remove: mockRemoveAppStateListener };
      },
    ),
  },
  Image: {
    resolveAssetSource: (asset: unknown) => mockResolveAssetSource(asset),
  },
}));

let mockParentSettingsListener:
  | ((settings: { backgroundMusicEnabled: boolean }) => void)
  | null = null;
const mockUnsubscribeParentSettings = jest.fn();

jest.mock('../src/engine/ParentSettingsManager', () => ({
  getParentSettings: jest.fn(),
  subscribeParentSettings: jest.fn(
    (listener: (settings: { backgroundMusicEnabled: boolean }) => void) => {
      mockParentSettingsListener = listener;
      return mockUnsubscribeParentSettings;
    },
  ),
}));

jest.mock('../src/engine/AudioManager', () => ({
  DEFAULT_BACKGROUND_MUSIC_VOLUME: 0.16,
  playBackgroundMusicUri: jest.fn(() => Promise.resolve(true)),
  stopBackgroundMusic: jest.fn(() => Promise.resolve(true)),
}));

import {
  playBackgroundMusicUri,
  stopBackgroundMusic,
} from '../src/engine/AudioManager';
import type { ParentSettings } from '../src/engine/ParentSettingsManager';
import {
  isBackgroundMusicSuppressedRoute,
  setBackgroundMusicSuppressedByRoute,
  startBackgroundMusicManager,
} from '../src/engine/BackgroundMusicManager';
import { getParentSettings } from '../src/engine/ParentSettingsManager';

const mockGetParentSettings = getParentSettings as jest.MockedFunction<
  typeof getParentSettings
>;
const mockPlayBackgroundMusicUri =
  playBackgroundMusicUri as jest.MockedFunction<
    typeof playBackgroundMusicUri
  >;
const mockStopBackgroundMusic = stopBackgroundMusic as jest.MockedFunction<
  typeof stopBackgroundMusic
>;

let stopManager: (() => void) | null = null;

beforeEach(() => {
  jest.clearAllMocks();
  mockAppStateListener = null;
  mockParentSettingsListener = null;
  mockGetParentSettings.mockResolvedValue(enabledParentSettings);
  setBackgroundMusicSuppressedByRoute(false);
});

afterEach(() => {
  stopManager?.();
  stopManager = null;
  setBackgroundMusicSuppressedByRoute(false);
});

test('suppresses background music on active learning routes', () => {
  expect(isBackgroundMusicSuppressedRoute('ScenePlayer')).toBe(true);
  expect(isBackgroundMusicSuppressedRoute('ReviewGame')).toBe(true);
  expect(
    isBackgroundMusicSuppressedRoute('SceneVocabularyPlayground'),
  ).toBe(true);
  expect(isBackgroundMusicSuppressedRoute('LessonPack')).toBe(false);
});

test('stops music while a learning route is active and resumes after leaving', async () => {
  stopManager = startBackgroundMusicManager();
  expect(mockAppStateListener).toEqual(expect.any(Function));
  expect(mockParentSettingsListener).toEqual(expect.any(Function));

  mockParentSettingsListener?.(enabledParentSettings);
  mockAppStateListener?.('active');
  setBackgroundMusicSuppressedByRoute(true);
  await flushBackgroundMusicWork();
  expect(mockPlayBackgroundMusicUri).not.toHaveBeenCalled();

  setBackgroundMusicSuppressedByRoute(false);
  await flushBackgroundMusicWork();

  expect(mockResolveAssetSource).toHaveBeenCalled();
  expect(mockPlayBackgroundMusicUri).toHaveBeenCalledWith(
    'asset:/ui/audio/music/sungy-background.mp3',
    0.16,
  );

  mockStopBackgroundMusic.mockClear();
  setBackgroundMusicSuppressedByRoute(true);
  await flushBackgroundMusicWork();

  expect(mockStopBackgroundMusic).toHaveBeenCalledTimes(1);

  mockPlayBackgroundMusicUri.mockClear();
  setBackgroundMusicSuppressedByRoute(false);
  await flushBackgroundMusicWork();

  expect(mockPlayBackgroundMusicUri).toHaveBeenCalledWith(
    'asset:/ui/audio/music/sungy-background.mp3',
    0.16,
  );
});

async function flushBackgroundMusicWork() {
  for (let index = 0; index < 5; index += 1) {
    await Promise.resolve();
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}

const enabledParentSettings: ParentSettings = {
  appLanguage: 'vi',
  appTheme: 'system',
  backgroundMusicEnabled: true,
  childProfile: {
    avatarEmoji: '*',
    name: 'Kid',
  },
  cloudProgressSync: {
    enabled: false,
  },
  crashReportingEnabled: false,
  englishAccent: 'en-US',
  hasCompletedOnboarding: true,
  journeyMode: 'guided',
  learningMode: 'core',
  reminderEnabled: false,
  reminderTime: '19:30',
  teacherPromptMode: 'vi',
  voiceRecordingLibrary: { enabled: false },
};
