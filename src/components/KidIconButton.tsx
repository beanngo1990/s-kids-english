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
export type KidIconBadgeTone = 'alert' | 'muted' | 'warning';

type KidIconButtonProps = {
  accessibilityLabel: string;
  icon: SKidsIconName;
  onPress: () => void;
  disabled?: boolean;
  iconBadge?: KidIconBadgeTone;
  label?: string;
  size?: 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  tone?: KidIconButtonTone;
};

export function KidIconButton({
  accessibilityLabel,
  disabled = false,
  icon,
  iconBadge,
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
      <View style={styles.iconWrap}>
        <SKidsIcon name={icon} size={iconSize} />
        {iconBadge ? (
          <View
            accessibilityElementsHidden
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            style={[
              styles.iconBadge,
              iconBadge === 'alert' && styles.iconBadgeAlert,
              iconBadge === 'muted' && styles.iconBadgeMuted,
              iconBadge === 'warning' && styles.iconBadgeWarning,
            ]}
          >
            <Text
              accessible={false}
              style={[
                styles.iconBadgeText,
                iconBadge === 'warning' && styles.iconBadgeWarningText,
              ]}
            >
              !
            </Text>
          </View>
        ) : null}
      </View>
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
    borderColor: colors.outlineStrong,
    borderWidth: 3,
    justifyContent: 'center',
    ...shadows.soft,
  },
  disabled: {
    opacity: 0.45,
  },
  iconBadge: {
    alignItems: 'center',
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: -5,
    top: -5,
    width: 24,
  },
  iconBadgeAlert: {
    backgroundColor: colors.alert,
  },
  iconBadgeMuted: {
    backgroundColor: colors.muted,
  },
  iconBadgeText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
    textAlign: 'center',
  },
  iconBadgeWarning: {
    backgroundColor: colors.secondary,
  },
  iconBadgeWarningText: {
    color: colors.focusOutline,
  },
  iconWrap: {
    position: 'relative',
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
    borderColor: colors.border,
  },
  secondary: {
    backgroundColor: colors.primarySoft,
  },
}));
