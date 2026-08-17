import { existsSync } from 'node:fs';
import { join } from 'node:path';

import sharp from 'sharp';

import { repoRoot } from './config.mjs';

const masterRoot = join(
  repoRoot,
  'src/assets/source/master/lessons/groom-the-kitten',
);
const expectedAssets = {
  'get-the-brush': [
    'background',
    'kitten-sitting-messy',
    'kitten-sitting-calm',
    'grooming-brush',
    'sitting-mat',
    'kitten-fur-closeup',
    'fur-tangle-closeup',
    'soft-kitten-fur',
  ],
  'brush-the-fur': [
    'background',
    'kitten-sitting-calm',
    'kitten-being-brushed',
    'kitten-smooth-fur',
    'kitten-fluffy-neat',
    'grooming-brush-active',
    'stroke-fur-action',
    'gentle-brushing-cue',
    'brush-fur-action',
    'brush-softly-cue',
  ],
  'kitten-purrs': [
    'background',
    'kitten-content',
    'kitten-purring-hearts',
    'kitten-happy-smile',
    'kitten-cozy-curled',
    'kitten-loved-peaceful',
    'kitten-tail-closeup',
    'snuggle-action-cue',
    'listen-purr-cue',
    'sweet-purr-soundwave',
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
    for (let offset = 0; offset < data.length; offset += info.channels) {
      if (data[offset + 3] <= 32) continue;
      visible += 1;
      const red = data[offset];
      const green = data[offset + 1];
      const blue = data[offset + 2];
      if (data[offset + 3] >= 246 && red <= 8 && green <= 8 && blue <= 8) black += 1;
      if (
        data[offset + 3] >= 246 &&
        Math.max(red, green, blue) - Math.min(red, green, blue) <= 3 &&
        red >= 225
      ) checkerNeutral += 1;
    }
    if (visible === 0) errors.push(`${sceneId}/${assetName}.png has no visible object`);
    if (black / (info.width * info.height) > 0.12) {
      errors.push(`${sceneId}/${assetName}.png retains an opaque black matte`);
    }
    if (checkerNeutral / (info.width * info.height) > 0.12) {
      errors.push(`${sceneId}/${assetName}.png retains a checkerboard matte`);
    }
  }
}

if (errors.length > 0) {
  console.error('Groom-the-kitten cutout audit failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Groom-the-kitten cutout audit passed (${count} masters).`);
}
