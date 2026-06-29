import { Image, type ImageRequireSource } from 'react-native';

import { generatedAudioRegistry } from './GeneratedAudioRegistry';

const bundledAudioRegistry: Record<string, ImageRequireSource> = {
  ...generatedAudioRegistry,
};

export function resolveBundledAudioUri(assetKey: string) {
  const audioSource = bundledAudioRegistry[assetKey];
  if (!audioSource) {
    return undefined;
  }

  return Image.resolveAssetSource(audioSource)?.uri;
}
