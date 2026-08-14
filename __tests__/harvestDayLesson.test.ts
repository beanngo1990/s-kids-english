import { getSceneForLearningMode } from '../src/data/learningModes';
import { harvestDayLesson } from '../src/data/lessons/harvestDay';
import { getReviewGameItems } from '../src/games/reviewItems';
import type { LearningMode, SceneStep } from '../src/types/lesson';

const modes: LearningMode[] = ['core', 'expanded', 'challenge'];

function hasPronunciationPanel(step: SceneStep) {
  return Boolean(step.speechPractice || step.type === 'teach');
}

test.each([
  ['core', 6],
  ['expanded', 8],
  ['challenge', 10],
] as const)('%s mode exposes the frozen vocabulary budget', (mode, count) => {
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
  ['core', 6, 0],
  ['expanded', 6, 2],
  ['challenge', 8, 2],
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
  ['core', [6, 4, 6]],
  ['expanded', [6, 5, 8]],
  ['challenge', [9, 5, 10]],
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

test('only the ripe tomato can leave the hero plant', () => {
  const findScene = harvestDayLesson.scenes.find(
    scene => scene.id === 'find-the-ripe-ones',
  )!;
  const pickScene = harvestDayLesson.scenes.find(
    scene => scene.id === 'pick-gently',
  )!;
  const greenTomatoId = 'find-the-ripe-ones-unripe-tomato';
  const ripeTomatoId = 'pick-gently-ripe-tomato';

  expect(
    findScene.steps.some(
      step =>
        step.interaction.type === 'drag' &&
        step.interaction.targetObjectId === greenTomatoId,
    ),
  ).toBe(false);

  const pickingStep = pickScene.steps.find(
    step => step.id === 'pick-gently-place-tomato-in-basket',
  )!;
  expect(pickingStep.interaction).toMatchObject({
    type: 'drag',
    targetObjectId: ripeTomatoId,
    dropZoneId: 'pick-gently-basket-zone',
  });
  expect(pickingStep.successStateChanges).toContainEqual({
    targetObjectId: ripeTomatoId,
    type: 'hideObject',
  });
  expect(
    pickingStep.successStateChanges?.some(
      change => change.targetObjectId === 'pick-gently-hero-plant',
    ),
  ).toBe(false);
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
