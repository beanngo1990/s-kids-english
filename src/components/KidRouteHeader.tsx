import React from 'react';
import {
  Pressable,
  Text,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SKidsIcon } from './SKidsIcon';
import { useI18n } from '../i18n';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { useResponsiveLayout } from '../theme/responsive';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export type KidRouteHeaderAction = 'back' | 'close';

type KidHeaderActionButtonProps = {
  action: KidRouteHeaderAction;
  onPress: () => void;
};

export function KidHeaderActionButton({
  action,
  onPress,
}: KidHeaderActionButtonProps) {
  useThemeSync();
  const t = useI18n();

  return (
    <Pressable
      accessibilityLabel={
        action === 'back' ? t('common.back') : t('common.close')
      }
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        action === 'back' && styles.backButton,
        pressed && styles.actionButtonPressed,
      ]}
    >
      {action === 'back' ? (
        <SKidsIcon name="next" size={44} style={styles.backIcon} />
      ) : (
        <View style={styles.closeIcon}>
          <View style={styles.closeStroke} />
          <View style={[styles.closeStroke, styles.closeStrokeReverse]} />
        </View>
      )}
    </Pressable>
  );
}

type KidRouteHeaderProps = {
  action: KidRouteHeaderAction;
  onAction: () => void;
  style?: StyleProp<ViewStyle>;
  title: string;
};

export function KidRouteHeader({
  action,
  onAction,
  style,
  title,
}: KidRouteHeaderProps) {
  useThemeSync();

  return (
    <View style={[styles.routeHeader, style]}>
      <KidHeaderActionButton action={action} onPress={onAction} />
      <View accessibilityRole="header" style={styles.titlePill}>
        <Text
          adjustsFontSizeToFit
          maxFontSizeMultiplier={1.25}
          minimumFontScale={0.78}
          numberOfLines={1}
          style={styles.title}
        >
          {title}
        </Text>
      </View>
    </View>
  );
}

export function KidSafeRouteHeader(props: KidRouteHeaderProps) {
  useThemeSync();
  const responsiveLayout = useResponsiveLayout();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View
        style={[
          styles.safeAreaContent,
          {
            maxWidth: responsiveLayout.contentMaxWidth,
            paddingHorizontal: responsiveLayout.screenPadding,
          },
        ]}
      >
        <KidRouteHeader {...props} />
      </View>
    </SafeAreaView>
  );
}

const styles = createThemedStyles(() => ({
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  actionButtonPressed: {
    opacity: 0.86,
    transform: [{ translateY: 1 }, { scale: 0.98 }],
  },
  backButton: {
    backgroundColor: colors.transparent,
    borderWidth: 0,
  },
  backIcon: {
    transform: [{ rotate: '180deg' }],
  },
  closeIcon: {
    alignItems: 'center',
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  closeStroke: {
    backgroundColor: colors.accentDark,
    borderRadius: radius.pill,
    height: 4,
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
    width: 20,
  },
  closeStrokeReverse: {
    transform: [{ rotate: '-45deg' }],
  },
  routeHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  safeArea: {
    backgroundColor: colors.background,
  },
  safeAreaContent: {
    alignSelf: 'center',
    paddingBottom: spacing.xs,
    paddingTop: spacing.xs,
    width: '100%',
  },
  title: {
    color: colors.primaryDark,
    ...typography.subtitle,
    fontSize: 16,
    fontWeight: '800',
  },
  titlePill: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderWarm,
    borderRadius: radius.pill,
    borderWidth: 2,
    flex: 1,
    height: 48,
    justifyContent: 'center',
    minWidth: 0,
    paddingHorizontal: spacing.md,
  },
}));
