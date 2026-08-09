import { bedtimeLesson } from '../src/data/lessons/bedtime';
import { lessons } from '../src/data/lessons';
import {
  getReviewGameItems,
  getReviewItemCount,
} from '../src/games/reviewItems';
import { hasPlayableReviewGame } from '../src/games/GameRegistry';
import type { Lesson } from '../src/types/lesson';

test('bedtime review grows from authored easy words into medium and hard words', () => {
  const expectedIds = [
    'vocab-bedtime-storybook',
    'vocab-bedtime-night-light',
    'vocab-bedtime-sound-machine',
    'vocab-bedtime-sleep-mask',
  ];

  expect(bedtimeLesson.reviewGame?.config?.vocabularyIds).toEqual(expectedIds);

  expect(
    getReviewGameItems(bedtimeLesson, 'core').map(item => item.id),
  ).toEqual(expectedIds);
  expect(
    getReviewGameItems(bedtimeLesson, 'expanded').map(item => item.id),
  ).toEqual([...expectedIds, 'vocab-bedtime-page-tab']);
  expect(
    getReviewGameItems(bedtimeLesson, 'challenge').map(item => item.id),
  ).toEqual([...expectedIds, 'vocab-bedtime-page-tab', 'vocab-place-bookmark']);
});

test('challenge review progresses from easy to medium and hard without duplicate visuals', () => {
  const reviewedItems = getReviewGameItems(bedtimeLesson, 'challenge');

  expect(reviewedItems.map(item => item.word)).toEqual([
    'storybook',
    'night light',
    'sound machine',
    'sleep mask',
    'page tab',
    'place the bookmark',
  ]);
  expect(reviewedItems.map(item => item.level)).toEqual([
    'easy',
    'easy',
    'easy',
    'easy',
    'medium',
    'hard',
  ]);
  expect(new Set(reviewedItems.map(item => item.visualId)).size).toBe(6);
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

test('every authored review scales its playable pool across all three modes', () => {
  const reviewLessons = lessons.filter(lesson => lesson.reviewGame);

  for (const lesson of reviewLessons) {
    const coreItems = getReviewGameItems(lesson, 'core');
    const expandedItems = getReviewGameItems(lesson, 'expanded');
    const challengeItems = getReviewGameItems(lesson, 'challenge');

    expect({ count: coreItems.length, lessonId: lesson.id }).toEqual({
      count: 4,
      lessonId: lesson.id,
    });
    expect({ count: expandedItems.length, lessonId: lesson.id }).toEqual({
      count: 5,
      lessonId: lesson.id,
    });
    expect({ count: challengeItems.length, lessonId: lesson.id }).toEqual({
      count: 6,
      lessonId: lesson.id,
    });
    expect({
      hasMedium: expandedItems.some(item => item.level === 'medium'),
      lessonId: lesson.id,
    }).toEqual({ hasMedium: true, lessonId: lesson.id });
    expect({
      hasHard: challengeItems.some(item => item.level === 'hard'),
      lessonId: lesson.id,
    }).toEqual({ hasHard: true, lessonId: lesson.id });
    expect({
      lessonId: lesson.id,
      uniqueVisuals: new Set(challengeItems.map(item => item.visualId)).size,
    }).toEqual({ lessonId: lesson.id, uniqueVisuals: challengeItems.length });
  }
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
