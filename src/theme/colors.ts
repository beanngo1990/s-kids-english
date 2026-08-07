import { useSyncExternalStore } from 'react';
import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

export const lightColors = {
  background: '#EAF8FF',
  backgroundCool: '#DDF5FF',
  backgroundWarm: '#FFF8EC',
  surface: '#FFFFFF',
  surfaceSoft: '#FFF4D8',
  surfaceBlue: '#F2FBFF',
  primary: '#28BFB2',
  primaryDark: '#117B78',
  primarySoft: '#CFF7F1',
  focusOutline: '#117B78',
  secondary: '#FFD34D',
  secondaryDark: '#C88712',
  secondarySoft: '#FFF2B8',
  accent: '#FF7B5F',
  accentDark: '#D94B36',
  accentSoft: '#FFE1D8',
  alert: '#EF4444',
  lavender: '#DCD7FF',
  mint: '#BFF3D4',
  green: '#74D889',
  sky: '#AEE7FF',
  skyDeep: '#4DB7F2',
  cream: '#FFF8EC',
  border: '#D7EEF8',
  borderWarm: '#F3DDA8',
  shadow: '#5CA6C5',
  warmShadow: '#D7A03F',
  text: '#334155',
  textSoft: '#64748B',
  muted: '#94A3B8',
  white: '#FFFFFF',
  transparent: 'transparent',
} as const;

type ColorTokenMap = typeof lightColors;
export type ColorToken = keyof ColorTokenMap;
export type AppColors = {
  [Token in ColorToken]: string;
};
export type AppColorScheme = 'light' | 'dark';

export const darkColors = {
  background: '#0F172A',
  backgroundCool: '#102033',
  backgroundWarm: '#211B2E',
  surface: '#172033',
  surfaceSoft: '#24314A',
  surfaceBlue: '#132B3F',
  primary: '#35D1C6',
  primaryDark: '#A7F3EE',
  primarySoft: '#134E4A',
  focusOutline: '#117B78',
  secondary: '#FACC15',
  secondaryDark: '#FDE68A',
  secondarySoft: '#4A3D12',
  accent: '#FF8A73',
  accentDark: '#FDA4AF',
  accentSoft: '#4B1D1D',
  alert: '#F87171',
  lavender: '#6D5DD3',
  mint: '#2DD4BF',
  green: '#22C55E',
  sky: '#38BDF8',
  skyDeep: '#60A5FA',
  cream: '#241F35',
  border: '#31445A',
  borderWarm: '#665B35',
  shadow: '#020617',
  warmShadow: '#4A2A00',
  text: '#F8FAFC',
  textSoft: '#CBD5E1',
  muted: '#94A3B8',
  white: '#FFFFFF',
  transparent: 'transparent',
} as const satisfies AppColors;

type ThemeStyle = ViewStyle | TextStyle | ImageStyle;
type ThemeStyleMap = Record<string, ThemeStyle>;

const colorSchemes = {
  dark: darkColors,
  light: lightColors,
} satisfies Record<AppColorScheme, AppColors>;

let activeColorScheme: AppColorScheme = 'light';
let activeColors: AppColors = lightColors;
let activeVersion = 0;
const listeners = new Set<() => void>();

export const colors = new Proxy(lightColors, {
  get(_target, property: string | symbol) {
    if (typeof property !== 'string') {
      return undefined;
    }

    return activeColors[property as ColorToken];
  },
}) as AppColors;

export function getColorsForScheme(colorScheme: AppColorScheme) {
  return colorSchemes[colorScheme];
}

export function getActiveColors() {
  return activeColors;
}

export function getActiveColorScheme() {
  return activeColorScheme;
}

export function setActiveColorScheme(colorScheme: AppColorScheme) {
  if (activeColorScheme === colorScheme) {
    return;
  }

  activeColorScheme = colorScheme;
  activeColors = getColorsForScheme(colorScheme);
  activeVersion += 1;
  listeners.forEach(listener => listener());
}

export function useThemeSync() {
  useSyncExternalStore(
    listener => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => activeVersion,
    () => activeVersion,
  );
}

export function createThemedStyles<T extends ThemeStyleMap>(factory: () => T): T {
  let cachedVersion = -1;
  let cachedStyles: T | null = null;

  const getStyles = () => {
    if (!cachedStyles || cachedVersion !== activeVersion) {
      cachedStyles = StyleSheet.create(factory()) as T;
      cachedVersion = activeVersion;
    }

    return cachedStyles;
  };

  return new Proxy({} as T, {
    get(_target, property: string | symbol) {
      return getStyles()[property as keyof T];
    },
    getOwnPropertyDescriptor(_target, property: string | symbol) {
      const styles = getStyles();

      if (!(property in styles)) {
        return undefined;
      }

      return {
        configurable: true,
        enumerable: true,
        value: styles[property as keyof T],
      };
    },
    ownKeys() {
      return Reflect.ownKeys(getStyles());
    },
  });
}
