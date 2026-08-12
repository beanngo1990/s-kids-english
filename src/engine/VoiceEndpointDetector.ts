import type { EnglishAccent } from '../types/audio';

export type VoiceRecordingStopReason =
  | 'endOfSpeech'
  | 'targetWordMatch'
  | 'noSpeechTimeout'
  | 'maxDuration'
  | 'manual'
  | 'interrupted'
  | 'error';

export type VoiceEndpointPhase =
  | 'calibrating'
  | 'waitingForSpeech'
  | 'candidateSpeech'
  | 'speaking'
  | 'trailingSilence'
  | 'ended';

export type VoiceActivityDetector = 'nativeVoiceActivity' | 'levelFallback';

export type VoiceEndpointOptions = {
  /** Used only by the JavaScript level fallback state machine. */
  candidateGapMs: number;
  maxDurationMs: number;
  minSpeechMs: number;
  noSpeechTimeoutMs: number;
  silenceAfterSpeechMs: number;
  /** Optional, local-only hint that may end a recording early after a likely match. */
  targetText?: string;
  targetLocale?: EnglishAccent;
  targetMatchPostRollMs?: number;
};

export type NativeVoiceActivityOptions = Omit<
  VoiceEndpointOptions,
  'candidateGapMs'
>;

export type VoiceActivitySnapshot = {
  detector: VoiceActivityDetector;
  elapsedMs: number;
  hadSpeech: boolean;
  level?: number;
  phase: VoiceEndpointPhase;
  sequence: number;
  sessionId: string;
  shouldStop: boolean;
  speechDurationMs: number;
  stopReason: VoiceRecordingStopReason | null;
  targetMatchConfidence?: number;
  targetMatchState?: VoiceTargetMatchState;
  trailingSilenceMs: number;
};

export type VoiceTargetMatchState =
  | 'unavailable'
  | 'listening'
  | 'candidate'
  | 'matched';

export type VoiceEndpointState = {
  candidateSpeechMs: number;
  hadSpeech: boolean;
  lastObservationWasSpeech: boolean;
  lastObservedAtMs: number;
  lastSpeechAtMs: number | null;
  phase: VoiceEndpointPhase;
  sequence: number;
  speechDurationMs: number;
  startedAtMs: number;
  stopReason: VoiceRecordingStopReason | null;
};

export type VoiceEndpointObservation = {
  atMs: number;
  isSpeech: boolean | null;
};

export type LevelVoiceClassifierState = {
  calibrationSamplesRemaining: number;
  isSpeech: boolean;
  noiseFloor: number;
};

const initialNoiseFloor = 0.025;
const fallbackCalibrationSamples = 3;
const fallbackMinimumStartLevel = 0.065;
const fallbackMinimumContinueLevel = 0.045;
const fallbackStartNoiseMultiplier = 2.35;
const fallbackContinueNoiseMultiplier = 1.7;

export function createVoiceEndpointState(
  startedAtMs: number,
): VoiceEndpointState {
  return {
    candidateSpeechMs: 0,
    hadSpeech: false,
    lastObservationWasSpeech: false,
    lastObservedAtMs: startedAtMs,
    lastSpeechAtMs: null,
    phase: 'calibrating',
    sequence: 0,
    speechDurationMs: 0,
    startedAtMs,
    stopReason: null,
  };
}

