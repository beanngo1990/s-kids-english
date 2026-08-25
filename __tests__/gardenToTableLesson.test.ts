import { getSceneForLearningMode } from '../src/data/learningModes';
import { gardenToTableLesson } from '../src/data/lessons/gardenToTable';
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
  const vocabulary = gardenToTableLesson.scenes.flatMap(scene =>
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
      'cucumber',
      'rinse',
      'lettuce',
      'bowl',
      'salad',
      'share',
      'spoon',
      'seed',
    ],
  ],
  [
    'expanded',
    [
      'cucumber',
      'rinse',
      'lettuce',
      'colander',
      'bowl',
      'salad',
      'share',
      'spoon',
      'kitchen towel',
      'cucumber slices',
      'seed',
      'envelope',
    ],
  ],
  [
    'challenge',
    [
      'cucumber',
      'rinse',
      'lettuce',
      'colander',
      'rinse it well',
      'bowl',
      'salad',
      'share',
      'spoon',
      'kitchen towel',
      'cucumber slices',
      'mix the salad',
      'seed',
      'envelope',
      'save the seeds',
      'store it for next season',
    ],
  ],
] as const)('%s mode exposes the intended vocabulary set', (mode, words) => {
  expect(
    gardenToTableLesson.scenes.flatMap(scene =>
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
    const speechModes = gardenToTableLesson.scenes.flatMap(sourceScene => {
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
  gardenToTableLesson.scenes.forEach(sourceScene => {
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
  '%s mode states the required gesture in every interactive prompt',
  mode => {
    gardenToTableLesson.scenes.forEach(sourceScene => {
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
  ['core', [6, 9, 6]],
  ['expanded', [9, 12, 7]],
  ['challenge', [11, 14, 10]],
] as const)('%s mode keeps the vocabulary-first interaction rhythm', (mode, counts) => {
  expect(
    gardenToTableLesson.scenes.map(
      scene =>
        getSceneForLearningMode(scene, mode).steps.filter(
          step => step.type !== 'intro',
        ).length,
    ),
  ).toEqual(counts);
});

test('lettuce enters the colander in its own visible action before cucumber', () => {
  const scene = gardenToTableLesson.scenes.find(
    item => item.id === 'rinse-and-drain',
  )!;
  const lettuceStep = scene.steps.find(
    step => step.id === 'rinse-and-drain-place-lettuce-in-colander',
  )!;
  const cucumberStep = scene.steps.find(
    step => step.id === 'rinse-and-drain-place-produce-in-colander',
  )!;

  expect(lettuceStep.interaction).toMatchObject({
    dropZoneId: 'rinse-and-drain-colander-zone',
    targetObjectId: 'rinse-and-drain-lettuce',
    type: 'drag',
  });
  expect(lettuceStep.successStateChanges).toEqual(
    expect.arrayContaining([
      {
        targetObjectId: 'rinse-and-drain-lettuce',
        type: 'hideObject',
      },
      {
        targetObjectId: 'rinse-and-drain-lettuce-in-colander',
        type: 'showObject',
      },
    ]),
  );
  expect(
    scene.objects.find(
      object => object.id === 'rinse-and-drain-lettuce-in-colander',
    )?.asset.source,
  ).toBe('lessons/garden-to-table/rinse-and-drain/images/lettuce-clean.webp');

  expect(cucumberStep.interaction.targetObjectId).toBe(
    'rinse-and-drain-cucumber',
  );
  expect(cucumberStep.successStateChanges).toContainEqual({
    targetObjectId: 'rinse-and-drain-lettuce-in-colander',
    type: 'hideObject',
  });
  expect(cucumberStep.successStateChanges).not.toContainEqual({
    targetObjectId: 'rinse-and-drain-lettuce',
    type: 'hideObject',
  });
});

test('food scene uses only adult-prepared cold ingredients', () => {
  const scene = gardenToTableLesson.scenes.find(
    item => item.id === 'make-and-share',
  )!;
  const copy = scene.steps
    .flatMap(step => [step.instructionVi, step.instructionEn ?? ''])
    .join(' ')
    .toLowerCase();

  expect(scene.steps[0].instructionVi).toContain('Người lớn đã cắt');
  expect(copy).not.toMatch(/\bknife\b|\bstove\b|nước nóng|dao/u);
  expect(gardenToTableLesson.metadata?.parentTipVi).toContain('dị ứng');
});

test('seed is a core anchor while the dry seed stays adult-handled', () => {
  const scene = gardenToTableLesson.scenes.find(
    item => item.id === 'save-for-next-season',
  )!;
  const seedObjectId = 'save-for-next-season-adult-hand-seed';

  expect(scene.vocabulary?.map(item => item.word) ?? []).toContain('seed');
  expect(
    scene.steps.find(
      step => step.id === 'save-for-next-season-notice-dry-seed',
    ),
  ).toMatchObject({
    speechPractice: 'auto',
    type: 'teach',
    vocabId: 'vocab-garden-to-table-save-for-next-season-seed',
  });
  expect(
    scene.steps.some(
      step =>
        step.interaction.type === 'drag' &&
        step.interaction.targetObjectId === seedObjectId,
    ),
  ).toBe(false);
  expect(scene.steps[0].instructionVi).toContain('Người lớn');
  expect(
    scene.steps.find(
      step => step.id === 'save-for-next-season-ask-adult-to-store',
    )?.instructionVi,
  ).toContain('nhờ người lớn');
});

test('produce, bowl, and envelope expose visible success states', () => {
  const rinseScene = gardenToTableLesson.scenes[0];
  const makeScene = gardenToTableLesson.scenes[1];
  const saveScene = gardenToTableLesson.scenes[2];

  expect(
    rinseScene.objects.find(object => object.id === 'rinse-and-drain-cucumber')
      ?.variants,
  ).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'clean' })]));
  expect(
    makeScene.objects.find(object => object.id === 'make-and-share-bowl')
      ?.variants,
  ).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ id: 'with-lettuce' }),
      expect.objectContaining({ id: 'prepared' }),
      expect.objectContaining({ id: 'mixed' }),
      expect.objectContaining({ id: 'shared' }),
    ]),
  );
  expect(
    saveScene.objects.find(
      object => object.id === 'save-for-next-season-envelope',
    )?.variants,
  ).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ id: 'filled' }),
      expect.objectContaining({ id: 'closed' }),
      expect.objectContaining({ id: 'stored' }),
    ]),
  );
});

