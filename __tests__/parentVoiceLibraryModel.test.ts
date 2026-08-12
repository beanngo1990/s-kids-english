import type {
  VoiceRecordingSample,
  VoiceRecordingWordEntry,
} from '../src/engine/VoiceRecordingStore';
import {
  formatVoiceRecordingDate,
  groupVoiceRecordingWords,
} from '../src/screens/parentVoiceLibraryModel';

function createSample(
  id: string,
  overrides: Partial<VoiceRecordingSample> = {},
): VoiceRecordingSample {
  return {
    accent: 'en-US',
    createdAt: '2026-08-11T05:00:00.000Z',
    durationMs: 1400,
    encounterId: `encounter-${id}`,
    id,
    lessonId: 'morning-routine',
    sceneId: 'wake-up',
    stepId: 'say-good-morning',
    themeId: 'mot-ngay-cua-be',
    uri: `file:///voice/${id}.wav`,
    vocabId: 'good-morning',
    word: 'good morning',
    ...overrides,
  };
}

function createEntry(
  id: string,
  overrides: Partial<VoiceRecordingWordEntry> = {},
): VoiceRecordingWordEntry {
  const first = createSample(id, overrides.first);
  return {
    first,
    key: `${first.lessonId}:${first.vocabId}`,
    latestCreatedAt: first.createdAt,
    lessonId: first.lessonId,
    sampleCount: 1,
    themeId: first.themeId,
    vocabId: first.vocabId,
    word: first.word,
    ...overrides,
  };
}

test('groups voice words by catalog theme and lesson order', () => {
  const entries = [
    createEntry('park', {
      lessonId: 'park-visit',
      themeId: 'be-ra-ngoai-kham-pha',
      vocabId: 'slide',
      word: 'slide',
    }),
    createEntry('school', {
      lessonId: 'at-school',
      vocabId: 'teacher',
      word: 'teacher',
    }),
    createEntry('morning'),
  ];

  const groups = groupVoiceRecordingWords(entries);

  expect(groups.map(group => group.themeId)).toEqual([
    'mot-ngay-cua-be',
    'be-ra-ngoai-kham-pha',
  ]);
  expect(groups[0]?.lessons.map(group => group.lessonId)).toEqual([
    'morning-routine',
    'at-school',
  ]);
  expect(groups[1]?.lessons[0]?.entries[0]?.word).toBe('slide');
});

test('formats a stable local date for the selected app language', () => {
  const value = new Date(2026, 7, 11, 12).toISOString();

  expect(formatVoiceRecordingDate(value, 'vi')).toBe('11/08/2026');
  expect(formatVoiceRecordingDate(value, 'en')).toBe('08/11/2026');
  expect(formatVoiceRecordingDate('not-a-date', 'vi')).toBe('');
});
