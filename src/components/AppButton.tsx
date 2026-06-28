import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';

import { colors } from '../theme/colors';
import { radius, spacing, touchTarget } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type AppButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
}: AppButtonProps) {
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
      <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: touchTarget.large,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    width: '100%',
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
    borderColor: colors.white,
    borderWidth: 2,
    ...shadows.warm,
  },
  ghost: {
    backgroundColor: colors.transparent,
  },
  ghostText: {
    color: colors.primaryDark,
  },
  primaryText: {
    color: colors.text,
  },
  secondary: {
    backgroundColor: colors.white,
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
});
