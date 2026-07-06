import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppLogo } from './AppLogo';
import { KidIconButton } from './KidIconButton';
import { SKidsIcon } from './SKidsIcon';
import { colors } from '../theme/colors';
import { layout, radius, spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';

type KidModeHeaderProps = {
  totalXP: number;
  onOpenHub?: () => void;
  onOpenParent: () => void;
};

export function KidModeHeader({
  totalXP,
  onOpenHub,
  onOpenParent,
}: KidModeHeaderProps) {
  const brandContent = (
    <>
      <AppLogo size={40} />
      <Text style={styles.title}>S-Kids</Text>
    </>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.header}>
      <View style={styles.topBar}>
        {onOpenHub ? (
          <Pressable
            accessibilityLabel="Mở S-Kids Hub"
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
          <TopProgressStatus totalXP={totalXP} />
          <KidIconButton
            accessibilityLabel="Góc phụ huynh"
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
  totalXP: number;
};

function TopProgressStatus({
  totalXP,
}: TopProgressStatusProps) {
  const { level, xpInLevel, xpNeeded, progressPercent } = getLevelProgress(totalXP);

  return (
    <View
      accessibilityLabel={`Bé đang ở cấp ${level}, có ${xpInLevel} hạt dẻ, cần thêm ${xpNeeded - xpInLevel} hạt dẻ để lên cấp`}
      accessibilityRole="progressbar"
      style={styles.topStatusCard}
    >
      <View style={styles.topStatusRow}>
        <SKidsIcon name="acorn" size={18} />
        <Text style={styles.topStatusCount}>Cấp {level}</Text>
      </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: colors.white,
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
    backgroundColor: colors.white,
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
  topStatusCount: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 18,
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
});
