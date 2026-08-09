import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

import { playAudioUri } from './AudioManager';
import type {
  NativeVoiceActivityOptions,
  VoiceActivitySnapshot,
  VoiceEndpointOptions,
  VoiceEndpointPhase,
  VoiceRecordingStopReason,
  VoiceTargetMatchState,
} from './VoiceEndpointDetector';

export type {
  VoiceActivitySnapshot,
  VoiceEndpointOptions,
  VoiceRecordingStopReason,
} from './VoiceEndpointDetector';

type VoiceRecordingPermissionCopy = {
  buttonNegative: string;
  buttonPositive: string;
  message: string;
  title: string;
};

export type VoiceRecordingPermissionStatus =
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'unavailable';

type VoiceRecordingPermissionRequestOptions = {
  source: 'automatic' | 'manual';
};

type SkidsAudioModule = {
  getVoiceRecordingActivity?: (sessionId: string) => Promise<unknown>;
  getVoiceRecordingLevel?: () => Promise<number | null>;
  startVoiceActivityRecording?: (
    options: NativeVoiceActivityOptions,
  ) => Promise<unknown>;
  startVoiceRecording?: () => Promise<string | null>;
  stopVoiceActivityRecording?: (
    sessionId: string,
    reason: VoiceRecordingStopReason,
  ) => Promise<unknown>;
  stopVoiceRecording?: () => Promise<string | null>;
  checkRecordPermission?: () => Promise<boolean>;
  requestRecordPermission?: () => Promise<boolean>;
  requestTargetWordRecognitionPermission?: () => Promise<boolean>;
};

export type VoiceRecordingSession = {
  detector: 'nativeVoiceActivity' | 'levelFallback';
  sessionId: string;
  uri: string;
};

export type VoiceRecordingResult = {
  finalSnapshot: VoiceActivitySnapshot | null;
  stopReason: VoiceRecordingStopReason;
  uri: string | null;
};

const nativeAudio = NativeModules.SkidsAudio as SkidsAudioModule | undefined;
let lastKnownPermissionStatus: Exclude<
  VoiceRecordingPermissionStatus,
  'unavailable'
> | null = null;
let legacySessionSequence = 0;

export function isVoiceRecorderAvailable() {
  return Boolean(
    (nativeAudio?.startVoiceActivityRecording &&
      nativeAudio.getVoiceRecordingActivity &&
      nativeAudio.stopVoiceActivityRecording) ||
      (nativeAudio?.startVoiceRecording && nativeAudio.stopVoiceRecording),
  );
}

export async function requestVoiceRecordingPermission(
  copy: VoiceRecordingPermissionCopy,
  options: VoiceRecordingPermissionRequestOptions,
): Promise<VoiceRecordingPermissionStatus> {
  if (!isVoiceRecorderAvailable()) {
    return 'unavailable';
  }

  if (Platform.OS === 'ios') {
    if (
      nativeAudio?.checkRecordPermission &&
      (await nativeAudio.checkRecordPermission())
    ) {
      await requestTargetWordRecognitionPermissionBestEffort();
      return rememberPermissionStatus('granted');
    }
    if (
      lastKnownPermissionStatus === 'blocked' ||
      !nativeAudio?.requestRecordPermission
    ) {
      return lastKnownPermissionStatus ?? 'unavailable';
    }

    const isGranted = await nativeAudio.requestRecordPermission();
    if (isGranted) {
      await requestTargetWordRecognitionPermissionBestEffort();
    }
    return rememberPermissionStatus(isGranted ? 'granted' : 'blocked');
  }

  if (Platform.OS !== 'android') {
    return rememberPermissionStatus('granted');
  }

  const permission = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;
  const alreadyGranted = await PermissionsAndroid.check(permission);

  if (alreadyGranted) {
    return rememberPermissionStatus('granted');
  }

  if (lastKnownPermissionStatus === 'blocked') {
    return 'blocked';
  }

  if (
    options.source === 'automatic' &&
    lastKnownPermissionStatus === 'denied'
  ) {
    return 'denied';
  }

  const result = await PermissionsAndroid.request(permission, copy);

  if (result === PermissionsAndroid.RESULTS.GRANTED) {
    return rememberPermissionStatus('granted');
  }
  if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    return rememberPermissionStatus('blocked');
  }

  return rememberPermissionStatus('denied');
}

