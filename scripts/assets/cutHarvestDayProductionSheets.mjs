import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

import sharp from 'sharp';

import { repoRoot, toMasterPath } from './config.mjs';

const force = process.argv.includes('--force');
const lessonId = 'harvest-day';
const sheetRoot = join(
  repoRoot,
  'src/assets/source/lessons/harvest-day/production-sheets',
);
const backgroundPath = join(
  repoRoot,
  'src/assets/source/master/lessons/garden-friends/flower-visitors/images/background.png',
);

const sheetDefinitions = {
  find: {
    alphaPath: join(sheetRoot, 'find-the-ripe-ones-alpha.png'),
    chromaPath: join(sheetRoot, 'find-the-ripe-ones-chroma.png'),
    columns: 4,
    rowBoundaries: [0, 341, 670, 1024],
  },
  pick: {
    alphaPath: join(sheetRoot, 'pick-gently-alpha.png'),
    chromaPath: join(sheetRoot, 'pick-gently-chroma.png'),
    columns: 4,
    rowBoundaries: [0, 346, 684, 1024],
    columnRowBoundaries: {
      0: [0, 346, 667, 1024],
      2: [0, 363, 684, 1024],
    },
  },
  sort: {
    alphaPath: join(sheetRoot, 'sort-the-harvest-alpha.png'),
    chromaPath: join(sheetRoot, 'sort-the-harvest-chroma.png'),
    columns: 4,
    rowBoundaries: [0, 256, 512, 768, 1024],
  },
};

