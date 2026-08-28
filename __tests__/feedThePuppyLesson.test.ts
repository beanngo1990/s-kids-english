import { getSceneForLearningMode } from '../src/data/learningModes';
import { feedThePuppyLesson } from '../src/data/lessons/feedThePuppy';
import { getReviewGameItems } from '../src/games/reviewItems';
import {
  applySceneStateChanges,
  resolveSceneObject,
  type SceneRuntimeState,
} from '../src/engine/SceneState';
import type { LearningMode, SceneStep } from '../src/types/lesson';

const modes: LearningMode[] = ['core', 'expanded', 'challenge'];

function hasPronunciationPanel(step: SceneStep) {
  return Boolean(step.speechPractice || step.type === 'teach');
}

test.each([
  ['core', 9],
  ['expanded', 18],
  ['challenge', 27],
] as const)('%s mode exposes the frozen vocabulary budget', (mode, count) => {
  const vocabulary = feedThePuppyLesson.scenes.flatMap(
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
  ['core', 9],
  ['expanded', 18],
  ['challenge', 27],
] as const)('%s mode keeps every pronunciation opportunity', (mode, count) => {
  const speechSteps = feedThePuppyLesson.scenes.flatMap(sourceScene =>
    getSceneForLearningMode(sourceScene, mode).steps.filter(
      hasPronunciationPanel,
    ),
  );

  expect(speechSteps).toHaveLength(count);
});

test.each([
  ['core', 9, 0],
  ['expanded', 12, 6],
  ['challenge', 15, 12],
] as const)(
  '%s mode balances automatic and optional pronunciation',
  (mode, automaticCount, optionalCount) => {
    const speechSteps = feedThePuppyLesson.scenes.flatMap(sourceScene =>
      getSceneForLearningMode(sourceScene, mode).steps.filter(
        hasPronunciationPanel,
      ),
    );

    expect(
      speechSteps.filter(step => step.speechPractice === 'auto'),
    ).toHaveLength(automaticCount);
    expect(
      speechSteps.filter(step => step.speechPractice === 'optional'),
    ).toHaveLength(optionalCount);
  },
);

test.each([
  ['core', [3, 3, 3]],
  ['expanded', [6, 6, 6]],
  ['challenge', [9, 9, 9]],
] as const)(
  '%s mode distributes guided speech across the whole story',
  (mode, counts) => {
    expect(
      feedThePuppyLesson.scenes.map(
        sourceScene =>
          getSceneForLearningMode(sourceScene, mode).steps.filter(
            hasPronunciationPanel,
          ).length,
      ),
    ).toEqual(counts);
  },
);

test.each([
  ['core', [3, 3, 3]],
  ['expanded', [4, 4, 4]],
  ['challenge', [5, 5, 5]],
] as const)(
  '%s mode distributes automatic recording without speech fatigue',
  (mode, counts) => {
    expect(
      feedThePuppyLesson.scenes.map(
        sourceScene =>
          getSceneForLearningMode(sourceScene, mode).steps.filter(
            step => step.speechPractice === 'auto',
          ).length,
      ),
    ).toEqual(counts);
  },
);

test.each(modes)(
  '%s mode separates every pronunciation panel with action',
  mode => {
    feedThePuppyLesson.scenes.forEach(sourceScene => {
      const scene = getSceneForLearningMode(sourceScene, mode);

      for (let index = 1; index < scene.steps.length; index += 1) {
        expect(
          hasPronunciationPanel(scene.steps[index - 1]) &&
            hasPronunciationPanel(scene.steps[index]),
        ).toBe(false);
      }
    });
  },
);

test.each([
  ['core', [6, 6, 6]],
  ['expanded', [12, 12, 12]],
  ['challenge', [18, 18, 18]],
] as const)('%s mode keeps the frozen short-story rhythm', (mode, counts) => {
  expect(
    feedThePuppyLesson.scenes.map(
      scene =>
        getSceneForLearningMode(scene, mode).steps.filter(
          step => step.type !== 'intro',
        ).length,
    ),
  ).toEqual(counts);
});

test.each([
  ['core', ['wait', 'feed', 'eat']],
  ['expanded', ['wait', 'feed', 'eat', 'finished', 'celebrate', 'carry']],
  [
    'challenge',
    [
      'wait',
      'feed',
      'eat',
      'finished',
      'celebrate',
      'carry',
      'ask-an-adult',
      'put-it-down',
      'step-back',
    ],
  ],
] as const)(
  '%s mode keeps the meal and cleanup in chronological order',
  (mode, expectedBeatKeys) => {
    const sourceScene = feedThePuppyLesson.scenes.find(
      scene => scene.id === 'puppy-eats',
    )!;
    const scene = getSceneForLearningMode(sourceScene, mode);
    const beatKeys = scene.steps
      .filter(step => step.id.endsWith('-practice'))
      .map(step =>
        step.id.replace(/^puppy-eats-/u, '').replace(/-practice$/u, ''),
      );

    expect(beatKeys).toEqual(expectedBeatKeys);
    expect(
      scene.steps
        .filter(step => step.interaction.type === 'drag')
        .map(step => step.id),
    ).toEqual(['puppy-eats-feed-practice']);
  },
);

test.each(modes)(
  '%s mode never brings back a full bowl after the puppy starts eating',
  mode => {
    const sourceScene = feedThePuppyLesson.scenes.find(
      scene => scene.id === 'puppy-eats',
    )!;
    const scene = getSceneForLearningMode(sourceScene, mode);
    const eatIndex = scene.steps.findIndex(
      step => step.id === 'puppy-eats-eat-practice',
    );
    const laterVariantIds = scene.steps
      .slice(eatIndex + 1)
      .flatMap(step => [
        ...(step.successStateChanges ?? []),
        ...(step.afterSuccessStateChanges ?? []),
      ])
      .flatMap(change =>
        change.type === 'setObjectVariant' ? [change.variantId] : [],
      );

    expect(eatIndex).toBeGreaterThan(-1);
    expect(laterVariantIds).not.toContain('on-mat-full');
    expect(laterVariantIds).not.toContain('waiting');
  },
);

test('post-meal cue images keep the story bowl empty', () => {
  const scene = feedThePuppyLesson.scenes.find(
    item => item.id === 'puppy-eats',
  )!;
  const assetForCue = (key: string) =>
    scene.objects.find(object => object.id === `puppy-eats-${key}-cue`)?.asset
      .source;

  expect(assetForCue('feed')).toBe(
    'lessons/feed-the-puppy/puppy-eats/images/feed-action.webp',
  );
  expect(assetForCue('carry')).toBe(
    'lessons/feed-the-puppy/puppy-eats/images/carry-bowl-action.webp',
  );
  expect(assetForCue('ask-an-adult')).toBe(
    'lessons/feed-the-puppy/puppy-eats/images/adult-hand-helping.webp',
  );
  expect(assetForCue('put-it-down')).toBe(
    'lessons/feed-the-puppy/puppy-eats/images/put-empty-bowl-action.webp',
  );
  expect(assetForCue('step-back')).toBe(
    'lessons/feed-the-puppy/puppy-eats/images/step-back-action.webp',
  );
});

test('core keeps the eating payoff visible when advanced cleanup is filtered out', () => {
  const sourceScene = feedThePuppyLesson.scenes.find(
    scene => scene.id === 'puppy-eats',
  )!;
  const scene = getSceneForLearningMode(sourceScene, 'core');
  let runtimeState: SceneRuntimeState = {};

  scene.steps.forEach(step => {
    runtimeState = applySceneStateChanges(runtimeState, [
      ...(step.successStateChanges ?? []),
      ...(step.afterSuccessStateChanges ?? []),
    ]);
  });

  const eatingCue = scene.objects.find(
    object => object.id === 'puppy-eats-eat-cue',
  )!;
  expect(
    resolveSceneObject(eatingCue, runtimeState[eatingCue.id]),
  ).toBeDefined();
});

test.each(modes)(
  '%s mode pairs every spoken word with a story action',
  mode => {
    feedThePuppyLesson.scenes.forEach(sourceScene => {
      const steps = getSceneForLearningMode(sourceScene, mode).steps.filter(
        step => step.type !== 'intro',
      );

      for (let index = 0; index < steps.length; index += 2) {
        expect(hasPronunciationPanel(steps[index])).toBe(true);
        expect(steps[index + 1].speechPractice).toBeUndefined();
        expect(steps[index + 1].id).toMatch(/-practice$/u);
        expect(
          Boolean(
            steps[index + 1].effects?.length ||
              steps[index + 1].successStateChanges?.length ||
              steps[index + 1].afterSuccessStateChanges?.length ||
              steps[index + 1].interaction.type === 'drag',
          ),
        ).toBe(true);
      }
    });
  },
);

test('story objects carry vocabulary while remaining cues stay anchored in the scene', () => {
  const targetByWord = new Map(
    feedThePuppyLesson.scenes.flatMap(scene =>
      scene.steps.flatMap(step => {
        const vocabulary = scene.vocabulary?.find(
          item => item.id === step.vocabId,
        );
        return vocabulary
          ? ([[vocabulary.word, step.interaction.targetObjectId]] as const)
          : [];
      }),
    ),
  );

  expect(Object.fromEntries(targetByWord)).toMatchObject({
    bowl: 'fill-the-bowl-story-bowl',
    hungry: 'meet-the-puppy-hero',
    look: 'meet-the-puppy-hero',
    mat: 'fill-the-bowl-story-mat',
    meal: 'fill-the-bowl-story-bowl',
    puppy: 'meet-the-puppy-hero',
    ready: 'fill-the-bowl-story-bowl',
    sit: 'meet-the-puppy-hero',
    tummy: 'meet-the-puppy-hero',
    wag: 'meet-the-puppy-hero',
  });

  feedThePuppyLesson.scenes.forEach(scene => {
    scene.objects
      .filter(object => object.role === 'learning')
      .forEach(object => expect(object.position.y).toBeGreaterThanOrEqual(35));
  });
});

test.each(modes)(
  '%s mode tells the child the required gesture in every interactive prompt',
  mode => {
    feedThePuppyLesson.scenes.forEach(sourceScene => {
      const scene = getSceneForLearningMode(sourceScene, mode);

      scene.steps.forEach(step => {
        if (step.interaction.type === 'listen') return;

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

test.each(modes)(
  '%s mode never advances to a hidden interaction target',
  mode => {
    feedThePuppyLesson.scenes.forEach(sourceScene => {
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

test('review selection is the frozen executable 4-5-6 set', () => {
  expect(
    getReviewGameItems(feedThePuppyLesson, 'core').map(item => item.word),
  ).toEqual(['puppy', 'bowl', 'food', 'eat']);
  expect(
    getReviewGameItems(feedThePuppyLesson, 'expanded').map(item => item.word),
  ).toEqual(['puppy', 'bowl', 'food', 'eat', 'full']);
  expect(
    getReviewGameItems(feedThePuppyLesson, 'challenge').map(item => item.word),
  ).toEqual(['puppy', 'bowl', 'food', 'eat', 'full', 'step back']);

  modes.forEach(mode => {
    const items = getReviewGameItems(feedThePuppyLesson, mode);
    expect(new Set(items.map(item => item.visualId)).size).toBe(items.length);
  });
});

test('the eating puppy stays non-interactive and is never an eating-step target', () => {
  const scene = feedThePuppyLesson.scenes.find(
    item => item.id === 'puppy-eats',
  )!;
  const puppy = scene.objects.find(item => item.id === 'puppy-eats-hero')!;

  expect(puppy.isInteractive).toBe(false);
  scene.steps.forEach(step => {
    if (step.interaction.type === 'listen') return;

    expect(step.interaction.targetObjectId).not.toBe(puppy.id);
    expect(step.interaction.correctObjectIds ?? []).not.toContain(puppy.id);
  });
});

test('success-only state transitions keep the story payoff visible', () => {
  const meet = feedThePuppyLesson.scenes[0];
  const fill = feedThePuppyLesson.scenes[1];
  const eats = feedThePuppyLesson.scenes[2];

  expect(
    meet.steps.flatMap(step => [
      ...(step.successStateChanges ?? []),
      ...(step.afterSuccessStateChanges ?? []),
    ]),
  ).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        type: 'setObjectVariant',
        variantId: 'sitting',
      }),
      expect.objectContaining({
        type: 'setObjectVariant',
        variantId: 'looking-at-bowl',
      }),
      expect.objectContaining({
        type: 'setObjectVariant',
        variantId: 'wagging',
      }),
    ]),
  );
  expect(fill.steps.flatMap(step => step.successStateChanges ?? [])).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        type: 'setObjectVariant',
        variantId: 'on-mat-filled',
      }),
      expect.objectContaining({ type: 'setObjectVariant', variantId: 'ready' }),
    ]),
  );
  expect(
    eats.steps.flatMap(step => [
      ...(step.successStateChanges ?? []),
      ...(step.afterSuccessStateChanges ?? []),
    ]),
  ).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        type: 'setObjectVariant',
        variantId: 'eating',
      }),
      expect.objectContaining({ type: 'setObjectVariant', variantId: 'happy' }),
    ]),
  );
});

