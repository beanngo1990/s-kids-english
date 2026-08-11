import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';

import { isEnglishAccent, type EnglishAccent } from '../types/audio';

export const VOICE_RECORDINGS_STORAGE_KEY = '@skidsenglish/voice-recordings/v1';
export const MAX_STORED_VOICE_SAMPLES = 100;

const RECORDING_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const MAX_IDENTIFIER_LENGTH = 160;
const MAX_WORD_LENGTH = 500;
const MAX_URI_LENGTH = 4096;
const MAX_RECORDING_DURATION_MS = 10 * 60 * 1000;

export type VoiceRecordingSample = {
  accent: EnglishAccent;
  createdAt: string;
  durationMs: number;
  encounterId: string;
  id: string;
  lessonId: string;
  sceneId: string;
  stepId: string;
  themeId: string;
  uri: string;
  vocabId: string;
  word: string;
};

export type VoiceRecordingWordEntry = {
  first: VoiceRecordingSample;
  key: string;
  latest?: VoiceRecordingSample;
  latestCreatedAt: string;
  lessonId: string;
  sampleCount: 1 | 2;
  themeId: string;
  vocabId: string;
  word: string;
};

export type SaveVoiceRecordingCandidateInput = {
  accent: EnglishAccent;
  createdAt?: string;
  durationMs: number;
  encounterId: string;
  lessonId: string;
  sceneId: string;
  stepId: string;
  tempUri: string;
  themeId: string;
  vocabId: string;
  word: string;
};

export type UpsertVoiceRecordingSampleInput = Omit<
  VoiceRecordingSample,
  'id'
> & {
  id?: string;
};

export type VoiceRecordingSaveResult = {
  entry: VoiceRecordingWordEntry;
  failedDeletionUris: string[];
  prunedUris: string[];
  replacedUris: string[];
  sample: VoiceRecordingSample;
};

export type VoiceRecordingDeletionResult = {
  deletedSamples: VoiceRecordingSample[];
  failedUris: string[];
  fileCleanupFailed: boolean;
};

export type VoiceRecordingFileAdapter = {
  clearStoredVoiceRecordings?: () => Promise<boolean>;
  deleteStoredVoiceRecording: (uri: string) => Promise<boolean>;
  promoteVoiceRecording: (
    tempUri: string,
    recordingId: string,
  ) => Promise<string>;
};

type VoiceRecordingStoreListener = (entries: VoiceRecordingWordEntry[]) => void;

type VoiceRecordingStoreState = {
  pendingDeletionUris: string[];
  samplesById: Record<string, VoiceRecordingSample>;
};

type NativeSkidsAudioModule = Partial<VoiceRecordingFileAdapter>;

const emptyVoiceRecordingStoreState: VoiceRecordingStoreState = {
  pendingDeletionUris: [],
  samplesById: {},
};

const voiceRecordingStoreListeners = new Set<VoiceRecordingStoreListener>();
let voiceRecordingOperationQueue: Promise<void> = Promise.resolve();
let voiceRecordingFileAdapterOverride: VoiceRecordingFileAdapter | undefined;

export function configureVoiceRecordingFileAdapter(
  adapter: VoiceRecordingFileAdapter | null,
) {
  voiceRecordingFileAdapterOverride = adapter ?? undefined;
}

export function subscribeVoiceRecordings(
  listener: VoiceRecordingStoreListener,
) {
  voiceRecordingStoreListeners.add(listener);
  return () => {
    voiceRecordingStoreListeners.delete(listener);
  };
}

export function getVoiceRecordingWordKey(lessonId: string, vocabId: string) {
  return JSON.stringify([lessonId, vocabId]);
}

export function getVoiceRecordingSamples(): Promise<VoiceRecordingSample[]> {
  return enqueueVoiceRecordingOperation(async () => {
    const state = await readVoiceRecordingStoreState();
    return getSortedSamples(state);
  });
}

export function getVoiceRecordingWords(): Promise<VoiceRecordingWordEntry[]> {
  return enqueueVoiceRecordingOperation(async () => {
    const state = await readVoiceRecordingStoreState();
    return buildVoiceRecordingWordEntries(state.samplesById);
  });
}

export async function getVoiceRecordingCount() {
  const samples = await getVoiceRecordingSamples();
  return samples.length;
}

export async function hasVoiceRecordings() {
  return (await getVoiceRecordingCount()) > 0;
}

