import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';
import { typography } from '../theme/typography';

export function AppLogo() {
  return (
    <View accessibilityLabel="S-Kids English logo" style={styles.logo}>
      <Text style={styles.mark}>S</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 3,
    elevation: 4,
    height: 116,
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: {
      height: 8,
      width: 0,
    },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    width: 116,
  },
  mark: {
    color: colors.white,
    ...typography.hero,
    fontSize: 58,
    lineHeight: 64,
  },
});
