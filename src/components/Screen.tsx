import React, { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { useResponsiveLayout } from '../theme/responsive';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  withBottomSpace?: boolean;
  safeAreaEdges?: ('top' | 'right' | 'bottom' | 'left')[];
};

export function Screen({
  children,
  scroll = false,
  withBottomSpace = true,
  safeAreaEdges = ['bottom', 'left', 'right'],
}: ScreenProps) {
  useThemeSync();
  const responsiveLayout = useResponsiveLayout();
  const scrollContentStyle = {
    alignSelf: 'center' as const,
    maxWidth: responsiveLayout.contentMaxWidth,
    padding: responsiveLayout.screenPadding,
    paddingBottom: responsiveLayout.screenPadding + (withBottomSpace ? 76 : 0),
    width: '100%' as const,
  };

  if (scroll) {
    return (
      <SafeAreaView edges={safeAreaEdges} style={styles.safeArea}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={[styles.scrollContent, scrollContentStyle]}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={safeAreaEdges} style={styles.safeArea}>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = createThemedStyles(() => ({
  content: {
    flex: 1,
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
}));
