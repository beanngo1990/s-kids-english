import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  HomeScreen,
  LessonListScreen,
  LessonPackScreen,
  ParentScreen,
  RewardScreen,
  ScenePlayerScreen,
} from '../screens';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
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
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
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
          options={{ headerShown: false }}
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
