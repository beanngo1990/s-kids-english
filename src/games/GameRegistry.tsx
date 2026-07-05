import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { AppCard } from '../components/AppCard';
import { colors } from '../theme/colors';
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
  reviewGame: ReviewGame;
};

export function GamePlayer({
  memoryItems,
  onComplete,
  reviewGame,
}: GamePlayerProps) {
  switch (reviewGame.type) {
    case 'memory':
      return (
        <MemoryGame
          items={memoryItems}
          onComplete={onComplete}
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

const styles = StyleSheet.create({
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
});
