import React from 'react';
import { Text } from 'react-native';

import { AppCard } from '../components/AppCard';
import { useI18n } from '../i18n';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { LearningMode, ReviewGame } from '../types/lesson';
import { MemoryGame } from './memory/MemoryGame';
import { ListenChooseGame } from './listenChoose/ListenChooseGame';
import { MatchingGame } from './matching/MatchingGame';
import type { ReviewGameItem } from './reviewItems';

export const SUPPORTED_REVIEW_GAMES = [
  'memory',
  'listenAndChoose',
  'matching',
] as const;
export type ExecutableReviewGameType = (typeof SUPPORTED_REVIEW_GAMES)[number];

export function isExecutableReviewGameType(
  type: ReviewGame['type'] | undefined,
): type is ExecutableReviewGameType {
  return Boolean(
    type && SUPPORTED_REVIEW_GAMES.includes(type as ExecutableReviewGameType),
  );
}

export function hasPlayableReviewGame(reviewGame: ReviewGame | undefined) {
  return Boolean(
    reviewGame &&
      (reviewGame.type === 'random' ||
        isExecutableReviewGameType(reviewGame.type)),
  );
}

export function resolveReviewGameType(
  configuredType?: ReviewGame['type'],
  requestedType?: ReviewGame['type'],
): ExecutableReviewGameType {
  if (isExecutableReviewGameType(requestedType)) {
    return requestedType;
  }
  if (isExecutableReviewGameType(configuredType)) {
    return configuredType;
  }
  // Random or fallback: pick randomly between supported games
  const randomIndex = Math.floor(Math.random() * SUPPORTED_REVIEW_GAMES.length);
  return SUPPORTED_REVIEW_GAMES[randomIndex];
}

type GamePlayerProps = {
  isIntroPlaying?: boolean;
  learningMode: LearningMode;
  memoryItems: ReviewGameItem[];
  onComplete: () => void;
  onWordInteraction?: (wordId: string, isFirstTry: boolean) => void;
  reviewGame: ReviewGame;
  overrideType?: ExecutableReviewGameType;
};

export function GamePlayer({
  isIntroPlaying = false,
  learningMode,
  memoryItems,
  onComplete,
  onWordInteraction,
  overrideType,
  reviewGame,
}: GamePlayerProps) {
  useThemeSync();
  const t = useI18n();
  const activeType = overrideType ?? resolveReviewGameType(reviewGame.type);

  switch (activeType) {
    case 'memory':
      return (
        <MemoryGame
          isIntroPlaying={isIntroPlaying}
          items={memoryItems}
          learningMode={learningMode}
          onComplete={onComplete}
          onMatch={onWordInteraction}
        />
      );
    case 'listenAndChoose':
      return (
        <ListenChooseGame
          isIntroPlaying={isIntroPlaying}
          items={memoryItems}
          learningMode={learningMode}
          onComplete={onComplete}
          onMatch={onWordInteraction}
        />
      );
    case 'matching':
      return (
        <MatchingGame
          isIntroPlaying={isIntroPlaying}
          items={memoryItems}
          learningMode={learningMode}
          onComplete={onComplete}
          onMatch={onWordInteraction}
        />
      );
    default:
      return (
        <AppCard style={styles.unsupportedCard}>
          <Text style={styles.unsupportedTitle}>
            {t('reviewGame.unsupportedTitle')}
          </Text>
          <Text style={styles.unsupportedText}>
            {t('reviewGame.unsupportedText')}
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
