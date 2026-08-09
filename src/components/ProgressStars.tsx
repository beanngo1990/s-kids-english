import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';

import { useI18n } from '../i18n';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { spacing } from '../theme/spacing';

type ProgressStarsProps = {
  accessibilityLabel?: string;
  completed: number;
  size?: 'md' | 'sm';
  total: number;
  style?: StyleProp<ViewStyle>;
};

export function ProgressStars({
  accessibilityLabel,
  completed,
  size = 'md',
  total,
  style,
}: ProgressStarsProps) {
  useThemeSync();
  const t = useI18n();
  const safeTotal = Math.max(total, 1);
  const safeCompleted = Math.min(Math.max(completed, 0), safeTotal);
  const resolvedAccessibilityLabel =
    accessibilityLabel ??
    t('progressStars.accessibilityLabel', {
      completed: String(safeCompleted),
      total: String(safeTotal),
    });

  return (
    <View
      accessibilityLabel={resolvedAccessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{
        max: safeTotal,
        min: 0,
        now: safeCompleted,
      }}
      accessible
      style={[styles.row, style]}
    >
      {Array.from({ length: safeTotal }).map((_, index) => {
        const isFilled = index < safeCompleted;

        return (
          <Text
            key={index}
            style={[
              styles.star,
              size === 'sm' && styles.starSmall,
              isFilled ? styles.filled : styles.empty,
            ]}
          >
            ★
          </Text>
        );
      })}
    </View>
  );
}

const styles = createThemedStyles(() => ({
  empty: {
    color: colors.primarySoft,
  },
  filled: {
    color: colors.secondary,
    textShadowColor: colors.borderWarm,
    textShadowOffset: {
      height: 1,
      width: 0,
    },
    textShadowRadius: 2,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  star: {
    fontSize: 24,
    lineHeight: 28,
  },
  starSmall: {
    fontSize: 18,
    lineHeight: 21,
  },
}));
