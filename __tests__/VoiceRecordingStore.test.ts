import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  MAX_STORED_VOICE_SAMPLES,
  VOICE_RECORDINGS_STORAGE_KEY,
  clearVoiceRecordings,
  configureVoiceRecordingFileAdapter,
  deleteVoiceRecordingWord,
  getVoiceRecordingSamples,
  getVoiceRecordingWords,
  reconcileVoiceRecordingStorage,
  retryPendingVoiceRecordingDeletions,
  saveVoiceRecordingCandidate,
  subscribeVoiceRecordings,
  upsertVoiceRecordingSample,
  type SaveVoiceRecordingCandidateInput,
  type VoiceRecordingFileAdapter,
  type VoiceRecordingSample,
} from '../src/engine/VoiceRecordingStore';

const mockClearStoredVoiceRecordings = jest.fn(() => Promise.resolve(true));
const mockPromoteVoiceRecording = jest.fn(
  (_tempUri: string, recordingId: string) =>
    Promise.resolve(`file:///voice-recordings/${recordingId}.wav`),
);
const mockDeleteStoredVoiceRecording = jest.fn(() => Promise.resolve(true));

const fileAdapter: VoiceRecordingFileAdapter = {
  clearStoredVoiceRecordings: mockClearStoredVoiceRecordings,
  deleteStoredVoiceRecording: mockDeleteStoredVoiceRecording,
  promoteVoiceRecording: mockPromoteVoiceRecording,
};
const mockAsyncStorageSetItem = AsyncStorage.setItem as jest.MockedFunction<
  typeof AsyncStorage.setItem
>;
const baseAsyncStorageSetItemImplementation =
  mockAsyncStorageSetItem.getMockImplementation();

if (!baseAsyncStorageSetItemImplementation) {
  throw new Error('AsyncStorage test implementation is unavailable.');
}

beforeEach(async () => {
  jest.clearAllMocks();
  mockAsyncStorageSetItem.mockImplementation(
    baseAsyncStorageSetItemImplementation,
  );
  await AsyncStorage.clear();
  configureVoiceRecordingFileAdapter(fileAdapter);
  mockPromoteVoiceRecording.mockImplementation((_tempUri, recordingId) =>
    Promise.resolve(`file:///voice-recordings/${recordingId}.wav`),
  );
  mockDeleteStoredVoiceRecording.mockResolvedValue(true);
  mockClearStoredVoiceRecordings.mockResolvedValue(true);
});

afterAll(() => {
  configureVoiceRecordingFileAdapter(null);
});

test('keeps first and latest encounters while replacing a re-recorded encounter', async () => {
  const listener = jest.fn();
  const unsubscribe = subscribeVoiceRecordings(listener);
  const first = await saveVoiceRecordingCandidate(
    candidate({
      createdAt: '2026-08-01T08:00:00.000Z',
      encounterId: 'lesson-run-1:step-water',
      tempUri: 'file:///cache/first.wav',
    }),
  );

  expect(first.entry).toMatchObject({
    first: { id: first.sample.id },
    sampleCount: 1,
  });
  expect(first.entry.latest).toBeUndefined();

  const retake = await saveVoiceRecordingCandidate(
    candidate({
      createdAt: '2026-08-01T08:00:03.000Z',
      durationMs: 1800,
      encounterId: 'lesson-run-1:step-water',
      tempUri: 'file:///cache/retake.wav',
    }),
  );

  expect(retake.sample.id).toBe(first.sample.id);
  expect(retake.entry).toMatchObject({
    first: {
      createdAt: '2026-08-01T08:00:03.000Z',
      durationMs: 1800,
      id: first.sample.id,
    },
    sampleCount: 1,
  });
  expect(retake.entry.latest).toBeUndefined();
  expect(mockDeleteStoredVoiceRecording).not.toHaveBeenCalled();

  const second = await saveVoiceRecordingCandidate(
    candidate({
      createdAt: '2026-08-08T08:00:00.000Z',
      encounterId: 'lesson-run-2:step-water',
      tempUri: 'file:///cache/second.wav',
    }),
  );
  const third = await saveVoiceRecordingCandidate(
    candidate({
      createdAt: '2026-08-15T08:00:00.000Z',
      encounterId: 'lesson-run-3:step-water',
      tempUri: 'file:///cache/third.wav',
    }),
  );

  expect(third.entry.first.id).toBe(first.sample.id);
  expect(third.entry.latest?.id).toBe(third.sample.id);
  expect(third.entry.sampleCount).toBe(2);
  expect(third.replacedUris).toEqual([second.sample.uri]);
  expect(mockDeleteStoredVoiceRecording).toHaveBeenCalledWith(
    second.sample.uri,
  );
  expect(await getVoiceRecordingSamples()).toHaveLength(2);
  expect(listener).toHaveBeenCalledTimes(4);
  unsubscribe();
});

