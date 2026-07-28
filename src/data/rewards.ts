import type { SKidsIconName } from '../assets/icons/skids';
import type { MascotPoseId } from './mascot';

export type StickerArtTone = 'coral' | 'sky' | 'sun' | 'teal';
export type StickerArtMotif =
  | 'firstWordSpark'
  | 'fiveWordGlow'
  | 'wordBag'
  | 'firstMapStop'
  | 'fiveStopTrail'
  | 'firstReviewCards'
  | 'firstLessonMedal'
  | 'twoDayPair'
  | 'threeDayRhythm'
  | 'sevenDayRecord'
  | 'wordTreasure'
  | 'wordGarden'
  | 'hundredWordStar'
  | 'littleExplorer'
  | 'cardFlipMaster'
  | 'threeLessonStack'
  | 'fiveLessonPath'
  | 'mapFinisherCrown';

export type StickerArtDirection = {
  accentIconName: SKidsIconName;
  companionIconName?: SKidsIconName;
  mascotPose: MascotPoseId;
  milestoneLabel?: string;
  motif: StickerArtMotif;
};

export type LessonReward = {
  id: string;
  iconName: SKidsIconName;
  lessonId: string;
  tone: StickerArtTone;
  stickerId: string;
  stickerName: string;
  title: string;
};

export const lessonRewards: LessonReward[] = [
  {
    id: 'reward-morning-star',
    iconName: 'bedroom',
    lessonId: 'morning-routine',
    stickerId: 'sticker-morning-star',
    stickerName: 'Morning Star',
    tone: 'sun',
    title: 'Bé đã mở khoá Morning Star!',
  },
  {
    id: 'reward-school-helper',
    iconName: 'schoolSupplies',
    lessonId: 'at-school',
    stickerId: 'sticker-school-helper',
    stickerName: 'School Helper',
    tone: 'teal',
    title: 'Bé đã mở khoá School Helper!',
  },
  {
    id: 'reward-playtime-buddy',
    iconName: 'playground',
    lessonId: 'playtime',
    stickerId: 'sticker-playtime-buddy',
    stickerName: 'Playtime Buddy',
    tone: 'coral',
    title: 'Bé đã mở khoá Playtime Buddy!',
  },
  {
    id: 'reward-lunch-helper',
    iconName: 'lunchBox',
    lessonId: 'lunch-time',
    stickerId: 'sticker-lunch-helper',
    stickerName: 'Lunch Helper',
    tone: 'sky',
    title: 'Bé đã mở khoá Lunch Helper!',
  },
  {
    id: 'reward-afternoon-home',
    iconName: 'goingHome',
    lessonId: 'afternoon-home',
    stickerId: 'sticker-afternoon-home',
    stickerName: 'Home Helper',
    tone: 'teal',
    title: 'Bé đã mở khoá Home Helper!',
  },
  {
    id: 'reward-snack-time',
    iconName: 'snackPrep',
    lessonId: 'snack-time',
    stickerId: 'sticker-snack-time',
    stickerName: 'Snack Helper',
    tone: 'sun',
    title: 'Bé đã mở khoá Snack Helper!',
  },
  {
    id: 'reward-home-play',
    iconName: 'homeToyCorner',
    lessonId: 'home-play',
    stickerId: 'sticker-home-play',
    stickerName: 'Home Player',
    tone: 'coral',
    title: 'Bé đã mở khoá Home Player!',
  },
  {
    id: 'reward-afternoon-bath',
    iconName: 'bathPrep',
    lessonId: 'afternoon-bath',
    stickerId: 'sticker-afternoon-bath',
    stickerName: 'Bath Helper',
    tone: 'sky',
    title: 'Bé đã mở khoá Bath Helper!',
  },
  {
    id: 'reward-family-dinner',
    iconName: 'dinnerTable',
    lessonId: 'family-dinner',
    stickerId: 'sticker-family-dinner',
    stickerName: 'Dinner Helper',
    tone: 'teal',
    title: 'Bé đã mở khoá Dinner Helper!',
  },
  {
    id: 'reward-after-dinner-cleanup',
    iconName: 'sortAndDry',
    lessonId: 'after-dinner-cleanup',
    stickerId: 'sticker-after-dinner-cleanup',
    stickerName: 'Cleanup Helper',
    tone: 'coral',
    title: 'Bé đã mở khoá Cleanup Helper!',
  },
  {
    id: 'reward-bedtime',
    iconName: 'sleepReady',
    lessonId: 'bedtime',
    stickerId: 'sticker-bedtime',
    stickerName: 'Sleepy Star',
    tone: 'sky',
    title: 'Bé đã mở khoá Sleepy Star!',
  },
];

export function getLessonReward(lessonId: string) {
  return lessonRewards.find(reward => reward.lessonId === lessonId);
}

export function getRewardByStickerId(stickerId: string) {
  return lessonRewards.find(reward => reward.stickerId === stickerId);
}
