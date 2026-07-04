import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { KidBadge } from '../components/KidBadge';
import { ProgressStars } from '../components/ProgressStars';
import { Screen } from '../components/Screen';
import { SKidsIcon } from '../components/SKidsIcon';
import { getSceneForLearningMode } from '../data/learningModes';
import { lessons } from '../data/lessons';
import {
  getLearningDifficultyOption,
  getParentSettings,
} from '../engine/ParentSettingsManager';
import {
  completeLessonProgress,
  getProgress,
  type LocalProgress,
} from '../engine/ProgressManager';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { LearningMode } from '../types/lesson';
import type { RootStackParamList } from '../types/navigation';
import { getLessonIconName, getSceneIconName } from '../utils/lessonIcons';
import {
  isSceneProgressComplete,
  isSceneUnlocked,
} from '../utils/lessonProgress';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonPack'>;

export function LessonPackScreen({ navigation, route }: Props) {
  const lesson = lessons.find(item => item.id === route.params.lessonId);
  const scenes = lesson?.scenes ?? [];
  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [learningMode, setLearningMode] = useState<LearningMode>('core');
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
  const hasReviewGame = lesson?.reviewGame?.type === 'memory';
  const hasCompletedReviewGame = Boolean(
    lesson?.reviewGame &&
      progress?.completedReviewGameIds.includes(lesson.reviewGame.id),
  );
  const shouldPlayReviewGame =
    isPackComplete && hasReviewGame && !hasCompletedReviewGame;
  const primaryActionTitle = !isPackComplete
    ? 'Học tiếp'
    : shouldPlayReviewGame
      ? 'Chơi lật thẻ'
      : 'Nhận sticker';

  const difficultyOption = getLearningDifficultyOption(learningMode);

  const refreshScreenData = useCallback(() => {
    getProgress()
      .then(setProgress)
      .catch(() => setProgress(null));
    getParentSettings()
      .then(settings => setLearningMode(settings.learningMode))
      .catch(() => setLearningMode('core'));
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

    if (!scene || !isSceneUnlocked(scenes, scene, completedSceneIds, lesson.id)) {
      return;
    }

    navigation.navigate('ScenePlayer', {
      learningMode,
      lessonId: lesson.id,
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
      navigation.navigate('ReviewGame', { lessonId: lesson.id });
      return;
    }

    setIsCompleting(true);
    try {
      await completeLessonProgress(lesson);
    } catch {
      // Progress is best-effort; reward flow should still be reachable.
    } finally {
      setIsCompleting(false);
    }

    navigation.navigate('Reward', { lessonId: lesson.id });
  };

  if (!lesson) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Không tìm thấy gói bài học này.</Text>
          <AppButton
            title="Về danh sách bài học"
            onPress={() => navigation.navigate('LessonList')}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <AppCard style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <View style={styles.packIcon}>
            <SKidsIcon name={getLessonIconName(lesson)} size={86} />
          </View>
          <View style={styles.headerText}>
            <KidBadge tone={isPackComplete ? 'teal' : 'sun'}>
              {hasCompletedLesson
                ? 'Đã nhận thưởng'
                : shouldPlayReviewGame
                  ? 'Sẵn sàng ôn tập'
                  : isPackComplete
                    ? 'Đã học đủ cảnh'
                    : 'Gói bài học'}
            </KidBadge>
            <Text style={styles.title}>{lesson.titleVi}</Text>
            <Text style={styles.subtitle}>{lesson.titleEn}</Text>
          </View>
        </View>
        <View style={styles.headerProgress}>
          <ProgressStars completed={completedSceneCount} total={scenes.length} />
          <Text style={styles.progressText}>
            {completedSceneCount}/{scenes.length} cảnh đã học
          </Text>
          <KidBadge tone="sky">Độ khó: {difficultyOption.title}</KidBadge>
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
          const isUnlocked = isSceneUnlocked(
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
                  isCompleted && styles.sceneCardDone,
                  isNext && styles.sceneCardNext,
                  isLocked && styles.sceneCardLocked,
                ]}
              >
                <View style={styles.sceneTopRow}>
                  <KidBadge
                    tone={isCompleted ? 'teal' : isNext ? 'coral' : 'sky'}
                  >
                    Trạm {index + 1}
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
                        ? `Đã xong · ${rewardStars} sao`
                        : isNext
                          ? 'Học tiếp'
                          : 'Đang khóa'}
                    </Text>
                  </View>
                </View>

                <View style={styles.sceneMainContent}>
                  <View
                    style={[
                      styles.sceneIconContainer,
                      isLocked && styles.sceneIconContainerLocked,
                    ]}
                  >
                    <SKidsIcon
                      name={isLocked ? 'parentLock' : getSceneIconName(scene)}
                      size={64}
                    />
                  </View>
                  <View style={styles.sceneTextContainer}>
                    <Text style={styles.sceneTitle}>{scene.titleVi}</Text>
                    <Text style={styles.sceneSubtitle}>{scene.titleEn}</Text>
                    {vocabularyText ? (
                      <Text style={styles.vocabulary}>{vocabularyText}</Text>
                    ) : null}
                  </View>
                </View>
                {isNext ? (
                  <View style={styles.nextHintBubble}>
                    <Text style={styles.nextHint}>
                      Bé học cảnh này tiếp nhé.
                    </Text>
                  </View>
                ) : null}
                {isLocked ? (
                  <View style={styles.lockedHintBubble}>
                    <Text style={styles.lockedHint}>
                      Hoàn thành trạm trước để mở khóa.
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
        {isPackComplete && hasReviewGame && hasCompletedReviewGame ? (
          <AppButton
            title="Chơi lật thẻ lại"
            variant="secondary"
            onPress={() =>
              navigation.navigate('ReviewGame', { lessonId: lesson.id })
            }
          />
        ) : null}
        {scenes[0] ? (
          <AppButton
            title="Học từ cảnh đầu"
            variant="secondary"
            onPress={() => openScene(scenes[0].id)}
          />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  headerProgress: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.borderWarm,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
    backgroundColor: colors.white,
    borderColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 2,
    height: 88,
    justifyContent: 'center',
    width: 88,
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
    backgroundColor: colors.white,
    borderColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 2,
    height: 64,
    justifyContent: 'center',
    width: 64,
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
});
