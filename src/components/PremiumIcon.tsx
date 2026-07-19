import React from 'react';
import {
  Image,
  type ImageStyle,
  StyleSheet,
  type StyleProp,
} from 'react-native';

type PremiumIconProps = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export function PremiumIcon({ size = 24, style }: PremiumIconProps) {
  return (
    <Image
      accessibilityIgnoresInvertColors
      resizeMode="contain"
      source={require('../assets/icons/premium/premium-crown.png')}
      style={[styles.icon, { height: size, width: size }, style]}
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    flexShrink: 0,
  },
});
