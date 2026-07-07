import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from './AppCard';
import { colors } from '../theme/colors';
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
  const streakLabel =
    currentStreak === 0
      ? 'Bé chưa học hôm nay'
      : currentStreak === 1
        ? 'Bé đã học hôm nay!'
        : `${currentStreak} ngày liên tiếp!`;

  return (
    <AppCard style={styles.card}>
      <View style={styles.row}>
        <View style={styles.fireContainer}>
          <Text style={styles.fireEmoji}>
            {currentStreak > 0 ? '🔥' : '💤'}
          </Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>{streakLabel}</Text>
          {longestStreak > 1 && (
            <Text style={styles.recordText}>
              Kỷ lục: {longestStreak} ngày 🏆
            </Text>
          )}
        </View>
      </View>
      <View style={styles.dotsRow}>
        {Array.from({ length: 7 }).map((_, i) => {
          const isActive = i < currentStreak && i < 7;
          return (
            <View
              key={i}
              style={[styles.dot, isActive && styles.dotActive]}
            />
          );
        })}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundWarm,
    borderColor: colors.borderWarm,
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
    borderColor: colors.borderWarm,
    borderRadius: radius.lg,
    borderWidth: 2,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  fireEmoji: {
    fontSize: 28,
    lineHeight: 34,
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
});
