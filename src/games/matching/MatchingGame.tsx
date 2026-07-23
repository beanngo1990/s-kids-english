import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';

import { AppCard } from '../../components/AppCard';
import { KidBadge } from '../../components/KidBadge';
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

export type MatchingItem = {
  id: string;
  imageSource: ImageSourcePropType;
  meaningVi: string;
  word: string;
};

type MatchingGameProps = {
  items: MatchingItem[];
  onComplete: () => void;
  onMatch?: (wordId: string, isFirstTry: boolean) => Promise<{ xpGained: number } | void> | void;
};

const MATCH_PAIR_PALETTES = [
  { bg: '#DCFCE7', border: '#34D399', badge: '#059669', text: '#047857' }, // Mint Green
  { bg: '#E0F2FE', border: '#0EA5E9', badge: '#0284C7', text: '#0369A1' }, // Sky Blue
  { bg: '#CCFBF1', border: '#2DD4BF', badge: '#0D9488', text: '#0F766E' }, // Brand Teal (Replaced Red/Rose)
  { bg: '#FEF9C3', border: '#FACC15', badge: '#CA8A04', text: '#A16207' }, // Sunny Yellow
  { bg: '#F3E8FF', border: '#C084FC', badge: '#9333EA', text: '#7E22CE' }, // Soft Purple
  { bg: '#FFEDD5', border: '#FB923C', badge: '#EA580C', text: '#C2410C' }, // Warm Orange
];

