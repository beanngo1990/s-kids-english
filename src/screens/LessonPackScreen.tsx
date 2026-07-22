import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { KidBadge } from '../components/KidBadge';
import { PremiumContentGate } from '../components/PremiumContentGate';
import { ProgressStars } from '../components/ProgressStars';
import { Screen } from '../components/Screen';
import { SKidsIcon } from '../components/SKidsIcon';
import { getSceneForLearningMode } from '../data/learningModes';
import { lessons } from '../data/lessons';
import {
  getParentSettings,
} from '../engine/ParentSettingsManager';
import {
  completeLessonProgress,
  getProgress,
  type LocalProgress,
  type ProgressCompletionResult,
} from '../engine/ProgressManager';
import {
  getLocalizedLessonSubtitle,
  getLocalizedLessonTitle,
  getLocalizedSceneSubtitle,
  getLocalizedSceneTitle,
} from '../i18n/domainCopy';
import { getLearningModeCopy } from '../i18n/learningModeCopy';
import { useI18n, useSavedAppLanguage } from '../i18n';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { LearningMode } from '../types/lesson';
import type { RootStackParamList } from '../types/navigation';
import { getLessonIconName, getSceneIconName } from '../utils/lessonIcons';
import {
  isSceneProgressComplete,
  isSceneUnlocked,
} from '../utils/lessonProgress';
import { useContentAccess } from '../engine/useContentAccess';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonPack'>;

