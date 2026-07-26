import {
  achievementRewards,
  isAchievementUnlocked,
  type AchievementReward,
  type AchievementStats,
} from '../data/achievementRewards';
import { lessonRewards } from '../data/rewards';
import type { ActivityLog } from '../engine/DailyActivityTracker';
import type { LocalProgress } from '../engine/ProgressManager';

export function getAchievementStats(
  progress: LocalProgress | null | undefined,
  activityLog: ActivityLog | null | undefined,
): AchievementStats {
  return {
    completedLessons: progress?.completedLessonIds.length ?? 0,
    completedReviews: progress?.completedReviewGameIds.length ?? 0,
    completedScenes: progress?.completedSceneIds.length ?? 0,
    currentStreak: activityLog?.currentStreak ?? 0,
    learnedWords: progress?.learnedWordIds.length ?? 0,
    longestStreak: activityLog?.longestStreak ?? 0,
  };
}

export function getEarnedStickerCount(
  progress: LocalProgress | null | undefined,
  activityLog: ActivityLog | null | undefined,
) {
  const earnedLessonStickerIds = new Set(progress?.earnedStickerIds ?? []);
  const earnedLessonStickerCount = lessonRewards.filter(reward =>
    earnedLessonStickerIds.has(reward.stickerId),
  ).length;

  return (
    earnedLessonStickerCount +
    getEarnedAchievementStickerCount(progress, activityLog)
  );
}

export function getEarnedAchievementStickerCount(
  progress: LocalProgress | null | undefined,
  activityLog: ActivityLog | null | undefined,
) {
  const stats = getAchievementStats(progress, activityLog);
  const earnedAchievementIds = getEarnedAchievementIds(progress);

  return achievementRewards.filter(reward =>
    isAchievementStickerEarned(reward, stats, earnedAchievementIds),
  ).length;
}

export function isAchievementStickerEarned(
  reward: AchievementReward,
  stats: AchievementStats,
  earnedAchievementIds: ReadonlySet<string>,
) {
  return (
    earnedAchievementIds.has(reward.id) ||
    isAchievementUnlocked(reward, stats)
  );
}

function getEarnedAchievementIds(
  progress: LocalProgress | null | undefined,
) {
  return new Set(
    (progress?.earnedAchievementRecords ?? []).map(
      record => record.achievementId,
    ),
  );
}
