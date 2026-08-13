import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  AppState,
  Easing,
  Linking,
  Pressable,
  Text,
  View,
  type AppStateStatus,
} from 'react-native';

import {
  KidIconButton,
  type KidIconBadgeTone,
} from './KidIconButton';
import { SKidsIcon } from './SKidsIcon';
import {
  playSoundEffect,
  playTapSound,
  speakTeacherPromptSegments,
  speakWord,
  startNarrationSession,
} from '../engine/AudioManager';
import {
  resolveRecordingEncouragementPrompt,
  resolveSpeechPracticePrompt,
} from '../i18n/teacherPrompts';
import type { TeacherPromptMode } from '../i18n/types';
import {
  checkVoiceRecordingPermission,
  getVoiceRecordingActivity,
  getVoiceRecordingLevel,
  isVoiceRecorderAvailable,
  playVoiceRecording,
  requestVoiceRecordingPermission,
  startVoiceRecording,
  stopVoiceRecording,
  type VoiceRecordingPermissionStatus,
  type VoiceRecordingSession,
  type VoiceRecordingStopReason,
} from '../engine/VoiceRecorder';
import {
  advanceVoiceEndpoint,
  classifyVoiceLevel,
  createLevelVoiceClassifierState,
  createVoiceEndpointState,
  toVoiceActivitySnapshot,
  type LevelVoiceClassifierState,
  type VoiceActivitySnapshot,
  type VoiceEndpointOptions,
  type VoiceEndpointState,
} from '../engine/VoiceEndpointDetector';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import { useI18n } from '../i18n';
import {
  DEFAULT_ENGLISH_ACCENT,
  type EnglishAccent,
} from '../types/audio';

type RecordingStatus =
  | 'idle'
  | 'prompting'
  | 'recording'
  | 'encouraging'
  | 'recorded';

type MicrophoneAccessStatus = VoiceRecordingPermissionStatus | 'unknown';

type SpeakPracticeControlsProps = {
  autoStartRequestId?: number;
  autoStartWithPrompt?: boolean;
  disabled?: boolean;
  englishAccent?: EnglishAccent;
  isInstructionPreparing?: boolean;
  isInstructionPlaying?: boolean;
  onAudioStart?: () => void;
  onBusyChange?: (isBusy: boolean) => void;
  onContinue?: () => void;
  onRecordingReady?: (
    recording: SpeakPracticeRecording,
  ) => Promise<void> | void;
  onReplayModel?: () => void;
  teacherPromptMode?: TeacherPromptMode;
  word: string;
};

export type SpeakPracticeRecording = {
  durationMs: number;
  stopReason: VoiceRecordingStopReason;
  uri: string;
};

const levelPollIntervalMs = 120;
const nativeSafetyMarginMs = 1500;

function AnimatedAudioWave({ color }: { color: string }) {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnim = (
      anim: Animated.Value,
      duration: number,
      delay: number,
    ) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
            delay,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };

    startAnim(anim1, 400, 0);
    startAnim(anim2, 350, 150);
    startAnim(anim3, 450, 50);
  }, [anim1, anim2, anim3]);

  const scaleY = (anim: Animated.Value) =>
    anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.2] });

  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: 3, height: 16 }}
    >
      <Animated.View
        style={{
          width: 4,
          height: 16,
          backgroundColor: color,
          borderRadius: 2,
          transform: [{ scaleY: scaleY(anim1) }],
        }}
      />
      <Animated.View
        style={{
          width: 4,
          height: 16,
          backgroundColor: color,
          borderRadius: 2,
          transform: [{ scaleY: scaleY(anim2) }],
        }}
      />
      <Animated.View
        style={{
          width: 4,
          height: 16,
          backgroundColor: color,
          borderRadius: 2,
          transform: [{ scaleY: scaleY(anim3) }],
        }}
      />
    </View>
  );
}

