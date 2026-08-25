import { getSceneForLearningMode } from '../src/data/learningModes';
import { gardenFriendsLesson } from '../src/data/lessons/gardenFriends';
import { gardenToTableLesson } from '../src/data/lessons/gardenToTable';
import { harvestDayLesson } from '../src/data/lessons/harvestDay';
import { helpItGrowLesson } from '../src/data/lessons/helpItGrow';
import { plantASeedLesson } from '../src/data/lessons/plantASeed';
import { getReviewGameItems } from '../src/games/reviewItems';
import type { LearningMode, SceneStep } from '../src/types/lesson';

const modes: LearningMode[] = ['core', 'expanded', 'challenge'];
const animalObjectIds = new Set([
  'under-the-leaf-earthworm',
  'under-the-leaf-snail',
  'under-the-leaf-shell',
  'flower-visitors-bee',
  'flower-visitors-butterfly',
  'flower-visitors-wings',
  'quiet-garden-watch-caterpillar',
]);

function hasPronunciationPanel(step: SceneStep) {
  return Boolean(step.speechPractice || step.type === 'teach');
}

test.each([
  ['core', 8],
  ['expanded', 12],
  ['challenge', 16],
] as const)('%s mode exposes the vocabulary-first budget', (mode, count) => {
  const vocabulary = gardenFriendsLesson.scenes.flatMap(
    scene => getSceneForLearningMode(scene, mode).vocabulary,
  );

  expect(vocabulary).toHaveLength(count);
  vocabulary.forEach(item => {
    expect(item.level).toBe(
      item.learningScope?.minMode === 'challenge'
        ? 'hard'
        : item.learningScope?.minMode === 'expanded'
        ? 'medium'
        : 'easy',
    );
  });
});

test.each([
  [
    'core',
    [
      'leaf',
      'earthworm',
      'snail',
      'flower',
      'bee',
      'butterfly',
      'fruit',
      'caterpillar',
    ],
  ],
  [
    'expanded',
    [
      'leaf',
      'earthworm',
      'snail',
      'tunnel',
      'flower',
      'bee',
      'butterfly',
      'fruit',
      'wings',
      'caterpillar',
      'birdbath',
      'water drop',
    ],
  ],
  [
    'challenge',
    [
      'leaf',
      'earthworm',
      'snail',
      'tunnel',
      'shell',
      'look under the leaf',
      'flower',
      'bee',
      'butterfly',
      'fruit',
      'wings',
      'visit the flower',
      'caterpillar',
      'birdbath',
      'water drop',
      'watch gently',
    ],
  ],
] as const)('%s mode exposes the intended vocabulary set', (mode, words) => {
  expect(
    gardenFriendsLesson.scenes.flatMap(scene =>
      getSceneForLearningMode(scene, mode).vocabulary.map(item => item.word),
    ),
  ).toEqual(words);
});

test.each([
  ['core', 8, 0],
  ['expanded', 8, 4],
  ['challenge', 12, 4],
] as const)(
  '%s mode keeps one pronunciation encounter per New Anchor',
  (mode, autoCount, optionalCount) => {
    const speechModes = gardenFriendsLesson.scenes.flatMap(sourceScene => {
      const scene = getSceneForLearningMode(sourceScene, mode);

      return scene.vocabulary.map(vocabulary => {
        const speechSteps = scene.steps.filter(
          step => step.vocabId === vocabulary.id && hasPronunciationPanel(step),
        );

        expect(speechSteps).toHaveLength(1);
        return speechSteps[0].speechPractice ?? 'auto';
      });
    });

    expect(speechModes.filter(item => item === 'auto')).toHaveLength(autoCount);
    expect(speechModes.filter(item => item === 'optional')).toHaveLength(
      optionalCount,
    );
  },
);

test.each(modes)('%s mode separates pronunciation panels with action', mode => {
  gardenFriendsLesson.scenes.forEach(sourceScene => {
    const scene = getSceneForLearningMode(sourceScene, mode);

    for (let index = 1; index < scene.steps.length; index += 1) {
      expect(
        hasPronunciationPanel(scene.steps[index - 1]) &&
          hasPronunciationPanel(scene.steps[index]),
      ).toBe(false);
    }
  });
});

test.each(modes)(
  '%s mode tells the child the required gesture in every interactive prompt',
  mode => {
    gardenFriendsLesson.scenes.forEach(sourceScene => {
      const scene = getSceneForLearningMode(sourceScene, mode);

      scene.steps.forEach(step => {
        if (step.interaction.type === 'listen') {
          return;
        }

        const vietnameseAction =
          step.interaction.type === 'drag' ? /^Kéo\b/u : /^(Chạm|Tìm)\b/u;
        const englishAction =
          step.interaction.type === 'drag' ? /^Drag\b/u : /^(Tap|Find)\b/u;

        expect(step.instructionVi).toMatch(vietnameseAction);
        expect(step.instructionEn).toMatch(englishAction);
      });
    });
  },
);

