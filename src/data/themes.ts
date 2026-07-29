import type { LessonTheme } from '../types/lesson';

export const DEFAULT_THEME_ID = 'mot-ngay-cua-be';
export const OUTSIDE_EXPLORATION_THEME_ID = 'be-ra-ngoai-kham-pha';

const themeCatalog: LessonTheme[] = [
  {
    id: DEFAULT_THEME_ID,
    titleVi: 'Một ngày của bé',
    titleEn: "A Child's Day",
    thumbnailEmoji: '☀️',
    descriptionVi:
      'Một lộ trình liền mạch từ lúc thức dậy, đến trường, chơi, ăn uống và đi ngủ.',
    descriptionEn:
      'A smooth daily path from waking up, going to school, playing, eating, and getting ready for bed.',
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
  {
    id: OUTSIDE_EXPLORATION_THEME_ID,
    titleVi: 'Bé ra ngoài khám phá',
    titleEn: 'Out and About',
    thumbnailEmoji: '🧭',
    descriptionVi:
      'Bé mở rộng thế giới quanh mình qua siêu thị, công viên, biển, động vật, thư viện, bác sĩ, sinh nhật và thăm ông bà.',
    descriptionEn:
      'Explore familiar places beyond home: supermarket, park, beach, animals, library, doctor, birthday party, and grandparents.',
    lessonIds: [
      'supermarket-trip',
      'park-visit',
      'beach-day',
      'animal-trip',
      'library-visit',
      'doctor-visit',
      'birthday-party',
      'grandparents-visit',
    ],
  },
];

export const themes = themeCatalog;

export function getThemeById(themeId: string | undefined) {
  return themes.find(theme => theme.id === themeId);
}
