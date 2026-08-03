import React, { useMemo } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { AppCard } from './AppCard';
import { KidBadge } from './KidBadge';
import { SKidsIcon } from './SKidsIcon';
import { playTapSound, speakVi, speakWord } from '../engine/AudioManager';
import {
  getKidLockAudioPrompt,
  type KidLockReason,
} from '../data/kidLockAudioPrompts';
import { lessons } from '../data/lessons';
import { DEFAULT_THEME_ID, themes } from '../data/themes';
import { canAccessReview } from '../engine/ContentAccessPolicy';
import {
  getMonetizationSnapshot,
  useMonetizationSnapshot,
} from '../engine/MonetizationManager';
import {
  getLocalizedLessonTitle,
  getLocalizedReviewGameTitle,
  getLocalizedThemeTitle,
} from '../i18n/domainCopy';
import { useI18n, useSavedPromptLanguage } from '../i18n';
import type { AppLanguage } from '../i18n/types';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Lesson } from '../types/lesson';
import { getLessonIconName } from '../utils/lessonIcons';
import {
  getCompletedSceneCount,
  isLessonComplete,
} from '../utils/lessonProgress';

type KidPlayPanelProps = {
  activeThemeId?: string;
  appLanguage: AppLanguage;
  completedReviewGameIds: Set<string>;
  completedSceneIds: Set<string>;
  journeyMode?: 'guided' | 'free';
  onOpenPremium: (lessonId: string) => void;
  onOpenReviewGame: (lessonId: string) => void;
  visibleLessonIds?: string[];
};

