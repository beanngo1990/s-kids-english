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
  box: {
    id: 'vocab-box',
    word: 'box',
    meaningVi: 'cái hộp',
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
  goodMorning: {
    id: 'vocab-good-morning',
    word: 'good morning',
    meaningVi: 'chào buổi sáng',
    learningScope: {
      minAge: 5,
      minMode: 'challenge',
    },
    level: 'hard',
    type: 'phrase',
  },
  makeTheBed: {
    id: 'vocab-make-the-bed',
    word: 'make the bed',
    meaningVi: 'dọn giường',
    learningScope: {
      minAge: 5,
      minMode: 'challenge',
    },
    level: 'hard',
    type: 'phrase',
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
  sink: {
    id: 'vocab-sink',
    word: 'sink',
    meaningVi: 'bồn rửa',
    learningScope: {
      minAge: 4,
      minMode: 'expanded',
    },
    level: 'medium',
    type: 'noun',
  },
  soap: {
    id: 'vocab-soap',
    word: 'soap',
    meaningVi: 'xà phòng',
    learningScope: {
      minAge: 4,
      minMode: 'expanded',
    },
    level: 'medium',
    type: 'noun',
  },
  mirror: {
    id: 'vocab-mirror',
    word: 'mirror',
    meaningVi: 'cái gương',
    learningScope: {
      minAge: 4,
      minMode: 'expanded',
    },
    level: 'medium',
    type: 'noun',
  },
  toothpaste: {
    id: 'vocab-toothpaste',
    word: 'toothpaste',
    meaningVi: 'kem đánh răng',
    learningScope: {
      minAge: 5,
      minMode: 'challenge',
    },
    level: 'hard',
    type: 'noun',
  },
  brushTeeth: {
    id: 'vocab-brush-teeth',
    word: 'brush teeth',
    meaningVi: 'đánh răng',
    learningScope: {
      minAge: 5,
      minMode: 'challenge',
    },
    level: 'hard',
    type: 'phrase',
  },
  washFace: {
    id: 'vocab-wash-face',
    word: 'wash face',
    meaningVi: 'rửa mặt',
    learningScope: {
      minAge: 5,
      minMode: 'challenge',
    },
    level: 'hard',
    type: 'phrase',
  },
  dryFace: {
    id: 'vocab-dry-face',
    word: 'dry face',
    meaningVi: 'lau mặt',
    learningScope: {
      minAge: 5,
      minMode: 'challenge',
    },
    level: 'hard',
    type: 'phrase',
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
