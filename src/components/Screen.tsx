import React, { ReactNode } from 'react';
import { ScrollView, View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { useResponsiveLayout } from '../theme/responsive';

type ScreenProps = {
  children: ReactNode;
  fixedHeader?: ReactNode;
  scroll?: boolean;
  withBottomSpace?: boolean;
  safeAreaEdges?: ('top' | 'right' | 'bottom' | 'left')[];
  keyboardAvoiding?: boolean;
  keyboardOffset?: number;
};

export function Screen({
  children,
  fixedHeader,
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
    paddingHorizontal: responsiveLayout.screenPadding,
    paddingBottom: responsiveLayout.screenPadding + (withBottomSpace ? 76 : 0),
    paddingTop: fixedHeader ? 0 : responsiveLayout.screenPadding,
    width: '100%' as const,
  };
  const fixedHeaderStyle = {
    alignSelf: 'center' as const,
    maxWidth: responsiveLayout.contentMaxWidth,
    paddingHorizontal: responsiveLayout.screenPadding,
    paddingTop: responsiveLayout.screenPadding / 2,
    width: '100%' as const,
  };

  let content = scroll ? (
    <>
      {fixedHeader ? (
        <View style={[styles.fixedHeader, fixedHeaderStyle]}>
          {fixedHeader}
        </View>
      ) : null}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.scrollContent, scrollContentStyle]}
        keyboardShouldPersistTaps="handled"
        style={styles.content}
      >
        {children}
      </ScrollView>
    </>
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
  fixedHeader: {
    backgroundColor: colors.background,
    zIndex: 10,
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
}));
