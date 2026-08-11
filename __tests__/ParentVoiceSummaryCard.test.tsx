import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';

import type { VoiceRecordingWordEntry } from '../src/engine/VoiceRecordingStore';

const mockEntries: VoiceRecordingWordEntry[] = [];
const mockCancelNarration = jest.fn(() => Promise.resolve());
const mockPlayVoiceRecording = jest.fn((_uri?: string) => Promise.resolve());

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

jest.mock('../src/engine/VoiceRecordingStore', () => ({
  getVoiceRecordingWords: () => Promise.resolve(mockEntries),
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

import { ParentVoiceSummaryCard } from '../src/components/ParentVoiceSummaryCard';

function createEntry(
  word: string,
  index: number,
  withLatest = false,
): VoiceRecordingWordEntry {
  const first = {
    accent: 'en-US' as const,
    createdAt: `2026-08-${String(index + 1).padStart(2, '0')}T05:00:00.000Z`,
    durationMs: 1200,
    encounterId: `encounter-${index}`,
    id: `sample-${index}`,
    lessonId: 'morning-routine',
    sceneId: 'wake-up',
    stepId: 'speak',
    themeId: 'mot-ngay-cua-be',
    uri: `file:///voice/${index}.wav`,
    vocabId: `word-${index}`,
    word,
  };
  const latest = withLatest
    ? {
        ...first,
        createdAt: '2026-08-11T05:00:00.000Z',
        encounterId: `encounter-latest-${index}`,
        id: `sample-latest-${index}`,
        uri: `file:///voice/latest-${index}.wav`,
      }
    : undefined;

  return {
    first,
    key: `${first.lessonId}:${first.vocabId}`,
    latest,
    latestCreatedAt: latest?.createdAt ?? first.createdAt,
    lessonId: first.lessonId,
    sampleCount: latest ? 2 : 1,
    themeId: first.themeId,
    vocabId: first.vocabId,
    word,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockEntries.splice(
    0,
    mockEntries.length,
    createEntry('good morning', 0, true),
    createEntry('toothbrush', 1),
    createEntry('breakfast', 2),
    createEntry('pajamas', 3),
  );
});

test('shows at most three recent logical words and opens the full library', async () => {
  const onOpen = jest.fn();
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await act(async () => {
    renderer = ReactTestRenderer.create(
      <ParentVoiceSummaryCard onOpen={onOpen} />,
    );
    await Promise.resolve();
  });

  const text = renderer!.root
    .findAllByType(Text)
    .map(node => node.props.children)
    .flat(Infinity);
  expect(text).toContain('good morning');
  expect(text).toContain('toothbrush');
  expect(text).toContain('breakfast');
  expect(text).not.toContain('pajamas');
  expect(text).toContain('2 mốc');

  const button = renderer!.root.findByProps({
    accessibilityLabel: 'Xem tất cả',
  });
  act(() => button.props.onPress());
  expect(onOpen).toHaveBeenCalledTimes(1);
  expect(mockCancelNarration).toHaveBeenCalledTimes(1);

  act(() => renderer!.unmount());
});

test('plays the latest milestone directly from a recent word', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await act(async () => {
    renderer = ReactTestRenderer.create(
      <ParentVoiceSummaryCard onOpen={jest.fn()} />,
    );
    await Promise.resolve();
  });

  const play = renderer!.root.findByProps({
    accessibilityLabel: 'Nghe bé đọc từ good morning',
  });
  await act(async () => {
    play.props.onPress();
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(mockPlayVoiceRecording).toHaveBeenCalledTimes(1);
  expect(mockPlayVoiceRecording).toHaveBeenCalledWith(
    'file:///voice/latest-0.wav',
  );

  await act(async () => renderer!.unmount());
  expect(mockCancelNarration).toHaveBeenCalledTimes(1);
});
