import { existsSync } from 'node:fs';
import { join } from 'node:path';

import sharp from 'sharp';

import { repoRoot } from './config.mjs';

const masterRoot = join(
  repoRoot,
  'src/assets/source/master/lessons/feed-the-puppy',
);
const expectedAssets = {
  'meet-the-puppy': [
    'background',
    'puppy-waiting',
    'puppy-sitting',
    'puppy-holding-tummy',
    'puppy-looking-at-bowl',
    'puppy-wagging',
    'hello-hand',
    'empty-bowl-cue',
    'hungry-puppy',
    'food-thought',
    'tail-closeup',
    'collar-closeup',
    'wag-action',
  ],
  'fill-the-bowl': [
    'background',
    'puppy-waiting',
    'bowl-shelf-empty',
    'bowl-on-mat-empty',
    'bowl-on-mat-filled',
    'bowl-ready',
    'food-scoop',
    'feeding-mat',
    'target-glow',
    'one-scoop',
    'too-much-scoop',
    'ready-meal',
  ],
  'puppy-eats': [
    'background',
    'puppy-waiting',
    'puppy-eating',
    'puppy-happy',
    'bowl-full',
    'bowl-empty',
    'eat-action-preview',
    'eat-action-finishing',
    'feed-action',
    'take-away-action',
    'adult-hand-waiting',
    'adult-hand-helping',
    'heart',
    'feeding-mat',
    'carry-bowl-action',
    'put-empty-bowl-action',
    'step-back-action',
    'step-forward-action',
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
    let black = 0;
    let chromaGreen = 0;
    let chromaMagenta = 0;
    let checkerNeutral = 0;
    for (let offset = 0; offset < data.length; offset += info.channels) {
      if (data[offset + 3] <= 32) continue;
      visible += 1;
      const red = data[offset];
      const green = data[offset + 1];
      const blue = data[offset + 2];
      if (data[offset + 3] >= 246 && red <= 8 && green <= 8 && blue <= 8) {
        black += 1;
      }
      if (
        green >= 190 &&
        red <= 60 &&
        blue <= 60 &&
        green - Math.max(red, blue) >= 100
      ) {
        chromaGreen += 1;
      }
      if (
        red >= 140 &&
        blue >= 105 &&
        green <= 90 &&
        Math.min(red, blue) - green >= 55
      ) {
        chromaMagenta += 1;
      }
      if (
        data[offset + 3] >= 246 &&
        Math.max(red, green, blue) - Math.min(red, green, blue) <= 3 &&
        red >= 225
      ) {
        checkerNeutral += 1;
      }
    }
    if (visible === 0) {
      errors.push(`${sceneId}/${assetName}.png has no visible object`);
    } else if (chromaGreen / visible > 0.002) {
      errors.push(`${sceneId}/${assetName}.png still contains chroma green`);
    } else if (chromaMagenta / visible > 0.002) {
      errors.push(`${sceneId}/${assetName}.png still contains chroma magenta`);
    }
    if (black / (info.width * info.height) > 0.12) {
      errors.push(`${sceneId}/${assetName}.png retains an opaque black matte`);
    }
    if (checkerNeutral / (info.width * info.height) > 0.3) {
      errors.push(`${sceneId}/${assetName}.png retains a checkerboard matte`);
    }
  }
}

if (errors.length > 0) {
  console.error('Feed-the-puppy cutout audit failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log('Feed-the-puppy cutout audit passed (43 masters).');
}
