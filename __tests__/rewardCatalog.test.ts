import { lessons } from '../src/data/lessons';
import { lessonRewards } from '../src/data/rewards';

test('reward catalog maps one sticker to each lesson in catalog order', () => {
  const lessonIds = lessons.map(lesson => lesson.id);
  const rewardLessonIds = lessonRewards.map(reward => reward.lessonId);
  const stickerIds = lessonRewards.map(reward => reward.stickerId);

  expect(rewardLessonIds).toEqual(lessonIds);
  expect(new Set(stickerIds).size).toBe(stickerIds.length);
});
