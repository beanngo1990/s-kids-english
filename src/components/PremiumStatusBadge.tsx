import React from 'react';
import { Text, View } from 'react-native';

import { PremiumIcon } from './PremiumIcon';
import { useI18n } from '../i18n';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type PremiumStatusBadgeProps = {
  accessible?: boolean;
  compact?: boolean;
  iconOnly?: boolean;
  variant?: 'account' | 'app';
};

export function PremiumStatusBadge({
  accessible = true,
  compact = false,
  iconOnly = false,
  variant = 'app',
}: PremiumStatusBadgeProps) {
  useThemeSync();
  const t = useI18n();
  const label =
    variant === 'account'
      ? t('premium.status.accountBadge')
      : t('premium.status.badge');

  return (
    <View
      accessibilityElementsHidden={!accessible}
      accessibilityLabel={
        accessible ? t('premium.status.accessibility') : undefined
      }
      accessibilityRole={accessible ? 'text' : undefined}
      accessible={accessible}
      importantForAccessibility={accessible ? 'auto' : 'no-hide-descendants'}
      style={[styles.badge, compact && styles.badgeCompact]}
    >
      <PremiumIcon size={compact ? 12 : 18} />
      {!iconOnly ? (
        <Text
          numberOfLines={1}
          style={[styles.text, compact && styles.textCompact]}
        >
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = createThemedStyles(() => ({
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xxs,
    minHeight: 28,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  badgeCompact: {
    gap: 2,
    minHeight: 18,
    paddingHorizontal: spacing.xxs,
    paddingVertical: 1,
  },
  text: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
    lineHeight: 17,
  },
  textCompact: {
    fontSize: 9,
    letterSpacing: 0.4,
    lineHeight: 13,
    textTransform: 'uppercase',
  },
}));
