import React, { useEffect, useState, useRef } from 'react';
import { Animated, View, Text } from 'react-native';
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
  StickerCollectionScreen,
  ThemeLibraryScreen,
} from '../screens';
import { PremiumScreen } from '../screens/PremiumScreen';
import { MascotImage } from '../components/mascot';
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

function AnimatedSplashMascot() {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [floatAnim]);

  return (
    <Animated.View style={{ transform: [{ translateY: floatAnim }], alignItems: 'center' }}>
      <MascotImage pose="hello" size="xl" />
      <View style={{ marginTop: -10, backgroundColor: 'rgba(0,0,0,0.06)', width: 80, height: 12, borderRadius: 50, transform: [{ scale: 1 }] }} />
    </Animated.View>
  );
}

  if (!initialRouteName) {
    return (
      <View style={styles.loading}>
        <AnimatedSplashMascot />
        <Text style={{ marginTop: 24, fontSize: 32, color: colors.primaryDark, fontWeight: '900', letterSpacing: 0.5 }}>
          Sungy
        </Text>
        <Text style={{ marginTop: 4, fontSize: 16, color: colors.textSoft, fontWeight: '600' }}>
          {t('splash.tagline')}
        </Text>
        <Text style={{ marginTop: 28, fontSize: 14, color: colors.primary, fontWeight: '700' }}>
          {t('splash.loading')}
        </Text>
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
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ScenePlayer"
          component={ScenePlayerScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="ReviewGame"
          component={ReviewGameScreen}
          options={{ headerShown: false, gestureEnabled: false }}
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
          name="StickerCollection"
          component={StickerCollectionScreen}
          options={{ title: t('nav.stickerCollection') }}
        />
        <Stack.Screen
          name="Parent"
          component={ParentScreen}
          options={{
            headerBackButtonDisplayMode: 'minimal',
            title: t('nav.parent'),
          }}
        />
        <Stack.Screen
          name="Premium"
          component={PremiumScreen}
          options={{
            headerBackButtonDisplayMode: 'minimal',
            title: t('nav.premium'),
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
