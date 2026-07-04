import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { KidBadge } from '../components/KidBadge';
import { Screen } from '../components/Screen';
import { lessons } from '../data/lessons';
import { resolveAsset } from '../engine/AssetRegistry';
import { completeLessonProgress } from '../engine/ProgressManager';
import { GamePlayer } from '../games/GameRegistry';
import type { MemoryGameItem } from '../games/memory/MemoryGame';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type {
  Lesson,
  Scene,
  SceneObject,
  VocabularyItem,
} from '../types/lesson';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ReviewGame'>;

const defaultMemoryPairCount = 4;
const maxMemoryPairCount = 6;

export function ReviewGameScreen({ navigation, route }: Props) {
  const lesson = lessons.find(item => item.id === route.params.lessonId);
  const [isCompleting, setIsCompleting] = useState(false);
  const memoryItems = useMemo(
    () => (lesson ? getMemoryGameItems(lesson) : []),
    [lesson],
  );

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

    navigation.replace('Reward', { lessonId: lesson.id });
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
        <AppCard style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            <KidBadge tone="teal">Ôn tập nhẹ</KidBadge>
            <KidBadge tone="sun">{memoryItems.length} từ</KidBadge>
          </View>
          <Text style={styles.title}>{lesson.reviewGame.titleVi}</Text>
          <Text style={styles.subtitle}>
            Bé lật hai hình giống nhau để luyện trí nhớ. Mỗi lần lật thẻ, app
            sẽ đọc lại từ tiếng Anh.
          </Text>
        </AppCard>

        <GamePlayer
          isCompleting={isCompleting}
          memoryItems={memoryItems}
          onComplete={handleComplete}
          reviewGame={lesson.reviewGame}
        />
      </View>
    </Screen>
  );
}

function getMemoryGameItems(lesson: Lesson): MemoryGameItem[] {
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

  const configuredIds = getConfiguredVocabularyIds(lesson);
  const selectedIds =
    configuredIds.length > 0 ? configuredIds : Array.from(vocabularyById.keys());
  const maxPairs = getMemoryPairCount(lesson.reviewGame?.config);

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

function getMemoryPairCount(config: Record<string, unknown> | undefined) {
  const pairCount = config?.pairCount ?? config?.maxPairs;

  if (typeof pairCount !== 'number' || !Number.isFinite(pairCount)) {
    return defaultMemoryPairCount;
  }

  return Math.max(2, Math.min(maxMemoryPairCount, Math.floor(pairCount)));
}

function getRenderableObjects(scene: Scene) {
  return scene.character ? [scene.character, ...scene.objects] : scene.objects;
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
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
  headerCard: {
    backgroundColor: colors.cream,
    borderColor: colors.borderWarm,
    gap: spacing.sm,
  },
  headerTopRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  subtitle: {
    color: colors.textSoft,
    ...typography.body,
  },
  title: {
    color: colors.text,
    ...typography.title,
  },
});
