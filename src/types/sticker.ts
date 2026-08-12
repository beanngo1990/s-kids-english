import type { ImageSourcePropType } from 'react-native';

import type { SKidsIconName } from '../assets/icons/skids';
import type { MascotPoseId } from '../data/mascot';
import type { StickerArtTone } from '../data/rewards';

export type StickerVisual = {
  iconName: SKidsIconName;
  isUnlocked: boolean;
  pose: MascotPoseId;
  stickerImageSource?: ImageSourcePropType;
  tone: StickerArtTone;
};
