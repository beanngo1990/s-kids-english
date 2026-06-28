import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { KidIconButton } from './KidIconButton';
import { SKidsIcon } from './SKidsIcon';
import { speakPracticePromptVi } from '../data/speechPrompts';
import {
  playSoundEffect,
  playTapSound,
  speakVi,
  speakWord,
} from '../engine/AudioManager';
import {
  getVoiceRecordingLevel,
  isVoiceRecorderAvailable,
  playVoiceRecording,
  requestVoiceRecordingPermission,
  startVoiceRecording,
  stopVoiceRecording,
} from '../engine/VoiceRecorder';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';

type RecordingStatus =
  | 'idle'
  | 'prompting'
  | 'recording'
  | 'recorded'
  | 'unavailable';

type SpeakPracticeControlsProps = {
  autoStartRequestId?: number;
  disabled?: boolean;
  onAudioStart?: () => void;
  onBusyChange?: (isBusy: boolean) => void;
  onContinue?: () => void;
  onReplayModel?: () => void;
  word: string;
};

const fallbackSingleWordRecordingMs = 5200;
const fallbackPhraseRecordingMs = 7600;
const levelPollIntervalMs = 120;
const minListenBeforeSilenceStopMs = 900;
const minVoiceLevel = 0.065;
const noiseFloorMultiplier = 2.35;
const silenceAfterSpeechMs = 900;
const encourageText = 'Cô nghe rồi! Giỏi quá!';

