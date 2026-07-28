import { atSchoolLesson } from '../src/data/lessons/atSchool';
import { atSchoolVocabulary } from '../src/data/vocabulary';
import {
  getParentReviewTipText,
  getParentReviewWords,
} from '../src/utils/parentReviewWords';

test('parent review words hide challenge vocabulary in core mode', () => {
  const reviewWords = getParentReviewWords({
    hasReviewLessonAccess: true,
    learnedWordIds: [
      atSchoolVocabulary.writeName.id,
      atSchoolVocabulary.listen.id,
      atSchoolVocabulary.cleanUp.id,
    ],
    learningMode: 'core',
    lesson: atSchoolLesson,
  });

  expect(reviewWords).toEqual([atSchoolVocabulary.listen.word]);
  expect(reviewWords).not.toEqual(
    expect.arrayContaining([
      atSchoolVocabulary.writeName.word,
      atSchoolVocabulary.cleanUp.word,
    ]),
  );
});

test('parent review fallback words respect current learning mode', () => {
  const coreReviewWords = getParentReviewWords({
    hasReviewLessonAccess: true,
    learnedWordIds: [],
    learningMode: 'core',
    lesson: atSchoolLesson,
  });

  expect(coreReviewWords).toEqual([
    atSchoolVocabulary.teacher.word,
    atSchoolVocabulary.desk.word,
    atSchoolVocabulary.chair.word,
  ]);
  expect(coreReviewWords).not.toEqual(
    expect.arrayContaining([
      atSchoolVocabulary.writeName.word,
      atSchoolVocabulary.cleanUp.word,
    ]),
  );
});

test('parent review words stay hidden without review access', () => {
  expect(
    getParentReviewWords({
      hasReviewLessonAccess: false,
      learnedWordIds: [],
      learningMode: 'core',
      lesson: atSchoolLesson,
    }),
  ).toEqual([]);
});

test('parent review tip uses scoped review words before static lesson metadata', () => {
  const tipText = getParentReviewTipText({
    emptyText: 'empty',
    hasReviewLessonAccess: true,
    lockedText: 'locked',
    metadataTip: atSchoolLesson.metadata?.parentTipVi,
    reviewWordText: word => `review ${word}`,
    reviewWords: [atSchoolVocabulary.listen.word],
  });

  expect(tipText).toBe('review listen');
  expect(tipText).not.toContain('open book');
  expect(tipText).not.toContain('raise hand');
});