export function LessonPackScreen({ navigation, route }: Props) {
  useThemeSync();
  const t = useI18n();
  const appLanguage = useSavedAppLanguage();
  const lesson = lessons.find(item => item.id === route.params.lessonId);
  const openedFromParent = route.params.openedFromParent === true;
  const { isAccessGranted, isResolving } = useContentAccess({
    kind: 'lesson',
    lessonId: route.params.lessonId,
  });
  const scenes = lesson?.scenes ?? [];
  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [learningMode, setLearningMode] = useState<LearningMode>('core');
  const [journeyMode, setJourneyMode] = useState<'guided' | 'free'>('guided');
  const completedSceneIds = useMemo(
    () => new Set(progress?.completedSceneIds ?? []),
    [progress],
  );
  const completedSceneCount = scenes.filter(scene =>
    isSceneProgressComplete(completedSceneIds, lesson?.id, scene.id),
  ).length;
  const nextScene =
    scenes.find(
      scene => !isSceneProgressComplete(completedSceneIds, lesson?.id, scene.id),
    ) ?? scenes[0];
  const isPackComplete =
    scenes.length > 0 && completedSceneCount === scenes.length;
  const hasCompletedLesson = Boolean(
    lesson && progress?.completedLessonIds.includes(lesson.id),
  );
  const hasReviewGame = Boolean(
    lesson?.reviewGame &&
      (lesson.reviewGame.type === 'memory' ||
        lesson.reviewGame.type === 'listenAndChoose'),
  );
  const hasCompletedReviewGame = Boolean(
    lesson?.reviewGame &&
      progress?.completedReviewGameIds.includes(lesson.reviewGame.id),
  );
  const shouldPlayReviewGame =
    isPackComplete && hasReviewGame && !hasCompletedReviewGame;
  const reviewGameActionTitle =
    lesson?.reviewGame?.type === 'listenAndChoose'
      ? t('reviewGame.listenAndChooseBadge')
      : t('lessonPack.playMemory');
  const primaryActionTitle = !isPackComplete
    ? t('lessonPack.continue')
    : shouldPlayReviewGame
      ? reviewGameActionTitle
      : t('lessonPack.claimSticker');

  const difficultyOption = getLearningModeCopy(learningMode, t);

  const refreshScreenData = useCallback(() => {
    getProgress()
      .then(setProgress)
      .catch(() => setProgress(null));
    getParentSettings()
      .then(settings => {
        setLearningMode(settings.learningMode);
        setJourneyMode(settings.journeyMode);
      })
      .catch(() => {
        setLearningMode('core');
        setJourneyMode('guided');
      });
  }, []);

  useEffect(() => {
    refreshScreenData();
    return navigation.addListener('focus', refreshScreenData);
  }, [navigation, refreshScreenData]);

  const openScene = (sceneId: string) => {
    if (!lesson) {
      return;
    }

    const scene = scenes.find(item => item.id === sceneId);

    if (!scene || (journeyMode === 'guided' && !isSceneUnlocked(scenes, scene, completedSceneIds, lesson.id))) {
      return;
    }

    navigation.navigate('ScenePlayer', {
      learningMode,
      lessonId: lesson.id,
      openedFromParent,
      sceneId,
    });
  };

  const handlePrimaryAction = async () => {
    if (!lesson || !nextScene || isCompleting) {
      return;
    }

    if (!isPackComplete) {
      openScene(nextScene.id);
      return;
    }

    if (shouldPlayReviewGame) {
      navigation.navigate('ReviewGame', {
        lessonId: lesson.id,
        openedFromParent,
      });
      return;
    }

    setIsCompleting(true);
    let completionResult: ProgressCompletionResult = {
      xpGained: 0,
      leveledUp: false,
      newLevel: 1,
    };
    try {
      completionResult = await completeLessonProgress(lesson);
    } catch {
      // Progress is best-effort; reward flow should still be reachable.
    } finally {
      setIsCompleting(false);
    }

    navigation.navigate('Reward', {
      lessonId: lesson.id,
      ...completionResult,
    });
  };

  if (!lesson) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>{t('lessonPack.notFound')}</Text>
          <AppButton
            title={t('lessonPack.backToList')}
            onPress={() => navigation.navigate('LessonList')}
          />
        </View>
      </Screen>
    );
  }

  if (!isAccessGranted) {
    return (
      <PremiumContentGate
        isResolving={isResolving}
        onAskParent={() =>
          navigation.navigate('Parent', {
            intent: 'premium',
            lessonId: lesson.id,
          })
        }
      />
    );
  }

  return (
    <Screen scroll>
      {openedFromParent ? (
        <AppCard style={styles.parentContextCard}>
          <KidBadge tone="sky">{t('lessonPack.parentBadge')}</KidBadge>
          <Text style={styles.parentContextTitle}>
            {t('lessonPack.parentContextTitle')}
          </Text>
          <Text style={styles.parentContextText}>
            {t('lessonPack.parentContextText')}
          </Text>
        </AppCard>
      ) : null}

      <AppCard
        style={[
          styles.headerCard,
          openedFromParent && styles.headerCardParent,
        ]}
      >
        <View style={styles.headerTopRow}>
          <View
            style={[
              styles.packIcon,
              openedFromParent && styles.packIconParent,
            ]}
          >
            <SKidsIcon
              name={getLessonIconName(lesson)}
              size={openedFromParent ? 62 : 86}
            />
          </View>
          <View style={styles.headerText}>
            <KidBadge tone={isPackComplete ? 'teal' : 'sun'}>
              {hasCompletedLesson
                ? t('lessonPack.rewardClaimed')
                : shouldPlayReviewGame
                  ? t('lessonPack.readyToReview')
                  : isPackComplete
                    ? t('lessonPack.scenesCompleted')
                    : t('lessonPack.lessonPack')}
            </KidBadge>
            <Text
              numberOfLines={openedFromParent ? 2 : undefined}
              style={styles.title}
            >
              {getLocalizedLessonTitle(lesson, appLanguage)}
            </Text>
            <Text
              numberOfLines={openedFromParent ? 2 : undefined}
              style={styles.subtitle}
            >
              {getLocalizedLessonSubtitle(lesson, appLanguage)}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.headerProgress,
            openedFromParent && styles.headerProgressParent,
          ]}
        >
          <ProgressStars completed={completedSceneCount} total={scenes.length} />
          <Text style={styles.progressText}>
            {t('lessonPack.scenesLearned', { completed: String(completedSceneCount), total: String(scenes.length) })}
          </Text>
          <KidBadge tone="sky">{t('lessonPack.difficulty', { difficulty: difficultyOption.title })}</KidBadge>
        </View>
      </AppCard>

      <View style={styles.sceneList}>
        {scenes.map((scene, index) => {
          const isCompleted = isSceneProgressComplete(
            completedSceneIds,
            lesson.id,
            scene.id,
          );
          const isNext =
            !isPackComplete && !isCompleted && nextScene?.id === scene.id;
          const isUnlocked = journeyMode === 'free' || isSceneUnlocked(
            scenes,
            scene,
            completedSceneIds,
            lesson.id,
          );
          const isLocked = !isUnlocked;
          const rewardStars = scene.completionReward?.stars ?? 3;
          const modeScene = getSceneForLearningMode(scene, learningMode);
          const vocabularyText =
            modeScene.vocabulary?.map(item => item.word).join(' · ') ?? '';

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isLocked }}
              disabled={isLocked}
              key={scene.id}
              onPress={() => openScene(scene.id)}
              style={({ pressed }) => [
                styles.scenePressable,
                pressed && !isLocked && styles.pressed,
              ]}
            >
              <AppCard
                style={[
                  styles.sceneCard,
                  openedFromParent && styles.sceneCardParent,
                  isCompleted && styles.sceneCardDone,
                  isNext && styles.sceneCardNext,
                  isLocked && styles.sceneCardLocked,
                ]}
              >
                <View style={styles.sceneTopRow}>
                  <KidBadge
                    tone={isCompleted ? 'teal' : isNext ? 'coral' : 'sky'}
                  >
                    {t('lessonPack.station', { index: String(index + 1) })}
                  </KidBadge>
                  <View style={styles.sceneStars}>
                    <Text
                      style={[
                        styles.sceneStatus,
                        isCompleted && styles.sceneStatusDone,
                        isNext && styles.sceneStatusNext,
                      ]}
                    >
                      {isCompleted
                        ? t('lessonPack.sceneStatusDone', { stars: String(rewardStars) })
                        : isNext
                          ? t('lessonPack.continue')
                          : t('lessonPack.locked')}
                    </Text>
                  </View>
                </View>

                <View style={styles.sceneMainContent}>
                  <View
                    style={[
                      styles.sceneIconContainer,
                      openedFromParent && styles.sceneIconContainerParent,
                      isLocked && styles.sceneIconContainerLocked,
                    ]}
                  >
                    <SKidsIcon
                      name={isLocked ? 'parentLock' : getSceneIconName(scene)}
                      size={openedFromParent ? 48 : 64}
                    />
                  </View>
                  <View style={styles.sceneTextContainer}>
                    <Text
                      numberOfLines={openedFromParent ? 2 : undefined}
                      style={styles.sceneTitle}
                    >
                      {getLocalizedSceneTitle(scene, appLanguage)}
                    </Text>
                    <Text
                      numberOfLines={openedFromParent ? 2 : undefined}
                      style={styles.sceneSubtitle}
                    >
                      {getLocalizedSceneSubtitle(scene, appLanguage)}
                    </Text>
                    {vocabularyText ? (
                      <Text
                        numberOfLines={openedFromParent ? 1 : undefined}
                        style={styles.vocabulary}
                      >
                        {vocabularyText}
                      </Text>
                    ) : null}
                  </View>
                </View>
                {isNext ? (
                  <View style={styles.nextHintBubble}>
                    <Text style={styles.nextHint}>
                      {t('lessonPack.nextHint')}
                    </Text>
                  </View>
                ) : null}
                {isLocked ? (
                  <View style={styles.lockedHintBubble}>
                    <Text style={styles.lockedHint}>
                      {t('lessonPack.lockedHint')}
                    </Text>
                  </View>
                ) : null}
              </AppCard>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actions}>
        <AppButton
          disabled={isCompleting || !nextScene}
          title={primaryActionTitle}
          onPress={handlePrimaryAction}
        />
        {(journeyMode === 'free' || isPackComplete) && hasReviewGame && !shouldPlayReviewGame ? (
          <AppButton
            title={hasCompletedReviewGame ? `${reviewGameActionTitle} (${t('reviewGame.parentBadge')})` : reviewGameActionTitle}
            variant="secondary"
            onPress={() =>
              navigation.navigate('ReviewGame', {
                lessonId: lesson.id,
                openedFromParent,
              })
            }
          />
        ) : null}
        {scenes[0] ? (
          <AppButton
            title={t('lessonPack.learnFromStart')}
            variant="secondary"
            onPress={() => openScene(scenes[0].id)}
          />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = createThemedStyles(() => ({
  actions: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
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
  headerCard: {
    backgroundColor: colors.cream,
    borderColor: colors.borderWarm,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  headerCardParent: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  headerProgress: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderWarm,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerProgressParent: {
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'flex-start',
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  headerTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  packIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 2,
    height: 88,
    justifyContent: 'center',
    width: 88,
  },
  packIconParent: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    height: 64,
    width: 64,
  },
  parentContextCard: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderWidth: 1,
    gap: spacing.xs,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  parentContextText: {
    color: colors.textSoft,
    ...typography.caption,
  },
  parentContextTitle: {
    color: colors.text,
    ...typography.body,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  progressText: {
    color: colors.textSoft,
    ...typography.caption,
  },
  sceneCard: {
    gap: spacing.sm,
  },
  sceneCardParent: {
    gap: spacing.xs,
    padding: spacing.md,
  },
  sceneCardDone: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.primary,
  },
  sceneCardNext: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  sceneCardLocked: {
    opacity: 0.66,
  },
  sceneIconContainerLocked: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
  },
  sceneList: {
    gap: spacing.md,
  },
  scenePressable: {
    borderRadius: radius.xl,
  },
  sceneStatus: {
    color: colors.muted,
    ...typography.caption,
  },
  sceneStatusDone: {
    color: colors.primaryDark,
  },
  sceneStatusNext: {
    color: colors.accentDark,
  },
  sceneMainContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  sceneIconContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 2,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  sceneIconContainerParent: {
    height: 52,
    width: 52,
  },
  sceneStars: {
    alignItems: 'flex-end',
  },
  sceneTextContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  sceneSubtitle: {
    color: colors.primaryDark,
    ...typography.caption,
  },
  sceneTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  sceneTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nextHint: {
    color: colors.accentDark,
    ...typography.caption,
  },
  nextHintBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  lockedHint: {
    color: colors.textSoft,
    ...typography.caption,
  },
  lockedHintBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceBlue,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  modeChip: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexGrow: 1,
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  modeChipPrimary: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  modeChipPrimaryText: {
    color: colors.primaryDark,
  },
  modeChipText: {
    color: colors.text,
    textAlign: 'center',
    ...typography.caption,
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  title: {
    color: colors.text,
    ...typography.title,
  },
  subtitle: {
    color: colors.textSoft,
    ...typography.body,
  },
  vocabulary: {
    color: colors.textSoft,
    marginTop: spacing.xs,
    ...typography.body,
  },
}));
