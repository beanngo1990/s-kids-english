import React, { useCallback, useEffect, useRef } from 'react';
import { Alert, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { Screen } from '../components/Screen';
import {
  getKidLockAudioPrompt,
  type KidLockReason,
} from '../data/kidLockAudioPrompts';
import { lessons } from '../data/lessons';
import { playTapSound, speakVi, speakWord } from '../engine/AudioManager';
import { canAccessReview } from '../engine/ContentAccessPolicy';
import { useI18n, useSavedPromptLanguage } from '../i18n';
import { getMonetizationSnapshot } from '../engine/MonetizationManager';
import {
  completeLessonProgress,
  type ProgressCompletionResult,
} from '../engine/ProgressManager';
import { ScenePlayer } from '../engine/ScenePlayer';
import { useContentAccess } from '../engine/useContentAccess';
import { hasPlayableReviewGame } from '../games/GameRegistry';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ScenePlayer'>;

export function ScenePlayerScreen({ navigation, route }: Props) {
  useThemeSync();
  const t = useI18n();
  const promptLanguage = useSavedPromptLanguage();
  const lesson = lessons.find(item => item.id === route.params.lessonId);
  const openedFromParent = route.params.openedFromParent === true;
  const hasShownAccessPromptRef = useRef(false);
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
  const hasContentAccess = isAccessGranted;

  const playKidLockPrompt = useCallback(
    (reason: KidLockReason) => {
      playTapSound().catch(() => undefined);
      const message = getKidLockAudioPrompt(reason, promptLanguage);
      const speech =
        promptLanguage === 'en' ? speakWord(message) : speakVi(message);
      speech.catch(() => undefined);
    },
    [promptLanguage],
  );

  const returnAfterBlockedAccess = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Home');
  }, [navigation]);

  const showPremiumAccessPrompt = useCallback(
    (options?: Readonly<{ onClose?: () => void; replaceCurrentRoute?: boolean }>) => {
      if (!lesson) {
        return;
      }

      if (isResolving) {
        playKidLockPrompt('resolving');
        Alert.alert(
          t('premium.kidLockedTitle'),
          t('premium.resolving'),
          [{ onPress: options?.onClose, text: t('common.close') }],
          { cancelable: false },
        );
        return;
      }

      playKidLockPrompt('premium');
      Alert.alert(
        t('premium.kidLockedTitle'),
        t('premium.kidLockedText'),
        [
          { onPress: options?.onClose, style: 'cancel', text: t('common.close') },
          {
            onPress: () => {
              const params = {
                intent: 'premium' as const,
                lessonId: lesson.id,
              };

              if (options?.replaceCurrentRoute) {
                navigation.replace('Parent', params);
                return;
              }

              navigation.navigate('Parent', params);
            },
            text: t('premium.askParent'),
          },
        ],
        { cancelable: false },
      );
    },
    [isResolving, lesson, navigation, playKidLockPrompt, t],
  );

  useEffect(() => {
    if (
      !lesson ||
      hasContentAccess ||
      hasShownAccessPromptRef.current
    ) {
      return;
    }

    hasShownAccessPromptRef.current = true;
    showPremiumAccessPrompt({
      onClose: returnAfterBlockedAccess,
      replaceCurrentRoute: true,
    });
  }, [
    hasContentAccess,
    lesson,
    returnAfterBlockedAccess,
    showPremiumAccessPrompt,
  ]);

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

  if (!hasContentAccess) {
    return (
      <Screen>
        <View />
      </Screen>
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
    if (hasPlayableReviewGame(lesson.reviewGame)) {
      if (
        !canAccessReview(lesson.id, getMonetizationSnapshot())
      ) {
        showPremiumAccessPrompt();
        return;
      }

      navigation.navigate('ReviewGame', {
        learningMode: route.params.learningMode,
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
      completionResult = await completeLessonProgress(lesson, {
        learningMode: route.params.learningMode,
      });
    } catch {
      // Progress is local best-effort; reward flow should not get stuck.
    }

    navigation.navigate('Reward', {
      lessonId: lesson.id,
      sourceScreen: 'ScenePlayer',
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
