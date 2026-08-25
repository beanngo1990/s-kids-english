import { getSceneForLearningMode } from '../src/data/learningModes';
import { playWithThePuppyLesson } from '../src/data/lessons/playWithThePuppy';
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
  const vocabulary = playWithThePuppyLesson.scenes.flatMap(
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
    const speechSteps = playWithThePuppyLesson.scenes.flatMap(scene =>
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
    playWithThePuppyLesson.scenes.map(
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
      playWithThePuppyLesson.scenes.map(
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
    playWithThePuppyLesson.scenes.forEach(sourceScene => {
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
  ['core', ['play', 'ball', 'choose']],
  ['expanded', ['play', 'ball', 'choose', 'toy', 'red', 'round']],
  [
    'challenge',
    [
      'play',
      'ball',
      'choose',
      'toy',
      'red',
      'round',
      'soft',
      'pick-it-up',
      'ready',
    ],
  ],
] as const)('%s mode chooses the ball in story order', (mode, keys) => {
  const scene = getSceneForLearningMode(playWithThePuppyLesson.scenes[0], mode);
  expect(
    scene.steps
      .filter(step => step.id.endsWith('-practice'))
      .map(step =>
        step.id.replace(/^choose-the-ball-/u, '').replace(/-practice$/u, ''),
      ),
  ).toEqual(keys);
});

test.each(modes)(
  '%s mode uses only one meaningful drag in the lesson',
  mode => {
    const dragIds = playWithThePuppyLesson.scenes.flatMap(scene =>
      getSceneForLearningMode(scene, mode)
        .steps.filter(step => step.interaction.type === 'drag')
        .map(step => step.id),
    );

    expect(dragIds).toEqual(['roll-and-catch-roll-practice']);
  },
);

test.each(modes)('%s mode never drags the puppy', mode => {
  playWithThePuppyLesson.scenes.forEach(sourceScene => {
    getSceneForLearningMode(sourceScene, mode).steps.forEach(step => {
      if (step.interaction.type !== 'drag') return;
      expect(step.interaction.targetObjectId).not.toContain('hero');
    });
  });
});

test.each(modes)('%s mode tells the child the required gesture', mode => {
  playWithThePuppyLesson.scenes.forEach(sourceScene => {
    getSceneForLearningMode(sourceScene, mode).steps.forEach(step => {
      if (step.interaction.type === 'listen') return;
      const vietnameseAction =
        step.interaction.type === 'drag' ? /^Kéo\b/u : /^(Chạm|Tìm)\b/u;
      const englishAction =
        step.interaction.type === 'drag' ? /^Drag\b/u : /^(Tap|Find)\b/u;
      expect(step.instructionVi).toMatch(vietnameseAction);
      expect(step.instructionEn).toMatch(englishAction);
    });
  });
});

test.each(modes)(
  '%s mode never advances to a hidden interaction target',
  mode => {
    playWithThePuppyLesson.scenes.forEach(sourceScene => {
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
    getReviewGameItems(playWithThePuppyLesson, 'core').map(item => item.word),
  ).toEqual(['play', 'ball', 'roll', 'catch']);
  expect(
    getReviewGameItems(playWithThePuppyLesson, 'expanded').map(
      item => item.word,
    ),
  ).toEqual(['play', 'ball', 'roll', 'catch', 'hold']);
  expect(
    getReviewGameItems(playWithThePuppyLesson, 'challenge').map(
      item => item.word,
    ),
  ).toEqual(['play', 'ball', 'roll', 'catch', 'hold', 'your turn']);
});

test('success changes preserve the choose-roll-catch-return-give arc', () => {
  const changes = playWithThePuppyLesson.scenes.map(scene =>
    scene.steps.flatMap(step => [
      ...(step.successStateChanges ?? []),
      ...(step.afterSuccessStateChanges ?? []),
    ]),
  );

  expect(changes[0]).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ variantId: 'open' }),
      expect.objectContaining({ variantId: 'ready' }),
    ]),
  );
  expect(changes[1]).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ variantId: 'running' }),
      expect.objectContaining({ variantId: 'catching' }),
      expect.objectContaining({ variantId: 'holding' }),
      expect.objectContaining({ variantId: 'turned' }),
    ]),
  );
  expect(changes[2]).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ variantId: 'returning' }),
      expect.objectContaining({ variantId: 'near' }),
      expect.objectContaining({ variantId: 'happy' }),
      expect.objectContaining({ variantId: 'playful' }),
    ]),
  );
});

test('catch review and practice use the catching action before restoring the story puppy', () => {
  const scene = playWithThePuppyLesson.scenes.find(
    item => item.id === 'roll-and-catch',
  )!;
  const reviewItem = getReviewGameItems(playWithThePuppyLesson, 'core').find(
    item => item.word === 'catch',
  )!;
  const cue = scene.objects.find(object => object.id === reviewItem.visualId)!;
  const practice = scene.steps.find(
    step => step.id === 'roll-and-catch-catch-practice',
  )!;

  expect(reviewItem.visualId).toBe('roll-and-catch-catch-cue');
  expect(cue.asset.source).toBe(
    'lessons/play-with-the-puppy/roll-and-catch/images/puppy-catching-ball.webp',
  );
  expect(practice.interaction.targetObjectId).toBe('roll-and-catch-ball');
  expect(practice.successStateChanges).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        targetObjectId: 'roll-and-catch-hero',
        type: 'showObject',
      }),
      expect.objectContaining({ variantId: 'holding' }),
    ]),
  );
});

