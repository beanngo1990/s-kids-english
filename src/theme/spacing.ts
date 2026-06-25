export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 56,
} as const;

export const radius = {
  sm: 12,
  md: 20,
  lg: 28,
  xl: 36,
  pill: 999,
} as const;

export const touchTarget = {
  minimum: 56,
  large: 64,
} as const;

export const layout = {
  screenPadding: spacing.lg,
  cardPadding: spacing.lg,
} as const;
