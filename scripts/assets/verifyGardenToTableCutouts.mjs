import { existsSync } from 'node:fs';
import { join } from 'node:path';

import sharp from 'sharp';

import { repoRoot } from './config.mjs';

const masterRoot = join(
  repoRoot,
  'src/assets/source/master/lessons/garden-to-table',
);
const expectedAssets = {
  'rinse-and-drain': [
    'background',
    'cucumber-dirty',
    'cucumber-clean',
    'lettuce-dirty',
    'lettuce-clean',
    'water-control',
    'water-stream',
    'rinse-action',
    'colander-empty',
    'colander-filled',
    'rinse-well-action',
    'splash-only-action',
    'clean-produce-cue',
  ],
  'make-and-share': [
    'background',
    'towel-folded',
    'towel-under-bowl',
    'bowl-empty',
    'bowl-lettuce',
    'bowl-prepared',
    'bowl-mixed',
    'bowl-shared',
    'lettuce-pieces',
    'cucumber-slices',
    'spoon',
    'salad-closeup',
    'share-action',
  ],
  'save-for-next-season': [
    'background',
    'adult-hand-seed',
    'seed-closeup',
    'envelope-empty',
    'envelope-filled',
    'envelope-closed',
    'envelope-stored',
    'place-seed-control',
    'time-cue',
    'new-season-pot',
    'save-seeds-action',
    'plant-now-action',
  ],
};
const errors = [];

for (const [sceneId, assetNames] of Object.entries(expectedAssets)) {
  for (const assetName of assetNames) {
    const path = join(masterRoot, sceneId, 'images', `${assetName}.png`);
    if (!existsSync(path)) {
      errors.push(`${sceneId}/${assetName}.png is missing`);
      continue;
    }
    const metadata = await sharp(path).metadata();
    if (assetName === 'background') {
      if (metadata.width !== 941 || metadata.height !== 1672) {
        errors.push(`${sceneId}/background.png must be 941x1672`);
      }
      continue;
    }
    if (metadata.width !== 1024 || metadata.height !== 1024) {
      errors.push(`${sceneId}/${assetName}.png must be 1024x1024`);
    }
    if (!metadata.hasAlpha) {
      errors.push(`${sceneId}/${assetName}.png has no alpha channel`);
      continue;
    }

    const { data, info } = await sharp(path)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const corners = [
      3,
      (info.width - 1) * info.channels + 3,
      (info.height - 1) * info.width * info.channels + 3,
      (info.height * info.width - 1) * info.channels + 3,
    ];
    if (corners.some(offset => data[offset] > 8)) {
      errors.push(`${sceneId}/${assetName}.png has an opaque corner/background`);
    }

    let visible = 0;
    let magenta = 0;
    let opaqueBlack = 0;
    for (let offset = 0; offset < data.length; offset += info.channels) {
      if (data[offset + 3] <= 32) continue;
      visible += 1;
      if (
        data[offset] > 150 &&
        data[offset + 2] > 120 &&
        data[offset + 1] + 45 < Math.min(data[offset], data[offset + 2])
      ) {
        magenta += 1;
      }
      if (
        data[offset + 3] >= 246 &&
        data[offset] <= 8 &&
        data[offset + 1] <= 8 &&
        data[offset + 2] <= 8
      ) {
        opaqueBlack += 1;
      }
    }
    if (visible === 0) {
      errors.push(`${sceneId}/${assetName}.png has no visible object`);
    } else if (magenta / visible > 0.002) {
      errors.push(`${sceneId}/${assetName}.png still contains chroma pixels`);
    }
    if (opaqueBlack / (info.width * info.height) > 0.12) {
      errors.push(`${sceneId}/${assetName}.png retains an opaque black matte`);
    }
  }
}

if (errors.length > 0) {
  console.error('Garden-to-table cutout audit failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log('Garden-to-table cutout audit passed.');
}
