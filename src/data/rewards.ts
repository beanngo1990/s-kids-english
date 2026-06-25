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
];

export function getLessonReward(lessonId: string) {
  return lessonRewards.find(reward => reward.lessonId === lessonId);
}