export async function checkVoiceRecordingPermission(): Promise<VoiceRecordingPermissionStatus> {
  if (!isVoiceRecorderAvailable()) {
    return 'unavailable';
  }

  if (Platform.OS === 'ios') {
    if (!nativeAudio?.checkRecordPermission) {
      return lastKnownPermissionStatus ?? 'unavailable';
    }

    const isGranted = await nativeAudio.checkRecordPermission();
    return isGranted
      ? rememberPermissionStatus('granted')
      : lastKnownPermissionStatus ?? 'denied';
  }

  if (Platform.OS === 'android') {
    const isGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    );
    return isGranted
      ? rememberPermissionStatus('granted')
      : lastKnownPermissionStatus ?? 'denied';
  }

  return rememberPermissionStatus('granted');
}

export async function startVoiceRecording(
  options: VoiceEndpointOptions,
): Promise<VoiceRecordingSession | null> {
  if (
    nativeAudio?.startVoiceActivityRecording &&
    nativeAudio.getVoiceRecordingActivity &&
    nativeAudio.stopVoiceActivityRecording
  ) {
    try {
      const enhancedSession = normalizeVoiceRecordingSession(
        await nativeAudio.startVoiceActivityRecording(
          toNativeVoiceActivityOptions(options),
        ),
      );
      if (enhancedSession) {
        return enhancedSession;
      }
    } catch {
      // A mixed JS/native rollout may not expose the enhanced contract yet.
    }
  }

  if (!nativeAudio?.startVoiceRecording) {
    return null;
  }

  const uri = await nativeAudio.startVoiceRecording();
  if (typeof uri !== 'string' || uri.length === 0) {
    return null;
  }

  legacySessionSequence += 1;
  return {
    detector: 'levelFallback',
    sessionId: `level-fallback-${legacySessionSequence}`,
    uri,
  };
}

export async function getVoiceRecordingActivity(
  session: VoiceRecordingSession,
): Promise<VoiceActivitySnapshot | null> {
  if (
    session.detector !== 'nativeVoiceActivity' ||
    !nativeAudio?.getVoiceRecordingActivity
  ) {
    return null;
  }

  try {
    return normalizeVoiceActivitySnapshot(
      await nativeAudio.getVoiceRecordingActivity(session.sessionId),
      session.sessionId,
    );
  } catch {
    return null;
  }
}

export async function stopVoiceRecording(
  session: VoiceRecordingSession,
  reason: VoiceRecordingStopReason,
): Promise<VoiceRecordingResult> {
  if (
    session.detector === 'nativeVoiceActivity' &&
    nativeAudio?.stopVoiceActivityRecording
  ) {
    try {
      const result = normalizeVoiceRecordingResult(
        await nativeAudio.stopVoiceActivityRecording(session.sessionId, reason),
        session,
        reason,
      );
      if (result) {
        return result;
      }
    } catch {
      // Fall through to the legacy stop method when available.
    }
  }

  if (!nativeAudio?.stopVoiceRecording) {
    return {
      finalSnapshot: null,
      stopReason: 'error',
      uri: null,
    };
  }

  try {
    const uri = await nativeAudio.stopVoiceRecording();
    const completedUri =
      typeof uri === 'string' && uri.length > 0 ? uri : null;
    return {
      finalSnapshot: null,
      stopReason: completedUri ? reason : 'error',
      uri: completedUri,
    };
  } catch {
    return {
      finalSnapshot: null,
      stopReason: 'error',
      uri: null,
    };
  }
}

export async function getVoiceRecordingLevel() {
  if (!nativeAudio?.getVoiceRecordingLevel) {
    return null;
  }

  return nativeAudio.getVoiceRecordingLevel();
}

export async function playVoiceRecording(recordingUri: string) {
  await playAudioUri(recordingUri);
}

function rememberPermissionStatus(
  status: Exclude<VoiceRecordingPermissionStatus, 'unavailable'>,
) {
  lastKnownPermissionStatus = status;
  return status;
}

async function requestTargetWordRecognitionPermissionBestEffort() {
  try {
    await nativeAudio?.requestTargetWordRecognitionPermission?.();
  } catch {
    // Target matching is optional; microphone recording must remain available.
  }
}

function toNativeVoiceActivityOptions(
  options: VoiceEndpointOptions,
): NativeVoiceActivityOptions {
  const targetText = options.targetText?.trim();
  return {
    maxDurationMs: options.maxDurationMs,
    minSpeechMs: options.minSpeechMs,
    noSpeechTimeoutMs: options.noSpeechTimeoutMs,
    silenceAfterSpeechMs: options.silenceAfterSpeechMs,
    ...(targetText ? { targetText } : {}),
    ...(targetText && options.targetLocale
      ? { targetLocale: options.targetLocale }
      : {}),
    ...(targetText && options.targetMatchPostRollMs !== undefined
      ? { targetMatchPostRollMs: options.targetMatchPostRollMs }
      : {}),
  };
}

