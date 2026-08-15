import type { SKidsIconName } from '../assets/icons/skids';
import type { AppLanguage } from '../i18n/types';
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
  /** @deprecated Use getLocalizedLessonRewardName for kid-facing copy. */
  stickerName: string;
  stickerNameEn: string;
  stickerNameVi: string;
  title: string;
};

type LocalizableLessonRewardName = Pick<LessonReward, 'stickerName'> &
  Partial<Pick<LessonReward, 'stickerNameEn' | 'stickerNameVi'>>;

export function getLocalizedLessonRewardName(
  reward: LocalizableLessonRewardName,
  appLanguage: AppLanguage,
) {
  return appLanguage === 'en'
    ? reward.stickerNameEn ?? reward.stickerName
    : reward.stickerNameVi ?? reward.stickerName;
}

export const lessonRewards: LessonReward[] = [
  {
    id: 'reward-morning-star',
    iconName: 'bedroom',
    lessonId: 'morning-routine',
    stickerId: 'sticker-morning-star',
    stickerName: 'Morning Star',
    stickerNameEn: 'Morning Star',
    stickerNameVi: 'Ngôi sao buổi sáng',
    tone: 'sun',
    title: 'Bé đã mở khoá Morning Star!',
  },
  {
    id: 'reward-school-helper',
    iconName: 'schoolSupplies',
    lessonId: 'at-school',
    stickerId: 'sticker-school-helper',
    stickerName: 'School Helper',
    stickerNameEn: 'School Helper',
    stickerNameVi: 'Trợ thủ trường học',
    tone: 'teal',
    title: 'Bé đã mở khoá School Helper!',
  },
  {
    id: 'reward-playtime-buddy',
    iconName: 'playground',
    lessonId: 'playtime',
    stickerId: 'sticker-playtime-buddy',
    stickerName: 'Playtime Buddy',
    stickerNameEn: 'Playtime Buddy',
    stickerNameVi: 'Bạn chơi vui vẻ',
    tone: 'coral',
    title: 'Bé đã mở khoá Playtime Buddy!',
  },
  {
    id: 'reward-lunch-helper',
    iconName: 'lunchBox',
    lessonId: 'lunch-time',
    stickerId: 'sticker-lunch-helper',
    stickerName: 'Lunch Helper',
    stickerNameEn: 'Lunch Helper',
    stickerNameVi: 'Trợ thủ bữa trưa',
    tone: 'sky',
    title: 'Bé đã mở khoá Lunch Helper!',
  },
  {
    id: 'reward-afternoon-home',
    iconName: 'goingHome',
    lessonId: 'afternoon-home',
    stickerId: 'sticker-afternoon-home',
    stickerName: 'Home Helper',
    stickerNameEn: 'Home Helper',
    stickerNameVi: 'Trợ thủ ở nhà',
    tone: 'teal',
    title: 'Bé đã mở khoá Home Helper!',
  },
  {
    id: 'reward-snack-time',
    iconName: 'snackPrep',
    lessonId: 'snack-time',
    stickerId: 'sticker-snack-time',
    stickerName: 'Snack Helper',
    stickerNameEn: 'Snack Helper',
    stickerNameVi: 'Trợ thủ bữa xế',
    tone: 'sun',
    title: 'Bé đã mở khoá Snack Helper!',
  },
  {
    id: 'reward-home-play',
    iconName: 'homeToyCorner',
    lessonId: 'home-play',
    stickerId: 'sticker-home-play',
    stickerName: 'Home Player',
    stickerNameEn: 'Home Player',
    stickerNameVi: 'Bạn chơi ở nhà',
    tone: 'coral',
    title: 'Bé đã mở khoá Home Player!',
  },
  {
    id: 'reward-afternoon-bath',
    iconName: 'bathPrep',
    lessonId: 'afternoon-bath',
    stickerId: 'sticker-afternoon-bath',
    stickerName: 'Bath Helper',
    stickerNameEn: 'Bath Helper',
    stickerNameVi: 'Trợ thủ tắm rửa',
    tone: 'sky',
    title: 'Bé đã mở khoá Bath Helper!',
  },
  {
    id: 'reward-family-dinner',
    iconName: 'dinnerTable',
    lessonId: 'family-dinner',
    stickerId: 'sticker-family-dinner',
    stickerName: 'Dinner Helper',
    stickerNameEn: 'Dinner Helper',
    stickerNameVi: 'Trợ thủ bữa tối',
    tone: 'teal',
    title: 'Bé đã mở khoá Dinner Helper!',
  },
  {
    id: 'reward-after-dinner-cleanup',
    iconName: 'sortAndDry',
    lessonId: 'after-dinner-cleanup',
    stickerId: 'sticker-after-dinner-cleanup',
    stickerName: 'Cleanup Helper',
    stickerNameEn: 'Cleanup Helper',
    stickerNameVi: 'Trợ thủ dọn dẹp',
    tone: 'coral',
    title: 'Bé đã mở khoá Cleanup Helper!',
  },
  {
    id: 'reward-bedtime',
    iconName: 'sleepReady',
    lessonId: 'bedtime',
    stickerId: 'sticker-bedtime',
    stickerName: 'Sleepy Star',
    stickerNameEn: 'Sleepy Star',
    stickerNameVi: 'Ngôi sao ngon giấc',
    tone: 'sky',
    title: 'Bé đã mở khoá Sleepy Star!',
  },
  {
    id: 'reward-supermarket-trip',
    iconName: 'milestoneSupermarketTrip',
    lessonId: 'supermarket-trip',
    stickerId: 'sticker-supermarket-trip',
    stickerName: 'Market Explorer',
    stickerNameEn: 'Market Explorer',
    stickerNameVi: 'Nhà khám phá siêu thị',
    tone: 'teal',
    title: 'Bé đã mở khoá Market Explorer!',
  },
  {
    id: 'reward-park-visit',
    iconName: 'parkEntrance',
    lessonId: 'park-visit',
    stickerId: 'sticker-park-visit',
    stickerName: 'Park Explorer',
    stickerNameEn: 'Park Explorer',
    stickerNameVi: 'Nhà khám phá công viên',
    tone: 'sun',
    title: 'Bé đã mở khoá Park Explorer!',
  },
  {
    id: 'reward-beach-day',
    iconName: 'beachSand',
    lessonId: 'beach-day',
    stickerId: 'sticker-beach-day',
    stickerName: 'Beach Explorer',
    stickerNameEn: 'Beach Explorer',
    stickerNameVi: 'Nhà khám phá bãi biển',
    tone: 'sky',
    title: 'Bé đã mở khoá Beach Explorer!',
  },
  {
    id: 'reward-animal-trip',
    iconName: 'animalGate',
    lessonId: 'animal-trip',
    stickerId: 'sticker-animal-trip',
    stickerName: 'Animal Friend',
    stickerNameEn: 'Animal Friend',
    stickerNameVi: 'Bạn của muôn thú',
    tone: 'coral',
    title: 'Bé đã mở khoá Animal Friend!',
  },
  {
    id: 'reward-library-visit',
    iconName: 'libraryCard',
    lessonId: 'library-visit',
    stickerId: 'sticker-library-visit',
    stickerName: 'Book Explorer',
    stickerNameEn: 'Book Explorer',
    stickerNameVi: 'Nhà khám phá sách',
    tone: 'teal',
    title: 'Bé đã mở khoá Book Explorer!',
  },
  {
    id: 'reward-doctor-visit',
    iconName: 'clinicRoom',
    lessonId: 'doctor-visit',
    stickerId: 'sticker-doctor-visit',
    stickerName: 'Clinic Helper',
    stickerNameEn: 'Clinic Helper',
    stickerNameVi: 'Trợ thủ phòng khám',
    tone: 'sky',
    title: 'Bé đã mở khoá Clinic Helper!',
  },
  {
    id: 'reward-birthday-party',
    iconName: 'partyTable',
    lessonId: 'birthday-party',
    stickerId: 'sticker-birthday-party',
    stickerName: 'Party Star',
    stickerNameEn: 'Party Star',
    stickerNameVi: 'Ngôi sao bữa tiệc',
    tone: 'coral',
    title: 'Bé đã mở khoá Party Star!',
  },
  {
    id: 'reward-grandparents-visit',
    iconName: 'familyVisit',
    lessonId: 'grandparents-visit',
    stickerId: 'sticker-grandparents-visit',
    stickerName: 'Family Visitor',
    stickerNameEn: 'Family Visitor',
    stickerNameVi: 'Bạn nhỏ thăm ông bà',
    tone: 'sun',
    title: 'Bé đã mở khoá Family Visitor!',
  },
  {
    id: 'reward-my-body',
    iconName: 'headFace',
    lessonId: 'my-body',
    stickerId: 'sticker-my-body',
    stickerName: 'Body Explorer',
    stickerNameEn: 'Body Explorer',
    stickerNameVi: 'Nhà khám phá cơ thể',
    tone: 'coral',
    title: 'Bé đã mở khoá Body Explorer!',
  },
  {
    id: 'reward-five-senses',
    iconName: 'seeingWorld',
    lessonId: 'five-senses',
    stickerId: 'sticker-five-senses',
    stickerName: 'Senses Explorer',
    stickerNameEn: 'Senses Explorer',
    stickerNameVi: 'Nhà khám phá giác quan',
    tone: 'teal',
    title: 'Bé đã mở khoá Senses Explorer!',
  },
  {
    id: 'reward-my-feelings',
    iconName: 'happySad',
    lessonId: 'my-feelings',
    stickerId: 'sticker-my-feelings',
    stickerName: 'Feelings Friend',
    stickerNameEn: 'Feelings Friend',
    stickerNameVi: 'Người bạn cảm xúc',
    tone: 'sun',
    title: 'Bé đã mở khoá Feelings Friend!',
  },
  {
    id: 'reward-calm-myself',
    iconName: 'slowBreathing',
    lessonId: 'calm-myself',
    stickerId: 'sticker-calm-myself',
    stickerName: 'Calm Breather',
    stickerNameEn: 'Calm Breather',
    stickerNameVi: 'Bạn nhỏ bình tâm',
    tone: 'sky',
    title: 'Bé đã mở khoá Calm Breather!',
  },
  {
    id: 'reward-personal-care',
    iconName: 'faceHairCare',
    lessonId: 'personal-care',
    stickerId: 'sticker-personal-care',
    stickerName: 'Care Helper',
    stickerNameEn: 'Care Helper',
    stickerNameVi: 'Trợ thủ chăm sóc',
    tone: 'teal',
    title: 'Bé đã mở khoá Care Helper!',
  },
  {
    id: 'reward-dress-myself',
    iconName: 'chooseClothes',
    lessonId: 'dress-myself',
    stickerId: 'sticker-dress-myself',
    stickerName: 'Dressing Star',
    stickerNameEn: 'Dressing Star',
    stickerNameVi: 'Ngôi sao tự mặc đồ',
    tone: 'coral',
    title: 'Bé đã mở khoá Dressing Star!',
  },
  {
    id: 'reward-toilet-routine',
    iconName: 'toiletSteps',
    lessonId: 'toilet-routine',
    stickerId: 'sticker-toilet-routine',
    stickerName: 'Routine Star',
    stickerNameEn: 'Routine Star',
    stickerNameVi: 'Ngôi sao vệ sinh',
    tone: 'sky',
    title: 'Bé đã mở khoá Routine Star!',
  },
  {
    id: 'reward-speaking-up',
    iconName: 'bodyBoundaries',
    lessonId: 'speaking-up',
    stickerId: 'sticker-speaking-up',
    stickerName: 'Brave Voice',
    stickerNameEn: 'Brave Voice',
    stickerNameVi: 'Tiếng nói dũng cảm',
    tone: 'sun',
    title: 'Bé đã mở khoá Brave Voice!',
  },
  {
    id: 'reward-plant-a-seed',
    iconName: 'milestonePlantASeed',
    lessonId: 'plant-a-seed',
    stickerId: 'sticker-plant-a-seed',
    stickerName: 'Little Gardener',
    stickerNameEn: 'Little Gardener',
    stickerNameVi: 'Người làm vườn nhỏ',
    tone: 'teal',
    title: 'Bé đã mở khoá Little Gardener!',
  },
  {
    id: 'reward-help-it-grow',
    iconName: 'milestoneHelpItGrow',
    lessonId: 'help-it-grow',
    stickerId: 'sticker-help-it-grow',
    stickerName: 'Plant Helper',
    stickerNameEn: 'Plant Helper',
    stickerNameVi: 'Trợ thủ chăm cây',
    tone: 'sun',
    title: 'Bé đã mở khoá Plant Helper!',
  },
  {
    id: 'reward-garden-friends',
    iconName: 'milestoneGardenFriends',
    lessonId: 'garden-friends',
    stickerId: 'sticker-garden-friends',
    stickerName: 'Garden Friend',
    stickerNameEn: 'Garden Friend',
    stickerNameVi: 'Người bạn khu vườn',
    tone: 'teal',
    title: 'Bé đã mở khoá Garden Friend!',
  },
  {
    id: 'reward-harvest-day',
    iconName: 'milestoneHarvestDay',
    lessonId: 'harvest-day',
    stickerId: 'sticker-harvest-day',
    stickerName: 'Harvest Hero',
    stickerNameEn: 'Harvest Hero',
    stickerNameVi: 'Anh hùng thu hoạch',
    tone: 'sun',
    title: 'Bé đã mở khoá Harvest Hero!',
  },
  {
    id: 'reward-garden-to-table',
    iconName: 'milestoneGardenToTable',
    lessonId: 'garden-to-table',
    stickerId: 'sticker-garden-to-table',
    stickerName: 'Garden Cycle Star',
    stickerNameEn: 'Garden Cycle Star',
    stickerNameVi: 'Ngôi sao mùa mới',
    tone: 'teal',
    title: 'Bé đã mở khoá Garden Cycle Star!',
  },
  {
    id: 'reward-feed-the-puppy',
    iconName: 'milestoneFeedThePuppy',
    lessonId: 'feed-the-puppy',
    stickerId: 'sticker-feed-the-puppy',
    stickerName: 'Puppy Helper',
    stickerNameEn: 'Puppy Helper',
    stickerNameVi: 'Trợ thủ của cún',
    tone: 'coral',
    title: 'Bé đã mở khoá Puppy Helper!',
  },
  {
    id: 'reward-play-with-the-puppy',
    iconName: 'milestonePlayWithThePuppy',
    lessonId: 'play-with-the-puppy',
    stickerId: 'sticker-play-with-the-puppy',
    stickerName: 'Gentle Playmate',
    stickerNameEn: 'Gentle Playmate',
    stickerNameVi: 'Bạn chơi nhẹ nhàng',
    tone: 'sun',
    title: 'Bé đã mở khoá Gentle Playmate!',
  },
  {
    id: 'reward-find-the-kitten',
    iconName: 'milestoneFindTheKitten',
    lessonId: 'find-the-kitten',
    stickerId: 'sticker-find-the-kitten',
    stickerName: 'Kitten Friend',
    stickerNameEn: 'Kitten Friend',
    stickerNameVi: 'Người bạn của mèo con',
    tone: 'teal',
    title: 'Bé đã mở khoá Kitten Friend!',
  },
  {
    id: 'reward-clean-muddy-paws',
    iconName: 'milestoneCleanMuddyPaws',
    lessonId: 'clean-muddy-paws',
    stickerId: 'sticker-clean-muddy-paws',
    stickerName: 'Clean Paws Helper',
    stickerNameEn: 'Clean Paws Helper',
    stickerNameVi: 'Trợ thủ chân sạch',
    tone: 'sky',
    title: 'Bé đã mở khoá Clean Paws Helper!',
  },
];

export function getLessonReward(lessonId: string) {
  return lessonRewards.find(reward => reward.lessonId === lessonId);
}

export function getRewardByStickerId(stickerId: string) {
  return lessonRewards.find(reward => reward.stickerId === stickerId);
}
