import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  normalizeProgress,
  saveProgress,
  type ProgressChange,
  type ProgressListener,
} from '../src/engine/ProgressManager';
import { toCloudProgressData } from '../src/engine/CloudProgressMerge';
import {
  CLOUD_PROGRESS_ACTIVE_SUBSCRIBE_DELAY_MS,
  CLOUD_PROGRESS_BACKGROUND_WRITE_COOLDOWN_MS,
  CLOUD_PROGRESS_REMOTE_READ_COOLDOWN_MS,
  startCloudProgressSync,
  subscribeCloudProgressSync,
  type CloudProgressSyncStatus,
} from '../src/engine/CloudProgressSyncManager';

const PARENT_UID = 'parent-session-sync';

let mockAppStateListener: ((state: 'active' | 'background') => void) | null;
let mockAuthListener: ((snapshot: unknown) => void) | null;
let mockProgressListener: ProgressListener | null;
let mockRemoteListener: ((snapshot: unknown) => void) | null;
let mockSettingsListener: ((settings: unknown) => void) | null;

const mockRemoteUnsubscribe = jest.fn();
const mockSetDoc = jest.fn((_reference: unknown, _data: unknown) =>
  Promise.resolve(),
);
const mockSettings = {
  appLanguage: 'vi',
  appTheme: 'system',
  backgroundMusicEnabled: false,
  childProfile: {
    avatarEmoji: ':)',
    name: 'Sweet kid',
  },
  cloudProgressSync: {
    consentedAt: '2026-07-15T08:00:00.000Z',
    consentVersion: 1,
    enabled: true,
    ownerUid: PARENT_UID,
  },
  enableSceneEditor: false,
  englishAccent: 'en-US',
  hasCompletedOnboarding: true,
  journeyMode: 'guided',
  learningMode: 'core',
  reminderEnabled: false,
  reminderTime: '19:30',
  teacherPromptMode: 'vi',
  updatedAt: '2026-07-15T08:00:00.000Z',
};

jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(
      (_event: string, listener: typeof mockAppStateListener) => {
        mockAppStateListener = listener;
        return { remove: jest.fn() };
      },
    ),
    currentState: 'active',
  },
}));

jest.mock('@react-native-firebase/app', () => ({
  getApps: jest.fn(() => [{}]),
}));

jest.mock('@react-native-firebase/firestore', () => ({
  deleteDoc: jest.fn(() => Promise.resolve()),
  doc: jest.fn((_db: unknown, ...segments: string[]) => ({
    path: segments.join('/'),
  })),
  getDoc: jest.fn(() => Promise.resolve(mockCreateRemoteSettingsSnapshot())),
  getFirestore: jest.fn(() => ({})),
  onSnapshot: jest.fn(
    (
      _reference: unknown,
      _options: unknown,
      listener: typeof mockRemoteListener,
    ) => {
      mockRemoteListener = listener;
      return mockRemoteUnsubscribe;
    },
  ),
  serverTimestamp: jest.fn(() => ({ serverTimestamp: true })),
  setDoc: (reference: unknown, data: unknown) =>
    mockSetDoc(reference, data),
}));

jest.mock('../src/engine/ParentAuthManager', () => ({
  initialParentAuthSnapshot: { isReady: false, user: null },
  subscribeParentAuth: jest.fn((listener: typeof mockAuthListener) => {
    mockAuthListener = listener;
    return jest.fn();
  }),
}));

jest.mock('../src/engine/ParentSettingsManager', () => ({
  getParentSettings: jest.fn(() => Promise.resolve(mockSettings)),
  saveParentSettingsFromCloud: jest.fn(settings =>
    Promise.resolve({
      ...mockSettings,
      ...settings,
      cloudProgressSync: mockSettings.cloudProgressSync,
      enableSceneEditor: mockSettings.enableSceneEditor,
    }),
  ),
  saveParentSettings: jest.fn(settings => Promise.resolve(settings)),
  subscribeParentSettings: jest.fn(
    (listener: typeof mockSettingsListener) => {
      mockSettingsListener = listener;
      return jest.fn();
    },
  ),
}));

