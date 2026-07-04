import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppCard } from './AppCard';
import { KidBadge } from './KidBadge';
import { SKidsIcon } from './SKidsIcon';
import { lessons } from '../data/lessons';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Lesson } from '../types/lesson';
import { getLessonIconName } from '../utils/lessonIcons';
import {
  getCompletedSceneCount,
  isLessonComplete,
} from '../utils/lessonProgress';

type KidPlayPanelProps = {
  completedReviewGameIds: Set<string>;
  completedSceneIds: Set<string>;
  onOpenReviewGame: (lessonId: string) => void;
};

export function KidPlayPanel({
  completedReviewGameIds,
  completedSceneIds,
  onOpenReviewGame,
}: KidPlayPanelProps) {
  const reviewLessons = useMemo(
    () => lessons.filter(lesson => lesson.reviewGame),
    [],
  );
  const unlockedCount = reviewLessons.filter(lesson =>
    isReviewGameUnlocked(lesson, completedSceneIds),
  ).length;
  const pendingReviewLesson = useMemo(
    () =>
      reviewLessons.find(
        lesson =>
          lesson.reviewGame &&
          isReviewGameUnlocked(lesson, completedSceneIds) &&
          !completedReviewGameIds.has(lesson.reviewGame.id),
      ),
    [completedReviewGameIds, completedSceneIds, reviewLessons],
  );
  const orderedReviewLessons = useMemo(() => {
    if (!pendingReviewLesson) {
      return reviewLessons;
    }

    return [
      pendingReviewLesson,
      ...reviewLessons.filter(lesson => lesson.id !== pendingReviewLesson.id),
    ];
  }, [pendingReviewLesson, reviewLessons]);

  return (
    <>
      <View style={styles.header}>
        <KidBadge tone="teal">Chơi</KidBadge>
        <Text style={styles.title}>Chọn game muốn chơi</Text>
        <Text style={styles.subtitle}>
          Các game sẽ mở khi bé học đủ cảnh trong gói bài. Bé có thể quay lại
          luyện trí nhớ và nghe từ vựng bất cứ lúc nào.
        </Text>
        <View style={styles.summaryRow}>
          {pendingReviewLesson ? (
            <KidBadge tone="alert">1 game đang chờ</KidBadge>
          ) : (
            <KidBadge tone="sun">
              {unlockedCount}/{reviewLessons.length} game đã mở
            </KidBadge>
          )}
        </View>
      </View>

      <View style={styles.list}>
        {orderedReviewLessons.map(lesson => {
          const isUnlocked = isReviewGameUnlocked(lesson, completedSceneIds);
          const isCompleted = Boolean(
            lesson.reviewGame &&
              completedReviewGameIds.has(lesson.reviewGame.id),
          );
          const isPending = pendingReviewLesson?.id === lesson.id;
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
              onPress={() => onOpenReviewGame(lesson.id)}
              style={({ pressed }) => [
                styles.cardPressable,
                pressed && isUnlocked && styles.pressed,
              ]}
            >
              <AppCard
                style={[
                  styles.reviewCard,
                  isUnlocked && styles.reviewCardUnlocked,
                  isPending && styles.reviewCardPending,
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
                      name={
                        isUnlocked ? getLessonIconName(lesson) : 'parentLock'
                      }
                      size={68}
                    />
                  </View>

                  <View style={styles.cardText}>
                    <View style={styles.badgeRow}>
                      <KidBadge
                        tone={isPending ? 'alert' : isUnlocked ? 'teal' : 'sky'}
                      >
                        {isPending
                          ? 'Chơi ngay'
                          : isUnlocked
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
                      {lesson.reviewGame?.titleVi ?? 'Game lật thẻ'}
                    </Text>
                    <Text style={styles.hintText}>
                      {isPending
                        ? 'Game lật thẻ đang chờ bé chơi sau khi hoàn thành gói.'
                        : isUnlocked
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
    </>
  );
}

function isReviewGameUnlocked(lesson: Lesson, completedSceneIds: Set<string>) {
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
  reviewCardPending: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.secondary,
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
