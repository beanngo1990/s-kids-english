import type { LessonTheme } from '../types/lesson';

export const DEFAULT_THEME_ID = 'mot-ngay-cua-be';

const themeCatalog: LessonTheme[] = [
  {
    id: DEFAULT_THEME_ID,
    titleVi: 'Một ngày của bé',
    titleEn: "A Child's Day",
    thumbnailEmoji: '☀️',
    descriptionVi:
      'Một lộ trình liền mạch từ lúc thức dậy, đến trường, chơi, ăn uống và đi ngủ.',
    lessonIds: [
      'morning-routine',
      'at-school',
      'playtime',
      'lunch-time',
      'afternoon-home',
      'snack-time',
      'home-play',
      'afternoon-bath',
      'family-dinner',
      'after-dinner-cleanup',
      'bedtime',
    ],
  },
];

export const themes = themeCatalog;

export function getThemeById(themeId: string | undefined) {
  return themes.find(theme => theme.id === themeId);
}
