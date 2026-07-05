import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { KidBadge } from '../components/KidBadge';
import { SKidsIcon } from '../components/SKidsIcon';
import { Screen } from '../components/Screen';
import { lessons } from '../data/lessons';
import { memoryGameIntroPromptVi } from '../data/reviewGamePrompts';
import { speakVi } from '../engine/AudioManager';
import { resolveAsset } from '../engine/AssetRegistry';
import { getParentSettings } from '../engine/ParentSettingsManager';
import { completeLessonProgress } from '../engine/ProgressManager';
import { GamePlayer } from '../games/GameRegistry';
import type { MemoryGameItem } from '../games/memory/MemoryGame';
import { colors } from '../theme/colors';
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
  const lesson = lessons.find(item => item.id === route.params.lessonId);
  const [isCompleting, setIsCompleting] = useState(false);
  const [learningMode, setLearningMode] = useState<LearningMode | undefined>(
    route.params.learningMode,
  );

  useEffect(() => {
    if (!learningMode) {
      getParentSettings().then(settings => setLearningMode(settings.learningMode));
    }
  }, [learningMode]);

  const memoryItems = useMemo(
    () => (lesson && learningMode ? getMemoryGameItems(lesson, learningMode) : []),
    [lesson, learningMode],
  );
  const shouldPlayIntro = Boolean(
    lesson?.reviewGame?.type === 'memory' && memoryItems.length >= 2,
  );

  useEffect(() => {
    if (!shouldPlayIntro) {
      return;
    }

    speakVi(memoryGameIntroPromptVi).catch(() => undefined);
  }, [route.params.lessonId, shouldPlayIntro]);

  const handleComplete = async () => {
    if (!lesson || isCompleting) {
      return;
    }

    setIsCompleting(true);
    try {
      await completeLessonProgress(lesson);
    } catch {
      // Progress is best-effort; reward flow should still continue.
    } finally {
      setIsCompleting(false);
    }

    navigation.replace('Reward', {
      lessonId: lesson.id,
      playedWordIds: memoryItems.map(item => item.id),
    });
  };

  if (!lesson) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Không tìm thấy bài học này.</Text>
          <AppButton
            title="Về danh sách bài học"
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
          <Text style={styles.errorTitle}>Bài học này chưa có game ôn tập.</Text>
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
              <KidBadge tone="teal">Lật thẻ</KidBadge>
              <KidBadge tone="sun">{memoryItems.length} từ</KidBadge>
            </View>
            <Text numberOfLines={2} style={styles.title}>
              {lesson.reviewGame.titleVi}
            </Text>
          </View>
        </View>

        <GamePlayer
          memoryItems={memoryItems}
          onComplete={handleComplete}
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

function getConfiguredVocabularyIds(lesson: Lesson) {
  const vocabularyIds = lesson.reviewGame?.config?.vocabularyIds;

  if (!Array.isArray(vocabularyIds)) {
    return [];
  }

  return vocabularyIds.filter((item): item is string => typeof item === 'string');
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

const styles = StyleSheet.create({
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
    backgroundColor: colors.white,
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
});
