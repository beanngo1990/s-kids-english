import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

import sharp from 'sharp';

import { repoRoot, toMasterPath } from './config.mjs';

const force = process.argv.includes('--force');
const lessonId = 'play-with-the-puppy';
const sourceRoot = join(repoRoot, 'src/assets/source/lessons', lessonId);
const sheetRoot = join(sourceRoot, 'production-sheets');
const backgroundPath = join(
  repoRoot,
  'src/assets/source/master/lessons/feed-the-puppy/meet-the-puppy/images/background.png',
);
const happyPuppyPath = join(
  repoRoot,
  'src/assets/source/master/lessons/feed-the-puppy/puppy-eats/images/puppy-happy.png',
);
const sheets = {
  choose: {
    path: join(sheetRoot, 'choose-the-ball-alpha.png'),
    columns: 4,
    rows: 3,
  },
  roll: {
    path: join(sheetRoot, 'roll-and-catch-alpha.png'),
    columns: 3,
    rows: 3,
  },
  bring: {
    path: join(sheetRoot, 'bring-it-back-alpha.png'),
    columns: 3,
    rows: 3,
  },
};

if (!existsSync(backgroundPath)) {
  throw new Error(`Missing shared puppy-room background: ${backgroundPath}`);
}
if (!existsSync(happyPuppyPath)) {
  throw new Error(`Missing complete happy-puppy master: ${happyPuppyPath}`);
}
for (const definition of Object.values(sheets)) {
  if (!existsSync(definition.path)) {
    throw new Error(`Missing play-with-the-puppy sheet: ${definition.path}`);
  }
  const metadata = await sharp(definition.path).metadata();
  if (!metadata.hasAlpha) {
    throw new Error(
      `Production sheet has no alpha channel: ${definition.path}`,
    );
  }
}

const cellCache = new Map();
const masterBuffers = new Map();
let skipped = 0;
let written = 0;

const backgroundBuffer = await sharp(backgroundPath)
  .resize(941, 1672, { fit: 'cover', position: 'centre' })
  .removeAlpha()
  .png()
  .toBuffer();

for (const sceneId of ['choose-the-ball', 'roll-and-catch', 'bring-it-back']) {
  await writeMaster(sceneId, 'background', backgroundBuffer);
}

await cutObjects('choose-the-ball', 'choose', [
  ['puppy-play-bow', 0],
  ['toy-basket-closed', 1],
  ['toy-basket-open', 2],
  ['red-ball', 3],
  ['rope-toy', 4],
  ['choosing-hand', 5],
  ['blue-ball', 6],
  ['round-ball-cue', 7],
  ['soft-ball-squeeze', 8],
  ['hard-block', 9],
  ['pick-up-ball', 10],
  ['puppy-ready', 11],
]);

await cutObjects('roll-and-catch', 'roll', [
  ['hand-roll-action', 0],
  ['red-ball', 1],
  ['puppy-waiting', 2],
  ['puppy-running', 3],
  ['puppy-catching-ball', 4],
  ['mouth-with-ball-closeup', 5],
  ['puppy-holding-ball', 6],
  ['puppy-turning-with-ball', 7],
  ['turn-around-action', 8],
]);

await cutObjects('bring-it-back', 'bring', [
  ['puppy-far-with-ball', 0],
  ['puppy-returning-ball', 1],
  ['puppy-near-with-ball', 2],
  ['open-hand', 3],
  ['ball-in-hand', 4],
  ['red-ball', 5],
  ['your-turn-action', 7],
  ['roll-the-ball-action', 8],
]);

// Cell 6 của production sheet bị cắt ngang đỉnh đầu. Tái sử dụng đúng hero
// đã được duyệt ở feed-the-puppy để giữ nhân vật nhất quán và đủ silhouette.
const happyPuppyBuffer = await normalizeObject(
  await sharp(happyPuppyPath).png().toBuffer(),
);
await assertSafeCutout(happyPuppyBuffer, 'bring-it-back', 'puppy-happy');
masterBuffers.set('bring-it-back/puppy-happy', happyPuppyBuffer);
await writeMaster('bring-it-back', 'puppy-happy', happyPuppyBuffer);

