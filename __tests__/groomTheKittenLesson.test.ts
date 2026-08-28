import { getSceneForLearningMode } from '../src/data/learningModes';
import { groomTheKittenLesson } from '../src/data/lessons/groomTheKitten';
import {
  applySceneStateChanges,
  resolveSceneObject,
  type SceneRuntimeState,
} from '../src/engine/SceneState';
import { getReviewGameItems } from '../src/games/reviewItems';
import type { LearningMode, SceneStep } from '../src/types/lesson';

const modes: LearningMode[] = ['core', 'expanded', 'challenge'];

function hasPronunciationPanel(step: SceneStep) {
  return Boolean(step.speechPractice || step.type === 'teach');
}

test.each([
  ['core', 9],
  ['expanded', 18],
  ['challenge', 27],
] as const)(
  '%s mode exposes the foundation vocabulary budget',
  (mode, count) => {
    const vocabulary = groomTheKittenLesson.scenes.flatMap(
      scene => getSceneForLearningMode(scene, mode).vocabulary,
    );

    expect(vocabulary).toHaveLength(count);
  },
);

test.each([
  ['core', 9, 9, 0],
  ['expanded', 18, 12, 6],
  ['challenge', 27, 15, 12],
] as const)(
  '%s mode balances pronunciation opportunity and auto recording',
  (mode, total, automatic, optional) => {
    const speechSteps = groomTheKittenLesson.scenes.flatMap(scene =>
      getSceneForLearningMode(scene, mode).steps.filter(hasPronunciationPanel),
    );

    expect(speechSteps).toHaveLength(total);
    expect(
      speechSteps.filter(step => step.speechPractice === 'auto'),
    ).toHaveLength(automatic);
    expect(
      speechSteps.filter(step => step.speechPractice === 'optional'),
    ).toHaveLength(optional);
  },
);

test.each([
  ['core', [6, 6, 6]],
  ['expanded', [12, 12, 12]],
  ['challenge', [18, 18, 18]],
] as const)('%s mode keeps the foundation story rhythm', (mode, counts) => {
  expect(
    groomTheKittenLesson.scenes.map(
      scene =>
        getSceneForLearningMode(scene, mode).steps.filter(
          step => step.type !== 'intro',
        ).length,
    ),
  ).toEqual(counts);
});

test.each([
  ['core', [3, 3, 3]],
  ['expanded', [4, 4, 4]],
  ['challenge', [5, 5, 5]],
] as const)(
  '%s mode spreads automatic recording across scenes',
  (mode, counts) => {
    expect(
      groomTheKittenLesson.scenes.map(
        scene =>
          getSceneForLearningMode(scene, mode).steps.filter(
            step => step.speechPractice === 'auto',
          ).length,
      ),
    ).toEqual(counts);
  },
);

test.each(modes)(
  '%s mode separates every speech panel with an action',
  mode => {
    groomTheKittenLesson.scenes.forEach(sourceScene => {
      const steps = getSceneForLearningMode(sourceScene, mode).steps;
      for (let index = 1; index < steps.length; index += 1) {
        expect(
          hasPronunciationPanel(steps[index - 1]) &&
            hasPronunciationPanel(steps[index]),
        ).toBe(false);
      }
    });
  },
);

test.each(modes)('%s mode tells the child the required gesture', mode => {
  groomTheKittenLesson.scenes.forEach(sourceScene => {
    getSceneForLearningMode(sourceScene, mode).steps.forEach(step => {
      if (step.interaction.type === 'listen') return;
      expect(step.instructionVi).toMatch(/^(Chạm|Tìm)\b/u);
      expect(step.instructionEn).toMatch(/^(Tap|Find)\b/u);
    });
  });
});

test.each(modes)(
  '%s mode never advances to a hidden interaction target',
  mode => {
    groomTheKittenLesson.scenes.forEach(sourceScene => {
      const scene = getSceneForLearningMode(sourceScene, mode);
      let runtimeState: SceneRuntimeState = {};

      scene.steps.forEach(step => {
        step.targetObjectIds.forEach(objectId => {
          const object = scene.objects.find(item => item.id === objectId);
          expect(object).toBeDefined();
          expect(
            resolveSceneObject(object!, runtimeState[objectId]),
          ).toBeDefined();
        });
        runtimeState = applySceneStateChanges(runtimeState, [
          ...(step.successStateChanges ?? []),
          ...(step.afterSuccessStateChanges ?? []),
        ]);
      });
    });
  },
);

