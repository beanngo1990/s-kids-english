import React, { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { KidBadge } from '../components/KidBadge';
import { SKidsIcon } from '../components/SKidsIcon';
import { Screen } from '../components/Screen';
import { lessons } from '../data/lessons';
import { speakTeacherPromptSegments } from '../engine/AudioManager';
import { resolveAsset } from '../engine/AssetRegistry';
import { getParentSettings } from '../engine/ParentSettingsManager';
import {
  completeLessonProgress,
  saveVocabularyInteraction,
} from '../engine/ProgressManager';
import { useI18n } from '../i18n';
import { GamePlayer } from '../games/GameRegistry';
import type { MemoryGameItem } from '../games/memory/MemoryGame';
import { getLocalizedReviewGameTitle } from '../i18n/domainCopy';
import { resolveReviewGameIntroPrompt } from '../i18n/teacherPrompts';
import type { AppLanguage, TeacherPromptMode } from '../i18n/types';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { spacing } from '../theme/spacing';
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
  const [isCompleting, setIsCompleting] = useState(false);
  const [appLanguage, setAppLanguage] = useState<AppLanguage>('vi');
  const [teacherPromptMode, setTeacherPromptMode] =
    useState<TeacherPromptMode>('vi');
  const [isTeacherPromptReady, setIsTeacherPromptReady] = useState(false);
  const [learningMode, setLearningMode] = useState<LearningMode | undefined>(
    route.params.learningMode,
  );

  useEffect(() => {
    getParentSettings()
      .then(settings => {
        setAppLanguage(settings.appLanguage);
        setTeacherPromptMode(settings.teacherPromptMode);
        if (!learningMode) {
          setLearningMode(settings.learningMode);
        }
      })
      .catch(() => undefined)
      .finally(() => setIsTeacherPromptReady(true));
  }, [learningMode]);

  const memoryItems = useMemo(
    () => (lesson && learningMode ? getMemoryGameItems(lesson, learningMode) : []),
    [lesson, learningMode],
  );
  const shouldPlayIntro = Boolean(
    lesson?.reviewGame?.type === 'memory' && memoryItems.length >= 2,
  );

  useEffect(() => {
    if (!shouldPlayIntro || !isTeacherPromptReady || !lesson?.reviewGame) {
      return;
    }

    speakTeacherPromptSegments(
      resolveReviewGameIntroPrompt(
        lesson.reviewGame.type,
        teacherPromptMode,
      ).segments,
    ).catch(() => undefined);
  }, [
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
    let xpGained = 0;
    let leveledUp = false;
    let newLevel = 1;
    let unlockedSticker = undefined;
    try {
      const result = await completeLessonProgress(lesson);
      if (result && typeof result === 'object' && 'xpGained' in result) {
         xpGained = (result as any).xpGained;
         leveledUp = (result as any).leveledUp;
         newLevel = (result as any).newLevel;
         unlockedSticker = (result as any).unlockedSticker;
      }
    } catch {
      // Progress is best-effort; reward flow should still continue.
    } finally {
      setIsCompleting(false);
    }

    navigation.replace('Reward', {
      lessonId: lesson.id,
      playedWordIds: memoryItems.map(item => item.id),
      xpGained,
      leveledUp,
      newLevel,
      unlockedSticker,
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

  if (!lesson.reviewGame) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>{t('reviewGame.noGame')}</Text>
          <AppButton
            title={t('reviewGame.backToPack')}
            onPress={() =>
              navigation.replace('LessonPack', { lessonId: lesson.id })
            }
          />
        </View>
      </Screen>
    );
  }

  const needsMemoryItems = lesson.reviewGame.type === 'memory';
  if (needsMemoryItems && memoryItems.length < 2) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>
            Chưa đủ hình để chơi lật thẻ.
          </Text>
          <Text style={styles.errorText}>
            Game cần ít nhất 2 từ có hình minh họa trong bài học.
          </Text>
          <AppButton
            title="Về gói bài học"
            onPress={() =>
              navigation.replace('LessonPack', { lessonId: lesson.id })
            }
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <SKidsIcon name={getLessonIconName(lesson)} size={48} />
          </View>
          <View style={styles.headerText}>
            <View style={styles.headerTopRow}>
              <KidBadge tone="teal">{t('reviewGame.memoryBadge')}</KidBadge>
              <KidBadge tone="sun">{t('reviewGame.wordCount', { count: String(memoryItems.length) })}</KidBadge>
            </View>
            <Text numberOfLines={2} style={styles.title}>
              {getLocalizedReviewGameTitle(lesson.reviewGame, appLanguage)}
            </Text>
          </View>
        </View>

        <GamePlayer
          memoryItems={memoryItems}
          onComplete={handleComplete}
          onWordInteraction={saveVocabularyInteraction}
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
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 29,
  },
}));
