import React, { type ReactNode } from 'react';
import { Text, View } from 'react-native';

import type { MascotPoseId } from '../data/mascot';
import type { GameFeedbackState } from '../games/useGameFeedback';
import { useI18n } from '../i18n';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { AppCard } from './AppCard';
import { MascotImage } from './mascot';
import { ProgressStars } from './ProgressStars';
import { SparkleEffect } from './SparkleEffect';

type ReviewGameCoachProps = {
  action?: ReactNode;
  completed: number;
  detail?: string;
  feedback?: GameFeedbackState;
  isSpeaking?: boolean;
  prompt: string;
  reduceMotion: boolean;
  total: number;
};

export function ReviewGameCoach({
  action,
  completed,
  detail,
  feedback = 'idle',
  isSpeaking = false,
  prompt,
  reduceMotion,
  total,
}: ReviewGameCoachProps) {
  useThemeSync();
  const t = useI18n();
  const visibleFeedback = isSpeaking ? 'idle' : feedback;
  const pose = getCoachPose(visibleFeedback, isSpeaking);
  const message = isSpeaking
    ? t('reviewGame.coachSpeaking')
    : visibleFeedback === 'correct'
    ? t('reviewGame.coachCorrect')
    : visibleFeedback === 'wrong'
    ? t('reviewGame.coachTryAgain')
    : prompt;

  return (
    <AppCard
      style={[
        styles.card,
        visibleFeedback === 'correct' && styles.cardCorrect,
        visibleFeedback === 'wrong' && styles.cardWrong,
        isSpeaking && styles.cardSpeaking,
      ]}
    >
      <View style={styles.mascotStage}>
        <MascotImage decorative pose={pose} size={68} />
        <SparkleEffect
          active={visibleFeedback === 'correct' && !reduceMotion}
        />
      </View>

      <View style={styles.copy}>
        <Text
          accessibilityLiveRegion="polite"
          numberOfLines={2}
          style={styles.message}
        >
          {message}
        </Text>
        <View style={styles.progressRow}>
          <ProgressStars
            accessibilityLabel={t('reviewGame.progressAccessibility', {
              completed: String(completed),
              total: String(total),
            })}
            completed={completed}
            size="sm"
            total={total}
          />
          {detail ? <Text style={styles.detail}>{detail}</Text> : null}
        </View>
      </View>

      {action ? <View style={styles.action}>{action}</View> : null}
    </AppCard>
  );
}

function getCoachPose(
  feedback: GameFeedbackState,
  isSpeaking: boolean,
): MascotPoseId {
  if (isSpeaking) {
    return 'learn';
  }
  if (feedback === 'correct') {
    return 'greatJob';
  }
  if (feedback === 'wrong') {
    return 'tryAgain';
  }
  return 'learn';
}

const styles = createThemedStyles(() => ({
  action: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.cream,
    borderColor: colors.borderWarm,
    borderRadius: radius.xl,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 88,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  cardCorrect: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.secondary,
  },
  cardSpeaking: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.skyDeep,
  },
  cardWrong: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  copy: {
    flex: 1,
    gap: spacing.xxs,
  },
  detail: {
    color: colors.textSoft,
    ...typography.caption,
  },
  mascotStage: {
    alignItems: 'center',
    height: 72,
    justifyContent: 'center',
    position: 'relative',
    width: 72,
  },
  message: {
    color: colors.primaryDark,
    ...typography.subtitle,
    fontSize: 15,
    lineHeight: 20,
  },
  progressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
}));
