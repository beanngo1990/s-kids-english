import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Linking,
  Pressable,
  Text,
  View,
} from 'react-native';

import { KidIconButton } from './KidIconButton';
import { SKidsIcon } from './SKidsIcon';
import {
  playSoundEffect,
  playTapSound,
  speakTeacherPromptSegments,
  speakWord,
} from '../engine/AudioManager';
import {
  resolveRecordingEncouragementPrompt,
  resolveSpeechPracticePrompt,
} from '../i18n/teacherPrompts';
import type { TeacherPromptMode } from '../i18n/types';
import {
  getVoiceRecordingLevel,
  isVoiceRecorderAvailable,
  playVoiceRecording,
  requestVoiceRecordingPermission,
  startVoiceRecording,
  stopVoiceRecording,
} from '../engine/VoiceRecorder';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import { useI18n } from '../i18n';

type RecordingStatus =
  | 'idle'
  | 'prompting'
  | 'recording'
  | 'recorded'
  | 'unavailable';

type SpeakPracticeControlsProps = {
  autoStartRequestId?: number;
  disabled?: boolean;
  isInstructionPreparing?: boolean;
  isInstructionPlaying?: boolean;
  onAudioStart?: () => void;
  onBusyChange?: (isBusy: boolean) => void;
  onContinue?: () => void;
  onReplayModel?: () => void;
  teacherPromptMode?: TeacherPromptMode;
  word: string;
};

const levelPollIntervalMs = 120;
const minVoiceLevel = 0.065;
const noiseFloorMultiplier = 2.35;

function AnimatedAudioWave({ color }: { color: string }) {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnim = (anim: Animated.Value, duration: number, delay: number) => {
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
        ])
      ).start();
    };

    startAnim(anim1, 400, 0);
    startAnim(anim2, 350, 150);
    startAnim(anim3, 450, 50);
  }, [anim1, anim2, anim3]);

  const scaleY = (anim: Animated.Value) => anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.2] });

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, height: 16 }}>
      <Animated.View style={{ width: 4, height: 16, backgroundColor: color, borderRadius: 2, transform: [{ scaleY: scaleY(anim1) }] }} />
      <Animated.View style={{ width: 4, height: 16, backgroundColor: color, borderRadius: 2, transform: [{ scaleY: scaleY(anim2) }] }} />
      <Animated.View style={{ width: 4, height: 16, backgroundColor: color, borderRadius: 2, transform: [{ scaleY: scaleY(anim3) }] }} />
    </View>
  );
}

function AnimatedRecordingDot() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] });

  return (
    <Animated.View 
      style={{ 
        width: 14, 
        height: 14, 
        backgroundColor: colors.alert, 
        borderRadius: 7, 
        opacity, 
        transform: [{ scale }] 
      }} 
    />
  );
}

