import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { PremiumContentGate } from '../components/PremiumContentGate';
import { Screen } from '../components/Screen';
import { lessons } from '../data/lessons';
import { canAccessReview } from '../engine/ContentAccessPolicy';
import { useI18n } from '../i18n';
import { getMonetizationSnapshot } from '../engine/MonetizationManager';
import {
  completeLessonProgress,
  type ProgressCompletionResult,
} from '../engine/ProgressManager';
import { ScenePlayer } from '../engine/ScenePlayer';
import { useContentAccess } from '../engine/useContentAccess';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ScenePlayer'>;

export function ScenePlayerScreen({ navigation, route }: Props) {
  useThemeSync();
  const t = useI18n();
  const lesson = lessons.find(item => item.id === route.params.lessonId);
  const openedFromParent = route.params.openedFromParent === true;
  const scene = route.params.sceneId
    ? lesson?.scenes.find(item => item.id === route.params.sceneId)
    : undefined;
  const { isAccessGranted, isResolving } = useContentAccess(
    {
      kind: 'scene',
      lessonId: route.params.lessonId,
      sceneId: route.params.sceneId ?? '__full_lesson__',
    },
    { latchWhenGranted: true },
  );

  if (!lesson) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>{t('scenePlayer.lessonNotFound')}</Text>
          <AppButton
            title={t('scenePlayer.backToList')}
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
          <Text style={styles.errorTitle}>{t('scenePlayer.sceneNotFound')}</Text>
          <AppButton
            title={t('scenePlayer.backToPack')}
            onPress={() =>
              navigation.navigate('LessonPack', {
                lessonId: lesson.id,
                openedFromParent,
              })
            }
          />
        </View>
      </Screen>
    );
  }

  const openParentPremium = () => {
    navigation.navigate('Parent', {
      intent: 'premium',
      lessonId: lesson.id,
    });
  };

  if (!isAccessGranted) {
    return (
      <PremiumContentGate
        isResolving={isResolving}
        onAskParent={openParentPremium}
      />
    );
  }

  const handleExitToPack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.replace('LessonPack', {
      lessonId: lesson.id,
      openedFromParent,
    });
  };

  const handleComplete = async () => {
    if (
      lesson.reviewGame &&
      (lesson.reviewGame.type === 'memory' ||
        lesson.reviewGame.type === 'listenAndChoose' ||
        lesson.reviewGame.type === 'random')
    ) {
      if (!canAccessReview(lesson.id, getMonetizationSnapshot())) {
        openParentPremium();
        return;
      }

      navigation.navigate('ReviewGame', {
        lessonId: lesson.id,
        openedFromParent,
      });
      return;
    }

    let completionResult: ProgressCompletionResult = {
      xpGained: 0,
      leveledUp: false,
      newLevel: 1,
    };
    try {
      completionResult = await completeLessonProgress(lesson);
    } catch {
      // Progress is local best-effort; reward flow should not get stuck.
    }

    navigation.navigate('Reward', {
      lessonId: lesson.id,
      ...completionResult,
    });
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

const styles = createThemedStyles(() => ({
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
}));
