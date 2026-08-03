import React from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppLogo } from './AppLogo';
import { KidIconButton } from './KidIconButton';
import { PremiumStatusBadge } from './PremiumStatusBadge';
import { SKidsIcon } from './SKidsIcon';
import { getLevelProgress } from '../engine/ProgressManager';
import { useI18n } from '../i18n';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { layout, radius, spacing } from '../theme/spacing';

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
      <AppLogo size={38} />
      <View style={styles.brandCopy}>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          numberOfLines={1}
          style={styles.title}
        >
          Sungy
        </Text>
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

  const clampedPercent = Math.min(100, Math.max(0, progressPercent));

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
      <View style={styles.topStatusContent}>
        <View style={styles.topStatusIconBox}>
          <SKidsIcon name="acorn" size={compact ? 18 : 22} />
        </View>
        <View style={styles.topStatusMeta}>
          <Text numberOfLines={1} style={styles.topStatusLevelText}>
            {t('header.level', { level: String(level) })}
          </Text>
          {!compact ? (
            <View style={styles.topStatusTrack}>
              <View
                style={[
                  styles.topStatusFill,
                  {
                    width: `${clampedPercent}%`,
                  },
                ]}
              />
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = createThemedStyles(() => ({
  brandCluster: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    minWidth: 0,
  },
  brandClusterPressed: {
    opacity: 0.9,
    transform: [{ translateY: 1 }, { scale: 0.99 }],
  },
  brandCopy: {
    alignItems: 'flex-start',
    flex: 1,
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
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 46,
    justifyContent: 'center',
    minHeight: 46,
    minWidth: 46,
    overflow: 'hidden',
    padding: 0,
    width: 46,
    ...shadows.soft,
  },
  themeLibrary: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 46,
    justifyContent: 'center',
    minHeight: 46,
    minWidth: 46,
    overflow: 'hidden',
    padding: 0,
    width: 46,
    ...shadows.soft,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  topActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'space-between',
    minHeight: 52,
  },
  topStatusCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderWarm,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 46,
    justifyContent: 'center',
    minWidth: 104,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    ...shadows.soft,
  },
  topStatusCardCompact: {
    alignItems: 'center',
    minWidth: 64,
    paddingHorizontal: 8,
  },
  topStatusContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  topStatusFill: {
    backgroundColor: colors.secondary,
    borderRadius: radius.pill,
    height: '100%',
  },
  topStatusIconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topStatusLevelText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 15,
  },
  topStatusMeta: {
    flex: 1,
    gap: 2,
    justifyContent: 'center',
  },
  topStatusTrack: {
    backgroundColor: colors.backgroundCool,
    borderRadius: radius.pill,
    height: 6,
    overflow: 'hidden',
    width: '100%',
  },
}));