test('observation prompts use concrete controls and match their authored positions', () => {
  const flowerScene = gardenFriendsLesson.scenes.find(
    scene => scene.id === 'flower-visitors',
  )!;
  const waitForBee = flowerScene.steps.find(
    step => step.id === 'flower-visitors-wait-for-bee',
  )!;
  const waitForButterfly = flowerScene.steps.find(
    step => step.id === 'flower-visitors-wait-for-butterfly',
  )!;

  expect(waitForBee.instructionVi).toContain('kính lúp dưới bên phải');
  expect(waitForButterfly.instructionVi).toContain('kính lúp dưới bên trái');

  gardenFriendsLesson.scenes.forEach(scene => {
    scene.steps.forEach(step => {
      expect(step.instructionVi).not.toContain('vòng quan sát');
      expect(step.failFeedbackVi ?? '').not.toContain('vòng quan sát');
    });
  });
});

test.each([
  ['core', [6, 8, 5]],
  ['expanded', [8, 9, 8]],
  ['challenge', [13, 11, 10]],
] as const)('%s mode keeps the vocabulary-first interaction rhythm', (mode, counts) => {
  expect(
    gardenFriendsLesson.scenes.map(
      scene =>
        getSceneForLearningMode(scene, mode).steps.filter(
          step => step.type !== 'intro',
        ).length,
    ),
  ).toEqual(counts);
});

test('new vocabulary uses visuals that directly show each meaning', () => {
  const leafScene = gardenFriendsLesson.scenes.find(
    scene => scene.id === 'under-the-leaf',
  )!;
  const flowerScene = gardenFriendsLesson.scenes.find(
    scene => scene.id === 'flower-visitors',
  )!;
  const quietScene = gardenFriendsLesson.scenes.find(
    scene => scene.id === 'quiet-garden-watch',
  )!;

  expect(
    leafScene.objects.find(object => object.id === 'under-the-leaf-leaf-cover')
      ?.vocabId,
  ).toBe('vocab-garden-friends-under-the-leaf-leaf');
  expect(
    leafScene.objects.find(object => object.id === 'under-the-leaf-shell')
      ?.asset.source,
  ).toBe('lessons/garden-friends/under-the-leaf/images/snail.webp');
  expect(
    flowerScene.objects.find(object => object.id === 'flower-visitors-plant')
      ?.vocabId,
  ).toBe('vocab-garden-friends-flower-visitors-fruit');
  expect(
    flowerScene.objects.find(object => object.id === 'flower-visitors-wings')
      ?.asset.source,
  ).toBe('lessons/garden-friends/flower-visitors/images/butterfly.webp');
  expect(
    flowerScene.objects.find(
      object => object.id === 'flower-visitors-visit-flower',
    )?.asset.source,
  ).toBe('lessons/garden-friends/flower-visitors/images/flower.webp');
  expect(
    quietScene.objects.find(
      object => object.id === 'quiet-garden-watch-water-drop',
    )?.vocabId,
  ).toBe('vocab-garden-friends-quiet-garden-watch-water-drop');
});

test('children observe animals through controls instead of manipulating them', () => {
  gardenFriendsLesson.scenes.forEach(sourceScene => {
    const scene = getSceneForLearningMode(sourceScene, 'challenge');

    scene.objects
      .filter(object => animalObjectIds.has(object.id))
      .forEach(object => expect(object.isInteractive).toBe(false));
    scene.steps.forEach(step => {
      expect(animalObjectIds.has(step.interaction.targetObjectId ?? '')).toBe(
        false,
      );
      expect(
        step.interaction.correctObjectIds?.some(id => animalObjectIds.has(id)) ??
          false,
      ).toBe(false);
    });
  });
});

test('review selection is the frozen executable 4-5-6 set', () => {
  expect(
    getReviewGameItems(gardenFriendsLesson, 'core').map(item => item.word),
  ).toEqual(['earthworm', 'bee', 'butterfly', 'snail']);
  expect(
    getReviewGameItems(gardenFriendsLesson, 'expanded').map(item => item.word),
  ).toEqual(['earthworm', 'bee', 'butterfly', 'snail', 'tunnel']);
  expect(
    getReviewGameItems(gardenFriendsLesson, 'challenge').map(item => item.word),
  ).toEqual([
    'earthworm',
    'bee',
    'butterfly',
    'snail',
    'tunnel',
    'look under the leaf',
  ]);

  modes.forEach(mode => {
    const items = getReviewGameItems(gardenFriendsLesson, mode);
    expect(new Set(items.map(item => item.visualId)).size).toBe(items.length);
  });
});

test('all Theme 4 lessons are visibly labelled as advanced', () => {
  [
    plantASeedLesson,
    helpItGrowLesson,
    gardenFriendsLesson,
    harvestDayLesson,
    gardenToTableLesson,
  ].forEach(lesson => {
    expect(lesson.ageRange).toEqual({
      min: 6,
      max: 8,
      label: '6-8 tuổi · Nâng cao',
    });
  });
});