function AnimatedRecordingDot() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulse]);

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });
  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1.15],
  });

  return (
    <Animated.View
      style={{
        width: 14,
        height: 14,
        backgroundColor: colors.alert,
        borderRadius: 7,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

export function SpeakPracticeControls({
  autoStartRequestId = 0,
  autoStartWithPrompt = false,
  disabled = false,
  englishAccent = DEFAULT_ENGLISH_ACCENT,
  isInstructionPreparing = false,
  isInstructionPlaying = false,
  onAudioStart,
  onBusyChange,
  onContinue,
  onRecordingReady,
  onReplayModel,
  teacherPromptMode = 'vi',
  word,
}: SpeakPracticeControlsProps) {
  useThemeSync();
  const t = useI18n();
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [microphoneAccessStatus, setMicrophoneAccessStatus] =
    useState<MicrophoneAccessStatus>(() =>
      isVoiceRecorderAvailable() ? 'unknown' : 'unavailable',
    );
  const [lastRecordingHadDetectedSpeech, setLastRecordingHadDetectedSpeech] =
    useState(true);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const levelPollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const listeningPulse = useRef(new Animated.Value(0)).current;
  const recordingUriRef = useRef<string | null>(null);
  const recordingSessionRef = useRef<VoiceRecordingSession | null>(null);
  const handledAutoStartRequestRef = useRef(0);
  const latestActivitySnapshotRef = useRef<VoiceActivitySnapshot | null>(null);
  const fallbackEndpointStateRef = useRef<VoiceEndpointState | null>(null);
  const fallbackLevelClassifierRef = useRef<LevelVoiceClassifierState | null>(
    null,
  );
  const isMountedRef = useRef(true);
  const isFinishingRecordingRef = useRef(false);
  const isPollingLevelRef = useRef(false);
  const recordingRequestIdRef = useRef(0);
  const statusRef = useRef<RecordingStatus>(status);
  const recordingParamsRef = useRef<VoiceEndpointOptions>(
    resolveVoiceEndpointOptions(''),
  );
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const isReturningFromSettingsRef = useRef(false);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      recordingRequestIdRef.current += 1;
      clearRecordingTimers(timerRef, levelPollTimerRef);
      const recordingSession = recordingSessionRef.current;
      recordingSessionRef.current = null;
      if (recordingSession) {
        stopVoiceRecording(recordingSession, 'interrupted').catch(
          () => undefined,
        );
      }
    };
  }, []);

  useEffect(() => {
    onBusyChange?.(
      status === 'prompting' ||
        status === 'recording' ||
        status === 'encouraging',
    );
  }, [onBusyChange, status]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;
      if (
        nextState !== 'active' ||
        previousState === 'active' ||
        !isReturningFromSettingsRef.current
      ) {
        return;
      }

      isReturningFromSettingsRef.current = false;
      checkVoiceRecordingPermission()
        .then(permissionStatus => {
          if (!isMountedRef.current) {
            return;
          }
          setMicrophoneAccessStatus(permissionStatus);
          setStatus('idle');
        })
        .catch(() => {
          if (isMountedRef.current) {
            setMicrophoneAccessStatus('unavailable');
            setStatus('idle');
          }
        });
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (status !== 'recording') {
      listeningPulse.stopAnimation();
      listeningPulse.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.timing(listeningPulse, {
        duration: 1200,
        easing: Easing.out(Easing.quad),
        toValue: 1,
        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [listeningPulse, status]);

  const finishRecording = useCallback(
    async (requestedReason: VoiceRecordingStopReason = 'manual') => {
      if (
        isFinishingRecordingRef.current ||
        statusRef.current !== 'recording'
      ) {
        return;
      }

      isFinishingRecordingRef.current = true;
      clearRecordingTimers(timerRef, levelPollTimerRef);
      const recordingSession = recordingSessionRef.current;
      if (!recordingSession) {
        setStatus('idle');
        isFinishingRecordingRef.current = false;
        return;
      }

      const result = await stopVoiceRecording(
        recordingSession,
        requestedReason,
      );
      recordingSessionRef.current = null;
      if (!isMountedRef.current) {
        isFinishingRecordingRef.current = false;
        return;
      }
      const nextRecordingUri =
        result.stopReason === 'error' || result.stopReason === 'interrupted'
          ? null
          : result.uri;
      const finalSnapshot =
        result.finalSnapshot ?? latestActivitySnapshotRef.current;
      const didDetectSpeech = finalSnapshot?.hadSpeech ?? false;

      if (!nextRecordingUri) {
        setStatus('idle');
        isFinishingRecordingRef.current = false;
        return;
      }

      recordingUriRef.current = nextRecordingUri;
      setRecordingUri(nextRecordingUri);
      setLastRecordingHadDetectedSpeech(didDetectSpeech);
      setStatus('encouraging');
      const persistRecordingPromise = didDetectSpeech
        ? Promise.resolve()
            .then(() =>
              onRecordingReady?.({
                durationMs: Math.max(
                  0,
                  Math.round(finalSnapshot?.elapsedMs ?? 0),
                ),
                stopReason: result.stopReason,
                uri: nextRecordingUri,
              }),
            )
            .catch(() => undefined)
        : Promise.resolve();
      const narrationSession = startNarrationSession();
      try {
        await narrationSession.ready;
        if (!narrationSession.isActive()) {
          return;
        }
        if (didDetectSpeech) {
          await playSoundEffect('yay');
          if (!narrationSession.isActive()) {
            return;
          }
        }
        await speakTeacherPromptSegments(
          resolveRecordingEncouragementPrompt(
            teacherPromptMode,
            didDetectSpeech ? 'heardSpeech' : 'tryNextWord',
          ).segments,
          undefined,
          narrationSession,
        );
      } finally {
        await persistRecordingPromise;
        if (isMountedRef.current) {
          setStatus('recorded');
        }
        isFinishingRecordingRef.current = false;
      }
    },
    [onRecordingReady, teacherPromptMode],
  );

  const handleVoiceActivitySnapshot = useCallback(
    (snapshot: VoiceActivitySnapshot) => {
      if (
        statusRef.current !== 'recording' ||
        isFinishingRecordingRef.current
      ) {
        return;
      }

      const currentSnapshot = latestActivitySnapshotRef.current;
      if (
        currentSnapshot &&
        currentSnapshot.sessionId === snapshot.sessionId &&
        currentSnapshot.sequence > snapshot.sequence
      ) {
        return;
      }

      latestActivitySnapshotRef.current = snapshot;
      if (snapshot.shouldStop || snapshot.phase === 'ended') {
        finishRecording(snapshot.stopReason ?? 'maxDuration').catch(
          () => undefined,
        );
      }
    },
    [finishRecording],
  );

  const handleFallbackVoiceLevel = useCallback(
    (level: number | null) => {
      const recordingSession = recordingSessionRef.current;
      const endpointState = fallbackEndpointStateRef.current;
      const classifierState = fallbackLevelClassifierRef.current;
      if (!recordingSession || !endpointState || !classifierState) {
        return;
      }

      const classification = classifyVoiceLevel(classifierState, level);
      fallbackLevelClassifierRef.current = classification.state;
      const nextEndpointState = advanceVoiceEndpoint(
        endpointState,
        { atMs: Date.now(), isSpeech: classification.classification },
        recordingParamsRef.current,
      );
      fallbackEndpointStateRef.current = nextEndpointState;
      handleVoiceActivitySnapshot(
        toVoiceActivitySnapshot(
          nextEndpointState,
          recordingSession.sessionId,
          'levelFallback',
          classification.level,
        ),
      );
    },
    [handleVoiceActivitySnapshot],
  );

  const pollVoiceActivity = useCallback(async () => {
    if (
      isPollingLevelRef.current ||
      isFinishingRecordingRef.current ||
      statusRef.current !== 'recording'
    ) {
      return;
    }

    isPollingLevelRef.current = true;
    try {
      const recordingSession = recordingSessionRef.current;
      if (!recordingSession) {
        return;
      }

      if (recordingSession.detector === 'nativeVoiceActivity') {
        const snapshot = await getVoiceRecordingActivity(recordingSession);
        if (snapshot) {
          handleVoiceActivitySnapshot(snapshot);
        }
        return;
      }

      handleFallbackVoiceLevel(await getVoiceRecordingLevel());
    } finally {
      isPollingLevelRef.current = false;
    }
  }, [handleFallbackVoiceLevel, handleVoiceActivitySnapshot]);

  const startVoiceActivityMonitoring = useCallback(
    (
      recordingSession: VoiceRecordingSession,
      options: VoiceEndpointOptions,
    ) => {
      clearRecordingTimers(timerRef, levelPollTimerRef);
      const startedAtMs = Date.now();
      recordingParamsRef.current = options;
      latestActivitySnapshotRef.current = null;
      isPollingLevelRef.current = false;
      fallbackEndpointStateRef.current =
        recordingSession.detector === 'levelFallback'
          ? createVoiceEndpointState(startedAtMs)
          : null;
      fallbackLevelClassifierRef.current =
        recordingSession.detector === 'levelFallback'
          ? createLevelVoiceClassifierState()
          : null;

      timerRef.current = setTimeout(() => {
        finishRecording('maxDuration').catch(() => undefined);
      }, options.maxDurationMs + nativeSafetyMarginMs);

      levelPollTimerRef.current = setInterval(() => {
        pollVoiceActivity().catch(() => undefined);
      }, levelPollIntervalMs);
    },
    [finishRecording, pollVoiceActivity],
  );

  const beginRecording = useCallback(
    async ({
      permissionRequestSource,
      playPrompt,
      playTap,
    }: {
      permissionRequestSource: 'automatic' | 'manual';
      playPrompt: boolean;
      playTap: boolean;
    }) => {
      if (
        disabled ||
        status === 'prompting' ||
        status === 'recording' ||
        status === 'encouraging'
      ) {
        return;
      }
      const requestId = recordingRequestIdRef.current + 1;
      recordingRequestIdRef.current = requestId;
      const isRequestActive = () =>
        isMountedRef.current && recordingRequestIdRef.current === requestId;

      if (playTap) {
        await playTapSound();
        if (!isRequestActive()) {
          return;
        }
      }

      let permissionStatus: VoiceRecordingPermissionStatus;
      try {
        permissionStatus = await requestVoiceRecordingPermission(
          {
            buttonNegative: t('voiceRecorder.permissionNegative'),
            buttonPositive: t('voiceRecorder.permissionPositive'),
            message: t('voiceRecorder.permissionMessage'),
            title: t('voiceRecorder.permissionTitle'),
          },
          { source: permissionRequestSource },
        );
      } catch {
        if (isRequestActive()) {
          setMicrophoneAccessStatus('unavailable');
          setStatus('idle');
        }
        return;
      }
      if (!isRequestActive()) {
        return;
      }
      setMicrophoneAccessStatus(permissionStatus);
      if (permissionStatus !== 'granted') {
        setStatus('idle');
        if (
          permissionRequestSource === 'manual' &&
          permissionStatus === 'blocked'
        ) {
          Alert.alert(
            t('speakPractice.micPermissionTitle'),
            t('speakPractice.micPermissionText'),
            [
              { text: t('speakPractice.cancel'), style: 'cancel' },
              {
                text: t('speakPractice.openSettings'),
                onPress: () => {
                  isReturningFromSettingsRef.current = true;
                  Linking.openSettings().catch(() => {
                    isReturningFromSettingsRef.current = false;
                  });
                },
              },
            ],
          );
        }
        return;
      }

      setStatus('prompting');
      onAudioStart?.();
      const narrationSession = playPrompt ? startNarrationSession() : null;
      if (narrationSession) {
        await narrationSession.ready;
        if (!isRequestActive()) {
          return;
        }
        if (!narrationSession.isActive()) {
          setStatus('idle');
          return;
        }
        await speakTeacherPromptSegments(
          resolveSpeechPracticePrompt(teacherPromptMode).segments,
          undefined,
          narrationSession,
        );
        if (!isRequestActive()) {
          return;
        }
        if (!narrationSession.isActive()) {
          setStatus('idle');
          return;
        }
        await speakWord(word, undefined, narrationSession);
        if (!isRequestActive()) {
          return;
        }
        if (!narrationSession.isActive()) {
          setStatus('idle');
          return;
        }
      }

      const endpointOptions = resolveVoiceEndpointOptions(word, englishAccent);
      const recordingSession = await startVoiceRecording(endpointOptions);
      if (!isRequestActive()) {
        if (recordingSession) {
          await stopVoiceRecording(recordingSession, 'interrupted');
        }
        return;
      }
      if (narrationSession && !narrationSession.isActive()) {
        if (recordingSession) {
          await stopVoiceRecording(recordingSession, 'interrupted');
        }
        setStatus('idle');
        return;
      }
      if (!recordingSession) {
        setMicrophoneAccessStatus('unavailable');
        setStatus('idle');
        return;
      }

      recordingSessionRef.current = recordingSession;
      recordingUriRef.current = recordingSession.uri;
      setRecordingUri(recordingSession.uri);
      setStatus('recording');
      isFinishingRecordingRef.current = false;
      startVoiceActivityMonitoring(recordingSession, endpointOptions);
    },
    [
      disabled,
      englishAccent,
      onAudioStart,
      startVoiceActivityMonitoring,
      status,
      teacherPromptMode,
      t,
      word,
    ],
  );

  useEffect(() => {
    if (
      autoStartRequestId <= 0 ||
      handledAutoStartRequestRef.current === autoStartRequestId
    ) {
      return;
    }

    handledAutoStartRequestRef.current = autoStartRequestId;
    beginRecording({
      permissionRequestSource: 'automatic',
      playPrompt: autoStartWithPrompt,
      playTap: false,
    }).catch(() => {
      setMicrophoneAccessStatus('unavailable');
      setStatus('idle');
    });
  }, [autoStartRequestId, autoStartWithPrompt, beginRecording]);

  const handleRecordPress = async () => {
    if (disabled || status === 'prompting' || status === 'encouraging') {
      return;
    }

    if (status === 'recording') {
      await finishRecording('manual');
      return;
    }

    try {
      await beginRecording({
        permissionRequestSource: 'manual',
        playPrompt: true,
        playTap: true,
      });
    } catch {
      if (isMountedRef.current) {
        setMicrophoneAccessStatus('unavailable');
        setStatus('idle');
      }
    }
  };

  const handlePlaybackPress = async () => {
    if (
      !recordingUri ||
      disabled ||
      status === 'recording' ||
      status === 'prompting' ||
      status === 'encouraging'
    ) {
      return;
    }

    await playTapSound();
    onAudioStart?.();
    await playVoiceRecording(recordingUri);
  };

  const handleReplayModelPress = () => {
    if (
      !onReplayModel ||
      disabled ||
      status === 'recording' ||
      status === 'prompting' ||
      status === 'encouraging'
    ) {
      return;
    }

    onReplayModel();
  };

  const isPrompting = status === 'prompting';
  const isEncouraging = status === 'encouraging';
  const isNarrating = isPrompting || isEncouraging;
  const isRecording = status === 'recording';
  const hasRecording = status === 'recorded' || isEncouraging;
  const isMicrophoneDenied = microphoneAccessStatus === 'denied';
  const isMicrophoneBlocked = microphoneAccessStatus === 'blocked';
  const isMicrophoneUnavailable = microphoneAccessStatus === 'unavailable';
  const hasMicrophoneIssue =
    isMicrophoneDenied || isMicrophoneBlocked || isMicrophoneUnavailable;
  const microphoneBadgeTone: KidIconBadgeTone | undefined =
    isMicrophoneDenied
      ? 'warning'
      : isMicrophoneBlocked
      ? 'alert'
      : isMicrophoneUnavailable
      ? 'muted'
      : undefined;
  const isDisabled = disabled || isNarrating;
  const isModelButtonDisabled = disabled || isNarrating || isRecording;
  const rippleScale = listeningPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.86, 1.6],
  });
  const rippleOpacity = listeningPulse.interpolate({
    inputRange: [0, 0.72, 1],
    outputRange: [0.34, 0.14, 0],
  });
  const secondRippleScale = listeningPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.66, 1.34],
  });
  const secondRippleOpacity = listeningPulse.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.24, 0.16, 0],
  });
  const promptText = isInstructionPreparing
    ? t('speakPractice.promptPreparingAudio')
    : isInstructionPlaying
    ? t('speakPractice.promptInstruction')
    : isPrompting
    ? t('speakPractice.promptPrepare')
    : isRecording
    ? t('speakPractice.promptRecording')
    : hasRecording
    ? lastRecordingHadDetectedSpeech
      ? t('speakPractice.promptRecorded')
      : t('speakPractice.promptRecordedQuiet')
    : isMicrophoneDenied
    ? t('speakPractice.promptMicDenied')
    : isMicrophoneBlocked
    ? t('speakPractice.promptMicBlocked')
    : isMicrophoneUnavailable
    ? t('speakPractice.promptMicUnavailable')
    : t('speakPractice.promptSpeak');

  const microphoneActionLabel = isMicrophoneDenied
    ? t('speakPractice.enableMic')
    : isMicrophoneBlocked
    ? t('speakPractice.askParent')
    : t('speakPractice.micUnavailable');
  const microphoneActionAccessibilityLabel = isMicrophoneDenied
    ? t('speakPractice.enableMicAccessibility')
    : isMicrophoneBlocked
    ? t('speakPractice.askParentAccessibility')
    : t('speakPractice.micUnavailableAccessibility');

  return (
    <View style={styles.root}>
      <View style={styles.promptRow}>
        <View
          style={[
            styles.statusIcon,
            (isNarrating || isInstructionPreparing || isInstructionPlaying) &&
              styles.promptingStatusIcon,
            isRecording && styles.recordingStatusIcon,
            hasRecording && styles.recordedStatusIcon,
            hasMicrophoneIssue &&
              !hasRecording &&
              styles.microphoneIssueStatusIcon,
          ]}
        >
          {isNarrating || isInstructionPlaying ? (
            <AnimatedAudioWave color={colors.primaryDark} />
          ) : isInstructionPreparing ? (
            <SKidsIcon name="listen" size={26} />
          ) : isRecording ? (
            <AnimatedRecordingDot />
          ) : (
            <SKidsIcon name={hasRecording ? 'star' : 'speak'} size={26} />
          )}
        </View>
        <Text
          accessibilityLiveRegion="polite"
          numberOfLines={2}
          style={styles.prompt}
        >
          {promptText}
        </Text>
        {hasRecording ? (
          <Pressable
            accessibilityLabel={t('speakPractice.replayVoiceAccessibility')}
            accessibilityRole="button"
            disabled={isDisabled}
            onPress={handlePlaybackPress}
            style={({ pressed }) => [
              styles.voicePlaybackPill,
              pressed && !isDisabled && styles.pressed,
              isDisabled && styles.disabled,
            ]}
          >
            <SKidsIcon name="replay" size={24} />
            <Text numberOfLines={1} style={styles.voicePlaybackText}>
              {t('speakPractice.replayVoice')}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.wordPanel}>
        <Text adjustsFontSizeToFit numberOfLines={1} style={styles.word}>
          {word}
        </Text>
        {onReplayModel ? (
          <Pressable
            accessibilityLabel={t('speakPractice.replayModelAccessibility', {
              word,
            })}
            accessibilityRole="button"
            disabled={isModelButtonDisabled}
            onPress={handleReplayModelPress}
            style={({ pressed }) => [
              styles.modelButton,
              pressed && !isModelButtonDisabled && styles.pressed,
              isModelButtonDisabled && styles.disabled,
            ]}
          >
            <SKidsIcon name="listen" size={32} />
          </Pressable>
        ) : null}
      </View>

      {hasRecording || hasMicrophoneIssue ? (
        <View style={styles.actions}>
          <KidIconButton
            accessibilityLabel={
              hasRecording
                ? t('speakPractice.recordAgainAccessibility')
                : microphoneActionAccessibilityLabel
            }
            disabled={isDisabled || isMicrophoneUnavailable}
            icon="speak"
            iconBadge={hasMicrophoneIssue ? microphoneBadgeTone : undefined}
            label={
              hasRecording
                ? t('speakPractice.recordAgain')
                : microphoneActionLabel
            }
            onPress={handleRecordPress}
            size="md"
            style={[
              styles.actionButton,
              styles.secondaryAction,
              isMicrophoneDenied && styles.microphoneDeniedAction,
              isMicrophoneBlocked && styles.microphoneBlockedAction,
              isMicrophoneUnavailable && styles.microphoneUnavailableAction,
            ]}
            tone="quiet"
          />
          {onContinue ? (
            <KidIconButton
              accessibilityLabel={t('speakPractice.continueAccessibility')}
              disabled={isDisabled}
              icon="next"
              label={t('speakPractice.continue')}
              onPress={onContinue}
              style={[styles.actionButton, styles.primaryAction]}
            />
          ) : null}
        </View>
      ) : (
        <View style={styles.actions}>
          <Pressable
            accessibilityLabel={
              isRecording
                ? t('speakPractice.stopRecordingAccessibility')
                : t('speakPractice.speakAccessibility', { word })
            }
            accessibilityRole="button"
            disabled={isDisabled}
            onPress={handleRecordPress}
            style={({ pressed }) => [
              styles.recordButton,
              isRecording && styles.listeningButton,
              pressed && !isDisabled && styles.pressed,
              isDisabled && styles.disabled,
            ]}
          >
            {isRecording ? (
              <View style={styles.listeningMicWrap}>
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.listeningRipple,
                    {
                      opacity: rippleOpacity,
                      transform: [{ scale: rippleScale }],
                    },
                  ]}
                />
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.listeningRipple,
                    styles.listeningRippleSecond,
                    {
                      opacity: secondRippleOpacity,
                      transform: [{ scale: secondRippleScale }],
                    },
                  ]}
                />
                <View style={styles.listeningMicCore}>
                  <SKidsIcon name="speak" size={56} />
                </View>
              </View>
            ) : (
              <SKidsIcon name="speak" size={48} />
            )}
            <View
              style={[
                styles.recordLabelPill,
                isRecording && styles.listeningLabelPill,
              ]}
            >
              <Text numberOfLines={1} style={styles.recordLabel}>
                {isRecording
                  ? t('speakPractice.tapToStop')
                  : t('speakPractice.speak')}
              </Text>
            </View>
          </Pressable>
          {onContinue && !isRecording ? (
            <KidIconButton
              accessibilityLabel={t('speakPractice.continueAccessibility')}
              disabled={isDisabled}
              icon="next"
              label={t('speakPractice.continue')}
              onPress={onContinue}
              size="md"
              style={[styles.actionButton, styles.primaryAction]}
            />
          ) : null}
        </View>
      )}
    </View>
  );
}

