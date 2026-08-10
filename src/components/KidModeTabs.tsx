import React, { useContext } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { type SKidsIconName } from '../assets/icons/skids';
import { SKidsIcon } from './SKidsIcon';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { layout, radius, spacing } from '../theme/spacing';
import { useI18n } from '../i18n';

export type KidModeTab = 'map' | 'play';

type KidModeTabsProps = {
  activeTab: KidModeTab;
  onSelectMap: () => void;
  onSelectPlay: () => void;
};

// Moved into component to use t()
const getTabs = (t: (key: any) => string): Array<{
  accessibilityLabel: string;
  icon: SKidsIconName;
  id: KidModeTab;
  label: string;
}> => [
  {
    accessibilityLabel: t('kidModeTabs.mapAccessibility'),
    icon: 'map',
    id: 'map',
    label: t('kidModeTabs.map'),
  },
  {
    accessibilityLabel: t('kidModeTabs.playAccessibility'),
    icon: 'playZone',
    id: 'play',
    label: t('kidModeTabs.play'),
  },
];

export function KidModeTabs({
  activeTab,
  onSelectMap,
  onSelectPlay,
}: KidModeTabsProps) {
  useThemeSync();
  const t = useI18n();
  const tabs = getTabs(t);
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
              <View style={styles.iconContainer}>
                {isActive && <View style={styles.iconActiveBg} />}
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
  iconActiveBg: {
    backgroundColor: colors.secondary,
    borderColor: colors.outlineStrong,
    borderRadius: 22,
    borderWidth: 2,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  iconContainer: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
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
