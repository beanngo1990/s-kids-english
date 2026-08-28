import { getSceneForLearningMode } from '../src/data/learningModes';
import { findTheKittenLesson } from '../src/data/lessons/findTheKitten';
import { getReviewGameItems } from '../src/games/reviewItems';
import {
  applySceneStateChanges,
  resolveSceneObject,
  type SceneRuntimeState,
} from '../src/engine/SceneState';
import type { LearningMode, Scene, SceneStep } from '../src/types/lesson';

const modes: LearningMode[] = ['core', 'expanded', 'challenge'];

function hasPronunciationPanel(step: SceneStep) {
  return Boolean(step.speechPractice || step.type === 'teach');
}

function visibleObjectIdsBeforeEachStep(scene: Scene) {
  let runtimeState: SceneRuntimeState = {};
  const snapshots = new Map<string, string[]>();

  scene.steps.forEach(step => {
    snapshots.set(
      step.id,
      scene.objects
        .filter(object => resolveSceneObject(object, runtimeState[object.id]))
        .map(object => object.id),
    );
    runtimeState = applySceneStateChanges(runtimeState, [
      ...(step.successStateChanges ?? []),
      ...(step.afterSuccessStateChanges ?? []),
    ]);
  });

  return snapshots;
}

test.each([
  ['core', 9],
  ['expanded', 18],
  ['challenge', 27],
] as const)('%s mode exposes the frozen vocabulary budget', (mode, count) => {
  const vocabulary = findTheKittenLesson.scenes.flatMap(
    scene => getSceneForLearningMode(scene, mode).vocabulary,
  );

  expect(vocabulary).toHaveLength(count);
});

test.each([
  ['core', 9, 9, 0],
  ['expanded', 18, 12, 6],
  ['challenge', 27, 15, 12],
] as const)(
  '%s mode balances pronunciation opportunity and auto recording',
  (mode, total, automatic, optional) => {
    const speechSteps = findTheKittenLesson.scenes.flatMap(scene =>
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
] as const)('%s mode keeps the frozen story rhythm', (mode, counts) => {
  expect(
    findTheKittenLesson.scenes.map(
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
      findTheKittenLesson.scenes.map(
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
    findTheKittenLesson.scenes.forEach(sourceScene => {
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

test.each([
  ['core', ['kitten', 'meow', 'listen']],
  ['expanded', ['kitten', 'meow', 'listen', 'ears', 'sound', 'quiet']],
  [
    'challenge',
    [
      'kitten',
      'meow',
      'listen',
      'ears',
      'sound',
      'quiet',
      'listen-carefully',
      'where-are-you',
      'i-hear-you',
    ],
  ],
] as const)('%s mode follows the sound in story order', (mode, keys) => {
  const scene = getSceneForLearningMode(findTheKittenLesson.scenes[0], mode);
  expect(
    scene.steps
      .filter(step => step.id.endsWith('-practice'))
      .map(step =>
        step.id.replace(/^hear-the-kitten-/u, '').replace(/-practice$/u, ''),
      ),
  ).toEqual(keys);
});

test.each(modes)('%s mode has no drag interaction', mode => {
  const dragIds = findTheKittenLesson.scenes.flatMap(scene =>
    getSceneForLearningMode(scene, mode)
      .steps.filter(step => step.interaction.type === 'drag')
      .map(step => step.id),
  );

  expect(dragIds).toEqual([]);
});

test.each(modes)('%s mode tells the child the required gesture', mode => {
  findTheKittenLesson.scenes.forEach(sourceScene => {
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
    findTheKittenLesson.scenes.forEach(sourceScene => {
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

test('review selection is the executable 4-5-6 set', () => {
  expect(
    getReviewGameItems(findTheKittenLesson, 'core').map(item => item.word),
  ).toEqual(['kitten', 'meow', 'box', 'basket']);
  expect(
    getReviewGameItems(findTheKittenLesson, 'expanded').map(item => item.word),
  ).toEqual(['kitten', 'meow', 'box', 'basket', 'under']);
  expect(
    getReviewGameItems(findTheKittenLesson, 'challenge').map(item => item.word),
  ).toEqual(['kitten', 'meow', 'box', 'basket', 'under', 'find the kitten']);
});

test('story state moves from sound to hiding spot to a gentle greeting', () => {
  const changes = findTheKittenLesson.scenes.map(scene =>
    scene.steps.flatMap(step => [
      ...(step.successStateChanges ?? []),
      ...(step.afterSuccessStateChanges ?? []),
    ]),
  );

  expect(changes[0]).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ variantId: 'hiding' }),
      expect.objectContaining({ targetObjectId: 'hear-the-kitten-meow-marks' }),
      expect.objectContaining({ targetObjectId: 'hear-the-kitten-pawprints' }),
    ]),
  );
  expect(changes[1]).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ variantId: 'open' }),
      expect.objectContaining({ variantId: 'peeking' }),
      expect.objectContaining({ variantId: 'found' }),
    ]),
  );
  expect(changes[2]).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ variantId: 'out' }),
      expect.objectContaining({ variantId: 'happy' }),
      expect.objectContaining({ variantId: 'near' }),
      expect.objectContaining({ variantId: 'rubbing' }),
    ]),
  );
});

