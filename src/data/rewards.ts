export type LessonReward = {
  id: string;
  lessonId: string;
  stickerId: string;
  stickerName: string;
  title: string;
};

export const lessonRewards: LessonReward[] = [
  {
    id: 'reward-morning-star',
    lessonId: 'morning-routine',
    stickerId: 'sticker-morning-star',
    stickerName: 'Morning Star',
    title: 'Bé đã mở khoá Morning Star!',
  },
  {
    id: 'reward-school-helper',
    lessonId: 'at-school',
    stickerId: 'sticker-school-helper',
    stickerName: 'School Helper',
    title: 'Bé đã mở khoá School Helper!',
  },
  {
    id: 'reward-playtime-buddy',
    lessonId: 'playtime',
    stickerId: 'sticker-playtime-buddy',
    stickerName: 'Playtime Buddy',
    title: 'Bé đã mở khoá Playtime Buddy!',
  },
  {
    id: 'reward-lunch-helper',
    lessonId: 'lunch-time',
    stickerId: 'sticker-lunch-helper',
    stickerName: 'Lunch Helper',
    title: 'Bé đã mở khoá Lunch Helper!',
  },
  {
    id: 'reward-afternoon-home',
    lessonId: 'afternoon-home',
    stickerId: 'sticker-afternoon-home',
    stickerName: 'Home Helper',
    title: 'Bé đã mở khoá Home Helper!',
  },
  {
    id: 'reward-snack-time',
    lessonId: 'snack-time',
    stickerId: 'sticker-snack-time',
    stickerName: 'Snack Helper',
    title: 'Bé đã mở khoá Snack Helper!',
  },
  {
    id: 'reward-home-play',
    lessonId: 'home-play',
    stickerId: 'sticker-home-play',
    stickerName: 'Home Player',
    title: 'Bé đã mở khoá Home Player!',
  },
  {
    id: 'reward-afternoon-bath',
    lessonId: 'afternoon-bath',
    stickerId: 'sticker-afternoon-bath',
    stickerName: 'Bath Helper',
    title: 'Bé đã mở khoá Bath Helper!',
  },
  {
    id: 'reward-family-dinner',
    lessonId: 'family-dinner',
    stickerId: 'sticker-family-dinner',
    stickerName: 'Dinner Helper',
    title: 'Bé đã mở khoá Dinner Helper!',
  },
  {
    id: 'reward-after-dinner-cleanup',
    lessonId: 'after-dinner-cleanup',
    stickerId: 'sticker-after-dinner-cleanup',
    stickerName: 'Cleanup Helper',
    title: 'Bé đã mở khoá Cleanup Helper!',
  },
  {
    id: 'reward-bedtime',
    lessonId: 'bedtime',
    stickerId: 'sticker-bedtime',
    stickerName: 'Sleepy Star',
    title: 'Bé đã mở khoá Sleepy Star!',
  },
];

export function getLessonReward(lessonId: string) {
  return lessonRewards.find(reward => reward.lessonId === lessonId);
}

export function getRewardByStickerId(stickerId: string) {
  return lessonRewards.find(reward => reward.stickerId === stickerId);
}
