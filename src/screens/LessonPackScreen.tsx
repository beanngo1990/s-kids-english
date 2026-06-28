import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  type GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { KidBadge } from '../components/KidBadge';
import { ProgressStars } from '../components/ProgressStars';
import { Screen } from '../components/Screen';
import {
  getAvailableLearningModes,
  getSceneForLearningMode,
  learningModeLabels,
} from '../data/learningModes';
import { lessons } from '../data/lessons';
import {
  completeLessonProgress,
  getProgress,
  type LocalProgress,
} from '../engine/ProgressManager';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { LearningMode, Scene } from '../types/lesson';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonPack'>;

export function LessonPackScreen({ navigation, route }: Props) {
  const lesson = lessons.find(item => item.id === route.params.lessonId);
  const scenes = lesson?.scenes ?? [];
  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const completedSceneIds = useMemo(
    () => new Set(progress?.completedSceneIds ?? []),
    [progress],
  );
  const completedSceneCount = scenes.filter(scene =>
    completedSceneIds.has(scene.id),
  ).length;
  const nextScene =
    scenes.find(scene => !completedSceneIds.has(scene.id)) ?? scenes[0];
  const isPackComplete =
    scenes.length > 0 && completedSceneCount === scenes.length;

  const refreshProgress = useCallback(() => {
    getProgress()
      .then(setProgress)
      .catch(() => setProgress(null));
  }, []);

  useEffect(() => {
    refreshProgress();
    return navigation.addListener('focus', refreshProgress);
  }, [navigation, refreshProgress]);

  const openScene = (sceneId: string, learningMode: LearningMode = 'core') => {
    if (!lesson) {
      return;
    }

    navigation.navigate('ScenePlayer', {
      learningMode,
      lessonId: lesson.id,
      sceneId,
    });
  };

  const openSceneMode = (
    event: GestureResponderEvent,
    sceneId: string,
    learningMode: LearningMode,
  ) => {
    event.stopPropagation();
    openScene(sceneId, learningMode);
  };

  const handlePrimaryAction = async () => {
    if (!lesson || !nextScene || isCompleting) {
      return;
    }

    if (!isPackComplete) {
      openScene(nextScene.id);
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
            <Text style={styles.packEmoji}>{lesson.thumbnailEmoji}</Text>
          </View>
          <View style={styles.headerText}>
            <KidBadge tone={isPackComplete ? 'teal' : 'sun'}>
              {isPackComplete ? 'Đã hoàn thành' : 'Gói bài học'}
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
        </View>
      </AppCard>

      <View style={styles.sceneList}>
        {scenes.map((scene, index) => {
          const isCompleted = completedSceneIds.has(scene.id);
          const isNext =
            !isPackComplete && !isCompleted && nextScene?.id === scene.id;
          const rewardStars = scene.completionReward?.stars ?? 3;
          const availableLearningModes = getAvailableLearningModes(scene);
          const coreScene = getSceneForLearningMode(scene, 'core');
          const vocabularyText =
            coreScene.vocabulary?.map(item => item.word).join(' · ') ?? '';

          return (
            <Pressable
              accessibilityRole="button"
              key={scene.id}
              onPress={() => openScene(scene.id)}
              style={({ pressed }) => [
                styles.scenePressable,
                pressed && styles.pressed,
              ]}
            >
              <AppCard
                style={[
                  styles.sceneCard,
                  isCompleted && styles.sceneCardDone,
                  isNext && styles.sceneCardNext,
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
                          : 'Sẵn sàng'}
                    </Text>
                  </View>
                </View>

                <View style={styles.sceneMainContent}>
                  {scene.thumbnailEmoji && (
                    <View style={styles.sceneEmojiContainer}>
                      <Text style={styles.sceneEmoji}>{scene.thumbnailEmoji}</Text>
                    </View>
                  )}
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
                {availableLearningModes.length > 1 ? (
                  <View style={styles.modeRow}>
                    {availableLearningModes.map(learningMode => (
                      <Pressable
                        accessibilityRole="button"
                        key={learningMode}
                        onPress={event =>
                          openSceneMode(event, scene.id, learningMode)
                        }
                        style={({ pressed }) => [
                          styles.modeChip,
                          learningMode === 'core' && styles.modeChipPrimary,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.modeChipText,
                            learningMode === 'core' &&
                              styles.modeChipPrimaryText,
                          ]}
                        >
                          {getLearningModeCardLabel(scene, learningMode)}
                        </Text>
                      </Pressable>
                    ))}
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
          title={isPackComplete ? 'Nhận sticker' : 'Học tiếp'}
          onPress={handlePrimaryAction}
        />
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

const previousLearningMode: Record<LearningMode, LearningMode | undefined> = {
  challenge: 'expanded',
  core: undefined,
  expanded: 'core',
};

function getLearningModeCardLabel(scene: Scene, learningMode: LearningMode) {
  const modeVocabulary =
    getSceneForLearningMode(scene, learningMode).vocabulary ?? [];
  const previousMode = previousLearningMode[learningMode];

  if (!previousMode) {
    return `${learningModeLabels[learningMode]} · ${modeVocabulary.length} từ`;
  }

  const previousVocabulary =
    getSceneForLearningMode(scene, previousMode).vocabulary ?? [];
  const previousVocabularyIds = new Set(
    previousVocabulary.map(item => item.id),
  );
  const newVocabularyCount = modeVocabulary.filter(
    item => !previousVocabularyIds.has(item.id),
  ).length;

  if (newVocabularyCount === 0) {
    return learningModeLabels[learningMode];
  }

  return `${learningModeLabels[learningMode]} · +${newVocabularyCount} từ`;
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
  packEmoji: {
    fontSize: 40,
    lineHeight: 48,
  },
  packIcon: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
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
  sceneEmojiContainer: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 2,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  sceneEmoji: {
    fontSize: 30,
    lineHeight: 36,
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
