import { getLessonVocabularyForLearningMode } from '../engine/ProgressManager';
import type { LearningMode, Lesson } from '../types/lesson';

type ParentReviewWordsInput = {
  hasReviewLessonAccess: boolean;
  learnedWordIds: readonly string[];
  learningMode: LearningMode;
  lesson: Lesson | undefined;
};

type ParentReviewTipInput = {
  emptyText: string;
  hasReviewLessonAccess: boolean;
  lockedText: string;
  metadataTip?: string;
  reviewWordText: (word: string) => string;
  reviewWords: readonly string[];
};

export function getParentReviewWords({
  hasReviewLessonAccess,
  learnedWordIds,
  learningMode,
  lesson,
}: ParentReviewWordsInput) {
  if (!lesson) {
    return [];
  }

  const vocabulary = getLessonVocabularyForLearningMode(lesson, learningMode);
  const vocabularyById = new Map(
    vocabulary.map(item => [item.id, item.word]),
  );
  const learnedWordsInLesson = learnedWordIds
    .filter(id => vocabularyById.has(id))
    .slice(-3)
    .map(id => vocabularyById.get(id))
    .filter((word): word is string => Boolean(word));

  return learnedWordsInLesson.length > 0
    ? learnedWordsInLesson
    : hasReviewLessonAccess
    ? vocabulary.slice(0, 3).map(item => item.word)
    : [];
}

export function getParentReviewTipText({
  emptyText,
  hasReviewLessonAccess,
  lockedText,
  metadataTip,
  reviewWordText,
  reviewWords,
}: ParentReviewTipInput) {
  if (!hasReviewLessonAccess && reviewWords.length === 0) {
    return lockedText;
  }

  if (reviewWords.length > 0) {
    return reviewWordText(reviewWords[0]);
  }

  return metadataTip ?? emptyText;
}
