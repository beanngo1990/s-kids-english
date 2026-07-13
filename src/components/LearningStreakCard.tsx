import React from 'react';
import { Image, Text, View } from 'react-native';

import { AppCard } from './AppCard';
import { useI18n } from '../i18n';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type LearningStreakCardProps = {
  currentStreak: number;
  longestStreak: number;
};

export function LearningStreakCard({
  currentStreak,
  longestStreak,
}: LearningStreakCardProps) {
  useThemeSync();
  const t = useI18n();
  const streakLabel =
    currentStreak === 0
      ? t('streak.notLearnedToday')
      : currentStreak === 1
        ? t('streak.learnedToday')
        : t('streak.streakDays', { days: String(currentStreak) });

  return (
    <AppCard style={styles.card}>
      <View style={styles.row}>
        <View style={styles.fireContainer}>
          {currentStreak > 0 ? (
            <Image
              source={require('../assets/icons/skids/star.png')}
              style={styles.streakImage}
            />
          ) : (
            <Text style={styles.sleepEmoji}>🌙</Text>
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>{streakLabel}</Text>
          {longestStreak > 1 && (
            <Text style={styles.recordText}>
              {t('streak.record', { days: String(longestStreak) })}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.dotsRow}>
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, i) => {
          const isActive = i < currentStreak && i < 7;
          return (
            <View key={i} style={styles.dotColumn}>
              <View style={[styles.dot, isActive && styles.dotActive]} />
              <Text style={styles.dayLabel}>{day}</Text>
            </View>
          );
        })}
      </View>
    </AppCard>
  );
}

const styles = createThemedStyles(() => ({
  card: {
    backgroundColor: colors.backgroundWarm,
    gap: spacing.sm,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  fireContainer: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.lg,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  streakImage: {
    height: 32,
    resizeMode: 'contain',
    width: 32,
  },
  sleepEmoji: {
    fontSize: 32,
    lineHeight: 38,
  },
  textContainer: {
    flex: 1,
    gap: spacing.xxs,
  },
  streakNumber: {
    color: colors.secondaryDark,
    ...typography.title,
  },
  streakLabel: {
    color: colors.text,
    ...typography.caption,
  },
  recordText: {
    color: colors.muted,
    ...typography.caption,
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  dot: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    height: 8,
    width: 8,
  },
  dotActive: {
    backgroundColor: colors.secondary,
  },
  dotColumn: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  dayLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
  },
}));
