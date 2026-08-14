import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

import sharp from 'sharp';

import { repoRoot, toMasterPath } from './config.mjs';

const force = process.argv.includes('--force');
const lessonId = 'garden-friends';
const sheetRoot = join(
  repoRoot,
  'src/assets/source/lessons/garden-friends/production-sheets',
);
const backgroundPath = join(
  repoRoot,
  'src/assets/source/master/lessons/help-it-grow/wind-and-support/images/background.png',
);

const sheetDefinitions = {
  flower: {
    alphaPath: join(sheetRoot, 'flower-visitors-alpha.png'),
    chromaPath: join(sheetRoot, 'flower-visitors-chroma.png'),
  },
  quiet: {
    alphaPath: join(sheetRoot, 'quiet-garden-watch-alpha.png'),
    chromaPath: join(sheetRoot, 'quiet-garden-watch-chroma.png'),
  },
  under: {
    alphaPath: join(sheetRoot, 'under-the-leaf-alpha.png'),
    chromaPath: join(sheetRoot, 'under-the-leaf-chroma.png'),
  },
};

if (!existsSync(backgroundPath)) {
  throw new Error(`Missing garden-friends background input: ${backgroundPath}`);
}
for (const definition of Object.values(sheetDefinitions)) {
  if (!existsSync(definition.chromaPath)) {
    throw new Error(
      `Missing garden-friends production input: ${definition.chromaPath}`,
    );
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
  'under-the-leaf',
  'flower-visitors',
  'quiet-garden-watch',
]) {
  await writeMaster(sceneId, 'background', backgroundBuffer);
}

await cutObjects('under-the-leaf', 'under', [
  ['hero-plant', 0],
  ['leaf-cover-closed', 1],
  ['leaf-cover-lifted', 2],
  ['leaf-cover-replaced', 3],
  ['earthworm', 4],
  ['snail', 5],
  ['observation-ring', 6],
  ['soil-patch', 7],
  ['tunnel', 8],
  ['look-under-leaf-action', 9],
  ['look-over-flower-action', 10],
]);

await cutObjects('flower-visitors', 'flower', [
  ['plant-flower', 0],
  ['plant-tiny-fruit', 1],
  ['flower', 2],
  ['bee', 3],
  ['butterfly', 4],
  ['observation-ring', 5],
  ['watch-control-low', 6],
  ['watch-control-high', 7],
  ['time-cue', 8],
]);

await cutObjects('quiet-garden-watch', 'quiet', [
  ['hero-plant', 0],
  ['leaf-tip', 1],
  ['leaf-tip-lifted', 2],
  ['caterpillar', 3],
  ['observation-ring', 4],
  ['birdbath-empty', 5],
  ['birdbath-filled', 6],
  ['water-drop', 7],
  ['quiet-hands-control', 8],
  ['garden-neighbors', 9],
  ['watch-gently-action', 10],
  ['wave-hands-action', 11],
]);

await generateMapIcons();

console.log(`Garden-friends production masters written: ${written}`);
console.log(`Skipped existing outputs                : ${skipped}`);

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
    throw new Error(`Unknown garden-friends sheet: ${sheetId}`);
  }

  const metadata = await sharp(definition.alphaPath).metadata();
  const columns = 4;
  const rows = 3;
  const column = index % columns;
  const row = Math.floor(index / columns);
  if (column < 0 || column >= columns || row < 0 || row >= rows) {
    throw new Error(`Invalid ${sheetId} sheet cell: ${index}`);
  }

  const cellWidth = Math.floor(metadata.width / columns);
  const inset = 5;
  const rowBoundaries = [
    0,
    Math.round(metadata.height * 0.38),
    Math.round(metadata.height * 0.665),
    metadata.height,
  ];
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
    const magentaFloor = Math.min(red, blue);
    const magentaDominance = magentaFloor - green;
    if (red >= 110 && blue >= 75 && magentaDominance >= 28) {
      const keyStrength = Math.min(
        1,
        Math.max(0, (magentaDominance - 28) / 17),
      );
      data[offset + 3] = Math.round(data[offset + 3] * (1 - keyStrength));
    }
    if (red >= 90 && blue >= 55 && blue >= green * 1.15 && red >= green * 1.3) {
      data[offset + 2] = Math.min(blue, Math.round(green * 0.95));
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
  return sharp(source)
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
      fileName: 'under-the-leaf.png',
      parts: [
        ['under-the-leaf/leaf-cover-lifted', 105, 235, 650, 650],
        ['under-the-leaf/earthworm', 555, 500, 320, 320],
      ],
    },
    {
      fileName: 'flower-visitors.png',
      parts: [
        ['flower-visitors/plant-flower', 145, 280, 650, 650],
        ['flower-visitors/bee', 600, 165, 300, 300],
      ],
    },
    {
      fileName: 'quiet-garden-watch.png',
      parts: [
        ['quiet-garden-watch/leaf-tip', 150, 310, 610, 610],
        ['quiet-garden-watch/caterpillar', 530, 250, 365, 365],
      ],
    },
    {
      fileName: 'milestone-garden-friends.png',
      parts: [
        ['flower-visitors/flower', 170, 280, 650, 650],
        ['flower-visitors/butterfly', 570, 170, 320, 320],
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
