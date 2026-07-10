import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type ProgressDotsProps = {
  current: number;
  total: number;
  style?: StyleProp<ViewStyle>;
};

export function ProgressDots({ current, total, style }: ProgressDotsProps) {
  useThemeSync();
  const safeTotal = Math.max(total, 1);
  const activeStep = Math.min(Math.max(current, 1), safeTotal);

  return (
    <View
      accessibilityLabel={`Bước ${activeStep} trên ${safeTotal}`}
      accessibilityRole="progressbar"
      style={[styles.container, style]}
    >
      {Array.from({ length: safeTotal }).map((_, index) => {
        const isActive = index + 1 === activeStep;

        return (
          <View
            key={index}
            style={[styles.dot, isActive ? styles.activeDot : styles.idleDot]}
          />
        );
      })}
    </View>
  );
}

const styles = createThemedStyles(() => ({
  activeDot: {
    backgroundColor: colors.secondary,
    width: 28,
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  dot: {
    borderRadius: radius.pill,
    height: 12,
  },
  idleDot: {
    backgroundColor: colors.primarySoft,
    width: 12,
  },
}));
