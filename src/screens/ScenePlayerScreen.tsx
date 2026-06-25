import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '../components/Screen';
import { lessons } from '../data/lessons';
import { completeLessonProgress } from '../engine/ProgressManager';
import { ScenePlayer } from '../engine/ScenePlayer';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ScenePlayer'>;

export function ScenePlayerScreen({ navigation, route }: Props) {
  const handleComplete = async () => {
    const lesson =
      lessons.find(item => item.id === route.params.lessonId) ?? lessons[0];

    try {
      await completeLessonProgress(lesson);
    } catch {
      // Progress is local best-effort; reward flow should not get stuck.
    }

    navigation.navigate('Reward', { lessonId: lesson.id });
  };

  return (
    <Screen>
      <ScenePlayer
        lessonId={route.params.lessonId}
        onComplete={handleComplete}
      />
    </Screen>
  );
}
