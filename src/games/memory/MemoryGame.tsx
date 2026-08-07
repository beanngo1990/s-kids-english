import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  Text,
  View,
  type ImageSourcePropType,
  type ViewStyle,
} from 'react-native';

import { MascotImage } from '../../components/mascot';
import { ReviewGameCoach } from '../../components/ReviewGameCoach';
import { SparkleEffect } from '../../components/SparkleEffect';
import {
  playCorrectSound,
  playTapSound,
  playWrongSound,
  speakWord,
} from '../../engine/AudioManager';
import {
  createBounceAnimation,
  createShakeAnimation,
} from '../../engine/animations';
import { useI18n } from '../../i18n';
import { colors, createThemedStyles, useThemeSync } from '../../theme/colors';
import { useReducedMotion } from '../../theme/motion';
import {
  type ResponsiveLayout,
  useResponsiveLayout,
} from '../../theme/responsive';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { LearningMode } from '../../types/lesson';
import { getReviewDifficultyProfile } from '../difficulty';
import {
  runGameMatchCallback,
  useGameFeedback,
  type GameMatchCallback,
} from '../useGameFeedback';

export type MemoryGameItem = {
  id: string;
  imageSource: ImageSourcePropType;
  meaningVi: string;
  word: string;
};

type MemoryCard = MemoryGameItem & {
  cardId: string;
  itemId: string;
};

type MemoryGameProps = {
  isIntroPlaying?: boolean;
  items: MemoryGameItem[];
  learningMode?: LearningMode;
  onComplete: () => void;
  onMatch?: GameMatchCallback;
};

export function MemoryGame({
  isIntroPlaying = false,
  items,
  learningMode = 'core',
  onComplete,
  onMatch,
}: MemoryGameProps) {
  useThemeSync();
  const t = useI18n();
  const responsiveLayout = useResponsiveLayout();
  const reduceMotion = useReducedMotion();
  const difficulty = getReviewDifficultyProfile(learningMode);
  const { feedback, resetFeedback, showFeedback } = useGameFeedback();
  const itemKey = useMemo(() => items.map(item => item.id).join('|'), [items]);
  const [cards, setCards] = useState<MemoryCard[]>(() =>
    createShuffledCards(items),
  );
  const [openCardIds, setOpenCardIds] = useState<string[]>([]);
  const [matchedItemIds, setMatchedItemIds] = useState<string[]>([]);
  const [isCheckingPair, setIsCheckingPair] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const missedItemIdsRef = useRef<Set<string>>(new Set());
  const pairTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roundVersionRef = useRef(0);
  const didCompleteRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const reduceMotionRef = useRef(reduceMotion);
  const isComplete = items.length > 0 && matchedItemIds.length === items.length;
  const gridLayout = useMemo(
    () => getMemoryGridLayout(cards.length, responsiveLayout),
    [cards.length, responsiveLayout],
  );

  onCompleteRef.current = onComplete;
  reduceMotionRef.current = reduceMotion;

  useEffect(() => {
    roundVersionRef.current += 1;
    clearTimer(pairTimerRef);
    clearTimer(completionTimerRef);
    setCards(createShuffledCards(items));
    setOpenCardIds([]);
    setMatchedItemIds([]);
    setIsCheckingPair(false);
    setTurnCount(0);
    missedItemIdsRef.current = new Set();
    didCompleteRef.current = false;
    resetFeedback();
  }, [itemKey, items, resetFeedback]);

  useEffect(() => {
    return () => {
      roundVersionRef.current += 1;
      clearTimer(pairTimerRef);
      clearTimer(completionTimerRef);
    };
  }, []);

  useEffect(() => {
    if (!isComplete || didCompleteRef.current) {
      return;
    }

    didCompleteRef.current = true;
    const roundVersion = roundVersionRef.current;
    completionTimerRef.current = setTimeout(
      () => {
        completionTimerRef.current = null;
        if (roundVersion === roundVersionRef.current) {
          onCompleteRef.current();
        }
      },
      reduceMotionRef.current ? 320 : 650,
    );

    return () => clearTimer(completionTimerRef);
  }, [isComplete]);

  const handleCardPress = (card: MemoryCard) => {
    const isCardVisible =
      openCardIds.includes(card.cardId) || matchedItemIds.includes(card.itemId);

    if (isIntroPlaying || isCheckingPair || isComplete || isCardVisible) {
      return;
    }

    resetFeedback();
    playTapSound().catch(() => undefined);
    if (difficulty.selectionAudioEnabled) {
      speakWord(card.word).catch(() => undefined);
    }

    if (openCardIds.length === 0) {
      setOpenCardIds([card.cardId]);
      return;
    }

    const firstCard = cards.find(item => item.cardId === openCardIds[0]);
    if (!firstCard) {
      setOpenCardIds([card.cardId]);
      return;
    }

    const nextOpenCardIds = [firstCard.cardId, card.cardId];
    const isMatchingPair = firstCard.itemId === card.itemId;
    const roundVersion = roundVersionRef.current;

    setOpenCardIds(nextOpenCardIds);
    setIsCheckingPair(true);
    setTurnCount(current => current + 1);
    showFeedback(
      isMatchingPair ? 'correct' : 'wrong',
      isMatchingPair ? 1_000 : difficulty.wrongFeedbackDurationMs,
    );

    if (isMatchingPair) {
      playCorrectSound().catch(() => undefined);
      if (!difficulty.selectionAudioEnabled) {
        speakWord(card.word).catch(() => undefined);
      }
    } else {
      playWrongSound().catch(() => undefined);
    }

    pairTimerRef.current = setTimeout(
      () => {
        pairTimerRef.current = null;

        if (roundVersion !== roundVersionRef.current) {
          return;
        }

        if (isMatchingPair) {
          setMatchedItemIds(current =>
            current.includes(card.itemId) ? current : [...current, card.itemId],
          );
          runGameMatchCallback(
            onMatch,
            card.itemId,
            !missedItemIdsRef.current.has(card.itemId),
          ).catch(() => undefined);
        } else {
          missedItemIdsRef.current.add(firstCard.itemId);
          missedItemIdsRef.current.add(card.itemId);
        }

        setOpenCardIds([]);
        setIsCheckingPair(false);
      },
      isMatchingPair ? 420 : difficulty.memoryMismatchDelayMs,
    );
  };

  const wrongCardIds = useMemo(() => {
    if (!isCheckingPair || openCardIds.length !== 2) {
      return new Set<string>();
    }

    const openCards = cards.filter(card => openCardIds.includes(card.cardId));
    if (openCards.length !== 2 || openCards[0].itemId === openCards[1].itemId) {
      return new Set<string>();
    }

    return new Set(openCardIds);
  }, [cards, isCheckingPair, openCardIds]);

  return (
    <View style={styles.container}>
      <ReviewGameCoach
        completed={matchedItemIds.length}
        detail={t('memoryGame.turnCount', { count: String(turnCount) })}
        feedback={feedback}
        isSpeaking={isIntroPlaying}
        prompt={t('memoryGame.prompt')}
        reduceMotion={reduceMotion}
        total={items.length}
      />

      <View style={styles.grid}>
        {cards.map(card => {
          const isMatched = matchedItemIds.includes(card.itemId);
          const isOpen = openCardIds.includes(card.cardId);

          return (
            <MemoryCardView
              card={card}
              cardStyle={gridLayout.cardStyle}
              disabled={
                isIntroPlaying || isCheckingPair || isComplete || isMatched
              }
              isMatched={isMatched}
              isOpen={isOpen}
              isWrong={wrongCardIds.has(card.cardId)}
              key={card.cardId}
              onPress={() => handleCardPress(card)}
              reduceMotion={reduceMotion}
            />
          );
        })}
      </View>
    </View>
  );
}

