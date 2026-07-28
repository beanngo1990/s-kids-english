import AsyncStorage from '@react-native-async-storage/async-storage';

import { atSchoolLesson } from '../src/data/lessons/atSchool';
import { morningRoutineLesson } from '../src/data/lessons/morningRoutine';
import { getLessonReward } from '../src/data/rewards';
import { atSchoolVocabulary } from '../src/data/vocabulary';
import {
  completeLessonProgress,
  getProgress,
  resetProgress,
  saveEarnedAchievementRecords,
  saveSceneProgress,
} from '../src/engine/ProgressManager';
import { getSceneProgressId } from '../src/utils/lessonProgress';

const PROGRESS_STORAGE_KEY = '@skidsenglish/progress/v1';

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
  expect(progress.earnedStickerRecords).toContainEqual(
    expect.objectContaining({
      lessonId: morningRoutineLesson.id,
      source: 'lesson',
      stickerId: lessonReward.stickerId,
    }),
  );

  const record = progress.earnedStickerRecords.find(
    item => item.stickerId === lessonReward.stickerId,
  );

  expect(record?.earnedAt).toEqual(expect.any(String));
  expect(Number.isNaN(new Date(record?.earnedAt ?? '').getTime())).toBe(false);
});

test('lesson completion can scope learned words to the selected learning mode', async () => {
  await completeLessonProgress(atSchoolLesson, { learningMode: 'core' });

  const progress = await getProgress();

  expect(progress.learnedWordIds).toEqual(
    expect.arrayContaining([
      atSchoolVocabulary.teacher.id,
      atSchoolVocabulary.desk.id,
      atSchoolVocabulary.chair.id,
      atSchoolVocabulary.listen.id,
    ]),
  );
  expect(progress.learnedWordIds).not.toEqual(
    expect.arrayContaining([
      atSchoolVocabulary.writeName.id,
      atSchoolVocabulary.cleanUp.id,
      atSchoolVocabulary.openBook.id,
    ]),
  );
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
  expect(
    progress.earnedStickerRecords.filter(
      record => record.stickerId === lessonReward.stickerId,
    ),
  ).toHaveLength(1);
});

test('legacy sticker ids normalize into sticker records', async () => {
  const lessonReward = getLessonReward(morningRoutineLesson.id);

  expect(lessonReward).toBeDefined();
  if (!lessonReward) {
    throw new Error('Morning routine lesson reward is missing.');
  }

  await AsyncStorage.setItem(
    PROGRESS_STORAGE_KEY,
    JSON.stringify({
      earnedStickerIds: [lessonReward.stickerId],
    }),
  );

  const progress = await getProgress();

  expect(progress.earnedStickerIds).toContain(lessonReward.stickerId);
  expect(progress.earnedStickerRecords).toContainEqual({
    source: 'legacy',
    stickerId: lessonReward.stickerId,
  });
});

test('achievement records persist without duplicates', async () => {
  const record = {
    achievementId: 'achievement-first-word',
    earnedAt: '2026-07-14T06:00:00.000Z',
    stickerId: 'achievement-sticker-first-word',
  };

  await saveEarnedAchievementRecords([record]);
  await saveEarnedAchievementRecords([record]);

  const progress = await getProgress();

  expect(progress.earnedAchievementRecords).toEqual([record]);
});
