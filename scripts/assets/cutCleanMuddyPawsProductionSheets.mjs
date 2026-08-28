import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

import sharp from 'sharp';

import { repoRoot, toMasterPath } from './config.mjs';

const force = process.argv.includes('--force');
const lessonId = 'clean-muddy-paws';
const sheetRoot = join(
  repoRoot,
  'src/assets/source/lessons',
  lessonId,
  'production-sheets',
);
const backgroundPath = join(
  repoRoot,
  'src/assets/source/master/lessons/feed-the-puppy/meet-the-puppy/images/background.png',
);
const sheets = {
  notice: {
    sourcePath: join(sheetRoot, 'notice-muddy-paws-checker.png'),
    alphaPath: join(sheetRoot, 'notice-muddy-paws-alpha.png'),
    removeChecker: true,
  },
  wash: {
    sourcePath: join(sheetRoot, 'wash-the-paws-alpha.png'),
    alphaPath: join(sheetRoot, 'wash-the-paws-alpha.png'),
    removeChecker: false,
  },
  dry: {
    sourcePath: join(sheetRoot, 'dry-the-paws-checker.png'),
    alphaPath: join(sheetRoot, 'dry-the-paws-alpha.png'),
    removeChecker: true,
  },
  repairedPuppies: {
    sourcePath: join(sheetRoot, 'wet-and-drying-puppy-magenta.png'),
    alphaPath: join(sheetRoot, 'wet-and-drying-puppy-alpha.png'),
    removeMagenta: true,
  },
};

if (!existsSync(backgroundPath)) {
  throw new Error(`Missing shared animal-room background: ${backgroundPath}`);
}
for (const definition of Object.values(sheets)) {
  if (!existsSync(definition.sourcePath)) {
    throw new Error(`Missing clean-muddy-paws sheet: ${definition.sourcePath}`);
  }
  if (
    definition.removeChecker &&
    (!existsSync(definition.alphaPath) || force)
  ) {
    await removeBakedCheckerboard(
      definition.sourcePath,
      definition.alphaPath,
    );
  }
  if (
    definition.removeMagenta &&
    (!existsSync(definition.alphaPath) || force)
  ) {
    await removeChromaMagenta(
      definition.sourcePath,
      definition.alphaPath,
    );
  }
}

const sheetCache = new Map();
const masterBuffers = new Map();
let skipped = 0;
let written = 0;

const backgroundBuffer = await sharp(backgroundPath)
  .resize(941, 1672, { fit: 'cover', position: 'centre' })
  .removeAlpha()
  .png()
  .toBuffer();

for (const sceneId of [
  'notice-the-muddy-paws',
  'wash-the-paws',
  'dry-the-paws',
]) {
  await writeMaster(sceneId, 'background', backgroundBuffer);
}

await cutObjects('notice-the-muddy-paws', 'notice', [
  ['puppy-muddy-on-mat', [[0.14, 0.16], [0.15, 0.3]]],
  ['puppy-waiting-on-mat', [[0.38, 0.16], [0.38, 0.3]]],
  ['mud-puddle', [[0.63, 0.2]]],
  [
    'muddy-pawprints',
    [
      [0.94, 0.05],
      [0.9, 0.13],
      [0.86, 0.21],
      [0.81, 0.29],
    ],
  ],
  ['paws-closeup', [[0.09, 0.5], [0.21, 0.5]]],
  ['dirty-paw-closeup', [[0.38, 0.5]]],
  ['doormat', [[0.63, 0.52]]],
  ['wait-on-mat-action', [[0.88, 0.48], [0.88, 0.59]]],
  ['muddy-paws-action', [[0.08, 0.82], [0.21, 0.82]]],
  ['stop-hand', [[0.37, 0.82]]],
  ['adult-help', [[0.7, 0.79]]],
]);