type MemoryCardViewProps = {
  card: MemoryCard;
  cardStyle: ViewStyle;
  disabled: boolean;
  isMatched: boolean;
  isOpen: boolean;
  isWrong: boolean;
  onPress: () => void;
  reduceMotion: boolean;
};

function MemoryCardView({
  card,
  cardStyle,
  disabled,
  isMatched,
  isOpen,
  isWrong,
  onPress,
  reduceMotion,
}: MemoryCardViewProps) {
  const t = useI18n();
  const flipProgress = useRef(new Animated.Value(0)).current;
  const shakeX = useRef(new Animated.Value(0)).current;
  const matchScale = useRef(new Animated.Value(1)).current;
  const isVisible = isMatched || isOpen;
  const isDisabled = disabled || isVisible;

  useEffect(() => {
    const targetValue = isVisible ? 1 : 0;

    if (reduceMotion) {
      flipProgress.stopAnimation();
      flipProgress.setValue(targetValue);
      return;
    }

    const animation = Animated.timing(flipProgress, {
      duration: 220,
      toValue: targetValue,
      useNativeDriver: true,
    });
    animation.start();

    return () => animation.stop();
  }, [flipProgress, isVisible, reduceMotion]);

  useEffect(() => {
    if (!isWrong || reduceMotion) {
      shakeX.stopAnimation();
      shakeX.setValue(0);
      return;
    }

    const animation = createShakeAnimation(shakeX);
    animation.start();

    return () => animation.stop();
  }, [isWrong, reduceMotion, shakeX]);

  useEffect(() => {
    if (!isMatched || reduceMotion) {
      matchScale.stopAnimation();
      matchScale.setValue(1);
      return;
    }

    const animation = createBounceAnimation(matchScale);
    animation.start();

    return () => animation.stop();
  }, [isMatched, matchScale, reduceMotion]);

  const backRotation = flipProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const frontRotation = flipProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });
  const backOpacity = flipProgress.interpolate({
    inputRange: [0, 0.49, 0.5, 1],
    outputRange: [1, 1, 0, 0],
  });
  const frontOpacity = flipProgress.interpolate({
    inputRange: [0, 0.49, 0.5, 1],
    outputRange: [0, 0, 1, 1],
  });

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        cardStyle,
        {
          transform: [{ translateX: shakeX }, { scale: matchScale }],
        },
      ]}
    >
      <Pressable
        accessibilityLabel={
          isVisible
            ? t('memoryGame.visibleCardAccessibility', { word: card.word })
            : t('memoryGame.hiddenCardAccessibility')
        }
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, selected: isVisible }}
        disabled={isDisabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          isVisible ? styles.cardOpen : styles.cardClosed,
          isMatched && styles.cardMatched,
          isWrong && styles.cardWrong,
          pressed && !isVisible && !reduceMotion && styles.cardPressed,
        ]}
        testID={`memory-card-${card.cardId}`}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.cardSide,
            styles.cardBack,
            {
              opacity: backOpacity,
              transform: [{ perspective: 800 }, { rotateY: backRotation }],
            },
          ]}
        >
          <MascotImage decorative pose="avatar" size={56} />
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.cardSide,
            styles.cardFace,
            isMatched && styles.cardFaceMatched,
            isWrong && styles.cardFaceWrong,
            {
              opacity: frontOpacity,
              transform: [{ perspective: 800 }, { rotateY: frontRotation }],
            },
          ]}
        >
          <Image
            resizeMode="contain"
            source={card.imageSource}
            style={styles.cardImage}
          />
          {isMatched ? (
            <View style={styles.matchBadge}>
              <Text style={styles.matchBadgeText}>★</Text>
            </View>
          ) : isWrong ? (
            <View style={styles.wrongBadge}>
              <Text style={styles.wrongBadgeText}>×</Text>
            </View>
          ) : null}
        </Animated.View>
      </Pressable>
      <SparkleEffect active={isMatched && !reduceMotion} />
    </Animated.View>
  );
}

