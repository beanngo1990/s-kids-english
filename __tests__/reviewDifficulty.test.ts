import {
  getReviewDifficultyProfile,
  isVocabularyLevelAvailable,
} from '../src/games/difficulty';

test('review difficulty profiles scale content and choices from easy to hard', () => {
  expect(getReviewDifficultyProfile('core')).toMatchObject({
    itemCount: 4,
    listenOptionCount: 2,
    selectionAudioEnabled: true,
  });
  expect(getReviewDifficultyProfile('expanded')).toMatchObject({
    itemCount: 5,
    listenOptionCount: 3,
    selectionAudioEnabled: true,
  });
  expect(getReviewDifficultyProfile('challenge')).toMatchObject({
    itemCount: 6,
    listenOptionCount: 4,
    selectionAudioEnabled: false,
  });
});

test('vocabulary levels unlock cumulatively with the selected mode', () => {
  expect(isVocabularyLevelAvailable('easy', 'core')).toBe(true);
  expect(isVocabularyLevelAvailable('medium', 'core')).toBe(false);
  expect(isVocabularyLevelAvailable('hard', 'expanded')).toBe(false);
  expect(isVocabularyLevelAvailable('medium', 'expanded')).toBe(true);
  expect(isVocabularyLevelAvailable('hard', 'challenge')).toBe(true);
});