await cutObjects('wash-the-paws', 'wash', [
  ['puppy-muddy-basin', [[0.37, 0.14]]],
  ['puppy-paw-washing', [[0.62, 0.14], [0.76, 0.2]]],
  ['clean-water', [[0.1, 0.4]]],
  ['basin-empty', [[0.37, 0.4]]],
  ['basin-filled', [[0.62, 0.4]]],
  ['wash-one-paw-action', [[0.62, 0.63], [0.72, 0.67]]],
  ['clean-wet-paw', [[0.1, 0.64]]],
  ['muddy-water', [[0.12, 0.88]]],
  ['adult-carrying-basin', [[0.4, 0.87], [0.34, 0.78]]],
  ['clean-wet-paws', [[0.62, 0.88], [0.72, 0.88]]],
]);

// The repaired sheet keeps the puppy independent from the basin and protects
// the white facial blaze from checkerboard-removal holes.
await cutObjects('wash-the-paws', 'repairedPuppies', [
  ['puppy-clean-wet', [[0.25, 0.5]]],
]);

await cutObjects('dry-the-paws', 'dry', [
  ['puppy-dry', [[0.63, 0.15], [0.63, 0.29]]],
  ['puppy-all-done', [[0.89, 0.16], [0.82, 0.29]]],
  ['towel', [[0.13, 0.52]]],
  ['wipe-wet-paw', [[0.38, 0.5], [0.45, 0.53]]],
  ['dry-paw', [[0.63, 0.52]]],
  ['soft-towel', [[0.88, 0.52]]],
  ['pat-paw', [[0.13, 0.82], [0.19, 0.82]]],
  ['dry-both-paws', [[0.38, 0.82], [0.46, 0.82]]],
  ['all-done', [[0.59, 0.83], [0.69, 0.83]]],
  ['wash-hands', [[0.88, 0.82]]],
]);

await cutObjects('dry-the-paws', 'repairedPuppies', [
  ['puppy-clean-wet', [[0.25, 0.5]]],
  ['puppy-drying', [[0.75, 0.5]]],
]);

await generateMapIcons();

console.log(`Clean-muddy-paws production masters written: ${written}`);
console.log(`Skipped existing outputs                       : ${skipped}`);

async function cutObjects(sceneId, sheetId, specs) {
  for (const [assetName, seeds] of specs) {
    const buffer = await extractSeededComponents(sheetId, seeds);
    await assertSafeCutout(buffer, sceneId, assetName);
    masterBuffers.set(`${sceneId}/${assetName}`, buffer);
    await writeMaster(sceneId, assetName, buffer);
  }
}

