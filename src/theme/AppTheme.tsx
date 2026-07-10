import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';

import {
  getParentSettings,
  saveParentSettings,
  type AppTheme,
} from '../engine/ParentSettingsManager';
import {
  getColorsForScheme,
  setActiveColorScheme,
  type AppColorScheme,
  type AppColors,
} from './colors';

type AppThemeContextValue = {
  appThemePreference: AppTheme;
  colorScheme: AppColorScheme;
  colors: AppColors;
  isThemeReady: boolean;
  setAppThemePreference: (appTheme: AppTheme) => Promise<void>;
};

const AppThemeContext = createContext<AppThemeContextValue | undefined>(
  undefined,
);

type AppThemeProviderProps = {
  children: ReactNode;
};

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const [appThemePreference, setAppThemePreferenceState] =
    useState<AppTheme>('system');
  const [systemColorScheme, setSystemColorScheme] =
    useState<ColorSchemeName | null>(Appearance.getColorScheme() ?? null);
  const [isThemeReady, setIsThemeReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getParentSettings()
      .then(settings => {
        if (isMounted) {
          setAppThemePreferenceState(settings.appTheme);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAppThemePreferenceState('system');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsThemeReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const colorScheme = resolveColorScheme(
    appThemePreference,
    systemColorScheme,
  );
  const themeColors = getColorsForScheme(colorScheme);

  useEffect(() => {
    setActiveColorScheme(colorScheme);
  }, [colorScheme]);

  const handleSetAppThemePreference = useCallback(
    async (nextAppTheme: AppTheme) => {
      setAppThemePreferenceState(nextAppTheme);

      try {
        await saveParentSettings({ appTheme: nextAppTheme });
      } catch {
        const settings = await getParentSettings();
        setAppThemePreferenceState(settings.appTheme);
      }
    },
    [],
  );

  const value = useMemo(
    () => ({
      appThemePreference,
      colorScheme,
      colors: themeColors,
      isThemeReady,
      setAppThemePreference: handleSetAppThemePreference,
    }),
    [
      appThemePreference,
      colorScheme,
      handleSetAppThemePreference,
      isThemeReady,
      themeColors,
    ],
  );

  return (
    <AppThemeContext.Provider value={value}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used inside AppThemeProvider');
  }

  return context;
}

function resolveColorScheme(
  appThemePreference: AppTheme,
  systemColorScheme: ColorSchemeName | null,
): AppColorScheme {
  if (appThemePreference === 'dark') {
    return 'dark';
  }

  if (appThemePreference === 'light') {
    return 'light';
  }

  return systemColorScheme === 'dark' ? 'dark' : 'light';
}
