import React from 'react';
import {
  Pressable,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { SKidsIcon } from './SKidsIcon';
import { type SKidsIconName } from '../assets/icons/skids';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing, touchTarget } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';

type KidIconButtonTone = 'primary' | 'secondary' | 'quiet';

type KidIconButtonProps = {
  accessibilityLabel: string;
  icon: SKidsIconName;
  onPress: () => void;
  disabled?: boolean;
  label?: string;
  size?: 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  tone?: KidIconButtonTone;
};

export function KidIconButton({
  accessibilityLabel,
  disabled = false,
  icon,
  label,
  onPress,
  size = 'lg',
  style,
  tone = 'primary',
}: KidIconButtonProps) {
  useThemeSync();
  const iconSize = size === 'lg' ? 70 : 52;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[size],
        styles[tone],
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <SKidsIcon name={icon} size={iconSize} />
      {label ? (
        <View style={styles.labelPill}>
          <Text numberOfLines={1} style={styles.label}>
            {label}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = createThemedStyles(() => ({
  button: {
    alignItems: 'center',
    borderColor: colors.white,
    borderWidth: 3,
    justifyContent: 'center',
    ...shadows.soft,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    color: colors.text,
    textAlign: 'center',
    ...typography.caption,
  },
  labelPill: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    marginTop: -spacing.xs,
    maxWidth: '92%',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  lg: {
    borderRadius: radius.xl,
    minHeight: 118,
    minWidth: 118,
    padding: spacing.sm,
  },
  md: {
    borderRadius: radius.lg,
    minHeight: touchTarget.large,
    minWidth: touchTarget.large,
    padding: spacing.xs,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ translateY: 2 }, { scale: 0.98 }],
  },
  primary: {
    backgroundColor: colors.secondarySoft,
  },
  quiet: {
    backgroundColor: colors.surface,
    borderColor: colors.primarySoft,
  },
  secondary: {
    backgroundColor: colors.primarySoft,
  },
}));