export function SpeakPracticeControls({
  autoStartRequestId = 0,
  disabled = false,
  onAudioStart,
  onBusyChange,
  onContinue,
  onReplayModel,
  word,
}: SpeakPracticeControlsProps) {
  const [status, setStatus] = useState<RecordingStatus>(() =>
    isVoiceRecorderAvailable() ? 'idle' : 'unavailable',
  );
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const levelPollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const listeningPulse = useRef(new Animated.Value(0)).current;
  const recordingUriRef = useRef<string | null>(null);
  const handledAutoStartRequestRef = useRef(0);
  const hasDetectedSpeechRef = useRef(false);
  const isFinishingRecordingRef = useRef(false);
  const isPollingLevelRef = useRef(false);
  const lastSpeechAtRef = useRef<number | null>(null);
  const noiseFloorRef = useRef(0.025);
  const recordingStartedAtRef = useRef(0);
  const statusRef = useRef<RecordingStatus>(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    return () => {
      clearRecordingTimers(timerRef, levelPollTimerRef);
      if (statusRef.current === 'recording') {
        stopVoiceRecording().catch(() => undefined);
      }
    };
  }, []);

  useEffect(() => {
    onBusyChange?.(status === 'prompting' || status === 'recording');
  }, [onBusyChange, status]);

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

  const finishRecording = useCallback(async () => {
    if (
      isFinishingRecordingRef.current ||
      statusRef.current !== 'recording'
    ) {
      return;
    }

    isFinishingRecordingRef.current = true;
    clearRecordingTimers(timerRef, levelPollTimerRef);
    const stoppedRecordingUri = await stopVoiceRecording();
    const nextRecordingUri = stoppedRecordingUri ?? recordingUriRef.current;

    if (!nextRecordingUri) {
      setStatus('idle');
      isFinishingRecordingRef.current = false;
      return;
    }

    recordingUriRef.current = nextRecordingUri;
    setRecordingUri(nextRecordingUri);
    setStatus('recorded');
    await playSoundEffect('yay');
    await speakVi(encourageText);
    isFinishingRecordingRef.current = false;
  }, []);

  const handleVoiceLevel = useCallback((level: number | null) => {
    if (
      level === null ||
      statusRef.current !== 'recording' ||
      isFinishingRecordingRef.current
    ) {
      return;
    }

    const now = Date.now();
    const elapsedMs = now - recordingStartedAtRef.current;
    const clampedLevel = Math.max(0, Math.min(1, level));

    if (!hasDetectedSpeechRef.current) {
      noiseFloorRef.current =
        noiseFloorRef.current * 0.92 + Math.min(clampedLevel, 0.16) * 0.08;
    }

    const speechThreshold = Math.max(
      minVoiceLevel,
      noiseFloorRef.current * noiseFloorMultiplier,
    );

    if (clampedLevel >= speechThreshold) {
      hasDetectedSpeechRef.current = true;
      lastSpeechAtRef.current = now;
      return;
    }

    if (
      hasDetectedSpeechRef.current &&
      lastSpeechAtRef.current !== null &&
      elapsedMs >= minListenBeforeSilenceStopMs &&
      now - lastSpeechAtRef.current >= silenceAfterSpeechMs
    ) {
      finishRecording().catch(() => undefined);
    }
  }, [finishRecording]);

  const pollVoiceLevel = useCallback(async () => {
    if (
      isPollingLevelRef.current ||
      isFinishingRecordingRef.current ||
      statusRef.current !== 'recording'
    ) {
      return;
    }

    isPollingLevelRef.current = true;
    try {
      handleVoiceLevel(await getVoiceRecordingLevel());
    } finally {
      isPollingLevelRef.current = false;
    }
  }, [handleVoiceLevel]);

  const startVoiceActivityMonitoring = useCallback((targetWord: string) => {
    clearRecordingTimers(timerRef, levelPollTimerRef);
    hasDetectedSpeechRef.current = false;
    isPollingLevelRef.current = false;
    lastSpeechAtRef.current = null;
    noiseFloorRef.current = 0.025;
    recordingStartedAtRef.current = Date.now();

    timerRef.current = setTimeout(() => {
      finishRecording().catch(() => undefined);
    }, getFallbackRecordingDurationMs(targetWord));

    levelPollTimerRef.current = setInterval(() => {
      pollVoiceLevel().catch(() => undefined);
    }, levelPollIntervalMs);
  }, [finishRecording, pollVoiceLevel]);

  const beginRecording = useCallback(
    async ({
      playPrompt,
      playTap,
    }: {
      playPrompt: boolean;
      playTap: boolean;
    }) => {
      if (
        disabled ||
        status === 'prompting' ||
        status === 'recording' ||
        status === 'unavailable'
      ) {
        return;
      }

      if (playTap) {
        await playTapSound();
      }

      const hasPermission = await requestVoiceRecordingPermission();
      if (!hasPermission) {
        setStatus('idle');
        return;
      }

      setStatus('prompting');
      onAudioStart?.();

      if (playPrompt) {
        await speakVi(speakPracticePromptVi);
        await speakWord(word);
      }

      const nextRecordingUri = await startVoiceRecording();
      if (!nextRecordingUri) {
        setStatus('unavailable');
        return;
      }

      recordingUriRef.current = nextRecordingUri;
      setRecordingUri(nextRecordingUri);
      setStatus('recording');
      isFinishingRecordingRef.current = false;
      startVoiceActivityMonitoring(word);
    },
    [disabled, onAudioStart, startVoiceActivityMonitoring, status, word],
  );

  useEffect(() => {
    if (
      autoStartRequestId <= 0 ||
      handledAutoStartRequestRef.current === autoStartRequestId
    ) {
      return;
    }

    handledAutoStartRequestRef.current = autoStartRequestId;
    beginRecording({ playPrompt: false, playTap: false }).catch(() => {
      setStatus('idle');
    });
  }, [autoStartRequestId, beginRecording]);

  if (status === 'unavailable') {
    return null;
  }

  const handleRecordPress = async () => {
    if (disabled || status === 'prompting') {
      return;
    }

    if (status === 'recording') {
      await finishRecording();
      return;
    }

    await beginRecording({ playPrompt: true, playTap: true });
  };

  const handlePlaybackPress = async () => {
    if (
      !recordingUri ||
      disabled ||
      status === 'recording' ||
      status === 'prompting'
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
      status === 'prompting'
    ) {
      return;
    }

    onReplayModel();
  };

  const isPrompting = status === 'prompting';
  const isRecording = status === 'recording';
  const hasRecording = status === 'recorded';
  const isDisabled = disabled || isPrompting;
  const isModelButtonDisabled = disabled || isPrompting || isRecording;
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
  const promptText = isPrompting
    ? 'Chuẩn bị đọc...'
    : isRecording
      ? 'Cô đang nghe...'
      : hasRecording
        ? 'Giỏi quá! Từ này đọc là:'
        : 'Bé nói theo cô:';

  return (
    <View style={styles.root}>
      <View style={styles.promptRow}>
        {!isRecording ? (
          <View
            style={[
              styles.statusIcon,
              isPrompting && styles.promptingStatusIcon,
              hasRecording && styles.recordedStatusIcon,
            ]}
          >
            <SKidsIcon name={hasRecording ? 'star' : 'speak'} size={26} />
          </View>
        ) : null}
        <Text numberOfLines={2} style={styles.prompt}>
          {promptText}
        </Text>
        {hasRecording ? (
          <Pressable
            accessibilityLabel="Nghe lại giọng bé"
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
              Giọng bé
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
            accessibilityLabel={`Nghe mẫu từ ${word}`}
            accessibilityRole="button"
            disabled={isModelButtonDisabled}
            onPress={handleReplayModelPress}
            style={({ pressed }) => [
              styles.modelButton,
              pressed && !isModelButtonDisabled && styles.pressed,
              isModelButtonDisabled && styles.disabled,
            ]}
          >
            <SKidsIcon name="listen" size={44} />
          </Pressable>
        ) : null}
      </View>

      {hasRecording ? (
        <View style={styles.actions}>
          <KidIconButton
            accessibilityLabel="Thu âm lại"
            disabled={isDisabled}
            icon="speak"
            label="Thu lại"
            onPress={handleRecordPress}
            size="md"
            style={[styles.actionButton, styles.secondaryAction]}
            tone="quiet"
          />
          {onContinue ? (
            <KidIconButton
              accessibilityLabel="Tiếp tục"
              disabled={disabled}
              icon="next"
              label="Tiếp tục"
              onPress={onContinue}
              size="md"
              style={[styles.actionButton, styles.primaryAction]}
            />
          ) : null}
        </View>
      ) : (
        <Pressable
          accessibilityLabel={isRecording ? 'Dừng ghi âm' : `Bé nói ${word}`}
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
                <SKidsIcon name="speak" size={84} />
              </View>
            </View>
          ) : (
            <SKidsIcon name="speak" size={76} />
          )}
          <View
            style={[
              styles.recordLabelPill,
              isRecording && styles.listeningLabelPill,
            ]}
          >
            <Text numberOfLines={1} style={styles.recordLabel}>
              {isRecording ? 'Chạm để dừng' : 'Bé nói'}
            </Text>
          </View>
        </Pressable>
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

function getFallbackRecordingDurationMs(word: string) {
  const wordCount = word.trim().split(/\s+/).filter(Boolean).length;

  return wordCount > 1
    ? fallbackPhraseRecordingMs
    : fallbackSingleWordRecordingMs;
}

const styles = StyleSheet.create({
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
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 3,
    height: 68,
    justifyContent: 'center',
    width: 68,
    ...shadows.soft,
  },
  listeningButton: {
    backgroundColor: colors.transparent,
    borderWidth: 0,
    elevation: 0,
    minHeight: 148,
    minWidth: 210,
    shadowOpacity: 0,
  },
  listeningLabelPill: {
    marginTop: -spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  listeningMicCore: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 4,
    height: 110,
    justifyContent: 'center',
    width: 110,
    ...shadows.warm,
  },
  listeningMicWrap: {
    alignItems: 'center',
    height: 124,
    justifyContent: 'center',
    width: 124,
  },
  listeningRipple: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    height: 112,
    position: 'absolute',
    width: 112,
  },
  listeningRippleSecond: {
    backgroundColor: colors.secondary,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  primaryAction: {
    backgroundColor: colors.secondary,
    borderColor: colors.white,
    flex: 1.35,
    minHeight: 92,
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
  recordButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.primarySoft,
    borderColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 3,
    justifyContent: 'center',
    minHeight: 128,
    minWidth: 178,
    padding: spacing.sm,
    ...shadows.soft,
  },
  recordLabel: {
    color: colors.text,
    textAlign: 'center',
    ...typography.caption,
  },
  recordLabelPill: {
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    marginTop: -spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
  },
  recordedStatusIcon: {
    backgroundColor: colors.secondary,
  },
  root: {
    backgroundColor: colors.white,
    borderColor: colors.primarySoft,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  secondaryAction: {
    backgroundColor: colors.white,
    borderColor: colors.primarySoft,
    flex: 0.95,
    minHeight: 86,
  },
  statusIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 42,
    justifyContent: 'center',
    width: 42,
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
    fontSize: 42,
    lineHeight: 48,
    textAlign: 'center',
  },
  wordPanel: {
    alignItems: 'center',
    backgroundColor: colors.transparent,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 72,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
});
