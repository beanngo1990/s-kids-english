import React from 'react';
import { Alert, Text } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';

const mockCancelNarration = jest.fn(() => Promise.resolve());
const mockClearVoiceRecordings = jest.fn();
const mockDeleteVoiceRecordingSample = jest.fn();
const mockPlayVoiceRecording = jest.fn((_uri?: string) => Promise.resolve());
const mockReplace = jest.fn();
const mockRetryPendingVoiceRecordingDeletions = jest.fn(() =>
  Promise.resolve<string[]>([]),
);
const mockVoiceEntries: unknown[] = [];

jest.mock('@react-navigation/native', () => {
  const react = jest.requireActual<typeof import('react')>('react');
  return {
    useFocusEffect: (effect: () => void | (() => void)) => {
      react.useEffect(effect, [effect]);
    },
  };
});

jest.mock('../src/engine/AudioManager', () => ({
  cancelNarration: () => mockCancelNarration(),
}));

jest.mock('../src/engine/ParentAccessSession', () => ({
  useParentAccessSnapshot: () => ({ isGranted: true }),
}));

jest.mock('../src/engine/VoiceRecordingStore', () => ({
  clearVoiceRecordings: () => mockClearVoiceRecordings(),
  deleteVoiceRecordingSample: (sampleId: string) =>
    mockDeleteVoiceRecordingSample(sampleId),
  deleteVoiceRecordingWord: jest.fn(),
  deleteVoiceRecordingsForLesson: jest.fn(),
  deleteVoiceRecordingsForTheme: jest.fn(),
  getVoiceRecordingWords: () => Promise.resolve(mockVoiceEntries),
  retryPendingVoiceRecordingDeletions: () =>
    mockRetryPendingVoiceRecordingDeletions(),
  subscribeVoiceRecordings: () => () => undefined,
}));

jest.mock('../src/engine/VoiceRecorder', () => ({
  playVoiceRecording: (uri: string) => mockPlayVoiceRecording(uri),
}));

jest.mock('../src/i18n', () => {
  const actual = jest.requireActual('../src/i18n');
  return {
    ...actual,
    useI18n: () => actual.createTranslator('vi'),
    useSavedAppLanguage: () => 'vi',
  };
});

import { ParentVoiceLibraryScreen } from '../src/screens/ParentVoiceLibraryScreen';

beforeEach(() => {
  jest.clearAllMocks();
  mockVoiceEntries.splice(0, mockVoiceEntries.length);
});

test('stops voice playback when the parent leaves the library', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await act(async () => {
    renderer = ReactTestRenderer.create(
      <ParentVoiceLibraryScreen
        navigation={{ replace: mockReplace } as never}
        route={{ key: 'voice-library', name: 'ParentVoiceLibrary' }}
      />,
    );
    await Promise.resolve();
  });

  expect(mockCancelNarration).not.toHaveBeenCalled();

  await act(async () => renderer!.unmount());
  expect(mockCancelNarration).toHaveBeenCalledTimes(1);
});

