import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ConfettiCannon from 'react-native-confetti-cannon';

import { AppCard } from '../components/AppCard';
import { AppButton } from '../components/AppButton';
import { KidBadge } from '../components/KidBadge';
import { MascotImage } from '../components/mascot';
import { Screen } from '../components/Screen';
import { SKidsIcon } from '../components/SKidsIcon';
import { lessons } from '../data/lessons';
import { getLocalizedLessonRewardName } from '../data/rewards';
import { canAccessLesson } from '../engine/ContentAccessPolicy';
import {
  getMonetizationSnapshot,
  useMonetizationSnapshot,
} from '../engine/MonetizationManager';
import {
  getLessonVocabulary,
  getProgress,
  saveActiveThemeId,
  type LocalProgress,
} from '../engine/ProgressManager';
import { playCompleteSound, playTapSound, speakVi, speakWord } from '../engine/AudioManager';
import {
  getKidLockAudioPrompt,
  type KidLockReason,
} from '../data/kidLockAudioPrompts';
import { resolveAsset } from '../engine/AssetRegistry';
import { getLocalizedLessonTitle } from '../i18n/domainCopy';
import { useI18n, useSavedAppLanguage, useSavedPromptLanguage } from '../i18n';
import type { SceneObject } from '../types/lesson';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { useResponsiveLayout } from '../theme/responsive';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Reward'>;

