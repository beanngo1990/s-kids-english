export type LevelReward = {
  id: string;
  level: number;
  stickerId: string;
  stickerName: string;
  title: string;
};

export const levelRewards: LevelReward[] = [
  {
    id: 'reward-morning-star',
    level: 2,
    stickerId: 'sticker-morning-star',
    stickerName: 'Morning Star',
    title: 'Bé đã mở khoá Morning Star!',
  },
  {
    id: 'reward-school-helper',
    level: 3,
    stickerId: 'sticker-school-helper',
    stickerName: 'School Helper',
    title: 'Bé đã mở khoá School Helper!',
  },
  {
    id: 'reward-playtime-buddy',
    level: 4,
    stickerId: 'sticker-playtime-buddy',
    stickerName: 'Playtime Buddy',
    title: 'Bé đã mở khoá Playtime Buddy!',
  },
  {
    id: 'reward-lunch-helper',
    level: 5,
    stickerId: 'sticker-lunch-helper',
    stickerName: 'Lunch Helper',
    title: 'Bé đã mở khoá Lunch Helper!',
  },
  {
    id: 'reward-afternoon-home',
    level: 6,
    stickerId: 'sticker-afternoon-home',
    stickerName: 'Home Helper',
    title: 'Bé đã mở khoá Home Helper!',
  },
  {
    id: 'reward-snack-time',
    level: 7,
    stickerId: 'sticker-snack-time',
    stickerName: 'Snack Helper',
    title: 'Bé đã mở khoá Snack Helper!',
  },
  {
    id: 'reward-home-play',
    level: 8,
    stickerId: 'sticker-home-play',
    stickerName: 'Home Player',
    title: 'Bé đã mở khoá Home Player!',
  },
  {
    id: 'reward-afternoon-bath',
    level: 9,
    stickerId: 'sticker-afternoon-bath',
    stickerName: 'Bath Helper',
    title: 'Bé đã mở khoá Bath Helper!',
  },
  {
    id: 'reward-family-dinner',
    level: 10,
    stickerId: 'sticker-family-dinner',
    stickerName: 'Dinner Helper',
    title: 'Bé đã mở khoá Dinner Helper!',
  },
  {
    id: 'reward-after-dinner-cleanup',
    level: 11,
    stickerId: 'sticker-after-dinner-cleanup',
    stickerName: 'Cleanup Helper',
    title: 'Bé đã mở khoá Cleanup Helper!',
  },
  {
    id: 'reward-bedtime',
    level: 12,
    stickerId: 'sticker-bedtime',
    stickerName: 'Sleepy Star',
    title: 'Bé đã mở khoá Sleepy Star!',
  },
];

export function getLevelReward(level: number) {
  return levelRewards.find(reward => reward.level === level);
}
