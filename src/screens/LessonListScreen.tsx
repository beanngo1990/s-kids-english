import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppCard } from '../components/AppCard';
import { KidBadge } from '../components/KidBadge';
import { ProgressStars } from '../components/ProgressStars';
import { Screen } from '../components/Screen';
import { SKidsIcon } from '../components/SKidsIcon';
import { lessons } from '../data/lessons';
import { getProgress, type LocalProgress } from '../engine/ProgressManager';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { RootStackParamList } from '../types/navigation';
import { getLessonIconName, getSceneIconName } from '../utils/lessonIcons';
import { isSceneProgressComplete } from '../utils/lessonProgress';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonList'>;

export function LessonListScreen({ navigation }: Props) {
  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const completedSceneIds = useMemo(
    () => new Set(progress?.completedSceneIds ?? []),
    [progress],
  );

  useEffect(() => {
    getProgress()
      .then(setProgress)
      .catch(() => setProgress(null));
  }, []);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <KidBadge tone="teal">Bản đồ bài học</KidBadge>
        <Text style={styles.title}>Hành trình tiếng Anh của bé</Text>
        <Text style={styles.subtitle}>
          Mỗi trạm là một cảnh quen thuộc. Bé đi từng bước, nghe từng từ và
          mở khóa sticker sau khi hoàn thành.
        </Text>
      </View>

      <View style={styles.list}>
        {lessons.map(lesson => {
          const completedSceneCount = lesson.scenes.filter(scene =>
            isSceneProgressComplete(completedSceneIds, lesson.id, scene.id),
          ).length;

          return (
            <Pressable
              accessibilityRole="button"
              key={lesson.id}
              onPress={() =>
                navigation.navigate('LessonPack', { lessonId: lesson.id })
              }
              style={({ pressed }) => [
                styles.lessonPressable,
                pressed && styles.pressed,
              ]}
            >
              <AppCard style={styles.lessonCard}>
                <View style={styles.lessonTopRow}>
                  <View style={styles.lessonIcon}>
                    <SKidsIcon name={getLessonIconName(lesson)} size={74} />
                  </View>
                  <View style={styles.lessonText}>
                    <View style={styles.lessonBadgeRow}>
                      <KidBadge tone="sun">{lesson.ageRange.label}</KidBadge>
                      <KidBadge tone="sky">
                        {lesson.scenes.length} trạm
                      </KidBadge>
                    </View>
                    <Text style={styles.lessonTitle}>{lesson.titleVi}</Text>
                    <Text style={styles.lessonDescription}>
                      {lesson.descriptionVi}
                    </Text>
                  </View>
                </View>

                <View style={styles.progressRow}>
                  <ProgressStars
                    completed={completedSceneCount}
                    total={lesson.scenes.length}
                  />
                  <Text style={styles.progressText}>
                    {completedSceneCount}/{lesson.scenes.length} cảnh
                  </Text>
                </View>

                <View style={styles.map}>
                  {lesson.scenes.map((scene, index) => {
                    const isCompleted = isSceneProgressComplete(
                      completedSceneIds,
                      lesson.id,
                      scene.id,
                    );
                    const isNext =
                      !isCompleted &&
                      lesson.scenes
                        .slice(0, index)
                        .every(item =>
                          isSceneProgressComplete(
                            completedSceneIds,
                            lesson.id,
                            item.id,
                          ),
                        );

                    return (
                      <View key={scene.id} style={styles.mapStop}>
                        <View
                          style={[
                            styles.stopDot,
                            isCompleted && styles.stopDotDone,
                            isNext && styles.stopDotNext,
                          ]}
                        >
                          <SKidsIcon name={getSceneIconName(scene)} size={48} />
                        </View>
                        <Text style={styles.stopTitle}>{scene.titleVi}</Text>
                      </View>
                    );
                  })}
                </View>
              </AppCard>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  list: {
    gap: spacing.md,
  },
  lessonBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  lessonCard: {
    gap: spacing.md,
  },
  lessonDescription: {
    color: colors.textSoft,
    ...typography.body,
  },
  lessonIcon: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 2,
    height: 76,
    justifyContent: 'center',
    width: 76,
  },
  lessonPressable: {
    borderRadius: radius.xl,
  },
  lessonText: {
    flex: 1,
    gap: spacing.xs,
  },
  lessonTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  lessonTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  map: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  mapStop: {
    alignItems: 'center',
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    gap: spacing.xs,
    minHeight: 112,
    padding: spacing.sm,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  progressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    color: colors.textSoft,
    ...typography.caption,
  },
  stopDot: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.primarySoft,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  stopDotDone: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  stopDotNext: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
  },
  stopTitle: {
    color: colors.text,
    textAlign: 'center',
    ...typography.caption,
  },
  subtitle: {
    color: colors.textSoft,
    ...typography.body,
  },
  title: {
    color: colors.text,
    ...typography.title,
  },
});
