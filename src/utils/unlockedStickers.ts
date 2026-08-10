import { achievementStickerAssets } from '../assets/stickers/achievements';
import {
  achievementRewards,
  type AchievementReward,
} from '../data/achievementRewards';
import {
  getLocalizedLessonRewardName,
  lessonRewards,
} from '../data/rewards';
import type { ActivityLog } from '../engine/DailyActivityTracker';
import type {
  EarnedAchievementRecord,
  LocalProgress,
} from '../engine/ProgressManager';
import type { AppLanguage } from '../i18n/types';
import type { StickerVisual } from '../types/sticker';
import {
  getAchievementStats,
  isAchievementStickerEarned,
} from './stickerStats';

export type UnlockedSticker = StickerVisual & {
  stickerId: string;
  title: string;
};

export function getUnlockedStickers(
  progress: LocalProgress | null | undefined,
  activityLog: ActivityLog | null | undefined,
  appLanguage: AppLanguage,
): UnlockedSticker[] {
  const earnedLessonStickerIds = new Set(progress?.earnedStickerIds ?? []);
  const earnedAchievementIds = new Set(
    (progress?.earnedAchievementRecords ?? []).map(
      record => record.achievementId,
    ),
  );
  const achievementStats = getAchievementStats(progress, activityLog);
  const lessonStickers = lessonRewards
    .filter(reward => earnedLessonStickerIds.has(reward.stickerId))
    .map<UnlockedSticker>(reward => ({
      iconName: reward.iconName,
      isUnlocked: true,
      pose: 'avatar',
      stickerId: reward.stickerId,
      title: getLocalizedLessonRewardName(reward, appLanguage),
      tone: reward.tone,
    }));
  const achievementStickers = achievementRewards
    .filter(reward =>
      isAchievementStickerEarned(
        reward,
        achievementStats,
        earnedAchievementIds,
      ),
    )
    .map<UnlockedSticker>(reward => ({
      iconName: reward.iconName,
      isUnlocked: true,
      pose: reward.art.mascotPose,
      stickerId: reward.stickerId,
      stickerImageSource:
        achievementStickerAssets[reward.stickerAssetName],
      title: getAchievementTitle(reward, appLanguage),
      tone: reward.tone,
    }));

  return [...lessonStickers, ...achievementStickers];
}

export function getMissingAchievementStickerRecords(
  progress: LocalProgress | null | undefined,
  activityLog: ActivityLog | null | undefined,
  earnedAt: string,
): EarnedAchievementRecord[] {
  const existingAchievementIds = new Set(
    (progress?.earnedAchievementRecords ?? []).map(
      record => record.achievementId,
    ),
  );
  const stats = getAchievementStats(progress, activityLog);

  return achievementRewards
    .filter(
      reward =>
        !existingAchievementIds.has(reward.id) &&
        isAchievementStickerEarned(reward, stats, existingAchievementIds),
    )
    .map(reward => ({
      achievementId: reward.id,
      earnedAt,
      stickerId: reward.stickerId,
    }));
}

function getAchievementTitle(
  reward: AchievementReward,
  appLanguage: AppLanguage,
) {
  return appLanguage === 'en' ? reward.titleEn : reward.titleVi;
}