async function loadSheet(sheetId) {
  if (sheetCache.has(sheetId)) return sheetCache.get(sheetId);
  const definition = sheets[sheetId];
  if (!definition) throw new Error(`Unknown clean-muddy-paws sheet: ${sheetId}`);
  const { data, info } = await sharp(definition.alphaPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixelCount = info.width * info.height;
  const labels = new Int32Array(pixelCount);
  labels.fill(-1);
  const components = [];
  const queue = new Uint32Array(pixelCount);
  let componentId = 0;

  for (let start = 0; start < pixelCount; start += 1) {
    if (labels[start] !== -1 || data[start * info.channels + 3] <= 32) continue;
    let head = 0;
    let tail = 0;
    let minX = info.width;
    let minY = info.height;
    let maxX = 0;
    let maxY = 0;
    let size = 0;
    labels[start] = componentId;
    queue[tail++] = start;
    while (head < tail) {
      const index = queue[head++];
      const x = index % info.width;
      const y = Math.floor(index / info.width);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      size += 1;
      const neighbours = [];
      if (x > 0) neighbours.push(index - 1);
      if (x + 1 < info.width) neighbours.push(index + 1);
      if (y > 0) neighbours.push(index - info.width);
      if (y + 1 < info.height) neighbours.push(index + info.width);
      for (const neighbour of neighbours) {
        if (
          labels[neighbour] === -1 &&
          data[neighbour * info.channels + 3] > 32
        ) {
          labels[neighbour] = componentId;
          queue[tail++] = neighbour;
        }
      }
    }
    components.push({ id: componentId, maxX, maxY, minX, minY, size });
    componentId += 1;
  }

  const result = { components, data, info, labels };
  sheetCache.set(sheetId, result);
  return result;
}

async function extractSeededComponents(sheetId, seeds) {
  const sheet = await loadSheet(sheetId);
  const selected = new Set();
  for (const [relativeX, relativeY] of seeds) {
    const x = Math.round(relativeX * (sheet.info.width - 1));
    const y = Math.round(relativeY * (sheet.info.height - 1));
    const label = findNearestComponent(sheet, x, y);
    if (label < 0) {
      throw new Error(`No component near ${sheetId} seed ${relativeX},${relativeY}`);
    }
    selected.add(label);
  }
  const meaningful = [...selected].filter(
    id => sheet.components[id] && sheet.components[id].size >= 120,
  );
  if (meaningful.length === 0) {
    throw new Error(`No meaningful component selected from ${sheetId}`);
  }

  let minX = sheet.info.width;
  let minY = sheet.info.height;
  let maxX = 0;
  let maxY = 0;
  for (const id of meaningful) {
    const component = sheet.components[id];
    minX = Math.min(minX, component.minX);
    minY = Math.min(minY, component.minY);
    maxX = Math.max(maxX, component.maxX);
    maxY = Math.max(maxY, component.maxY);
  }

  const rgba = Buffer.alloc(sheet.info.width * sheet.info.height * 4);
  const selectedLabels = new Set(meaningful);
  for (let index = 0; index < sheet.labels.length; index += 1) {
    if (!selectedLabels.has(sheet.labels[index])) continue;
    const sourceOffset = index * sheet.info.channels;
    const targetOffset = index * 4;
    rgba[targetOffset] = sheet.data[sourceOffset];
    rgba[targetOffset + 1] = sheet.data[sourceOffset + 1];
    rgba[targetOffset + 2] = sheet.data[sourceOffset + 2];
    rgba[targetOffset + 3] = sheet.data[sourceOffset + 3];
  }

  const padding = 8;
  const left = Math.max(0, minX - padding);
  const top = Math.max(0, minY - padding);
  const width = Math.min(sheet.info.width - left, maxX - minX + 1 + padding * 2);
  const height = Math.min(sheet.info.height - top, maxY - minY + 1 + padding * 2);
  const isolated = await sharp(rgba, {
    raw: {
      width: sheet.info.width,
      height: sheet.info.height,
      channels: 4,
    },
  })
    .extract({ height, left, top, width })
    .png()
    .toBuffer();
  return normalizeObject(isolated);
}

function findNearestComponent(sheet, x, y) {
  const direct = sheet.labels[y * sheet.info.width + x];
  if (direct >= 0 && sheet.components[direct]?.size >= 120) return direct;
  for (let radius = 4; radius <= 120; radius += 4) {
    for (let offset = -radius; offset <= radius; offset += 4) {
      for (const [candidateX, candidateY] of [
        [x + offset, y - radius],
        [x + offset, y + radius],
        [x - radius, y + offset],
        [x + radius, y + offset],
      ]) {
        if (
          candidateX < 0 ||
          candidateY < 0 ||
          candidateX >= sheet.info.width ||
          candidateY >= sheet.info.height
        ) {
          continue;
        }
        const label = sheet.labels[candidateY * sheet.info.width + candidateX];
        if (label >= 0 && sheet.components[label]?.size >= 120) return label;
      }
    }
  }
  return -1;
}

async function normalizeObject(buffer) {
  const trimmed = await sharp(buffer).trim({ background: '#00000000' }).png().toBuffer();
  const resized = await sharp(trimmed)
    .resize(880, 880, {
      background: { alpha: 0, b: 0, g: 0, r: 0 },
      fit: 'inside',
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();
  return sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { alpha: 0, b: 0, g: 0, r: 0 },
    },
  })
    .composite([{ input: resized, gravity: 'centre' }])
    .png()
    .toBuffer();
}

async function assertSafeCutout(buffer, sceneId, assetName) {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let visible = 0;
  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const alpha = data[(y * info.width + x) * info.channels + 3];
      if (alpha <= 32) continue;
      visible += 1;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  if (visible < 1000) {
    throw new Error(`${sceneId}/${assetName} has too little visible content`);
  }
  if (minX < 55 || minY < 55 || maxX > 968 || maxY > 968) {
    throw new Error(`${sceneId}/${assetName} is too close to the cutout canvas edge`);
  }
}

