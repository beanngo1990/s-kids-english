import { Image, type ImageRequireSource } from 'react-native';

import { generatedAudioRegistry } from './GeneratedAudioRegistry';
import { generatedUiAudioRegistry } from './GeneratedUiAudioRegistry';

const bundledAudioRegistry: Record<string, ImageRequireSource> = {
  ...generatedUiAudioRegistry,
  ...generatedAudioRegistry,
};

export function resolveBundledAudioUri(assetKey: string) {
  const audioSource = bundledAudioRegistry[assetKey];
  if (!audioSource) {
    return undefined;
  }

  return Image.resolveAssetSource(audioSource)?.uri;
}