test('finished and celebrate replace the eating state with matching cues', () => {
  const scene = getSceneForLearningMode(
    feedThePuppyLesson.scenes.find(item => item.id === 'puppy-eats')!,
    'expanded',
  );
  const finishedTeach = scene.steps.find(
    step => step.id === 'puppy-eats-finished-teach',
  )!;
  const celebrateTeach = scene.steps.find(
    step => step.id === 'puppy-eats-celebrate-teach',
  )!;
  const stateBefore = (stepIndex: number) =>
    applySceneStateChanges(
      {},
      scene.steps
        .slice(0, stepIndex)
        .flatMap(step => [
          ...(step.successStateChanges ?? []),
          ...(step.afterSuccessStateChanges ?? []),
        ]),
    );
  const hero = scene.objects.find(object => object.id === 'puppy-eats-hero')!;
  const finishedCue = scene.objects.find(
    object => object.id === 'puppy-eats-finished-cue',
  )!;
  const celebrateCue = scene.objects.find(
    object => object.id === 'puppy-eats-celebrate-cue',
  )!;
  const beforeFinished = stateBefore(scene.steps.indexOf(finishedTeach));
  const beforeCelebrate = stateBefore(scene.steps.indexOf(celebrateTeach));

  expect(resolveSceneObject(hero, beforeFinished[hero.id])).toBeUndefined();
  expect(
    resolveSceneObject(finishedCue, beforeFinished[finishedCue.id])?.asset
      .source,
  ).toBe('lessons/feed-the-puppy/puppy-eats/images/eat-action-finishing.webp');
  expect(resolveSceneObject(hero, beforeCelebrate[hero.id])).toBeUndefined();
  expect(
    resolveSceneObject(celebrateCue, beforeCelebrate[celebrateCue.id])?.asset
      .source,
  ).toBe('lessons/feed-the-puppy/puppy-eats/images/puppy-happy.webp');
});

test('dog body-language copy defines wag neutrally', () => {
  const copy = feedThePuppyLesson.scenes
    .flatMap(scene => scene.steps)
    .flatMap(step => [step.successFeedbackEn, step.instructionEn])
    .filter(Boolean)
    .join(' ');

  expect(copy).toContain('Wag means to move the tail from side to side.');
  expect(copy).not.toContain('Wag means to move the tail happily.');
  expect(copy).toContain('Celebrate means to show joy for something good.');
});

test('lesson metadata keeps the frozen foundation and pet-safety contract', () => {
  expect(feedThePuppyLesson.ageRange).toEqual({
    min: 3,
    max: 8,
    label: '3-8 tuổi · Làm quen',
  });
  expect(feedThePuppyLesson.metadata?.parentTipVi).toContain('hỏi người lớn');
  expect(feedThePuppyLesson.metadata?.parentTipVi).toContain(
    'không chạm vào thú cưng khi thú cưng đang ăn',
  );
});
