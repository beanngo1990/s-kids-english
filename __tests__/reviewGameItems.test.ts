import { bedtimeLesson } from '../src/data/lessons/bedtime';
import {
  getReviewGameItems,
  getReviewItemCount,
} from '../src/games/reviewItems';
import { hasPlayableReviewGame } from '../src/games/GameRegistry';
import type { Lesson } from '../src/types/lesson';

test('bedtime review uses its authored vocabulary ids in every learning mode', () => {
  const expectedIds = bedtimeLesson.reviewGame?.config?.vocabularyIds;

  expect(expectedIds).toEqual([
    'vocab-bedtime-storybook',
    'vocab-bedtime-night-light',
    'vocab-bedtime-sound-machine',
    'vocab-bedtime-sleep-mask',
  ]);

  for (const learningMode of ['core', 'expanded', 'challenge'] as const) {
    expect(
      getReviewGameItems(bedtimeLesson, learningMode).map(item => item.id),
    ).toEqual(expectedIds);
  }
});

test('bedtime review does not pull extra bedtime vocabulary outside config', () => {
  const reviewedWords = getReviewGameItems(bedtimeLesson, 'challenge').map(
    item => item.word,
  );

  expect(reviewedWords).toEqual([
    'storybook',
    'night light',
    'sound machine',
    'sleep mask',
  ]);
  expect(reviewedWords).not.toEqual(
    expect.arrayContaining([
      'dream journal',
      'glow sticker',
      'moon mobile',
    ]),
  );
});

test('review items still respect learning mode scope when config includes later words', () => {
  const lesson = createScopedReviewLesson();

  expect(getReviewGameItems(lesson, 'core').map(item => item.id)).toEqual([
    'vocab-core-word',
  ]);
  expect(getReviewGameItems(lesson, 'expanded').map(item => item.id)).toEqual([
    'vocab-core-word',
    'vocab-expanded-word',
  ]);
});

test('review item count and playable type helpers include matching support', () => {
  expect(getReviewItemCount(undefined, 'core')).toBe(4);
  expect(getReviewItemCount(undefined, 'expanded')).toBe(5);
  expect(getReviewItemCount(undefined, 'challenge')).toBe(6);
  expect(
    hasPlayableReviewGame({
      id: 'match-review',
      titleVi: 'Nối hình',
      type: 'matching',
    }),
  ).toBe(true);
  expect(
    hasPlayableReviewGame({
      id: 'random-review',
      titleVi: 'Ngẫu nhiên',
      type: 'random',
    }),
  ).toBe(true);
  expect(hasPlayableReviewGame(undefined)).toBe(false);
});

function createScopedReviewLesson(): Lesson {
  return {
    ageRange: {
      max: 5,
      min: 3,
    },
    descriptionVi: 'Demo',
    id: 'scoped-review',
    reviewGame: {
      config: {
        vocabularyIds: ['vocab-core-word', 'vocab-expanded-word'],
      },
      id: 'scoped-review-game',
      titleVi: 'Ôn tập',
      type: 'memory',
    },
    scenes: [
      {
        background: {
          id: 'scoped-background',
          source: 'lessons/scoped-review/scene/images/background.webp',
          type: 'image',
        },
        id: 'scene',
        objects: [
          {
            asset: {
              id: 'core-image',
              source: 'lessons/scoped-review/scene/images/core.webp',
              type: 'image',
            },
            id: 'core-object',
            isInteractive: true,
            position: { height: 10, width: 10, x: 10, y: 10 },
            role: 'learning',
            vocabId: 'vocab-core-word',
          },
          {
            asset: {
              id: 'expanded-image',
              source: 'lessons/scoped-review/scene/images/expanded.webp',
              type: 'image',
            },
            id: 'expanded-object',
            isInteractive: true,
            learningScope: {
              minMode: 'expanded',
            },
            position: { height: 10, width: 10, x: 30, y: 10 },
            role: 'learning',
            vocabId: 'vocab-expanded-word',
          },
        ],
        steps: [
          {
            id: 'intro',
            instructionVi: 'Nghe nhé.',
            interaction: {
              type: 'listen',
            },
            successFeedbackVi: 'Giỏi lắm.',
            targetObjectIds: [],
            type: 'intro',
          },
        ],
        titleEn: 'Scene',
        titleVi: 'Cảnh',
        vocabulary: [
          {
            id: 'vocab-core-word',
            level: 'easy',
            meaningVi: 'từ cơ bản',
            type: 'noun',
            word: 'core word',
          },
          {
            id: 'vocab-expanded-word',
            learningScope: {
              minMode: 'expanded',
            },
            level: 'medium',
            meaningVi: 'từ mở rộng',
            type: 'noun',
            word: 'expanded word',
          },
        ],
      },
    ],
    themeId: 'mot-ngay-cua-be',
    titleEn: 'Scoped Review',
    titleVi: 'Ôn theo phạm vi',
  };
}
