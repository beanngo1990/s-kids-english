import type { VocabularyItem } from '../types/lesson';

export const bedroomVocabulary = {
  bed: {
    id: 'vocab-bed',
    word: 'bed',
    meaningVi: 'cái giường',
    level: 'easy',
    type: 'noun',
  },
  blanket: {
    id: 'vocab-blanket',
    word: 'blanket',
    meaningVi: 'cái chăn',
    level: 'easy',
    type: 'noun',
  },
  sun: {
    id: 'vocab-sun',
    word: 'sun',
    meaningVi: 'mặt trời',
    level: 'easy',
    type: 'noun',
  },
  pillow: {
    id: 'vocab-pillow',
    word: 'pillow',
    meaningVi: 'cái gối',
    learningScope: {
      minAge: 4,
      minMode: 'expanded',
    },
    level: 'medium',
    type: 'noun',
  },
  lamp: {
    id: 'vocab-lamp',
    word: 'lamp',
    meaningVi: 'đèn ngủ',
    learningScope: {
      minAge: 4,
      minMode: 'expanded',
    },
    level: 'medium',
    type: 'noun',
  },
  window: {
    id: 'vocab-window',
    word: 'window',
    meaningVi: 'cửa sổ',
    learningScope: {
      minAge: 5,
      minMode: 'challenge',
    },
    level: 'hard',
    type: 'noun',
  },
  clock: {
    id: 'vocab-clock',
    word: 'clock',
    meaningVi: 'đồng hồ',
    learningScope: {
      minAge: 4,
      minMode: 'expanded',
    },
    level: 'medium',
    type: 'noun',
  },
  socks: {
    id: 'vocab-socks',
    word: 'socks',
    meaningVi: 'đôi tất',
    learningScope: {
      minAge: 5,
      minMode: 'challenge',
    },
    level: 'hard',
    type: 'noun',
  },
  doll: {
    id: 'vocab-doll',
    word: 'doll',
    meaningVi: 'búp bê',
    learningScope: {
      minAge: 5,
      minMode: 'challenge',
    },
    level: 'hard',
    type: 'noun',
  },
} satisfies Record<string, VocabularyItem>;

export const bathroomVocabulary = {
  toothbrush: {
    id: 'vocab-toothbrush',
    word: 'toothbrush',
    meaningVi: 'bàn chải đánh răng',
    level: 'easy',
    type: 'noun',
  },
  water: {
    id: 'vocab-water',
    word: 'water',
    meaningVi: 'nước',
    level: 'easy',
    type: 'noun',
  },
  towel: {
    id: 'vocab-towel',
    word: 'towel',
    meaningVi: 'khăn mặt',
    level: 'easy',
    type: 'noun',
  },
} satisfies Record<string, VocabularyItem>;

export const breakfastVocabulary = {
  milk: {
    id: 'vocab-milk',
    word: 'milk',
    meaningVi: 'sữa',
    level: 'easy',
    type: 'noun',
  },
  apple: {
    id: 'vocab-apple',
    word: 'apple',
    meaningVi: 'quả táo',
    level: 'easy',
    type: 'noun',
  },
  bread: {
    id: 'vocab-bread',
    word: 'bread',
    meaningVi: 'bánh mì',
    level: 'easy',
    type: 'noun',
  },
} satisfies Record<string, VocabularyItem>;

export const schoolVocabulary = {
  bag: {
    id: 'vocab-bag',
    word: 'bag',
    meaningVi: 'cặp sách',
    level: 'easy',
    type: 'noun',
  },
  shoes: {
    id: 'vocab-shoes',
    word: 'shoes',
    meaningVi: 'giày',
    level: 'easy',
    type: 'noun',
  },
  school: {
    id: 'vocab-school',
    word: 'school',
    meaningVi: 'trường học',
    level: 'easy',
    type: 'noun',
  },
} satisfies Record<string, VocabularyItem>;

export const morningVocabulary: VocabularyItem[] = [
  ...Object.values(bedroomVocabulary),
  ...Object.values(bathroomVocabulary),
  ...Object.values(breakfastVocabulary),
  ...Object.values(schoolVocabulary),
];
