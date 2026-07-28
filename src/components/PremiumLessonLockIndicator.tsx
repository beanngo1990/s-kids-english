import React from 'react';
import { Text, View } from 'react-native';

import { PremiumIcon } from './PremiumIcon';
import { useI18n } from '../i18n';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type PremiumLessonLockIndicatorProps = {
  compact?: boolean;
};

export function PremiumLessonLockIndicator({
  compact = false,
}: PremiumLessonLockIndicatorProps) {
  useThemeSync();
  const t = useI18n();

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.container, compact && styles.containerCompact]}
    >
      <PremiumIcon size={compact ? 14 : 16} />
      <Text numberOfLines={1} style={styles.label}>
        {compact
          ? t('premium.lessonRow.compactAction')
          : t('premium.lessonRow.action')}
      </Text>
      <Text style={styles.arrow}>→</Text>
    </View>
  );
}

const styles = createThemedStyles(() => ({
  arrow: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 17,
  },
  container: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xxs,
    marginTop: spacing.xs,
    minHeight: 30,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  containerCompact: {
    paddingHorizontal: spacing.xs,
  },
  label: {
    color: colors.text,
    ...typography.caption,
    fontWeight: '800',
  },
}));
