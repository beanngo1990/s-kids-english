import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
import { playCompleteSound } from '../engine/AudioManager';
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
  const learnedWords = useMemo(() => {
    if (!progress) {
      return lessonVocabulary;
    }

    const learnedWordIds = new Set(progress.learnedWordIds);
    const filteredWords = lessonVocabulary.filter(item =>
      learnedWordIds.has(item.id),
    );

    return filteredWords.length > 0 ? filteredWords : lessonVocabulary;
  }, [lessonVocabulary, progress]);

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
            <Text style={styles.sectionTitle}>Sổ từ mới</Text>
            <KidBadge tone="teal">{learnedWords.length} từ</KidBadge>
          </View>
          <View style={styles.wordList}>
            {learnedWords.map(item => (
              <View key={item.id} style={styles.wordChip}>
                <Text style={styles.word}>{item.word}</Text>
                <Text style={styles.meaning}>{item.meaningVi}</Text>
              </View>
            ))}
          </View>
        </AppCard>

        <View style={styles.actions}>
          <AppButton
            title="Học lại"
            onPress={() =>
              navigation.replace('LessonPack', { lessonId: lesson.id })
            }
          />
          <AppButton
            title="Về trang chủ"
            variant="secondary"
            onPress={() => navigation.popToTop()}
          />
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
    backgroundColor: colors.cream,
    borderColor: colors.borderWarm,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexBasis: '45%',
    flexGrow: 1,
    gap: spacing.xs,
    minHeight: 86,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
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
