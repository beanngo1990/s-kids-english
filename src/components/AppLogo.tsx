import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';

const appLogo = require('../assets/images/app-logo.png');

export function AppLogo() {
  return (
    <View accessibilityLabel="S-Kids English logo" style={styles.logo}>
      <Image source={appLogo} style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    height: '100%',
    width: '100%',
  },
  logo: {
    borderRadius: radius.xl,
    elevation: 4,
    height: 128,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: {
      height: 8,
      width: 0,
    },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    width: 128,
  },
});