export function reconcileVoiceRecordingStorage(): Promise<void> {
  return enqueueVoiceRecordingOperation(async () => {
    const state = await readVoiceRecordingStoreState();
    const adapter = getVoiceRecordingFileAdapterOrNull();
    if (!adapter) {
      return;
    }

    if (
      Object.keys(state.samplesById).length === 0 &&
      adapter.clearStoredVoiceRecordings
    ) {
      try {
        const didClear = await adapter.clearStoredVoiceRecordings();
        if (didClear) {
          await persistCleanupStateBestEffort(emptyVoiceRecordingStoreState);
        }
      } catch {
        // A later app start or explicit parent cleanup can retry.
      }
      return;
    }

    const cleanup = await cleanPendingDeletionUris(state);
    if (cleanup.state !== state) {
      await persistCleanupStateBestEffort(cleanup.state);
    }
  });
}

export function saveVoiceRecordingCandidate(
  input: SaveVoiceRecordingCandidateInput,
): Promise<VoiceRecordingSaveResult> {
  return enqueueVoiceRecordingOperation(async () => {
    const candidate = normalizeCandidateInput(input);
    const currentState = await readVoiceRecordingStoreState();
    const existingSample = findEncounterSample(
      currentState,
      candidate.lessonId,
      candidate.vocabId,
      candidate.encounterId,
    );
    const sampleId =
      existingSample?.id ?? createUniqueRecordingId(currentState);
    const adapter = getVoiceRecordingFileAdapter();
    const durableUri = await adapter.promoteVoiceRecording(
      candidate.tempUri,
      sampleId,
    );

    if (!normalizeUri(durableUri)) {
      if (typeof durableUri === 'string' && durableUri.length > 0) {
        await deleteStoredVoiceRecordingBestEffort(durableUri);
      }
      throw new Error(
        'Native voice recording storage returned an invalid URI.',
      );
    }

    const sample: VoiceRecordingSample = {
      accent: candidate.accent,
      createdAt: candidate.createdAt,
      durationMs: candidate.durationMs,
      encounterId: candidate.encounterId,
      id: sampleId,
      lessonId: candidate.lessonId,
      sceneId: candidate.sceneId,
      stepId: candidate.stepId,
      themeId: candidate.themeId,
      uri: durableUri,
      vocabId: candidate.vocabId,
      word: candidate.word,
    };

    let didCommitMetadata = false;
    try {
      return await persistUpsertedSample(currentState, sample, () => {
        didCommitMetadata = true;
      });
    } catch (error) {
      if (
        !didCommitMetadata &&
        (!existingSample || existingSample.uri !== durableUri)
      ) {
        await deleteStoredVoiceRecordingBestEffort(durableUri);
      }
      throw error;
    }
  });
}

export function upsertVoiceRecordingSample(
  input: UpsertVoiceRecordingSampleInput,
): Promise<VoiceRecordingSaveResult> {
  return enqueueVoiceRecordingOperation(async () => {
    const currentState = await readVoiceRecordingStoreState();
    const normalizedInput = normalizeUpsertInput(input);
    const existingSample = findEncounterSample(
      currentState,
      normalizedInput.lessonId,
      normalizedInput.vocabId,
      normalizedInput.encounterId,
    );
    const requestedId = input.id;
    const id =
      existingSample?.id ??
      (requestedId && RECORDING_ID_PATTERN.test(requestedId)
        ? requestedId
        : createUniqueRecordingId(currentState));

    if (
      !existingSample &&
      currentState.samplesById[id] &&
      currentState.samplesById[id].encounterId !== normalizedInput.encounterId
    ) {
      throw new Error('Voice recording ID is already in use.');
    }

    return persistUpsertedSample(currentState, {
      ...normalizedInput,
      id,
    });
  });
}

export function deleteVoiceRecordingSample(
  sampleId: string,
): Promise<VoiceRecordingDeletionResult> {
  return deleteMatchingVoiceRecordings(sample => sample.id === sampleId);
}

export function deleteVoiceRecordingWord(
  lessonId: string,
  vocabId: string,
): Promise<VoiceRecordingDeletionResult> {
  return deleteMatchingVoiceRecordings(
    sample => sample.lessonId === lessonId && sample.vocabId === vocabId,
  );
}

export function deleteVoiceRecordingsForLesson(
  lessonId: string,
): Promise<VoiceRecordingDeletionResult> {
  return deleteMatchingVoiceRecordings(sample => sample.lessonId === lessonId);
}

