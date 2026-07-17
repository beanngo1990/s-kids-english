import React, { useMemo } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { AppCard } from './AppCard';
import { KidBadge } from './KidBadge';
import { SKidsIcon } from './SKidsIcon';
import { lessons } from '../data/lessons';
import { canAccessReview } from '../engine/ContentAccessPolicy';
import {
  getMonetizationSnapshot,
  useMonetizationSnapshot,
} from '../engine/MonetizationManager';
import {
  getLocalizedLessonTitle,
  getLocalizedReviewGameTitle,
} from '../i18n/domainCopy';
import { useI18n } from '../i18n';
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
  onOpenPremium: (lessonId: string) => void;
  onOpenReviewGame: (lessonId: string) => void;
};

export function KidPlayPanel({
  appLanguage,
  completedReviewGameIds,
  completedSceneIds,
  journeyMode = 'guided',
  onOpenPremium,
  onOpenReviewGame,
}: KidPlayPanelProps) {
  useThemeSync();
  const t = useI18n();
  const monetizationSnapshot = useMonetizationSnapshot();
  const reviewLessons = useMemo(
    () => lessons.filter(lesson => lesson.reviewGame),
    [],
  );
  const unlockedCount = reviewLessons.filter(
    lesson =>
      (journeyMode === 'free' ||
        isReviewGameUnlocked(lesson, completedSceneIds)) &&
      canAccessReview(lesson.id, monetizationSnapshot),
  ).length;
  const pendingReviewLesson = useMemo(
    () =>
      reviewLessons.find(
        lesson =>
          lesson.reviewGame &&
          (journeyMode === 'free' ||
            isReviewGameUnlocked(lesson, completedSceneIds)) &&
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

  const handleOpenReviewGame = (
    lessonId: string,
    isProgressUnlocked: boolean,
  ) => {
    const latestMonetizationSnapshot = getMonetizationSnapshot();
    if (canAccessReview(lessonId, latestMonetizationSnapshot)) {
      if (isProgressUnlocked) {
        onOpenReviewGame(lessonId);
      }
      return;
    }

    if (latestMonetizationSnapshot.status === 'initializing') {
      Alert.alert(t('premium.kidLockedTitle'), t('premium.resolving'));
      return;
    }

    Alert.alert(t('premium.kidLockedTitle'), t('premium.kidLockedText'), [
      { style: 'cancel', text: t('common.close') },
      {
        onPress: () => onOpenPremium(lessonId),
        text: t('premium.askParent'),
      },
    ]);
  };

  return (
    <>
      <View style={styles.header}>
        <KidBadge tone="teal">{t('playPanel.play')}</KidBadge>
        {pendingReviewLesson ? (
          <KidBadge tone="alert">{t('playPanel.oneGame')}</KidBadge>
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
          const isProgressUnlocked =
            journeyMode === 'free' ||
            isReviewGameUnlocked(lesson, completedSceneIds);
          const hasContentAccess = canAccessReview(
            lesson.id,
            monetizationSnapshot,
          );
          const isPremiumLocked = !hasContentAccess;
          const isResolvingPremium =
            isPremiumLocked && monetizationSnapshot.status === 'initializing';
          const isProgressOnlyLocked = !isProgressUnlocked && !isPremiumLocked;
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
          const statusLabel = isResolvingPremium
            ? t('premium.resolving')
            : isPremiumLocked
            ? t('premium.askParent')
            : !isProgressUnlocked
            ? t('playPanel.locked')
            : isPending
            ? t('playPanel.playNow')
            : isCompleted
            ? t('playPanel.playAgain')
            : t('playPanel.unlocked');
          const actionIcon =
            !isProgressUnlocked || isPremiumLocked
              ? 'parentLock'
              : isCompleted
              ? 'star'
              : 'replay';

          return (
            <Pressable
              accessibilityLabel={`${lessonTitle}. ${reviewGameTitle}. ${statusLabel}. ${completedSceneCount}/${
                lesson.scenes.length
              } ${t('playPanel.scene')}.`}
              accessibilityRole="button"
              accessibilityState={{ disabled: isProgressOnlyLocked }}
              disabled={isProgressOnlyLocked}
              key={lesson.id}
              onPress={() =>
                handleOpenReviewGame(lesson.id, isProgressUnlocked)
              }
              style={({ pressed }) => [
                styles.cardPressable,
                pressed && !isProgressOnlyLocked && styles.pressed,
              ]}
            >
              <AppCard
                style={[
                  styles.reviewCard,
                  isProgressUnlocked &&
                    hasContentAccess &&
                    styles.reviewCardUnlocked,
                  isPending && styles.reviewCardPending,
                  (!isProgressUnlocked || isPremiumLocked) &&
                    styles.reviewCardLocked,
                ]}
              >
                <View style={styles.cardMain}>
                  <View
                    style={[
                      styles.iconBox,
                      (!isProgressUnlocked || isPremiumLocked) &&
                        styles.iconBoxLocked,
                    ]}
                  >
                    <SKidsIcon
                      name={
                        isProgressUnlocked && hasContentAccess
                          ? getLessonIconName(lesson)
                          : 'parentLock'
                      }
                      size={68}
                    />
                  </View>

                  <View style={styles.cardText}>
                    <View style={styles.badgeRow}>
                      <KidBadge
                        tone={
                          isPremiumLocked
                            ? 'alert'
                            : isPending
                            ? 'alert'
                            : isProgressUnlocked
                            ? 'teal'
                            : 'sky'
                        }
                      >
                        {statusLabel}
                      </KidBadge>
                      <KidBadge tone="sun">
                        {completedSceneCount}/{lesson.scenes.length}
                      </KidBadge>
                    </View>
                    <Text style={styles.lessonTitle}>{lessonTitle}</Text>
                    <Text style={styles.gameTitle}>{reviewGameTitle}</Text>
                  </View>

                  <View
                    style={[
                      styles.actionBox,
                      (!isProgressUnlocked || isPremiumLocked) &&
                        styles.actionBoxLocked,
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
