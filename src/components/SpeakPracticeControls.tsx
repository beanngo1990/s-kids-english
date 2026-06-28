import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SKidsIcon } from './SKidsIcon';
import { speakPracticePromptVi } from '../data/speechPrompts';
import {
  playSoundEffect,
  playTapSound,
  speakVi,
  speakWord,
} from '../engine/AudioManager';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import {
  isVoiceRecorderAvailable,
  playVoiceRecording,
  requestVoiceRecordingPermission,
  startVoiceRecording,
  stopVoiceRecording,
} from '../engine/VoiceRecorder';

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
  word: string;
};

const maxRecordingDurationMs = 2300;
const encourageText = 'Cô nghe rồi! Giỏi quá!';

export function SpeakPracticeControls({
  autoStartRequestId = 0,
  disabled = false,
  onAudioStart,
  onBusyChange,
  word,
}: SpeakPracticeControlsProps) {
  const [status, setStatus] = useState<RecordingStatus>(() =>
    isVoiceRecorderAvailable() ? 'idle' : 'unavailable',
  );
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingUriRef = useRef<string | null>(null);
  const handledAutoStartRequestRef = useRef(0);

  useEffect(() => {
    return () => {
      clearRecordingTimer(timerRef);
      if (status === 'recording') {
        stopVoiceRecording().catch(() => undefined);
      }
    };
  }, [status]);

  useEffect(() => {
    onBusyChange?.(status === 'prompting' || status === 'recording');
  }, [onBusyChange, status]);

  const finishRecording = useCallback(async () => {
    clearRecordingTimer(timerRef);
    const stoppedRecordingUri = await stopVoiceRecording();
    const nextRecordingUri = stoppedRecordingUri ?? recordingUriRef.current;

    if (!nextRecordingUri) {
      setStatus('idle');
      return;
    }

    recordingUriRef.current = nextRecordingUri;
    setRecordingUri(nextRecordingUri);
    setStatus('recorded');
    await playSoundEffect('yay');
    await speakVi(encourageText);
  }, []);

  const beginRecording = useCallback(async ({
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
    clearRecordingTimer(timerRef);
    timerRef.current = setTimeout(() => {
      finishRecording().catch(() => undefined);
    }, maxRecordingDurationMs);
  }, [disabled, finishRecording, onAudioStart, status, word]);

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

  const isPrompting = status === 'prompting';
  const isRecording = status === 'recording';
  const hasRecording = status === 'recorded';
  const isDisabled = disabled || isPrompting;

  return (
    <View style={styles.root}>
      <View style={styles.copy}>
        <View style={styles.promptRow}>
          <View
            style={[
              styles.micDot,
              isPrompting && styles.promptingDot,
              isRecording && styles.recordingDot,
              hasRecording && styles.recordedDot,
            ]}
          />
          <Text style={styles.prompt}>
            {isPrompting
              ? 'Chuẩn bị đọc...'
              : isRecording
                ? 'Cô đang nghe...'
                : hasRecording
                  ? 'Giỏi quá! Nghe lại giọng bé'
                  : 'Bé nói theo cô'}
          </Text>
        </View>
        <Text numberOfLines={1} style={styles.word}>
          {word}
        </Text>
      </View>

      <View style={styles.actions}>
        {hasRecording ? (
          <Pressable
            accessibilityLabel="Nghe lại giọng bé"
            accessibilityRole="button"
            disabled={isDisabled}
            onPress={handlePlaybackPress}
            style={({ pressed }) => [
              styles.iconButton,
              styles.playButton,
              pressed && !isDisabled && styles.pressed,
              isDisabled && styles.disabled,
            ]}
          >
            <SKidsIcon name="replay" size={42} />
          </Pressable>
        ) : null}
        <Pressable
          accessibilityLabel={isRecording ? 'Dừng ghi âm' : `Bé nói ${word}`}
          accessibilityRole="button"
          disabled={isDisabled}
          onPress={handleRecordPress}
          style={({ pressed }) => [
            styles.iconButton,
            styles.recordButton,
            isRecording && styles.stopButton,
            pressed && !isDisabled && styles.pressed,
            isDisabled && styles.disabled,
          ]}
        >
          {isRecording ? (
            <View style={styles.stopIcon} />
          ) : (
            <SKidsIcon name="speak" size={62} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

function clearRecordingTimer(
  timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
) {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }
}

const styles = StyleSheet.create({
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  copy: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  disabled: {
    opacity: 0.5,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: radius.pill,
    justifyContent: 'center',
  },
  playButton: {
    backgroundColor: colors.white,
    borderColor: colors.primarySoft,
    borderWidth: 2,
    height: 58,
    width: 58,
  },
  micDot: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 14,
    width: 14,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  promptingDot: {
    backgroundColor: colors.secondary,
  },
  prompt: {
    color: colors.primaryDark,
    flexShrink: 1,
    ...typography.caption,
  },
  promptRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  recordButton: {
    backgroundColor: colors.transparent,
    height: 76,
    width: 76,
  },
  recordedDot: {
    backgroundColor: colors.secondary,
  },
  recordingDot: {
    backgroundColor: colors.accent,
  },
  root: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.primarySoft,
    borderRadius: radius.xl,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 82,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  stopButton: {
    backgroundColor: colors.accent,
  },
  stopIcon: {
    backgroundColor: colors.white,
    borderRadius: 4,
    height: 18,
    width: 18,
  },
  word: {
    color: colors.text,
    ...typography.title,
    fontSize: 30,
  },
});