export function deleteVoiceRecordingsForTheme(
  themeId: string,
): Promise<VoiceRecordingDeletionResult> {
  return deleteMatchingVoiceRecordings(sample => sample.themeId === themeId);
}

export function clearVoiceRecordings(): Promise<VoiceRecordingDeletionResult> {
  return enqueueVoiceRecordingOperation(async () => {
    const currentState = await readVoiceRecordingStoreState();
    const deletedSamples = Object.values(currentState.samplesById);
    const stateWithPendingCleanup = {
      pendingDeletionUris: appendUniqueUris(
        currentState.pendingDeletionUris,
        deletedSamples.map(sample => sample.uri),
      ),
      samplesById: {},
    };

    await persistVoiceRecordingStoreState(stateWithPendingCleanup);
    notifyVoiceRecordingStoreChanged(stateWithPendingCleanup);

    const adapter = getVoiceRecordingFileAdapterOrNull();
    if (adapter?.clearStoredVoiceRecordings) {
      try {
        const didClear = await adapter.clearStoredVoiceRecordings();
        if (!didClear) {
          throw new Error('Native voice recording storage was not cleared.');
        }
        await persistCleanupStateBestEffort(emptyVoiceRecordingStoreState);
        return {
          deletedSamples,
          failedUris: [],
          fileCleanupFailed: false,
        };
      } catch {
        return {
          deletedSamples,
          failedUris: stateWithPendingCleanup.pendingDeletionUris,
          fileCleanupFailed: true,
        };
      }
    }

    const cleanup = await cleanPendingDeletionUris(stateWithPendingCleanup);
    if (cleanup.state !== stateWithPendingCleanup) {
      await persistCleanupStateBestEffort(cleanup.state);
    }
    return {
      deletedSamples,
      failedUris: cleanup.failedUris,
      fileCleanupFailed: cleanup.failedUris.length > 0,
    };
  });
}

export function retryPendingVoiceRecordingDeletions(): Promise<string[]> {
  return enqueueVoiceRecordingOperation(async () => {
    const state = await readVoiceRecordingStoreState();
    const cleanup = await cleanPendingDeletionUris(state);
    await persistVoiceRecordingStoreState(cleanup.state);
    return cleanup.failedUris;
  });
}

export function normalizeVoiceRecordingStore(
  value: unknown,
): VoiceRecordingStoreState {
  if (!isRecord(value)) {
    return emptyVoiceRecordingStoreState;
  }

  const pendingDeletionUris = normalizePendingDeletionUris(
    value.pendingDeletionUris,
  );
  const normalizedSamples = normalizeSamplesById(value.samplesById);
  const retainedUris = new Set(
    Object.values(normalizedSamples.samplesById).map(sample => sample.uri),
  );
  const normalizedState = {
    pendingDeletionUris: appendUniqueUris(
      pendingDeletionUris,
      normalizedSamples.discardedUris,
    ).filter(uri => !retainedUris.has(uri)),
    samplesById: normalizedSamples.samplesById,
  };
  const pruned = pruneVoiceRecordingState(normalizedState);

  return {
    pendingDeletionUris: appendUniqueUris(
      pruned.state.pendingDeletionUris,
      pruned.prunedUris,
    ),
    samplesById: pruned.state.samplesById,
  };
}

async function persistUpsertedSample(
  currentState: VoiceRecordingStoreState,
  sample: VoiceRecordingSample,
  onMetadataCommitted?: () => void,
): Promise<VoiceRecordingSaveResult> {
  const update = applySampleUpsert(currentState, sample);
  const pruned = pruneVoiceRecordingState(
    update.state,
    getVoiceRecordingWordKey(sample.lessonId, sample.vocabId),
  );
  const cleanupUris = appendUniqueUris(
    update.replacedUris,
    pruned.prunedUris,
  ).filter(uri => uri !== sample.uri);
  const stateWithPendingCleanup = {
    pendingDeletionUris: appendUniqueUris(
      pruned.state.pendingDeletionUris,
      cleanupUris,
    ),
    samplesById: pruned.state.samplesById,
  };

  await persistVoiceRecordingStoreState(stateWithPendingCleanup);
  onMetadataCommitted?.();
  notifyVoiceRecordingStoreChanged(stateWithPendingCleanup);

  const cleanup = await cleanPendingDeletionUris(stateWithPendingCleanup);
  if (cleanup.state !== stateWithPendingCleanup) {
    await persistCleanupStateBestEffort(cleanup.state);
  }

  const entry = buildVoiceRecordingWordEntries(cleanup.state.samplesById).find(
    item =>
      item.key === getVoiceRecordingWordKey(sample.lessonId, sample.vocabId),
  );

  if (!entry) {
    throw new Error('Voice recording could not be retained.');
  }

  return {
    entry,
    failedDeletionUris: cleanup.failedUris,
    prunedUris: pruned.prunedUris,
    replacedUris: update.replacedUris,
    sample: entry.first.id === sample.id ? entry.first : entry.latest ?? sample,
  };
}

