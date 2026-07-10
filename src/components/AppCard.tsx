import React, { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { layout, radius } from '../theme/spacing';
import { shadows } from '../theme/shadows';

type AppCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function AppCard({ children, style }: AppCardProps) {
  useThemeSync();
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = createThemedStyles(() => ({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: layout.cardPadding,
    ...shadows.soft,
  },
}));
