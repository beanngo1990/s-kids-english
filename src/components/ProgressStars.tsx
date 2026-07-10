import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';

import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { spacing } from '../theme/spacing';

type ProgressStarsProps = {
  completed: number;
  total: number;
  style?: StyleProp<ViewStyle>;
};

export function ProgressStars({ completed, total, style }: ProgressStarsProps) {
  useThemeSync();
  const safeTotal = Math.max(total, 1);
  const safeCompleted = Math.min(Math.max(completed, 0), safeTotal);

  return (
    <View
      accessibilityLabel={`Bé đã hoàn thành ${safeCompleted} trên ${safeTotal} cảnh`}
      accessibilityRole="progressbar"
      style={[styles.row, style]}
    >
      {Array.from({ length: safeTotal }).map((_, index) => {
        const isFilled = index < safeCompleted;

        return (
          <Text
            key={index}
            style={[styles.star, isFilled ? styles.filled : styles.empty]}
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
}));