jest.mock('../src/engine/ProgressManager', () => {
  const actual = jest.requireActual('../src/engine/ProgressManager');
  return {
    ...actual,
    subscribeProgress: jest.fn((listener: ProgressListener) => {
      mockProgressListener = listener;
      return jest.fn();
    }),
  };
});

test('batches a foreground session and recovers dirty local data on the next open', async () => {
  jest.useFakeTimers({
    now: new Date('2026-07-15T08:00:00.000Z'),
  });
  let latestStatus: CloudProgressSyncStatus = 'loading';
  await AsyncStorage.clear();
  startCloudProgressSync();
  subscribeCloudProgressSync(snapshot => {
    latestStatus = snapshot.status;
  });
  await flushAsyncWork();

  mockSettingsListener?.(mockSettings);
  mockAuthListener?.({
    isReady: true,
    user: { uid: PARENT_UID },
  });
  await flushAsyncWork();

  const emptyProgress = normalizeProgress({});
  mockRemoteListener?.(createRemoteSnapshot(emptyProgress));
  await waitForStatus(() => latestStatus, 'synced');

  const timestampOnlyChange = normalizeProgress({
    updatedAt: '2026-07-15T09:00:00.000Z',
  });
  mockProgressListener?.({
    progress: timestampOnlyChange,
    source: 'local',
  } satisfies ProgressChange);
  mockAppStateListener?.('background');

  expect(mockSetDoc).not.toHaveBeenCalled();
  expect(mockRemoteUnsubscribe).toHaveBeenCalledTimes(1);

  mockAppStateListener?.('active');
  await flushAsyncWork();
  const firestoreMock = jest.requireMock('@react-native-firebase/firestore') as {
    onSnapshot: jest.Mock;
  };
  expect(firestoreMock.onSnapshot).toHaveBeenCalledTimes(1);
  await advanceAsync(CLOUD_PROGRESS_REMOTE_READ_COOLDOWN_MS);
  expect(firestoreMock.onSnapshot).toHaveBeenCalledTimes(2);
  mockRemoteListener?.(createRemoteSnapshot(emptyProgress));
  await waitForStatus(() => latestStatus, 'synced');

  mockProgressListener?.({
    progress: normalizeProgress({
      currentLessonProgress: {
        lessonId: 'lesson-a',
        sceneId: 'scene-a',
        stepId: 'step-a',
      },
      updatedAt: '2026-07-15T09:00:00.000Z',
    }),
    source: 'local',
  });
  expect(latestStatus).toBe('pending');

  mockProgressListener?.({
    progress: normalizeProgress({
      updatedAt: '2026-07-15T10:00:00.000Z',
    }),
    source: 'local',
  });
  expect(latestStatus).toBe('synced');

  mockProgressListener?.({
    progress: normalizeProgress({ totalXP: 4 }),
    source: 'local',
  });
  mockProgressListener?.({
    progress: normalizeProgress({ totalXP: 7 }),
    source: 'local',
  });

  expect(latestStatus).toBe('pending');
  expect(mockSetDoc).not.toHaveBeenCalled();

  mockAppStateListener?.('background');
  await flushAsyncWork();

  expect(mockSetDoc).toHaveBeenCalledTimes(1);
  expect(mockSetDoc.mock.calls[0]?.[1]).toMatchObject({
    ownerUid: PARENT_UID,
    progress: expect.objectContaining({ totalXP: 7 }),
  });
  expect(mockRemoteUnsubscribe).toHaveBeenCalledTimes(2);

  await flushAsyncWork();
  await saveProgress(normalizeProgress({ totalXP: 9 }));
  mockAppStateListener?.('active');
  await flushAsyncWork();
  expect(firestoreMock.onSnapshot).toHaveBeenCalledTimes(2);
  await advanceAsync(CLOUD_PROGRESS_ACTIVE_SUBSCRIBE_DELAY_MS);
  expect(firestoreMock.onSnapshot).toHaveBeenCalledTimes(2);
  await advanceAsync(
    CLOUD_PROGRESS_REMOTE_READ_COOLDOWN_MS -
      CLOUD_PROGRESS_ACTIVE_SUBSCRIBE_DELAY_MS,
  );
  expect(firestoreMock.onSnapshot).toHaveBeenCalledTimes(3);
  mockRemoteListener?.(
    createRemoteSnapshot(normalizeProgress({ totalXP: 7 })),
  );
  await waitForStatus(() => latestStatus, 'synced');

  expect(mockSetDoc).toHaveBeenCalledTimes(2);
  expect(mockSetDoc.mock.calls[1]?.[1]).toMatchObject({
    ownerUid: PARENT_UID,
    progress: expect.objectContaining({ totalXP: 9 }),
  });
  const deferredProgress = normalizeProgress({ totalXP: 10 });
  await saveProgress(deferredProgress);
  mockProgressListener?.({
    progress: deferredProgress,
    source: 'local',
  });
  mockAppStateListener?.('background');
  await flushAsyncWork();

  expect(mockSetDoc).toHaveBeenCalledTimes(2);
  await advanceAsync(
    Math.max(
      CLOUD_PROGRESS_BACKGROUND_WRITE_COOLDOWN_MS,
      CLOUD_PROGRESS_REMOTE_READ_COOLDOWN_MS,
    ),
  );
  mockAppStateListener?.('active');
  await advanceAsync(CLOUD_PROGRESS_ACTIVE_SUBSCRIBE_DELAY_MS);
  expect(firestoreMock.onSnapshot).toHaveBeenCalledTimes(4);
  mockRemoteListener?.(
    createRemoteSnapshot(normalizeProgress({ totalXP: 9 })),
  );
  await waitForStatus(() => latestStatus, 'synced');

  expect(mockSetDoc).toHaveBeenCalledTimes(3);
  expect(mockSetDoc.mock.calls[2]?.[1]).toMatchObject({
    ownerUid: PARENT_UID,
    progress: expect.objectContaining({ totalXP: 10 }),
  });
  jest.useRealTimers();
});

