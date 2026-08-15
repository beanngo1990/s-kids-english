import { existsSync } from 'node:fs';
import { join } from 'node:path';

import sharp from 'sharp';

import { repoRoot } from './config.mjs';

const masterRoot = join(
  repoRoot,
  'src/assets/source/master/lessons/play-with-the-puppy',
);
const expectedAssets = {
  'choose-the-ball': [
    'background',
    'puppy-play-bow',
    'toy-basket-closed',
    'toy-basket-open',
    'red-ball',
    'rope-toy',
    'choosing-hand',
    'blue-ball',
    'round-ball-cue',
    'soft-ball-squeeze',
    'hard-block',
    'pick-up-ball',
    'puppy-ready',
  ],
  'roll-and-catch': [
    'background',
    'hand-roll-action',
    'red-ball',
    'puppy-waiting',
    'puppy-running',
    'puppy-catching-ball',
    'mouth-with-ball-closeup',
    'puppy-holding-ball',
    'puppy-turning-with-ball',
    'turn-around-action',
  ],
  'bring-it-back': [
    'background',
    'puppy-far-with-ball',
    'puppy-returning-ball',
    'puppy-near-with-ball',
    'open-hand',
    'ball-in-hand',
    'red-ball',
    'puppy-happy',
    'your-turn-action',
    'roll-the-ball-action',
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
      errors.push(
        `${sceneId}/${assetName}.png has an opaque corner/background`,
      );
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
      if (data[offset + 3] >= 246 && red <= 8 && green <= 8 && blue <= 8)
        black += 1;
      if (
        data[offset + 3] >= 246 &&
        Math.max(red, green, blue) - Math.min(red, green, blue) <= 3 &&
        red >= 225
      )
        checkerNeutral += 1;
    }
    if (visible === 0)
      errors.push(`${sceneId}/${assetName}.png has no visible object`);
    if (black / (info.width * info.height) > 0.12) {
      errors.push(`${sceneId}/${assetName}.png retains an opaque black matte`);
    }
    if (checkerNeutral / (info.width * info.height) > 0.3) {
      errors.push(`${sceneId}/${assetName}.png retains a checkerboard matte`);
    }

    if (sceneId === 'bring-it-back' && assetName === 'puppy-happy') {
      const firstVisibleRow = findFirstVisibleRow(data, info);
      const longestRun = longestVisibleRun(data, info, firstVisibleRow);
      if (longestRun > info.width * 0.2) {
        errors.push(
          `${sceneId}/${assetName}.png has a flat clipped top edge (${longestRun}px)`,
        );
      }
    }
  }
}

if (errors.length > 0) {
  console.error('Play-with-the-puppy cutout audit failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Play-with-the-puppy cutout audit passed (${count} masters).`);
}

function findFirstVisibleRow(data, info) {
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (data[(y * info.width + x) * info.channels + 3] > 32) return y;
    }
  }
  return 0;
}

function longestVisibleRun(data, info, y) {
  let longest = 0;
  let current = 0;
  for (let x = 0; x < info.width; x += 1) {
    if (data[(y * info.width + x) * info.channels + 3] > 32) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }
  return longest;
}
