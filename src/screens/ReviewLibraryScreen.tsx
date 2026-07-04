import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppCard } from '../components/AppCard';
import { KidBadge } from '../components/KidBadge';
import { Screen } from '../components/Screen';
import { SKidsIcon } from '../components/SKidsIcon';
import { lessons } from '../data/lessons';
import { getProgress, type LocalProgress } from '../engine/ProgressManager';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Lesson } from '../types/lesson';
import type { RootStackParamList } from '../types/navigation';
import { getLessonIconName } from '../utils/lessonIcons';
import {
  getCompletedSceneCount,
  isLessonComplete,
} from '../utils/lessonProgress';

type Props = NativeStackScreenProps<RootStackParamList, 'ReviewLibrary'>;

export function ReviewLibraryScreen({ navigation }: Props) {
  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const completedSceneIds = useMemo(
    () => new Set(progress?.completedSceneIds ?? []),
    [progress],
  );
  const completedReviewGameIds = useMemo(
    () => new Set(progress?.completedReviewGameIds ?? []),
    [progress],
  );
  const reviewLessons = useMemo(
    () => lessons.filter(lesson => lesson.reviewGame),
    [],
  );
  const unlockedCount = reviewLessons.filter(lesson =>
    isReviewGameUnlocked(lesson, completedSceneIds),
  ).length;

  const refreshProgress = useCallback(() => {
    getProgress()
      .then(setProgress)
      .catch(() => setProgress(null));
  }, []);

  useEffect(() => {
    refreshProgress();
    return navigation.addListener('focus', refreshProgress);
  }, [navigation, refreshProgress]);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <KidBadge tone="teal">Ôn tập</KidBadge>
        <Text style={styles.title}>Chọn game muốn chơi lại</Text>
        <Text style={styles.subtitle}>
          Các game sẽ mở khi bé học đủ cảnh trong gói bài. Bé có thể quay lại
          luyện trí nhớ và nghe từ vựng bất cứ lúc nào.
        </Text>
        <View style={styles.summaryRow}>
          <KidBadge tone="sun">
            {unlockedCount}/{reviewLessons.length} game đã mở
          </KidBadge>
        </View>
      </View>

      <View style={styles.list}>
        {reviewLessons.map(lesson => {
          const isUnlocked = isReviewGameUnlocked(lesson, completedSceneIds);
          const isCompleted = Boolean(
            lesson.reviewGame &&
              completedReviewGameIds.has(lesson.reviewGame.id),
          );
          const completedSceneCount = getCompletedSceneCount(
            lesson.scenes,
            completedSceneIds,
            lesson.id,
          );

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !isUnlocked }}
              disabled={!isUnlocked}
              key={lesson.id}
              onPress={() =>
                navigation.navigate('ReviewGame', { lessonId: lesson.id })
              }
              style={({ pressed }) => [
                styles.cardPressable,
                pressed && isUnlocked && styles.pressed,
              ]}
            >
              <AppCard
                style={[
                  styles.reviewCard,
                  isUnlocked && styles.reviewCardUnlocked,
                  !isUnlocked && styles.reviewCardLocked,
                ]}
              >
                <View style={styles.cardMain}>
                  <View
                    style={[
                      styles.iconBox,
                      !isUnlocked && styles.iconBoxLocked,
                    ]}
                  >
                    <SKidsIcon
                      name={isUnlocked ? getLessonIconName(lesson) : 'parentLock'}
                      size={68}
                    />
                  </View>

                  <View style={styles.cardText}>
                    <View style={styles.badgeRow}>
                      <KidBadge tone={isUnlocked ? 'teal' : 'sky'}>
                        {isUnlocked
                          ? isCompleted
                            ? 'Chơi lại'
                            : 'Đã mở khóa'
                          : 'Đang khóa'}
                      </KidBadge>
                      <KidBadge tone="sun">
                        {completedSceneCount}/{lesson.scenes.length} cảnh
                      </KidBadge>
                    </View>
                    <Text style={styles.lessonTitle}>{lesson.titleVi}</Text>
                    <Text style={styles.gameTitle}>
                      {lesson.reviewGame?.titleVi ?? 'Game ôn tập'}
                    </Text>
                    <Text style={styles.hintText}>
                      {isUnlocked
                        ? 'Bấm để chơi lật thẻ hình giống nhau.'
                        : 'Hoàn thành đủ các cảnh để mở game.'}
                    </Text>
                  </View>
                </View>
              </AppCard>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

function isReviewGameUnlocked(
  lesson: Lesson,
  completedSceneIds: Set<string>,
) {
  return isLessonComplete(lesson.scenes, completedSceneIds, lesson.id);
}

const styles = StyleSheet.create({
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  cardMain: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  cardPressable: {
    borderRadius: radius.xl,
  },
  cardText: {
    flex: 1,
    gap: spacing.xs,
  },
  gameTitle: {
    color: colors.primaryDark,
    ...typography.caption,
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  hintText: {
    color: colors.textSoft,
    ...typography.caption,
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 2,
    height: 76,
    justifyContent: 'center',
    width: 76,
  },
  iconBoxLocked: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
  },
  lessonTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  list: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  reviewCard: {
    gap: spacing.sm,
  },
  reviewCardLocked: {
    opacity: 0.64,
  },
  reviewCardUnlocked: {
    borderColor: colors.primary,
  },
  subtitle: {
    color: colors.textSoft,
    ...typography.body,
  },
  summaryRow: {
    alignItems: 'flex-start',
    marginTop: spacing.xs,
  },
  title: {
    color: colors.text,
    ...typography.title,
  },
});
