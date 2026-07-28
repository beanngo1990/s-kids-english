import React from 'react';
import {
  Image,
  type ImageStyle,
  StyleSheet,
  type StyleProp,
} from 'react-native';

import {
  appUiIcons,
  type AppUiIconName,
} from '../assets/icons/app-ui';

type AppUiIconProps = {
  name: AppUiIconName;
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export function AppUiIcon({ name, size = 32, style }: AppUiIconProps) {
  return (
    <Image
      accessibilityIgnoresInvertColors
      resizeMode="contain"
      source={appUiIcons[name]}
      style={[styles.icon, { height: size, width: size }, style]}
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    flexShrink: 0,
  },
});