function clearRecordingTimers(
  timeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
  intervalRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>,
) {
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }

  if (intervalRef.current) {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }
}

function resolveVoiceEndpointOptions(
  word: string,
  englishAccent: EnglishAccent = DEFAULT_ENGLISH_ACCENT,
): VoiceEndpointOptions {
  const wordCount = word.trim().split(/\s+/).filter(Boolean).length;
  const charCount = word.replace(/\s+/g, '').length;
  const noSpeechTimeoutMs = Math.max(5200, 3500 + charCount * 350);

  return {
    candidateGapMs: 160,
    maxDurationMs: noSpeechTimeoutMs + 1500,
    minSpeechMs: 240,
    noSpeechTimeoutMs,
    silenceAfterSpeechMs: wordCount > 1 ? 1100 : 750,
    ...(word.trim()
      ? {
          targetLocale: englishAccent,
          targetMatchPostRollMs: 350,
          targetText: word.trim(),
        }
      : {}),
  };
}

const styles = createThemedStyles(() => ({
  actionButton: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  modelButton: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderColor: colors.outlineStrong,
    borderRadius: radius.pill,
    borderWidth: 3,
    height: 52,
    justifyContent: 'center',
    width: 52,
    ...shadows.soft,
  },
  listeningButton: {
    backgroundColor: colors.transparent,
    borderWidth: 0,
    elevation: 0,
    minHeight: 110,
    minWidth: 160,
    shadowOpacity: 0,
  },
  listeningLabelPill: {
    marginTop: -spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  listeningMicCore: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderColor: colors.outlineStrong,
    borderRadius: radius.pill,
    borderWidth: 4,
    height: 76,
    justifyContent: 'center',
    width: 76,
    ...shadows.warm,
  },
  listeningMicWrap: {
    alignItems: 'center',
    height: 84,
    justifyContent: 'center',
    width: 84,
  },
  listeningRipple: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    height: 78,
    position: 'absolute',
    width: 78,
  },
  listeningRippleSecond: {
    backgroundColor: colors.secondary,
  },
  microphoneBlockedAction: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.alert,
  },
  microphoneDeniedAction: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondaryDark,
  },
  microphoneIssueStatusIcon: {
    backgroundColor: colors.accentSoft,
  },
  microphoneUnavailableAction: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.muted,
    opacity: 0.72,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  primaryAction: {
    backgroundColor: colors.secondary,
    borderColor: colors.outlineStrong,
    flex: 1.35,
    minHeight: 76,
    ...shadows.warm,
  },
  prompt: {
    color: colors.text,
    flex: 1,
    minWidth: 0,
    ...typography.caption,
  },
  promptRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    width: '100%',
  },
  promptingStatusIcon: {
    backgroundColor: colors.secondarySoft,
  },
  recordingStatusIcon: {
    backgroundColor: colors.accentSoft,
  },
  recordButton: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderColor: colors.outlineStrong,
    borderRadius: radius.xl,
    borderWidth: 3,
    flex: 1,
    justifyContent: 'center',
    minHeight: 96,
    minWidth: 140,
    padding: spacing.sm,
    ...shadows.soft,
  },
  recordLabel: {
    color: colors.text,
    textAlign: 'center',
    ...typography.caption,
  },
  recordLabelPill: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    marginTop: -spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
  },
  recordedStatusIcon: {
    backgroundColor: colors.secondary,
  },
  root: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  secondaryAction: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    flex: 0.95,
    minHeight: 76,
  },
  statusIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  voicePlaybackPill: {
    alignItems: 'center',
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.primarySoft,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  voicePlaybackText: {
    color: colors.primaryDark,
    ...typography.caption,
  },
  word: {
    color: colors.text,
    flex: 1,
    ...typography.title,
    fontSize: 32,
    lineHeight: 40,
    textAlign: 'center',
  },
  wordPanel: {
    alignItems: 'center',
    backgroundColor: colors.transparent,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 54,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
}));
