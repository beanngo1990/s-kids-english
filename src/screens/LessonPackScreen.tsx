import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { Screen } from '../components/Screen';
import { lessons } from '../data/lessons';
import {
  completeLessonProgress,
  getProgress,
  type LocalProgress,
} from '../engine/ProgressManager';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
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

  const openScene = (sceneId: string) => {
    if (!lesson) {
      return;
    }

    navigation.navigate('ScenePlayer', {
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
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Gói bài học</Text>
        <Text style={styles.title}>{lesson.titleVi}</Text>
        <Text style={styles.subtitle}>{lesson.titleEn}</Text>
        <View style={styles.progressPill}>
          <Text style={styles.progressText}>
            {completedSceneCount}/{scenes.length} mini-scene
          </Text>
        </View>
      </View>

      <View style={styles.sceneList}>
        {scenes.map((scene, index) => {
          const isCompleted = completedSceneIds.has(scene.id);
          const vocabularyText =
            scene.vocabulary?.map(item => item.word).join(' · ') ?? '';

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
              <AppCard style={styles.sceneCard}>
                <View style={styles.sceneTopRow}>
                  <Text style={styles.sceneIndex}>Cảnh {index + 1}</Text>
                  <Text
                    style={[
                      styles.sceneStatus,
                      isCompleted && styles.sceneStatusDone,
                    ]}
                  >
                    {isCompleted ? 'Đã xong' : 'Sẵn sàng'}
                  </Text>
                </View>

                <Text style={styles.sceneTitle}>{scene.titleVi}</Text>
                <Text style={styles.sceneSubtitle}>{scene.titleEn}</Text>
                {vocabularyText ? (
                  <Text style={styles.vocabulary}>{vocabularyText}</Text>
                ) : null}
              </AppCard>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actions}>
        <AppButton
          disabled={isCompleting || !nextScene}
          title={isPackComplete ? 'Nhận thưởng' : 'Học tiếp'}
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

const styles = StyleSheet.create({
  actions: {
    gap: spacing.md,
    marginTop: spacing.lg,
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
  eyebrow: {
    color: colors.primaryDark,
    ...typography.caption,
    textTransform: 'uppercase',
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  progressPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  progressText: {
    color: colors.text,
    ...typography.caption,
  },
  sceneCard: {
    gap: spacing.xs,
  },
  sceneIndex: {
    backgroundColor: colors.mint,
    borderRadius: radius.pill,
    color: colors.text,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    ...typography.caption,
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
  subtitle: {
    color: colors.textSoft,
    ...typography.body,
  },
  title: {
    color: colors.text,
    ...typography.title,
  },
  vocabulary: {
    color: colors.textSoft,
    marginTop: spacing.xs,
    ...typography.body,
  },
});
