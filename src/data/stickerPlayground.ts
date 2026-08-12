import type { ImageSourcePropType } from 'react-native';

import type { SKidsIconName } from '../assets/icons/skids';
import type { StickerPlaygroundBackgroundId } from '../types/stickerPlayground';

export type StickerPlaygroundBackground = {
  iconName: SKidsIconName;
  id: StickerPlaygroundBackgroundId;
  imageSource: ImageSourcePropType;
};

export const stickerPlaygroundBackgrounds: StickerPlaygroundBackground[] = [
  {
    iconName: 'bedroom',
    id: 'bedroom',
    imageSource: require('../assets/lessons/morning-routine/bedroom/images/background.webp'),
  },
  {
    iconName: 'parkEntrance',
    id: 'park',
    imageSource: require('../assets/lessons/park-visit/park-entrance/images/background.webp'),
  },
  {
    iconName: 'beachSand',
    id: 'beach',
    imageSource: require('../assets/lessons/beach-day/sand-play/images/background.webp'),
  },
];
