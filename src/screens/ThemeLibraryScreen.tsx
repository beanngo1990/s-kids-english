import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppCard } from '../components/AppCard';
import { KidBadge } from '../components/KidBadge';
import { Screen } from '../components/Screen';
import { SKidsIcon } from '../components/SKidsIcon';
import { playTapSound, speakVi, speakWord } from '../engine/AudioManager';
import {
  getKidLockAudioPrompt,
  type KidLockReason,
} from '../data/kidLockAudioPrompts';
import { lessons } from '../data/lessons';
import { DEFAULT_THEME_ID, themes } from '../data/themes';
import { canAccessLesson } from '../engine/ContentAccessPolicy';
import {
  getMonetizationSnapshot,
  useMonetizationSnapshot,
} from '../engine/MonetizationManager';
import { getParentSettings } from '../engine/ParentSettingsManager';
import {
  getProgress,
  saveActiveThemeId,
  type LocalProgress,
} from '../engine/ProgressManager';
import { useI18n, useSavedAppLanguage, useSavedPromptLanguage } from '../i18n';
import {
  getLocalizedThemeDescription,
  getLocalizedThemeTitle,
} from '../i18n/domainCopy';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import type { Lesson, LessonTheme } from '../types/lesson';
import type { RootStackParamList } from '../types/navigation';
import { isSceneProgressComplete } from '../utils/lessonProgress';

type Props = NativeStackScreenProps<RootStackParamList, 'ThemeLibrary'>;

