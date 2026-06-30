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
];

export function getLessonReward(lessonId: string) {
  return lessonRewards.find(reward => reward.lessonId === lessonId);
}
