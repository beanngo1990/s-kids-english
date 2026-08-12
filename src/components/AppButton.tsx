import React from 'react';
import {
  Pressable,
  StyleProp,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { SKidsIcon } from './SKidsIcon';
import type { SKidsIconName } from '../assets/icons/skids';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing, touchTarget } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outlined';

type AppButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  iconName?: SKidsIconName;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  iconName,
  iconSize = 24,
  style,
  textStyle,
}: AppButtonProps) {
  useThemeSync();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.contentRow}>
        {iconName ? <SKidsIcon name={iconName} size={iconSize} /> : null}
        <Text 
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[styles.text, styles[`${variant}Text`], textStyle]}
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = createThemedStyles(() => ({
  base: {
    alignItems: 'center',
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: touchTarget.large,
    overflow: 'visible',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    width: '100%',
  },
  contentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ translateY: 2 }, { scale: 0.99 }],
  },
  primary: {
    backgroundColor: colors.secondary,
    borderColor: colors.outlineStrong,
    borderWidth: 2,
    ...shadows.warm,
  },
  ghost: {
    backgroundColor: colors.transparent,
  },
  ghostText: {
    color: colors.primaryDark,
  },
  outlined: {
    backgroundColor: colors.transparent,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  outlinedText: {
    color: colors.primaryDark,
  },
  primaryText: {
    color: colors.text,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.primarySoft,
    borderWidth: 2,
    ...shadows.soft,
  },
  secondaryText: {
    color: colors.primaryDark,
  },
  text: {
    ...typography.button,
    textAlign: 'center',
  },
}));
