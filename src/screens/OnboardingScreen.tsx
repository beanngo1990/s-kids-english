import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { KidBadge } from '../components/KidBadge';
import { MascotImage } from '../components/mascot';
import { Screen } from '../components/Screen';
import { SKidsIcon } from '../components/SKidsIcon';
import { SparkleEffect } from '../components/SparkleEffect';
import type { SKidsIconName } from '../assets/icons/skids';
import { playTapSound, speakVi, speakWord } from '../engine/AudioManager';
import {
  completeParentOnboarding,
  learningDifficultyOptions,
} from '../engine/ParentSettingsManager';
import { useSavedAppLanguage, useTranslations } from '../i18n';
import { getLearningModeCopy } from '../i18n/learningModeCopy';
import type { AppLanguage } from '../i18n/types';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import type { LearningMode } from '../types/lesson';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

function speakSungyLine(message: string, language: AppLanguage = 'vi') {
  playTapSound().catch(() => undefined);
  const speech = language === 'en' ? speakWord(message) : speakVi(message);
  speech.catch(() => undefined);
}

function useSafeTopInset(): number {
  try {
    const insets = useSafeAreaInsets();
    return insets.top;
  } catch {
    return 0;
  }
}

function useSafeBottomInset(): number {
  try {
    const insets = useSafeAreaInsets();
    return insets.bottom;
  } catch {
    return 0;
  }
}

