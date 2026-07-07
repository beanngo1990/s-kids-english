import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { AppLogo } from '../components/AppLogo';
import { KidBadge } from '../components/KidBadge';
import { MascotImage, MascotSpeechBubble } from '../components/mascot';
import { Screen } from '../components/Screen';
import {
  sungyOnboardingGreeting,
  sungyOnboardingTapMessages,
} from '../data/mascotPrompts';
import { playTapSound, speakVi } from '../engine/AudioManager';
import {
  completeParentOnboarding,
  learningDifficultyOptions,
} from '../engine/ParentSettingsManager';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import type { LearningMode } from '../types/lesson';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

function speakSungyLine(message: string) {
  playTapSound().catch(() => undefined);
  speakVi(message).catch(() => undefined);
}

export function OnboardingScreen({ navigation }: Props) {
  const [selectedMode, setSelectedMode] = useState<LearningMode>('core');
  const [isSaving, setIsSaving] = useState(false);

  const handleStart = async () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      await completeParentOnboarding(selectedMode);
      navigation.replace('Home');
    } catch {
      setIsSaving(false);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.heroBrand}>
            <AppLogo size={76} />
            <MascotImage
              accessibilityLabel="Sungy, bạn học của bé"
              onPress={() => speakSungyLine(sungyOnboardingGreeting)}
              pose="hello"
              size={132}
              style={styles.heroMascot}
            />
          </View>
          <KidBadge tone="sun">Dành cho ba mẹ</KidBadge>
          <Text style={styles.title}>Chọn độ khó cho bé</Text>
          <Text style={styles.subtitle}>
            Bé sẽ chỉ thấy bản đồ học tập. Ba mẹ có thể đổi lại trong Góc phụ
            huynh bất cứ lúc nào.
          </Text>
          <MascotSpeechBubble
            mascotSize="avatar"
            message="Sungy sẽ đồng hành, nhắc bé học từng trạm và cổ vũ khi bé hoàn thành."
            onMascotPress={speakSungyLine}
            style={styles.coachBubble}
            tapMessages={sungyOnboardingTapMessages}
            title="Bạn học của bé"
            tone="guide"
          />
        </View>

        <View style={styles.optionList}>
          {learningDifficultyOptions.map(option => {
            const isSelected = option.learningMode === selectedMode;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                key={option.learningMode}
                onPress={() => setSelectedMode(option.learningMode)}
                style={({ pressed }) => [
                  styles.option,
                  isSelected && styles.optionSelected,
                  pressed && styles.optionPressed,
                ]}
              >
                <View
                  style={[
                    styles.optionMark,
                    isSelected && styles.optionMarkSelected,
                  ]}
                >
                  <Text style={styles.optionMarkText}>
                    {isSelected ? '✓' : ''}
                  </Text>
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                  <Text style={styles.optionDetail}>{option.detail}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <AppButton
          disabled={isSaving}
          title={isSaving ? 'Đang lưu...' : 'Bắt đầu'}
          onPress={handleStart}
        />

        <AppCard style={styles.noteCard}>
          <Text style={styles.noteTitle}>Gợi ý nhanh</Text>
          <Text style={styles.noteText}>
            Nếu bé mới bắt đầu, chọn Dễ trước. Khi bé quen nhịp học, ba mẹ tăng
            lên Vừa hoặc Khó.
          </Text>
        </AppCard>

      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  coachBubble: {
    marginTop: spacing.xs,
  },
  heroBrand: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  heroMascot: {
    marginBottom: -spacing.xs,
  },
  noteCard: {
    backgroundColor: colors.surfaceBlue,
    gap: spacing.xs,
  },
  noteText: {
    color: colors.textSoft,
    ...typography.body,
  },
  noteTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  option: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 104,
    padding: spacing.md,
    ...shadows.soft,
  },
  optionDetail: {
    color: colors.textSoft,
    ...typography.caption,
  },
  optionList: {
    gap: spacing.md,
  },
  optionMark: {
    alignItems: 'center',
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  optionMarkSelected: {
    backgroundColor: colors.green,
    borderColor: colors.white,
  },
  optionMarkText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 28,
  },
  optionPressed: {
    opacity: 0.92,
    transform: [{ translateY: 2 }, { scale: 0.99 }],
  },
  optionSelected: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
    ...shadows.warm,
  },
  optionSubtitle: {
    color: colors.primaryDark,
    ...typography.caption,
  },
  optionText: {
    flex: 1,
    gap: spacing.xxs,
  },
  optionTitle: {
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
});
