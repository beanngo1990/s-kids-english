import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppCard } from '../components/AppCard';
import { KidBadge } from '../components/KidBadge';
import { ProgressStars } from '../components/ProgressStars';
import { Screen } from '../components/Screen';
import { SKidsIcon } from '../components/SKidsIcon';
import { playTapSound, speakVi, speakWord } from '../engine/AudioManager';
import {
  getKidLockAudioPrompt,
  type KidLockReason,
} from '../data/kidLockAudioPrompts';
import { lessons } from '../data/lessons';
import { canAccessLesson } from '../engine/ContentAccessPolicy';
import {
  getMonetizationSnapshot,
  useMonetizationSnapshot,
} from '../engine/MonetizationManager';
import { getParentSettings } from '../engine/ParentSettingsManager';
import { getProgress, type LocalProgress } from '../engine/ProgressManager';
import {
  getLocalizedLessonDescription,
  getLocalizedLessonTitle,
  getLocalizedSceneTitle,
} from '../i18n/domainCopy';
import { useI18n, useSavedAppLanguage, useSavedPromptLanguage } from '../i18n';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { RootStackParamList } from '../types/navigation';
import { getLessonIconName, getSceneIconName } from '../utils/lessonIcons';
import { isSceneProgressComplete } from '../utils/lessonProgress';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonList'>;

export function LessonListScreen({ navigation }: Props) {
  useThemeSync();
  const t = useI18n();
  const appLanguage = useSavedAppLanguage();
  const monetizationSnapshot = useMonetizationSnapshot();
  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const [visibleLessonIds, setVisibleLessonIds] = useState<
    string[] | undefined
  >(undefined);
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

  const handleOpenLesson = (lessonId: string) => {
    const latestMonetizationSnapshot = getMonetizationSnapshot();
    if (canAccessLesson(lessonId, latestMonetizationSnapshot)) {
      navigation.navigate('LessonPack', { lessonId });
      return;
    }

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
            lessonId,
          }),
        text: t('premium.askParent'),
      },
    ]);
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <KidBadge tone="teal">{t('lessonList.mapTitle')}</KidBadge>
        <Text style={styles.title}>{t('lessonList.title')}</Text>
        <Text style={styles.subtitle}>{t('lessonList.subtitle')}</Text>
      </View>

      <View style={styles.list}>
        {lessons
          .filter(
            lesson => !visibleLessonIds || visibleLessonIds.includes(lesson.id),
          )
          .map(lesson => {
            const lessonTitle = getLocalizedLessonTitle(lesson, appLanguage);
            const lessonDescription = getLocalizedLessonDescription(
              lesson,
              appLanguage,
            );
            const completedSceneCount = lesson.scenes.filter(scene =>
              isSceneProgressComplete(completedSceneIds, lesson.id, scene.id),
            ).length;
            const isPremiumLocked = !canAccessLesson(
              lesson.id,
              monetizationSnapshot,
            );
            const isResolvingPremium =
              isPremiumLocked && monetizationSnapshot.status === 'initializing';

            return (
              <Pressable
                accessibilityLabel={
                  isPremiumLocked
                    ? `${lessonTitle}. ${t(
                        isResolvingPremium
                          ? 'premium.resolving'
                          : 'premium.kidLockedTitle',
                      )}`
                    : lessonTitle
                }
                accessibilityRole="button"
                key={lesson.id}
                onPress={() => handleOpenLesson(lesson.id)}
                style={({ pressed }) => [
                  styles.lessonPressable,
                  pressed && styles.pressed,
                ]}
              >
                <AppCard
                  style={[
                    styles.lessonCard,
                    isPremiumLocked && styles.lessonCardPremiumLocked,
                  ]}
                >
                  <View style={styles.lessonTopRow}>
                    <View style={styles.lessonIcon}>
                      <SKidsIcon name={getLessonIconName(lesson)} size={74} />
                      {isPremiumLocked ? (
                        <View style={styles.lessonLockBadge}>
                          <SKidsIcon name="parentLock" size={24} />
                        </View>
                      ) : null}
                    </View>
                    <View style={styles.lessonText}>
                      <View style={styles.lessonBadgeRow}>
                        <KidBadge tone="sun">{lesson.ageRange.label}</KidBadge>
                        <KidBadge tone="sky">
                          {t('lessonList.stationCount', {
                            count: String(lesson.scenes.length),
                          })}
                        </KidBadge>
                        {isPremiumLocked ? (
                          <KidBadge tone="alert">
                            {isResolvingPremium
                              ? t('premium.resolving')
                              : t('premium.askParent')}
                          </KidBadge>
                        ) : null}
                      </View>
                      <Text style={styles.lessonTitle}>{lessonTitle}</Text>
                      <Text style={styles.lessonDescription}>
                        {lessonDescription}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.progressRow}>
                    <ProgressStars
                      completed={completedSceneCount}
                      total={lesson.scenes.length}
                    />
                    <Text style={styles.progressText}>
                      {t('lessonList.sceneProgress', {
                        completed: String(completedSceneCount),
                        total: String(lesson.scenes.length),
                      })}
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
                            <SKidsIcon
                              name={getSceneIconName(scene)}
                              size={48}
                            />
                          </View>
                          <Text style={styles.stopTitle}>
                            {getLocalizedSceneTitle(scene, appLanguage)}
                          </Text>
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

const styles = createThemedStyles(() => ({
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
  lessonCardPremiumLocked: {
    borderColor: colors.border,
  },
  lessonDescription: {
    color: colors.textSoft,
    ...typography.body,
  },
  lessonIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 2,
    height: 76,
    justifyContent: 'center',
    position: 'relative',
    width: 76,
  },
  lessonLockBadge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 2,
    bottom: -8,
    height: 34,
    justifyContent: 'center',
    position: 'absolute',
    right: -8,
    width: 34,
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
    backgroundColor: colors.surface,
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
}));
