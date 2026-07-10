import React, { useContext } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { type SKidsIconName } from '../assets/icons/skids';
import { SKidsIcon } from './SKidsIcon';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { layout, radius, spacing } from '../theme/spacing';

export type KidModeTab = 'map' | 'play';

type KidModeTabsProps = {
  activeTab: KidModeTab;
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
  onSelectMap,
  onSelectPlay,
}: KidModeTabsProps) {
  useThemeSync();
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
                pressed && styles.tabPressed,
              ]}
            >
              <View
                style={[
                  styles.iconBubble,
                  isActive && styles.iconActive,
                ]}
              >
                <SKidsIcon name={tab.icon} size={28} />
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

const styles = createThemedStyles(() => ({
  footer: {
    left: layout.screenPadding,
    position: 'absolute',
    right: layout.screenPadding,
    zIndex: 30,
  },
  iconActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.white,
    borderWidth: 2,
  },
  iconBubble: {
    alignItems: 'center',
    borderRadius: 22, // Fix Android bug: using exact half of width/height instead of 999 for perfect circle
    height: 44,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 44,
  },
  label: {
    color: colors.textSoft,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 20,
    opacity: 0.7,
  },
  labelActive: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    opacity: 1,
    paddingRight: spacing.xs,
  },
  tab: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 64,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tabActive: {
    backgroundColor: colors.surfaceBlue,
  },
  tabBar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
    shadowColor: '#000',
    shadowOffset: {
      height: -6,
      width: 0,
    },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  tabPressed: {
    opacity: 0.92,
    transform: [{ translateY: 1 }, { scale: 0.99 }],
  },
}));