async function writeMaster(sceneId, assetName, buffer) {
  const target = toMasterPath(
    `lessons/${lessonId}/${sceneId}/images/${assetName}.webp`,
  );
  if (existsSync(target) && !force) {
    skipped += 1;
    return;
  }
  mkdirSync(dirname(target), { recursive: true });
  await sharp(buffer).png().toFile(target);
  written += 1;
}

async function generateMapIcons() {
  const specs = [
    {
      fileName: 'notice-the-muddy-paws.png',
      parts: [['notice-the-muddy-paws/puppy-muddy-on-mat', 115, 190, 790, 700]],
      colors: ['#FFF2D7', '#FFD9B8', '#D58A50'],
    },
    {
      fileName: 'wash-the-paws.png',
      parts: [['wash-the-paws/wash-one-paw-action', 105, 190, 815, 700]],
      colors: ['#E8F8FF', '#CDECF7', '#4C9EAE'],
    },
    {
      fileName: 'dry-the-paws.png',
      parts: [['dry-the-paws/puppy-drying', 115, 190, 790, 700]],
      colors: ['#FFF8D8', '#FFE9A8', '#D8A63F'],
    },
    {
      fileName: 'milestone-clean-muddy-paws.png',
      parts: [['dry-the-paws/puppy-dry', 125, 205, 770, 675]],
      colors: ['#EAF9DF', '#CEE9B9', '#70A65C'],
      star: true,
    },
  ];
  const iconRoot = join(repoRoot, 'src/assets/icons/skids');
  mkdirSync(iconRoot, { recursive: true });
  for (const spec of specs) {
    const target = join(iconRoot, spec.fileName);
    if (existsSync(target) && !force) {
      skipped += 1;
      continue;
    }
    const [inner, outer, stroke] = spec.colors;
    const base = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><defs><radialGradient id="bg"><stop stop-color="${inner}"/><stop offset="1" stop-color="${outer}"/></radialGradient></defs><circle cx="512" cy="512" r="478" fill="url(#bg)" stroke="${stroke}" stroke-width="28"/></svg>`,
    );
    const composites = [];
    for (const [key, left, top, width, height] of spec.parts) {
      const source = masterBuffers.get(key);
      if (!source) throw new Error(`Missing icon source: ${key}`);
      composites.push({
        input: await sharp(source)
          .resize(width, height, {
            background: { alpha: 0, b: 0, g: 0, r: 0 },
            fit: 'contain',
          })
          .png()
          .toBuffer(),
        left,
        top,
      });
    }
    if (spec.star) {
      composites.push({
        input: Buffer.from(
          '<svg xmlns="http://www.w3.org/2000/svg" width="190" height="190" viewBox="0 0 230 230"><path d="M115 10l28 64 70 7-53 46 16 69-61-36-61 36 16-69-53-46 70-7z" fill="#FFD154" stroke="#E29A36" stroke-width="10"/></svg>',
        ),
        left: 70,
        top: 75,
      });
    }
    const composed = await sharp(base).composite(composites).png().toBuffer();
    await sharp(composed)
      .resize(320, 320)
      .png({ colors: 256, compressionLevel: 9, effort: 10, palette: true })
      .toFile(target);
    written += 1;
  }
}

async function removeBakedCheckerboard(sourcePath, targetPath) {
  const { data, info } = await sharp(sourcePath)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixelCount = info.width * info.height;
  const background = new Uint8Array(pixelCount);
  const queued = new Uint8Array(pixelCount);
  const queue = new Uint32Array(pixelCount);
  let head = 0;
  let tail = 0;

  const isChecker = (index, relaxed = false) => {
    const offset = index * info.channels;
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const minimum = Math.min(red, green, blue);
    const spread = Math.max(red, green, blue) - minimum;
    return relaxed
      ? minimum >= 226 && spread <= 20
      : minimum >= 234 && spread <= 9;
  };
  const enqueue = index => {
    if (queued[index] || !isChecker(index)) return;
    queued[index] = 1;
    queue[tail++] = index;
  };
  for (let x = 0; x < info.width; x += 1) {
    enqueue(x);
    enqueue((info.height - 1) * info.width + x);
  }
  for (let y = 0; y < info.height; y += 1) {
    enqueue(y * info.width);
    enqueue(y * info.width + info.width - 1);
  }
  while (head < tail) {
    const index = queue[head++];
    background[index] = 1;
    const x = index % info.width;
    const y = Math.floor(index / info.width);
    if (x > 0) enqueue(index - 1);
    if (x + 1 < info.width) enqueue(index + 1);
    if (y > 0) enqueue(index - info.width);
    if (y + 1 < info.height) enqueue(index + info.width);
  }
  for (let pass = 0; pass < 3; pass += 1) {
    const additions = [];
    for (let index = 0; index < pixelCount; index += 1) {
      if (background[index] || !isChecker(index, true)) continue;
      const x = index % info.width;
      const y = Math.floor(index / info.width);
      if (
        (x > 0 && background[index - 1]) ||
        (x + 1 < info.width && background[index + 1]) ||
        (y > 0 && background[index - info.width]) ||
        (y + 1 < info.height && background[index + info.width])
      ) {
        additions.push(index);
      }
    }
    for (const index of additions) background[index] = 1;
  }

  const rgba = Buffer.alloc(pixelCount * 4);
  for (let index = 0; index < pixelCount; index += 1) {
    const sourceOffset = index * info.channels;
    const targetOffset = index * 4;
    rgba[targetOffset] = data[sourceOffset];
    rgba[targetOffset + 1] = data[sourceOffset + 1];
    rgba[targetOffset + 2] = data[sourceOffset + 2];
    rgba[targetOffset + 3] = background[index] ? 0 : 255;
  }
  await sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(targetPath);
}

async function removeChromaMagenta(sourcePath, targetPath) {
  const { data, info } = await sharp(sourcePath)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixelCount = info.width * info.height;
  const background = new Uint8Array(pixelCount);
  for (let index = 0; index < pixelCount; index += 1) {
    const offset = index * info.channels;
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    if (
      red >= 180 &&
      blue >= 140 &&
      green <= 150 &&
      red - green >= 60 &&
      blue - green >= 35
    ) {
      background[index] = 1;
    }
  }
  for (let pass = 0; pass < 5; pass += 1) {
    const additions = [];
    for (let index = 0; index < pixelCount; index += 1) {
      if (background[index]) continue;
      const x = index % info.width;
      const y = Math.floor(index / info.width);
      const touchesBackground =
        (x > 0 && background[index - 1]) ||
        (x + 1 < info.width && background[index + 1]) ||
        (y > 0 && background[index - info.width]) ||
        (y + 1 < info.height && background[index + info.width]);
      if (!touchesBackground) continue;
      const offset = index * info.channels;
      const red = data[offset];
      const green = data[offset + 1];
      const blue = data[offset + 2];
      if (
        red >= 150 &&
        blue >= 80 &&
        green <= 175 &&
        red - green >= 30 &&
        blue - green >= 10
      ) {
        additions.push(index);
      }
    }
    for (const index of additions) background[index] = 1;
  }
  const rgba = Buffer.alloc(pixelCount * 4);
  for (let index = 0; index < pixelCount; index += 1) {
    const sourceOffset = index * info.channels;
    const targetOffset = index * 4;
    const red = data[sourceOffset];
    const green = data[sourceOffset + 1];
    const blue = data[sourceOffset + 2];
    const isMagenta = background[index] === 1;
    rgba[targetOffset] = isMagenta ? 0 : red;
    rgba[targetOffset + 1] = isMagenta ? 0 : green;
    rgba[targetOffset + 2] = isMagenta ? 0 : blue;
    rgba[targetOffset + 3] = isMagenta ? 0 : 255;
  }
  await sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(targetPath);
}
