import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

import sharp from 'sharp';

import { repoRoot, toMasterPath } from './config.mjs';

const force = process.argv.includes('--force');
const lessonId = 'feed-the-puppy';
const sourceRoot = join(
  repoRoot,
  'src/assets/source/lessons/feed-the-puppy',
);
const sheetRoot = join(sourceRoot, 'production-sheets');
const backgroundPath = join(sourceRoot, 'pet-room-background.png');
const sheetDefinitions = {
  meet: sheet('meet-the-puppy', 3, 3),
  fill: sheet('fill-the-bowl', 4, 2),
  eats: sheet('puppy-eats', 4, 4),
  extension: sheet('feed-the-puppy-v2-extension', 3, 3),
  emptyBowlActions: alphaSheet('feed-the-puppy-empty-bowl-actions', 3, 2),
};

function sheet(name, columns, rows) {
  return {
    alphaPath: join(sheetRoot, `${name}-alpha.png`),
    chromaPath: join(sheetRoot, `${name}-chroma.png`),
    columns,
    rows,
  };
}

function alphaSheet(name, columns, rows) {
  return {
    alphaPath: join(sheetRoot, `${name}-alpha.png`),
    alphaOnly: true,
    columns,
    rows,
  };
}

if (!existsSync(backgroundPath)) {
  throw new Error(`Missing feed-the-puppy background: ${backgroundPath}`);
}
for (const definition of Object.values(sheetDefinitions)) {
  const sourcePath = definition.alphaOnly
    ? definition.alphaPath
    : definition.chromaPath;
  if (!existsSync(sourcePath)) {
    throw new Error(`Missing feed-the-puppy sheet: ${sourcePath}`);
  }
}

const cellCache = new Map();
const masterBuffers = new Map();
let skipped = 0;
let written = 0;

for (const definition of Object.values(sheetDefinitions)) {
  await writeAlphaSheet(definition);
}

const backgroundBuffer = await sharp(backgroundPath)
  .resize(941, 1672, { fit: 'cover', position: 'centre' })
  .removeAlpha()
  .png()
  .toBuffer();

for (const sceneId of ['meet-the-puppy', 'fill-the-bowl', 'puppy-eats']) {
  await writeMaster(sceneId, 'background', backgroundBuffer);
}

await cutObjects('meet-the-puppy', 'meet', [
  ['puppy-waiting', 0],
  ['puppy-sitting', 1],
  ['puppy-holding-tummy', 2],
  ['puppy-looking-at-bowl', 3],
  ['puppy-wagging', 4],
  ['hello-hand', 5],
  ['empty-bowl-cue', 6],
  ['hungry-puppy', 7],
  ['food-thought', 8],
]);

await cutObjects('meet-the-puppy', 'extension', [
  ['tail-closeup', 0],
  ['collar-closeup', 1],
  ['wag-action', 2],
]);

await cutObjects('fill-the-bowl', 'fill', [
  ['puppy-waiting', 0],
  ['bowl-shelf-empty', 1],
  ['bowl-on-mat-empty', 2],
  ['bowl-on-mat-filled', 3],
  ['bowl-ready', 4],
  ['food-scoop', 5],
  ['feeding-mat', 6],
  ['target-glow', 7],
]);

await cutObjects('fill-the-bowl', 'extension', [
  ['one-scoop', 3],
  ['too-much-scoop', 4],
  ['ready-meal', 5],
]);

await cutObjects('puppy-eats', 'eats', [
  ['puppy-waiting', 0],
  ['puppy-eating', 1],
  ['puppy-happy', 2],
  ['bowl-full', 3],
  ['bowl-empty', 4],
  ['eat-action-preview', 5],
  ['eat-action-finishing', 6],
  ['feed-action', 7],
  ['take-away-action', 8],
  ['adult-hand-waiting', 9],
  ['adult-hand-helping', 10],
  ['heart', 11],
  ['feeding-mat', 12],
]);

await cutObjects('puppy-eats', 'extension', [
  ['carry-bowl-action', 6],
  ['step-back-action', 7],
  ['step-forward-action', 8],
]);

// These cues occur only after the puppy has finished eating. Keep them on a
// separate alpha sheet so no cleanup beat can accidentally bring food back.
await cutObjects('puppy-eats', 'emptyBowlActions', [
  ['carry-bowl-action', 0],
  ['adult-hand-helping', 1],
  ['put-empty-bowl-action', 2],
  ['step-back-action', 3],
  ['step-forward-action', 4],
]);

await generateMapIcons();

