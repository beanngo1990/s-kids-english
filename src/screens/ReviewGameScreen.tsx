import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { AppUiIcon } from '../components/AppUiIcon';
import { KidBadge } from '../components/KidBadge';
import { Screen } from '../components/Screen';
import {
  getKidLockAudioPrompt,
  type KidLockReason,
} from '../data/kidLockAudioPrompts';
import { lessons } from '../data/lessons';
import {
  playTapSound,
  speakTeacherPromptSegments,
  speakVi,
  speakWord,
} from '../engine/AudioManager';
import {
  getParentSettings,
  subscribeParentSettings,
} from '../engine/ParentSettingsManager';
import {
  completeLessonProgress,
  getProgress,
  saveVocabularyInteraction,
  type ProgressCompletionResult,
} from '../engine/ProgressManager';
import { useContentAccess } from '../engine/useContentAccess';
import { useI18n, useSavedAppLanguage, useSavedPromptLanguage } from '../i18n';
import {
  GamePlayer,
  resolveReviewGameType,
  type ExecutableReviewGameType,
} from '../games/GameRegistry';
import { getReviewGameItems } from '../games/reviewItems';
import { getLocalizedLessonTitle } from '../i18n/domainCopy';
import { resolveReviewGameIntroPrompt } from '../i18n/teacherPrompts';
import type { TeacherPromptMode } from '../i18n/types';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { LearningMode } from '../types/lesson';
import type { RootStackParamList } from '../types/navigation';
import { isLessonComplete } from '../utils/lessonProgress';

type Props = NativeStackScreenProps<RootStackParamList, 'ReviewGame'>;

