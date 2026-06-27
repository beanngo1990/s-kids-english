import type { ImageSourcePropType } from 'react-native';

import { getRemoteAssetUrl, remoteAssetsConfig } from '../config/remoteAssets';

const registry: Record<string, ImageSourcePropType> = {
  'images/characters/baby_bathroom.png': require('../assets/images/characters/baby_bathroom.png'),
  'images/characters/baby_happy.png': require('../assets/images/characters/baby_happy.png'),
  'images/objects/bed.png': require('../assets/images/objects/bed.png'),
  'images/objects/blanket.png': require('../assets/images/objects/blanket.png'),
  'images/objects/sun.png': require('../assets/images/objects/sun.png'),
  'images/objects/toothbrush.png': require('../assets/images/objects/toothbrush.png'),
  'images/objects/towel.png': require('../assets/images/objects/towel.png'),
  'images/objects/water.png': require('../assets/images/objects/water.png'),
  'images/scenes/bathroom_bg.png': require('../assets/images/scenes/bathroom_bg.png'),
  'images/scenes/bedroom_bg.png': require('../assets/images/scenes/bedroom_bg.png'),
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