function createRemoteSnapshot(progress: ReturnType<typeof normalizeProgress>) {
  const data = {
    consentedAt: new Date('2026-07-15T08:00:00.000Z'),
    consentVersion: 1,
    ownerUid: PARENT_UID,
    progress: toCloudProgressData(progress),
    schemaVersion: 1,
    serverUpdatedAt: {
      toDate: () => new Date('2026-07-15T08:00:00.000Z'),
    },
  };

  return {
    data: () => data,
    exists: () => true,
    metadata: { fromCache: false, hasPendingWrites: false },
  };
}

function mockCreateRemoteSettingsSnapshot() {
  const data = {
    consentedAt: new Date('2026-07-15T08:00:00.000Z'),
    consentVersion: 1,
    ownerUid: PARENT_UID,
    schemaVersion: 1,
    serverUpdatedAt: {
      toDate: () => new Date('2026-07-15T08:00:00.000Z'),
    },
    settings: {
      appLanguage: mockSettings.appLanguage,
      appTheme: mockSettings.appTheme,
      childProfile: mockSettings.childProfile,
      englishAccent: mockSettings.englishAccent,
      hasCompletedOnboarding: mockSettings.hasCompletedOnboarding,
      journeyMode: mockSettings.journeyMode,
      learningMode: mockSettings.learningMode,
      reminderEnabled: mockSettings.reminderEnabled,
      reminderTime: mockSettings.reminderTime,
      teacherPromptMode: mockSettings.teacherPromptMode,
      updatedAt: mockSettings.updatedAt,
    },
  };

  return {
    data: () => data,
    exists: () => true,
    metadata: { fromCache: false, hasPendingWrites: false },
  };
}

async function flushAsyncWork() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

async function advanceAsync(ms: number) {
  jest.advanceTimersByTime(ms);
  await flushAsyncWork();
}

async function waitForStatus(
  getStatus: () => CloudProgressSyncStatus,
  expectedStatus: CloudProgressSyncStatus,
) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    if (getStatus() === expectedStatus) {
      return;
    }
    await flushAsyncWork();
  }

  throw new Error(
    `Expected cloud sync status ${expectedStatus}, received ${getStatus()}.`,
  );
}
