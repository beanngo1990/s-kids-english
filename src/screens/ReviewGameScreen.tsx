import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { KidBadge } from '../components/KidBadge';
import { PremiumContentGate } from '../components/PremiumContentGate';
import { SKidsIcon } from '../components/SKidsIcon';
import { Screen } from '../components/Screen';
import { lessons } from '../data/lessons';
import { speakTeacherPromptSegments } from '../engine/AudioManager';
import { resolveAsset } from '../engine/AssetRegistry';
import {
  getParentSettings,
  subscribeParentSettings,
} from '../engine/ParentSettingsManager';
import {
  completeLessonProgress,
  saveVocabularyInteraction,
  type ProgressCompletionResult,
} from '../engine/ProgressManager';
import { useContentAccess } from '../engine/useContentAccess';
import { useI18n, useSavedAppLanguage } from '../i18n';
import {
  GamePlayer,
  resolveReviewGameType,
  type ExecutableReviewGameType,
} from '../games/GameRegistry';
import type { MemoryGameItem } from '../games/memory/MemoryGame';
import {
  getLocalizedLessonTitle,
  getLocalizedReviewGameTitle,
} from '../i18n/domainCopy';
import { resolveReviewGameIntroPrompt } from '../i18n/teacherPrompts';
import type { TeacherPromptMode } from '../i18n/types';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type {
  LearningMode,
  Lesson,
  Scene,
  SceneObject,
  VocabularyItem,
} from '../types/lesson';
import type { RootStackParamList } from '../types/navigation';
import { getLessonIconName } from '../utils/lessonIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'ReviewGame'>;

const defaultMemoryPairCount = 4;
const maxMemoryPairCount = 6;

