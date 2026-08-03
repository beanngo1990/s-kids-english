import { Platform } from 'react-native';
import { colors } from './colors';

const androidShadowColor = '#1E293B';

function createSoftShadow() {
  return {
    elevation: 3,
    shadowColor: Platform.OS === 'android' ? androidShadowColor : colors.shadow,
    shadowOffset: {
      height: 8,
      width: 0,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  };
}

function createFloatingShadow() {
  return {
    elevation: 6,
    shadowColor: Platform.OS === 'android' ? androidShadowColor : colors.shadow,
    shadowOffset: {
      height: 12,
      width: 0,
    },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  };
}

function createWarmShadow() {
  return {
    elevation: 4,
    shadowColor: Platform.OS === 'android' ? colors.warmShadow : colors.warmShadow,
    shadowOffset: {
      height: 8,
      width: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 14,
  };
}

export const shadows = {
  get soft() {
    return createSoftShadow();
  },
  get floating() {
    return createFloatingShadow();
  },
  get warm() {
    return createWarmShadow();
  },
} as const;

