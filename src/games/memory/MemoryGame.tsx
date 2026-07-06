import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';


import {
  playCompleteSound,
  playCorrectSound,
  playTapSound,
  speakWord,
} from '../../engine/AudioManager';
import { colors } from '../../theme/colors';
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
  const completionSoundPlayedRef = useRef(false);
  const popupScale = useRef(new Animated.Value(0.5)).current;
  const popupOpacity = useRef(new Animated.Value(0)).current;

  const isComplete = items.length > 0 && matchedItemIds.length === items.length;
  const cardBasis = cards.length <= 8 ? '30%' : '22%';

  useEffect(() => {
    clearCheckTimer(checkTimerRef);
    setCards(createShuffledCards(items));
    setOpenCardIds([]);
    setMatchedItemIds([]);
    setIsCheckingPair(false);
    setTurnCount(0);
    missedItemIdsRef.current = new Set();
    completionSoundPlayedRef.current = false;
    popupScale.setValue(0.5);
    popupOpacity.setValue(0);
  }, [itemKey, items, popupScale, popupOpacity]);

  useEffect(() => {
    return () => {
      clearCheckTimer(checkTimerRef);
    };
  }, []);

  useEffect(() => {
    if (!isComplete || completionSoundPlayedRef.current) {
      return;
    }

    completionSoundPlayedRef.current = true;
    playCompleteSound().catch(() => undefined);

    Animated.parallel([
      Animated.spring(popupScale, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(popupOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const timerId = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(timerId);
    };
  }, [isComplete, popupScale, popupOpacity, onComplete]);

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
                { flexBasis: cardBasis },
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

      <Modal visible={isComplete} transparent={true} animationType="fade">
        <View style={styles.celebrationOverlay} pointerEvents="none">
          <Animated.View
            style={[
              styles.celebrationIcon,
              {
                opacity: popupOpacity,
                transform: [{ scale: popupScale }],
              },
            ]}
          >
            <Text style={styles.celebrationEmoji}>🎉</Text>
          </Animated.View>
        </View>
      </Modal>
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
  celebrationEmoji: {
    fontSize: 96,
  },
  celebrationIcon: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.secondary,
    borderRadius: 100,
    borderWidth: 6,
    elevation: 12,
    height: 160,
    justifyContent: 'center',
    shadowColor: colors.primaryDark,
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    width: 160,
  },
  celebrationOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    gap: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
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