console.log(`Feed-the-puppy production masters written: ${written}`);
console.log(`Skipped existing outputs                  : ${skipped}`);

async function writeAlphaSheet(definition) {
  if (definition.alphaOnly) {
    const metadata = await sharp(definition.alphaPath).metadata();
    if (!metadata.hasAlpha) {
      throw new Error(
        `Feed-the-puppy alpha sheet has no alpha channel: ${definition.alphaPath}`,
      );
    }
    return;
  }
  if (existsSync(definition.alphaPath) && !force) return;

  const metadata = await sharp(definition.chromaPath).metadata();
  const buffer = metadata.hasAlpha
    ? await cleanProvidedAlpha(definition.chromaPath)
    : await removeChroma(definition.chromaPath);
  await sharp(buffer).png().toFile(definition.alphaPath);
}

async function cleanProvidedAlpha(path) {
  const source = await sharp(path).ensureAlpha().png().toBuffer();
  return cleanAlphaEdges(source, 2);
}

async function removeChroma(path) {
  const { data, info } = await sharp(path)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const isMagentaPlate =
    data[0] >= 150 && data[2] >= 100 && data[1] + 50 < Math.min(data[0], data[2]);

  for (let offset = 0; offset < data.length; offset += info.channels) {
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const dominance = green - Math.max(red, blue);

    if (
      !isMagentaPlate &&
      green >= 175 &&
      red <= 100 &&
      blue <= 100 &&
      dominance >= 55
    ) {
      const brightnessStrength = Math.min(1, Math.max(0, (green - 155) / 45));
      const dominanceStrength = Math.min(1, Math.max(0, (dominance - 45) / 55));
      const keyStrength = Math.min(1, brightnessStrength * dominanceStrength);
      data[offset + 3] = Math.round(
        data[offset + 3] * (1 - keyStrength) * (1 - keyStrength),
      );
    }
    if (isMagentaPlate) {
      const magentaDominance = Math.min(red, blue) - green;
      if (
        red >= 115 &&
        blue >= 90 &&
        green <= 145 &&
        magentaDominance >= 30
      ) {
        const keyStrength = Math.min(
          1,
          Math.max(0, (magentaDominance - 24) / 60),
        );
        data[offset + 3] = Math.round(
          data[offset + 3] * (1 - keyStrength) * (1 - keyStrength),
        );
      }
    }
    if (data[offset + 3] <= 12) {
      data[offset] = 0;
      data[offset + 1] = 0;
      data[offset + 2] = 0;
      data[offset + 3] = 0;
    }
  }

  const keyed = await sharp(data, {
    raw: { channels: info.channels, height: info.height, width: info.width },
  })
    .png()
    .toBuffer();
  const cleaned = await cleanAlphaEdges(keyed, 1);
  return isMagentaPlate
    ? stripResidualMagenta(cleaned)
    : stripResidualGreen(cleaned);
}

async function stripResidualMagenta(source) {
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let offset = 0; offset < data.length; offset += info.channels) {
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    if (
      red >= 120 &&
      blue >= 90 &&
      green <= 80 &&
      Math.min(red, blue) - green >= 50
    ) {
      data[offset] = 0;
      data[offset + 1] = 0;
      data[offset + 2] = 0;
      data[offset + 3] = 0;
    }
  }

  return sharp(data, {
    raw: { channels: info.channels, height: info.height, width: info.width },
  })
    .png()
    .toBuffer();
}

async function stripResidualGreen(source) {
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let offset = 0; offset < data.length; offset += info.channels) {
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    if (
      green >= 155 &&
      red <= 35 &&
      blue <= 35 &&
      green - Math.max(red, blue) >= 120
    ) {
      data[offset] = 0;
      data[offset + 1] = 0;
      data[offset + 2] = 0;
      data[offset + 3] = 0;
    }
  }

  return sharp(data, {
    raw: { channels: info.channels, height: info.height, width: info.width },
  })
    .png()
    .toBuffer();
}