test('serializes concurrent saves through one operation queue', async () => {
  let activePromotions = 0;
  let maximumActivePromotions = 0;
  mockPromoteVoiceRecording.mockImplementation(
    async (_tempUri, recordingId) => {
      activePromotions += 1;
      maximumActivePromotions = Math.max(
        maximumActivePromotions,
        activePromotions,
      );
      await Promise.resolve();
      activePromotions -= 1;
      return `file:///voice-recordings/${recordingId}.wav`;
    },
  );

  await Promise.all([
    saveVoiceRecordingCandidate(
      candidate({
        createdAt: '2026-08-01T08:00:00.000Z',
        encounterId: 'encounter-a',
        tempUri: 'file:///cache/a.wav',
      }),
    ),
    saveVoiceRecordingCandidate(
      candidate({
        createdAt: '2026-08-02T08:00:00.000Z',
        encounterId: 'encounter-b',
        tempUri: 'file:///cache/b.wav',
      }),
    ),
  ]);

  expect(maximumActivePromotions).toBe(1);
  await expect(getVoiceRecordingWords()).resolves.toMatchObject([
    { sampleCount: 2 },
  ]);
});

test('rejects non-local recording URIs before native promotion', async () => {
  await expect(
    saveVoiceRecordingCandidate(
      candidate({ tempUri: 'https://example.com/recording.wav' }),
    ),
  ).rejects.toThrow('Voice recording candidate URI is invalid.');

  expect(mockPromoteVoiceRecording).not.toHaveBeenCalled();
});

test('does not delete an indexed stable URI when a same-encounter commit fails', async () => {
  const first = await saveVoiceRecordingCandidate(
    candidate({ tempUri: 'file:///cache/first.wav' }),
  );
  jest.clearAllMocks();
  mockAsyncStorageSetItem.mockRejectedValueOnce(
    new Error('storage unavailable'),
  );

  await expect(
    saveVoiceRecordingCandidate(
      candidate({
        durationMs: 1800,
        tempUri: 'file:///cache/retake.wav',
      }),
    ),
  ).rejects.toThrow('storage unavailable');

  expect(mockDeleteStoredVoiceRecording).not.toHaveBeenCalled();
  await expect(getVoiceRecordingSamples()).resolves.toEqual([first.sample]);
});

test('keeps newly indexed audio when cleanup-state persistence fails after commit', async () => {
  await saveVoiceRecordingCandidate(
    candidate({
      createdAt: '2026-08-01T08:00:00.000Z',
      encounterId: 'encounter-first',
      tempUri: 'file:///cache/first.wav',
    }),
  );
  const second = await saveVoiceRecordingCandidate(
    candidate({
      createdAt: '2026-08-02T08:00:00.000Z',
      encounterId: 'encounter-second',
      tempUri: 'file:///cache/second.wav',
    }),
  );
  jest.clearAllMocks();

  mockAsyncStorageSetItem
    .mockImplementationOnce((key, value) =>
      baseAsyncStorageSetItemImplementation(key, value),
    )
    .mockRejectedValueOnce(new Error('cleanup checkpoint failed'));
  const third = await saveVoiceRecordingCandidate(
    candidate({
      createdAt: '2026-08-03T08:00:00.000Z',
      encounterId: 'encounter-third',
      tempUri: 'file:///cache/third.wav',
    }),
  );

  expect(mockDeleteStoredVoiceRecording).toHaveBeenCalledWith(
    second.sample.uri,
  );
  expect(mockDeleteStoredVoiceRecording).not.toHaveBeenCalledWith(
    third.sample.uri,
  );
  const entries = await getVoiceRecordingWords();
  expect(entries[0].latest?.id).toBe(third.sample.id);
});

