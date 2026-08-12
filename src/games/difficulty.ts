import type { LearningMode, VocabularyLevel } from '../types/lesson';

export type ReviewDifficultyProfile = {
  itemCount: number;
  listenOptionCount: number;
  memoryMismatchDelayMs: number;
  wrongFeedbackDurationMs: number;
};

const reviewDifficultyProfiles: Record<LearningMode, ReviewDifficultyProfile> =
  {
    challenge: {
      itemCount: 6,
      listenOptionCount: 4,
      memoryMismatchDelayMs: 560,
      wrongFeedbackDurationMs: 520,
    },
    core: {
      itemCount: 4,
      listenOptionCount: 2,
      memoryMismatchDelayMs: 1_050,
      wrongFeedbackDurationMs: 900,
    },
    expanded: {
      itemCount: 5,
      listenOptionCount: 3,
      memoryMismatchDelayMs: 820,
      wrongFeedbackDurationMs: 700,
    },
  };

const maxVocabularyLevelByMode: Record<LearningMode, VocabularyLevel> = {
  challenge: 'hard',
  core: 'easy',
  expanded: 'medium',
};

const vocabularyLevelRank: Record<VocabularyLevel, number> = {
  easy: 0,
  medium: 1,
  hard: 2,
};

export function getReviewDifficultyProfile(
  learningMode: LearningMode,
): ReviewDifficultyProfile {
  return reviewDifficultyProfiles[learningMode];
}

export function isVocabularyLevelAvailable(
  level: VocabularyLevel,
  learningMode: LearningMode,
) {
  return (
    vocabularyLevelRank[level] <=
    vocabularyLevelRank[maxVocabularyLevelByMode[learningMode]]
  );
}

export function compareVocabularyLevels(
  left: VocabularyLevel,
  right: VocabularyLevel,
) {
  return vocabularyLevelRank[left] - vocabularyLevelRank[right];
}