function deleteMatchingVoiceRecordings(
  predicate: (sample: VoiceRecordingSample) => boolean,
): Promise<VoiceRecordingDeletionResult> {
  return enqueueVoiceRecordingOperation(async () => {
    const currentState = await readVoiceRecordingStoreState();
    const deletedSamples = Object.values(currentState.samplesById).filter(
      predicate,
    );

    const samplesById = { ...currentState.samplesById };
    for (const sample of deletedSamples) {
      delete samplesById[sample.id];
    }

    const stateWithPendingCleanup = {
      pendingDeletionUris: appendUniqueUris(
        currentState.pendingDeletionUris,
        deletedSamples.map(sample => sample.uri),
      ),
      samplesById,
    };

    await persistVoiceRecordingStoreState(stateWithPendingCleanup);
    notifyVoiceRecordingStoreChanged(stateWithPendingCleanup);

    const cleanup = await cleanPendingDeletionUris(stateWithPendingCleanup);
    if (cleanup.state !== stateWithPendingCleanup) {
      await persistCleanupStateBestEffort(cleanup.state);
    }

    return {
      deletedSamples,
      failedUris: cleanup.failedUris,
      fileCleanupFailed: cleanup.failedUris.length > 0,
    };
  });
}

function applySampleUpsert(
  currentState: VoiceRecordingStoreState,
  sample: VoiceRecordingSample,
) {
  const wordKey = getVoiceRecordingWordKey(sample.lessonId, sample.vocabId);
  const wordSamples = Object.values(currentState.samplesById)
    .filter(
      item => getVoiceRecordingWordKey(item.lessonId, item.vocabId) === wordKey,
    )
    .sort(compareVoiceRecordingSamples);
  const sameEncounter = wordSamples.find(
    item => item.encounterId === sample.encounterId,
  );
  const replacedUris: string[] = [];
  const samplesById = { ...currentState.samplesById };

  if (sameEncounter) {
    if (sameEncounter.uri !== sample.uri) {
      replacedUris.push(sameEncounter.uri);
    }
    delete samplesById[sameEncounter.id];
    samplesById[sameEncounter.id] = {
      ...sample,
      id: sameEncounter.id,
    };
  } else if (wordSamples.length === 0) {
    samplesById[sample.id] = sample;
  } else if (wordSamples.length === 1) {
    samplesById[sample.id] = sample;
  } else {
    const latest = wordSamples[wordSamples.length - 1];
    if (latest.uri !== sample.uri) {
      replacedUris.push(latest.uri);
    }
    delete samplesById[latest.id];
    samplesById[sample.id] = sample;
  }

  return {
    replacedUris,
    state: {
      pendingDeletionUris: currentState.pendingDeletionUris,
      samplesById,
    },
  };
}

function pruneVoiceRecordingState(
  state: VoiceRecordingStoreState,
  protectedWordKey?: string,
) {
  const samplesById = { ...state.samplesById };
  const prunedUris: string[] = [];
  let entries = buildVoiceRecordingWordEntries(samplesById);
  let sampleCount = Object.keys(samplesById).length;

  while (sampleCount > MAX_STORED_VOICE_SAMPLES) {
    const candidate = [...entries]
      .reverse()
      .find(entry => entry.key !== protectedWordKey);
    if (!candidate) {
      break;
    }

    const samples = candidate.latest
      ? [candidate.first, candidate.latest]
      : [candidate.first];
    for (const sample of samples) {
      delete samplesById[sample.id];
      prunedUris.push(sample.uri);
    }
    sampleCount -= samples.length;
    entries = entries.filter(entry => entry.key !== candidate.key);
  }

  return {
    prunedUris,
    state: {
      pendingDeletionUris: state.pendingDeletionUris,
      samplesById,
    },
  };
}

