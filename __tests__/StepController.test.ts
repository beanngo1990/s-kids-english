import { resolveObjectInteraction } from '../src/engine/StepController';
import type { Scene, SceneStep } from '../src/types/lesson';

const scene: Scene = {
  background: {
    id: 'test-background',
    source: 'lessons/test/images/background.webp',
    type: 'image',
  },
  id: 'test-scene',
  objects: [],
  steps: [],
  titleEn: 'Test scene',
  titleVi: 'Cảnh kiểm thử',
};

function multiChoiceStep(overrides: Partial<SceneStep> = {}): SceneStep {
  return {
    id: 'choose-picture',
    instructionVi: 'Chọn hình đúng nhé.',
    interaction: {
      correctObjectIds: ['correct-pot'],
      targetObjectId: 'correct-pot',
      type: 'tap',
    },
    successFeedbackVi: 'Đúng rồi.',
    targetObjectIds: ['distractor-pot', 'correct-pot'],
    type: 'review',
    ...overrides,
  };
}

test('applies the implicit success effect only to the object the child selected', () => {
  const result = resolveObjectInteraction(
    scene,
    multiChoiceStep(),
    'correct-pot',
  );

  expect(result.objectEffects).toEqual([
    { animation: 'sparkle', targetObjectId: 'correct-pot' },
  ]);
  expect(result.effectObjectIds).toEqual(['correct-pot']);
});

test('keeps additional success effects only when the lesson declares them explicitly', () => {
  const result = resolveObjectInteraction(
    scene,
    multiChoiceStep({
      effects: [
        {
          animation: 'bounce',
          targetObjectId: 'scene-pot',
          type: 'animation',
        },
      ],
    }),
    'correct-pot',
  );

  expect(result.objectEffects).toEqual([
    { animation: 'bounce', targetObjectId: 'scene-pot' },
    { animation: 'sparkle', targetObjectId: 'correct-pot' },
  ]);
  expect(result.effectObjectIds).not.toContain('distractor-pot');
});