export function ReviewGameScreen({ navigation, route }: Props) {
  useThemeSync();
  const t = useI18n();
  const promptLanguage = useSavedPromptLanguage();
  const lesson = lessons.find(item => item.id === route.params.lessonId);
  const openedFromParent = route.params.openedFromParent === true;
  const [isCompleting, setIsCompleting] = useState(false);
  const [isIntroPlaying, setIsIntroPlaying] = useState(false);
  const appLanguage = useSavedAppLanguage();
  const introPlaybackIdRef = useRef(0);
  const hasShownAccessPromptRef = useRef(false);
  const [teacherPromptMode, setTeacherPromptMode] =
    useState<TeacherPromptMode>('vi');
  const [isTeacherPromptReady, setIsTeacherPromptReady] = useState(false);
  const [isProgressReady, setIsProgressReady] = useState(false);
  const [journeyMode, setJourneyMode] = useState<'guided' | 'free'>();
  const [completedSceneIds, setCompletedSceneIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [learningMode, setLearningMode] = useState<LearningMode | undefined>(
    route.params.learningMode,
  );
  const [selectedGameType, setSelectedGameType] =
    useState<ExecutableReviewGameType | null>(
      route.params.gameType && route.params.gameType !== 'random'
        ? (route.params.gameType as ExecutableReviewGameType)
        : null,
    );

  useEffect(() => {
    if (route.params.gameType && route.params.gameType !== 'random') {
      setSelectedGameType(route.params.gameType as ExecutableReviewGameType);
    }
  }, [route.params.gameType]);

  const activeGameType = useMemo(
    () =>
      selectedGameType ??
      resolveReviewGameType(lesson?.reviewGame?.type, route.params.gameType),
    [lesson?.reviewGame?.type, route.params.gameType, selectedGameType],
  );

  const { isAccessGranted, isResolving } = useContentAccess(
    {
      kind: 'review',
      lessonId: route.params.lessonId,
    },
    { latchWhenGranted: true },
  );
  const hasContentAccess = isAccessGranted;

  const playKidLockPrompt = useCallback(
    (reason: KidLockReason) => {
      playTapSound().catch(() => undefined);
      const message = getKidLockAudioPrompt(reason, promptLanguage);
      const speech =
        promptLanguage === 'en' ? speakWord(message) : speakVi(message);
      speech.catch(() => undefined);
    },
    [promptLanguage],
  );

  const returnAfterBlockedAccess = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Home');
  }, [navigation]);

  useEffect(() => {
    if (!lesson || hasContentAccess || hasShownAccessPromptRef.current) {
      return;
    }

    hasShownAccessPromptRef.current = true;

    if (isResolving) {
      playKidLockPrompt('resolving');
      Alert.alert(
        t('premium.kidLockedTitle'),
        t('premium.resolving'),
        [{ onPress: returnAfterBlockedAccess, text: t('common.close') }],
        { cancelable: false },
      );
      return;
    }

    playKidLockPrompt('premium');
    Alert.alert(
      t('premium.kidLockedTitle'),
      t('premium.kidLockedText'),
      [
        {
          onPress: returnAfterBlockedAccess,
          style: 'cancel',
          text: t('common.close'),
        },
        {
          onPress: () =>
            navigation.replace('Parent', {
              intent: 'premium',
              lessonId: lesson.id,
            }),
          text: t('premium.askParent'),
        },
      ],
      { cancelable: false },
    );
  }, [
    hasContentAccess,
    isResolving,
    lesson,
    navigation,
    playKidLockPrompt,
    returnAfterBlockedAccess,
    t,
  ]);

  useEffect(() => {
    let isMounted = true;

    const applyTeacherSettings = (
      settings: Awaited<ReturnType<typeof getParentSettings>>,
    ) => {
      setJourneyMode(settings.journeyMode);
      setTeacherPromptMode(settings.teacherPromptMode ?? 'vi');
    };

    const unsubscribe = subscribeParentSettings(settings => {
      if (isMounted) {
        applyTeacherSettings(settings);
      }
    });

    getParentSettings()
      .then(settings => {
        if (!isMounted) {
          return;
        }
        applyTeacherSettings(settings);
        if (!route.params.learningMode) {
          setLearningMode(settings.learningMode);
        }
      })
      .catch(() => {
        if (isMounted) {
          setJourneyMode('guided');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsTeacherPromptReady(true);
        }
      });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [route.params.learningMode]);

  useEffect(() => {
    let isMounted = true;

    setIsProgressReady(false);
    getProgress()
      .then(progress => {
        if (isMounted) {
          setCompletedSceneIds(new Set(progress.completedSceneIds));
        }
      })
      .catch(() => {
        if (isMounted) {
          setCompletedSceneIds(new Set());
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsProgressReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [route.params.lessonId]);

  const isProgressGateReady =
    isTeacherPromptReady && isProgressReady && journeyMode !== undefined;
  const isReviewProgressGranted = Boolean(
    lesson &&
      journeyMode &&
      (journeyMode === 'free' ||
        isLessonComplete(lesson.scenes, completedSceneIds, lesson.id)),
  );

  useEffect(() => {
    if (
      !lesson ||
      !hasContentAccess ||
      !isProgressGateReady ||
      isReviewProgressGranted
    ) {
      return;
    }

    navigation.replace('LessonPack', {
      lessonId: lesson.id,
      openedFromParent,
    });
  }, [
    hasContentAccess,
    isProgressGateReady,
    isReviewProgressGranted,
    lesson,
    navigation,
    openedFromParent,
  ]);

  const reviewItems = useMemo(
    () =>
      lesson &&
      learningMode &&
      hasContentAccess &&
      isReviewProgressGranted
        ? getReviewGameItems(lesson, learningMode)
        : [],
    [hasContentAccess, isReviewProgressGranted, lesson, learningMode],
  );
  const shouldPlayIntro = Boolean(
    lesson?.reviewGame && reviewItems.length >= 2,
  );

  useEffect(() => {
    const playbackId = introPlaybackIdRef.current + 1;
    introPlaybackIdRef.current = playbackId;

    if (
      !hasContentAccess ||
      !shouldPlayIntro ||
      !isTeacherPromptReady ||
      !lesson?.reviewGame
    ) {
      setIsIntroPlaying(false);
      return;
    }

    let isCancelled = false;
    setIsIntroPlaying(true);
    speakTeacherPromptSegments(
      resolveReviewGameIntroPrompt(activeGameType, teacherPromptMode).segments,
    )
      .catch(() => undefined)
      .finally(() => {
        if (!isCancelled && introPlaybackIdRef.current === playbackId) {
          setIsIntroPlaying(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [
    activeGameType,
    hasContentAccess,
    isTeacherPromptReady,
    lesson?.reviewGame,
    route.params.lessonId,
    shouldPlayIntro,
    teacherPromptMode,
  ]);

  const handleComplete = async () => {
    if (!lesson || isCompleting) {
      return;
    }

    setIsCompleting(true);
    let completionResult: ProgressCompletionResult = {
      xpGained: 0,
      leveledUp: false,
      newLevel: 1,
    };
    try {
      completionResult = await completeLessonProgress(lesson, {
        learningMode,
      });
    } catch {
      // Progress is best-effort; reward flow should still continue.
    } finally {
      setIsCompleting(false);
    }

    navigation.replace('Reward', {
      gameType: activeGameType,
      lessonId: lesson.id,
      playedWordIds: reviewItems.map(item => item.id),
      sourceScreen: 'ReviewGame',
      ...completionResult,
    });
  };

  if (!lesson) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>{t('reviewGame.notFound')}</Text>
          <AppButton
            title={t('reviewGame.backToList')}
            onPress={() => navigation.navigate('LessonList')}
          />
        </View>
      </Screen>
    );
  }

  if (!hasContentAccess) {
    return (
      <Screen>
        <View />
      </Screen>
    );
  }

  if (!isProgressGateReady || !isReviewProgressGranted) {
    return (
      <Screen>
        <View />
      </Screen>
    );
  }

  if (!lesson.reviewGame) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>{t('reviewGame.noGame')}</Text>
          <AppButton
            title={t('reviewGame.backToPack')}
            onPress={() =>
              navigation.replace('LessonPack', {
                lessonId: lesson.id,
                openedFromParent,
              })
            }
          />
        </View>
      </Screen>
    );
  }

  if (reviewItems.length < 2) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>
            {t('reviewGame.notEnoughImagesTitle')}
          </Text>
          <Text style={styles.errorText}>
            {t('reviewGame.notEnoughImagesText')}
          </Text>
          <AppButton
            title={t('reviewGame.backToPack')}
            onPress={() =>
              navigation.replace('LessonPack', {
                lessonId: lesson.id,
                openedFromParent,
              })
            }
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      fixedHeader={
        <View style={styles.fixedHeader}>
          {/* Custom Kid Mode Top Navigation Header */}
          <View style={styles.topHud}>
            <Pressable
              accessibilityLabel={t('common.close')}
              accessibilityRole="button"
              onPress={() =>
                navigation.canGoBack()
                  ? navigation.goBack()
                  : navigation.replace('LessonPack', {
                      lessonId: lesson.id,
                      openedFromParent,
                    })
              }
              style={styles.exitButton}
            >
              <View style={styles.exitIcon}>
                <View style={styles.exitStroke} />
                <View style={[styles.exitStroke, styles.exitStrokeReverse]} />
              </View>
            </Pressable>

            <View style={styles.topHudPill}>
              <Text numberOfLines={1} style={styles.topHudTitle}>
                {getLocalizedLessonTitle(lesson, appLanguage)}
              </Text>
            </View>
          </View>

          {/* Game Type Switcher Bar */}
          <View style={styles.gameSelectorContainer}>
            <Pressable
              accessibilityLabel={t('reviewGame.selectMemory')}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeGameType === 'memory' }}
              onPress={() => setSelectedGameType('memory')}
              style={({ pressed }) => [
                styles.selectorTab,
                activeGameType === 'memory' && styles.selectorTabActive,
                pressed && styles.selectorTabPressed,
              ]}
            >
              <AppUiIcon name="gameMemory" size={16} />
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                numberOfLines={1}
                style={[
                  styles.selectorTabText,
                  activeGameType === 'memory' && styles.selectorTabTextActive,
                ]}
              >
                {t('reviewGame.selectMemory')}
              </Text>
            </Pressable>

            <Pressable
              accessibilityLabel={t('reviewGame.selectListenChoose')}
              accessibilityRole="tab"
              accessibilityState={{
                selected: activeGameType === 'listenAndChoose',
              }}
              onPress={() => setSelectedGameType('listenAndChoose')}
              style={({ pressed }) => [
                styles.selectorTab,
                activeGameType === 'listenAndChoose' &&
                  styles.selectorTabActive,
                pressed && styles.selectorTabPressed,
              ]}
            >
              <AppUiIcon name="gameListen" size={16} />
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                numberOfLines={1}
                style={[
                  styles.selectorTabText,
                  activeGameType === 'listenAndChoose' &&
                    styles.selectorTabTextActive,
                ]}
              >
                {t('reviewGame.selectListenChoose')}
              </Text>
            </Pressable>

            <Pressable
              accessibilityLabel={t('reviewGame.selectMatching')}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeGameType === 'matching' }}
              onPress={() => setSelectedGameType('matching')}
              style={({ pressed }) => [
                styles.selectorTab,
                activeGameType === 'matching' && styles.selectorTabActive,
                pressed && styles.selectorTabPressed,
              ]}
            >
              <AppUiIcon name="gameMatching" size={16} />
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                numberOfLines={1}
                style={[
                  styles.selectorTabText,
                  activeGameType === 'matching' && styles.selectorTabTextActive,
                ]}
              >
                {t('reviewGame.selectMatching')}
              </Text>
            </Pressable>
          </View>
        </View>
      }
      safeAreaEdges={['top', 'bottom', 'left', 'right']}
      scroll
    >
      <View style={styles.container}>
        {openedFromParent ? (
          <View style={styles.parentContext}>
            <KidBadge tone="sky">{t('reviewGame.parentBadge')}</KidBadge>
            <Text style={styles.parentContextText}>
              {t('reviewGame.parentHint')}
            </Text>
          </View>
        ) : null}

        <GamePlayer
          isIntroPlaying={isIntroPlaying}
          learningMode={learningMode ?? 'core'}
          memoryItems={reviewItems}
          onComplete={handleComplete}
          onWordInteraction={saveVocabularyInteraction}
          overrideType={activeGameType}
          reviewGame={lesson.reviewGame}
        />
      </View>
    </Screen>
  );
}