export function ReviewGameScreen({ navigation, route }: Props) {
  useThemeSync();
  const t = useI18n();
  const lesson = lessons.find(item => item.id === route.params.lessonId);
  const openedFromParent = route.params.openedFromParent === true;
  const [isCompleting, setIsCompleting] = useState(false);
  const appLanguage = useSavedAppLanguage();
  const [teacherPromptMode, setTeacherPromptMode] =
    useState<TeacherPromptMode>('vi');
  const [isTeacherPromptReady, setIsTeacherPromptReady] = useState(false);
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

  useEffect(() => {
    let isMounted = true;

    const applyTeacherSettings = (
      settings: Awaited<ReturnType<typeof getParentSettings>>,
    ) => {
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
      .catch(() => undefined)
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

  const memoryItems = useMemo(
    () =>
      lesson && learningMode && isAccessGranted
        ? getMemoryGameItems(lesson, learningMode)
        : [],
    [isAccessGranted, lesson, learningMode],
  );
  const shouldPlayIntro = Boolean(
    lesson?.reviewGame && memoryItems.length >= 2,
  );

  useEffect(() => {
    if (
      !isAccessGranted ||
      !shouldPlayIntro ||
      !isTeacherPromptReady ||
      !lesson?.reviewGame
    ) {
      return;
    }

    speakTeacherPromptSegments(
      resolveReviewGameIntroPrompt(
        activeGameType,
        teacherPromptMode,
      ).segments,
    ).catch(() => undefined);
  }, [
    activeGameType,
    isAccessGranted,
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
      completionResult = await completeLessonProgress(lesson);
    } catch {
      // Progress is best-effort; reward flow should still continue.
    } finally {
      setIsCompleting(false);
    }

    navigation.replace('Reward', {
      gameType: activeGameType,
      lessonId: lesson.id,
      playedWordIds: memoryItems.map(item => item.id),
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

  if (!isAccessGranted) {
    return (
      <PremiumContentGate
        isResolving={isResolving}
        onAskParent={() =>
          navigation.navigate('Parent', {
            intent: 'premium',
            lessonId: lesson.id,
          })
        }
      />
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

  if (memoryItems.length < 2) {
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
    <Screen scroll>
      <View style={styles.container}>
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

        {openedFromParent ? (
          <View style={styles.parentContext}>
            <KidBadge tone="sky">{t('reviewGame.parentBadge')}</KidBadge>
            <Text style={styles.parentContextText}>
              {t('reviewGame.parentHint')}
            </Text>
          </View>
        ) : null}

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
            <Text
              adjustsFontSizeToFit
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
            accessibilityState={{ selected: activeGameType === 'listenAndChoose' }}
            onPress={() => setSelectedGameType('listenAndChoose')}
            style={({ pressed }) => [
              styles.selectorTab,
              activeGameType === 'listenAndChoose' && styles.selectorTabActive,
              pressed && styles.selectorTabPressed,
            ]}
          >
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={[
                styles.selectorTabText,
                activeGameType === 'listenAndChoose' && styles.selectorTabTextActive,
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
            <Text
              adjustsFontSizeToFit
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

        <GamePlayer
          memoryItems={memoryItems}
          onComplete={handleComplete}
          onWordInteraction={saveVocabularyInteraction}
          overrideType={activeGameType}
          reviewGame={lesson.reviewGame}
        />
      </View>
    </Screen>
  );
}

function getMemoryGameItems(
  lesson: Lesson,
  learningMode: LearningMode,
): MemoryGameItem[] {
  const vocabularyById = new Map<string, VocabularyItem>();
  const objectByVocabId = new Map<string, SceneObject>();

  lesson.scenes.forEach(scene => {
    scene.vocabulary?.forEach(item => {
      vocabularyById.set(item.id, item);
    });

    getRenderableObjects(scene).forEach(object => {
      if (object.vocabId && !objectByVocabId.has(object.vocabId)) {
        objectByVocabId.set(object.vocabId, object);
      }
    });
  });

  let selectedIds = Array.from(vocabularyById.keys());

  // Randomize all available vocabulary to ensure the child reviews different words
  selectedIds = selectedIds.sort(() => Math.random() - 0.5);

  const maxPairs = getMemoryPairCount(lesson.reviewGame?.config, learningMode);

  return selectedIds
    .map(vocabId =>
      createMemoryGameItem(
        vocabularyById.get(vocabId),
        objectByVocabId.get(vocabId),
      ),
    )
    .filter((item): item is MemoryGameItem => Boolean(item))
    .slice(0, maxPairs);
}

function createMemoryGameItem(
  vocabularyItem: VocabularyItem | undefined,
  object: SceneObject | undefined,
) {
  if (!vocabularyItem || !object) {
    return undefined;
  }

  const imageSource = resolveAsset(object.asset.source);
  if (!imageSource) {
    return undefined;
  }

  return {
    id: vocabularyItem.id,
    imageSource: imageSource as ImageSourcePropType,
    meaningVi: vocabularyItem.meaningVi,
    word: vocabularyItem.word,
  };
}

function getMemoryPairCount(
  config: Record<string, unknown> | undefined,
  learningMode: LearningMode,
) {
  const pairCount = config?.pairCount ?? config?.maxPairs;

  if (typeof pairCount === 'number' && Number.isFinite(pairCount)) {
    return Math.max(2, Math.min(maxMemoryPairCount, Math.floor(pairCount)));
  }

  if (learningMode === 'expanded') {
    return 5;
  }
  if (learningMode === 'challenge') {
    return 6;
  }
  
  return defaultMemoryPairCount; // 4
}

function getRenderableObjects(scene: Scene) {
  return scene.character ? [scene.character, ...scene.objects] : scene.objects;
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
    backgroundColor: colors.cream,
    borderColor: colors.borderWarm,
    borderRadius: radius.pill,
    borderWidth: 2,
    flexDirection: 'row',
    marginVertical: spacing.xs,
    padding: 4,
  },
  selectorTab: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 2,
    paddingVertical: 6,
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
  topHud: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
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
