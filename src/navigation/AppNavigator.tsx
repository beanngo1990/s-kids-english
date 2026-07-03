import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  HomeScreen,
  LessonListScreen,
  LessonPackScreen,
  OnboardingScreen,
  ParentScreen,
  RewardScreen,
  ScenePlayerScreen,
  ThemeLibraryScreen,
} from '../screens';
import { getParentSettings } from '../engine/ParentSettingsManager';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
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
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ThemeLibrary"
          component={ThemeLibraryScreen}
          options={{ title: 'Thư viện chủ đề' }}
        />
        <Stack.Screen
          name="LessonList"
          component={LessonListScreen}
          options={{ title: 'Bài học' }}
        />
        <Stack.Screen
          name="LessonPack"
          component={LessonPackScreen}
          options={{ title: 'Gói bài học' }}
        />
        <Stack.Screen
          name="ScenePlayer"
          component={ScenePlayerScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="Reward"
          component={RewardScreen}
          options={{ title: 'Phần thưởng', gestureEnabled: false }}
        />
        <Stack.Screen
          name="Parent"
          component={ParentScreen}
          options={{ title: 'Góc phụ huynh' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
});
