import { getSceneForLearningMode } from '../src/data/learningModes';
import { cleanMuddyPawsLesson } from '../src/data/lessons/cleanMuddyPaws';
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
] as const)('%s mode exposes the foundation vocabulary budget', (mode, count) => {
  const vocabulary = cleanMuddyPawsLesson.scenes.flatMap(
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
    const speechSteps = cleanMuddyPawsLesson.scenes.flatMap(scene =>
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
    cleanMuddyPawsLesson.scenes.map(
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
      cleanMuddyPawsLesson.scenes.map(
        scene =>
          getSceneForLearningMode(scene, mode).steps.filter(
            step => step.speechPractice === 'auto',
          ).length,
      ),
    ).toEqual(counts);
  },
);

test.each(modes)('%s mode separates every speech panel with an action', mode => {
  cleanMuddyPawsLesson.scenes.forEach(sourceScene => {
    const steps = getSceneForLearningMode(sourceScene, mode).steps;
    for (let index = 1; index < steps.length; index += 1) {
      expect(
        hasPronunciationPanel(steps[index - 1]) &&
          hasPronunciationPanel(steps[index]),
      ).toBe(false);
    }
  });
});

test.each(modes)('%s mode tells the child the required gesture', mode => {
  cleanMuddyPawsLesson.scenes.forEach(sourceScene => {
    getSceneForLearningMode(sourceScene, mode).steps.forEach(step => {
      if (step.interaction.type === 'listen') return;
      expect(step.instructionVi).toMatch(/^(Chạm|Tìm)\b/u);
      expect(step.instructionEn).toMatch(/^(Tap|Find)\b/u);
    });
  });
});

test.each(modes)('%s mode never advances to a hidden interaction target', mode => {
  cleanMuddyPawsLesson.scenes.forEach(sourceScene => {
    const scene = getSceneForLearningMode(sourceScene, mode);
    let runtimeState: SceneRuntimeState = {};

    scene.steps.forEach(step => {
      step.targetObjectIds.forEach(objectId => {
        const object = scene.objects.find(item => item.id === objectId);
        expect(object).toBeDefined();
        expect(resolveSceneObject(object!, runtimeState[objectId])).toBeDefined();
      });
      runtimeState = applySceneStateChanges(runtimeState, [
        ...(step.successStateChanges ?? []),
        ...(step.afterSuccessStateChanges ?? []),
      ]);
    });
  });
});

test.each(modes)('%s mode does not add an unexplained drag gesture', mode => {
  const dragIds = cleanMuddyPawsLesson.scenes.flatMap(scene =>
    getSceneForLearningMode(scene, mode)
      .steps.filter(step => step.interaction.type === 'drag')
      .map(step => step.id),
  );

  expect(dragIds).toEqual([]);
});

test('review selection is the executable 4-5-6 set', () => {
  expect(
    getReviewGameItems(cleanMuddyPawsLesson, 'core').map(item => item.word),
  ).toEqual(['paws', 'mud', 'water', 'towel']);
  expect(
    getReviewGameItems(cleanMuddyPawsLesson, 'expanded').map(item => item.word),
  ).toEqual(['paws', 'mud', 'water', 'towel', 'basin']);
  expect(
    getReviewGameItems(cleanMuddyPawsLesson, 'challenge').map(item => item.word),
  ).toEqual(['paws', 'mud', 'water', 'towel', 'basin', 'dry the paws']);
});

test('story state moves from muddy to clean wet to clean dry paws', () => {
  const changes = cleanMuddyPawsLesson.scenes.map(scene =>
    scene.steps.flatMap(step => [
      ...(step.successStateChanges ?? []),
      ...(step.afterSuccessStateChanges ?? []),
    ]),
  );

  expect(changes[0]).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ variantId: 'waiting' }),
      expect.objectContaining({ targetObjectId: 'notice-the-muddy-paws-pawprints' }),
    ]),
  );
  expect(changes[1]).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ variantId: 'filled' }),
      expect.objectContaining({ variantId: 'washing' }),
      expect.objectContaining({ variantId: 'clean-wet' }),
      expect.objectContaining({ variantId: 'muddy' }),
      expect.objectContaining({ variantId: 'empty' }),
    ]),
  );
  expect(changes[2]).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ variantId: 'drying' }),
      expect.objectContaining({ variantId: 'dry' }),
      expect.objectContaining({ variantId: 'finished' }),
    ]),
  );
});

test('lesson metadata keeps the foundation and pet-care safety contract', () => {
  expect(cleanMuddyPawsLesson.ageRange).toEqual({
    min: 3,
    max: 8,
    label: '3-8 tuổi · Làm quen',
  });
  expect(cleanMuddyPawsLesson.metadata?.parentTipVi).toContain('người lớn');
  expect(cleanMuddyPawsLesson.metadata?.parentTipVi).toContain('nước nóng');
  expect(cleanMuddyPawsLesson.metadata?.parentTipVi).toContain('rửa tay');
});
