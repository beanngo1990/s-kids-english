import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

import sharp from 'sharp';

import { repoRoot } from './config.mjs';

const masterRoot = join(
  repoRoot,
  'src/assets/source/master/lessons/plant-a-seed',
);
const scenes = ['prepare-the-pot', 'plant-the-seed', 'first-watering'];
const actionAssets = [
  ['prepare-the-pot', 'fill-pot-soil'],
  ['prepare-the-pot', 'leave-space'],
  ['plant-the-seed', 'plant-seed'],
  ['plant-the-seed', 'cover-seed'],
  ['first-watering', 'water-gently'],
  ['first-watering', 'wait-sprout'],
];
const errors = [];

for (const sceneId of scenes) {
  const imageRoot = join(masterRoot, sceneId, 'images');
  const assets = await readdir(imageRoot);

  for (const fileName of assets) {
    if (fileName === 'background.png' || !fileName.endsWith('.png')) {
      continue;
    }
    const path = join(imageRoot, fileName);
    const metadata = await sharp(path).metadata();
    if (!metadata.hasAlpha) {
      errors.push(`${sceneId}/${fileName} has no alpha channel`);
      continue;
    }
    const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({
      resolveWithObject: true,
    });
    const cornerOffsets = [
      3,
      (info.width - 1) * info.channels + 3,
      (info.height - 1) * info.width * info.channels + 3,
      (info.height * info.width - 1) * info.channels + 3,
    ];
    if (cornerOffsets.some(offset => data[offset] > 8)) {
      errors.push(`${sceneId}/${fileName} has an opaque corner/background`);
    }
  }
}

for (const [sceneId, assetName] of actionAssets) {
  const path = join(masterRoot, sceneId, 'images', `${assetName}.png`);
  if (!existsSync(path)) {
    errors.push(`${sceneId}/${assetName}.png is missing`);
    continue;
  }
  const metadata = await sharp(path).metadata();
  if (metadata.width !== 1024 || metadata.height !== 1024) {
    errors.push(
      `${sceneId}/${assetName}.png must be a 1024x1024 text-free cutout`,
    );
  }
}

if (errors.length > 0) {
  console.error('Plant-a-seed cutout audit failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log('Plant-a-seed cutout audit passed.');
}
