import { colors } from './colors';

export const shadows = {
  soft: {
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: {
      height: 8,
      width: 0,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  floating: {
    elevation: 6,
    shadowColor: colors.shadow,
    shadowOffset: {
      height: 12,
      width: 0,
    },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },
  warm: {
    elevation: 4,
    shadowColor: colors.warmShadow,
    shadowOffset: {
      height: 8,
      width: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 14,
  },
} as const;