function normalizeVoiceRecordingSession(
  value: unknown,
): VoiceRecordingSession | null {
  if (!isRecord(value)) {
    return null;
  }

  const uri = readNonEmptyString(value.uri);
  const sessionId = readNonEmptyString(value.sessionId);
  const detector = normalizeDetector(value.detector);
  if (!uri || !sessionId || detector !== 'nativeVoiceActivity') {
    return null;
  }

  return { detector, sessionId, uri };
}

function normalizeVoiceRecordingResult(
  value: unknown,
  session: VoiceRecordingSession,
  requestedReason: VoiceRecordingStopReason,
): VoiceRecordingResult | null {
  if (typeof value === 'string') {
    if (value.length === 0) {
      return {
        finalSnapshot: null,
        stopReason: 'error',
        uri: null,
      };
    }

    return {
      finalSnapshot: null,
      stopReason: requestedReason,
      uri: value,
    };
  }
  if (!isRecord(value)) {
    return null;
  }

  const finalSnapshot = normalizeVoiceActivitySnapshot(
    value.finalSnapshot,
    session.sessionId,
  );
  const uri = Object.prototype.hasOwnProperty.call(value, 'uri')
    ? readNonEmptyString(value.uri)
    : session.uri;
  const stopReason =
    normalizeStopReason(value.stopReason) ??
    finalSnapshot?.stopReason ??
    requestedReason;

  return { finalSnapshot, stopReason, uri };
}

function normalizeVoiceActivitySnapshot(
  value: unknown,
  expectedSessionId: string,
): VoiceActivitySnapshot | null {
  if (!isRecord(value)) {
    return null;
  }

  const sessionId = readNonEmptyString(value.sessionId);
  const detector = normalizeDetector(value.detector);
  const phase = normalizePhase(value.phase);
  const sequence = readNonNegativeNumber(value.sequence);
  const elapsedMs = readNonNegativeNumber(value.elapsedMs);
  const speechDurationMs = readNonNegativeNumber(value.speechDurationMs);
  const trailingSilenceMs = readNonNegativeNumber(value.trailingSilenceMs);
  if (
    sessionId !== expectedSessionId ||
    detector !== 'nativeVoiceActivity' ||
    !phase ||
    sequence === null ||
    elapsedMs === null ||
    speechDurationMs === null ||
    trailingSilenceMs === null ||
    typeof value.hadSpeech !== 'boolean'
  ) {
    return null;
  }

  const stopReason = normalizeStopReason(value.stopReason);
  const level = readNonNegativeNumber(value.level);
  const targetMatchState = normalizeTargetMatchState(value.targetMatchState);
  const targetMatchConfidence = readNonNegativeNumber(
    value.targetMatchConfidence,
  );
  return {
    detector,
    elapsedMs,
    hadSpeech: value.hadSpeech,
    ...(level === null ? {} : { level: Math.min(level, 1) }),
    phase,
    sequence,
    sessionId,
    shouldStop:
      typeof value.shouldStop === 'boolean'
        ? value.shouldStop
        : phase === 'ended',
    speechDurationMs,
    stopReason,
    ...(targetMatchState ? { targetMatchState } : {}),
    ...(targetMatchConfidence === null
      ? {}
      : { targetMatchConfidence: Math.min(targetMatchConfidence, 1) }),
    trailingSilenceMs,
  };
}

function normalizeDetector(
  value: unknown,
): VoiceRecordingSession['detector'] | null {
  if (value === 'nativeVoiceActivity' || value === 'nativeVad') {
    return 'nativeVoiceActivity';
  }
  if (value === 'levelFallback') {
    return value;
  }
  return null;
}

function normalizePhase(value: unknown): VoiceEndpointPhase | null {
  switch (value) {
    case 'calibrating':
    case 'waitingForSpeech':
    case 'candidateSpeech':
    case 'speaking':
    case 'trailingSilence':
    case 'ended':
      return value;
    default:
      return null;
  }
}

function normalizeStopReason(value: unknown): VoiceRecordingStopReason | null {
  switch (value) {
    case 'endOfSpeech':
    case 'targetWordMatch':
    case 'noSpeechTimeout':
    case 'maxDuration':
    case 'manual':
    case 'interrupted':
    case 'error':
      return value;
    default:
      return null;
  }
}

function normalizeTargetMatchState(
  value: unknown,
): VoiceTargetMatchState | null {
  switch (value) {
    case 'unavailable':
    case 'listening':
    case 'candidate':
    case 'matched':
      return value;
    default:
      return null;
  }
}

function readNonEmptyString(value: unknown) {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function readNonNegativeNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