test('kitten action cues replace the story hero instead of stacking it', () => {
  const searchScene = getSceneForLearningMode(
    findTheKittenLesson.scenes[1],
    'challenge',
  );
  const searchSnapshots = visibleObjectIdsBeforeEachStep(searchScene);
  expect(
    searchSnapshots.get('check-the-hiding-spots-find-the-kitten-teach'),
  ).toContain('check-the-hiding-spots-find-the-kitten-cue');
  expect(
    searchSnapshots.get('check-the-hiding-spots-find-the-kitten-teach'),
  ).not.toContain('check-the-hiding-spots-hero');

  const welcomeScene = getSceneForLearningMode(
    findTheKittenLesson.scenes[2],
    'challenge',
  );
  const welcomeSnapshots = visibleObjectIdsBeforeEachStep(welcomeScene);
  expect(
    welcomeSnapshots.get('welcome-the-kitten-let-the-kitten-come-teach'),
  ).toContain('welcome-the-kitten-let-the-kitten-come-cue');
  expect(
    welcomeSnapshots.get('welcome-the-kitten-let-the-kitten-come-teach'),
  ).not.toContain('welcome-the-kitten-hero');
  expect(welcomeSnapshots.get('welcome-the-kitten-pet-gently-teach')).toContain(
    'welcome-the-kitten-pet-gently-cue',
  );
  expect(
    welcomeSnapshots.get('welcome-the-kitten-pet-gently-teach'),
  ).not.toContain('welcome-the-kitten-hero');
});

test('welcome vocabulary uses visible features without treating a wag as happiness', () => {
  const scene = findTheKittenLesson.scenes.find(
    item => item.id === 'welcome-the-kitten',
  )!;
  const words = (scene.vocabulary ?? []).map(item => item.word);
  const copy = scene.steps
    .flatMap(step => [
      step.instructionEn,
      step.successFeedbackEn,
      step.failFeedbackEn,
    ])
    .filter(Boolean)
    .join(' ');

  expect(words).toEqual(expect.arrayContaining(['tail up', 'soft fur']));
  expect(words).not.toEqual(expect.arrayContaining(['tail', 'soft']));
  expect(copy).not.toMatch(/tail wagging happily|tail is up happily/iu);
});

test('lesson metadata keeps the foundation and cat-safety contract', () => {
  expect(findTheKittenLesson.ageRange).toEqual({
    min: 3,
    max: 8,
    label: '3-8 tuổi · Làm quen',
  });
  expect(findTheKittenLesson.metadata?.parentTipVi).toContain('không kéo mèo');
  expect(findTheKittenLesson.metadata?.parentTipVi).toContain(
    'để mèo tự đến gần',
  );
});