function buildVoiceRecordingWordEntries(
  samplesById: Record<string, VoiceRecordingSample>,
): VoiceRecordingWordEntry[] {
  const grouped = new Map<string, VoiceRecordingSample[]>();

  for (const sample of Object.values(samplesById)) {
    const key = getVoiceRecordingWordKey(sample.lessonId, sample.vocabId);
    const samples = grouped.get(key) ?? [];
    samples.push(sample);
    grouped.set(key, samples);
  }

  return Array.from(grouped.entries())
    .map(([key, samples]) => {
      const sortedSamples = samples.sort(compareVoiceRecordingSamples);
      const first = sortedSamples[0];
      const latest =
        sortedSamples.length > 1
          ? sortedSamples[sortedSamples.length - 1]
          : undefined;
      const newestSample = latest ?? first;

      return {
        first,
        key,
        ...(latest ? { latest } : {}),
        latestCreatedAt: newestSample.createdAt,
        lessonId: newestSample.lessonId,
        sampleCount: latest ? 2 : 1,
        themeId: newestSample.themeId,
        vocabId: newestSample.vocabId,
        word: newestSample.word,
      } satisfies VoiceRecordingWordEntry;
    })
    .sort((left, right) =>
      compareIsoTimestampsDescending(
        left.latestCreatedAt,
        right.latestCreatedAt,
      ),
    );
}

function getSortedSamples(state: VoiceRecordingStoreState) {
  return Object.values(state.samplesById).sort((left, right) =>
    compareIsoTimestampsDescending(left.createdAt, right.createdAt),
  );
}

async function readVoiceRecordingStoreState() {
  const rawState = await AsyncStorage.getItem(VOICE_RECORDINGS_STORAGE_KEY);
  if (!rawState) {
    return emptyVoiceRecordingStoreState;
  }

  try {
    return normalizeVoiceRecordingStore(JSON.parse(rawState));
  } catch {
    return emptyVoiceRecordingStoreState;
  }
}

async function persistVoiceRecordingStoreState(
  state: VoiceRecordingStoreState,
) {
  if (
    Object.keys(state.samplesById).length === 0 &&
    state.pendingDeletionUris.length === 0
  ) {
    await AsyncStorage.removeItem(VOICE_RECORDINGS_STORAGE_KEY);
    return;
  }

  await AsyncStorage.setItem(
    VOICE_RECORDINGS_STORAGE_KEY,
    JSON.stringify(state),
  );
}

async function persistCleanupStateBestEffort(state: VoiceRecordingStoreState) {
  try {
    await persistVoiceRecordingStoreState(state);
  } catch {
    // The committed metadata already contains cleanup tombstones. A later
    // retry can safely observe that the native file is already absent.
  }
}

async function cleanPendingDeletionUris(state: VoiceRecordingStoreState) {
  if (state.pendingDeletionUris.length === 0) {
    return { failedUris: [], state };
  }

  const adapter = getVoiceRecordingFileAdapterOrNull();
  if (!adapter) {
    return {
      failedUris: state.pendingDeletionUris,
      state,
    };
  }

  const failedUris: string[] = [];
  for (const uri of state.pendingDeletionUris) {
    try {
      // `false` means the owned file was already absent, which is also a
      // successful cleanup outcome.
      await adapter.deleteStoredVoiceRecording(uri);
    } catch {
      failedUris.push(uri);
    }
  }

  return {
    failedUris,
    state: {
      pendingDeletionUris: failedUris,
      samplesById: state.samplesById,
    },
  };
}

async function deleteStoredVoiceRecordingBestEffort(uri: string) {
  try {
    await getVoiceRecordingFileAdapterOrNull()?.deleteStoredVoiceRecording(uri);
  } catch {
    // The original persistence error remains the actionable failure.
  }
}

function getVoiceRecordingFileAdapter() {
  const adapter = getVoiceRecordingFileAdapterOrNull();
  if (!adapter) {
    throw new Error('Native voice recording storage is unavailable.');
  }
  return adapter;
}