test('prunes the least recently updated word as a unit at the global cap', async () => {
  const samplesById: Record<string, VoiceRecordingSample> = {
    oldest_first: storedSample({
      createdAt: '2026-01-01T00:00:00.000Z',
      encounterId: 'oldest-encounter-1',
      id: 'oldest_first',
      lessonId: 'oldest-lesson',
      uri: 'file:///voice-recordings/oldest-first.wav',
      vocabId: 'oldest-vocab',
      word: 'oldest word',
    }),
    oldest_latest: storedSample({
      createdAt: '2026-01-01T00:01:00.000Z',
      encounterId: 'oldest-encounter-2',
      id: 'oldest_latest',
      lessonId: 'oldest-lesson',
      uri: 'file:///voice-recordings/oldest-latest.wav',
      vocabId: 'oldest-vocab',
      word: 'oldest word',
    }),
  };
  for (let index = 0; index < MAX_STORED_VOICE_SAMPLES - 2; index += 1) {
    const id = `sample_${String(index).padStart(3, '0')}`;
    samplesById[id] = storedSample({
      createdAt: new Date(Date.UTC(2026, 0, 2, 0, index)).toISOString(),
      id,
      lessonId: `lesson-${index}`,
      uri: `file:///voice-recordings/${id}.wav`,
      vocabId: `vocab-${index}`,
      word: `word ${index}`,
    });
  }
  await AsyncStorage.setItem(
    VOICE_RECORDINGS_STORAGE_KEY,
    JSON.stringify({ pendingDeletionUris: [], samplesById }),
  );

  const result = await upsertVoiceRecordingSample(
    storedSample({
      createdAt: '2026-08-11T08:00:00.000Z',
      encounterId: 'new-encounter',
      id: 'new_sample',
      lessonId: 'new-lesson',
      uri: 'file:///voice-recordings/new_sample.wav',
      vocabId: 'new-vocab',
      word: 'new word',
    }),
  );

  expect(result.prunedUris).toEqual([
    'file:///voice-recordings/oldest-first.wav',
    'file:///voice-recordings/oldest-latest.wav',
  ]);
  expect(mockDeleteStoredVoiceRecording).toHaveBeenCalledWith(
    'file:///voice-recordings/oldest-first.wav',
  );
  const samples = await getVoiceRecordingSamples();
  expect(samples).toHaveLength(MAX_STORED_VOICE_SAMPLES - 1);
  expect(samples.some(sample => sample.id === 'oldest_first')).toBe(false);
  expect(samples.some(sample => sample.id === 'oldest_latest')).toBe(false);
  expect(samples.some(sample => sample.id === 'new_sample')).toBe(true);
});

test('removes metadata immediately and retains failed file cleanup for retry', async () => {
  await upsertVoiceRecordingSample(storedSample({ id: 'sample_to_delete' }));
  mockClearStoredVoiceRecordings.mockRejectedValueOnce(new Error('file busy'));

  const deletion = await clearVoiceRecordings();

  expect(deletion.deletedSamples).toHaveLength(1);
  expect(deletion.failedUris).toEqual(['file:///voice-recordings/sample.wav']);
  expect(deletion.fileCleanupFailed).toBe(true);
  await expect(getVoiceRecordingSamples()).resolves.toEqual([]);
  expect(
    JSON.parse(
      (await AsyncStorage.getItem(VOICE_RECORDINGS_STORAGE_KEY)) ?? '{}',
    ),
  ).toMatchObject({
    pendingDeletionUris: ['file:///voice-recordings/sample.wav'],
    samplesById: {},
  });

  await expect(retryPendingVoiceRecordingDeletions()).resolves.toEqual([]);
  await expect(
    AsyncStorage.getItem(VOICE_RECORDINGS_STORAGE_KEY),
  ).resolves.toBeNull();
});

test('bulk clear invokes native cleanup even when metadata is empty', async () => {
  const deletion = await clearVoiceRecordings();

  expect(deletion).toEqual({
    deletedSamples: [],
    failedUris: [],
    fileCleanupFailed: false,
  });
  expect(mockClearStoredVoiceRecordings).toHaveBeenCalledTimes(1);
});

test('reconciles orphan storage on startup when no samples are indexed', async () => {
  await reconcileVoiceRecordingStorage();

  expect(mockClearStoredVoiceRecordings).toHaveBeenCalledTimes(1);
  expect(mockDeleteStoredVoiceRecording).not.toHaveBeenCalled();
});