export function SpeakPracticeControls({
  autoStartRequestId = 0,
  disabled = false,
  isInstructionPreparing = false,
  isInstructionPlaying = false,
  onAudioStart,
  onBusyChange,
  onContinue,
  onReplayModel,
  teacherPromptMode = 'vi',
  word,
}: SpeakPracticeControlsProps) {
  useThemeSync();
  const t = useI18n();
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
  const recordingParamsRef = useRef({
    fallbackRecordingDurationMs: 5200,
    minListenBeforeSilenceStopMs: 900,
    silenceAfterSpeechMs: 900,
  });

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
    await speakTeacherPromptSegments(
      resolveRecordingEncouragementPrompt(teacherPromptMode).segments,
    );
    isFinishingRecordingRef.current = false;
  }, [teacherPromptMode]);

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
      elapsedMs >= recordingParamsRef.current.minListenBeforeSilenceStopMs &&
      now - lastSpeechAtRef.current >= recordingParamsRef.current.silenceAfterSpeechMs
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

    const wordCount = targetWord.trim().split(/\s+/).filter(Boolean).length;
    const charCount = targetWord.replace(/\s+/g, '').length;

    recordingParamsRef.current = {
      fallbackRecordingDurationMs: Math.max(5200, 3500 + charCount * 350),
      minListenBeforeSilenceStopMs: wordCount > 1 ? 1200 : 800,
      silenceAfterSpeechMs: wordCount > 1 ? 1100 : 750,
    };

    hasDetectedSpeechRef.current = false;
    isPollingLevelRef.current = false;
    lastSpeechAtRef.current = null;
    noiseFloorRef.current = 0.025;
    recordingStartedAtRef.current = Date.now();

    timerRef.current = setTimeout(() => {
      finishRecording().catch(() => undefined);
    }, recordingParamsRef.current.fallbackRecordingDurationMs);

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
      if (disabled || status === 'prompting' || status === 'recording') {
        return;
      }

      if (playTap) {
        await playTapSound();
      }

      const hasPermission = await requestVoiceRecordingPermission({
        buttonNegative: t('voiceRecorder.permissionNegative'),
        buttonPositive: t('voiceRecorder.permissionPositive'),
        message: t('voiceRecorder.permissionMessage'),
        title: t('voiceRecorder.permissionTitle'),
      });
      if (!hasPermission) {
        setStatus('unavailable');
        if (playTap) {
          Alert.alert(
            t('speakPractice.micPermissionTitle'),
            t('speakPractice.micPermissionText'),
            [
              { text: t('speakPractice.cancel'), style: 'cancel' },
              { text: t('speakPractice.openSettings'), onPress: () => Linking.openSettings() },
            ],
          );
        }
        return;
      }

      setStatus('prompting');
      onAudioStart?.();

      if (playPrompt) {
        await speakTeacherPromptSegments(
          resolveSpeechPracticePrompt(teacherPromptMode).segments,
        );
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
    [
      disabled,
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
    beginRecording({ playPrompt: false, playTap: false }).catch(() => {
      setStatus('idle');
    });
  }, [autoStartRequestId, beginRecording]);

  // Removed early return for 'unavailable' status so UI can still render
  // if (status === 'unavailable') {
  //   return null;
  // }

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
  const isUnavailable = status === 'unavailable';
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
  const promptText = isInstructionPreparing
    ? t('speakPractice.promptPreparingAudio')
    : isInstructionPlaying
    ? t('speakPractice.promptInstruction')
    : isPrompting
    ? t('speakPractice.promptPrepare')
    : isRecording
      ? t('speakPractice.promptRecording')
      : hasRecording
        ? t('speakPractice.promptRecorded')
        : isUnavailable
          ? t('speakPractice.promptNoMic')
          : t('speakPractice.promptSpeak');

  return (
    <View style={styles.root}>
      <View style={styles.promptRow}>
        <View
          style={[
            styles.statusIcon,
            (isPrompting ||
              isInstructionPreparing ||
              isInstructionPlaying) &&
              styles.promptingStatusIcon,
            isRecording && styles.recordingStatusIcon,
            hasRecording && styles.recordedStatusIcon,
          ]}
        >
          {isPrompting || isInstructionPlaying ? (
            <AnimatedAudioWave color={colors.primaryDark} />
          ) : isInstructionPreparing ? (
            <SKidsIcon name="listen" size={26} />
          ) : isRecording ? (
            <AnimatedRecordingDot />
          ) : (
            <SKidsIcon name={hasRecording ? 'star' : 'speak'} size={26} />
          )}
        </View>
        <Text numberOfLines={2} style={styles.prompt}>
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
            accessibilityLabel={t('speakPractice.replayModelAccessibility', { word })}
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

      {(hasRecording || isUnavailable) ? (
        <View style={styles.actions}>
          <KidIconButton
            accessibilityLabel={t('speakPractice.recordAgainAccessibility')}
            disabled={isDisabled}
            icon="speak"
            label={t('speakPractice.recordAgain')}
            onPress={handleRecordPress}
            size="md"
            style={[styles.actionButton, styles.secondaryAction]}
            tone="quiet"
          />
          {onContinue ? (
            <KidIconButton
              accessibilityLabel={t('speakPractice.continueAccessibility')}
              disabled={disabled}
              icon="next"
              label={t('speakPractice.continue')}
              onPress={onContinue}
              style={[styles.actionButton, styles.primaryAction, isUnavailable && { flex: 1 }]}
            />
          ) : null}
        </View>
      ) : (
        <View style={styles.actions}>
          <Pressable
            accessibilityLabel={isRecording ? t('speakPractice.stopRecordingAccessibility') : t('speakPractice.speakAccessibility', { word })}
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
              {isRecording ? t('speakPractice.tapToStop') : t('speakPractice.speak')}
            </Text>
          </View>
          </Pressable>
          {onContinue && !isRecording ? (
            <KidIconButton
              accessibilityLabel={t('speakPractice.continueAccessibility')}
              disabled={disabled}
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
    borderColor: colors.white,
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
    borderColor: colors.white,
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
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  primaryAction: {
    backgroundColor: colors.secondary,
    borderColor: colors.white,
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
    borderColor: colors.white,
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
    backgroundColor: colors.surface,
    borderColor: colors.primarySoft,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  secondaryAction: {
    backgroundColor: colors.surface,
    borderColor: colors.primarySoft,
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
    lineHeight: 38,
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