function getVoiceRecordingFileAdapterOrNull(): VoiceRecordingFileAdapter | null {
  if (voiceRecordingFileAdapterOverride) {
    return voiceRecordingFileAdapterOverride;
  }

  const nativeAudio = NativeModules.SkidsAudio as
    | NativeSkidsAudioModule
    | undefined;
  if (
    !nativeAudio?.promoteVoiceRecording ||
    !nativeAudio.deleteStoredVoiceRecording
  ) {
    return null;
  }

  return {
    ...(nativeAudio.clearStoredVoiceRecordings
      ? {
          clearStoredVoiceRecordings: () =>
            nativeAudio.clearStoredVoiceRecordings!(),
        }
      : {}),
    deleteStoredVoiceRecording: uri =>
      nativeAudio.deleteStoredVoiceRecording!(uri),
    promoteVoiceRecording: (tempUri, recordingId) =>
      nativeAudio.promoteVoiceRecording!(tempUri, recordingId),
  };
}

function normalizeCandidateInput(input: SaveVoiceRecordingCandidateInput) {
  const tempUri = normalizeUri(input.tempUri);
  if (!tempUri) {
    throw new Error('Voice recording candidate URI is invalid.');
  }

  const metadata = normalizeSampleMetadata(input);
  return { ...metadata, tempUri };
}

function normalizeUpsertInput(
  input: UpsertVoiceRecordingSampleInput,
): Omit<VoiceRecordingSample, 'id'> {
  const uri = normalizeUri(input.uri);
  if (!uri) {
    throw new Error('Voice recording URI is invalid.');
  }
  return { ...normalizeSampleMetadata(input), uri };
}

function normalizeSampleMetadata(input: {
  accent: unknown;
  createdAt?: unknown;
  durationMs: unknown;
  encounterId: unknown;
  lessonId: unknown;
  sceneId: unknown;
  stepId: unknown;
  themeId: unknown;
  vocabId: unknown;
  word: unknown;
}) {
  const accent = isEnglishAccent(input.accent) ? input.accent : null;
  const createdAt =
    input.createdAt === undefined
      ? new Date().toISOString()
      : normalizeIsoTimestamp(input.createdAt);
  const durationMs = normalizeDurationMs(input.durationMs);
  const encounterId = normalizeIdentifier(input.encounterId);
  const lessonId = normalizeIdentifier(input.lessonId);
  const sceneId = normalizeIdentifier(input.sceneId);
  const stepId = normalizeIdentifier(input.stepId);
  const themeId = normalizeIdentifier(input.themeId);
  const vocabId = normalizeIdentifier(input.vocabId);
  const word = normalizeWord(input.word);

  if (
    !accent ||
    !createdAt ||
    durationMs === null ||
    !encounterId ||
    !lessonId ||
    !sceneId ||
    !stepId ||
    !themeId ||
    !vocabId ||
    !word
  ) {
    throw new Error('Voice recording metadata is invalid.');
  }

  return {
    accent,
    createdAt,
    durationMs,
    encounterId,
    lessonId,
    sceneId,
    stepId,
    themeId,
    vocabId,
    word,
  };
}

function normalizeSamplesById(value: unknown) {
  if (!isRecord(value)) {
    return {
      discardedUris: [] as string[],
      samplesById: {} as Record<string, VoiceRecordingSample>,
    };
  }

  const samples: VoiceRecordingSample[] = [];
  for (const [storedId, sampleValue] of Object.entries(value)) {
    const sample = normalizeStoredSample(sampleValue, storedId);
    if (sample) {
      samples.push(sample);
    }
  }

  const samplesByWord = new Map<string, VoiceRecordingSample[]>();
  for (const sample of samples) {
    const key = getVoiceRecordingWordKey(sample.lessonId, sample.vocabId);
    const wordSamples = samplesByWord.get(key) ?? [];
    wordSamples.push(sample);
    samplesByWord.set(key, wordSamples);
  }

  const normalizedSamples: Record<string, VoiceRecordingSample> = {};
  const retainedSampleIds = new Set<string>();
  for (const wordSamples of samplesByWord.values()) {
    const samplesByEncounter = new Map<string, VoiceRecordingSample>();
    for (const sample of wordSamples) {
      const existing = samplesByEncounter.get(sample.encounterId);
      if (!existing || compareVoiceRecordingSamples(existing, sample) < 0) {
        samplesByEncounter.set(sample.encounterId, sample);
      }
    }

    const distinctEncounters = Array.from(samplesByEncounter.values()).sort(
      compareVoiceRecordingSamples,
    );
    const retained =
      distinctEncounters.length <= 2
        ? distinctEncounters
        : [
            distinctEncounters[0],
            distinctEncounters[distinctEncounters.length - 1],
          ];
    for (const sample of retained) {
      normalizedSamples[sample.id] = sample;
      retainedSampleIds.add(sample.id);
    }
  }

  return {
    discardedUris: samples
      .filter(sample => !retainedSampleIds.has(sample.id))
      .map(sample => sample.uri),
    samplesById: normalizedSamples,
  };
}

