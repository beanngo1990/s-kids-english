import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppCard } from '../components/AppCard';
import { KidBadge } from '../components/KidBadge';
import { ProgressStars } from '../components/ProgressStars';
import { Screen } from '../components/Screen';
import { SKidsIcon } from '../components/SKidsIcon';
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
import { useI18n, useSavedAppLanguage } from '../i18n';
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

  const handleSelectTheme = async (theme: LessonTheme) => {
    if (savingThemeId) {
      return;
    }

    const latestMonetizationSnapshot = getMonetizationSnapshot();
    if (!canAccessAnyThemeLesson(theme, latestMonetizationSnapshot)) {
      if (latestMonetizationSnapshot.status === 'initializing') {
        Alert.alert(t('premium.kidLockedTitle'), t('premium.resolving'));
        return;
      }

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
        <KidBadge tone="teal">{t('themeLibrary.badge')}</KidBadge>
        <Text style={styles.title}>{t('themeLibrary.title')}</Text>
        <Text style={styles.subtitle}>{t('themeLibrary.subtitle')}</Text>
        <View style={styles.parentNote}>
          <KidBadge tone="sun">{t('themeLibrary.parentNote')}</KidBadge>
          <Text style={styles.parentNoteText}>
            {t('themeLibrary.parentNoteDescription')}
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        {themes.map(theme => {
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
                  <View style={styles.themeIcon}>
                    <Text style={styles.themeEmoji}>
                      {theme.thumbnailEmoji}
                    </Text>
                    {isPremiumLocked ? (
                      <View style={styles.themeLockBadge}>
                        <SKidsIcon name="parentLock" size={24} />
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.themeText}>
                    <View style={styles.badgeRow}>
                      <KidBadge tone={isActive ? 'teal' : 'sky'}>
                        {isActive
                          ? t('themeLibrary.activeStatus')
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
                  <ProgressStars
                    completed={themeProgress.completed}
                    total={themeProgress.total}
                  />
                  <Text style={styles.progressText}>
                    {themeProgress.completed}/{themeProgress.total}{' '}
                    {t('themeLibrary.stations')}
                  </Text>
                </View>

                <View
                  style={[styles.actionRow, isActive && styles.actionRowActive]}
                >
                  <Text
                    style={[
                      styles.actionText,
                      isActive && styles.actionTextActive,
                    ]}
                  >
                    {isSavingThisTheme
                      ? t('themeLibrary.savingAction')
                      : actionLabel}
                  </Text>
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.actionHint,
                      isActive && styles.actionHintActive,
                    ]}
                  >
                    {activeDescription}
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
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  actionHint: {
    color: colors.textSoft,
    flex: 1,
    ...typography.caption,
  },
  actionHintActive: {
    color: colors.primaryDark,
  },
  actionRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderWarm,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionRowActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  actionText: {
    color: colors.text,
    ...typography.caption,
    fontWeight: '900',
  },
  actionTextActive: {
    color: colors.primaryDark,
  },
  parentNote: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  parentNoteText: {
    color: colors.text,
    ...typography.caption,
  },
  progressRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderWarm,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  progressText: {
    color: colors.textSoft,
    ...typography.caption,
  },
  subtitle: {
    color: colors.textSoft,
    ...typography.body,
  },
  themeCard: {
    backgroundColor: colors.cream,
    borderColor: colors.borderWarm,
    gap: spacing.md,
  },
  themeCardActive: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  themeCardPremiumLocked: {
    borderColor: colors.border,
  },
  themeDescription: {
    color: colors.textSoft,
    ...typography.body,
  },
  themeEmoji: {
    fontSize: 48,
    lineHeight: 58,
    textAlign: 'center',
  },
  themeIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 3,
    height: 86,
    justifyContent: 'center',
    position: 'relative',
    width: 86,
    ...shadows.soft,
  },
  themeLockBadge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 2,
    bottom: -6,
    height: 34,
    justifyContent: 'center',
    position: 'absolute',
    right: -6,
    width: 34,
  },
  themePressable: {
    borderRadius: radius.xl,
  },
  themeText: {
    flex: 1,
    gap: spacing.xs,
  },
  themeTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  themeTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    ...typography.title,
  },
}));
