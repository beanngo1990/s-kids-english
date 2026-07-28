import type { LearningMode } from '../types/lesson';
import type { Translator } from './index';

export type LearningModeCopy = {
  detail: string;
  subtitle: string;
  title: string;
};

export function getLearningModeCopy(
  learningMode: LearningMode,
  t: Translator,
): LearningModeCopy {
  switch (learningMode) {
    case 'challenge':
      return {
        detail: t('learningMode.challenge.detail'),
        subtitle: t('learningMode.challenge.subtitle'),
        title: t('learningMode.challenge.title'),
      };
    case 'expanded':
      return {
        detail: t('learningMode.expanded.detail'),
        subtitle: t('learningMode.expanded.subtitle'),
        title: t('learningMode.expanded.title'),
      };
    case 'core':
    default:
      return {
        detail: t('learningMode.core.detail'),
        subtitle: t('learningMode.core.subtitle'),
        title: t('learningMode.core.title'),
      };
  }
}
