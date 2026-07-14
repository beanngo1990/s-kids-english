export const appUiIcons = {
  clock: require('./clock.png'),
  custom: require('./custom.png'),
  daily: require('./daily.png'),
  difficulty: require('./difficulty.png'),
  journey: require('./journey.png'),
  language: require('./language.png'),
  lesson: require('./lesson.png'),
  lessonComplete: require('./lessonComplete.png'),
  reminder: require('./reminder.png'),
  review: require('./review.png'),
  reward: require('./reward.png'),
  stats: require('./stats.png'),
  teacher: require('./teacher.png'),
  theme: require('./theme.png'),
  visibility: require('./visibility.png'),
  words: require('./words.png'),
} as const;

export type AppUiIconName = keyof typeof appUiIcons;
