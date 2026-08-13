import { getSceneForLearningMode } from '../src/data/learningModes';
import { plantASeedLesson } from '../src/data/lessons/plantASeed';
import {
  applySceneStateChanges,
  type SceneRuntimeState,
} from '../src/engine/SceneState';
import type { LearningMode, Scene } from '../src/types/lesson';

const modes: LearningMode[] = ['core', 'expanded', 'challenge'];

function getScene(sceneId: string) {
  const scene = plantASeedLesson.scenes.find(item => item.id === sceneId);
  if (!scene) {
    throw new Error(`Missing plant-a-seed scene: ${sceneId}`);
  }
  return scene;
}

function completeAuthoredSteps(scene: Scene): SceneRuntimeState {
  return scene.steps.reduce(
    (state, step) =>
      applySceneStateChanges(state, step.successStateChanges ?? []),
    {},
  );
}

test.each([
  ['core', 3],
  ['expanded', 5],
  ['challenge', 7],
] as const)('%s mode exposes the intended vocabulary depth', (mode, count) => {
  plantASeedLesson.scenes.forEach(scene => {
    expect(getSceneForLearningMode(scene, mode).vocabulary).toHaveLength(count);
  });
});

test.each([
  ['core', 9, 0],
  ['expanded', 15, 0],
  ['challenge', 21, 0],
] as const)(
  '%s mode automatically starts every authored pronunciation encounter',
  (mode, autoCount, optionalCount) => {
    const speechModes = plantASeedLesson.scenes.flatMap(sourceScene => {
      const scene = getSceneForLearningMode(sourceScene, mode);

      return scene.vocabulary.map(vocabulary => {
        const speechStep = scene.steps.find(
          step =>
            step.vocabId === vocabulary.id &&
            (step.speechPractice || step.type === 'teach'),
        );

        expect(speechStep).toBeDefined();
        return speechStep?.speechPractice ?? 'auto';
      });
    });

    expect(speechModes.filter(item => item === 'auto')).toHaveLength(autoCount);
    expect(speechModes.filter(item => item === 'optional')).toHaveLength(
      optionalCount,
    );
  },
);

test.each(modes)('%s mode prepares the pot from empty to soil-ready', mode => {
  const scene = getSceneForLearningMode(getScene('prepare-the-pot'), mode);
  const state = completeAuthoredSteps(scene);

  expect(state['prepare-the-pot-plant-pot']?.variantId).toBe('soil-ready');
  expect(state['prepare-the-pot-scoop']?.visibility).toBe('hidden');
  expect(scene.steps.map(step => step.id)).toEqual(
    expect.arrayContaining([
      'prepare-the-pot-find-plant-pot',
      'prepare-the-pot-scoop-soil',
      'prepare-the-pot-fill-pot',
    ]),
  );
});

test('teaches soil and visual part/state contrasts before using them', () => {
  const prepareScene = getSceneForLearningMode(
    getScene('prepare-the-pot'),
    'challenge',
  );
  const soilStep = prepareScene.steps.find(
    step => step.id === 'prepare-the-pot-scoop-soil',
  );
  const fillPhraseStep = prepareScene.steps.find(
    step => step.id === 'prepare-the-pot-learn-fill-pot-soil',
  );
  const drainageStep = prepareScene.steps.find(
    step => step.id === 'prepare-the-pot-check-drainage-hole',
  );

  expect(soilStep).toEqual(
    expect.objectContaining({
      instructionVi: 'Đây là đất trồng. Chạm vào đống đất bên trái nhé.',
      type: 'teach',
    }),
  );
  expect(prepareScene.steps.indexOf(soilStep!)).toBeLessThan(
    prepareScene.steps.indexOf(fillPhraseStep!),
  );
  expect(drainageStep?.instructionVi).toMatch(/Đây là lỗ thoát nước/);

  const wateringScene = getSceneForLearningMode(
    getScene('first-watering'),
    'expanded',
  );
  const spoutStep = wateringScene.steps.find(
    step => step.id === 'first-watering-find-spout',
  );
  const waterStep = wateringScene.steps.find(
    step => step.id === 'first-watering-water-pot',
  );
  const dampStep = wateringScene.steps.find(
    step => step.id === 'first-watering-check-damp',
  );

  expect(spoutStep?.instructionVi).toMatch(/vòi bình tưới/);
  expect(spoutStep?.targetObjectIds).toEqual(['first-watering-spout']);
  expect(spoutStep?.interaction.correctObjectIds).toEqual([
    'first-watering-spout',
  ]);
  expect(waterStep?.successFeedbackVi).toMatch(
    /Đất khô đã sẫm màu và hơi ướt/,
  );
  expect(waterStep?.successStateChanges).toContainEqual({
    targetObjectId: 'first-watering-pot-soil',
    type: 'setObjectVariant',
    variantId: 'damp',
  });
  expect(wateringScene.steps.indexOf(waterStep!)).toBeLessThan(
    wateringScene.steps.indexOf(dampStep!),
  );
  expect(dampStep?.targetObjectIds).toEqual(['first-watering-damp']);
  expect(dampStep?.instructionVi).toMatch(/Đất ẩm sẫm màu và hơi ướt/);
});

