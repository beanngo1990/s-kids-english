import { existsSync } from 'node:fs';
import { join } from 'node:path';

import sharp from 'sharp';

import { repoRoot } from './config.mjs';

const masterRoot = join(
  repoRoot,
  'src/assets/source/master/lessons/clean-muddy-paws',
);
const expectedAssets = {
  'notice-the-muddy-paws': [
    'background',
    'puppy-muddy-on-mat',
    'puppy-waiting-on-mat',
    'mud-puddle',
    'muddy-pawprints',
    'paws-closeup',
    'dirty-paw-closeup',
    'doormat',
    'wait-on-mat-action',
    'muddy-paws-action',
    'stop-hand',
    'adult-help',
  ],
  'wash-the-paws': [
    'background',
    'puppy-muddy-basin',
    'puppy-paw-washing',
    'puppy-clean-wet',
    'clean-water',
    'basin-empty',
    'basin-filled',
    'wash-one-paw-action',
    'clean-wet-paw',
    'muddy-water',
    'adult-carrying-basin',
    'clean-wet-paws',
  ],
  'dry-the-paws': [
    'background',
    'puppy-clean-wet',
    'puppy-drying',
    'puppy-dry',
    'puppy-all-done',
    'towel',
    'wipe-wet-paw',
    'dry-paw',
    'soft-towel',
    'pat-paw',
    'dry-both-paws',
    'all-done',
    'wash-hands',
  ],
};
const errors = [];
let count = 0;

for (const [sceneId, assetNames] of Object.entries(expectedAssets)) {
  for (const assetName of assetNames) {
    count += 1;
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
    let black = 0;
    let checkerNeutral = 0;
    let minX = info.width;
    let minY = info.height;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < info.height; y += 1) {
      for (let x = 0; x < info.width; x += 1) {
        const offset = (y * info.width + x) * info.channels;
        if (data[offset + 3] <= 32) continue;
        visible += 1;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        const red = data[offset];
        const green = data[offset + 1];
        const blue = data[offset + 2];
        if (data[offset + 3] >= 246 && red <= 8 && green <= 8 && blue <= 8) {
          black += 1;
        }
        if (
          data[offset + 3] >= 246 &&
          Math.max(red, green, blue) - Math.min(red, green, blue) <= 3 &&
          red >= 225
        ) {
          checkerNeutral += 1;
        }
      }
    }
    if (visible === 0) {
      errors.push(`${sceneId}/${assetName}.png has no visible object`);
    }
    if (minX < 55 || minY < 55 || maxX > 968 || maxY > 968) {
      errors.push(`${sceneId}/${assetName}.png is clipped or too close to an edge`);
    }
    if (black / (info.width * info.height) > 0.12) {
      errors.push(`${sceneId}/${assetName}.png retains an opaque black matte`);
    }
    if (checkerNeutral / (info.width * info.height) > 0.12) {
      errors.push(`${sceneId}/${assetName}.png retains a checkerboard matte`);
    }
  }
}

if (errors.length > 0) {
  console.error('Clean-muddy-paws cutout audit failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Clean-muddy-paws cutout audit passed (${count} masters).`);
}