test('playful uses the concrete play-bow pose', () => {
  const scene = playWithThePuppyLesson.scenes.find(
    item => item.id === 'bring-it-back',
  )!;
  const hero = scene.objects.find(
    object => object.id === 'bring-it-back-hero',
  )!;
  const playful = hero.variants?.find(variant => variant.id === 'playful');

  expect(playful?.asset.source).toBe(
    'lessons/play-with-the-puppy/choose-the-ball/images/puppy-play-bow.webp',
  );
  expect(
    scene.steps
      .flatMap(step => step.successStateChanges ?? [])
      .filter(
        change =>
          change.type === 'setObjectVariant' && change.variantId === 'playful',
      ),
  ).toHaveLength(2);
});

test('story cues replace puppy and ball states instead of stacking them', () => {
  const chooseScene = getSceneForLearningMode(
    playWithThePuppyLesson.scenes[0],
    'challenge',
  );
  const chooseSnapshots = visibleObjectIdsBeforeEachStep(chooseScene);
  expect(chooseSnapshots.get('choose-the-ball-ready-teach')).toContain(
    'choose-the-ball-hero',
  );
  expect(chooseScene.objects.map(object => object.id)).not.toContain(
    'choose-the-ball-ready-cue',
  );

  const rollScene = getSceneForLearningMode(
    playWithThePuppyLesson.scenes[1],
    'challenge',
  );
  const rollSnapshots = visibleObjectIdsBeforeEachStep(rollScene);
  expect(rollSnapshots.get('roll-and-catch-run-teach')).toContain(
    'roll-and-catch-hero',
  );
  expect(rollSnapshots.get('roll-and-catch-catch-teach')).toContain(
    'roll-and-catch-catch-cue',
  );
  expect(rollSnapshots.get('roll-and-catch-catch-teach')).not.toContain(
    'roll-and-catch-hero',
  );
  expect(rollSnapshots.get('roll-and-catch-hold-teach')).not.toContain(
    'roll-and-catch-hero',
  );
  expect(rollSnapshots.get('roll-and-catch-hold-teach')).toContain(
    'roll-and-catch-hold-cue',
  );
  expect(rollSnapshots.get('roll-and-catch-turn-teach')).not.toContain(
    'roll-and-catch-hero',
  );
  expect(rollSnapshots.get('roll-and-catch-turn-teach')).toContain(
    'roll-and-catch-turn-cue',
  );
  expect(rollSnapshots.get('roll-and-catch-catch-the-ball-teach')).toEqual(
    expect.arrayContaining(['roll-and-catch-catch-the-ball-cue']),
  );
  expect(
    rollSnapshots.get('roll-and-catch-catch-the-ball-teach'),
  ).not.toContain('roll-and-catch-hero');
  expect(rollSnapshots.get('roll-and-catch-hold-it-teach')).not.toContain(
    'roll-and-catch-hero',
  );
  expect(rollSnapshots.get('roll-and-catch-turn-around-teach')).not.toContain(
    'roll-and-catch-hero',
  );

  const bringScene = getSceneForLearningMode(
    playWithThePuppyLesson.scenes[2],
    'challenge',
  );
  const bringSnapshots = visibleObjectIdsBeforeEachStep(bringScene);
  const bringObjectIds = bringScene.objects.map(object => object.id);
  [
    'bring-it-back-bring-cue',
    'bring-it-back-give-cue',
    'bring-it-back-playful-cue',
    'bring-it-back-lets-play-cue',
  ].forEach(objectId => expect(bringObjectIds).not.toContain(objectId));
  expect(bringSnapshots.get('bring-it-back-playful-teach')).toEqual(
    expect.arrayContaining(['bring-it-back-hero', 'bring-it-back-loose-ball']),
  );
  expect(bringSnapshots.get('bring-it-back-playful-teach')).not.toContain(
    'bring-it-back-ball-in-hand',
  );
  expect(bringSnapshots.get('bring-it-back-your-turn-teach')).toContain(
    'bring-it-back-your-turn-cue',
  );
  expect(bringSnapshots.get('bring-it-back-your-turn-teach')).not.toContain(
    'bring-it-back-ball-in-hand',
  );
  expect(bringSnapshots.get('bring-it-back-your-turn-teach')).not.toContain(
    'bring-it-back-loose-ball',
  );
  expect(bringSnapshots.get('bring-it-back-roll-the-ball-teach')).toContain(
    'bring-it-back-roll-the-ball-cue',
  );
  expect(bringSnapshots.get('bring-it-back-lets-play-teach')).toContain(
    'bring-it-back-hero',
  );
});

test('lesson metadata keeps the foundation and pet-safety contract', () => {
  expect(playWithThePuppyLesson.ageRange).toEqual({
    min: 3,
    max: 8,
    label: '3-8 tuổi · Làm quen',
  });
  expect(playWithThePuppyLesson.metadata?.parentTipVi).toContain('bóng mềm');
  expect(playWithThePuppyLesson.metadata?.parentTipVi).toContain(
    'Không kéo, ôm chặt',
  );
});