test.each(modes)('%s mode plants and covers the seed in order', mode => {
  const scene = getSceneForLearningMode(getScene('plant-the-seed'), mode);
  const state = completeAuthoredSteps(scene);
  const stepIds = scene.steps.map(step => step.id);

  expect(stepIds.indexOf('plant-the-seed-make-hole')).toBeLessThan(
    stepIds.indexOf('plant-the-seed-plant-seed'),
  );
  expect(stepIds.indexOf('plant-the-seed-plant-seed')).toBeLessThan(
    stepIds.indexOf('plant-the-seed-cover-seed'),
  );
  expect(state['plant-the-seed-pot-soil']?.variantId).toBe('covered');
  expect(state['plant-the-seed-seed']?.visibility).toBe('hidden');
  expect(state['plant-the-seed-hole']?.visibility).toBe('hidden');
});

test('introduces seed meaning and pronunciation while the seed is still visible', () => {
  const scene = getScene('plant-the-seed');
  const revealStep = scene.steps.find(
    step => step.id === 'plant-the-seed-find-seed-packet',
  );
  const learnStep = scene.steps.find(
    step => step.id === 'plant-the-seed-learn-seed',
  );
  const dragStep = scene.steps.find(
    step => step.id === 'plant-the-seed-plant-seed',
  );

  expect(revealStep?.successStateChanges).toContainEqual({
    targetObjectId: 'plant-the-seed-seed',
    type: 'showObject',
  });
  expect(learnStep).toEqual(
    expect.objectContaining({
      instructionVi: 'Đây là hạt giống. Chạm vào hạt nhỏ nhé.',
      speechPractice: 'auto',
      targetObjectIds: ['plant-the-seed-seed'],
      type: 'teach',
    }),
  );
  expect(learnStep?.successStateChanges).toBeUndefined();
  expect(scene.steps.indexOf(revealStep!)).toBeLessThan(
    scene.steps.indexOf(learnStep!),
  );
  expect(scene.steps.indexOf(learnStep!)).toBeLessThan(
    scene.steps.indexOf(dragStep!),
  );
  expect(dragStep).toEqual(
    expect.objectContaining({
      instructionVi: 'Kéo hạt giống vào lỗ nhỏ nhé.',
    }),
  );
  expect(dragStep?.speechPractice).toBeUndefined();
  expect(dragStep?.successStateChanges).toContainEqual({
    targetObjectId: 'plant-the-seed-seed',
    type: 'hideObject',
  });
});

test.each(modes)(
  '%s mode waters gently, waits, then reveals a sprout',
  mode => {
    const scene = getSceneForLearningMode(getScene('first-watering'), mode);
    const state = completeAuthoredSteps(scene);
    const stepIds = scene.steps.map(step => step.id);

    expect(stepIds.indexOf('first-watering-water-pot')).toBeLessThan(
      stepIds.indexOf('first-watering-wait-through-time'),
    );
    expect(stepIds.indexOf('first-watering-wait-through-time')).toBeLessThan(
      stepIds.indexOf('first-watering-find-sprout'),
    );
    expect(state['first-watering-pot-soil']?.variantId).toBe('damp');
    expect(state['first-watering-watering-can']?.visibility).toBe('hidden');
    expect(state['first-watering-damp']?.visibility).toBe('hidden');
    expect(state['first-watering-sprout']?.visibility).toBe('visible');
    expect(state['first-watering-puddle']?.visibility).not.toBe('visible');
  },
);

test.each([
  [
    'prepare-the-pot',
    'fill the pot with soil',
    /xúc đất vào chậu/i,
    /cho đất vào chậu/i,
    'prepare-the-pot-learn-fill-pot-soil',
    'prepare-the-pot-choose-fill-pot-soil',
  ],
  [
    'prepare-the-pot',
    'leave some space',
    /chừa một chút/i,
    /một khoảng trống/i,
    'prepare-the-pot-learn-leave-space',
    'prepare-the-pot-leave-space',
  ],
  [
    'plant-the-seed',
    'plant a seed',
    /đặt hạt vào lỗ/i,
    /gieo hạt/i,
    'plant-the-seed-learn-plant-seed',
    'plant-the-seed-choose-plant-seed',
  ],
  [
    'plant-the-seed',
    'cover the seed',
    /lấp đất lên hạt/i,
    /phủ đất lên hạt/i,
    'plant-the-seed-learn-cover-seed',
    'plant-the-seed-choose-cover-seed',
  ],
  [
    'first-watering',
    'water it gently',
    /rót nước thật nhẹ/i,
    /tưới nhẹ nhàng/i,
    'first-watering-learn-water-gently',
    'first-watering-choose-water-gently',
  ],
  [
    'first-watering',
    'wait for the sprout',
    /đợi vài ngày, mầm nhú lên/i,
    /chờ mầm cây nhú lên/i,
    'first-watering-learn-wait-sprout',
    'first-watering-choose-wait-sprout',
  ],
] as const)(
  'challenge explains %s / %s aloud before checking it',
  (
    sceneId,
    word,
    teachMeaningPattern,
    reviewMeaningPattern,
    learnStepId,
    chooseStepId,
  ) => {
    const scene = getSceneForLearningMode(getScene(sceneId), 'challenge');
    const learnStep = scene.steps.find(step => step.id === learnStepId);
    const chooseStep = scene.steps.find(step => step.id === chooseStepId);
    const vocabulary = scene.vocabulary.find(item => item.word === word);

    expect(learnStep?.type).toBe('teach');
    expect(learnStep?.instructionVi).toMatch(teachMeaningPattern);
    expect(chooseStep?.instructionVi).toMatch(reviewMeaningPattern);
    expect(countWords(learnStep?.instructionVi)).toBeLessThanOrEqual(12);
    expect(countWords(chooseStep?.instructionVi)).toBeLessThanOrEqual(10);
    expect(learnStep?.vocabId).toBe(vocabulary?.id);
    expect(scene.steps.indexOf(learnStep!)).toBeLessThan(
      scene.steps.indexOf(chooseStep!),
    );
  },
);

