import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '../components/AppCard';
import { KidBadge } from '../components/KidBadge';
import { Screen } from '../components/Screen';
import { StatTile } from '../components/StatTile';
import { lessons } from '../data/lessons';
import {
  getLearningDifficultyOption,
  getParentSettings,
  learningDifficultyOptions,
  saveParentLearningMode,
} from '../engine/ParentSettingsManager';
import {
  getLessonVocabulary,
  getProgress,
  type LocalProgress,
} from '../engine/ProgressManager';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { LearningMode } from '../types/lesson';

const GATE_DURATION_MS = 3000;

export function ParentScreen() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [learningMode, setLearningMode] = useState<LearningMode>('core');
  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const [savingMode, setSavingMode] = useState<LearningMode | null>(null);
  const gateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const learnedWordCount = progress?.learnedWordIds.length ?? 0;
  const completedLessonCount = progress?.completedLessonIds.length ?? 0;
  const earnedStickerCount = progress?.earnedStickerIds.length ?? 0;

  const recentLearnedWords = useMemo(() => {
    if (!progress || progress.learnedWordIds.length === 0) {
      return [];
    }
    const allVocabs = lessons.flatMap(lesson => getLessonVocabulary(lesson));
    const words = progress.learnedWordIds
      .map(id => allVocabs.find(v => v.id === id)?.word)
      .filter((word): word is string => !!word);
    return words.slice(-3);
  }, [progress]);

  const recentLessonId = progress?.completedLessonIds[progress?.completedLessonIds.length - 1];
  const recentLesson = lessons.find(l => l.id === recentLessonId);
  const currentDifficulty = getLearningDifficultyOption(learningMode);
  const tipText = recentLesson?.metadata?.parentTipVi ?? (
    recentLearnedWords.length > 0 
      ? `Ba mẹ có thể chỉ vào đồ vật thật và hỏi bé: "Where is the ${recentLearnedWords[0]}?" hoặc "What is this?" để giúp bé nhớ lâu hơn.`
      : 'Bé chưa học từ vựng nào. Ba mẹ hãy cùng bé bắt đầu bài học đầu tiên nhé!'
  );

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
    getParentSettings()
      .then(settings => setLearningMode(settings.learningMode))
      .catch(() => setLearningMode('core'));
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

  const handleSelectLearningMode = async (nextLearningMode: LearningMode) => {
    if (savingMode) {
      return;
    }

    setSavingMode(nextLearningMode);
    try {
      const nextSettings = await saveParentLearningMode(nextLearningMode);
      setLearningMode(nextSettings.learningMode);
    } catch {
      // Settings are local best-effort; keep the current mode if saving fails.
    } finally {
      setSavingMode(null);
    }
  };

  if (!isUnlocked) {
    return (
      <Screen>
        <View style={styles.gateContainer}>
          <AppCard style={styles.gateCard}>
            <KidBadge tone="teal">Góc phụ huynh</KidBadge>
            <Text style={styles.title}>Khu vực dành cho ba mẹ</Text>
            <Text style={styles.gateHint}>
              Giữ nút trong 3 giây để mở thống kê và cài đặt học tập.
            </Text>
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
        <KidBadge tone="sky">Demo offline</KidBadge>
        <Text style={styles.title}>Thống kê học tập</Text>
        <Text style={styles.headerCopy}>
          Theo dõi tiến độ nhẹ nhàng, không tạo áp lực cho bé.
        </Text>
      </View>

      <View style={styles.grid}>
        <StatTile icon="Aa" label="Từ bé đã học" value={learnedWordCount} />
        <StatTile icon="★" label="Bài hoàn thành" value={completedLessonCount} />
        <StatTile icon="✓" label="Sticker đã nhận" value={earnedStickerCount} />
      </View>

      <AppCard style={styles.settingsCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleGroup}>
            <KidBadge tone="teal">Cài đặt học tập</KidBadge>
            <Text style={styles.privacyTitle}>Độ khó của bé</Text>
          </View>
          <KidBadge tone="sky">Đang dùng: {currentDifficulty.title}</KidBadge>
        </View>
        <View style={styles.difficultyList}>
          {learningDifficultyOptions.map(option => {
            const isSelected = option.learningMode === learningMode;
            const isSavingThisMode = savingMode === option.learningMode;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                disabled={Boolean(savingMode)}
                key={option.learningMode}
                onPress={() => handleSelectLearningMode(option.learningMode)}
                style={({ pressed }) => [
                  styles.difficultyOption,
                  isSelected && styles.difficultyOptionSelected,
                  pressed && !savingMode && styles.pressed,
                  savingMode && !isSavingThisMode && styles.optionDisabled,
                ]}
              >
                <View style={styles.difficultyText}>
                  <Text style={styles.difficultyTitle}>{option.title}</Text>
                  <Text style={styles.difficultySubtitle}>
                    {option.subtitle}
                  </Text>
                </View>
                <Text style={styles.difficultyState}>
                  {isSavingThisMode ? 'Đang lưu...' : isSelected ? '✓' : ''}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </AppCard>

      <AppCard style={styles.summary}>
        <KidBadge tone="sun">Gợi ý ôn tập ngoài đời</KidBadge>
        {recentLearnedWords.length > 0 ? (
          <Text style={styles.summaryValue}>
            Gần đây bé đã học: {recentLearnedWords.join(', ')}.
          </Text>
        ) : null}
        <Text style={styles.tip}>
          {tipText}
        </Text>
      </AppCard>

      <AppCard style={styles.privacyCard}>
        <Text style={styles.privacyTitle}>An toàn cho trẻ</Text>
        <Text style={styles.privacyText}>
          Ứng dụng không có quảng cáo, không có link ngoài và không thu thập
          thông tin trẻ em.
        </Text>
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  difficultyList: {
    gap: spacing.sm,
  },
  difficultyOption: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    minHeight: 76,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  difficultyOptionSelected: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
  },
  difficultyState: {
    color: colors.primaryDark,
    minWidth: 72,
    textAlign: 'right',
    ...typography.caption,
  },
  difficultySubtitle: {
    color: colors.textSoft,
    ...typography.caption,
  },
  difficultyText: {
    flex: 1,
    gap: spacing.xxs,
  },
  difficultyTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
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
  gateHint: {
    color: colors.textSoft,
    ...typography.body,
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  headerCopy: {
    color: colors.textSoft,
    ...typography.body,
  },
  holdButton: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderColor: colors.white,
    borderWidth: 2,
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 72,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  holdButtonActive: {
    backgroundColor: colors.secondaryDark,
  },
  holdButtonText: {
    color: colors.text,
    textAlign: 'center',
    ...typography.button,
  },
  privacyCard: {
    backgroundColor: colors.surfaceBlue,
    marginTop: spacing.lg,
  },
  privacyText: {
    color: colors.textSoft,
    ...typography.body,
  },
  privacyTitle: {
    color: colors.text,
    marginBottom: spacing.xs,
    ...typography.subtitle,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ translateY: 2 }, { scale: 0.99 }],
  },
  optionDisabled: {
    opacity: 0.56,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  sectionTitleGroup: {
    flex: 1,
    gap: spacing.xs,
  },
  settingsCard: {
    gap: spacing.md,
    marginTop: spacing.xl,
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
