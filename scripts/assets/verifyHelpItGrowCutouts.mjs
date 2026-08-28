import { existsSync } from 'node:fs';
import { join } from 'node:path';

import sharp from 'sharp';

import { repoRoot } from './config.mjs';

const masterRoot = join(
  repoRoot,
  'src/assets/source/master/lessons/help-it-grow',
);
const expectedAssets = {
  'new-leaf-and-sunlight': [
    'background',
    'plant-drooping',
    'plant-perked',
    'plant-new-leaf',
    'plant-sunlit',
    'watering-can',
    'time-cue',
    'leaf',
    'shade-control',
    'sunlight',
    'shade',
    'move-sunlight-action',
    'stay-shade-action',
  ],
  'rainy-day-care': [
    'background',
    'plant-rain-wet',
    'plant-sheltered',
    'cloud-gray',
    'rain',
    'soil-wet',
    'soil-checked-wet',
    'root-window-control',
    'roots',
    'check-soil-action',
    'pour-water-action',
  ],
  'wind-and-support': [
    'background',
    'plant-swaying',
    'plant-leaning',
    'plant-staked',
    'plant-supported',
    'plant-flower-bud',
    'wind',
    'stem',
    'support-stick',
    'installed-stake',
    'stake',
    'soft-tie',
    'installed-tie',
    'support-stem-action',
    'leave-leaning-action',
    'time-cue',
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

    let visiblePixels = 0;
    let magentaPixels = 0;
    for (let offset = 0; offset < data.length; offset += info.channels) {
      if (data[offset + 3] <= 32) {
        continue;
      }
      visiblePixels += 1;
      if (
        data[offset] > 150 &&
        data[offset + 2] > 120 &&
        data[offset + 1] + 45 < Math.min(data[offset], data[offset + 2])
      ) {
        magentaPixels += 1;
      }
    }
    if (visiblePixels === 0) {
      errors.push(`${sceneId}/${assetName}.png has no visible object`);
    } else if (magentaPixels / visiblePixels > 0.002) {
      errors.push(`${sceneId}/${assetName}.png still contains chroma-key pixels`);
    }
  }
}

if (errors.length > 0) {
  console.error('Help-it-grow cutout audit failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log('Help-it-grow cutout audit passed.');
}