export function OnboardingScreen({ navigation }: Props) {
  useThemeSync();
  const topInset = useSafeTopInset();
  const bottomInset = useSafeBottomInset();
  const appLanguage = useSavedAppLanguage();
  const t = useTranslations(appLanguage);
  const sungyOnboardingGreeting = t('onboarding.coach.greeting');
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [selectedMode, setSelectedMode] = useState<LearningMode>('expanded');
  const [isSaving, setIsSaving] = useState(false);
  const [sparklesActive, setSparklesActive] = useState(false);

  const bottomPadding = Math.max(bottomInset, spacing.xs);
  const backButtonTop = Math.max(topInset, spacing.xs) + 4;
  const contentTopPadding = Math.max(topInset, spacing.xs);

  useEffect(() => {
    // Tự động cất tiếng chào Sungy và phát hiệu ứng lấp lánh khi mở Onboarding Bước 1
    const timer = setTimeout(() => {
      speakSungyLine(sungyOnboardingGreeting, appLanguage);
      setSparklesActive(true);

      const hideSparklesTimer = setTimeout(() => {
        setSparklesActive(false);
      }, 850);

      return () => clearTimeout(hideSparklesTimer);
    }, 450);

    return () => clearTimeout(timer);
  }, [appLanguage, sungyOnboardingGreeting]);

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

  const handleNextStep = () => {
    playTapSound().catch(() => undefined);
    setCurrentStep(2);
  };

  const handlePrevStep = () => {
    playTapSound().catch(() => undefined);
    setCurrentStep(1);
  };

  type FeatureItem =
    | {
        type: 'skidsIcon';
        iconName: SKidsIconName;
        title: string;
        text: string;
      }
    | {
        type: 'mascot';
        title: string;
        text: string;
      };

  const features: FeatureItem[] = [
    {
      type: 'skidsIcon',
      iconName: 'bedroom',
      title: t('onboarding.step1.feature1.title'),
      text: t('onboarding.step1.feature1.text'),
    },
    {
      type: 'skidsIcon',
      iconName: 'friendGames',
      title: t('onboarding.step1.feature2.title'),
      text: t('onboarding.step1.feature2.text'),
    },
    {
      type: 'mascot',
      title: t('onboarding.step1.feature3.title'),
      text: t('onboarding.step1.feature3.text'),
    },
  ];

  const handleMascotPress = () => {
    speakSungyLine(sungyOnboardingGreeting, appLanguage);
    setSparklesActive(true);
    setTimeout(() => {
      setSparklesActive(false);
    }, 850);
  };

  return (
    <Screen scroll={false} withBottomSpace={false}>
      <View style={styles.screenWrapper}>
        {currentStep === 2 && (
          <Pressable
            accessibilityLabel={t('onboarding.step2.back')}
            accessibilityRole="button"
            onPress={handlePrevStep}
            style={[styles.topLeftBackButton, { top: backButtonTop }]}
          >
            <Text style={styles.backArrowText}>←</Text>
          </Pressable>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: contentTopPadding },
          ]}
        >
          {currentStep === 1 ? (
            <>
              <View style={styles.hero}>
                <View style={styles.heroMascotBox}>
                  <MascotImage
                    accessibilityLabel={t('onboarding.mascotAccessibility')}
                    onPress={handleMascotPress}
                    pose="letsGo"
                    size={120}
                    style={styles.heroMascot}
                  />
                  <SparkleEffect active={sparklesActive} />
                </View>
                <KidBadge tone="sun">{t('onboarding.coach.title')}</KidBadge>
                <Text style={styles.title}>{t('onboarding.step1.title')}</Text>
                <Text style={styles.subtitle}>
                  {t('onboarding.step1.subtitle')}
                </Text>
              </View>

              <View style={styles.featureList}>
                {features.map((feature, idx) => (
                  <AppCard key={idx} style={styles.featureCard}>
                    <View style={styles.featureIconBox}>
                      {feature.type === 'mascot' ? (
                        <MascotImage decorative pose="learn" size={44} />
                      ) : (
                        <SKidsIcon name={feature.iconName} size={36} />
                      )}
                    </View>
                    <View style={styles.featureTextBox}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureText}>{feature.text}</Text>
                    </View>
                  </AppCard>
                ))}
              </View>
            </>
          ) : (
            <>
              <View style={styles.heroCompact}>
                <MascotImage
                  accessibilityLabel={t('onboarding.mascotAccessibility')}
                  onPress={() =>
                    speakSungyLine(sungyOnboardingGreeting, appLanguage)
                  }
                  pose="hello"
                  size={92}
                  style={styles.heroMascotCompact}
                />
                <KidBadge tone="sun">{t('onboarding.parentBadge')}</KidBadge>
                <Text style={styles.titleCompact}>{t('onboarding.title')}</Text>
                <Text style={styles.subtitleCompact}>
                  {t('onboarding.subtitle')}
                </Text>
              </View>

              <View style={styles.optionList}>
                {learningDifficultyOptions.map(option => {
                  const isSelected = option.learningMode === selectedMode;
                  const optionCopy = getLearningModeCopy(
                    option.learningMode,
                    t,
                  );

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
                        <Text style={styles.optionTitle}>
                          {optionCopy.title}
                        </Text>
                        <Text style={styles.optionSubtitle}>
                          {optionCopy.subtitle}
                        </Text>
                        <Text style={styles.optionDetail}>
                          {optionCopy.detail}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              <AppCard style={styles.noteCard}>
                <Text style={styles.noteTitle}>
                  {t('onboarding.note.title')}
                </Text>
                <Text style={styles.noteText}>{t('onboarding.note.text')}</Text>
              </AppCard>
            </>
          )}
        </ScrollView>

        <View style={[styles.fixedFooter, { paddingBottom: bottomPadding }]}>
          <View style={styles.stepProgressContainer}>
            <View
              style={[
                styles.stepDot,
                currentStep === 1 ? styles.stepDotActive : styles.stepDotInactive,
              ]}
            />
            <View
              style={[
                styles.stepDot,
                currentStep === 2 ? styles.stepDotActive : styles.stepDotInactive,
              ]}
            />
          </View>

          {currentStep === 1 ? (
            <AppButton
              title={t('onboarding.step1.continue')}
              onPress={handleNextStep}
            />
          ) : (
            <AppButton
              disabled={isSaving}
              title={
                isSaving ? t('onboarding.startSaving') : t('onboarding.start')
              }
              onPress={handleStart}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = createThemedStyles(() => ({
  backArrowText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  featureCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.soft,
  },
  featureIconBox: {
    alignItems: 'center',
    backgroundColor: colors.surfaceBlue,
    borderRadius: radius.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  featureList: {
    gap: spacing.xs,
  },
  featureText: {
    color: colors.textSoft,
    ...typography.caption,
  },
  featureTextBox: {
    flex: 1,
    gap: 2,
  },
  featureTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  fixedFooter: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1.5,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    ...shadows.warm,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  heroCompact: {
    alignItems: 'center',
    gap: spacing.xxs,
    paddingTop: spacing.xxs,
  },
  heroMascot: {
    marginBottom: -spacing.xxs,
  },
  heroMascotBox: {
    position: 'relative',
  },
  heroMascotCompact: {
    marginBottom: -spacing.xxs,
  },
  noteCard: {
    backgroundColor: colors.surfaceBlue,
    gap: spacing.xxs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  noteText: {
    color: colors.textSoft,
    ...typography.caption,
  },
  noteTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  option: {
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 76,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...shadows.soft,
  },
  optionDetail: {
    color: colors.textSoft,
    ...typography.caption,
  },
  optionList: {
    gap: spacing.xs,
  },
  optionMark: {
    alignItems: 'center',
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 38,
    justifyContent: 'center',
    marginTop: 2,
    width: 38,
  },
  optionMarkSelected: {
    backgroundColor: colors.green,
    borderColor: colors.white,
  },
  optionMarkText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 22,
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
    color: colors.textSoft,
    ...typography.caption,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  screenWrapper: {
    flex: 1,
  },
  stepDot: {
    borderRadius: 4,
    height: 8,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
    width: 20,
  },
  stepDotInactive: {
    backgroundColor: colors.border,
    width: 8,
  },
  stepProgressContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSoft,
    textAlign: 'center',
    ...typography.body,
  },
  subtitleCompact: {
    color: colors.textSoft,
    textAlign: 'center',
    ...typography.caption,
  },
  title: {
    color: colors.text,
    textAlign: 'center',
    ...typography.title,
  },
  titleCompact: {
    color: colors.text,
    textAlign: 'center',
    ...typography.subtitle,
  },
  topLeftBackButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    height: 40,
    justifyContent: 'center',
    left: spacing.md,
    position: 'absolute',
    top: spacing.xs,
    width: 40,
    zIndex: 10,
    ...shadows.soft,
  },
}));




