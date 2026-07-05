import React, { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { type SKidsIconName } from '../assets/icons/skids';
import { SKidsIcon } from './SKidsIcon';
import { colors } from '../theme/colors';
import { layout, radius, spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';

export type KidModeTab = 'map' | 'play';

type KidModeTabsProps = {
  activeTab: KidModeTab;
  hasPendingPlay?: boolean;
  onSelectMap: () => void;
  onSelectPlay: () => void;
};

const tabs: Array<{
  accessibilityLabel: string;
  icon: SKidsIconName;
  id: KidModeTab;
  label: string;
}> = [
  {
    accessibilityLabel: 'Mở bản đồ bài học',
    icon: 'map',
    id: 'map',
    label: 'Bản đồ',
  },
  {
    accessibilityLabel: 'Mở khu chơi',
    icon: 'playZone',
    id: 'play',
    label: 'Chơi',
  },
];

export function KidModeTabs({
  activeTab,
  hasPendingPlay = false,
  onSelectMap,
  onSelectPlay,
}: KidModeTabsProps) {
  const insets = useContext(SafeAreaInsetsContext) ?? {
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
  };

  return (
    <View
      pointerEvents="box-none"
      style={[styles.footer, { bottom: spacing.xs - insets.bottom }]}
    >
      <View style={styles.tabBar}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const hasPending = hasPendingPlay && tab.id === 'play';
          const onPress = tab.id === 'map' ? onSelectMap : onSelectPlay;

          return (
            <Pressable
              accessibilityLabel={tab.accessibilityLabel}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              key={tab.id}
              onPress={onPress}
              style={({ pressed }) => [
                styles.tab,
                isActive && styles.tabActive,
                hasPending && !isActive && styles.tabPending,
                pressed && styles.tabPressed,
              ]}
            >
              <View
                style={[
                  styles.iconBubble,
                  isActive && styles.iconActive,
                  hasPending && !isActive && styles.iconPending,
                ]}
              >
                <SKidsIcon name={tab.icon} size={28} />
                {hasPending ? <View style={styles.pendingDot} /> : null}
              </View>
              <Text
                numberOfLines={1}
                style={[styles.label, isActive && styles.labelActive]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    left: layout.screenPadding,
    position: 'absolute',
    right: layout.screenPadding,
    zIndex: 30,
  },
  iconActive: {
    backgroundColor: colors.white,
    borderColor: colors.secondary,
  },
  iconBubble: {
    alignItems: 'center',
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  iconPending: {
    borderColor: colors.secondary,
  },
  label: {
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 18,
  },
  labelActive: {
    color: colors.text,
  },
  tab: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 62,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tabActive: {
    backgroundColor: colors.secondarySoft,
  },
  tabBar: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 3,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
    ...shadows.floating,
  },
  tabPending: {
    backgroundColor: colors.surfaceSoft,
  },
  tabPressed: {
    opacity: 0.92,
    transform: [{ translateY: 1 }, { scale: 0.99 }],
  },
  pendingDot: {
    backgroundColor: colors.accent,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 13,
    position: 'absolute',
    right: -1,
    top: -1,
    width: 13,
  },
});
