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
  completed: number;
  isComplete: boolean;
  onOpenHub?: () => void;
  onOpenParent: () => void;
  total: number;
};

export function KidModeHeader({
  completed,
  isComplete,
  onOpenHub,
  onOpenParent,
  total,
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
          <TopProgressStatus
            completed={completed}
            isComplete={isComplete}
            total={total}
          />
          <KidIconButton
            accessibilityLabel="Góc phụ huynh"
            icon="parentLock"
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
  completed: number;
  isComplete: boolean;
  total: number;
};

function TopProgressStatus({
  completed,
  isComplete,
  total,
}: TopProgressStatusProps) {
  const safeTotal = Math.max(total, 0);
  const safeCompleted = Math.min(Math.max(completed, 0), safeTotal);
  const progressPercent =
    safeTotal > 0 ? Math.round((safeCompleted / safeTotal) * 100) : 0;

  return (
    <View
      accessibilityLabel={`Bé có ${safeCompleted} sao trong ${safeTotal} trạm`}
      accessibilityRole="progressbar"
      style={styles.topStatusCard}
    >
      <View style={styles.topStatusRow}>
        <SKidsIcon name="star" size={22} />
        <Text style={styles.topStatusCount}>x {safeCompleted}</Text>
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
        {isComplete ? 'Đủ sao!' : `${safeCompleted}/${safeTotal}`}
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
    fontSize: 15,
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
