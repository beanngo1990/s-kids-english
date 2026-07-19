import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { AppCard } from './AppCard';
import { PremiumIcon } from './PremiumIcon';
import type { MonetizationSnapshot } from '../engine/MonetizationManager';
import { useSavedAppLanguage, useTranslations } from '../i18n';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { getPremiumProductTypeTitle } from '../utils/premiumStatus';

type PremiumStatusCardSnapshot = Pick<
  MonetizationSnapshot,
  'activeProductType' | 'status'
>;

type PremiumStatusCardProps = {
  onPress: () => void;
  snapshot: PremiumStatusCardSnapshot;
};

export function PremiumStatusCard({
  onPress,
  snapshot,
}: PremiumStatusCardProps) {
  useThemeSync();
  const appLanguage = useSavedAppLanguage();
  const t = useTranslations(appLanguage);

  if (snapshot.status !== 'premium') {
    return null;
  }

  const planTitle = getPremiumProductTypeTitle(t, snapshot.activeProductType);

  return (
    <Pressable
      accessibilityHint={t('premium.status.viewDetails')}
      accessibilityLabel={[t('premium.currentTitle'), planTitle].join('. ')}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      <AppCard style={styles.card}>
        <View style={styles.iconFrame}>
          <PremiumIcon size={24} />
        </View>
        <View style={styles.copy}>
          <Text numberOfLines={1} style={styles.title}>
            {t('premium.currentTitle')}
          </Text>
          <Text numberOfLines={1} style={styles.plan}>
            {planTitle}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </AppCard>
    </Pressable>
  );
}

const styles = createThemedStyles(() => ({
  card: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 68,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chevron: {
    color: colors.primaryDark,
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 34,
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
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  plan: {
    color: colors.textSoft,
    ...typography.caption,
  },
  pressable: {
    borderRadius: radius.xl,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ translateY: 1 }, { scale: 0.995 }],
  },
  title: {
    color: colors.text,
    ...typography.subtitle,
  },
}));