function normalizeStoredSample(
  value: unknown,
  storedId: string,
): VoiceRecordingSample | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = RECORDING_ID_PATTERN.test(storedId)
    ? storedId
    : typeof value.id === 'string' && RECORDING_ID_PATTERN.test(value.id)
    ? value.id
    : null;
  const uri = normalizeUri(value.uri);

  try {
    const metadata = normalizeSampleMetadata({
      accent: value.accent,
      createdAt: value.createdAt,
      durationMs: value.durationMs,
      encounterId: value.encounterId,
      lessonId: value.lessonId,
      sceneId: value.sceneId,
      stepId: value.stepId,
      themeId: value.themeId,
      vocabId: value.vocabId,
      word: value.word,
    });
    return id && uri ? { ...metadata, id, uri } : null;
  } catch {
    return null;
  }
}

function normalizePendingDeletionUris(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }
  return appendUniqueUris(
    [],
    value.map(normalizeUri).filter((uri): uri is string => Boolean(uri)),
  );
}

function appendUniqueUris(first: string[], second: string[]) {
  return Array.from(new Set([...first, ...second]));
}

function normalizeIdentifier(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim();
  return normalized.length > 0 && normalized.length <= MAX_IDENTIFIER_LENGTH
    ? normalized
    : null;
}

function normalizeWord(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim();
  return normalized.length > 0 && normalized.length <= MAX_WORD_LENGTH
    ? normalized
    : null;
}

function normalizeUri(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim();
  return normalized.startsWith('file:///') &&
    normalized.length <= MAX_URI_LENGTH
    ? normalized
    : null;
}

function normalizeIsoTimestamp(value: unknown) {
  return typeof value === 'string' && !Number.isNaN(new Date(value).getTime())
    ? value
    : null;
}

function normalizeDurationMs(value: unknown) {
  return typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= MAX_RECORDING_DURATION_MS
    ? Math.round(value)
    : null;
}

function findEncounterSample(
  state: VoiceRecordingStoreState,
  lessonId: string,
  vocabId: string,
  encounterId: string,
) {
  return Object.values(state.samplesById).find(
    sample =>
      sample.lessonId === lessonId &&
      sample.vocabId === vocabId &&
      sample.encounterId === encounterId,
  );
}

function createUniqueRecordingId(state: VoiceRecordingStoreState) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const id = createRandomRecordingId();
    if (!state.samplesById[id]) {
      return id;
    }
  }
  throw new Error('Could not create a unique voice recording ID.');
}

function createRandomRecordingId() {
  const cryptoValue = (
    globalThis as typeof globalThis & {
      crypto?: { randomUUID?: () => string };
    }
  ).crypto;
  const randomUuid = cryptoValue
    ?.randomUUID?.()
    .replace(/-/g, '_')
    .slice(0, 48);
  if (randomUuid && RECORDING_ID_PATTERN.test(randomUuid)) {
    return `vr_${randomUuid}`;
  }

  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 18);
  return `vr_${timestamp}_${random}`.slice(0, 64);
}

function compareVoiceRecordingSamples(
  left: VoiceRecordingSample,
  right: VoiceRecordingSample,
) {
  const timestampComparison =
    new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
  return timestampComparison || left.id.localeCompare(right.id);
}

function compareIsoTimestampsDescending(left: string, right: string) {
  return new Date(right).getTime() - new Date(left).getTime();
}

function notifyVoiceRecordingStoreChanged(state: VoiceRecordingStoreState) {
  const entries = buildVoiceRecordingWordEntries(state.samplesById);
  for (const listener of voiceRecordingStoreListeners) {
    try {
      listener(entries);
    } catch {
      // Library listeners must not break persistence.
    }
  }
}

function enqueueVoiceRecordingOperation<TResult>(
  operation: () => Promise<TResult>,
): Promise<TResult> {
  const result = voiceRecordingOperationQueue.then(operation);
  voiceRecordingOperationQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
