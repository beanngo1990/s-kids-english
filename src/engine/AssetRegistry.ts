import type { ImageSourcePropType } from 'react-native';

import { getRemoteAssetUrl, remoteAssetsConfig } from '../config/remoteAssets';

const registry: Record<string, ImageSourcePropType> = {
  'lessons/morning-routine/bathroom/images/baby.png': require('../assets/lessons/morning-routine/bathroom/images/baby.png'),
  'lessons/morning-routine/bathroom/images/background.png': require('../assets/lessons/morning-routine/bathroom/images/background.png'),
  'lessons/morning-routine/bathroom/images/mirror.png': require('../assets/lessons/morning-routine/bathroom/images/mirror.png'),
  'lessons/morning-routine/bathroom/images/sink.png': require('../assets/lessons/morning-routine/bathroom/images/sink.png'),
  'lessons/morning-routine/bathroom/images/soap.png': require('../assets/lessons/morning-routine/bathroom/images/soap.png'),
  'lessons/morning-routine/bathroom/images/toothbrush.png': require('../assets/lessons/morning-routine/bathroom/images/toothbrush.png'),
  'lessons/morning-routine/bathroom/images/toothpaste.png': require('../assets/lessons/morning-routine/bathroom/images/toothpaste.png'),
  'lessons/morning-routine/bathroom/images/towel.png': require('../assets/lessons/morning-routine/bathroom/images/towel.png'),
  'lessons/morning-routine/bathroom/images/water.png': require('../assets/lessons/morning-routine/bathroom/images/water.png'),
  'lessons/morning-routine/bedroom/images/baby.png': require('../assets/lessons/morning-routine/bedroom/images/baby.png'),
  'lessons/morning-routine/bedroom/images/background.png': require('../assets/lessons/morning-routine/bedroom/images/background.png'),
  'lessons/morning-routine/bedroom/images/bed.png': require('../assets/lessons/morning-routine/bedroom/images/bed.png'),
  'lessons/morning-routine/bedroom/images/blanket.png': require('../assets/lessons/morning-routine/bedroom/images/blanket.png'),
  'lessons/morning-routine/bedroom/images/box.png': require('../assets/lessons/morning-routine/bedroom/images/box.png'),
  'lessons/morning-routine/bedroom/images/clock.png': require('../assets/lessons/morning-routine/bedroom/images/clock.png'),
  'lessons/morning-routine/bedroom/images/doll.png': require('../assets/lessons/morning-routine/bedroom/images/doll.png'),
  'lessons/morning-routine/bedroom/images/lamp.png': require('../assets/lessons/morning-routine/bedroom/images/lamp.png'),
  'lessons/morning-routine/bedroom/images/pillow.png': require('../assets/lessons/morning-routine/bedroom/images/pillow.png'),
  'lessons/morning-routine/bedroom/images/socks.png': require('../assets/lessons/morning-routine/bedroom/images/socks.png'),
  'lessons/morning-routine/bedroom/images/sun.png': require('../assets/lessons/morning-routine/bedroom/images/sun.png'),
};

/**
 * Resolves a string path from data into a bundled React Native ImageSource.
 * Falls back to uri if the string is a valid remote/local URI.
 */
export function resolveAsset(source: string): ImageSourcePropType | undefined {
  if (remoteAssetsConfig.preferRemoteImages) {
    const remoteAssetUrl = getRemoteAssetUrl(source);
    if (remoteAssetUrl) {
      return { uri: remoteAssetUrl };
    }
  }

  if (registry[source]) {
    return registry[source];
  }

  if (/^(https?:|file:|content:|data:)/u.test(source)) {
    return { uri: source };
  }

  return undefined;
}
