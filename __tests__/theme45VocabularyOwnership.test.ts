import { careForTheRabbitLesson } from '../src/data/lessons/careForTheRabbit';
import { cleanMuddyPawsLesson } from '../src/data/lessons/cleanMuddyPaws';
import { feedThePuppyLesson } from '../src/data/lessons/feedThePuppy';
import { findTheKittenLesson } from '../src/data/lessons/findTheKitten';
import { gardenFriendsLesson } from '../src/data/lessons/gardenFriends';
import { gardenToTableLesson } from '../src/data/lessons/gardenToTable';
import { groomTheKittenLesson } from '../src/data/lessons/groomTheKitten';
import { harvestDayLesson } from '../src/data/lessons/harvestDay';
import { helpItGrowLesson } from '../src/data/lessons/helpItGrow';
import { myFeelingsLesson } from '../src/data/lessons/myFeelings';
import { plantASeedLesson } from '../src/data/lessons/plantASeed';
import { playWithThePuppyLesson } from '../src/data/lessons/playWithThePuppy';

const theme45Lessons = [
  plantASeedLesson,
  helpItGrowLesson,
  gardenFriendsLesson,
  harvestDayLesson,
  gardenToTableLesson,
  feedThePuppyLesson,
  playWithThePuppyLesson,
  findTheKittenLesson,
  cleanMuddyPawsLesson,
  careForTheRabbitLesson,
  groomTheKittenLesson,
];

const theme5Lessons = [
  feedThePuppyLesson,
  playWithThePuppyLesson,
  findTheKittenLesson,
  cleanMuddyPawsLesson,
  careForTheRabbitLesson,
  groomTheKittenLesson,
];

function vocabularyWords(lesson: (typeof theme45Lessons)[number]) {
  return lesson.scenes.flatMap(scene =>
    (scene.vocabulary ?? []).map(item => item.word),
  );
}

test('Theme 3 owns happy while Themes 4 and 5 use contextual outcome anchors', () => {
  expect(vocabularyWords(myFeelingsLesson)).toContain('happy');

  const happyAnchors = theme45Lessons.flatMap(lesson =>
    vocabularyWords(lesson)
      .filter(word => /\bhappy\b/iu.test(word))
      .map(word => `${lesson.id}:${word}`),
  );
  expect(happyAnchors).toEqual([]);

  expect(vocabularyWords(feedThePuppyLesson)).toContain('celebrate');
  expect(vocabularyWords(playWithThePuppyLesson)).toContain('playful');
  expect(vocabularyWords(findTheKittenLesson)).toContain('friendly');
  expect(vocabularyWords(cleanMuddyPawsLesson)).toContain('stand');
  expect(vocabularyWords(careForTheRabbitLesson)).toEqual(
    expect.arrayContaining(['calm', 'the rabbit hops']),
  );
  expect(vocabularyWords(groomTheKittenLesson)).toEqual(
    expect.arrayContaining(['cheerful', 'relaxed']),
  );
});

test('Theme 5 repeats only standalone foundation and safety targets', () => {
  const ownersByWord = new Map<string, string[]>();

  theme5Lessons.forEach(lesson => {
    vocabularyWords(lesson).forEach(word => {
      ownersByWord.set(word, [...(ownersByWord.get(word) ?? []), lesson.id]);
    });
  });

  const duplicates = Object.fromEntries(
    [...ownersByWord.entries()]
      .filter(([, lessonIds]) => new Set(lessonIds).size > 1)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([word, lessonIds]) => [word, [...new Set(lessonIds)].sort()]),
  );

  expect(duplicates).toEqual({
    'ask an adult': ['clean-muddy-paws', 'feed-the-puppy'],
    bowl: ['care-for-the-rabbit', 'feed-the-puppy'],
    empty: ['care-for-the-rabbit', 'feed-the-puppy'],
    hungry: ['care-for-the-rabbit', 'feed-the-puppy'],
    kitten: ['find-the-kitten', 'groom-the-kitten'],
    mat: ['feed-the-puppy', 'groom-the-kitten'],
    'pet gently': ['care-for-the-rabbit', 'find-the-kitten'],
    'put it down': ['care-for-the-rabbit', 'feed-the-puppy'],
    ready: ['feed-the-puppy', 'play-with-the-puppy'],
    wait: ['clean-muddy-paws', 'feed-the-puppy'],
    water: ['care-for-the-rabbit', 'clean-muddy-paws'],
  });
});

test.each([
  [feedThePuppyLesson, 'wag', 'wag-action.webp'],
  [playWithThePuppyLesson, 'playful', 'puppy-play-bow.webp'],
  [findTheKittenLesson, 'friendly', 'kitten-approaching-hand.webp'],
  [cleanMuddyPawsLesson, 'fluffy towel', 'soft-towel.webp'],
  [cleanMuddyPawsLesson, 'stand', 'puppy-all-done.webp'],
  [careForTheRabbitLesson, 'gentle rabbit', 'rabbit-standing-calm.webp'],
  [careForTheRabbitLesson, 'calm', 'rabbit-pet-soft.webp'],
  [groomTheKittenLesson, 'bristles', 'grooming-brush.webp'],
  [groomTheKittenLesson, 'neat', 'kitten-fluffy-neat.webp'],
  [groomTheKittenLesson, 'shiny coat', 'kitten-shiny-coat.webp'],
  [groomTheKittenLesson, 'purr', 'kitten-purring-hearts.webp'],
  [groomTheKittenLesson, 'cozy', 'kitten-cozy-curled.webp'],
  [groomTheKittenLesson, 'relaxed', 'kitten-content.webp'],
] as const)(
  '%s exposes a direct Reward representative for %s',
  (lesson, word, assetSuffix) => {
    const scene = lesson.scenes.find(item =>
      item.vocabulary?.some(vocabulary => vocabulary.word === word),
    )!;
    const vocabulary = scene.vocabulary!.find(item => item.word === word)!;
    const representative = scene.objects.find(
      object => object.vocabId === vocabulary.id,
    );

    expect(representative?.initialVisibility).toBe('hidden');
    expect(representative?.asset.source.endsWith(assetSuffix)).toBe(true);
  },
);
