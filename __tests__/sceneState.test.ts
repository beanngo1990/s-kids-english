import { getSceneForLearningMode } from '../src/data/learningModes';
import { validateLesson } from '../src/data/lessonValidation';
import {
  applySceneStateChanges,
  resolveSceneObject,
} from '../src/engine/SceneState';
import {
  resolveObjectInteraction,
  resolveContinueInteraction,
} from '../src/engine/StepController';
import type { Lesson, Scene } from '../src/types/lesson';

const scene: Scene = {
  background: {
    id: 'garden-background',
    source: 'lessons/test/garden/images/background.webp',
    type: 'image',
  },
  id: 'garden-scene',
  objects: [
    {
      asset: {
        id: 'pot-empty-asset',
        source: 'lessons/test/garden/images/pot-empty.webp',
        type: 'image',
      },
      id: 'pot',
      isInteractive: false,
      position: { height: 20, width: 20, x: 40, y: 50 },
      role: 'decoration',
      variants: [
        {
          asset: {
            id: 'pot-filled-asset',
            source: 'lessons/test/garden/images/pot-filled.webp',
            type: 'image',
          },
          id: 'filled',
          position: { height: 24, width: 24, x: 38, y: 46 },
        },
      ],
    },
    {
      asset: {
        id: 'seed-asset',
        source: 'lessons/test/garden/images/seed.webp',
        type: 'image',
      },
      id: 'seed',
      isInteractive: true,
      position: { height: 10, width: 10, x: 20, y: 60 },
      role: 'learning',
    },
    {
      asset: {
        id: 'sprout-asset',
        source: 'lessons/test/garden/images/sprout.webp',
        type: 'image',
      },
      id: 'sprout',
      initialVisibility: 'hidden',
      isInteractive: false,
      position: { height: 18, width: 18, x: 42, y: 38 },
      role: 'decoration',
    },
    {
      asset: {
        id: 'confetti-asset',
        source: 'lessons/test/garden/images/confetti.webp',
        type: 'image',
      },
      id: 'confetti',
      initialVisibility: 'hidden',
      isInteractive: false,
      learningScope: { minMode: 'expanded' },
      position: { height: 30, width: 30, x: 35, y: 20 },
      role: 'decoration',
    },
  ],
  steps: [
    {
      id: 'plant-seed',
      instructionVi: 'Chạm vào hạt giống nhé.',
      interaction: {
        correctObjectIds: ['seed'],
        targetObjectId: 'seed',
        type: 'tap',
      },
      successFeedbackVi: 'Hạt giống đã được trồng rồi!',
      successStateChanges: [
        { targetObjectId: 'pot', type: 'setObjectVariant', variantId: 'filled' },
        { targetObjectId: 'seed', type: 'hideObject' },
        { targetObjectId: 'sprout', type: 'showObject' },
        { targetObjectId: 'confetti', type: 'showObject' },
      ],
      targetObjectIds: ['seed'],
      type: 'practice',
    },
  ],
  titleEn: 'Garden',
  titleVi: 'Khu vườn',
};

test('applies ordered scene state changes without mutating previous state', () => {
  const previousState = {
    pot: { visibility: 'visible' as const },
  };
  const nextState = applySceneStateChanges(previousState, [
    { targetObjectId: 'pot', type: 'setObjectVariant', variantId: 'filled' },
    { targetObjectId: 'pot', type: 'hideObject' },
    { targetObjectId: 'pot', type: 'showObject' },
  ]);

  expect(previousState).toEqual({ pot: { visibility: 'visible' } });
  expect(nextState).not.toBe(previousState);
  expect(nextState.pot).toEqual({
    variantId: 'filled',
    visibility: 'visible',
  });
});

test('resolves initial visibility and runtime object variants', () => {
  const [pot, , sprout] = scene.objects;

  expect(resolveSceneObject(sprout)).toBeUndefined();
  expect(resolveSceneObject(sprout, { visibility: 'visible' })?.id).toBe(
    'sprout',
  );
  expect(
    resolveSceneObject({ ...pot, initialVariantId: 'filled' })?.asset.id,
  ).toBe('pot-filled-asset');
  expect(resolveSceneObject(pot, { variantId: 'filled' })).toEqual(
    expect.objectContaining({
      asset: expect.objectContaining({ id: 'pot-filled-asset' }),
      position: { height: 24, width: 24, x: 38, y: 46 },
    }),
  );
});

test('exposes durable state changes only for a correct interaction', () => {
  const step = scene.steps[0];

  expect(resolveObjectInteraction(scene, step, 'seed').stateChanges).toEqual(
    step.successStateChanges,
  );
  expect(resolveObjectInteraction(scene, step, 'pot').stateChanges).toEqual(
    [],
  );
  expect(resolveContinueInteraction(scene, step).stateChanges).toEqual([]);
});

test('filters state changes whose target is unavailable in a learning mode', () => {
  const coreScene = getSceneForLearningMode(scene, 'core');
  const expandedScene = getSceneForLearningMode(scene, 'expanded');

  expect(coreScene.objects.map(object => object.id)).not.toContain('confetti');
  expect(coreScene.steps[0].successStateChanges).toEqual(
    scene.steps[0].successStateChanges?.slice(0, 3),
  );
  expect(expandedScene.steps[0].successStateChanges).toEqual(
    scene.steps[0].successStateChanges,
  );
});

test('validates object variants, initial variants and state-change references', () => {
  const invalidScene: Scene = {
    ...scene,
    objects: scene.objects.map(object =>
      object.id === 'pot'
        ? {
            ...object,
            initialVariantId: 'missing-initial',
            variants: [
              ...(object.variants ?? []),
              {
                asset: {
                  id: 'duplicate-filled-asset',
                  source: 'lessons/test/garden/images/duplicate.webp',
                  type: 'image',
                },
                id: 'filled',
                position: { height: 0, width: 20, x: 20, y: 20 },
              },
            ],
          }
        : object,
    ),
    steps: [
      {
        ...scene.steps[0],
        successStateChanges: [
          {
            targetObjectId: 'pot',
            type: 'setObjectVariant',
            variantId: 'missing-variant',
          },
          { targetObjectId: 'missing-object', type: 'showObject' },
        ],
      },
    ],
  };
  const invalidLesson: Lesson = {
    ageRange: { max: 8, min: 3 },
    descriptionVi: 'Bài kiểm thử.',
    id: 'scene-state-test',
    scenes: [invalidScene],
    themeId: 'test-theme',
    titleEn: 'Scene state test',
    titleVi: 'Kiểm thử scene state',
  };
  const issues = validateLesson(invalidLesson);

  expect(issues).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ message: 'Duplicate id "filled".' }),
      expect.objectContaining({
        message: 'width and height must be greater than 0.',
      }),
      expect.objectContaining({
        message: 'Variant id "missing-initial" does not exist on this object.',
      }),
      expect.objectContaining({
        message: 'Variant id "missing-variant" does not exist on object "pot".',
      }),
      expect.objectContaining({
        message: 'targetObjectId "missing-object" does not exist.',
      }),
    ]),
  );
});
