import type { ImageRequireSource } from 'react-native';

export const backgroundMusicAssetKey = 'ui/audio/music/sungy-background.mp3';

export const backgroundMusicAsset: ImageRequireSource = require(
  '../assets/ui/audio/music/sungy-background.mp3',
);

export const backgroundMusicMetadata = {
  bitRateKbps: 192,
  channels: 2,
  format: 'mp3',
  sampleRateHz: 44100,
  sha256:
    'fdb1acdd1dcd99e0c6f5248187da12fd263c96250d8b03457cfedb8323f066db',
} as const;
