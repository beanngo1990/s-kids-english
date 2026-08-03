import React, { ReactNode } from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';

import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type KidBadgeTone = 'sun' | 'teal' | 'coral' | 'sky' | 'alert';

type KidBadgeProps = {
  children: ReactNode;
  tone?: KidBadgeTone;
  style?: StyleProp<ViewStyle>;
};

export function KidBadge({ children, tone = 'sun', style }: KidBadgeProps) {
  useThemeSync();
  return (
    <View style={[styles.badge, styles[tone], style]}>
      <Text numberOfLines={1} style={[styles.text, styles[`${tone}Text`]]}>
        {children}
      </Text>
    </View>
  );
}

const styles = createThemedStyles(() => ({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  alert: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.alert,
  },
  alertText: {
    color: colors.alert,
  },
  coral: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  coralText: {
    color: colors.accentDark,
  },
  sky: {
    backgroundColor: colors.backgroundCool,
    borderColor: colors.sky,
  },
  skyText: {
    color: colors.textSoft,
  },
  sun: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
  },
  sunText: {
    color: colors.text,
  },
  teal: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  tealText: {
    color: colors.primaryDark,
  },
  text: {
    ...typography.caption,
  },
}));