test.each(modes)('%s mode does not add an unexplained drag gesture', mode => {
  const dragIds = groomTheKittenLesson.scenes.flatMap(scene =>
    getSceneForLearningMode(scene, mode)
      .steps.filter(step => step.interaction.type === 'drag')
      .map(step => step.id),
  );

  expect(dragIds).toEqual([]);
});

test('review selection is the executable 4-5-6 set', () => {
  expect(
    getReviewGameItems(groomTheKittenLesson, 'core').map(item => item.word),
  ).toEqual(['kitten', 'brush', 'smooth', 'purr']);
  expect(
    getReviewGameItems(groomTheKittenLesson, 'expanded').map(item => item.word),
  ).toEqual(['kitten', 'brush', 'smooth', 'purr', 'mat']);
  expect(
    getReviewGameItems(groomTheKittenLesson, 'challenge').map(
      item => item.word,
    ),
  ).toEqual(['kitten', 'brush', 'smooth', 'purr', 'mat', 'brush the fur']);
});

test('story state moves from getting the brush to brushing the fur to purring', () => {
  const changes = groomTheKittenLesson.scenes.map(scene =>
    scene.steps.flatMap(step => [
      ...(step.successStateChanges ?? []),
      ...(step.afterSuccessStateChanges ?? []),
    ]),
  );

  expect(changes[0]).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ variantId: 'sitting-nicely' }),
    ]),
  );
  expect(changes[1]).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ variantId: 'being-brushed' }),
      expect.objectContaining({ variantId: 'smooth-fur' }),
      expect.objectContaining({ variantId: 'fluffy-neat' }),
    ]),
  );
  expect(changes[2]).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ variantId: 'purring' }),
      expect.objectContaining({ variantId: 'happy' }),
      expect.objectContaining({ variantId: 'cozy' }),
      expect.objectContaining({ variantId: 'loved' }),
    ]),
  );
});

test('smooth and purr review items resolve to their positive visual', () => {
  const smoothItem = getReviewGameItems(groomTheKittenLesson, 'core').find(
    item => item.word === 'smooth',
  )!;
  const purrItem = getReviewGameItems(groomTheKittenLesson, 'core').find(
    item => item.word === 'purr',
  )!;
  const brushScene = groomTheKittenLesson.scenes.find(
    scene => scene.id === 'brush-the-fur',
  )!;
  const purrScene = groomTheKittenLesson.scenes.find(
    scene => scene.id === 'kitten-purrs',
  )!;

  expect(smoothItem.visualId).toBe('brush-the-fur-smooth-cue');
  expect(
    brushScene.objects.find(object => object.id === smoothItem.visualId)?.asset
      .source,
  ).toBe(
    'lessons/groom-the-kitten/brush-the-fur/images/kitten-smooth-fur.webp',
  );
  expect(purrItem.visualId).toBe('kitten-purrs-purr-representative');
  expect(
    purrScene.objects.find(object => object.id === purrItem.visualId)?.asset
      .source,
  ).toBe(
    'lessons/groom-the-kitten/kitten-purrs/images/kitten-purring-hearts.webp',
  );
});

test('smooth practice restores the story hero and cozy is visible before teaching', () => {
  const brushScene = getSceneForLearningMode(
    groomTheKittenLesson.scenes.find(scene => scene.id === 'brush-the-fur')!,
    'core',
  );
  const smoothPractice = brushScene.steps.find(
    step => step.id === 'brush-the-fur-smooth-practice',
  )!;
  const purrScene = getSceneForLearningMode(
    groomTheKittenLesson.scenes.find(scene => scene.id === 'kitten-purrs')!,
    'expanded',
  );
  const cozyTeach = purrScene.steps.find(
    step => step.id === 'kitten-purrs-cozy-teach',
  )!;
  const beforeCozy = purrScene.steps.slice(
    0,
    purrScene.steps.indexOf(cozyTeach),
  );
  const cozyState = applySceneStateChanges(
    {},
    beforeCozy.flatMap(step => [
      ...(step.successStateChanges ?? []),
      ...(step.afterSuccessStateChanges ?? []),
    ]),
  );
  const hero = purrScene.objects.find(
    object => object.id === 'kitten-purrs-hero',
  )!;

  expect(smoothPractice.interaction.targetObjectId).toBe(
    'brush-the-fur-smooth-cue',
  );
  expect(smoothPractice.successStateChanges).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        targetObjectId: 'brush-the-fur-hero',
        type: 'showObject',
      }),
      expect.objectContaining({ variantId: 'smooth-fur' }),
    ]),
  );
  expect(resolveSceneObject(hero, cozyState[hero.id])?.asset.source).toBe(
    'lessons/groom-the-kitten/kitten-purrs/images/kitten-cozy-curled.webp',
  );
});

