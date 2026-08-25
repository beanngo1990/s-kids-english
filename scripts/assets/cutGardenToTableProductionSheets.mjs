import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

import sharp from 'sharp';

import { repoRoot, toMasterPath } from './config.mjs';

const force = process.argv.includes('--force');
const lessonId = 'garden-to-table';
const sheetRoot = join(
  repoRoot,
  'src/assets/source/lessons/garden-to-table/production-sheets',
);
const backgroundPath = join(
  repoRoot,
  'src/assets/source/master/lessons/harvest-day/find-the-ripe-ones/images/background.png',
);

const sheetDefinitions = {
  rinse: sheet('rinse-and-drain'),
  make: sheet('make-and-share'),
  save: sheet('save-for-next-season'),
};

function sheet(name) {
  return {
    alphaPath: join(sheetRoot, `${name}-alpha.png`),
    chromaPath: join(sheetRoot, `${name}-chroma.png`),
    columns: 4,
    rowBoundaries: [0, 341, 682, 1024],
  };
}

if (!existsSync(backgroundPath)) {
  throw new Error(`Missing garden-to-table background input: ${backgroundPath}`);
}
for (const definition of Object.values(sheetDefinitions)) {
  if (!existsSync(definition.chromaPath)) {
    throw new Error(
      `Missing garden-to-table production input: ${definition.chromaPath}`,
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
  'rinse-and-drain',
  'make-and-share',
  'save-for-next-season',
]) {
  await writeMaster(sceneId, 'background', backgroundBuffer);
}

await cutObjects('rinse-and-drain', 'rinse', [
  ['cucumber-dirty', 0],
  ['cucumber-clean', 1],
  ['lettuce-dirty', 2],
  ['lettuce-clean', 3],
  ['water-control', 4],
  ['water-stream', 5],
  ['rinse-action', 6],
  ['colander-empty', 7],
  ['colander-filled', 8],
  ['rinse-well-action', 9],
  ['splash-only-action', 10],
  ['clean-produce-cue', 11],
]);

await cutObjects('make-and-share', 'make', [
  ['towel-folded', 0],
  ['towel-under-bowl', 1],
  ['bowl-empty', 2],
  ['bowl-lettuce', 3],
  ['bowl-prepared', 4],
  ['bowl-mixed', 5],
  ['bowl-shared', 6],
  ['lettuce-pieces', 7],
  ['cucumber-slices', 8],
  ['spoon', 9],
  ['salad-closeup', 10],
  ['share-action', 11],
]);

await cutObjects('save-for-next-season', 'save', [
  ['adult-hand-seed', 0],
  ['seed-closeup', 1],
  ['envelope-empty', 2],
  ['envelope-filled', 3],
  ['envelope-closed', 4],
  ['envelope-stored', 5],
  ['place-seed-control', 6],
  ['time-cue', 8],
  ['new-season-pot', 9],
  ['save-seeds-action', 10],
  ['plant-now-action', 11],
]);

await generateMapIcons();

console.log(`Garden-to-table production masters written: ${written}`);
console.log(`Skipped existing outputs                 : ${skipped}`);

async function writeAlphaSheet(definition) {
  if (existsSync(definition.alphaPath) && !force) return;
  await sharp(await removeMagenta(definition.chromaPath))
    .png()
    .toFile(definition.alphaPath);
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
  if (!definition) throw new Error(`Unknown garden-to-table sheet: ${sheetId}`);
  const metadata = await sharp(definition.alphaPath).metadata();
  const column = index % definition.columns;
  const row = Math.floor(index / definition.columns);
  if (column < 0 || column >= 4 || row < 0 || row >= 3) {
    throw new Error(`Invalid ${sheetId} sheet cell: ${index}`);
  }

  const cellWidth = Math.floor(metadata.width / definition.columns);
  // Keep a small safety gutter so antialiased pixels from a neighbouring cell
  // cannot become detached fragments after trimming and normalization.
  const inset = 10;
  const left = column * cellWidth + inset;
  const top = definition.rowBoundaries[row] + inset;
  const right = column === 3 ? metadata.width : (column + 1) * cellWidth;
  const bottom = definition.rowBoundaries[row + 1];
  const rawCell = await sharp(definition.alphaPath)
    .extract({
      height: bottom - top - inset,
      left,
      top,
      width: right - left - inset,
    })
    .png()
    .toBuffer();
  const cell = await removeBorderFragments(rawCell);
  await assertTransparentCellBorder(cell, sheetId, index);
  cellCache.set(cacheKey, cell);
  return cell;
}

async function removeBorderFragments(source) {
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixelCount = info.width * info.height;
  const visited = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  const components = [];

  for (let index = 0; index < pixelCount; index += 1) {
    if (visited[index] || data[index * info.channels + 3] <= 16) continue;
    let head = 0;
    let tail = 0;
    let touchesBorder = false;
    const pixels = [];
    queue[tail++] = index;
    visited[index] = 1;

    while (head < tail) {
      const current = queue[head++];
      pixels.push(current);
      const x = current % info.width;
      const y = Math.floor(current / info.width);
      if (x < 6 || x >= info.width - 6 || y < 6 || y >= info.height - 6) {
        touchesBorder = true;
      }
      const neighbors = [];
      if (x > 0) neighbors.push(current - 1);
      if (x + 1 < info.width) neighbors.push(current + 1);
      if (y > 0) neighbors.push(current - info.width);
      if (y + 1 < info.height) neighbors.push(current + info.width);
      for (const neighbor of neighbors) {
        if (!visited[neighbor] && data[neighbor * info.channels + 3] > 16) {
          visited[neighbor] = 1;
          queue[tail++] = neighbor;
        }
      }
    }
    components.push({ pixels, touchesBorder });
  }

  const largest = Math.max(0, ...components.map(item => item.pixels.length));
  for (const component of components) {
    if (!component.touchesBorder || component.pixels.length >= largest * 0.35) {
      continue;
    }
    for (const pixel of component.pixels) {
      const offset = pixel * info.channels;
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
  // A few semi-transparent antialiasing specks can remain on generated sheets;
  // an actual object crossing the boundary produces far more than this.
  if (opaqueBorderPixels > 512) {
    throw new Error(
      `${sheetId} cell ${index} touches its crop border (${opaqueBorderPixels} pixels)`,
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
    const dominance = magentaFloor - green;
    if (
      red >= 105 &&
      blue >= 80 &&
      green <= 145 &&
      Math.abs(red - blue) <= 90 &&
      dominance >= 28
    ) {
      const keyStrength = Math.min(1, Math.max(0, (dominance - 28) / 42));
      data[offset + 3] = Math.round(
        data[offset + 3] * (1 - keyStrength) * (1 - keyStrength),
      );
      if (keyStrength > 0.1 && data[offset + 3] > 8) {
        const neutralEdge = Math.min(255, Math.round(green * 1.08));
        data[offset] = Math.min(red, neutralEdge);
        data[offset + 2] = Math.min(blue, neutralEdge);
      }
    }
    // Translucent water can retain the magenta plate as a purple reflection.
    // Remove only the red cast so the intended blue/cyan water remains visible.
    if (
      data[offset + 3] > 8 &&
      data[offset] > 150 &&
      data[offset + 2] > 120 &&
      data[offset + 1] + 45 < Math.min(data[offset], data[offset + 2])
    ) {
      data[offset] = Math.min(data[offset], Math.round(data[offset + 1] * 1.12));
    }
    if (data[offset + 3] <= 8) {
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

async function normalizeObject(source) {
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const insetAlpha = await sharp(source)
    .extractChannel('alpha')
    .erode(1)
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
    raw: { channels: info.channels, height: info.height, width: info.width },
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

async function assertSafeCutout(buffer, sceneId, assetName) {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const cornerOffsets = [
    3,
    (info.width - 1) * info.channels + 3,
    (info.height - 1) * info.width * info.channels + 3,
    (info.height * info.width - 1) * info.channels + 3,
  ];
  if (cornerOffsets.some(offset => data[offset] > 8)) {
    throw new Error(`${sceneId}/${assetName} has an opaque corner`);
  }

  let opaqueBlackPixels = 0;
  let visiblePixels = 0;
  let magentaPixels = 0;
  for (let offset = 0; offset < data.length; offset += info.channels) {
    if (data[offset + 3] <= 32) continue;
    visiblePixels += 1;
    if (
      data[offset + 3] >= 246 &&
      data[offset] <= 8 &&
      data[offset + 1] <= 8 &&
      data[offset + 2] <= 8
    ) {
      opaqueBlackPixels += 1;
    }
    if (
      data[offset] > 150 &&
      data[offset + 2] > 120 &&
      data[offset + 1] + 45 < Math.min(data[offset], data[offset + 2])
    ) {
      magentaPixels += 1;
    }
  }
  if (visiblePixels === 0) throw new Error(`${sceneId}/${assetName} is empty`);
  if (opaqueBlackPixels / (info.width * info.height) > 0.12) {
    throw new Error(`${sceneId}/${assetName} retains an opaque black matte`);
  }
  if (magentaPixels / visiblePixels > 0.002) {
    throw new Error(`${sceneId}/${assetName} retains chroma-key pixels`);
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
      fileName: 'rinse-and-drain.png',
      parts: [
        ['rinse-and-drain/rinse-action', 80, 220, 690, 690],
        ['rinse-and-drain/colander-empty', 600, 520, 280, 280],
      ],
    },
    {
      fileName: 'make-and-share.png',
      parts: [
        ['make-and-share/bowl-mixed', 135, 260, 690, 690],
        ['make-and-share/spoon', 635, 130, 260, 320],
      ],
    },
    {
      fileName: 'save-for-next-season.png',
      parts: [
        ['save-for-next-season/save-seeds-action', 115, 235, 730, 680],
      ],
    },
    {
      fileName: 'milestone-garden-to-table.png',
      parts: [
        ['make-and-share/bowl-mixed', 120, 290, 600, 600],
        ['save-for-next-season/envelope-closed', 575, 325, 300, 300],
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
      if (!source) throw new Error(`Missing icon source buffer: ${key}`);
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
