import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { Screen } from '../components/Screen';
import { lessons } from '../data/lessons';
import { completeLessonProgress } from '../engine/ProgressManager';
import { ScenePlayer } from '../engine/ScenePlayer';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ScenePlayer'>;

export function ScenePlayerScreen({ navigation, route }: Props) {
  const lesson = lessons.find(item => item.id === route.params.lessonId);
  const scene = route.params.sceneId
    ? lesson?.scenes.find(item => item.id === route.params.sceneId)
    : undefined;

  if (!lesson) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Không tìm thấy bài học này.</Text>
          <AppButton
            title="Về danh sách bài học"
            onPress={() => navigation.navigate('LessonList')}
          />
        </View>
      </Screen>
    );
  }

  if (route.params.sceneId && !scene) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Không tìm thấy cảnh học này.</Text>
          <AppButton
            title="Về gói bài học"
            onPress={() =>
              navigation.navigate('LessonPack', { lessonId: lesson.id })
            }
          />
        </View>
      </Screen>
    );
  }

  const handleExitToPack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.replace('LessonPack', { lessonId: lesson.id });
  };

  const handleComplete = async () => {
    if (lesson.reviewGame?.type === 'memory') {
      navigation.navigate('ReviewGame', { lessonId: lesson.id });
      return;
    }

    let xpGained = 0;
    let leveledUp = false;
    let newLevel = 1;
    let unlockedSticker = undefined;
    try {
      const result = await completeLessonProgress(lesson);
      if (result && typeof result === 'object' && 'xpGained' in result) {
         xpGained = (result as any).xpGained;
         leveledUp = (result as any).leveledUp;
         newLevel = (result as any).newLevel;
         unlockedSticker = (result as any).unlockedSticker;
      }
    } catch {
      // Progress is local best-effort; reward flow should not get stuck.
    }

    navigation.navigate('Reward', { lessonId: lesson.id, xpGained, leveledUp, newLevel, unlockedSticker });
  };

  return (
    <Screen>
      <ScenePlayer
        completeCurrentSceneOnly={Boolean(route.params.sceneId)}
        initialSceneId={route.params.sceneId}
        learningMode={route.params.learningMode}
        lessonId={route.params.lessonId}
        onComplete={handleComplete}
        onExit={handleExitToPack}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.lg,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  errorTitle: {
    color: colors.text,
    textAlign: 'center',
    ...typography.title,
  },
});
