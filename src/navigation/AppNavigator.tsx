import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  HomeScreen,
  LessonListScreen,
  LessonPackScreen,
  OnboardingScreen,
  ParentScreen,
  RewardScreen,
  ReviewGameScreen,
  ReviewLibraryScreen,
  ScenePlayerScreen,
  ThemeLibraryScreen,
} from '../screens';
import { getParentSettings } from '../engine/ParentSettingsManager';
import { useI18n } from '../i18n';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { typography } from '../theme/typography';
import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  useThemeSync();
  const t = useI18n();
  const [initialRouteName, setInitialRouteName] = useState<
    keyof RootStackParamList | null
  >(null);

  useEffect(() => {
    let isMounted = true;

    getParentSettings()
      .then(settings => {
        if (isMounted) {
          setInitialRouteName(
            settings.hasCompletedOnboarding ? 'Home' : 'Onboarding',
          );
        }
      })
      .catch(() => {
        if (isMounted) {
          setInitialRouteName('Onboarding');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!initialRouteName) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleAlign: 'center',
          headerTitleStyle: {
            ...typography.body,
            fontWeight: '900',
          },
        }}
      >
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ animation: 'none', headerShown: false }}
        />
        <Stack.Screen
          name="ThemeLibrary"
          component={ThemeLibraryScreen}
          options={{ title: t('nav.themeLibrary') }}
        />
        <Stack.Screen
          name="LessonList"
          component={LessonListScreen}
          options={{ title: t('nav.lessonList') }}
        />
        <Stack.Screen
          name="LessonPack"
          component={LessonPackScreen}
          options={{ title: t('nav.lessonPack') }}
        />
        <Stack.Screen
          name="ScenePlayer"
          component={ScenePlayerScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="ReviewGame"
          component={ReviewGameScreen}
          options={{ title: t('nav.reviewGame'), gestureEnabled: false }}
        />
        <Stack.Screen
          name="ReviewLibrary"
          component={ReviewLibraryScreen}
          options={{ animation: 'none', headerShown: false }}
        />
        <Stack.Screen
          name="Reward"
          component={RewardScreen}
          options={{ title: t('nav.reward'), gestureEnabled: false }}
        />
        <Stack.Screen
          name="Parent"
          component={ParentScreen}
          options={{
            headerBackButtonDisplayMode: 'minimal',
            title: t('nav.parent'),
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = createThemedStyles(() => ({
  loading: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
}));
