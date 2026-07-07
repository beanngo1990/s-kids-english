import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ConfettiCannon from 'react-native-confetti-cannon';

import { AppCard } from '../components/AppCard';
import { AppButton } from '../components/AppButton';
import { KidBadge } from '../components/KidBadge';
import { MascotImage, MascotSpeechBubble } from '../components/mascot';
import { Screen } from '../components/Screen';
import { SKidsIcon } from '../components/SKidsIcon';
import { lessons } from '../data/lessons';
import { sugaRewardTapMessages } from '../data/mascotPrompts';
import {
  getLessonVocabulary,
  getProgress,
  type LocalProgress,
} from '../engine/ProgressManager';
import {
  playCompleteSound,
  speakVi,
  speakWord,
} from '../engine/AudioManager';
import { resolveAsset } from '../engine/AssetRegistry';
import type { SceneObject } from '../types/lesson';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Reward'>;

function celebrateWithSuga(message: string) {
  playCompleteSound().catch(() => undefined);
  speakVi(message).catch(() => undefined);
}

export function RewardScreen({ navigation, route }: Props) {
  const lesson = lessons.find(item => item.id === route.params.lessonId);
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
          <View style={styles.rewardMascotStage}>
            <View style={styles.rewardGlow} />
            <MascotImage
              accessibilityLabel="Suga chúc mừng bé"
              pose="greatJob"
              size={210}
              style={styles.rewardMascot}
            />
          </View>
          <View style={styles.badgeRow}>
            {route.params.leveledUp && route.params.unlockedSticker && (
              <KidBadge tone="sun">Sticker mới</KidBadge>
            )}
            {route.params.xpGained !== undefined && route.params.xpGained > 0 && (
              <View style={styles.xpBadge}>
                <Text style={styles.xpBadgeText}>+{route.params.xpGained}</Text>
                <SKidsIcon name="acorn" size={16} />
                <Text style={styles.xpBadgeText}>Hạt dẻ</Text>
              </View>
            )}
          </View>
          <Text style={styles.title}>
            {route.params.leveledUp
              ? `Chúc mừng bé lên Cấp ${route.params.newLevel}!`
              : `Bé đã hoàn thành ${lesson.titleVi}!`}
          </Text>
          <Text style={styles.subtitle}>
            {route.params.leveledUp && route.params.unlockedSticker
              ? `Bé đã mở khóa ${route.params.unlockedSticker.stickerName} và thêm từ mới vào sổ học tập.`
              : `Bé đã học thêm nhiều từ mới và tích luỹ thêm hạt dẻ.`}
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
      <ConfettiCannon
        count={route.params.leveledUp ? 200 : 60}
        origin={{ x: 200, y: -20 }}
        fallSpeed={3000}
        fadeOut={true}
      />
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
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.text,
    ...typography.subtitle,
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
    fontWeight: '700',
    ...typography.caption,
  },
});
