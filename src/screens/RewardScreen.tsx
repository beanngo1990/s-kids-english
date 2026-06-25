import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppCard } from '../components/AppCard';
import { AppButton } from '../components/AppButton';
import { Screen } from '../components/Screen';
import { lessons } from '../data/lessons';
import { getLessonReward } from '../data/rewards';
import {
  getLessonVocabulary,
  getProgress,
  type LocalProgress,
} from '../engine/ProgressManager';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Reward'>;

export function RewardScreen({ navigation, route }: Props) {
  const lesson =
    lessons.find(item => item.id === route.params.lessonId) ?? lessons[0];
  const reward = getLessonReward(lesson.id);
  const lessonVocabulary = useMemo(() => getLessonVocabulary(lesson), [lesson]);
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

  return (
    <Screen scroll>
      <View style={styles.container}>
        <AppCard style={styles.rewardBox}>
          <Text style={styles.badge}>Sticker</Text>
          <Text style={styles.sticker}>★</Text>
          <Text style={styles.title}>
            {reward?.title ?? `Bé đã hoàn thành ${lesson.titleVi}!`}
          </Text>
          <Text style={styles.subtitle}>
            Sticker: {reward?.stickerName ?? 'Morning Star'}
          </Text>
        </AppCard>

        <AppCard style={styles.wordsCard}>
          <Text style={styles.sectionTitle}>Từ bé đã học</Text>
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
              navigation.replace('ScenePlayer', { lessonId: lesson.id })
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
  badge: {
    backgroundColor: colors.secondary,
    borderRadius: radius.pill,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    ...typography.button,
  },
  container: {
    gap: spacing.lg,
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
    minHeight: 260,
  },
  sectionTitle: {
    color: colors.text,
    textAlign: 'center',
    ...typography.subtitle,
  },
  sticker: {
    color: colors.secondary,
    fontSize: 72,
    fontWeight: '900',
    lineHeight: 80,
    textShadowColor: colors.accentSoft,
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
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
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
