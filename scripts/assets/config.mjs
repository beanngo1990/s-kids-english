import { createHash } from 'node:crypto';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');
export const assetsRoot = join(repoRoot, 'src/assets');
export const lessonAssetsRoot = join(assetsRoot, 'lessons');
export const masterRoot = join(assetsRoot, 'source/master');
export const manifestPath = join(assetsRoot, 'asset-manifest.json');
export const generatedReleasePath = join(
  repoRoot,
  'src/config/generatedAssetRelease.ts',
);
export const reportRoot = join(repoRoot, 'build/asset-reports');

export const imageReleaseVersion = 'v1';

export const profiles = {
  background: {
    alphaQuality: 100,
    effort: 6,
    maxEdge: 2048,
    preset: 'picture',
    quality: 80,
    smartSubsample: true,
  },
  character: {
    alphaQuality: 100,
    effort: 6,
    maxEdge: 1024,
    preset: 'drawing',
    quality: 84,
    smartSubsample: true,
  },
  characterLarge: {
    alphaQuality: 100,
    effort: 6,
    maxEdge: 1280,
    preset: 'drawing',
    quality: 84,
    smartSubsample: true,
  },
  objectLarge: {
    alphaQuality: 100,
    effort: 6,
    maxEdge: 1024,
    preset: 'drawing',
    quality: 84,
    smartSubsample: true,
  },
  objectMedium: {
    alphaQuality: 100,
    effort: 6,
    maxEdge: 768,
    preset: 'drawing',
    quality: 84,
    smartSubsample: true,
  },
  objectSmall: {
    alphaQuality: 100,
    effort: 6,
    maxEdge: 512,
    preset: 'drawing',
    quality: 84,
    smartSubsample: true,
  },
};

/** Per-asset overrides keyed by runtime asset path. */
export const overrides = {};

export const configSignature = createHash('sha256')
  .update(JSON.stringify({ imageReleaseVersion, overrides, profiles }))
  .digest('hex')
  .slice(0, 16);

export function selectProfile(usage) {
  const override = overrides[usage.source];
  if (override) {
    const baseProfile = profiles[override.profile ?? 'objectMedium'];
    return {
      name: override.profile ?? 'override',
      options: { ...baseProfile, ...override },
    };
  }

  if (usage.roles.includes('background')) {
    return { name: 'background', options: profiles.background };
  }

  if (usage.roles.includes('character')) {
    return usage.maxPercent > 50
      ? { name: 'characterLarge', options: profiles.characterLarge }
      : { name: 'character', options: profiles.character };
  }

  if (usage.maxPercent <= 20) {
    return { name: 'objectSmall', options: profiles.objectSmall };
  }

  if (usage.maxPercent <= 35) {
    return { name: 'objectMedium', options: profiles.objectMedium };
  }

  return { name: 'objectLarge', options: profiles.objectLarge };
}

export function toPosixPath(filePath) {
  return filePath.replaceAll('\\', '/');
}

export function toRuntimePath(filePath) {
  return toPosixPath(relative(assetsRoot, filePath));
}

export function toMasterPath(runtimeSource) {
  const pngSource = runtimeSource.replace(/\.(?:jpe?g|webp)$/iu, '.png');
  return resolve(masterRoot, pngSource);
}

export function toWebpRuntimePath(runtimeSource) {
  return runtimeSource.replace(extname(runtimeSource), '.webp');
}

export function toWebpOutputPath(runtimeSource) {
  return resolve(assetsRoot, toWebpRuntimePath(runtimeSource));
}
