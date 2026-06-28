import React from 'react';
import {
  Image,
  type ImageStyle,
  StyleSheet,
  type StyleProp,
} from 'react-native';

import {
  skidsIcons,
  type SKidsIconName,
} from '../assets/icons/skids';

type SKidsIconProps = {
  name: SKidsIconName;
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export function SKidsIcon({ name, size = 64, style }: SKidsIconProps) {
  return (
    <Image
      accessibilityIgnoresInvertColors
      resizeMode="contain"
      source={skidsIcons[name]}
      style={[styles.icon, { height: size, width: size }, style]}
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    flexShrink: 0,
  },
});
