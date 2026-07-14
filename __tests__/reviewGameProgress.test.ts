import { morningRoutineLesson } from '../src/data/lessons/morningRoutine';
import { getLessonReward } from '../src/data/rewards';
import {
  completeLessonProgress,
  getProgress,
  resetProgress,
  saveSceneProgress,
} from '../src/engine/ProgressManager';
import { getSceneProgressId } from '../src/utils/lessonProgress';

beforeEach(async () => {
  await resetProgress();
});

test('scene completion waits for review game before awarding lesson reward', async () => {
  for (const scene of morningRoutineLesson.scenes) {
    await saveSceneProgress(morningRoutineLesson.id, scene.id);
  }

  const progress = await getProgress();

  expect(progress.completedSceneIds).toEqual(
    expect.arrayContaining(
      morningRoutineLesson.scenes.map(scene =>
        getSceneProgressId(morningRoutineLesson.id, scene.id),
      ),
    ),
  );
  expect(progress.completedLessonIds).not.toContain(morningRoutineLesson.id);
  expect(progress.completedReviewGameIds).not.toContain(
    morningRoutineLesson.reviewGame?.id,
  );
  expect(progress.earnedStickerIds).toHaveLength(0);
});

test('lesson completion records review game and reward progress', async () => {
  const lessonReward = getLessonReward(morningRoutineLesson.id);

  expect(lessonReward).toBeDefined();
  if (!lessonReward) {
    throw new Error('Morning routine lesson reward is missing.');
  }

  const result = await completeLessonProgress(morningRoutineLesson);

  const progress = await getProgress();

  expect(progress.completedLessonIds).toContain(morningRoutineLesson.id);
  expect(progress.completedReviewGameIds).toContain(
    morningRoutineLesson.reviewGame?.id,
  );
  expect(result.unlockedSticker).toEqual(lessonReward);
  expect(progress.earnedStickerIds).toContain(lessonReward.stickerId);
});

test('lesson replay does not duplicate an earned sticker', async () => {
  const lessonReward = getLessonReward(morningRoutineLesson.id);

  expect(lessonReward).toBeDefined();
  if (!lessonReward) {
    throw new Error('Morning routine lesson reward is missing.');
  }

  await completeLessonProgress(morningRoutineLesson);
  const replayResult = await completeLessonProgress(morningRoutineLesson);
  const progress = await getProgress();

  expect(replayResult.unlockedSticker).toBeUndefined();
  expect(
    progress.earnedStickerIds.filter(id => id === lessonReward.stickerId),
  ).toHaveLength(1);
});
