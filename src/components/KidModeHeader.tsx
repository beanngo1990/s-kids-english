import React from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppLogo } from './AppLogo';
import { KidIconButton } from './KidIconButton';
import { PremiumStatusBadge } from './PremiumStatusBadge';
import { SKidsIcon } from './SKidsIcon';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { layout, radius, spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { useI18n } from '../i18n';

type KidModeHeaderProps = {
  isPremium?: boolean;
  totalXP: number;
  onOpenHub?: () => void;
  onOpenParent: () => void;
  onOpenThemeLibrary?: () => void;
};

export function KidModeHeader({
  isPremium = false,
  totalXP,
  onOpenHub,
  onOpenParent,
  onOpenThemeLibrary,
}: KidModeHeaderProps) {
  useThemeSync();
  const t = useI18n();
  const { fontScale, width } = useWindowDimensions();
  const useIconOnlyPremiumBadge = width < 360 || fontScale > 1.3;
  const useCompactTopProgress =
    Boolean(onOpenThemeLibrary) && (width < 390 || fontScale > 1.2);
  const brandContent = (
    <>
      <AppLogo size={40} />
      <View style={styles.brandCopy}>
        <Text style={styles.title}>Sungy</Text>
        {isPremium ? (
          <PremiumStatusBadge
            accessible={!onOpenHub}
            compact
            iconOnly={useIconOnlyPremiumBadge}
          />
        ) : null}
      </View>
    </>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.header}>
      <View style={styles.topBar}>
        {onOpenHub ? (
          <Pressable
            accessibilityLabel={
              isPremium
                ? `${t('header.openHub')}. ${t('premium.status.accessibility')}`
                : t('header.openHub')
            }
            accessibilityRole="button"
            hitSlop={8}
            onPress={onOpenHub}
            style={({ pressed }) => [
              styles.brandCluster,
              pressed && styles.brandClusterPressed,
            ]}
          >
            {brandContent}
          </Pressable>
        ) : (
          <View style={styles.brandCluster}>{brandContent}</View>
        )}
        <View style={styles.topActions}>
          <TopProgressStatus
            compact={useCompactTopProgress}
            totalXP={totalXP}
          />
          {onOpenThemeLibrary ? (
            <KidIconButton
              accessibilityLabel={t('header.themeLibrary')}
              icon="map"
              onPress={onOpenThemeLibrary}
              size="md"
              style={styles.themeLibrary}
              tone="secondary"
            />
          ) : null}
          <KidIconButton
            accessibilityLabel={t('header.parentGate')}
            icon="parentGate"
            onPress={onOpenParent}
            size="md"
            style={styles.parentGate}
            tone="quiet"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

import { getLevelProgress } from '../engine/ProgressManager';

type TopProgressStatusProps = {
  compact?: boolean;
  totalXP: number;
};

function TopProgressStatus({
  compact = false,
  totalXP,
}: TopProgressStatusProps) {
  const t = useI18n();
  const { level, xpInLevel, xpNeeded, progressPercent } =
    getLevelProgress(totalXP);

  return (
    <View
      accessibilityLabel={t('header.levelAccessibility', {
        level: String(level),
        xpInLevel: String(xpInLevel),
        xpNeeded: String(xpNeeded - xpInLevel),
      })}
      accessibilityRole="progressbar"
      style={[styles.topStatusCard, compact && styles.topStatusCardCompact]}
    >
      <View style={styles.topStatusRow}>
        <SKidsIcon name="acorn" size={18} />
        <Text
          numberOfLines={1}
          style={[
            styles.topStatusCount,
            compact && styles.topStatusCountCompact,
          ]}
        >
          {t('header.level', { level: String(level) })}
        </Text>
      </View>
      {compact ? null : (
        <>
          <View style={styles.topStatusTrack}>
            <View
              style={[
                styles.topStatusFill,
                {
                  width: `${progressPercent}%`,
                },
              ]}
            />
          </View>
          <Text numberOfLines={1} style={styles.topStatusCaption}>
            {xpInLevel}/{xpNeeded}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = createThemedStyles(() => ({
  brandCluster: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
  },
  brandClusterPressed: {
    opacity: 0.9,
    transform: [{ translateY: 1 }, { scale: 0.99 }],
  },
  brandCopy: {
    alignItems: 'flex-start',
    flexShrink: 1,
    gap: 1,
    minWidth: 0,
  },
  header: {
    backgroundColor: colors.background,
    borderBottomColor: 'rgba(215, 238, 248, 0.7)',
    borderBottomWidth: 1,
    paddingBottom: spacing.xs,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xs,
    zIndex: 20,
  },
  parentGate: {
    backgroundColor: colors.surface,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 54,
    minHeight: 54,
    minWidth: 54,
    padding: 0,
    width: 54,
    ...shadows.soft,
  },
  themeLibrary: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 54,
    minHeight: 54,
    minWidth: 54,
    padding: 0,
    width: 54,
    ...shadows.soft,
  },
  title: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 27,
  },
  topActions: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
    borderColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: 4,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    minHeight: 64,
  },
  topStatusCaption: {
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 12,
    textAlign: 'center',
  },
  topStatusCard: {
    alignItems: 'stretch',
    backgroundColor: colors.surface,
    borderColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 2,
    height: 54,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    width: 106,
    ...shadows.soft,
  },
  topStatusCardCompact: {
    alignItems: 'center',
    paddingHorizontal: 4,
    width: 62,
  },
  topStatusCount: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 18,
  },
  topStatusCountCompact: {
    fontSize: 12,
    lineHeight: 15,
  },

  topStatusFill: {
    backgroundColor: colors.secondary,
    borderRadius: radius.pill,
    height: '100%',
  },
  topStatusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xxs,
    justifyContent: 'center',
  },
  topStatusTrack: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    height: 6,
    overflow: 'hidden',
  },
}));
