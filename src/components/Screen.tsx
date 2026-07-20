import React, { ReactNode } from 'react';
import { ScrollView, View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { useResponsiveLayout } from '../theme/responsive';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  withBottomSpace?: boolean;
  safeAreaEdges?: ('top' | 'right' | 'bottom' | 'left')[];
  keyboardAvoiding?: boolean;
  keyboardOffset?: number;
};

export function Screen({
  children,
  scroll = false,
  withBottomSpace = true,
  safeAreaEdges = ['bottom', 'left', 'right'],
  keyboardAvoiding = false,
  keyboardOffset = 0,
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

  let content = scroll ? (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[styles.scrollContent, scrollContentStyle]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.content}>{children}</View>
  );

  if (keyboardAvoiding) {
    content = (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={keyboardOffset}
        style={styles.content}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  return (
    <SafeAreaView edges={safeAreaEdges} style={styles.safeArea}>
      {content}
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