const styles = createThemedStyles(() => ({
  container: {
    gap: spacing.md,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.lg,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  errorText: {
    color: colors.textSoft,
    textAlign: 'center',
    ...typography.body,
  },
  errorTitle: {
    color: colors.text,
    textAlign: 'center',
    ...typography.title,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  headerParent: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    padding: spacing.md,
  },
  headerTopRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 2,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  parentContext: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  parentContextText: {
    color: colors.textSoft,
    ...typography.caption,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 29,
  },
  gameSelectorContainer: {
    alignItems: 'center',
    backgroundColor: colors.cream,
    borderColor: colors.borderWarm,
    borderRadius: radius.pill,
    borderWidth: 2,
    flexDirection: 'row',
    height: 48,
    padding: 3,
  },
  selectorTab: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  selectorTabActive: {
    backgroundColor: colors.primaryDark,
  },
  selectorTabPressed: {
    opacity: 0.8,
  },
  selectorTabText: {
    ...typography.subtitle,
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  selectorTabTextActive: {
    color: colors.white,
    fontWeight: '900',
  },
  fixedHeader: {
    backgroundColor: colors.background,
    gap: spacing.xs,
    paddingBottom: spacing.xs,
    zIndex: 10,
  },
  topHud: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  exitButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  exitIcon: {
    alignItems: 'center',
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  exitStroke: {
    backgroundColor: colors.accentDark,
    borderRadius: radius.pill,
    height: 4,
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
    width: 20,
  },
  exitStrokeReverse: {
    transform: [{ rotate: '-45deg' }],
  },
  topHudPill: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderWarm,
    borderRadius: radius.pill,
    borderWidth: 2,
    flex: 1,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  topHudTitle: {
    color: colors.primaryDark,
    ...typography.subtitle,
    fontSize: 16,
    fontWeight: '800',
  },
}));
