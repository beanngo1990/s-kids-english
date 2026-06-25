import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '../components/AppCard';
import { Screen } from '../components/Screen';
import { StatTile } from '../components/StatTile';
import { lessons } from '../data/lessons';
import {
  getLessonVocabulary,
  getProgress,
  type LocalProgress,
} from '../engine/ProgressManager';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const GATE_DURATION_MS = 3000;

export function ParentScreen() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const gateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const morningLesson = lessons.find(lesson => lesson.id === 'morning-routine');
  const morningVocabulary = useMemo(
    () => (morningLesson ? getLessonVocabulary(morningLesson) : []),
    [morningLesson],
  );
  const learnedWordCount = progress?.learnedWordIds.length ?? 0;
  const completedLessonCount = progress?.completedLessonIds.length ?? 0;
  const earnedStickerCount = progress?.earnedStickerIds.length ?? 0;
  const learnedMorningWords = morningVocabulary
    .filter(item => item.word !== 'sun')
    .map(item => item.word);

  function clearGateTimer() {
    if (gateTimerRef.current) {
      clearTimeout(gateTimerRef.current);
      gateTimerRef.current = null;
    }
  }

  useEffect(() => {
    if (!isUnlocked) {
      return;
    }

    getProgress()
      .then(setProgress)
      .catch(() => setProgress(null));
  }, [isUnlocked]);

  useEffect(() => {
    return clearGateTimer;
  }, []);

  const handleHoldStart = () => {
    clearGateTimer();
    setIsHolding(true);
    gateTimerRef.current = setTimeout(() => {
      setIsUnlocked(true);
      setIsHolding(false);
    }, GATE_DURATION_MS);
  };

  const handleHoldEnd = () => {
    if (!isUnlocked) {
      setIsHolding(false);
    }

    clearGateTimer();
  };

  if (!isUnlocked) {
    return (
      <Screen>
        <View style={styles.gateContainer}>
          <AppCard style={styles.gateCard}>
            <Text style={styles.eyebrow}>Góc phụ huynh</Text>
            <Text style={styles.title}>Ba mẹ hãy giữ nút này trong 3 giây</Text>
            <Pressable
              accessibilityRole="button"
              onPressIn={handleHoldStart}
              onPressOut={handleHoldEnd}
              style={({ pressed }) => [
                styles.holdButton,
                (pressed || isHolding) && styles.holdButtonActive,
              ]}
            >
              <Text style={styles.holdButtonText}>
                {isHolding ? 'Đang giữ...' : 'Giữ để mở'}
              </Text>
            </Pressable>
          </AppCard>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Demo offline</Text>
        <Text style={styles.title}>Thống kê học tập</Text>
      </View>

      <View style={styles.grid}>
        <StatTile label="Từ bé đã học" value={learnedWordCount} />
        <StatTile label="Bài hoàn thành" value={completedLessonCount} />
        <StatTile label="Sticker đã nhận" value={earnedStickerCount} />
      </View>

      <AppCard style={styles.summary}>
        <Text style={styles.summaryLabel}>Gợi ý ôn tập ngoài đời</Text>
        <Text style={styles.summaryValue}>
          Hôm nay bé học: {learnedMorningWords.join(', ')}.
        </Text>
        <Text style={styles.tip}>
          {
            'Khi ở nhà, ba mẹ có thể hỏi bé: Where is the toothbrush? hoặc What is this?'
          }
        </Text>
      </AppCard>

      <AppCard style={styles.privacyCard}>
        <Text style={styles.privacyText}>
          Ứng dụng không có quảng cáo, không có link ngoài và không thu thập
          thông tin trẻ em.
        </Text>
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: colors.accent,
    ...typography.caption,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  gateCard: {
    gap: spacing.lg,
  },
  gateContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  holdButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 72,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  holdButtonActive: {
    backgroundColor: colors.primaryDark,
  },
  holdButtonText: {
    color: colors.white,
    textAlign: 'center',
    ...typography.button,
  },
  privacyCard: {
    marginTop: spacing.lg,
  },
  privacyText: {
    color: colors.textSoft,
    ...typography.body,
  },
  summary: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  summaryLabel: {
    color: colors.accent,
    ...typography.subtitle,
  },
  summaryValue: {
    color: colors.text,
    ...typography.body,
  },
  tip: {
    color: colors.textSoft,
    ...typography.body,
  },
  title: {
    color: colors.text,
    ...typography.title,
  },
});