export function RewardScreen({ navigation, route }: Props) {
  useThemeSync();
  const t = useI18n();
  const responsiveLayout = useResponsiveLayout();
  const appLanguage = useSavedAppLanguage();
  const monetizationSnapshot = useMonetizationSnapshot();
  const lesson = lessons.find(item => item.id === route.params.lessonId);
  const lessonVocabulary = useMemo(
    () => (lesson ? getLessonVocabulary(lesson) : []),
    [lesson],
  );
  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const [isOpeningNextLesson, setIsOpeningNextLesson] = useState(false);
  const displayWords = useMemo(() => {
    if (route.params.playedWordIds && route.params.playedWordIds.length > 0) {
      const playedSet = new Set(route.params.playedWordIds);
      return lessonVocabulary.filter(item => playedSet.has(item.id));
    }

    if (!progress) {
      return lessonVocabulary;
    }

    const learnedWordIds = new Set(progress.learnedWordIds);
    const filteredWords = lessonVocabulary.filter(item =>
      learnedWordIds.has(item.id),
    );

    return filteredWords.length > 0 ? filteredWords : lessonVocabulary;
  }, [lessonVocabulary, progress, route.params.playedWordIds]);

  const vocabImages = useMemo(() => {
    if (!lesson) {
      return new Map<string, SceneObject>();
    }
    const objectByVocabId = new Map<string, SceneObject>();
    lesson.scenes.forEach(scene => {
      const renderables = scene.character
        ? [scene.character, ...scene.objects]
        : scene.objects;
      renderables.forEach(object => {
        if (object.vocabId && !objectByVocabId.has(object.vocabId)) {
          objectByVocabId.set(object.vocabId, object);
        }
      });
    });
    return objectByVocabId;
  }, [lesson]);

  const currentLessonIndex = lesson
    ? lessons.findIndex(l => l.id === lesson.id)
    : -1;
  const nextLesson =
    currentLessonIndex !== -1 && currentLessonIndex < lessons.length - 1
      ? lessons[currentLessonIndex + 1]
      : null;
  const highlightedStickerId = route.params.unlockedSticker?.stickerId;
  const canReplayLesson = lesson
    ? canAccessLesson(lesson.id, monetizationSnapshot)
    : false;
  const canOpenNextLesson = nextLesson
    ? canAccessLesson(nextLesson.id, monetizationSnapshot)
    : false;

  const promptLanguage = useSavedPromptLanguage();

  const playKidLockPrompt = (reason: KidLockReason) => {
    playTapSound().catch(() => undefined);
    const message = getKidLockAudioPrompt(reason, promptLanguage);
    const speech =
      promptLanguage === 'en' ? speakWord(message) : speakVi(message);
    speech.catch(() => undefined);
  };

  const handleOpenLesson = (lessonId: string, openLesson: () => void) => {
    const latestMonetizationSnapshot = getMonetizationSnapshot();
    if (canAccessLesson(lessonId, latestMonetizationSnapshot)) {
      openLesson();
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

  const getPremiumActionLabel = (hasAccess: boolean) => {
    if (hasAccess) {
      return null;
    }

    return monetizationSnapshot.status === 'initializing'
      ? t('premium.resolving')
      : t('premium.askParent');
  };

  useEffect(() => {
    let isMounted = true;

    playCompleteSound().catch(() => undefined);

    getProgress()
      .then(nextProgress => {
        if (isMounted) {
          setProgress(nextProgress);
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  const handleGoHome = () => {
    if (route.params.sourceScreen === 'ReviewGame') {
      navigation.navigate('Home', { activeTab: 'play' });
    } else {
      navigation.navigate('Home', { activeTab: 'map' });
    }
  };

  if (!lesson) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <Text style={styles.title}>{t('reward.notFound')}</Text>
          <AppButton
            title={t('reward.backToList')}
            onPress={handleGoHome}
          />
        </View>
      </Screen>
    );
  }

  const handleReplayCurrent = () => {
    handleOpenLesson(lesson.id, () => {
      if (route.params.sourceScreen === 'ReviewGame' || route.params.gameType) {
        navigation.replace('ReviewGame', {
          gameType: route.params.gameType,
          lessonId: lesson.id,
        });
      } else {
        navigation.replace('ScenePlayer', { lessonId: lesson.id });
      }
    });
  };

  const handleNextLesson = () => {
    if (!nextLesson || isOpeningNextLesson) {
      return;
    }

    handleOpenLesson(nextLesson.id, () => {
      setIsOpeningNextLesson(true);

      const openNextLessonPack = () => {
        navigation.replace('LessonPack', { lessonId: nextLesson.id });
      };
      const activeThemeId = progress?.activeThemeId;

      if (activeThemeId === nextLesson.themeId) {
        openNextLessonPack();
        return;
      }

      saveActiveThemeId(nextLesson.themeId)
        .catch(() => undefined)
        .finally(openNextLessonPack);
    });
  };

  return (
    <Screen scroll={false} withBottomSpace={false}>
      <View style={styles.shell}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={[
            styles.scrollContent,
            {
              maxWidth: responsiveLayout.contentMaxWidth,
              padding: responsiveLayout.screenPadding,
            },
          ]}
          showsVerticalScrollIndicator={false}
          style={styles.scrollArea}
        >
          <View style={styles.container}>
            <AppCard style={styles.rewardBox}>
              <View style={styles.rewardMascotStage}>
                <View style={styles.rewardGlow} />
                <MascotImage
                  accessibilityLabel={t('reward.mascotAccessibility')}
                  pose="greatJob"
                  size={210}
                  style={styles.rewardMascot}
                />
              </View>
              <View style={styles.badgeRow}>
                {route.params.unlockedSticker && (
                  <KidBadge tone="sun">{t('reward.newSticker')}</KidBadge>
                )}
                {route.params.xpGained !== undefined &&
                  route.params.xpGained > 0 && (
                    <View style={styles.xpBadge}>
                      <Text style={styles.xpBadgeText}>
                        +{route.params.xpGained}
                      </Text>
                      <SKidsIcon name="acorn" size={16} />
                      <Text style={styles.xpBadgeText}>{t('reward.acorn')}</Text>
                    </View>
                  )}
              </View>
              <Text style={styles.title}>
                {route.params.leveledUp
                  ? t('reward.levelUpTitle', {
                    level: String(route.params.newLevel),
                  })
                  : t('reward.completedTitle', {
                    lessonTitle: getLocalizedLessonTitle(lesson, appLanguage),
                  })}
              </Text>
              <Text style={styles.subtitle}>
                {route.params.unlockedSticker
                  ? t('reward.levelUpSubtitle', {
                    stickerName: getLocalizedLessonRewardName(
                      route.params.unlockedSticker,
                      appLanguage,
                    ),
                  })
                  : t('reward.completedSubtitle')}
              </Text>
              {route.params.unlockedSticker ? (
                <AppButton
                  iconName="sticker"
                  iconSize={20}
                  onPress={() => navigation.navigate('StickerPlayground')}
                  style={styles.decorateNowButton}
                  textStyle={styles.decorateNowButtonText}
                  title={t('reward.decorateNow')}
                />
              ) : null}
            </AppCard>

            <AppCard style={styles.wordsCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('reward.wordsLearned')}</Text>
                <KidBadge tone="teal">
                  {t('reward.wordCount', { count: String(displayWords.length) })}
                </KidBadge>
              </View>
              <View style={styles.wordList}>
                {displayWords.map(item => {
                  const obj = vocabImages.get(item.id);
                  const imgSource = obj ? resolveAsset(obj.asset.source) : null;

                  return (
                    <Pressable
                      key={item.id}
                      style={({ pressed }) => [
                        styles.wordChip,
                        pressed && styles.wordChipPressed,
                      ]}
                      onPress={() => speakWord(item.word).catch(() => undefined)}
                    >
                      {imgSource && (
                        <Image
                          source={imgSource as any}
                          style={styles.wordImage}
                          resizeMode="contain"
                        />
                      )}
                      <Text style={styles.word}>{item.word}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </AppCard>
          </View>
        </ScrollView>

        <View style={styles.footerContainer}>
          <View
            style={[
              styles.footerInner,
              { maxWidth: responsiveLayout.contentMaxWidth },
            ]}
          >
            <View style={styles.actions}>
              {highlightedStickerId ? (
                <AppButton
                  iconName="sticker"
                  title={t('reward.viewStickerCollection')}
                  onPress={() =>
                    navigation.navigate('StickerCollection', {
                      highlightedStickerId,
                    })
                  }
                />
              ) : null}
              {nextLesson ? (
                <>
                  <AppButton
                    disabled={isOpeningNextLesson}
                    iconName="next"
                    iconSize={30}
                    title={`${t('reward.nextLesson')}${getPremiumActionLabel(canOpenNextLesson)
                      ? ` · ${getPremiumActionLabel(canOpenNextLesson)}`
                      : ''
                      }`}
                    onPress={handleNextLesson}
                  />
                  <View style={styles.secondaryRow}>
                    <View style={styles.flexItem}>
                      <AppButton
                        iconName="map"
                        iconSize={22}
                        title={t('reward.backToList')}
                        variant="secondary"
                        onPress={handleGoHome}
                      />
                    </View>
                    <View style={styles.flexItem}>
                      <AppButton
                        iconName="replay"
                        iconSize={22}
                        title={`${t('reward.replayLesson')}${getPremiumActionLabel(canReplayLesson)
                          ? ` · ${getPremiumActionLabel(canReplayLesson)}`
                          : ''
                          }`}
                        variant="outlined"
                        onPress={handleReplayCurrent}
                      />
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <AppButton
                    iconName="map"
                    iconSize={26}
                    title={t('reward.backToList')}
                    onPress={handleGoHome}
                  />
                  <AppButton
                    iconName="replay"
                    iconSize={22}
                    title={`${t('reward.replayLesson')}${getPremiumActionLabel(canReplayLesson)
                      ? ` · ${getPremiumActionLabel(canReplayLesson)}`
                      : ''
                      }`}
                    variant="secondary"
                    onPress={handleReplayCurrent}
                  />
                </>
              )}
            </View>
          </View>
        </View>
      </View>

      <ConfettiCannon
        count={route.params.unlockedSticker ? 200 : 60}
        origin={{ x: 200, y: -20 }}
        fallSpeed={3000}
        fadeOut={true}
      />
    </Screen>
  );
}

const styles = createThemedStyles(() => ({
  actions: {
    gap: spacing.xs,
  },
  container: {
    gap: spacing.lg,
  },
  decorateNowButton: {
    alignSelf: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    width: 'auto',
  },
  decorateNowButtonText: {
    ...typography.caption,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.lg,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  flexItem: {
    flex: 1,
  },
  footerContainer: {
    backgroundColor: colors.background,
    borderTopColor: colors.border,
    borderTopWidth: 1.5,
    elevation: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { height: -3, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  footerInner: {
    alignSelf: 'center',
    width: '100%',
  },
  meaning: {
    color: colors.textSoft,
    textAlign: 'center',
    ...typography.caption,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  rewardBox: {
    alignItems: 'center',
    gap: spacing.md,
    justifyContent: 'center',
    minHeight: 420,
    overflow: 'hidden',
  },
  rewardGlow: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 4,
    bottom: 14,
    height: 142,
    opacity: 0.88,
    position: 'absolute',
    width: 190,
  },
  rewardCoach: {
    alignSelf: 'stretch',
  },
  rewardMascot: {
    zIndex: 2,
  },
  rewardMascotStage: {
    alignItems: 'center',
    height: 220,
    justifyContent: 'flex-end',
    position: 'relative',
    width: '100%',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    alignSelf: 'center',
    width: '100%',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  shell: {
    flex: 1,
  },
  subtitle: {
    color: colors.textSoft,
    textAlign: 'center',
    ...typography.body,
  },
  title: {
    color: colors.text,
    textAlign: 'center',
    ...typography.title,
  },
  word: {
    color: colors.text,
    textAlign: 'center',
    ...typography.button,
  },
  wordChip: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 2,
    flexBasis: '45%',
    flexGrow: 1,
    gap: spacing.sm,
    minHeight: 120,
    justifyContent: 'center',
    padding: spacing.sm,
  },
  wordChipPressed: {
    backgroundColor: colors.cream,
    borderColor: colors.secondary,
    transform: [{ scale: 0.98 }],
  },
  wordImage: {
    height: 72,
    width: '100%',
  },
  wordList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  wordsCard: {
    gap: spacing.md,
  },
  xpBadge: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  xpBadgeText: {
    color: colors.text,
    ...typography.caption,
    fontWeight: '700',
  },
}));