await generateMapIcons();

console.log(`Play-with-the-puppy production masters written: ${written}`);
console.log(`Skipped existing outputs                         : ${skipped}`);

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
  if (!definition)
    throw new Error(`Unknown play-with-the-puppy sheet: ${sheetId}`);
  const metadata = await sharp(definition.path).metadata();
  const column = index % definition.columns;
  const row = Math.floor(index / definition.columns);
  if (row >= definition.rows)
    throw new Error(`Invalid ${sheetId} cell: ${index}`);

  const left = Math.floor((column * metadata.width) / definition.columns);
  const right = Math.floor(
    ((column + 1) * metadata.width) / definition.columns,
  );
  const top = Math.floor((row * metadata.height) / definition.rows);
  const bottom = Math.floor(((row + 1) * metadata.height) / definition.rows);
  const inset = 2;
  const cell = await sharp(definition.path)
    .extract({
      left: left + inset,
      top: top + inset,
      width: right - left - inset * 2,
      height: bottom - top - inset * 2,
    })
    .png()
    .toBuffer();
  await assertTransparentCellBorder(cell, sheetId, index);
  cellCache.set(cacheKey, cell);
  return cell;
}

async function assertTransparentCellBorder(cell, sheetId, index) {
  const { data, info } = await sharp(cell)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let visibleBorderPixels = 0;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (x >= 2 && x < info.width - 2 && y >= 2 && y < info.height - 2)
        continue;
      if (data[(y * info.width + x) * info.channels + 3] > 16) {
        visibleBorderPixels += 1;
      }
    }
  }
  if (visibleBorderPixels > 512) {
    throw new Error(
      `${sheetId} cell ${index} touches its crop border (${visibleBorderPixels} pixels)`,
    );
  }
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
    if (data[offset + 3] >= 246 && red <= 8 && green <= 8 && blue <= 8)
      black += 1;
    if (
      data[offset + 3] >= 246 &&
      Math.max(red, green, blue) - Math.min(red, green, blue) <= 3 &&
      red >= 225
    )
      checkerNeutral += 1;
  }
  if (visible === 0) throw new Error(`${sceneId}/${assetName} is empty`);
  if (black / (info.width * info.height) > 0.12) {
    throw new Error(`${sceneId}/${assetName} retains an opaque black matte`);
  }
  if (checkerNeutral / (info.width * info.height) > 0.3) {
    throw new Error(`${sceneId}/${assetName} retains a checkerboard matte`);
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
      fileName: 'choose-the-ball.png',
      parts: [
        ['choose-the-ball/puppy-play-bow', 120, 205, 660, 660],
        ['choose-the-ball/red-ball', 690, 570, 220, 220],
      ],
      colors: ['#FFF2D5', '#FFD8B8', '#D78A57'],
    },
    {
      fileName: 'roll-and-catch.png',
      parts: [
        ['roll-and-catch/puppy-running', 100, 230, 690, 600],
        ['roll-and-catch/red-ball', 700, 545, 205, 205],
      ],
      colors: ['#E7F7FF', '#C9EAF8', '#4C9FBE'],
    },
    {
      fileName: 'bring-it-back.png',
      parts: [['bring-it-back/puppy-returning-ball', 125, 205, 775, 680]],
      colors: ['#EAF9DF', '#CFEAB9', '#70A85D'],
    },
    {
      fileName: 'milestone-play-with-the-puppy.png',
      parts: [
        ['bring-it-back/puppy-happy', 120, 215, 680, 680],
        ['bring-it-back/red-ball', 710, 575, 190, 190],
      ],
      colors: ['#FFF1D6', '#FFDFA9', '#DE9148'],
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
