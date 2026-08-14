import { existsSync } from 'node:fs';
import { join } from 'node:path';

import sharp from 'sharp';

import { repoRoot } from './config.mjs';

const masterRoot = join(
  repoRoot,
  'src/assets/source/master/lessons/garden-friends',
);
const expectedAssets = {
  'flower-visitors': [
    'background',
    'plant-flower',
    'plant-tiny-fruit',
    'flower',
    'bee',
    'butterfly',
    'observation-ring',
    'watch-control-low',
    'watch-control-high',
    'time-cue',
  ],
  'quiet-garden-watch': [
    'background',
    'hero-plant',
    'leaf-tip',
    'leaf-tip-lifted',
    'caterpillar',
    'observation-ring',
    'birdbath-empty',
    'birdbath-filled',
    'water-drop',
    'quiet-hands-control',
    'garden-neighbors',
    'watch-gently-action',
    'wave-hands-action',
  ],
  'under-the-leaf': [
    'background',
    'hero-plant',
    'leaf-cover-closed',
    'leaf-cover-lifted',
    'leaf-cover-replaced',
    'earthworm',
    'snail',
    'observation-ring',
    'soil-patch',
    'tunnel',
    'look-under-leaf-action',
    'look-over-flower-action',
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
    if (
      assetName === 'observation-ring' &&
      countSignificantAlphaComponents(data, info) > 2
    ) {
      errors.push(
        `${sceneId}/${assetName}.png contains a detached crop fragment`,
      );
    }
  }
}

if (errors.length > 0) {
  console.error('Garden-friends cutout audit failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log('Garden-friends cutout audit passed.');
}

function countSignificantAlphaComponents(data, info) {
  const pixelCount = info.width * info.height;
  const visited = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  let significantComponents = 0;

  for (let index = 0; index < pixelCount; index += 1) {
    if (visited[index] || data[index * info.channels + 3] <= 32) {
      continue;
    }

    let head = 0;
    let tail = 0;
    let componentSize = 0;
    queue[tail] = index;
    tail += 1;
    visited[index] = 1;

    while (head < tail) {
      const current = queue[head];
      head += 1;
      componentSize += 1;
      const x = current % info.width;
      const y = Math.floor(current / info.width);
      const neighbors = [];
      if (x > 0) neighbors.push(current - 1);
      if (x + 1 < info.width) neighbors.push(current + 1);
      if (y > 0) neighbors.push(current - info.width);
      if (y + 1 < info.height) neighbors.push(current + info.width);

      for (const neighbor of neighbors) {
        if (
          !visited[neighbor] &&
          data[neighbor * info.channels + 3] > 32
        ) {
          visited[neighbor] = 1;
          queue[tail] = neighbor;
          tail += 1;
        }
      }
    }

    if (componentSize >= 128) {
      significantComponents += 1;
    }
  }

  return significantComponents;
}
