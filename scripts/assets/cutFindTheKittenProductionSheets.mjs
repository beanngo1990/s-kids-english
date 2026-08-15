import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

import sharp from 'sharp';

import { repoRoot, toMasterPath } from './config.mjs';

const force = process.argv.includes('--force');
const lessonId = 'find-the-kitten';
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
  hear: {
    ...sheet('hear-the-kitten', 4, 3),
    // The generated contact sheet uses a slightly taller first row and the
    // quiet/calling sprites begin above the mathematical 2/3 boundary.
    // Explicit gutters keep adjacent rows out of one another's cutouts.
    xBounds: [0, 395, 768, 1152, 1536],
    yBounds: [0, 350, 665, 1024],
  },
  check: sheet('check-the-hiding-spots', 4, 4),
  welcome: sheet('welcome-the-kitten', 4, 3),
};

function sheet(name, columns, rows) {
  return {
    checkerPath: join(sheetRoot, `${name}-checker.png`),
    alphaPath: join(sheetRoot, `${name}-alpha.png`),
    columns,
    rows,
  };
}

if (!existsSync(backgroundPath)) {
  throw new Error(`Missing shared animal-room background: ${backgroundPath}`);
}
for (const definition of Object.values(sheets)) {
  if (!existsSync(definition.checkerPath)) {
    throw new Error(`Missing find-the-kitten production sheet: ${definition.checkerPath}`);
  }
  if (!existsSync(definition.alphaPath) || force) {
    await removeBakedCheckerboard(definition.checkerPath, definition.alphaPath);
  }
}

const cellCache = new Map();
const sheetComponentCache = new Map();
const masterBuffers = new Map();
let skipped = 0;
let written = 0;

const backgroundBuffer = await sharp(backgroundPath)
  .resize(941, 1672, { fit: 'cover', position: 'centre' })
  .removeAlpha()
  .png()
  .toBuffer();

for (const sceneId of [
  'hear-the-kitten',
  'check-the-hiding-spots',
  'welcome-the-kitten',
]) {
  await writeMaster(sceneId, 'background', backgroundBuffer);
}

await cutObjects('hear-the-kitten', 'hear', [
  ['kitten-sitting', 0],
  ['kitten-hiding-curtain', 1],
  ['curtain', 2],
  ['meow-marks', 3],
  ['pawprints', 4],
  ['listen-ear', 5],
  ['kitten-ears-closeup', 6],
  ['sound-waves', 7],
  ['quiet-finger', 8],
  ['listen-carefully', 9],
  ['calling-where-are-you', 10],
  ['i-hear-you', 11],
]);

await cutObjects('check-the-hiding-spots', 'check', [
  ['box-closed', 0],
  ['box-open-empty', 1],
  ['basket-covered', 2],
  ['basket-open-empty', 3],
  ['kitten-hiding', 4],
  ['kitten-peeking', 5],
  ['kitten-found', 6],
  ['mouse-under-stool', 7],
  ['ball-behind-cushion', 8],
  ['toy-inside-cube', 9],
  ['look-under-box-action', 10],
  ['look-behind-basket-action', 11],
  ['find-kitten-action', 12],
]);

await cutObjects('welcome-the-kitten', 'welcome', [
  ['kitten-peeking', 0],
  ['kitten-coming-out', 1],
  ['kitten-happy', 2],
  ['kitten-near-hand', 3],
  ['kitten-rubbing-hand', 4],
  ['call-action', 5],
  ['paw-closeup', 6],
  ['tail-closeup', 7],
  ['soft-fur-closeup', 8],
  ['open-hand', 9],
  ['kitten-approaching-hand', 10],
  ['pet-gently-action', 11],
]);

await generateMapIcons();

console.log(`Find-the-kitten production masters written: ${written}`);
console.log(`Skipped existing outputs                    : ${skipped}`);

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

  // Pull the anti-aliased neutral fringe into the background without cutting
  // warm cream fabric, orange fur, skin, or white fur inside a silhouette.
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

async function cutObjects(sceneId, sheetId, specs) {
  for (const [assetName, cellIndex] of specs) {
    const buffer = await normalizeObject(await getCell(sheetId, cellIndex));
    await assertSafeCutout(buffer, sceneId, assetName);
    masterBuffers.set(`${sceneId}/${assetName}`, buffer);
    await writeMaster(sceneId, assetName, buffer);
  }
}

async function getCell(sheetId, index) {
  const cacheKey = `${sheetId}:${index}`;
  if (cellCache.has(cacheKey)) return cellCache.get(cacheKey);
  const definition = sheets[sheetId];
  if (!definition) throw new Error(`Unknown find-the-kitten sheet: ${sheetId}`);
  if (index >= definition.columns * definition.rows) {
    throw new Error(`Invalid ${sheetId} cell: ${index}`);
  }
  const sheetData = await getSheetComponents(sheetId, definition);
  const selected = sheetData.components.filter(component => component.cell === index);
  if (selected.length === 0) throw new Error(`${sheetId} cell ${index} is empty`);
  const left = Math.max(0, Math.min(...selected.map(component => component.left)) - 4);
  const top = Math.max(0, Math.min(...selected.map(component => component.top)) - 4);
  const right = Math.min(
    sheetData.info.width,
    Math.max(...selected.map(component => component.right)) + 5,
  );
  const bottom = Math.min(
    sheetData.info.height,
    Math.max(...selected.map(component => component.bottom)) + 5,
  );
  const selectedLabels = new Set(selected.map(component => component.label));
  const output = Buffer.alloc((right - left) * (bottom - top) * 4);
  for (let y = top; y < bottom; y += 1) {
    for (let x = left; x < right; x += 1) {
      const sourceIndex = y * sheetData.info.width + x;
      if (!selectedLabels.has(sheetData.labels[sourceIndex])) continue;
      const sourceOffset = sourceIndex * sheetData.info.channels;
      const targetOffset = ((y - top) * (right - left) + x - left) * 4;
      output[targetOffset] = sheetData.data[sourceOffset];
      output[targetOffset + 1] = sheetData.data[sourceOffset + 1];
      output[targetOffset + 2] = sheetData.data[sourceOffset + 2];
      output[targetOffset + 3] = sheetData.data[sourceOffset + 3];
    }
  }
  const cell = await sharp(output, {
    raw: { width: right - left, height: bottom - top, channels: 4 },
  })
    .png()
    .toBuffer();
  cellCache.set(cacheKey, cell);
  return cell;
}

