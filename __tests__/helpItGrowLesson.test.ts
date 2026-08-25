import { getSceneForLearningMode } from '../src/data/learningModes';
import { helpItGrowLesson } from '../src/data/lessons/helpItGrow';
import {
  applySceneStateChanges,
  type SceneRuntimeState,
} from '../src/engine/SceneState';
import { getReviewGameItems } from '../src/games/reviewItems';
import type { LearningMode, Scene, SceneStep } from '../src/types/lesson';

const modes: LearningMode[] = ['core', 'expanded', 'challenge'];

function getScene(sceneId: string) {
  const scene = helpItGrowLesson.scenes.find(item => item.id === sceneId);
  if (!scene) {
    throw new Error(`Missing help-it-grow scene: ${sceneId}`);
  }
  return scene;
}

function completeAuthoredSteps(scene: Scene): SceneRuntimeState {
  return scene.steps.reduce(
    (state, step) =>
      applySceneStateChanges(
        applySceneStateChanges(state, step.successStateChanges ?? []),
        step.afterSuccessStateChanges ?? [],
      ),
    {},
  );
}

function hasPronunciationPanel(step: SceneStep) {
  return Boolean(step.speechPractice || step.type === 'teach');
}

function countWords(value: string | undefined) {
  return value?.trim().split(/\s+/u).filter(Boolean).length ?? 0;
}