export function ThemeLibraryScreen({ navigation }: Props) {
  useThemeSync();
  const t = useI18n();
  const appLanguage = useSavedAppLanguage();
  const monetizationSnapshot = useMonetizationSnapshot();
  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const [savingThemeId, setSavingThemeId] = useState<string | null>(null);
  const [visibleLessonIds, setVisibleLessonIds] = useState<
    string[] | undefined
  >(undefined);
  const activeThemeId = progress?.activeThemeId ?? DEFAULT_THEME_ID;
  const completedSceneIds = useMemo(
    () => new Set(progress?.completedSceneIds ?? []),
    [progress],
  );

  useEffect(() => {
    getProgress()
      .then(setProgress)
      .catch(() => setProgress(null));
    getParentSettings()
      .then(settings => {
        setVisibleLessonIds(settings.visibleLessonIds);
      })
      .catch(() => undefined);
  }, []);

  const promptLanguage = useSavedPromptLanguage();

  const playKidLockPrompt = (reason: KidLockReason) => {
    playTapSound().catch(() => undefined);
    const message = getKidLockAudioPrompt(reason, promptLanguage);
    const speech =
      promptLanguage === 'en' ? speakWord(message) : speakVi(message);
    speech.catch(() => undefined);
  };

  const handleSelectTheme = async (theme: LessonTheme) => {
    if (savingThemeId) {
      return;
    }

    const latestMonetizationSnapshot = getMonetizationSnapshot();
    if (!canAccessAnyThemeLesson(theme, latestMonetizationSnapshot)) {
      if (latestMonetizationSnapshot.status === 'initializing') {
        playKidLockPrompt('resolving');
        Alert.alert(t('premium.kidLockedTitle'), t('premium.resolving'));
        return;
      }

      playKidLockPrompt('premium');
      Alert.alert(t('premium.kidLockedTitle'), t('premium.kidLockedText'), [
        { style: 'cancel', text: t('common.close') },
        {
          onPress: () =>
            navigation.navigate('Parent', {
              intent: 'premium',
              lessonId: theme.lessonIds[0],
            }),
          text: t('premium.askParent'),
        },
      ]);
      return;
    }

    const themeId = theme.id;
    if (themeId === activeThemeId) {
      navigation.navigate('Home');
      return;
    }

    setSavingThemeId(themeId);
    try {
      const nextProgress = await saveActiveThemeId(themeId);
      setProgress(nextProgress);
      navigation.navigate('Home');
    } catch {
      setSavingThemeId(null);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>{t('themeLibrary.title')}</Text>
        <Text style={styles.subtitle}>{t('themeLibrary.subtitle')}</Text>
        <View style={styles.parentNote}>
          <View style={styles.parentNoteHeader}>
            <Text style={styles.parentNoteIcon}>💡</Text>

            <Text style={styles.parentNoteTitle}>
              {t('themeLibrary.parentNote')}
            </Text>
          </View>
          <Text style={styles.parentNoteText}>
            {t('themeLibrary.parentNoteDescription')}
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        {themes.map((theme, index) => {
          const themeTitle = getLocalizedThemeTitle(theme, appLanguage);
          const themeDescription = getLocalizedThemeDescription(
            theme,
            appLanguage,
          );
          const themeProgress = getThemeProgress(
            theme,
            completedSceneIds,
            visibleLessonIds,
          );
          const isActive = activeThemeId === theme.id;
          const isSavingThisTheme = savingThemeId === theme.id;
          const isPremiumLocked = !canAccessAnyThemeLesson(
            theme,
            monetizationSnapshot,
          );
          const isResolvingPremium =
            isPremiumLocked && monetizationSnapshot.status === 'initializing';
          const actionLabel = isActive
            ? t('themeLibrary.continueOnMap')
            : t('themeLibrary.chooseThisTheme');
          const activeDescription = isActive
            ? t('themeLibrary.activeDescription')
            : t('themeLibrary.inactiveDescription');

          const progressPercent =
            themeProgress.total > 0
              ? Math.min(
                  100,
                  Math.max(
                    0,
                    Math.round(
                      (themeProgress.completed / themeProgress.total) * 100,
                    ),
                  ),
                )
              : 0;

          const themeIconToneStyle = getThemeIconTone(theme.id, index);

          return (
            <Pressable
              accessibilityHint={
                isPremiumLocked
                  ? t(
                      isResolvingPremium
                        ? 'premium.resolving'
                        : 'premium.kidLockedText',
                    )
                  : activeDescription
              }
              accessibilityLabel={`${actionLabel}: ${themeTitle}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              disabled={Boolean(savingThemeId)}
              key={theme.id}
              onPress={() => handleSelectTheme(theme)}
              style={({ pressed }) => [
                styles.themePressable,
                pressed && !savingThemeId && styles.pressed,
                savingThemeId && !isSavingThisTheme && styles.disabled,
              ]}
            >
              <AppCard
                style={[
                  styles.themeCard,
                  isActive && styles.themeCardActive,
                  isPremiumLocked && styles.themeCardPremiumLocked,
                ]}
              >
                <View style={styles.themeTopRow}>
                  <View style={[styles.themeIcon, themeIconToneStyle]}>
                    {theme.iconName ? (
                      <SKidsIcon name={theme.iconName} size={62} />
                    ) : (
                      <Text style={styles.themeEmoji}>
                        {theme.thumbnailEmoji}
                      </Text>
                    )}
                    {isPremiumLocked ? (
                      <View style={styles.themeLockBadge}>
                        <SKidsIcon name="parentLock" size={20} />
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.themeText}>
                    <View style={styles.badgeRow}>
                      <KidBadge tone={isActive ? 'teal' : 'sky'}>
                        {isActive
                          ? `🚀 ${t('themeLibrary.activeStatus')}`
                          : t('themeLibrary.themeStatus')}
                      </KidBadge>
                      {isSavingThisTheme ? (
                        <KidBadge tone="sun">
                          {t('themeLibrary.savingStatus')}
                        </KidBadge>
                      ) : null}
                      {isPremiumLocked ? (
                        <KidBadge tone="alert">
                          {isResolvingPremium
                            ? t('premium.resolving')
                            : t('premium.askParent')}
                        </KidBadge>
                      ) : null}
                    </View>
                    <Text style={styles.themeTitle}>{themeTitle}</Text>
                    {themeDescription ? (
                      <Text style={styles.themeDescription}>
                        {themeDescription}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.progressRow}>
                  <View style={styles.progressBadge}>
                    <Text style={styles.progressStarIcon}>⭐</Text>
                    <Text style={styles.progressBadgeText}>
                      {themeProgress.completed}/{themeProgress.total}{' '}
                      {t('themeLibrary.stations')}
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${progressPercent}%` },
                        isActive && styles.progressFillActive,
                      ]}
                    />
                  </View>
                </View>

                <View
                  style={[
                    styles.actionButton,
                    isActive && styles.actionButtonActive,
                    isPremiumLocked && styles.actionButtonLocked,
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.actionButtonText,
                      isActive && styles.actionButtonTextActive,
                      isPremiumLocked && styles.actionButtonTextLocked,
                    ]}
                  >
                    {isSavingThisTheme
                      ? t('themeLibrary.savingAction')
                      : isPremiumLocked
                      ? `🔒 ${t('premium.askParent')}`
                      : isActive
                      ? `🚀 ${actionLabel}`
                      : `✨ ${actionLabel}`}
                  </Text>
                </View>
              </AppCard>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

function getThemeIconTone(themeId: string, index: number) {
  if (themeId.includes('ngay') || themeId.includes('day')) {
    return styles.themeIconSun;
  }
  if (themeId.includes('ngoai') || themeId.includes('explore')) {
    return styles.themeIconMint;
  }
  if (themeId.includes('cam-xuc') || themeId.includes('emotion')) {
    return styles.themeIconLavender;
  }
  const tones = [
    styles.themeIconSun,
    styles.themeIconMint,
    styles.themeIconLavender,
  ];
  return tones[index % tones.length];
}

function canAccessAnyThemeLesson(
  theme: LessonTheme,
  monetizationSnapshot: ReturnType<typeof getMonetizationSnapshot>,
) {
  return theme.lessonIds.some(lessonId =>
    canAccessLesson(lessonId, monetizationSnapshot),
  );
}

function getThemeProgress(
  theme: LessonTheme,
  completedSceneIds: Set<string>,
  visibleLessonIds: string[] | undefined,
) {
  const themeLessons = theme.lessonIds
    .map(lessonId => lessons.find(lesson => lesson.id === lessonId))
    .filter((lesson): lesson is Lesson => {
      if (!lesson) {
        return false;
      }
      if (visibleLessonIds && !visibleLessonIds.includes(lesson.id)) {
        return false;
      }
      return true;
    });
  const total = themeLessons.reduce(
    (sum, lesson) => sum + lesson.scenes.length,
    0,
  );
  const completed = themeLessons.reduce(
    (sum, lesson) =>
      sum +
      lesson.scenes.filter(scene =>
        isSceneProgressComplete(completedSceneIds, lesson.id, scene.id),
      ).length,
    0,
  );

  return { completed, total };
}

const styles = createThemedStyles(() => ({
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderColor: colors.secondaryDark,
    borderRadius: radius.pill,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    ...shadows.soft,
  },
  actionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  actionButtonLocked: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  actionButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },
  actionButtonTextActive: {
    color: colors.white,
  },
  actionButtonTextLocked: {
    color: colors.textSoft,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  disabled: {
    opacity: 0.55,
  },
  grid: {
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.md,
    paddingTop: spacing.xxs,
  },
  parentNote: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    gap: 4,
    marginTop: spacing.xs,
    padding: spacing.sm,
  },
  parentNoteHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  parentNoteIcon: {
    fontSize: 14,
  },
  parentNoteText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 16,
  },
  parentNoteTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  progressBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  progressBadgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  progressFill: {
    backgroundColor: colors.secondary,
    borderRadius: radius.pill,
    height: '100%',
  },
  progressFillActive: {
    backgroundColor: colors.primary,
  },
  progressRow: {
    alignItems: 'center',
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  progressStarIcon: {
    fontSize: 14,
  },
  progressTrack: {
    backgroundColor: colors.backgroundCool,
    borderRadius: radius.pill,
    flex: 1,
    height: 8,
    overflow: 'hidden',
  },
  subtitle: {
    color: colors.textSoft,
    ...typography.body,
  },
  themeCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    gap: spacing.sm,
    padding: spacing.md,
    ...shadows.soft,
  },
  themeCardActive: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.primary,
    borderWidth: 2.5,
    ...shadows.floating,
  },
  themeCardPremiumLocked: {
    borderColor: colors.border,
  },
  themeDescription: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 17,
  },
  themeEmoji: {
    fontSize: 42,
    lineHeight: 48,
    textAlign: 'center',
  },
  themeIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 3,
    height: 76,
    justifyContent: 'center',
    position: 'relative',
    width: 76,
    ...shadows.soft,
  },
  themeIconLavender: {
    backgroundColor: '#F3E8FF',
    borderColor: '#D8B4FE',
  },
  themeIconMint: {
    backgroundColor: '#E6FAF0',
    borderColor: '#A1EBC6',
  },
  themeIconSun: {
    backgroundColor: '#FFF8DB',
    borderColor: '#FCE082',
  },
  themeLockBadge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 2,
    bottom: -4,
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    right: -4,
    width: 30,
  },
  themePressable: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  themeText: {
    flex: 1,
    gap: 4,
  },
  themeTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 22,
  },
  themeTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 28,
  },
}));
