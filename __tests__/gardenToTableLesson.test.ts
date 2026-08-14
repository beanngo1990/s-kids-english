import { getSceneForLearningMode } from '../src/data/learningModes';
import { gardenToTableLesson } from '../src/data/lessons/gardenToTable';
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
  ['core', 6, 0],
  ['expanded', 6, 2],
  ['challenge', 8, 2],
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
  ['core', [6, 7, 6]],
  ['expanded', [8, 9, 6]],
  ['challenge', [10, 9, 8]],
] as const)('%s mode keeps the frozen interaction rhythm', (mode, counts) => {
  expect(
    gardenToTableLesson.scenes.map(
      scene =>
        getSceneForLearningMode(scene, mode).steps.filter(
          step => step.type !== 'intro',
        ).length,
    ),
  ).toEqual(counts);
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

test('small seed stays an adult-handled recall object, not a core anchor', () => {
  const scene = gardenToTableLesson.scenes.find(
    item => item.id === 'save-for-next-season',
  )!;
  const seedObjectId = 'save-for-next-season-adult-hand-seed';

  expect(scene.vocabulary?.map(item => item.word) ?? []).not.toContain('seed');
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