test.each([
  ['core', 8],
  ['expanded', 12],
  ['challenge', 16],
] as const)(
  '%s mode exposes the vocabulary-first lesson budget',
  (mode, count) => {
    const vocabulary = helpItGrowLesson.scenes.flatMap(
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
  },
);

test.each([
  [
    'core',
    [
      'watering can',
      'leaf',
      'sunlight',
      'rain',
      'soil',
      'flower',
      'wind',
      'stem',
    ],
  ],
  [
    'expanded',
    [
      'watering can',
      'leaf',
      'sunlight',
      'shade',
      'rain',
      'soil',
      'roots',
      'flower',
      'wind',
      'stem',
      'stake',
      'soft tie',
    ],
  ],
  [
    'challenge',
    [
      'watering can',
      'leaf',
      'sunlight',
      'shade',
      'move into sunlight',
      'rain',
      'soil',
      'roots',
      'check the soil',
      'wait for the rain to stop',
      'flower',
      'wind',
      'stem',
      'stake',
      'soft tie',
      'support the stem',
    ],
  ],
] as const)('%s mode exposes the intended vocabulary set', (mode, words) => {
  expect(
    helpItGrowLesson.scenes.flatMap(scene =>
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
    const speechModes = helpItGrowLesson.scenes.flatMap(sourceScene => {
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

test.each(modes)('%s mode never places pronunciation panels together', mode => {
  helpItGrowLesson.scenes.forEach(sourceScene => {
    const scene = getSceneForLearningMode(sourceScene, mode);

    for (let index = 1; index < scene.steps.length; index += 1) {
      expect(
        hasPronunciationPanel(scene.steps[index - 1]) &&
          hasPronunciationPanel(scene.steps[index]),
      ).toBe(false);
    }
  });
});

test('core scenes keep the vocabulary-first 7-7-7 interaction rhythm', () => {
  expect(
    helpItGrowLesson.scenes.map(sourceScene => {
      const scene = getSceneForLearningMode(sourceScene, 'core');
      return scene.steps.filter(step => step.type !== 'intro').length;
    }),
  ).toEqual([7, 7, 7]);
});

test.each([
  ['core', [7, 7, 7]],
  ['expanded', [9, 9, 9]],
  ['challenge', [11, 12, 11]],
] as const)('%s mode exposes the expected per-scene interaction count', (mode, expected) => {
  expect(
    helpItGrowLesson.scenes.map(sourceScene =>
      getSceneForLearningMode(sourceScene, mode).steps.filter(
        step => step.type !== 'intro',
      ).length,
    ),
  ).toEqual(expected);
});

test.each(modes)('%s mode keeps the visible plant state chain', mode => {
  const leafScene = getSceneForLearningMode(
    getScene('new-leaf-and-sunlight'),
    mode,
  );
  const rainScene = getSceneForLearningMode(getScene('rainy-day-care'), mode);
  const windScene = getSceneForLearningMode(getScene('wind-and-support'), mode);
  const leafState = completeAuthoredSteps(leafScene);
  const rainState = completeAuthoredSteps(rainScene);
  const windState = completeAuthoredSteps(windScene);

  expect(leafState['new-leaf-and-sunlight-plant']?.variantId).toBe('sunlit');
  expect(leafState['new-leaf-and-sunlight-watering-can']?.visibility).toBe(
    'hidden',
  );
  expect(leafState['new-leaf-and-sunlight-leaf']?.visibility).toBe('visible');
  expect(rainState['rainy-day-care-plant']?.variantId).toBe('sheltered');
  expect(rainState['rainy-day-care-soil']?.variantId).toBe('checked-wet');
  expect(windState['wind-and-support-plant']?.variantId).toBe('flower-bud');
  expect(windState['wind-and-support-wind']?.visibility).toBe('hidden');
  expect(windState['wind-and-support-stick']?.visibility).toBe('hidden');
  expect(windState['wind-and-support-soft-tie']?.visibility).toBe('hidden');
  expect(windState['wind-and-support-installed-stake']?.visibility).toBe(
    'visible',
  );
  expect(windState['wind-and-support-installed-tie']?.visibility).toBe(
    'visible',
  );

  if (mode === 'challenge') {
    expect(
      leafState['new-leaf-and-sunlight-move-sunlight-action']?.visibility,
    ).toBe('hidden');
    expect(
      leafState['new-leaf-and-sunlight-stay-shade-action']?.visibility,
    ).toBe('hidden');
    expect(
      rainState['rainy-day-care-check-soil-action']?.visibility,
    ).toBe('hidden');
    expect(
      rainState['rainy-day-care-pour-water-action']?.visibility,
    ).toBe('hidden');
    expect(
      windState['wind-and-support-support-stem-action']?.visibility,
    ).toBe('hidden');
    expect(
      windState['wind-and-support-leave-leaning-action']?.visibility,
    ).toBe('hidden');
  }
});

test('challenge choices stay visible for success feedback, then clean up', () => {
  const cases = [
    [
      'new-leaf-and-sunlight',
      'new-leaf-and-sunlight-choose-sunlight-action',
      [
        'new-leaf-and-sunlight-move-sunlight-action',
        'new-leaf-and-sunlight-stay-shade-action',
      ],
      [],
    ],
    [
      'rainy-day-care',
      'rainy-day-care-choose-check-soil',
      [
        'rainy-day-care-check-soil-action',
        'rainy-day-care-pour-water-action',
      ],
      [
        {
          targetObjectId: 'rainy-day-care-wait-for-rain-action',
          type: 'showObject',
        },
      ],
    ],
    [
      'wind-and-support',
      'wind-and-support-choose-support-stem',
      [
        'wind-and-support-support-stem-action',
        'wind-and-support-leave-leaning-action',
      ],
      [],
    ],
  ] as const;

  cases.forEach(([sceneId, stepId, choiceIds, successStateChanges]) => {
    const scene = getSceneForLearningMode(getScene(sceneId), 'challenge');
    const step = scene.steps.find(item => item.id === stepId);

    expect(step?.successStateChanges ?? []).toEqual(successStateChanges);
    expect(step?.afterSuccessStateChanges).toEqual(
      choiceIds.map(targetObjectId => ({
        targetObjectId,
        type: 'hideObject',
      })),
    );
  });
});

test('time cues precede every authored growth state', () => {
  const leafScene = getScene('new-leaf-and-sunlight');
  const windScene = getScene('wind-and-support');
  const waitForLeaf = leafScene.steps.find(
    step => step.id === 'new-leaf-and-sunlight-wait-new-leaf',
  );
  const waitForBud = windScene.steps.find(
    step => step.id === 'wind-and-support-wait-for-flower-bud',
  );

  expect(waitForLeaf?.successStateChanges).toContainEqual({
    targetObjectId: 'new-leaf-and-sunlight-plant',
    type: 'setObjectVariant',
    variantId: 'new-leaf',
  });
  expect(waitForBud?.successStateChanges).toContainEqual({
    targetObjectId: 'wind-and-support-plant',
    type: 'setObjectVariant',
    variantId: 'flower-bud',
  });
});

test.each([
  [
    'new-leaf-and-sunlight',
    'move into sunlight',
    'new-leaf-and-sunlight-learn-move-into-sunlight',
    'new-leaf-and-sunlight-choose-sunlight-action',
  ],
  [
    'rainy-day-care',
    'check the soil',
    'rainy-day-care-learn-check-soil',
    'rainy-day-care-choose-check-soil',
  ],
  [
    'wind-and-support',
    'support the stem',
    'wind-and-support-learn-support-stem',
    'wind-and-support-choose-support-stem',
  ],
] as const)(
  'challenge explains %s / %s before its one-answer review',
  (sceneId, word, learnStepId, reviewStepId) => {
    const scene = getSceneForLearningMode(getScene(sceneId), 'challenge');
    const vocabulary = scene.vocabulary.find(item => item.word === word);
    const learnStep = scene.steps.find(step => step.id === learnStepId);
    const reviewStep = scene.steps.find(step => step.id === reviewStepId);

    expect(learnStep?.type).toBe('teach');
    expect(reviewStep?.type).toBe('review');
    expect(learnStep?.vocabId).toBe(vocabulary?.id);
    expect(reviewStep?.vocabId).toBe(vocabulary?.id);
    expect(countWords(learnStep?.instructionVi)).toBeLessThanOrEqual(12);
    expect(countWords(reviewStep?.instructionVi)).toBeLessThanOrEqual(10);
    expect(reviewStep?.interaction.correctObjectIds).toHaveLength(1);
    expect(scene.steps.indexOf(learnStep!)).toBeLessThan(
      scene.steps.indexOf(reviewStep!),
    );
  },
);

test('promoted care vocabulary uses matching action and state visuals', () => {
  const leafScene = getScene('new-leaf-and-sunlight');
  const rainScene = getScene('rainy-day-care');
  const windScene = getScene('wind-and-support');

  expect(
    leafScene.objects.find(
      object => object.id === 'new-leaf-and-sunlight-watering-can',
    )?.vocabId,
  ).toBe('vocab-help-it-grow-new-leaf-and-sunlight-watering-can');
  expect(
    rainScene.objects.find(object => object.id === 'rainy-day-care-soil')
      ?.vocabId,
  ).toBe('vocab-help-it-grow-rainy-day-care-soil');
  expect(
    windScene.objects.find(object => object.id === 'wind-and-support-plant')
      ?.vocabId,
  ).toBe('vocab-help-it-grow-wind-and-support-flower');
  expect(
    windScene.objects.find(
      object => object.id === 'wind-and-support-soft-tie-vocabulary',
    )?.asset.source,
  ).toBe('lessons/help-it-grow/wind-and-support/images/soft-tie.webp');

  expect(
    rainScene.steps.find(
      step => step.id === 'rainy-day-care-learn-wait-for-rain-to-stop',
    ),
  ).toMatchObject({
    interaction: { targetObjectId: 'rainy-day-care-wait-for-rain-action' },
    speechPractice: 'auto',
    type: 'teach',
  });
  expect(
    windScene.steps.find(
      step => step.id === 'wind-and-support-find-flower-bud',
    ),
  ).toMatchObject({
    promptText: 'flower',
    speechPractice: 'auto',
    type: 'teach',
  });
});

test('remaining time and support enablers do not open pronunciation panels', () => {
  const enablerIds = new Set([
    'new-leaf-and-sunlight-first-time-cue',
    'rainy-day-care-cloud',
    'wind-and-support-stick',
    'wind-and-support-time-cue',
  ]);

  helpItGrowLesson.scenes.forEach(scene => {
    scene.objects
      .filter(object => enablerIds.has(object.id))
      .forEach(object => expect(object.vocabId).toBeUndefined());
  });
});

test('review selection is the frozen executable 4-5-6 set', () => {
  expect(
    getReviewGameItems(helpItGrowLesson, 'core').map(item => item.word),
  ).toEqual(['leaf', 'sunlight', 'rain', 'wind']);
  expect(
    getReviewGameItems(helpItGrowLesson, 'expanded').map(item => item.word),
  ).toEqual(['leaf', 'sunlight', 'rain', 'wind', 'shade']);

  const challengeItems = getReviewGameItems(helpItGrowLesson, 'challenge');
  expect(challengeItems.map(item => item.word)).toEqual([
    'leaf',
    'sunlight',
    'rain',
    'wind',
    'shade',
    'check the soil',
  ]);
  expect(new Set(challengeItems.map(item => item.visualId)).size).toBe(6);
});