test('retries only pending URIs during startup when samples remain', async () => {
  const activeSample = storedSample({ id: 'active_sample' });
  await AsyncStorage.setItem(
    VOICE_RECORDINGS_STORAGE_KEY,
    JSON.stringify({
      pendingDeletionUris: [
        activeSample.uri,
        'file:///voice-recordings/old_sample.wav',
      ],
      samplesById: { active_sample: activeSample },
    }),
  );

  await reconcileVoiceRecordingStorage();

  expect(mockDeleteStoredVoiceRecording).toHaveBeenCalledWith(
    'file:///voice-recordings/old_sample.wav',
  );
  expect(mockDeleteStoredVoiceRecording).not.toHaveBeenCalledWith(
    activeSample.uri,
  );
  expect(mockClearStoredVoiceRecordings).not.toHaveBeenCalled();
  await expect(getVoiceRecordingSamples()).resolves.toEqual([activeSample]);
});

test('granular word deletion removes only its indexed native files', async () => {
  await upsertVoiceRecordingSample(storedSample({ id: 'water_first' }));
  await upsertVoiceRecordingSample(
    storedSample({
      encounterId: 'encounter-2',
      id: 'water_latest',
      uri: 'file:///voice-recordings/water-latest.wav',
    }),
  );
  await upsertVoiceRecordingSample(
    storedSample({
      id: 'milk_first',
      uri: 'file:///voice-recordings/milk.wav',
      vocabId: 'milk',
      word: 'milk',
    }),
  );
  jest.clearAllMocks();

  const deletion = await deleteVoiceRecordingWord('morning-routine', 'water');

  expect(deletion.deletedSamples).toHaveLength(2);
  expect(deletion.fileCleanupFailed).toBe(false);
  expect(mockDeleteStoredVoiceRecording).toHaveBeenCalledTimes(2);
  expect(mockClearStoredVoiceRecordings).not.toHaveBeenCalled();
  await expect(getVoiceRecordingSamples()).resolves.toMatchObject([
    { id: 'milk_first' },
  ]);
});

test('normalizes malformed records and retains only first and latest encounters', async () => {
  await AsyncStorage.setItem(
    VOICE_RECORDINGS_STORAGE_KEY,
    JSON.stringify({
      pendingDeletionUris: [null, '', 'file:///old.wav', 'file:///old.wav'],
      samplesById: {
        broken: { uri: 42 },
        first: storedSample({
          createdAt: '2026-08-01T08:00:00.000Z',
          encounterId: 'encounter-1',
          id: 'first',
        }),
        middle: storedSample({
          createdAt: '2026-08-02T08:00:00.000Z',
          encounterId: 'encounter-2',
          id: 'middle',
        }),
        latest: storedSample({
          createdAt: '2026-08-03T08:00:00.000Z',
          encounterId: 'encounter-3',
          id: 'latest',
        }),
      },
    }),
  );

  const entries = await getVoiceRecordingWords();

  expect(entries).toHaveLength(1);
  expect(entries[0].first.id).toBe('first');
  expect(entries[0].latest?.id).toBe('latest');
  expect(entries[0].sampleCount).toBe(2);
});

function candidate(
  overrides: Partial<SaveVoiceRecordingCandidateInput> = {},
): SaveVoiceRecordingCandidateInput {
  return {
    accent: 'en-US',
    createdAt: '2026-08-01T08:00:00.000Z',
    durationMs: 1200,
    encounterId: 'lesson-run-1:step-water',
    lessonId: 'morning-routine',
    sceneId: 'breakfast',
    stepId: 'teach-water',
    tempUri: 'file:///cache/sample.wav',
    themeId: 'mot-ngay-cua-be',
    vocabId: 'water',
    word: 'water',
    ...overrides,
  };
}

function storedSample(
  overrides: Partial<VoiceRecordingSample> = {},
): VoiceRecordingSample {
  return {
    accent: 'en-US',
    createdAt: '2026-08-01T08:00:00.000Z',
    durationMs: 1200,
    encounterId: 'encounter-1',
    id: 'sample',
    lessonId: 'morning-routine',
    sceneId: 'breakfast',
    stepId: 'teach-water',
    themeId: 'mot-ngay-cua-be',
    uri: 'file:///voice-recordings/sample.wav',
    vocabId: 'water',
    word: 'water',
    ...overrides,
  };
}
