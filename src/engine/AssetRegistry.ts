import type { ImageSourcePropType } from 'react-native';

const registry: Record<string, ImageSourcePropType> = {
  // Add bundled images here later, for example:
  // 'images/objects/bed.png': require('../assets/images/objects/bed.png'),
  // 'images/scenes/bedroom_bg.png': require('../assets/images/scenes/bedroom_bg.png'),
};

/**
 * Resolves a string path from data into a bundled React Native ImageSource.
 * Falls back to uri if the string is a valid remote/local URI.
 */
export function resolveAsset(source: string): ImageSourcePropType | undefined {
  if (registry[source]) {
    return registry[source];
  }

  if (/^(https?:|file:|content:|data:)/u.test(source)) {
    return { uri: source };
  }

  return undefined;
}