test('shiny coat is revealed before teaching and remains as the practice payoff', () => {
  const scene = getSceneForLearningMode(
    groomTheKittenLesson.scenes.find(item => item.id === 'brush-the-fur')!,
    'expanded',
  );
  const hero = scene.objects.find(
    object => object.id === 'brush-the-fur-hero',
  )!;
  const shinyTeach = scene.steps.find(
    step => step.id === 'brush-the-fur-shiny-coat-teach',
  )!;
  const shinyPractice = scene.steps.find(
    step => step.id === 'brush-the-fur-shiny-coat-practice',
  )!;
  const beforeShiny = scene.steps.slice(0, scene.steps.indexOf(shinyTeach));
  const beforeShinyState = applySceneStateChanges(
    {},
    beforeShiny.flatMap(step => [
      ...(step.successStateChanges ?? []),
      ...(step.afterSuccessStateChanges ?? []),
    ]),
  );
  const payoffState = applySceneStateChanges(beforeShinyState, [
    ...(shinyPractice.successStateChanges ?? []),
    ...(shinyPractice.afterSuccessStateChanges ?? []),
  ]);

  expect(hero.variants).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: 'shiny-coat',
        asset: expect.objectContaining({
          source:
            'lessons/groom-the-kitten/brush-the-fur/images/kitten-shiny-coat.webp',
        }),
      }),
    ]),
  );
  expect(
    resolveSceneObject(hero, beforeShinyState[hero.id])?.asset.source,
  ).toBe(
    'lessons/groom-the-kitten/brush-the-fur/images/kitten-shiny-coat.webp',
  );
  expect(shinyPractice.successStateChanges).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        targetObjectId: hero.id,
        type: 'setObjectVariant',
        variantId: 'shiny-coat',
      }),
    ]),
  );
  expect(resolveSceneObject(hero, payoffState[hero.id])?.asset.source).toBe(
    'lessons/groom-the-kitten/brush-the-fur/images/kitten-shiny-coat.webp',
  );
});

test('fluffy kitten replaces the shiny-coat state before its teach step', () => {
  const scene = getSceneForLearningMode(
    groomTheKittenLesson.scenes.find(item => item.id === 'brush-the-fur')!,
    'challenge',
  );
  const hero = scene.objects.find(
    object => object.id === 'brush-the-fur-hero',
  )!;
  const fluffyTeach = scene.steps.find(
    step => step.id === 'brush-the-fur-fluffy-kitten-teach',
  )!;
  const beforeFluffy = scene.steps.slice(0, scene.steps.indexOf(fluffyTeach));
  const beforeFluffyState = applySceneStateChanges(
    {},
    beforeFluffy.flatMap(step => [
      ...(step.successStateChanges ?? []),
      ...(step.afterSuccessStateChanges ?? []),
    ]),
  );

  expect(
    resolveSceneObject(hero, beforeFluffyState[hero.id])?.asset.source,
  ).toBe(
    'lessons/groom-the-kitten/brush-the-fur/images/kitten-fluffy-neat.webp',
  );
});

test('grooming vocabulary and copy stay concrete without purr or tail overclaims', () => {
  const words = groomTheKittenLesson.scenes.flatMap(scene =>
    (scene.vocabulary ?? []).map(item => item.word),
  );
  const copy = groomTheKittenLesson.scenes
    .flatMap(scene => scene.steps)
    .flatMap(step => [
      step.instructionEn,
      step.successFeedbackEn,
      step.failFeedbackEn,
    ])
    .filter(Boolean)
    .join(' ');

  expect(words).toEqual(
    expect.arrayContaining([
      'bristles',
      'neat',
      'curled tail',
      'listen to the kitten purr',
    ]),
  );
  expect(copy).toContain('Brushing the fur keeps a pet neat and comfortable.');
  expect(copy).not.toMatch(
    /bright and healthy|cozy and safe|completely safe|tail sways gently with happiness/iu,
  );
});

test('lesson metadata keeps the foundation and pet-care safety contract', () => {
  expect(groomTheKittenLesson.ageRange).toEqual({
    min: 3,
    max: 8,
    label: '3-8 tuổi · Làm quen',
  });
  expect(groomTheKittenLesson.metadata?.parentTipVi).toContain(
    'bàn chải lông thú cưng',
  );
  expect(groomTheKittenLesson.metadata?.parentTipVi).toContain('rửa tay');
});