export function MatchingGame({
  items,
  onComplete,
  onMatch,
}: MatchingGameProps) {
  useThemeSync();
  const t = useI18n();
  const responsiveLayout = useResponsiveLayout();

  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [matchedOrder, setMatchedOrder] = useState<string[]>([]);
  const [wrongImageId, setWrongImageId] = useState<string | null>(null);
  const [wrongWordId, setWrongWordId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const firstTryMapRef = useRef<Map<string, boolean>>(new Map());
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const matchedSet = useMemo(() => new Set(matchedOrder), [matchedOrder]);

  // Prepare left column (shuffled images) and right column (shuffled words)
  const leftItems = useMemo(() => {
    return [...items].sort(() => Math.random() - 0.5);
  }, [items]);

  const rightItems = useMemo(() => {
    return [...items].sort(() => Math.random() - 0.5);
  }, [items]);

  // Reset state when items change
  useEffect(() => {
    setSelectedImageId(null);
    setSelectedWordId(null);
    setMatchedOrder([]);
    setWrongImageId(null);
    setWrongWordId(null);
    setIsTransitioning(false);
    firstTryMapRef.current = new Map();
    items.forEach(item => firstTryMapRef.current.set(item.id, true));
  }, [items]);

  useEffect(() => {
    return () => {
      if (completionTimerRef.current) {
        clearTimeout(completionTimerRef.current);
      }
    };
  }, []);

  const checkMatch = useCallback(
    (imageId: string, wordId: string) => {
      setIsTransitioning(true);

      if (imageId === wordId) {
        // Correct match!
        playCorrectSound().catch(() => undefined);
        const matchedItem = items.find(i => i.id === imageId);
        if (matchedItem) {
          speakWord(matchedItem.word).catch(() => undefined);
        }

        const isFirstTry = firstTryMapRef.current.get(imageId) ?? true;
        if (onMatch) {
          onMatch(imageId, isFirstTry);
        }

        setMatchedOrder(prev => {
          const next = [...prev, imageId];
          if (next.length >= items.length) {
            completionTimerRef.current = setTimeout(() => {
              onComplete();
            }, 1000);
          }
          return next;
        });

        setSelectedImageId(null);
        setSelectedWordId(null);
        setIsTransitioning(false);
      } else {
        // Wrong match!
        firstTryMapRef.current.set(imageId, false);
        firstTryMapRef.current.set(wordId, false);
        setWrongImageId(imageId);
        setWrongWordId(wordId);

        playWrongSound().catch(() => undefined);

        setTimeout(() => {
          setSelectedImageId(null);
          setSelectedWordId(null);
          setWrongImageId(null);
          setWrongWordId(null);
          setIsTransitioning(false);
        }, 700);
      }
    },
    [items, onComplete, onMatch],
  );

  const handleImagePress = (item: MatchingItem) => {
    if (isTransitioning || matchedSet.has(item.id)) {
      return;
    }
    const nextImageId = selectedImageId === item.id ? null : item.id;
    setSelectedImageId(nextImageId);

    if (nextImageId && selectedWordId) {
      checkMatch(nextImageId, selectedWordId);
    }
  };

  const handleWordPress = (item: MatchingItem) => {
    if (isTransitioning || matchedSet.has(item.id)) {
      return;
    }
    speakWord(item.word).catch(() => undefined);

    const nextWordId = selectedWordId === item.id ? null : item.id;
    setSelectedWordId(nextWordId);

    if (selectedImageId && nextWordId) {
      checkMatch(selectedImageId, nextWordId);
    }
  };

  if (items.length === 0) {
    return null;
  }

  const isTablet = responsiveLayout.isTablet;

  return (
    <View style={styles.container}>
      {/* Header Prompt Card */}
      <AppCard style={styles.promptCard}>
        <KidBadge tone="sun">
          {t('matchingGame.progress', {
            matched: String(matchedOrder.length),
            total: String(items.length),
          })}
        </KidBadge>
        <Text numberOfLines={1} style={styles.promptTitle}>
          🔗 {t('matchingGame.prompt')}
        </Text>
      </AppCard>

      {/* Two Columns: Left Words, Right Images */}
      <View style={[styles.columnsRow, isTablet && styles.columnsRowTablet]}>
        {/* Left Column: Words */}
        <View style={styles.column}>
          <Text style={styles.columnHeader}>{t('matchingGame.wordColumn')}</Text>
          {rightItems.map(item => {
            const pairIndex = matchedOrder.indexOf(item.id);
            const isMatched = pairIndex !== -1;
            const isSelected = selectedWordId === item.id;
            const isWrong = wrongWordId === item.id;
            const palette = isMatched
              ? MATCH_PAIR_PALETTES[pairIndex % MATCH_PAIR_PALETTES.length]
              : null;

            return (
              <MatchingCardItem
                key={`word-${item.id}`}
                isMatched={isMatched}
                isSelected={isSelected}
                isWrong={isWrong}
                label={item.word}
                onPress={() => handleWordPress(item)}
                palette={palette}
                pairIndex={pairIndex}
                side="left"
              >
                <View style={styles.wordCardContent}>
                  <Text style={[styles.wordText, isMatched && palette && { color: palette.text }]}>
                    {item.word}
                  </Text>
                  <SKidsIcon name="listen" size={20} />
                </View>
              </MatchingCardItem>
            );
          })}
        </View>

        {/* Right Column: Images */}
        <View style={styles.column}>
          <Text style={styles.columnHeader}>{t('matchingGame.imageColumn')}</Text>
          {leftItems.map(item => {
            const pairIndex = matchedOrder.indexOf(item.id);
            const isMatched = pairIndex !== -1;
            const isSelected = selectedImageId === item.id;
            const isWrong = wrongImageId === item.id;
            const palette = isMatched
              ? MATCH_PAIR_PALETTES[pairIndex % MATCH_PAIR_PALETTES.length]
              : null;

            return (
              <MatchingCardItem
                key={`img-${item.id}`}
                isMatched={isMatched}
                isSelected={isSelected}
                isWrong={isWrong}
                label={item.word}
                onPress={() => handleImagePress(item)}
                palette={palette}
                pairIndex={pairIndex}
                side="right"
              >
                <Image
                  resizeMode="contain"
                  source={item.imageSource}
                  style={styles.cardImage}
                />
              </MatchingCardItem>
            );
          })}
        </View>
      </View>
    </View>
  );
}

type MatchingCardItemProps = {
  children: React.ReactNode;
  isMatched: boolean;
  isSelected: boolean;
  isWrong: boolean;
  label: string;
  onPress: () => void;
  palette: typeof MATCH_PAIR_PALETTES[number] | null;
  pairIndex: number;
  side: 'left' | 'right';
};

function MatchingCardItem({
  children,
  isMatched,
  isSelected,
  isWrong,
  label,
  onPress,
  palette,
  pairIndex,
  side,
}: MatchingCardItemProps) {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isWrong) {
      createShakeAnimation(shakeAnim).start();
    }
  }, [isWrong, shakeAnim]);

  return (
    <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        disabled={isMatched}
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          isMatched && palette
            ? {
                backgroundColor: palette.bg,
                borderColor: palette.border,
                borderWidth: 3,
              }
            : null,
          isSelected && styles.cardSelected,
          isWrong && styles.cardWrong,
          pressed && !isMatched && styles.cardPressed,
        ]}
      >
        {children}

        {/* Color-coded Link Connector Badge */}
        {isMatched && palette ? (
          <View
            style={[
              styles.connectorBadge,
              side === 'left' ? styles.connectorLeft : styles.connectorRight,
              { backgroundColor: palette.badge },
            ]}
          >
            <Text style={styles.connectorText}>{pairIndex + 1}</Text>
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = createThemedStyles(() => ({
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 2.5,
    elevation: 2,
    height: 80,
    justifyContent: 'center',
    marginVertical: 4,
    padding: spacing.xs,
    position: 'relative',
    shadowColor: colors.shadow,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    height: '100%',
    maxHeight: 60,
    maxWidth: '100%',
    width: '100%',
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  cardSelected: {
    backgroundColor: '#E0F2FE',
    borderColor: colors.primaryDark,
    borderWidth: 3.5,
    transform: [{ scale: 1.03 }],
  },
  cardWrong: {
    backgroundColor: '#FFE4E6',
    borderColor: colors.accentDark,
    borderWidth: 3,
  },
  column: {
    flex: 1,
  },
  columnHeader: {
    color: colors.textSoft,
    marginBottom: spacing.xxs,
    textAlign: 'center',
    ...typography.caption,
    fontSize: 12,
    fontWeight: '700',
  },
  columnsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  columnsRowTablet: {
    gap: spacing.lg,
  },
  connectorBadge: {
    alignItems: 'center',
    borderRadius: 12,
    height: 22,
    justifyContent: 'center',
    position: 'absolute',
    top: 6,
    width: 22,
    shadowColor: colors.shadow,
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  connectorLeft: {
    right: 6,
  },
  connectorRight: {
    left: 6,
  },
  connectorText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
  },
  container: {
    gap: spacing.xs,
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
    paddingVertical: spacing.xs,
  },
  promptTitle: {
    color: colors.primaryDark,
    flex: 1,
    paddingLeft: spacing.sm,
    textAlign: 'right',
    ...typography.subtitle,
    fontSize: 15,
    lineHeight: 20,
  },
  wordCardContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  wordText: {
    color: colors.text,
    textAlign: 'center',
    ...typography.subtitle,
    fontSize: 15,
    fontWeight: '800',
  },
}));

