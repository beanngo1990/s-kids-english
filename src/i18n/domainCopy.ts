import type {
  Lesson,
  LessonTheme,
  ReviewGame,
  Scene,
} from '../types/lesson';
import type { AppLanguage } from './types';

export function getLocalizedLessonTitle(
  lesson: Lesson,
  language: AppLanguage,
) {
  return language === 'en' ? lesson.titleEn : lesson.titleVi;
}

export function getLocalizedLessonSubtitle(
  lesson: Lesson,
  language: AppLanguage,
) {
  return language === 'en' ? lesson.titleVi : lesson.titleEn;
}

export function getLocalizedLessonDescription(
  lesson: Lesson,
  language: AppLanguage,
) {
  return language === 'en'
    ? lesson.descriptionEn ?? lesson.titleEn
    : lesson.descriptionVi;
}

export function getLocalizedSceneTitle(scene: Scene, language: AppLanguage) {
  return language === 'en' ? scene.titleEn : scene.titleVi;
}

export function getLocalizedSceneSubtitle(scene: Scene, language: AppLanguage) {
  return language === 'en' ? scene.titleVi : scene.titleEn;
}

export function getLocalizedThemeTitle(
  theme: LessonTheme,
  language: AppLanguage,
) {
  return language === 'en' && theme.titleEn ? theme.titleEn : theme.titleVi;
}

export function getLocalizedThemeDescription(
  theme: LessonTheme,
  language: AppLanguage,
) {
  return language === 'en'
    ? theme.descriptionEn ?? theme.titleEn ?? theme.titleVi
    : theme.descriptionVi;
}

export function getLocalizedReviewGameTitle(
  reviewGame: ReviewGame | undefined,
  language: AppLanguage,
) {
  if (!reviewGame) {
    return language === 'en' ? 'Review game' : 'Game ôn tập';
  }

  if (language === 'en') {
    switch (reviewGame.type) {
      case 'memory':
        return 'Memory Game';
      case 'listenAndChoose':
        return 'Listen and Choose';
      case 'matching':
        return 'Matching Game';
      default:
        return 'Review Game';
    }
  }

  return reviewGame.titleVi;
}
