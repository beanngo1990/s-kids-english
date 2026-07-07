import type { ImageRequireSource } from 'react-native';

/**
 * Audio asset registry.
 *
 * Previously contained bundled require() calls for all lesson audio files.
 * Now empty — audio is loaded from Cloudflare R2 via AssetCacheManager.
 * Local files are kept on disk for development and upload workflows.
 */
export const generatedAudioRegistry: Record<string, ImageRequireSource> = {};
