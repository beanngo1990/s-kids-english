import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';

import { AppCard } from '../../components/AppCard';
import { KidBadge } from '../../components/KidBadge';
import { KidIconButton } from '../../components/KidIconButton';
import { SKidsIcon } from '../../components/SKidsIcon';
import {
  playCorrectSound,
  playWrongSound,
  speakWord,
} from '../../engine/AudioManager';
import { createShakeAnimation } from '../../engine/animations';
import { useI18n } from '../../i18n';
import { colors, createThemedStyles, useThemeSync } from '../../theme/colors';
import { useResponsiveLayout } from '../../theme/responsive';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export type ListenChooseItem = {
  id: string;
  imageSource: ImageSourcePropType;
  meaningVi: string;
  word: string;
};

type ListenChooseGameProps = {
  items: ListenChooseItem[];
  onComplete: () => void;
  onMatch?: (wordId: string, isFirstTry: boolean) => Promise<{ xpGained: number } | void> | void;
};

type OptionState = 'correct' | 'wrong' | null;

const BUBBLE_PALETTES = [
  { bg: '#E0F2FE', border: '#38BDF8', shine: '#F0F9FF' }, // Sky Blue
  { bg: '#F3E8FF', border: '#C084FC', shine: '#FAF5FF' }, // Soft Purple (Replaced Red/Pink)
  { bg: '#DCFCE7', border: '#34D399', shine: '#F0FDF4' }, // Mint Green
  { bg: '#FEF9C3', border: '#FACC15', shine: '#FEFCE8' }, // Sunny Yellow
];