async function cleanAlphaEdges(source, erosion) {
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const insetAlpha = await sharp(source)
    .ensureAlpha()
    .extractChannel('alpha')
    .erode(erosion)
    .raw()
    .toBuffer();

  for (let offset = 0, pixel = 0; offset < data.length; offset += 4, pixel += 1) {
    data[offset + 3] = insetAlpha[pixel];
    if (data[offset + 3] <= 12) {
      data[offset] = 0;
      data[offset + 1] = 0;
      data[offset + 2] = 0;
      data[offset + 3] = 0;
    }
  }

  return sharp(data, {
    raw: { channels: info.channels, height: info.height, width: info.width },
  })
    .png()
    .toBuffer();
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

  const definition = sheetDefinitions[sheetId];
  if (!definition) throw new Error(`Unknown feed-the-puppy sheet: ${sheetId}`);
  const metadata = await sharp(definition.alphaPath).metadata();
  const column = index % definition.columns;
  const row = Math.floor(index / definition.columns);
  if (row >= definition.rows) throw new Error(`Invalid ${sheetId} cell: ${index}`);

  const leftBoundary = Math.floor((column * metadata.width) / definition.columns);
  const rightBoundary = Math.floor(
    ((column + 1) * metadata.width) / definition.columns,
  );
  const topBoundary = Math.floor((row * metadata.height) / definition.rows);
  const bottomBoundary = Math.floor(
    ((row + 1) * metadata.height) / definition.rows,
  );
  const inset = 2;
  const cell = await sharp(definition.alphaPath)
    .extract({
      height: bottomBoundary - topBoundary - inset * 2,
      left: leftBoundary + inset,
      top: topBoundary + inset,
      width: rightBoundary - leftBoundary - inset * 2,
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
  let opaqueBorderPixels = 0;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (x >= 2 && x < info.width - 2 && y >= 2 && y < info.height - 2) {
        continue;
      }
      if (data[(y * info.width + x) * info.channels + 3] > 16) {
        opaqueBorderPixels += 1;
      }
    }
  }
  if (opaqueBorderPixels > 512) {
    throw new Error(
      `${sheetId} cell ${index} touches its crop border (${opaqueBorderPixels} pixels)`,
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
  let chromaGreen = 0;
  let chromaMagenta = 0;
  for (let offset = 0; offset < data.length; offset += info.channels) {
    if (data[offset + 3] <= 32) continue;
    visible += 1;
    if (
      data[offset + 3] >= 246 &&
      data[offset] <= 8 &&
      data[offset + 1] <= 8 &&
      data[offset + 2] <= 8
    ) {
      black += 1;
    }
    if (
      data[offset + 1] >= 190 &&
      data[offset] <= 60 &&
      data[offset + 2] <= 60 &&
      data[offset + 1] - Math.max(data[offset], data[offset + 2]) >= 100
    ) {
      chromaGreen += 1;
    }
    if (
      data[offset] >= 140 &&
      data[offset + 2] >= 105 &&
      data[offset + 1] <= 90 &&
      Math.min(data[offset], data[offset + 2]) - data[offset + 1] >= 55
    ) {
      chromaMagenta += 1;
    }
  }
  if (visible === 0) throw new Error(`${sceneId}/${assetName} is empty`);
  if (black / (info.width * info.height) > 0.12) {
    throw new Error(`${sceneId}/${assetName} retains an opaque black matte`);
  }
  if (chromaGreen / visible > 0.002) {
    throw new Error(`${sceneId}/${assetName} retains chroma-green pixels`);
  }
  if (chromaMagenta / visible > 0.002) {
    throw new Error(`${sceneId}/${assetName} retains chroma-magenta pixels`);
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
      fileName: 'meet-the-puppy.png',
      parts: [['meet-the-puppy/puppy-wagging', 135, 155, 750, 750]],
      colors: ['#FFF3D2', '#FFD6B4', '#D98955'],
    },
    {
      fileName: 'fill-the-bowl.png',
      parts: [
        ['fill-the-bowl/bowl-ready', 165, 285, 690, 570],
        ['fill-the-bowl/food-scoop', 585, 120, 280, 300],
      ],
      colors: ['#E5FAFF', '#BFE9F3', '#3E9CBD'],
    },
    {
      fileName: 'puppy-eats.png',
      parts: [['puppy-eats/puppy-eating', 115, 235, 795, 650]],
      colors: ['#EAF8DE', '#CDEBB8', '#70AA62'],
    },
    {
      fileName: 'milestone-feed-the-puppy.png',
      parts: [
        ['puppy-eats/puppy-happy', 110, 210, 690, 690],
        ['puppy-eats/heart', 680, 120, 230, 230],
      ],
      colors: ['#FFF1D4', '#FFE0A8', '#E28D45'],
      star: true,
    },
    {
      fileName: 'theme-animal-friends.png',
      parts: [
        ['meet-the-puppy/puppy-wagging', 155, 205, 710, 710],
        ['puppy-eats/heart', 690, 120, 190, 190],
      ],
      colors: ['#EAF9F3', '#C9EEE2', '#439B86'],
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
