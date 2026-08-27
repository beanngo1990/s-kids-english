import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

import { type SKidsIconName } from '../assets/icons/skids';
import { KidPressable } from './KidPressable';
import { SKidsIcon } from './SKidsIcon';
import { createBounceAnimation } from '../engine/animations';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { layout, radius, spacing } from '../theme/spacing';
import { useReducedMotion } from '../theme/motion';
import { useI18n } from '../i18n';

export type KidModeTab = 'map' | 'play';

type KidModeTabsProps = {
  activeTab: KidModeTab;
  onSelectMap: () => void;
  onSelectPlay: () => void;
};

// Android Fabric can assert when native-driven opacity/transform updates overlap
// the React commit that moves the active styling between tabs.
const TAB_ANIMATION_USES_NATIVE_DRIVER = false;

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
  const reducedMotion = useReducedMotion();
  const activeIconScale = useRef(new Animated.Value(1)).current;
  const previousActiveTabRef = useRef(activeTab);
  const activeIconAnimatedStyle = {
    transform: [{ scale: activeIconScale }],
  };

  useEffect(() => {
    if (previousActiveTabRef.current === activeTab) {
      return;
    }
    previousActiveTabRef.current = activeTab;

    if (reducedMotion) {
      activeIconScale.stopAnimation();
      activeIconScale.setValue(1);
      return;
    }

    createBounceAnimation(
      activeIconScale,
      TAB_ANIMATION_USES_NATIVE_DRIVER,
    ).start();
  }, [activeIconScale, activeTab, reducedMotion]);

  useEffect(() => {
    return () => activeIconScale.stopAnimation();
  }, [activeIconScale]);

  return (
    <View
      pointerEvents="box-none"
      style={styles.footer}
      testID="kid-mode-tabs"
    >
      <View style={styles.tabBar}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const onPress = tab.id === 'map' ? onSelectMap : onSelectPlay;

          return (
            <KidPressable
              accessibilityLabel={tab.accessibilityLabel}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              feedback="soft"
              key={tab.id}
              onPress={onPress}
              playSound={!isActive}
              reducedMotion={reducedMotion}
              style={[
                styles.tab,
                isActive && styles.tabActive,
              ]}
              useNativeDriver={TAB_ANIMATION_USES_NATIVE_DRIVER}
            >
              <Animated.View
                style={[
                  styles.iconContainer,
                  isActive && activeIconAnimatedStyle,
                ]}
              >
                {isActive && <View style={styles.iconActiveBg} />}
                <SKidsIcon name={tab.icon} size={28} />
              </Animated.View>
              <Text
                numberOfLines={1}
                style={[styles.label, isActive && styles.labelActive]}
              >
                {tab.label}
              </Text>
            </KidPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = createThemedStyles(() => ({
  footer: {
    bottom: spacing.xs,
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
}));