test('store phrase shows the stored envelope and the action targets the closed envelope', () => {
  const scene = gardenToTableLesson.scenes.find(
    item => item.id === 'save-for-next-season',
  )!;
  const envelopeId = 'save-for-next-season-envelope';
  const storeActionId = 'save-for-next-season-store-for-next-season-action';

  expect(
    scene.objects.find(object => object.id === storeActionId)?.asset.source,
  ).toBe(
    'lessons/garden-to-table/save-for-next-season/images/envelope-stored.webp',
  );
  expect(
    scene.objects.some(
      object => object.id === 'save-for-next-season-adult-store-control',
    ),
  ).toBe(false);
  expect(
    scene.steps.find(
      step => step.id === 'save-for-next-season-learn-store-for-next-season',
    ),
  ).toMatchObject({
    instructionEn: 'Tap the envelope stored safely on the shelf.',
    instructionVi: 'Chạm hình phong bì đã được cất an toàn trên kệ nhé.',
    interaction: { targetObjectId: storeActionId },
  });
  expect(
    scene.steps.find(
      step => step.id === 'save-for-next-season-ask-adult-to-store',
    ),
  ).toMatchObject({
    instructionEn: 'Tap the envelope to ask an adult to store it on the shelf.',
    instructionVi: 'Chạm phong bì để nhờ người lớn cất lên kệ nhé.',
    interaction: { targetObjectId: envelopeId },
  });
});

test('review selection is the frozen executable 4-5-6 set', () => {
  expect(
    getReviewGameItems(gardenToTableLesson, 'core').map(item => item.word),
  ).toEqual(['cucumber', 'rinse', 'bowl', 'share']);
  expect(
    getReviewGameItems(gardenToTableLesson, 'expanded').map(item => item.word),
  ).toEqual(['cucumber', 'rinse', 'bowl', 'share', 'colander']);
  expect(
    getReviewGameItems(gardenToTableLesson, 'challenge').map(item => item.word),
  ).toEqual([
    'cucumber',
    'rinse',
    'bowl',
    'share',
    'colander',
    'save the seeds',
  ]);

  modes.forEach(mode => {
    const items = getReviewGameItems(gardenToTableLesson, mode);
    expect(new Set(items.map(item => item.visualId)).size).toBe(items.length);
  });
});
