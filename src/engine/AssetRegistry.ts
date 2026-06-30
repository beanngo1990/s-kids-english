import type { ImageSourcePropType } from 'react-native';

import { getRemoteAssetUrl, remoteAssetsConfig } from '../config/remoteAssets';

const registry: Record<string, ImageSourcePropType> = {
  'lessons/at-school/classroom/images/baby.png': require('../assets/lessons/at-school/classroom/images/baby.png'),
  'lessons/at-school/classroom/images/background.png': require('../assets/lessons/at-school/classroom/images/background.png'),
  'lessons/at-school/classroom/images/board.png': require('../assets/lessons/at-school/classroom/images/board.png'),
  'lessons/at-school/classroom/images/chair.png': require('../assets/lessons/at-school/classroom/images/chair.png'),
  'lessons/at-school/classroom/images/classroom.png': require('../assets/lessons/at-school/classroom/images/classroom.png'),
  'lessons/at-school/classroom/images/desk.png': require('../assets/lessons/at-school/classroom/images/desk.png'),
  'lessons/at-school/classroom/images/hand.png': require('../assets/lessons/at-school/classroom/images/hand.png'),
  'lessons/at-school/classroom/images/teacher.png': require('../assets/lessons/at-school/classroom/images/teacher.png'),
  'lessons/morning-routine/bathroom/images/baby.png': require('../assets/lessons/morning-routine/bathroom/images/baby.png'),
  'lessons/morning-routine/bathroom/images/background.png': require('../assets/lessons/morning-routine/bathroom/images/background.png'),
  'lessons/morning-routine/bathroom/images/mirror.png': require('../assets/lessons/morning-routine/bathroom/images/mirror.png'),
  'lessons/morning-routine/bathroom/images/sink.png': require('../assets/lessons/morning-routine/bathroom/images/sink.png'),
  'lessons/morning-routine/bathroom/images/soap.png': require('../assets/lessons/morning-routine/bathroom/images/soap.png'),
  'lessons/morning-routine/bathroom/images/toothbrush.png': require('../assets/lessons/morning-routine/bathroom/images/toothbrush.png'),
  'lessons/morning-routine/bathroom/images/toothpaste.png': require('../assets/lessons/morning-routine/bathroom/images/toothpaste.png'),
  'lessons/morning-routine/bathroom/images/towel.png': require('../assets/lessons/morning-routine/bathroom/images/towel.png'),
  'lessons/morning-routine/bathroom/images/water.png': require('../assets/lessons/morning-routine/bathroom/images/water.png'),
  'lessons/morning-routine/breakfast/images/apple.png': require('../assets/lessons/morning-routine/breakfast/images/apple.png'),
  'lessons/morning-routine/breakfast/images/baby.png': require('../assets/lessons/morning-routine/breakfast/images/baby.png'),
  'lessons/morning-routine/breakfast/images/background.png': require('../assets/lessons/morning-routine/breakfast/images/background.png'),
  'lessons/morning-routine/breakfast/images/banana.png': require('../assets/lessons/morning-routine/breakfast/images/banana.png'),
  'lessons/morning-routine/breakfast/images/bread.png': require('../assets/lessons/morning-routine/breakfast/images/bread.png'),
  'lessons/morning-routine/breakfast/images/cup.png': require('../assets/lessons/morning-routine/breakfast/images/cup.png'),
  'lessons/morning-routine/breakfast/images/egg.png': require('../assets/lessons/morning-routine/breakfast/images/egg.png'),
  'lessons/morning-routine/breakfast/images/milk.png': require('../assets/lessons/morning-routine/breakfast/images/milk.png'),
  'lessons/morning-routine/breakfast/images/plate.png': require('../assets/lessons/morning-routine/breakfast/images/plate.png'),
  'lessons/morning-routine/go-to-school/images/baby.png': require('../assets/lessons/morning-routine/go-to-school/images/baby.png'),
  'lessons/morning-routine/go-to-school/images/background.png': require('../assets/lessons/morning-routine/go-to-school/images/background.png'),
  'lessons/morning-routine/go-to-school/images/bag.png': require('../assets/lessons/morning-routine/go-to-school/images/bag.png'),
  'lessons/morning-routine/go-to-school/images/book.png': require('../assets/lessons/morning-routine/go-to-school/images/book.png'),
  'lessons/morning-routine/go-to-school/images/bus.png': require('../assets/lessons/morning-routine/go-to-school/images/bus.png'),
  'lessons/morning-routine/go-to-school/images/lunchbox.png': require('../assets/lessons/morning-routine/go-to-school/images/lunchbox.png'),
  'lessons/morning-routine/go-to-school/images/school.png': require('../assets/lessons/morning-routine/go-to-school/images/school.png'),
  'lessons/morning-routine/go-to-school/images/shoes.png': require('../assets/lessons/morning-routine/go-to-school/images/shoes.png'),
  'lessons/morning-routine/go-to-school/images/uniform.png': require('../assets/lessons/morning-routine/go-to-school/images/uniform.png'),
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
