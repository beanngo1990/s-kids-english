import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Animated, View, Text } from 'react-native';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackHeaderProps,
} from '@react-navigation/native-stack';

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
  StickerPlaygroundScreen,
  ThemeLibraryScreen,
} from '../screens';
import { PremiumScreen } from '../screens/PremiumScreen';
import { KidSafeRouteHeader } from '../components/KidRouteHeader';
import { MascotImage } from '../components/mascot';
import {
  isBackgroundMusicSuppressedRoute,
  setBackgroundMusicSuppressedByRoute,
} from '../engine/BackgroundMusicManager';
import { getParentSettings } from '../engine/ParentSettingsManager';
import { useI18n } from '../i18n';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  useThemeSync();
  const t = useI18n();
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const [initialRouteName, setInitialRouteName] = useState<
    keyof RootStackParamList | null
  >(null);
  const syncBackgroundMusicRoute = useCallback(() => {
    setBackgroundMusicSuppressedByRoute(
      isBackgroundMusicSuppressedRoute(navigationRef.getCurrentRoute()?.name),
    );
  }, [navigationRef]);

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

  useEffect(
    () => () => {
      setBackgroundMusicSuppressedByRoute(false);
    },
    [],
  );

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
    <NavigationContainer
      ref={navigationRef}
      onReady={syncBackgroundMusicRoute}
      onStateChange={syncBackgroundMusicRoute}
    >
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          header: AppStackHeader,
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
          name="StickerPlayground"
          component={StickerPlaygroundScreen}
          options={{ title: t('nav.stickerPlayground') }}
        />
        <Stack.Screen
          name="Parent"
          component={ParentScreen}
          options={{ title: t('nav.parent') }}
        />
        <Stack.Screen
          name="Premium"
          component={PremiumScreen}
          options={{ title: t('nav.premium') }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function AppStackHeader({
  navigation,
  options,
  route,
}: NativeStackHeaderProps) {
  const usesCloseAction =
    route.name === 'Reward' || route.name === 'StickerPlayground';
  const handleHeaderAction = () => {
    if (route.name === 'Reward') {
      const rewardParams = route.params as
        | RootStackParamList['Reward']
        | undefined;
      navigation.navigate('Home', {
        activeTab:
          rewardParams?.sourceScreen === 'ReviewGame' ? 'play' : 'map',
      });
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate(
      'Home',
      route.name === 'StickerPlayground' ? { activeTab: 'play' } : undefined,
    );
  };

  return (
    <KidSafeRouteHeader
      action={usesCloseAction ? 'close' : 'back'}
      onAction={handleHeaderAction}
      title={options.title ?? route.name}
    />
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
