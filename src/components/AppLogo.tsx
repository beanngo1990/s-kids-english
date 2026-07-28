import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { radius } from '../theme/spacing';
import { shadows } from '../theme/shadows';

const appLogo = require('../assets/images/app-logo.png');

type AppLogoProps = {
  size?: number;
};

export function AppLogo({ size = 128 }: AppLogoProps) {
  return (
    <View
      accessibilityLabel="Sungy logo"
      style={[styles.logo, { height: size, width: size }]}
    >
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
    overflow: 'hidden',
    ...shadows.floating,
  },
});
