export const skidsIcons = {
  bathroom: require('./bathroom.png'),
  bedroom: require('./bedroom.png'),
  breakfast: require('./breakfast.png'),
  listen: require('./listen.png'),
  map: require('./map.png'),
  next: require('./next.png'),
  parentLock: require('./parent-lock.png'),
  replay: require('./replay.png'),
  school: require('./school.png'),
  speak: require('./speak.png'),
  star: require('./star.png'),
  sticker: require('./sticker.png'),
} as const;

export type SKidsIconName = keyof typeof skidsIcons;