test('retries only pending files after a granular delete cleanup failure', async () => {
  const sample = {
    accent: 'en-US',
    createdAt: '2026-08-11T05:00:00.000Z',
    durationMs: 1200,
    encounterId: 'encounter-1',
    id: 'sample-1',
    lessonId: 'morning-routine',
    sceneId: 'wake-up',
    stepId: 'speak',
    themeId: 'mot-ngay-cua-be',
    uri: 'file:///voice/sample-1.wav',
    vocabId: 'good-morning',
    word: 'good morning',
  };
  mockVoiceEntries.push({
    first: sample,
    key: 'morning-routine:good-morning',
    latestCreatedAt: sample.createdAt,
    lessonId: sample.lessonId,
    sampleCount: 1,
    themeId: sample.themeId,
    vocabId: sample.vocabId,
    word: sample.word,
  });
  mockDeleteVoiceRecordingSample.mockResolvedValue({
    deletedSamples: [sample],
    failedUris: [sample.uri],
    fileCleanupFailed: true,
  });
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await act(async () => {
    renderer = ReactTestRenderer.create(
      <ParentVoiceLibraryScreen
        navigation={{ replace: mockReplace } as never}
        route={{ key: 'voice-library', name: 'ParentVoiceLibrary' }}
      />,
    );
    await Promise.resolve();
  });

  const deleteSample = renderer!.root.findByProps({
    accessibilityLabel: 'Xóa mốc ghi âm này',
  });
  act(() => deleteSample.props.onPress());

  const confirmButtons = alert.mock.calls[0]?.[2];
  await act(async () => {
    confirmButtons?.[1]?.onPress?.();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(alert.mock.calls[1]?.[0]).toBe('Một số tệp chưa được dọn xong');
  const cleanupButtons = alert.mock.calls[1]?.[2];
  await act(async () => {
    cleanupButtons?.[1]?.onPress?.();
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(mockRetryPendingVoiceRecordingDeletions).toHaveBeenCalledTimes(1);
  expect(mockClearVoiceRecordings).not.toHaveBeenCalled();

  alert.mockRestore();
  await act(async () => renderer!.unmount());
});

test('keeps full milestone copy and compact actions while playing', async () => {
  const firstSample = {
    accent: 'en-US',
    createdAt: '2026-08-11T05:00:00.000Z',
    durationMs: 1200,
    encounterId: 'encounter-layout',
    id: 'sample-layout-first',
    lessonId: 'morning-routine',
    sceneId: 'wake-up',
    stepId: 'speak',
    themeId: 'mot-ngay-cua-be',
    uri: 'file:///voice/sample-layout-first.wav',
    vocabId: 'blanket',
    word: 'blanket',
  };
  const latestSample = {
    ...firstSample,
    createdAt: '2026-08-12T05:00:00.000Z',
    encounterId: 'encounter-layout-latest',
    id: 'sample-layout-latest',
    uri: 'file:///voice/sample-layout-latest.wav',
  };
  mockVoiceEntries.push({
    first: firstSample,
    key: 'morning-routine:blanket',
    latest: latestSample,
    latestCreatedAt: latestSample.createdAt,
    lessonId: firstSample.lessonId,
    sampleCount: 2,
    themeId: firstSample.themeId,
    vocabId: firstSample.vocabId,
    word: firstSample.word,
  });
  let finishPlayback: (() => void) | undefined;
  mockPlayVoiceRecording.mockImplementationOnce(
    () =>
      new Promise<void>(resolve => {
        finishPlayback = resolve;
      }),
  );
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await act(async () => {
    renderer = ReactTestRenderer.create(
      <ParentVoiceLibraryScreen
        navigation={{ replace: mockReplace } as never}
        route={{ key: 'voice-library', name: 'ParentVoiceLibrary' }}
      />,
    );
    await Promise.resolve();
  });

  const play = renderer!.root
    .findAllByProps({ accessibilityLabel: 'Nghe bé đọc từ blanket' })
    .find(node => typeof node.props.onPress === 'function');
  let playbackPromise: Promise<void> | undefined;
  await act(async () => {
    playbackPromise = play?.props.onPress();
    await Promise.resolve();
  });

  const textNodes = renderer!.root.findAllByType(Text);
  const visibleText = textNodes.map(node => node.props.children).flat(Infinity);
  const latestMeta = textNodes.find(
    node =>
      Array.isArray(node.props.children) &&
      node.props.children.flat(Infinity).join('') ===
        '12/08/2026 · 1 giây',
  );
  expect(visibleText).toContain('…');
  expect(visibleText).toContain('Lần đầu');
  expect(visibleText).toContain('Gần đây');
  expect(visibleText).toContain('11/08/2026');
  expect(visibleText).toContain('12/08/2026');
  expect(visibleText).toContain(' · 1 giây');
  expect(visibleText).not.toContain('2 mốc');
  expect(visibleText).not.toContain('Nghe');
  expect(visibleText).not.toContain('Xóa');
  expect(visibleText).not.toContain('Đang phát…');
  expect(
    textNodes.find(node => node.props.children === 'Gần đây')?.props
      .numberOfLines,
  ).toBeUndefined();
  expect(latestMeta?.props.numberOfLines).toBeUndefined();

  await act(async () => {
    finishPlayback?.();
    await playbackPromise;
  });
  await act(async () => renderer!.unmount());
});
