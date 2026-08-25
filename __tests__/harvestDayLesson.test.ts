import { getSceneForLearningMode } from '../src/data/learningModes';
import { harvestDayLesson } from '../src/data/lessons/harvestDay';
import { getReviewGameItems } from '../src/games/reviewItems';
import type { LearningMode, SceneStep } from '../src/types/lesson';

const modes: LearningMode[] = ['core', 'expanded', 'challenge'];

function hasPronunciationPanel(step: SceneStep) {
  return Boolean(step.speechPractice || step.type === 'teach');
}

test.each([
  ['core', 8],
  ['expanded', 12],
  ['challenge', 16],
] as const)('%s mode exposes the vocabulary-first budget', (mode, count) => {
  const vocabulary = harvestDayLesson.scenes.flatMap(scene =>
    getSceneForLearningMode(scene, mode).vocabulary,
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
      'tomato',
      'ripe',
      'unripe',
      'pick',
      'basket',
      'vegetable',
      'herb',
      'carrot',
    ],
  ],
  [
    'expanded',
    [
      'tomato',
      'ripe',
      'unripe',
      'red',
      'pick',
      'basket',
      'fruit stem',
      'gentle',
      'vegetable',
      'herb',
      'carrot',
      'bruised',
    ],
  ],
  [
    'challenge',
    [
      'tomato',
      'ripe',
      'unripe',
      'red',
      'leave it on the plant',
      'pick',
      'basket',
      'fruit stem',
      'gentle',
      'branch',
      'vegetable',
      'herb',
      'carrot',
      'bruised',
      'sort by type',
      'separate',
    ],
  ],
] as const)('%s mode exposes the intended vocabulary set', (mode, words) => {
  expect(
    harvestDayLesson.scenes.flatMap(scene =>
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
    const speechModes = harvestDayLesson.scenes.flatMap(sourceScene => {
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
  harvestDayLesson.scenes.forEach(sourceScene => {
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
    harvestDayLesson.scenes.forEach(sourceScene => {
      const scene = getSceneForLearningMode(sourceScene, mode);

      scene.steps.forEach(step => {
        if (step.interaction.type === 'listen') {
          return;
        }

        const vietnameseAction =
          step.interaction.type === 'drag'
            ? /^Kéo\b/u
            : step.interaction.type === 'find'
            ? /^Tìm\b/u
            : /^Chạm\b/u;
        const englishAction =
          step.interaction.type === 'drag'
            ? /^Drag\b/u
            : step.interaction.type === 'find'
            ? /^Find\b/u
            : /^Tap\b/u;

        expect(step.instructionVi).toMatch(vietnameseAction);
        expect(step.instructionEn).toMatch(englishAction);
      });
    });
  },
);

test.each([
  ['core', [6, 6, 6]],
  ['expanded', [9, 9, 9]],
  ['challenge', [12, 12, 12]],
] as const)('%s mode keeps the frozen interaction rhythm', (mode, counts) => {
  expect(
    harvestDayLesson.scenes.map(
      scene =>
        getSceneForLearningMode(scene, mode).steps.filter(
          step => step.type !== 'intro',
        ).length,
    ),
  ).toEqual(counts);
});

test('only ripe tomatoes can leave the hero plant and the basket fills in two beats', () => {
  const findScene = harvestDayLesson.scenes.find(
    scene => scene.id === 'find-the-ripe-ones',
  )!;
  const pickScene = harvestDayLesson.scenes.find(
    scene => scene.id === 'pick-gently',
  )!;
  const greenTomatoId = 'find-the-ripe-ones-unripe-tomato';
  const ripeTomatoIds = [
    'pick-gently-ripe-tomato',
    'pick-gently-second-ripe-tomato',
  ];

  expect(
    findScene.steps.some(
      step =>
        step.interaction.type === 'drag' &&
        step.interaction.targetObjectId === greenTomatoId,
    ),
  ).toBe(false);

  const pickingSteps = pickScene.steps.filter(
    step =>
      step.interaction.type === 'drag' &&
      ripeTomatoIds.includes(step.interaction.targetObjectId ?? ''),
  );

  expect(pickingSteps.map(step => step.interaction.targetObjectId)).toEqual(
    ripeTomatoIds,
  );
  pickingSteps.forEach((step, index) => {
    expect(step.interaction).toMatchObject({
      type: 'drag',
      targetObjectId: ripeTomatoIds[index],
      dropZoneId: 'pick-gently-basket-zone',
    });
    expect(step.successStateChanges).toContainEqual({
      targetObjectId: ripeTomatoIds[index],
      type: 'hideObject',
    });
    expect(
      step.successStateChanges?.some(
        change => change.targetObjectId === 'pick-gently-hero-plant',
      ),
    ).toBe(false);
  });

  expect(pickingSteps[0].successStateChanges).toContainEqual({
    targetObjectId: 'pick-gently-basket',
    type: 'setObjectVariant',
    variantId: 'filled',
  });
  expect(pickingSteps[1].successStateChanges).toContainEqual({
    targetObjectId: 'pick-gently-basket-second-tomato',
    type: 'showObject',
  });
});

test('bruised produce goes to an adult-check tray', () => {
  const sortScene = harvestDayLesson.scenes.find(
    scene => scene.id === 'sort-the-harvest',
  )!;
  const adultCheck = sortScene.steps.find(
    step => step.id === 'sort-the-harvest-adult-check-bruised',
  )!;

  expect(adultCheck.instructionVi).toContain('người lớn kiểm tra');
  expect(adultCheck.interaction).toMatchObject({
    type: 'drag',
    targetObjectId: 'sort-the-harvest-bruised-tomato',
    dropZoneId: 'sort-the-harvest-adult-check-zone',
  });

  const confirmation = sortScene.steps.find(
    step => step.id === 'sort-the-harvest-confirm-adult-check',
  )!;
  expect(confirmation.learningScope).toEqual({ minMode: 'expanded' });
  expect(confirmation.interaction.targetObjectId).toBe(
    'sort-the-harvest-adult-check-tray',
  );
});

test('challenge verifies the sorted-basket payoff before scene completion', () => {
  const sortScene = harvestDayLesson.scenes.find(
    scene => scene.id === 'sort-the-harvest',
  )!;
  const choice = sortScene.steps.find(
    step => step.id === 'sort-the-harvest-choose-sort-by-type',
  )!;
  const confirmation = sortScene.steps.find(
    step => step.id === 'sort-the-harvest-confirm-sorted-baskets',
  )!;

  expect(choice.successStateChanges).toContainEqual({
    targetObjectId: 'sort-the-harvest-sorted-baskets',
    type: 'showObject',
  });
  expect(confirmation.interaction.targetObjectId).toBe(
    'sort-the-harvest-sorted-baskets',
  );
});

test('review selection is the frozen executable 4-5-6 set', () => {
  expect(
    getReviewGameItems(harvestDayLesson, 'core').map(item => item.word),
  ).toEqual(['ripe', 'unripe', 'pick', 'vegetable']);
  expect(
    getReviewGameItems(harvestDayLesson, 'expanded').map(item => item.word),
  ).toEqual(['ripe', 'unripe', 'pick', 'vegetable', 'fruit stem']);
  expect(
    getReviewGameItems(harvestDayLesson, 'challenge').map(item => item.word),
  ).toEqual([
    'ripe',
    'unripe',
    'pick',
    'vegetable',
    'fruit stem',
    'sort by type',
  ]);

  modes.forEach(mode => {
    const items = getReviewGameItems(harvestDayLesson, mode);
    expect(new Set(items.map(item => item.visualId)).size).toBe(items.length);
  });
});
