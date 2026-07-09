import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';


import {
  playCorrectSound,
  playTapSound,
  speakWord,
} from '../../engine/AudioManager';
import { colors } from '../../theme/colors';
import {
  type ResponsiveLayout,
  useResponsiveLayout,
} from '../../theme/responsive';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

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
  items: MemoryGameItem[];
  onComplete: () => void;
  onMatch?: (wordId: string, isFirstTry: boolean) => Promise<{ xpGained: number } | void> | void;
};

export function MemoryGame({
  items,
  onComplete,
  onMatch,
}: MemoryGameProps) {
  const responsiveLayout = useResponsiveLayout();
  const itemKey = useMemo(() => items.map(item => item.id).join('|'), [items]);
  const [cards, setCards] = useState<MemoryCard[]>(() =>
    createShuffledCards(items),
  );
  const [openCardIds, setOpenCardIds] = useState<string[]>([]);
  const [matchedItemIds, setMatchedItemIds] = useState<string[]>([]);
  const [isCheckingPair, setIsCheckingPair] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const missedItemIdsRef = useRef<Set<string>>(new Set());
  const checkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isComplete = items.length > 0 && matchedItemIds.length === items.length;
  const gridLayout = useMemo(
    () => getMemoryGridLayout(cards.length, responsiveLayout),
    [cards.length, responsiveLayout],
  );

  useEffect(() => {
    clearCheckTimer(checkTimerRef);
    setCards(createShuffledCards(items));
    setOpenCardIds([]);
    setMatchedItemIds([]);
    setIsCheckingPair(false);
    setTurnCount(0);
    missedItemIdsRef.current = new Set();
  }, [itemKey, items]);

  useEffect(() => {
    return () => {
      clearCheckTimer(checkTimerRef);
    };
  }, []);

  useEffect(() => {
    if (isComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  const handleCardPress = (card: MemoryCard) => {
    const isCardVisible =
      openCardIds.includes(card.cardId) || matchedItemIds.includes(card.itemId);

    if (isCheckingPair || isComplete || isCardVisible) {
      return;
    }

    playTapSound().catch(() => undefined);
    speakWord(card.word).catch(() => undefined);

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

    setOpenCardIds(nextOpenCardIds);
    setIsCheckingPair(true);
    setTurnCount(current => current + 1);

    checkTimerRef.current = setTimeout(
      async () => {
        if (isMatchingPair) {
          setMatchedItemIds(current =>
            current.includes(card.itemId) ? current : [...current, card.itemId],
          );
          playCorrectSound().catch(() => undefined);
          if (onMatch) {
             try {
                await onMatch(card.itemId, !missedItemIdsRef.current.has(card.itemId));
             } catch {}
          }
        } else {
          missedItemIdsRef.current.add(firstCard.itemId);
          missedItemIdsRef.current.add(card.itemId);
        }

        setOpenCardIds([]);
        setIsCheckingPair(false);
      },
      isMatchingPair ? 360 : 760,
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>
            {matchedItemIds.length}/{items.length} cặp
          </Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{turnCount} lượt</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {cards.map(card => {
          const isMatched = matchedItemIds.includes(card.itemId);
          const isOpen = openCardIds.includes(card.cardId);
          const isVisible = isMatched || isOpen;

          return (
            <Pressable
              accessibilityLabel={
                isVisible ? `Thẻ ${card.word}` : 'Thẻ lật hình'
              }
              accessibilityRole="button"
              disabled={isCheckingPair || isComplete || isVisible}
              key={card.cardId}
              onPress={() => handleCardPress(card)}
              style={({ pressed }) => [
                styles.card,
                gridLayout.cardStyle,
                isVisible ? styles.cardOpen : styles.cardClosed,
                isMatched && styles.cardMatched,
                pressed && !isVisible && styles.cardPressed,
              ]}
            >
              {isVisible ? (
                <View style={styles.cardFace}>
                  <Image
                    resizeMode="contain"
                    source={card.imageSource}
                    style={styles.cardImage}
                  />
                </View>
              ) : (
                <View style={styles.cardBack}>
                  <Text style={styles.cardBackMark}>★</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
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

function clearCheckTimer(
  timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
) {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }
}

function getMemoryGridLayout(
  cardCount: number,
  layout: ResponsiveLayout,
) {
  const columnCount = getMemoryColumnCount(cardCount, layout);
  const gapAllowancePercent = layout.isTablet ? 1.4 : 2.5;
  const basisValue = Math.max(
    14,
    100 / columnCount - gapAllowancePercent,
  );

  return {
    cardStyle: {
      flexBasis: `${basisValue}%` as const,
      maxWidth: layout.isTablet ? (layout.isLandscape ? 188 : 176) : undefined,
      minHeight: layout.isTablet ? 132 : 116,
    },
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

  return Math.min(cardCount, cardCount <= 8 ? 3 : 4);
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 0.9,
    borderRadius: radius.lg,
    borderWidth: 2,
    flexGrow: 1,
    minHeight: 116,
    overflow: 'hidden',
  },
  cardBack: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    flex: 1,
    justifyContent: 'center',
  },
  cardBackMark: {
    color: colors.white,
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 48,
  },
  cardClosed: {
    borderColor: colors.primaryDark,
  },
  cardFace: {
    alignItems: 'center',
    backgroundColor: colors.white,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.sm,
  },
  cardImage: {
    height: '86%',
    width: '86%',
  },
  cardMatched: {
    borderColor: colors.secondary,
  },
  cardOpen: {
    borderColor: colors.primary,
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  container: {
    gap: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  statusPill: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  statusText: {
    color: colors.primaryDark,
    ...typography.caption,
  },
});