if (!existsSync(backgroundPath)) {
  throw new Error(`Missing harvest-day background input: ${backgroundPath}`);
}
for (const definition of Object.values(sheetDefinitions)) {
  if (!existsSync(definition.chromaPath)) {
    throw new Error(`Missing harvest-day production input: ${definition.chromaPath}`);
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

for (const sceneId of [
  'find-the-ripe-ones',
  'pick-gently',
  'sort-the-harvest',
]) {
  await writeMaster(sceneId, 'background', backgroundBuffer);
}

await cutObjects('find-the-ripe-ones', 'find', [
  ['hero-plant', 0],
  ['ripe-tomato', 1],
  ['unripe-tomato', 2],
  ['observation-ring', 3],
  ['ripe-closeup', 4],
  ['leaf-cover-closed', 5],
  ['leaf-cover-lifted', 6],
  ['leave-unripe-action', 7],
  ['pull-unripe-action', 8],
  ['basket-empty', 9],
  ['eye-control', 10],
  ['success-sparkle', 11],
]);

await cutObjects('pick-gently', 'pick', [
  ['hero-plant', 0],
  ['ripe-tomato', 1],
  ['fruit-stem-closeup', 2],
  ['open-hand', 3],
  ['pick-action', 4],
  ['basket-empty', 5],
  ['basket-filled', 6],
  ['open-hand-control', 7],
  ['success-sparkle', 9],
]);

await cutObjects('sort-the-harvest', 'sort', [
  ['vegetable-group', 0],
  ['herb-bunch', 1],
  ['ripe-tomato', 2],
  ['bruised-tomato', 3],
  ['vegetable-basket-empty', 4],
  ['vegetable-basket-filled', 5],
  ['herb-basket-empty', 6],
  ['herb-basket-filled', 7],
  ['tomato-basket-empty', 8],
  ['tomato-basket-filled', 9],
  ['adult-check-tray-empty', 10],
  ['adult-check-tray-filled', 11],
  ['sort-by-type-action', 12],
  ['mixed-basket-action', 13],
  ['sorted-baskets', 14],
  ['success-sparkle', 15],
]);

await generateMapIcons();

console.log(`Harvest-day production masters written: ${written}`);
console.log(`Skipped existing outputs             : ${skipped}`);

async function writeAlphaSheet(definition) {
  if (existsSync(definition.alphaPath) && !force) {
    return;
  }
  const buffer = await removeMagenta(definition.chromaPath);
  await sharp(buffer).png().toFile(definition.alphaPath);
}

async function cutObjects(sceneId, sheetId, specs) {
  for (const [assetName, cellIndex] of specs) {
    const buffer = await normalizeObject(await getCell(sheetId, cellIndex));
    await assertNoOpaqueBlackMatte(buffer, sceneId, assetName);
    masterBuffers.set(`${sceneId}/${assetName}`, buffer);
    await writeMaster(sceneId, assetName, buffer);
  }
}

async function getCell(sheetId, index) {
  const cacheKey = `${sheetId}:${index}`;
  if (cellCache.has(cacheKey)) {
    return cellCache.get(cacheKey);
  }

  const definition = sheetDefinitions[sheetId];
  if (!definition) {
    throw new Error(`Unknown harvest-day sheet: ${sheetId}`);
  }

  const metadata = await sharp(definition.alphaPath).metadata();
  const { columns } = definition;
  const column = index % columns;
  const rowBoundaries =
    definition.columnRowBoundaries?.[column] ?? definition.rowBoundaries;
  const rows = rowBoundaries.length - 1;
  const row = Math.floor(index / columns);
  if (column < 0 || column >= columns || row < 0 || row >= rows) {
    throw new Error(`Invalid ${sheetId} sheet cell: ${index}`);
  }

  const cellWidth = Math.floor(metadata.width / columns);
  const inset = 3;
  const left = column * cellWidth + inset;
  const top = rowBoundaries[row] + inset;
  const right =
    column === columns - 1 ? metadata.width : (column + 1) * cellWidth;
  const bottom = rowBoundaries[row + 1];
  const cell = await sharp(definition.alphaPath)
    .extract({
      height: bottom - top - inset,
      left,
      top,
      width: right - left - inset,
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
  const borderWidth = 2;
  let opaqueBorderPixels = 0;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (
        x >= borderWidth &&
        x < info.width - borderWidth &&
        y >= borderWidth &&
        y < info.height - borderWidth
      ) {
        continue;
      }
      const alpha = data[(y * info.width + x) * info.channels + 3];
      if (alpha > 16) {
        opaqueBorderPixels += 1;
      }
    }
  }

  if (opaqueBorderPixels > 64) {
    throw new Error(
      `${sheetId} sheet cell ${index} touches its crop border ` +
        `(${opaqueBorderPixels} opaque pixels)`,
    );
  }
}

async function removeMagenta(path) {
  const { data, info } = await sharp(path)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let offset = 0; offset < data.length; offset += info.channels) {
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const chromaDistance = Math.max(
      Math.abs(red - 235),
      Math.abs(green - 25),
      Math.abs(blue - 220),
    );
    const magentaDominance = Math.min(red, blue) - green;

    if (
      red >= 110 &&
      blue >= 85 &&
      green <= 130 &&
      Math.abs(red - blue) <= 75 &&
      magentaDominance >= 32
    ) {
      const keyStrength =
        chromaDistance <= 26
          ? 1
          : Math.min(1, Math.max(0, (magentaDominance - 32) / 55));
      const residualAlpha = 1 - keyStrength;
      data[offset + 3] = Math.round(
        data[offset + 3] * residualAlpha * residualAlpha,
      );

      if (keyStrength > 0.1 && data[offset + 3] > 8) {
        const neutralEdge = Math.min(255, Math.round(green * 1.08));
        if (red > blue * 1.15) {
          data[offset + 2] = Math.min(blue, neutralEdge);
        } else if (blue > red * 1.15) {
          data[offset] = Math.min(red, neutralEdge);
        } else {
          data[offset] = Math.min(red, neutralEdge);
          data[offset + 2] = Math.min(blue, neutralEdge);
        }
      }
    }
    if (data[offset + 3] <= 8) {
      data[offset] = 0;
      data[offset + 1] = 0;
      data[offset + 2] = 0;
      data[offset + 3] = 0;
    }
  }

  return sharp(data, {
    raw: {
      channels: info.channels,
      height: info.height,
      width: info.width,
    },
  })
    .png()
    .toBuffer();
}

async function normalizeObject(source) {
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const insetAlpha = await sharp(source)
    .extractChannel('alpha')
    .erode(2)
    .raw()
    .toBuffer();

  for (let offset = 0, pixel = 0; offset < data.length; offset += 4, pixel += 1) {
    data[offset + 3] = insetAlpha[pixel];
    if (data[offset + 3] <= 8) {
      data[offset] = 0;
      data[offset + 1] = 0;
      data[offset + 2] = 0;
      data[offset + 3] = 0;
    }
  }

  const cleanSource = await sharp(data, {
    raw: {
      channels: info.channels,
      height: info.height,
      width: info.width,
    },
  })
    .png()
    .toBuffer();

  return sharp(cleanSource)
    .trim({ background: { alpha: 0, b: 0, g: 0, r: 0 }, threshold: 10 })
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

async function assertNoOpaqueBlackMatte(buffer, sceneId, assetName) {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let opaqueBlackPixels = 0;

  for (let offset = 0; offset < data.length; offset += info.channels) {
    if (
      data[offset + 3] >= 246 &&
      data[offset] <= 8 &&
      data[offset + 1] <= 8 &&
      data[offset + 2] <= 8
    ) {
      opaqueBlackPixels += 1;
    }
  }

  const ratio = opaqueBlackPixels / (info.width * info.height);
  if (ratio > 0.12) {
    throw new Error(
      `${sceneId}/${assetName} retains an opaque black matte ` +
        `(${(ratio * 100).toFixed(1)}% of its canvas)`,
    );
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
      fileName: 'find-the-ripe-ones.png',
      parts: [
        ['find-the-ripe-ones/hero-plant', 105, 260, 650, 650],
        ['find-the-ripe-ones/ripe-tomato', 570, 250, 330, 330],
      ],
    },
    {
      fileName: 'pick-gently.png',
      parts: [
        ['pick-gently/pick-action', 80, 220, 680, 680],
        ['pick-gently/basket-empty', 590, 500, 310, 310],
      ],
    },
    {
      fileName: 'sort-the-harvest.png',
      parts: [['sort-the-harvest/sorted-baskets', 115, 280, 790, 540]],
    },
    {
      fileName: 'milestone-harvest-day.png',
      parts: [
        ['sort-the-harvest/sorted-baskets', 115, 280, 790, 540],
        ['find-the-ripe-ones/ripe-tomato', 610, 135, 260, 260],
      ],
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
    const base = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><defs><radialGradient id="bg"><stop stop-color="#FFF9DF"/><stop offset="1" stop-color="#CDEFD8"/></radialGradient></defs><circle cx="512" cy="512" r="478" fill="url(#bg)" stroke="#6DB883" stroke-width="28"/></svg>',
    );
    const composites = [];
    for (const [key, left, top, width, height] of spec.parts) {
      const source = masterBuffers.get(key);
      if (!source) {
        throw new Error(`Missing icon source buffer: ${key}`);
      }
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
          '<svg xmlns="http://www.w3.org/2000/svg" width="230" height="230" viewBox="0 0 230 230"><path d="M115 10l28 64 70 7-53 46 16 69-61-36-61 36 16-69-53-46 70-7z" fill="#FFD154" stroke="#E29A36" stroke-width="10"/></svg>',
        ),
        left: 730,
        top: 80,
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
