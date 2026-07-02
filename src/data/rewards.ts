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
    title: 'Bé đã hoàn thành Buổi sáng của bé!',
  },
  {
    id: 'reward-school-helper',
    lessonId: 'at-school',
    stickerId: 'sticker-school-helper',
    stickerName: 'School Helper',
    title: 'Bé đã hoàn thành Ở Trường Của Bé!',
  },
  {
    id: 'reward-playtime-buddy',
    lessonId: 'playtime',
    stickerId: 'sticker-playtime-buddy',
    stickerName: 'Playtime Buddy',
    title: 'Bé đã hoàn thành Giờ Ra Chơi!',
  },
  {
    id: 'reward-lunch-helper',
    lessonId: 'lunch-time',
    stickerId: 'sticker-lunch-helper',
    stickerName: 'Lunch Helper',
    title: 'Bé đã hoàn thành Bữa trưa của bé!',
  },
  {
    id: 'reward-afternoon-home',
    lessonId: 'afternoon-home',
    stickerId: 'sticker-afternoon-home',
    stickerName: 'Home Helper',
    title: 'Bé đã hoàn thành Về nhà buổi chiều!',
  },
  {
    id: 'reward-snack-time',
    lessonId: 'snack-time',
    stickerId: 'sticker-snack-time',
    stickerName: 'Snack Helper',
    title: 'Bé đã hoàn thành Bữa xế của bé!',
  },
  {
    id: 'reward-home-play',
    lessonId: 'home-play',
    stickerId: 'sticker-home-play',
    stickerName: 'Home Player',
    title: 'Bé đã hoàn thành Chơi ở nhà!',
  },
];

export function getLessonReward(lessonId: string) {
  return lessonRewards.find(reward => reward.lessonId === lessonId);
}