export function advanceVoiceEndpoint(
  state: VoiceEndpointState,
  observation: VoiceEndpointObservation,
  options: VoiceEndpointOptions,
): VoiceEndpointState {
  if (state.phase === 'ended') {
    return state;
  }

  const atMs = Math.max(state.lastObservedAtMs, observation.atMs);
  const elapsedMs = atMs - state.startedAtMs;
  const deltaMs = atMs - state.lastObservedAtMs;
  const sequence = state.sequence + 1;

  if (!state.hadSpeech && elapsedMs >= options.noSpeechTimeoutMs) {
    return endVoiceEndpoint(state, atMs, sequence, 'noSpeechTimeout');
  }

  if (elapsedMs >= options.maxDurationMs) {
    return endVoiceEndpoint(state, atMs, sequence, 'maxDuration');
  }

  if (observation.isSpeech === null) {
    return {
      ...state,
      lastObservedAtMs: atMs,
      phase: state.phase === 'calibrating' ? 'waitingForSpeech' : state.phase,
      sequence,
    };
  }

  if (observation.isSpeech) {
    const continuesSpeech =
      state.lastSpeechAtMs !== null &&
      atMs - state.lastSpeechAtMs <= options.candidateGapMs;
    const observedSpeechMs =
      state.lastObservationWasSpeech || continuesSpeech ? deltaMs : 0;
    const candidateSpeechMs = state.hadSpeech
      ? state.candidateSpeechMs
      : continuesSpeech
      ? state.candidateSpeechMs + observedSpeechMs
      : 0;
    const hadSpeech =
      state.hadSpeech || candidateSpeechMs >= options.minSpeechMs;

    return {
      ...state,
      candidateSpeechMs,
      hadSpeech,
      lastObservationWasSpeech: true,
      lastObservedAtMs: atMs,
      lastSpeechAtMs: atMs,
      phase: hadSpeech ? 'speaking' : 'candidateSpeech',
      sequence,
      speechDurationMs: state.speechDurationMs + observedSpeechMs,
    };
  }

  if (!state.hadSpeech) {
    const keepsCandidate =
      state.lastSpeechAtMs !== null &&
      atMs - state.lastSpeechAtMs <= options.candidateGapMs;

    return {
      ...state,
      candidateSpeechMs: keepsCandidate ? state.candidateSpeechMs : 0,
      lastObservationWasSpeech: false,
      lastObservedAtMs: atMs,
      phase: keepsCandidate ? 'candidateSpeech' : 'waitingForSpeech',
      sequence,
    };
  }

  const trailingSilenceMs =
    state.lastSpeechAtMs === null ? 0 : atMs - state.lastSpeechAtMs;
  if (trailingSilenceMs >= options.silenceAfterSpeechMs) {
    return endVoiceEndpoint(state, atMs, sequence, 'endOfSpeech');
  }

  return {
    ...state,
    lastObservationWasSpeech: false,
    lastObservedAtMs: atMs,
    phase: 'trailingSilence',
    sequence,
  };
}

export function createLevelVoiceClassifierState(): LevelVoiceClassifierState {
  return {
    calibrationSamplesRemaining: fallbackCalibrationSamples,
    isSpeech: false,
    noiseFloor: initialNoiseFloor,
  };
}

export function classifyVoiceLevel(
  state: LevelVoiceClassifierState,
  level: number | null,
): {
  classification: boolean | null;
  level: number | undefined;
  state: LevelVoiceClassifierState;
} {
  if (level === null || !Number.isFinite(level)) {
    return { classification: null, level: undefined, state };
  }

  const clampedLevel = Math.max(0, Math.min(1, level));
  if (state.calibrationSamplesRemaining > 0) {
    return {
      classification: null,
      level: clampedLevel,
      state: {
        calibrationSamplesRemaining: state.calibrationSamplesRemaining - 1,
        isSpeech: false,
        noiseFloor:
          state.noiseFloor * 0.65 + Math.min(clampedLevel, 0.2) * 0.35,
      },
    };
  }

  const threshold = state.isSpeech
    ? Math.max(
        fallbackMinimumContinueLevel,
        state.noiseFloor * fallbackContinueNoiseMultiplier,
      )
    : Math.max(
        fallbackMinimumStartLevel,
        state.noiseFloor * fallbackStartNoiseMultiplier,
      );
  const isSpeech = clampedLevel >= threshold;
  const noiseFloor = isSpeech
    ? state.noiseFloor
    : state.noiseFloor * 0.94 + Math.min(clampedLevel, 0.2) * 0.06;

  return {
    classification: isSpeech,
    level: clampedLevel,
    state: {
      calibrationSamplesRemaining: 0,
      isSpeech,
      noiseFloor,
    },
  };
}

export function toVoiceActivitySnapshot(
  state: VoiceEndpointState,
  sessionId: string,
  detector: VoiceActivityDetector,
  level?: number,
): VoiceActivitySnapshot {
  const elapsedMs = Math.max(0, state.lastObservedAtMs - state.startedAtMs);
  const trailingSilenceMs =
    state.hadSpeech && state.lastSpeechAtMs !== null
      ? Math.max(0, state.lastObservedAtMs - state.lastSpeechAtMs)
      : 0;

  return {
    detector,
    elapsedMs,
    hadSpeech: state.hadSpeech,
    ...(level === undefined ? {} : { level }),
    phase: state.phase,
    sequence: state.sequence,
    sessionId,
    shouldStop: state.phase === 'ended',
    speechDurationMs: state.speechDurationMs,
    stopReason: state.stopReason,
    trailingSilenceMs,
  };
}

function endVoiceEndpoint(
  state: VoiceEndpointState,
  atMs: number,
  sequence: number,
  stopReason: VoiceRecordingStopReason,
): VoiceEndpointState {
  return {
    ...state,
    lastObservationWasSpeech: false,
    lastObservedAtMs: atMs,
    phase: 'ended',
    sequence,
    stopReason,
  };
}