export function KidPlayPanel({
  activeThemeId = DEFAULT_THEME_ID,
  appLanguage,
  completedReviewGameIds,
  completedSceneIds,
  journeyMode = 'guided',
  onOpenPremium,
  onOpenReviewGame,
  visibleLessonIds,
}: KidPlayPanelProps) {
  useThemeSync();
  const t = useI18n();
  const monetizationSnapshot = useMonetizationSnapshot();

  const activeTheme = useMemo(
    () => themes.find(theme => theme.id === activeThemeId) ?? themes[0],
    [activeThemeId],
  );

  const activeThemeTitle = useMemo(
    () => getLocalizedThemeTitle(activeTheme, appLanguage),
    [activeTheme, appLanguage],
  );

  const activeThemeLessonIds = useMemo(
    () => new Set(activeTheme.lessonIds),
    [activeTheme],
  );

  const reviewLessons = useMemo(() => {
    const themeLessons = lessons.filter(
      lesson =>
        activeThemeLessonIds.has(lesson.id) &&
        lesson.reviewGame &&
        (!visibleLessonIds || visibleLessonIds.includes(lesson.id)),
    );
    if (themeLessons.length > 0) {
      return themeLessons;
    }
    const allVisible = lessons.filter(
      lesson =>
        lesson.reviewGame &&
        (!visibleLessonIds || visibleLessonIds.includes(lesson.id)),
    );
    return allVisible.length > 0
      ? allVisible
      : lessons.filter(lesson => lesson.reviewGame);
  }, [activeThemeLessonIds, visibleLessonIds]);

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

  const promptLanguage = useSavedPromptLanguage();

  const playKidLockPrompt = (reason: KidLockReason) => {
    playTapSound().catch(() => undefined);
    const message = getKidLockAudioPrompt(reason, promptLanguage);
    const speech =
      promptLanguage === 'en' ? speakWord(message) : speakVi(message);
    speech.catch(() => undefined);
  };

  const handleOpenReviewGame = (
    lessonId: string,
    isProgressUnlocked: boolean,
  ) => {
    const latestMonetizationSnapshot = getMonetizationSnapshot();
    if (!canAccessReview(lessonId, latestMonetizationSnapshot)) {
      if (latestMonetizationSnapshot.status === 'initializing') {
        playKidLockPrompt('resolving');
        Alert.alert(t('premium.kidLockedTitle'), t('premium.resolving'));
        return;
      }

      playKidLockPrompt('premium');
      Alert.alert(t('premium.kidLockedTitle'), t('premium.kidLockedText'), [
        { style: 'cancel', text: t('common.close') },
        {
          onPress: () => onOpenPremium(lessonId),
          text: t('premium.askParent'),
        },
      ]);
      return;
    }

    if (!isProgressUnlocked) {
      playKidLockPrompt('progress');
      Alert.alert(
        t('home.progressLockedTitle'),
        t('home.progressLockedText'),
        [{ style: 'cancel', text: t('common.close') }],
      );
      return;
    }

    onOpenReviewGame(lessonId);
  };

  return (
    <>
      <View style={styles.header}>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Góc trò chơi</Text>
          <Text style={styles.headerSubtitle}>
            {t('playPanel.themeSubtitle', { theme: activeThemeTitle })}
          </Text>
        </View>
        <KidBadge tone={pendingReviewLesson ? 'alert' : 'sun'}>
          {pendingReviewLesson
            ? `🎮 ${t('playPanel.oneGame')}`
            : `⭐ ${unlockedCount}/${reviewLessons.length}`}
        </KidBadge>
      </View>

      <View style={styles.list}>
        {orderedReviewLessons.map((lesson, index) => {
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

          const iconToneStyle = getGameIconTone(index);

          return (
            <Pressable
              accessibilityLabel={`${lessonTitle}. ${reviewGameTitle}. ${statusLabel}. ${completedSceneCount}/${
                lesson.scenes.length
              } ${t('playPanel.scene')}.`}
              accessibilityRole="button"
              accessibilityState={{ disabled: false }}
              key={lesson.id}
              onPress={() =>
                handleOpenReviewGame(lesson.id, isProgressUnlocked)
              }
              style={({ pressed }) => [
                styles.cardPressable,
                pressed && styles.pressed,
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
                      iconToneStyle,
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
                      size={54}
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
                        {completedSceneCount}/{lesson.scenes.length} bài
                      </KidBadge>
                    </View>
                    <Text style={styles.lessonTitle}>{lessonTitle}</Text>
                    <Text style={styles.gameTitle}>{reviewGameTitle}</Text>
                  </View>

                  <View
                    style={[
                      styles.playButton,
                      isPending && styles.playButtonPending,
                      isCompleted && styles.playButtonCompleted,
                      (!isProgressUnlocked || isPremiumLocked) &&
                        styles.playButtonLocked,
                    ]}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.playButtonText,
                        (isPending ||
                          (isProgressUnlocked &&
                            !isCompleted &&
                            hasContentAccess)) &&
                          styles.playButtonTextActive,
                        (!isProgressUnlocked || isPremiumLocked) &&
                          styles.playButtonTextLocked,
                      ]}
                    >
                      {!isProgressUnlocked || isPremiumLocked
                        ? `🔒 Khóa`
                        : isPending
                        ? `🎮 Chơi`
                        : isCompleted
                        ? `🔄 Lại`
                        : `🎮 Chơi`}
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

function getGameIconTone(index: number) {
  const tones = [
    styles.iconBoxSun,
    styles.iconBoxMint,
    styles.iconBoxSky,
  ];
  return tones[index % tones.length];
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
    gap: spacing.sm,
  },
  cardPressable: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  cardText: {
    flex: 1,
    gap: 3,
  },
  gameTitle: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingTop: spacing.xxs,
  },
  headerSubtitle: {
    color: colors.textSoft,
    fontSize: 12,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 26,
  },
  headerTitleBox: {
    flex: 1,
    gap: 2,
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 2.5,
    height: 72,
    justifyContent: 'center',
    width: 72,
    ...shadows.soft,
  },
  iconBoxLocked: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
  },
  iconBoxMint: {
    backgroundColor: '#E6FAF0',
    borderColor: '#A1EBC6',
  },
  iconBoxSky: {
    backgroundColor: '#EBF8FF',
    borderColor: '#BCE5FF',
  },
  iconBoxSun: {
    backgroundColor: '#FFF8DB',
    borderColor: '#FCE082',
  },
  lessonTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 21,
  },
  list: {
    gap: spacing.md,
  },
  playButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 42,
    justifyContent: 'center',
    minWidth: 72,
    paddingHorizontal: spacing.sm,
    ...shadows.soft,
  },
  playButtonCompleted: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
  },
  playButtonLocked: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
  },
  playButtonPending: {
    backgroundColor: colors.accent,
    borderColor: colors.accentDark,
  },
  playButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  playButtonTextActive: {
    color: colors.white,
  },
  playButtonTextLocked: {
    color: colors.textSoft,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    gap: spacing.xs,
    padding: spacing.md,
    ...shadows.soft,
  },
  reviewCardLocked: {
    opacity: 0.7,
  },
  reviewCardPending: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.secondary,
    borderWidth: 2,
    ...shadows.floating,
  },
  reviewCardUnlocked: {
    borderColor: colors.primary,
  },
}));
