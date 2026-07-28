import {
  achievementRewards,
  isAchievementUnlocked,
} from '../src/data/achievementRewards';
import { lessonRewards } from '../src/data/rewards';
import { normalizeProgress } from '../src/engine/ProgressManager';
import {
  getAchievementStats,
  getEarnedStickerCount,
} from '../src/utils/stickerStats';

test('parent sticker count includes earned lesson and achievement stickers', () => {
  const firstLessonReward = lessonRewards[0];

  expect(firstLessonReward).toBeDefined();
  if (!firstLessonReward) {
    throw new Error('Lesson reward catalog is empty.');
  }

  const progress = normalizeProgress({
    completedLessonIds: ['lesson-a'],
    earnedStickerIds: [firstLessonReward.stickerId, 'unknown-sticker'],
    learnedWordIds: ['word-1', 'word-2', 'word-3', 'word-4', 'word-5'],
  });
  const stats = getAchievementStats(progress, null);
  const unlockedAchievementCount = achievementRewards.filter(reward =>
    isAchievementUnlocked(reward, stats),
  ).length;

  expect(unlockedAchievementCount).toBeGreaterThan(0);
  expect(getEarnedStickerCount(progress, null)).toBe(
    1 + unlockedAchievementCount,
  );
});

test('parent sticker count keeps persisted achievement stickers as historical', () => {
  const streakReward = achievementRewards.find(
    reward => reward.id === 'achievement-two-day-streak',
  );

  expect(streakReward).toBeDefined();
  if (!streakReward) {
    throw new Error('Two-day streak achievement is missing.');
  }

  const progress = normalizeProgress({
    earnedAchievementRecords: [
      {
        achievementId: streakReward.id,
        earnedAt: '2026-07-20T00:00:00.000Z',
        stickerId: streakReward.stickerId,
      },
    ],
  });

  expect(
    getEarnedStickerCount(progress, {
      currentStreak: 0,
      entries: [],
      longestStreak: 0,
    }),
  ).toBe(1);
});
