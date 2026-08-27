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
import { getLocalizedThemeTitle } from '../i18n/domainCopy';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { useResponsiveLayout } from '../theme/responsive';
import { radius, spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import type { Lesson, LessonTheme } from '../types/lesson';
import type { RootStackParamList } from '../types/navigation';
import { isSceneProgressComplete } from '../utils/lessonProgress';

type Props = NativeStackScreenProps<RootStackParamList, 'ThemeLibrary'>;

export function ThemeLibraryScreen({ navigation }: Props) {
  useThemeSync();
  const responsiveLayout = useResponsiveLayout();
  const t = useI18n();
  const appLanguage = useSavedAppLanguage();
  const monetizationSnapshot = useMonetizationSnapshot();
  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const [savingThemeId, setSavingThemeId] = useState<string | null>(null);
  const [visibleLessonIds, setVisibleLessonIds] = useState<
    string[] | undefined
  >(undefined);
  const [disabledThemeIds, setDisabledThemeIds] = useState<string[]>([]);
  const disabledThemeIdSet = useMemo(
    () => new Set(disabledThemeIds),
    [disabledThemeIds],
  );
  const enabledThemes = useMemo(
    () => themes.filter(theme => !disabledThemeIdSet.has(theme.id)),
    [disabledThemeIdSet],
  );
  const storedActiveThemeId = progress?.activeThemeId ?? DEFAULT_THEME_ID;
  const activeTheme =
    enabledThemes.find(theme => theme.id === storedActiveThemeId) ??
    enabledThemes[0] ??
    themes[0];
  const activeThemeId = activeTheme.id;
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
        setDisabledThemeIds(settings.disabledThemeIds ?? []);
        setVisibleLessonIds(settings.visibleLessonIds);
      })
      .catch(() => undefined);
  }, []);

  const promptLanguage = useSavedPromptLanguage();
  const columnCount = responsiveLayout.isTablet ? 3 : 2;
  const contentWidth =
    Math.min(responsiveLayout.width, responsiveLayout.contentMaxWidth) -
    responsiveLayout.screenPadding * 2;
  const themeCardWidth = Math.floor(
    (contentWidth - spacing.sm * (columnCount - 1)) / columnCount,
  );

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

  const activeThemeIndex = themes.findIndex(
    theme => theme.id === activeTheme.id,
  );
  const activeThemeTitle = getLocalizedThemeTitle(activeTheme, appLanguage);
  const activeThemeProgress = getThemeProgress(
    activeTheme,
    completedSceneIds,
    visibleLessonIds,
  );
  const activeThemeComplete = isThemeProgressComplete(activeThemeProgress);
  const activeThemeStarted = activeThemeProgress.completed > 0;
  const activeThemeLocked = !canAccessAnyThemeLesson(
    activeTheme,
    monetizationSnapshot,
  );
  const activeThemeResolving =
    activeThemeLocked && monetizationSnapshot.status === 'initializing';
  const activeActionLabel = activeThemeLocked
    ? activeThemeResolving
      ? t('premium.resolving')
      : t('premium.askParent')
    : activeThemeComplete
    ? t('themeLibrary.revisitMap')
    : activeThemeStarted
    ? t('themeLibrary.continueOnMap')
    : t('themeLibrary.startJourney');

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>{t('themeLibrary.title')}</Text>
      </View>

      <View style={styles.currentSection}>
        <Text style={styles.sectionTitle}>
          {t('themeLibrary.currentSection')}
        </Text>
        <Pressable
          accessibilityHint={
            activeThemeLocked
              ? t(
                  activeThemeResolving
                    ? 'premium.resolving'
                    : 'premium.kidLockedText',
                )
              : t('themeLibrary.activeDescription')
          }
          accessibilityLabel={`${activeActionLabel}: ${activeThemeTitle}`}
          accessibilityRole="button"
          accessibilityState={{
            disabled: Boolean(savingThemeId),
            selected: true,
          }}
          disabled={Boolean(savingThemeId)}
          onPress={() => handleSelectTheme(activeTheme)}
          style={({ pressed }) => [
            styles.currentPressable,
            pressed && styles.pressed,
          ]}
          testID="theme-library-current"
        >
          <AppCard
            style={[
              styles.currentCard,
              activeThemeLocked && styles.currentCardLocked,
            ]}
          >
            <View style={styles.currentTopRow}>
              <View
                style={[
                  styles.currentIcon,
                  getThemeIconTone(activeTheme.id, activeThemeIndex),
                ]}
              >
                {activeTheme.iconName ? (
                  <SKidsIcon name={activeTheme.iconName} size={70} />
                ) : (
                  <Text style={styles.currentEmoji}>
                    {activeTheme.thumbnailEmoji}
                  </Text>
                )}
                {activeThemeLocked ? (
                  <View style={styles.currentLockBadge}>
                    <SKidsIcon name="parentLock" size={18} />
                  </View>
                ) : null}
              </View>

              <View style={styles.currentText}>
                <KidBadge
                  style={styles.currentBadge}
                  tone={
                    activeThemeLocked
                      ? 'alert'
                      : activeThemeComplete
                      ? 'sun'
                      : 'teal'
                  }
                >
                  {activeThemeLocked
                    ? activeThemeResolving
                      ? t('premium.resolving')
                      : t('premium.askParent')
                    : activeThemeComplete
                    ? `⭐ ${t('themeLibrary.completedStatus')}`
                    : `🚀 ${t('themeLibrary.activeStatus')}`}
                </KidBadge>
                <Text numberOfLines={2} style={styles.currentTitle}>
                  {activeThemeTitle}
                </Text>
              </View>
            </View>

            <View style={styles.currentProgressRow}>
              <Text style={styles.currentProgressText}>
                ⭐{' '}
                {t('themeLibrary.stationProgress', {
                  completed: String(activeThemeProgress.completed),
                  total: String(activeThemeProgress.total),
                })}
              </Text>
              <View style={styles.currentProgressTrack}>
                <View
                  style={[
                    styles.currentProgressFill,
                    {
                      width: `${getThemeProgressPercent(activeThemeProgress)}%`,
                    },
                  ]}
                />
              </View>
            </View>

            <View
              style={[
                styles.actionButton,
                activeThemeLocked && styles.actionButtonLocked,
              ]}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.actionButtonText,
                  activeThemeLocked && styles.actionButtonTextLocked,
                ]}
              >
                {activeThemeLocked ? '🔒 ' : activeThemeComplete ? '↻ ' : '🚀 '}
                {activeActionLabel}
              </Text>
            </View>
          </AppCard>
        </Pressable>
      </View>

      <View style={styles.exploreHeader}>
        <Text style={styles.sectionTitle}>
          {t('themeLibrary.exploreSection')}
        </Text>
        <Text style={styles.exploreHint}>{t('themeLibrary.exploreHint')}</Text>
      </View>

      <View style={styles.grid}>
        {enabledThemes
          .filter(theme => theme.id !== activeTheme.id)
          .map(theme => {
            const themeIndex = themes.findIndex(item => item.id === theme.id);
            const themeTitle = getLocalizedThemeTitle(theme, appLanguage);
            const themeProgress = getThemeProgress(
              theme,
              completedSceneIds,
              visibleLessonIds,
            );
            const isComplete = isThemeProgressComplete(themeProgress);
            const isSavingThisTheme = savingThemeId === theme.id;
            const isPremiumLocked = !canAccessAnyThemeLesson(
              theme,
              monetizationSnapshot,
            );
            const isResolvingPremium =
              isPremiumLocked && monetizationSnapshot.status === 'initializing';
            const stateLabel = isPremiumLocked
              ? isResolvingPremium
                ? t('premium.resolving')
                : t('premium.askParent')
              : isComplete
              ? t('themeLibrary.completedShortStatus')
              : t('themeLibrary.stationProgress', {
                  completed: String(themeProgress.completed),
                  total: String(themeProgress.total),
                });

            return (
              <Pressable
                accessibilityHint={
                  isPremiumLocked
                    ? t(
                        isResolvingPremium
                          ? 'premium.resolving'
                          : 'premium.kidLockedText',
                      )
                    : t('themeLibrary.inactiveDescription')
                }
                accessibilityLabel={`${themeTitle}. ${stateLabel}`}
                accessibilityRole="button"
                accessibilityState={{
                  busy: isSavingThisTheme,
                  disabled: Boolean(savingThemeId),
                }}
                disabled={Boolean(savingThemeId)}
                key={theme.id}
                onPress={() => handleSelectTheme(theme)}
                style={({ pressed }) => [
                  styles.themePressable,
                  { width: themeCardWidth },
                  pressed && !savingThemeId && styles.pressed,
                  savingThemeId && !isSavingThisTheme && styles.disabled,
                ]}
                testID={`theme-library-card-${theme.id}`}
              >
                <AppCard
                  style={[
                    styles.themeCard,
                    isPremiumLocked && styles.themeCardPremiumLocked,
                  ]}
                >
                  <View
                    style={[
                      styles.themeIcon,
                      getThemeIconTone(theme.id, themeIndex),
                    ]}
                  >
                    {theme.iconName ? (
                      <SKidsIcon name={theme.iconName} size={72} />
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

                  <Text numberOfLines={3} style={styles.themeTitle}>
                    {themeTitle}
                  </Text>

                  <View style={styles.themeFooter}>
                    <View style={styles.themeState}>
                      {isSavingThisTheme ? (
                        <Text style={styles.savingText}>
                          {t('themeLibrary.savingAction')}
                        </Text>
                      ) : isPremiumLocked ? (
                        <Text style={styles.lockedText} numberOfLines={1}>
                          🔒 {stateLabel}
                        </Text>
                      ) : isComplete ? (
                        <Text style={styles.completeText} numberOfLines={1}>
                          ⭐ {stateLabel}
                        </Text>
                      ) : (
                        <>
                          <Text style={styles.themeProgressText}>
                            {stateLabel}
                          </Text>
                          <View style={styles.themeProgressTrack}>
                            <View
                              style={[
                                styles.themeProgressFill,
                                {
                                  width: `${getThemeProgressPercent(
                                    themeProgress,
                                  )}%`,
                                },
                              ]}
                            />
                          </View>
                        </>
                      )}
                    </View>
                    <View
                      accessibilityElementsHidden
                      style={styles.arrowButton}
                    >
                      <Text style={styles.arrowText}>›</Text>
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
  return tones[Math.max(0, index) % tones.length];
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

function isThemeProgressComplete(progress: {
  completed: number;
  total: number;
}) {
  return progress.total > 0 && progress.completed >= progress.total;
}

function getThemeProgressPercent(progress: {
  completed: number;
  total: number;
}) {
  if (progress.total <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, Math.round((progress.completed / progress.total) * 100)),
  );
}

const styles = createThemedStyles(() => ({
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
    borderRadius: radius.pill,
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    ...shadows.soft,
  },
  actionButtonLocked: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  actionButtonTextLocked: {
    color: colors.textSoft,
  },
  arrowButton: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  arrowText: {
    color: colors.primaryDark,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 31,
    marginTop: -2,
  },
  completeText: {
    color: colors.secondaryDark,
    fontSize: 12,
    fontWeight: '900',
  },
  currentCard: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.primary,
    borderRadius: radius.xl,
    borderWidth: 2.5,
    gap: spacing.xs,
    padding: 14,
    ...shadows.floating,
  },
  currentCardLocked: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  currentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  currentEmoji: {
    fontSize: 42,
    lineHeight: 48,
    textAlign: 'center',
  },
  currentIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.outlineStrong,
    borderRadius: radius.xl,
    borderWidth: 3,
    height: 86,
    justifyContent: 'center',
    position: 'relative',
    width: 86,
    ...shadows.soft,
  },
  currentLockBadge: {
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
  currentPressable: {
    borderRadius: radius.xl,
  },
  currentProgressFill: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: '100%',
  },
  currentProgressRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 36,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  currentProgressText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  currentProgressTrack: {
    backgroundColor: colors.backgroundCool,
    borderRadius: radius.pill,
    flex: 1,
    height: 8,
    overflow: 'hidden',
  },
  currentSection: {
    gap: spacing.xs,
    marginBottom: 20,
  },
  currentText: {
    flex: 1,
    gap: spacing.xxs,
  },
  currentTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 24,
  },
  currentTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  disabled: {
    opacity: 0.55,
  },
  exploreHeader: {
    gap: spacing.xxs,
    marginBottom: spacing.sm,
  },
  exploreHint: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  grid: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  header: {
    marginBottom: spacing.md,
    paddingTop: spacing.xxs,
  },
  lockedText: {
    color: colors.alert,
    fontSize: 12,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  savingText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '900',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '900',
    lineHeight: 24,
  },
  themeCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    gap: spacing.xs,
    minHeight: 208,
    padding: 10,
    ...shadows.soft,
  },
  themeCardPremiumLocked: {
    backgroundColor: colors.surfaceBlue,
  },
  themeEmoji: {
    fontSize: 42,
    lineHeight: 48,
    textAlign: 'center',
  },
  themeFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    width: '100%',
  },
  themeIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.outlineStrong,
    borderRadius: radius.xl,
    borderWidth: 3,
    height: 84,
    justifyContent: 'center',
    position: 'relative',
    width: 84,
    ...shadows.soft,
  },
  themeIconLavender: {
    backgroundColor: colors.lavenderSoft,
    borderColor: colors.lavender,
  },
  themeIconMint: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  themeIconSun: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
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
  },
  themeProgressFill: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: '100%',
  },
  themeProgressText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '800',
  },
  themeProgressTrack: {
    backgroundColor: colors.backgroundCool,
    borderRadius: radius.pill,
    height: 6,
    overflow: 'hidden',
    width: '100%',
  },
  themeState: {
    flex: 1,
    gap: spacing.xxs,
  },
  themeTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 20,
    minHeight: 48,
    textAlign: 'center',
    width: '100%',
  },
  title: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '900',
    lineHeight: 30,
  },
}));
