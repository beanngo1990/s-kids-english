import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { AppCard } from './AppCard';
import { PremiumIcon } from './PremiumIcon';
import type { MonetizationSnapshot } from '../engine/MonetizationManager';
import { useI18n } from '../i18n';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type PremiumUpgradeCardSnapshot = Pick<MonetizationSnapshot, 'status'>;

type PremiumUpgradeCardProps = {
  onPress: () => void;
  snapshot: PremiumUpgradeCardSnapshot;
};

export function PremiumUpgradeCard({
  onPress,
  snapshot,
}: PremiumUpgradeCardProps) {
  useThemeSync();
  const t = useI18n();

  if (snapshot.status === 'premium' || snapshot.status === 'initializing') {
    return null;
  }

  const benefits = [
    t('premium.teaser.benefit.lessons'),
    t('premium.teaser.benefit.review'),
    t('premium.teaser.benefit.themes'),
  ];

  return (
    <Pressable
      accessibilityHint={t('premium.status.viewDetails')}
      accessibilityLabel={[
        t('premium.teaser.title'),
        t('premium.teaser.subtitle'),
        t('premium.teaser.action'),
      ].join('. ')}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      <AppCard style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.iconFrame}>
            <PremiumIcon size={34} />
          </View>
          <View style={styles.copy}>
            <Text style={styles.badge}>{t('premium.teaser.badge')}</Text>
            <Text numberOfLines={2} style={styles.title}>
              {t('premium.teaser.title')}
            </Text>
          </View>
        </View>

        <Text numberOfLines={3} style={styles.subtitle}>
          {t('premium.teaser.subtitle')}
        </Text>

        <View style={styles.benefitGrid}>
          {benefits.map(benefit => (
            <View key={benefit} style={styles.benefitPill}>
              <Text style={styles.benefitCheck}>✓</Text>
              <Text numberOfLines={1} style={styles.benefitText}>
                {benefit}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.actionRow}>
          <Text style={styles.actionText}>{t('premium.teaser.action')}</Text>
          <Text style={styles.actionArrow}>→</Text>
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = createThemedStyles(() => ({
  actionArrow: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 28,
  },
  actionRow: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  actionText: {
    color: colors.text,
    ...typography.body,
  },
  badge: {
    alignSelf: 'flex-start',
    color: colors.primaryDark,
    ...typography.caption,
  },
  benefitCheck: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 16,
  },
  benefitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  benefitPill: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderWarm,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xxs,
    maxWidth: '100%',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  benefitText: {
    color: colors.textSoft,
    ...typography.caption,
  },
  card: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  iconFrame: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 2,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  pressable: {
    borderRadius: radius.xl,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ translateY: 1 }, { scale: 0.996 }],
  },
  subtitle: {
    color: colors.textSoft,
    ...typography.caption,
  },
  title: {
    color: colors.text,
    ...typography.subtitle,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
}));
