export const achievementStickerAssets = {
  allLessons: require('./all-lessons.png'),
  fifteenScenes: require('./fifteen-scenes.png'),
  fiftyWords: require('./fifty-words.png'),
  firstLesson: require('./first-lesson.png'),
  firstReview: require('./first-review.png'),
  firstScene: require('./first-scene.png'),
  firstWord: require('./first-word.png'),
  fiveLessons: require('./five-lessons.png'),
  fiveReviews: require('./five-reviews.png'),
  fiveScenes: require('./five-scenes.png'),
  fiveWords: require('./five-words.png'),
  oneHundredWords: require('./one-hundred-words.png'),
  sevenDayRecord: require('./seven-day-record.png'),
  tenWords: require('./ten-words.png'),
  threeDayStreak: require('./three-day-streak.png'),
  threeLessons: require('./three-lessons.png'),
  twentyFiveWords: require('./twenty-five-words.png'),
  twoDayStreak: require('./two-day-streak.png'),
} as const;

export type AchievementStickerAssetName = keyof typeof achievementStickerAssets;
