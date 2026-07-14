import { skidsIcons } from '../src/assets/icons/skids';
import { achievementStickerAssets } from '../src/assets/stickers/achievements';
import { achievementRewards } from '../src/data/achievementRewards';
import { lessons } from '../src/data/lessons';
import { mascotProfiles } from '../src/data/mascot';
import { lessonRewards } from '../src/data/rewards';

test('reward catalog maps one sticker to each lesson in catalog order', () => {
  const lessonIds = lessons.map(lesson => lesson.id);
  const rewardLessonIds = lessonRewards.map(reward => reward.lessonId);
  const stickerIds = lessonRewards.map(reward => reward.stickerId);
  const achievementStickerIds = achievementRewards.map(
    reward => reward.stickerId,
  );

  expect(rewardLessonIds).toEqual(lessonIds);
  expect(new Set(stickerIds).size).toBe(stickerIds.length);
  expect(new Set([...stickerIds, ...achievementStickerIds]).size).toBe(
    stickerIds.length + achievementStickerIds.length,
  );
  expect(lessonRewards.every(reward => reward.iconName in skidsIcons)).toBe(
    true,
  );
  expect(lessonRewards.every(reward => reward.tone)).toBe(true);
});

test('achievement rewards provide ordered Sungy sticker goals', () => {
  const categoryOrder = ['firstSteps', 'habits', 'bigGoals'];
  const categoryIndexes = achievementRewards.map(reward =>
    categoryOrder.indexOf(reward.category),
  );
  const achievementIds = achievementRewards.map(reward => reward.id);
  const artMotifs = achievementRewards.map(reward => reward.art.motif);
  const sungyPoseIds = Object.keys(mascotProfiles.sungy.poses);

  expect(achievementRewards).toHaveLength(18);
  expect(new Set(achievementIds).size).toBe(achievementIds.length);
  expect(new Set(artMotifs).size).toBe(artMotifs.length);
  expect(
    categoryIndexes.every(
      (categoryIndex, index) =>
        index === 0 || categoryIndex >= categoryIndexes[index - 1],
    ),
  ).toBe(true);
  expect(
    achievementRewards.every(reward => reward.iconName in skidsIcons),
  ).toBe(true);
  expect(
    achievementRewards.every(reward => reward.art.accentIconName in skidsIcons),
  ).toBe(true);
  expect(
    achievementRewards.every(
      reward => reward.stickerAssetName in achievementStickerAssets,
    ),
  ).toBe(true);
  expect(
    achievementRewards.every(
      reward =>
        !reward.art.companionIconName ||
        reward.art.companionIconName in skidsIcons,
    ),
  ).toBe(true);
  expect(
    achievementRewards.every(reward =>
      sungyPoseIds.includes(reward.art.mascotPose),
    ),
  ).toBe(true);
  expect(achievementRewards.every(reward => reward.target > 0)).toBe(true);
});