function createShuffledCards(items: MemoryGameItem[]) {
  const cards = items.flatMap(item => [
    {
      ...item,
      cardId: `${item.id}-a`,
      itemId: item.id,
    },
    {
      ...item,
      cardId: `${item.id}-b`,
      itemId: item.id,
    },
  ]);

  return shuffle(cards);
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function clearTimer(
  timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
) {
  if (timerRef.current !== null) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }
}

export function getMemoryGridLayout(
  cardCount: number,
  layout: ResponsiveLayout,
) {
  const columnCount = getMemoryColumnCount(cardCount, layout);
  const gapAllowancePercent = layout.isTablet ? 1.4 : 2.5;
  const basisValue = Math.max(14, 100 / columnCount - gapAllowancePercent);
  const cardWidth = `${basisValue}%` as const;

  return {
    cardStyle: {
      aspectRatio: layout.isTablet || layout.isLandscape ? 0.9 : 1.05,
      flexBasis: cardWidth,
      flexGrow: 0,
      flexShrink: 0,
      maxWidth: layout.isTablet ? (layout.isLandscape ? 188 : 176) : undefined,
      minHeight: layout.isTablet ? 132 : 104,
      width: cardWidth,
    } satisfies ViewStyle,
    columnCount,
  };
}

function getMemoryColumnCount(cardCount: number, layout: ResponsiveLayout) {
  if (cardCount <= 0) {
    return 1;
  }

  if (layout.isTabletLandscape) {
    return Math.min(cardCount, cardCount <= 8 ? 4 : 6);
  }

  if (layout.isTablet) {
    return Math.min(cardCount, cardCount <= 8 ? 4 : 5);
  }

  if (layout.isLandscape) {
    return Math.min(cardCount, cardCount <= 8 ? 4 : 5);
  }

  return Math.min(cardCount, 3);
}

const styles = createThemedStyles(() => ({
  card: {
    borderRadius: radius.lg,
    borderWidth: 2,
    flex: 1,
    overflow: 'hidden',
  },
  cardBack: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  cardClosed: {
    borderColor: colors.primaryDark,
  },
  cardFace: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    justifyContent: 'center',
    padding: spacing.sm,
  },
  cardImage: {
    height: '86%',
    width: '86%',
  },
  cardFaceMatched: {
    backgroundColor: colors.primarySoft,
  },
  cardFaceWrong: {
    backgroundColor: colors.accentSoft,
  },
  cardMatched: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.secondaryDark,
  },
  cardOpen: {
    borderColor: colors.primary,
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  cardSide: {
    backfaceVisibility: 'hidden',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  cardWrapper: {
    position: 'relative',
  },
  cardWrong: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.alert,
  },
  container: {
    flex: 1,
    gap: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  matchBadge: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radius.pill,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.xs,
    top: spacing.xs,
    width: 28,
  },
  matchBadgeText: {
    color: colors.primaryDark,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 20,
  },
  wrongBadge: {
    alignItems: 'center',
    backgroundColor: colors.alert,
    borderRadius: radius.pill,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.xs,
    top: spacing.xs,
    width: 28,
  },
  wrongBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 22,
  },
}));
