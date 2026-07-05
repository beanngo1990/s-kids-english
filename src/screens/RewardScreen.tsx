import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppCard } from '../components/AppCard';
import { AppButton } from '../components/AppButton';
import { KidBadge } from '../components/KidBadge';
import { Screen } from '../components/Screen';
import { lessons } from '../data/lessons';
import { getLessonReward } from '../data/rewards';
import {
  getLessonVocabulary,
  getProgress,
  type LocalProgress,
} from '../engine/ProgressManager';
import { playCompleteSound, speakWord } from '../engine/AudioManager';
import { resolveAsset } from '../engine/AssetRegistry';
import type { SceneObject } from '../types/lesson';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Reward'>;

export function RewardScreen({ navigation, route }: Props) {
  const lesson = lessons.find(item => item.id === route.params.lessonId);
  const reward = lesson ? getLessonReward(lesson.id) : null;
  const lessonVocabulary = useMemo(() => lesson ? getLessonVocabulary(lesson) : [], [lesson]);
  const [progress, setProgress] = useState<LocalProgress | null>(null);
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
      const renderables = scene.character ? [scene.character, ...scene.objects] : scene.objects;
      renderables.forEach(object => {
        if (object.vocabId && !objectByVocabId.has(object.vocabId)) {
          objectByVocabId.set(object.vocabId, object);
        }
      });
    });
    return objectByVocabId;
  }, [lesson]);

  const currentLessonIndex = lesson ? lessons.findIndex(l => l.id === lesson.id) : -1;
  const nextLesson = currentLessonIndex !== -1 && currentLessonIndex < lessons.length - 1
    ? lessons[currentLessonIndex + 1]
    : null;

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

  if (!lesson) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <Text style={styles.title}>Không tìm thấy bài học này.</Text>
          <AppButton
            title="Về danh sách bài học"
            onPress={() => navigation.navigate('LessonList')}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.container}>
        <AppCard style={styles.rewardBox}>
          <View style={styles.rewardGlow}>
            <Text style={styles.sticker}>★</Text>
          </View>
          <KidBadge tone="sun">Sticker mới</KidBadge>
          <Text style={styles.title}>
            {reward?.title ?? `Bé đã hoàn thành ${lesson.titleVi}!`}
          </Text>
          <Text style={styles.subtitle}>
            Bé đã mở khóa {reward?.stickerName ?? 'Ngôi sao chăm chỉ'} và thêm
            từ mới vào sổ học tập.
          </Text>
        </AppCard>

        <AppCard style={styles.wordsCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Các từ bé vừa học</Text>
            <KidBadge tone="teal">{displayWords.length} từ</KidBadge>
          </View>
          <View style={styles.wordList}>
            {displayWords.map(item => {
              const obj = vocabImages.get(item.id);
              const imgSource = obj ? resolveAsset(obj.asset.source) : null;
              
              return (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [styles.wordChip, pressed && styles.wordChipPressed]}
                  onPress={() => speakWord(item.word).catch(() => undefined)}
                >
                  {imgSource && (
                    <Image source={imgSource as any} style={styles.wordImage} resizeMode="contain" />
                  )}
                  <Text style={styles.word}>{item.word}</Text>
                </Pressable>
              );
            })}
          </View>
        </AppCard>

        <View style={styles.actions}>
          {nextLesson ? (
            <>
              <AppButton
                title={`Bài tiếp: ${nextLesson.titleVi}`}
                onPress={() => navigation.replace('LessonPack', { lessonId: nextLesson.id })}
              />
              <AppButton
                title="Về danh sách bài học"
                variant="secondary"
                onPress={() => navigation.navigate('LessonList')}
              />
              <AppButton
                title="Chơi lại bài này"
                variant="outlined"
                onPress={() => navigation.replace('LessonPack', { lessonId: lesson.id })}
              />
            </>
          ) : (
            <>
              <AppButton
                title="Về danh sách bài học"
                onPress={() => navigation.navigate('LessonList')}
              />
              <AppButton
                title="Chơi lại bài này"
                variant="secondary"
                onPress={() => navigation.replace('LessonPack', { lessonId: lesson.id })}
              />
            </>
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.md,
  },
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
  meaning: {
    color: colors.textSoft,
    textAlign: 'center',
    ...typography.caption,
  },
  rewardBox: {
    alignItems: 'center',
    gap: spacing.md,
    justifyContent: 'center',
    minHeight: 300,
    overflow: 'hidden',
  },
  rewardGlow: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 4,
    height: 132,
    justifyContent: 'center',
    width: 132,
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
  sticker: {
    color: colors.secondary,
    fontSize: 78,
    fontWeight: '900',
    lineHeight: 86,
    textShadowColor: colors.borderWarm,
    textShadowOffset: {
      height: 3,
      width: 0,
    },
    textShadowRadius: 4,
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
    backgroundColor: colors.white,
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
});
