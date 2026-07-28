import { Animated, Easing, type ViewStyle } from 'react-native';

import { colors } from '../theme/colors';

export type ObjectAnimationEffect = 'none' | 'bounce' | 'shake' | 'sparkle';

export const dimOpacity = 0.48;

function createGlowStyle(): ViewStyle {
  return {
    borderColor: colors.secondary,
    elevation: 5,
    shadowColor: colors.secondary,
    shadowOpacity: 0.36,
    shadowRadius: 14,
  };
}

export const glowStyle = new Proxy({} as ViewStyle, {
  get(_target, property: keyof ViewStyle) {
    return createGlowStyle()[property];
  },
  getOwnPropertyDescriptor(_target, property: keyof ViewStyle) {
    const style = createGlowStyle();

    if (!(property in style)) {
      return undefined;
    }

    return {
      configurable: true,
      enumerable: true,
      value: style[property],
    };
  },
  ownKeys() {
    return Reflect.ownKeys(createGlowStyle());
  },
});

export function createBounceAnimation(scale: Animated.Value) {
  scale.stopAnimation();
  scale.setValue(1);

  return Animated.sequence([
    Animated.spring(scale, {
      friction: 4,
      tension: 140,
      toValue: 1.12,
      useNativeDriver: true,
    }),
    Animated.spring(scale, {
      friction: 5,
      tension: 110,
      toValue: 1,
      useNativeDriver: true,
    }),
  ]);
}

export function createShakeAnimation(translateX: Animated.Value) {
  translateX.stopAnimation();
  translateX.setValue(0);

  return Animated.sequence([
    Animated.timing(translateX, {
      duration: 45,
      easing: Easing.out(Easing.quad),
      toValue: -8,
      useNativeDriver: true,
    }),
    Animated.timing(translateX, {
      duration: 45,
      easing: Easing.out(Easing.quad),
      toValue: 8,
      useNativeDriver: true,
    }),
    Animated.timing(translateX, {
      duration: 45,
      easing: Easing.out(Easing.quad),
      toValue: -5,
      useNativeDriver: true,
    }),
    Animated.timing(translateX, {
      duration: 45,
      easing: Easing.out(Easing.quad),
      toValue: 5,
      useNativeDriver: true,
    }),
    Animated.timing(translateX, {
      duration: 55,
      easing: Easing.out(Easing.quad),
      toValue: 0,
      useNativeDriver: true,
    }),
  ]);
}

export function shouldBounce(effect: ObjectAnimationEffect) {
  return effect === 'bounce' || effect === 'sparkle';
}
