import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { playSoundEffect, playTapSound, speakVi } from '../engine/AudioManager';
import {
  isVoiceRecorderAvailable,
  playVoiceRecording,
  requestVoiceRecordingPermission,
  startVoiceRecording,
  stopVoiceRecording,
} from '../engine/VoiceRecorder';

type RecordingStatus = 'idle' | 'recording' | 'recorded' | 'unavailable';

type SpeakPracticeControlsProps = {
  disabled?: boolean;
  word: string;
};

const maxRecordingDurationMs = 2300;
const encourageText = 'Cô nghe rồi! Giỏi quá!';

export function SpeakPracticeControls({
  disabled = false,
  word,
}: SpeakPracticeControlsProps) {
  const [status, setStatus] = useState<RecordingStatus>(() =>
    isVoiceRecorderAvailable() ? 'idle' : 'unavailable',
  );
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingUriRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      clearRecordingTimer(timerRef);
      if (status === 'recording') {
        stopVoiceRecording().catch(() => undefined);
      }
    };
  }, [status]);

  if (status === 'unavailable') {
    return null;
  }

  const handleRecordPress = async () => {
    if (disabled) {
      return;
    }

    if (status === 'recording') {
      await finishRecording();
      return;
    }

    await playTapSound();

    const hasPermission = await requestVoiceRecordingPermission();
    if (!hasPermission) {
      setStatus('idle');
      return;
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
  };

  const handlePlaybackPress = async () => {
    if (!recordingUri || disabled || status === 'recording') {
      return;
    }

    await playTapSound();
    await playVoiceRecording(recordingUri);
  };

  const finishRecording = async () => {
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
  };

  const isRecording = status === 'recording';
  const hasRecording = status === 'recorded';

  return (
    <View style={styles.root}>
      <View style={styles.copy}>
        <View style={styles.promptRow}>
          <View
            style={[
              styles.micDot,
              isRecording && styles.recordingDot,
              hasRecording && styles.recordedDot,
            ]}
          />
          <Text style={styles.prompt}>
            {isRecording
              ? 'Cô đang nghe...'
              : hasRecording
                ? 'Nghe lại giọng bé'
                : 'Nói theo'}
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
            disabled={disabled}
            onPress={handlePlaybackPress}
            style={({ pressed }) => [
              styles.iconButton,
              styles.playButton,
              pressed && !disabled && styles.pressed,
              disabled && styles.disabled,
            ]}
          >
            <Text style={styles.playIcon}>▶</Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityLabel={isRecording ? 'Dừng ghi âm' : `Bé nói ${word}`}
          accessibilityRole="button"
          disabled={disabled}
          onPress={handleRecordPress}
          style={({ pressed }) => [
            styles.iconButton,
            styles.recordButton,
            isRecording && styles.stopButton,
            pressed && !disabled && styles.pressed,
            disabled && styles.disabled,
          ]}
        >
          <Text style={styles.recordIcon}>{isRecording ? '■' : '🎤'}</Text>
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
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
    borderWidth: 2,
    height: 46,
    width: 46,
  },
  playIcon: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 24,
  },
  micDot: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 14,
    width: 14,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
  prompt: {
    color: colors.textSoft,
    flexShrink: 1,
    ...typography.caption,
  },
  promptRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  recordButton: {
    backgroundColor: colors.primary,
    height: 56,
    shadowColor: colors.shadow,
    shadowOffset: {
      height: 4,
      width: 0,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    width: 56,
  },
  recordIcon: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
    textAlign: 'center',
  },
  recordedDot: {
    backgroundColor: colors.secondary,
  },
  recordingDot: {
    backgroundColor: colors.accent,
  },
  root: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.secondary,
    borderRadius: radius.pill,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 66,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  stopButton: {
    backgroundColor: colors.accent,
  },
  word: {
    color: colors.text,
    ...typography.body,
  },
});
