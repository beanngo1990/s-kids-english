import React from 'react';
import { Text } from 'react-native';

import { AppCard } from '../components/AppCard';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { ReviewGame } from '../types/lesson';
import {
  MemoryGame,
  type MemoryGameItem,
} from './memory/MemoryGame';

type GamePlayerProps = {
  memoryItems: MemoryGameItem[];
  onComplete: () => void;
  onWordInteraction?: (wordId: string, isFirstTry: boolean) => void;
  reviewGame: ReviewGame;
};

export function GamePlayer({
  memoryItems,
  onComplete,
  onWordInteraction,
  reviewGame,
}: GamePlayerProps) {
  useThemeSync();
  switch (reviewGame.type) {
    case 'memory':
      return (
        <MemoryGame
          items={memoryItems}
          onComplete={onComplete}
          onMatch={onWordInteraction}
        />
      );
    default:
      return (
        <AppCard style={styles.unsupportedCard}>
          <Text style={styles.unsupportedTitle}>
            Game này chưa được hỗ trợ.
          </Text>
          <Text style={styles.unsupportedText}>
            Hiện app mới có game lật thẻ hình giống nhau.
          </Text>
        </AppCard>
      );
  }
}

const styles = createThemedStyles(() => ({
  unsupportedCard: {
    gap: spacing.sm,
  },
  unsupportedText: {
    color: colors.textSoft,
    textAlign: 'center',
    ...typography.body,
  },
  unsupportedTitle: {
    color: colors.text,
    textAlign: 'center',
    ...typography.subtitle,
  },
}));