async function getSheetComponents(sheetId, definition) {
  if (sheetComponentCache.has(sheetId)) return sheetComponentCache.get(sheetId);
  const { data, info } = await sharp(definition.alphaPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixelCount = info.width * info.height;
  const labels = new Uint16Array(pixelCount);
  const queue = new Uint32Array(pixelCount);
  const components = [];
  let nextLabel = 1;
  for (let start = 0; start < pixelCount; start += 1) {
    if (labels[start] || data[start * info.channels + 3] <= 16) continue;
    let head = 0;
    let tail = 0;
    queue[tail++] = start;
    labels[start] = nextLabel;
    let pixels = 0;
    let sumX = 0;
    let sumY = 0;
    let left = info.width;
    let right = 0;
    let top = info.height;
    let bottom = 0;
    while (head < tail) {
      const current = queue[head++];
      const x = current % info.width;
      const y = Math.floor(current / info.width);
      pixels += 1;
      sumX += x;
      sumY += y;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
      for (const neighbor of [
        x > 0 ? current - 1 : -1,
        x + 1 < info.width ? current + 1 : -1,
        y > 0 ? current - info.width : -1,
        y + 1 < info.height ? current + info.width : -1,
      ]) {
        if (
          neighbor >= 0 &&
          !labels[neighbor] &&
          data[neighbor * info.channels + 3] > 16
        ) {
          labels[neighbor] = nextLabel;
          queue[tail++] = neighbor;
        }
      }
    }
    if (pixels >= 12) {
      const centerX = sumX / pixels;
      const centerY = sumY / pixels;
      const column = Math.min(
        definition.columns - 1,
        Math.floor((centerX * definition.columns) / info.width),
      );
      const row = Math.min(
        definition.rows - 1,
        Math.floor((centerY * definition.rows) / info.height),
      );
      components.push({
        label: nextLabel,
        cell: row * definition.columns + column,
        left,
        right,
        top,
        bottom,
      });
    }
    nextLabel += 1;
    if (nextLabel >= 65535) throw new Error(`${sheetId} has too many components`);
  }
  const result = { components, data, info, labels };
  sheetComponentCache.set(sheetId, result);
  return result;
}

async function normalizeObject(source) {
  const trimmed = await sharp(source)
    .trim({ background: { alpha: 0, b: 0, g: 0, r: 0 }, threshold: 10 })
    .png()
    .toBuffer();
  return sharp(trimmed)
    .resize(900, 900, {
      background: { alpha: 0, b: 0, g: 0, r: 0 },
      fit: 'contain',
      withoutEnlargement: false,
    })
    .extend({
      background: { alpha: 0, b: 0, g: 0, r: 0 },
      bottom: 62,
      left: 62,
      right: 62,
      top: 62,
    })
    .png()
    .toBuffer();
}

async function assertSafeCutout(buffer, sceneId, assetName) {
  const { data, info } = await sharp(buffer)
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
    throw new Error(`${sceneId}/${assetName} has an opaque corner`);
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
  if (visible === 0) throw new Error(`${sceneId}/${assetName} is empty`);
  if (black / (info.width * info.height) > 0.12) {
    throw new Error(`${sceneId}/${assetName} retains an opaque black matte`);
  }
  if (checkerNeutral / (info.width * info.height) > 0.12) {
    throw new Error(`${sceneId}/${assetName} retains a checkerboard matte`);
  }
}

async function writeMaster(sceneId, assetName, buffer) {
  const target = toMasterPath(`lessons/${lessonId}/${sceneId}/images/${assetName}.webp`);
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
      fileName: 'hear-the-kitten.png',
      parts: [
        ['hear-the-kitten/kitten-sitting', 120, 215, 660, 660],
        ['hear-the-kitten/meow-marks', 685, 390, 210, 210],
      ],
      colors: ['#FFF2D7', '#FFD9B8', '#D58A50'],
    },
    {
      fileName: 'check-the-hiding-spots.png',
      parts: [['check-the-hiding-spots/kitten-peeking', 125, 205, 775, 680]],
      colors: ['#E8F8FF', '#CDECF7', '#4C9EAE'],
    },
    {
      fileName: 'welcome-the-kitten.png',
      parts: [['welcome-the-kitten/kitten-rubbing-hand', 105, 210, 805, 675]],
      colors: ['#EAF9DF', '#CEE9B9', '#70A65C'],
    },
    {
      fileName: 'milestone-find-the-kitten.png',
      parts: [['check-the-hiding-spots/find-kitten-action', 125, 210, 760, 675]],
      colors: ['#FFF1D6', '#FFDFA9', '#DD9148'],
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
