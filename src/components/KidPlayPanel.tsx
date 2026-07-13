import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AppCard } from './AppCard';
import { KidBadge } from './KidBadge';
import { SKidsIcon } from './SKidsIcon';
import { lessons } from '../data/lessons';
import {
  getLocalizedLessonTitle,
  getLocalizedReviewGameTitle,
} from '../i18n/domainCopy';
import type { AppLanguage } from '../i18n/types';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Lesson } from '../types/lesson';
import { getLessonIconName } from '../utils/lessonIcons';
import {
  getCompletedSceneCount,
  isLessonComplete,
} from '../utils/lessonProgress';

type KidPlayPanelProps = {
  appLanguage: AppLanguage;
  completedReviewGameIds: Set<string>;
  completedSceneIds: Set<string>;
  journeyMode?: 'guided' | 'free';
  onOpenReviewGame: (lessonId: string) => void;
};

export function KidPlayPanel({
  appLanguage,
  completedReviewGameIds,
  completedSceneIds,
  journeyMode = 'guided',
  onOpenReviewGame,
}: KidPlayPanelProps) {
  useThemeSync();
  const reviewLessons = useMemo(
    () => lessons.filter(lesson => lesson.reviewGame),
    [],
  );
  const unlockedCount = reviewLessons.filter(lesson =>
    journeyMode === 'free' || isReviewGameUnlocked(lesson, completedSceneIds),
  ).length;
  const pendingReviewLesson = useMemo(
    () =>
      reviewLessons.find(
        lesson =>
          lesson.reviewGame &&
          (journeyMode === 'free' || isReviewGameUnlocked(lesson, completedSceneIds)) &&
          !completedReviewGameIds.has(lesson.reviewGame.id),
      ),
    [completedReviewGameIds, completedSceneIds, journeyMode, reviewLessons],
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
        {pendingReviewLesson ? (
          <KidBadge tone="alert">1 game</KidBadge>
        ) : (
          <KidBadge tone="sun">
            {unlockedCount}/{reviewLessons.length}
          </KidBadge>
        )}
      </View>

      <View style={styles.list}>
        {orderedReviewLessons.map(lesson => {
          const lessonTitle = getLocalizedLessonTitle(lesson, appLanguage);
          const reviewGameTitle = getLocalizedReviewGameTitle(
            lesson.reviewGame,
            appLanguage,
          );
          const isUnlocked = journeyMode === 'free' || isReviewGameUnlocked(lesson, completedSceneIds);
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
          const statusLabel = isPending
            ? 'Chơi ngay'
            : isUnlocked
            ? isCompleted
              ? 'Chơi lại'
              : 'Đã mở'
            : 'Đang khóa';
          const actionIcon = !isUnlocked
            ? 'parentLock'
            : isCompleted
            ? 'star'
            : 'replay';

          return (
            <Pressable
              accessibilityLabel={`${lessonTitle}. ${
                reviewGameTitle
              }. ${statusLabel}. ${completedSceneCount}/${
                lesson.scenes.length
              } cảnh.`}
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
                        {statusLabel}
                      </KidBadge>
                      <KidBadge tone="sun">
                        {completedSceneCount}/{lesson.scenes.length}
                      </KidBadge>
                    </View>
                    <Text style={styles.lessonTitle}>{lessonTitle}</Text>
                    <Text style={styles.gameTitle}>
                      {reviewGameTitle}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.actionBox,
                      !isUnlocked && styles.actionBoxLocked,
                    ]}
                  >
                    <SKidsIcon name={actionIcon} size={42} />
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

const styles = createThemedStyles(() => ({
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
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
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
  actionBox: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  actionBoxLocked: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
  },
}));