test('challenge choices give a concrete visual action and one correct target', () => {
  for (const sourceScene of plantASeedLesson.scenes) {
    const scene = getSceneForLearningMode(sourceScene, 'challenge');
    const choiceSteps = scene.steps.filter(
      step =>
        (step.interaction.correctObjectIds?.length ?? 0) > 0 &&
        step.targetObjectIds.length > 1,
    );

    for (const step of choiceSteps) {
      expect(step.instructionVi).toMatch(/(Chạm vào|Đâu là) (hình|thẻ)/);
      expect(step.instructionVi).not.toMatch(
        /làm gì|chọn (việc|hành động|cách)/i,
      );
      expect(step.interaction.correctObjectIds).toHaveLength(1);
      expect(step.targetObjectIds.length).toBeGreaterThan(1);
    }
  }
});

function countWords(value: string | undefined) {
  return value?.trim().split(/\s+/u).filter(Boolean).length ?? 0;
}

test('challenge choices use text-free action cutouts instead of vocabulary cards', () => {
  for (const sourceScene of plantASeedLesson.scenes) {
    const scene = getSceneForLearningMode(sourceScene, 'challenge');
    const choiceObjectIds = new Set(
      scene.steps
        .filter(step => step.targetObjectIds.length > 1)
        .flatMap(step => step.targetObjectIds),
    );

    for (const object of scene.objects.filter(item =>
      choiceObjectIds.has(item.id),
    )) {
      expect(object.presentation).toBe('cutout');
      expect(object.isInteractive).toBe(true);
      expect(object.vocabId).toBeDefined();
    }
  }
});

test.each([
  [
    'prepare-the-pot',
    'prepare-the-pot-choose-potting-mix',
    /túi đất trồng có hình mầm cây/i,
  ],
  [
    'prepare-the-pot',
    'prepare-the-pot-scoop-soil',
    /đống đất bên trái/i,
  ],
  [
    'plant-the-seed',
    'plant-the-seed-make-hole',
    /đất trong chậu/i,
  ],
  [
    'plant-the-seed',
    'plant-the-seed-cover-seed',
    /đống đất bên phải/i,
  ],
  [
    'first-watering',
    'first-watering-find-water',
    /giọt nước màu xanh/i,
  ],
  [
    'first-watering',
    'first-watering-find-spout',
    /vòi bình tưới.*đầu vòi xanh/i,
  ],
  [
    'first-watering',
    'first-watering-check-damp',
    /đất ẩm sẫm màu và hơi ướt/i,
  ],
  [
    'first-watering',
    'first-watering-wait-through-time',
    /mặt trời và mặt trăng phía trên chậu/i,
  ],
] as const)(
  '%s / %s names a concrete visual target instead of only its concept',
  (sceneId, stepId, visualCue) => {
    const step = getScene(sceneId).steps.find(item => item.id === stepId);

    expect(step?.instructionVi).toMatch(visualCue);
  },
);

test('ambiguous vocabulary uses images that show the positive concept', () => {
  const prepareScene = getScene('prepare-the-pot');
  const plantScene = getScene('plant-the-seed');
  const wateringScene = getScene('first-watering');

  expect(
    prepareScene.objects.find(
      object => object.id === 'prepare-the-pot-potting-mix',
    )?.asset.source,
  ).toContain('/potting-mix-v2.webp');
  expect(
    plantScene.objects.find(
      object => object.id === 'plant-the-seed-cover-seed',
    )?.asset.source,
  ).toContain('/cover-seed-v2.webp');
  expect(
    wateringScene.objects.find(
      object => object.id === 'first-watering-puddle-card',
    )?.asset.source,
  ).toMatch(/\/puddle\.webp$/u);
});

test('expanded and challenge paths finish with the plant label visible', () => {
  for (const mode of ['expanded', 'challenge'] as const) {
    const scene = getSceneForLearningMode(getScene('plant-the-seed'), mode);
    const state = completeAuthoredSteps(scene);

    expect(state['plant-the-seed-plant-label']?.visibility).toBe('hidden');
    expect(state['plant-the-seed-planted-label']?.visibility).toBe('visible');
  }
});
