import type { LessonTheme } from '../types/lesson';

export const DEFAULT_THEME_ID = 'mot-ngay-cua-be';
export const OUTSIDE_EXPLORATION_THEME_ID = 'be-ra-ngoai-kham-pha';
export const BODY_FEELINGS_SELF_CARE_THEME_ID = 'co-the-cam-xuc-va-tu-cham-soc';
export const LITTLE_GARDEN_THEME_ID = 'khu-vuon-cua-be';
export const ANIMAL_FRIENDS_THEME_ID = 'nhung-nguoi-ban-dong-vat';

const themeCatalog: LessonTheme[] = [
  {
    id: DEFAULT_THEME_ID,
    titleVi: 'Một ngày của bé',
    titleEn: "A Child's Day",
    iconName: 'themeChildDay',
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
    iconName: 'themeOutAndAbout',
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
  {
    id: BODY_FEELINGS_SELF_CARE_THEME_ID,
    titleVi: 'Cơ thể, cảm xúc và tự chăm sóc',
    titleEn: 'My Body, Feelings, and Self-Care',
    iconName: 'themeBodySelfCare',
    thumbnailEmoji: '💛',
    descriptionVi:
      'Bé hiểu cơ thể, gọi tên cảm xúc, tự chăm sóc và nói rõ điều mình cần để lớn lên an toàn, tự tin.',
    descriptionEn:
      'Understand your body, name feelings, practice self-care, and speak up for what you need.',
    lessonIds: [
      'my-body',
      'five-senses',
      'my-feelings',
      'calm-myself',
      'personal-care',
      'dress-myself',
      'toilet-routine',
      'speaking-up',
    ],
  },
  {
    id: LITTLE_GARDEN_THEME_ID,
    titleVi: 'Khu vườn của bé',
    titleEn: 'My Little Garden',
    iconName: 'themeLittleGarden',
    thumbnailEmoji: '🌱',
    descriptionVi:
      'Bé gieo hạt, chăm cây, khám phá khu vườn, thu hoạch và bắt đầu một mùa mới.',
    descriptionEn:
      'Plant a seed, care for it, explore the garden, harvest, and begin again.',
    lessonIds: [
      'plant-a-seed',
      'help-it-grow',
      'garden-friends',
      'harvest-day',
      'garden-to-table',
    ],
  },
  {
    id: ANIMAL_FRIENDS_THEME_ID,
    titleVi: 'Những người bạn động vật',
    titleEn: 'My Animal Friends',
    iconName: 'themeAnimalFriends',
    thumbnailEmoji: '🐾',
    descriptionVi:
      'Bé cho thú cưng ăn, chơi cùng các bạn, chăm sóc nhẹ nhàng và giúp các bạn đi ngủ.',
    descriptionEn:
      'Feed, play with, gently care for, and help familiar animal friends get ready for bed.',
    lessonIds: [
      'feed-the-puppy',
      'play-with-the-puppy',
      'find-the-kitten',
      'clean-muddy-paws',
      'care-for-the-rabbit',
    ],
  },
];

export const themes = themeCatalog;

export function getThemeById(themeId: string | undefined) {
  return themes.find(theme => theme.id === themeId);
}