export function ListenChooseGame({
  items,
  onComplete,
  onMatch,
}: ListenChooseGameProps) {
  useThemeSync();
  const t = useI18n();
  const responsiveLayout = useResponsiveLayout();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [optionState, setOptionState] = useState<OptionState>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const firstTryRef = useRef(true);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentTarget = items[currentIndex];

  // Prepare shuffled options for current target (target + distractors)
  const options = useMemo(() => {
    if (!currentTarget || items.length === 0) {
      return [];
    }
    const distractors = items.filter(item => item.id !== currentTarget.id);
    const shuffledDistractors = [...distractors].sort(() => Math.random() - 0.5);
    const numOptions = Math.min(items.length, 4);
    const selectedDistractors = shuffledDistractors.slice(0, numOptions - 1);
    const roundOptions = [currentTarget, ...selectedDistractors];
    return roundOptions.sort(() => Math.random() - 0.5);
  }, [currentTarget, items]);

  const handlePlayAudio = useCallback(() => {
    if (currentTarget) {
      speakWord(currentTarget.word).catch(() => undefined);
    }
  }, [currentTarget]);

  // Play audio on round start
  useEffect(() => {
    firstTryRef.current = true;
    setSelectedOptionId(null);
    setOptionState(null);
    setIsTransitioning(false);

    if (currentTarget) {
      const timer = setTimeout(() => {
        handlePlayAudio();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentTarget, handlePlayAudio]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  const handleOptionPress = (
    option: ListenChooseItem,
    triggerPopAnim?: () => void,
    triggerShakeAnim?: () => void,
  ) => {
    if (isTransitioning || !currentTarget) {
      return;
    }

    if (option.id === currentTarget.id) {
      // Correct answer - POP!
      setIsTransitioning(true);
      setSelectedOptionId(option.id);
      setOptionState('correct');
      if (triggerPopAnim) {
        triggerPopAnim();
      }

      playCorrectSound().catch(() => undefined);
      speakWord(currentTarget.word).catch(() => undefined);

      if (onMatch) {
        onMatch(currentTarget.id, firstTryRef.current);
      }

      transitionTimerRef.current = setTimeout(() => {
        if (currentIndex + 1 < items.length) {
          setCurrentIndex(prev => prev + 1);
        } else {
          onComplete();
        }
      }, 1200);
    } else {
      // Wrong answer - Shake!
      firstTryRef.current = false;
      setSelectedOptionId(option.id);
      setOptionState('wrong');
      if (triggerShakeAnim) {
        triggerShakeAnim();
      }

      playWrongSound().catch(() => undefined);

      setTimeout(() => {
        setSelectedOptionId(null);
        setOptionState(null);
      }, 700);
    }
  };

  if (!currentTarget || items.length === 0) {
    return null;
  }

  const isTablet = responsiveLayout.isTablet;

  return (
    <View style={styles.container}>
      {/* Compact Prompt Header Bar */}
      <AppCard style={styles.promptCard}>
        <View style={styles.promptLeft}>
          <KidIconButton
            accessibilityLabel={t('listenChooseGame.listenAgain')}
            icon="listen"
            onPress={handlePlayAudio}
            size="md"
            tone="primary"
          />
        </View>

        <View style={styles.promptRight}>
          <KidBadge tone="sun">
            {t('listenChooseGame.progress', {
              current: String(currentIndex + 1),
              total: String(items.length),
            })}
          </KidBadge>
          <Text numberOfLines={1} style={styles.promptTitle}>
            🎈 {t('listenChooseGame.prompt')}
          </Text>
        </View>
      </AppCard>

      {/* Floating Bubbles 2x2 Grid */}
      <View
        style={[
          styles.optionsGrid,
          isTablet && styles.optionsGridTablet,
        ]}
      >
        {options.map((option, index) => (
          <FloatingBubbleItem
            key={option.id}
            index={index}
            isCorrect={selectedOptionId === option.id && optionState === 'correct'}
            isDisabled={isTransitioning}
            isSelected={selectedOptionId === option.id}
            isTablet={isTablet}
            isWrong={selectedOptionId === option.id && optionState === 'wrong'}
            option={option}
            palette={BUBBLE_PALETTES[index % BUBBLE_PALETTES.length]}
            onPress={(pop, shake) => handleOptionPress(option, pop, shake)}
          />
        ))}
      </View>
    </View>
  );
}

type FloatingBubbleItemProps = {
  index: number;
  isCorrect: boolean;
  isDisabled: boolean;
  isSelected: boolean;
  isTablet: boolean;
  isWrong: boolean;
  onPress: (popAnim: () => void, shakeAnim: () => void) => void;
  option: ListenChooseItem;
  palette: typeof BUBBLE_PALETTES[number];
};

function FloatingBubbleItem({
  index,
  isCorrect,
  isDisabled,
  isTablet,
  isWrong,
  onPress,
  option,
  palette,
}: FloatingBubbleItemProps) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Continuous floating bobbing animation (closed 0 -> -7 -> +7 -> 0 loop)
  useEffect(() => {
    const halfCycle = 900 + (index % 4) * 200;
    const loopAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          duration: halfCycle,
          easing: Easing.inOut(Easing.sin),
          toValue: -7,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          duration: halfCycle * 2,
          easing: Easing.inOut(Easing.sin),
          toValue: 7,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          duration: halfCycle,
          easing: Easing.inOut(Easing.sin),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loopAnim.start();
    return () => loopAnim.stop();
  }, [floatAnim, index]);

  const triggerPop = useCallback(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        friction: 4,
        toValue: 1.15,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        friction: 5,
        toValue: 1.05,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim]);

  const triggerShake = useCallback(() => {
    createShakeAnimation(shakeAnim).start();
  }, [shakeAnim]);

  return (
    <Animated.View
      style={[
        styles.bubbleWrapper,
        isTablet && styles.bubbleWrapperTablet,
        {
          transform: [
            { translateY: floatAnim },
            { translateX: shakeAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <Pressable
        accessibilityLabel={option.word}
        accessibilityRole="button"
        disabled={isDisabled}
        onPress={() => onPress(triggerPop, triggerShake)}
        style={({ pressed }) => [
          styles.bubbleCard,
          isTablet && styles.bubbleCardTablet,
          {
            backgroundColor: isCorrect
              ? colors.mint
              : isWrong
              ? '#FFE4E6'
              : palette.bg,
            borderColor: isCorrect
              ? colors.primary
              : isWrong
              ? colors.accentDark
              : palette.border,
          },
          pressed && !isDisabled && styles.bubblePressed,
        ]}
      >
        {/* Glossy shine highlight on top-left of bubble */}
        <View style={styles.bubbleShine} />

        <View style={styles.imageWrapper}>
          <Image
            resizeMode="contain"
            source={option.imageSource}
            style={[styles.optionImage, isTablet && styles.optionImageTablet]}
          />
        </View>

        {isCorrect ? (
          <View style={styles.feedbackBadgeCorrect}>
            <SKidsIcon name="star" size={16} />
            <Text style={styles.feedbackTextCorrect}>{option.word}</Text>
          </View>
        ) : isWrong ? (
          <View style={styles.feedbackBadgeWrong}>
            <Text style={styles.feedbackTextWrong}>✕</Text>
          </View>
        ) : null}

        {/* Bubble knot at bottom */}
        <View style={[styles.bubbleKnot, { backgroundColor: palette.border }]} />
      </Pressable>
    </Animated.View>
  );
}

const styles = createThemedStyles(() => ({
  bubbleCard: {
    alignItems: 'center',
    borderRadius: 65,
    borderWidth: 3.5,
    elevation: 3,
    height: 130,
    justifyContent: 'center',
    overflow: 'hidden',
    padding: spacing.xs,
    position: 'relative',
    shadowColor: colors.shadow,
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    width: 130,
  },
  bubbleCardTablet: {
    borderRadius: 85,
    height: 170,
    width: 170,
  },
  bubbleKnot: {
    borderRadius: radius.pill,
    bottom: 3,
    height: 5,
    position: 'absolute',
    width: 12,
  },
  bubblePressed: {
    opacity: 0.85,
    transform: [{ scale: 0.94 }],
  },
  bubbleShine: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 15,
    height: 22,
    left: 12,
    position: 'absolute',
    top: 10,
    transform: [{ rotate: '-35deg' }],
    width: 36,
  },
  bubbleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  bubbleWrapperTablet: {
    margin: spacing.sm,
  },
  container: {
    gap: spacing.sm,
  },
  feedbackBadgeCorrect: {
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    borderRadius: radius.pill,
    bottom: 6,
    flexDirection: 'row',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    position: 'absolute',
  },
  feedbackBadgeWrong: {
    alignItems: 'center',
    backgroundColor: colors.accentDark,
    borderRadius: radius.pill,
    bottom: 6,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    position: 'absolute',
  },
  feedbackTextCorrect: {
    ...typography.caption,
    color: colors.white,
    fontSize: 11,
  },
  feedbackTextWrong: {
    ...typography.caption,
    color: colors.white,
    fontSize: 11,
  },
  imageWrapper: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    maxHeight: 85,
    maxWidth: 85,
    width: '100%',
  },
  optionImage: {
    height: '100%',
    maxHeight: 75,
    maxWidth: 75,
    width: '100%',
  },
  optionImageTablet: {
    maxHeight: 100,
    maxWidth: 100,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  optionsGridTablet: {
    gap: spacing.lg,
    paddingVertical: spacing.sm,
  },
  promptCard: {
    alignItems: 'center',
    backgroundColor: colors.cream,
    borderColor: colors.borderWarm,
    borderRadius: radius.xl,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  promptLeft: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptRight: {
    alignItems: 'flex-start',
    flex: 1,
    gap: spacing.xxs,
    paddingLeft: spacing.sm,
  },
  promptTitle: {
    color: colors.primaryDark,
    textAlign: 'left',
    ...typography.subtitle,
    fontSize: 15,
    lineHeight: 20,
  },
}));

