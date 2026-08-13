import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

import sharp from 'sharp';

import { repoRoot, toMasterPath } from './config.mjs';

const force = process.argv.includes('--force');
const lessonId = 'plant-a-seed';
const sheetRoot = join(
  repoRoot,
  'src/assets/source/lessons/plant-a-seed/production-sheets',
);
const approvedPotMaster = join(
  repoRoot,
  'src/assets/source/master/lessons/plant-a-seed/shared/images/pot-empty.png',
);

const sheets = {
  actions: join(sheetRoot, 'action-objects-chroma.png'),
  background: join(sheetRoot, 'background-base.png'),
  logicFixes: join(sheetRoot, 'logic-fixes-chroma.png'),
  plant: join(sheetRoot, 'plant-objects-chroma.png'),
  prepare: join(sheetRoot, 'prepare-objects-chroma.png'),
  watering: join(sheetRoot, 'watering-objects-chroma.png'),
};

for (const requiredPath of [...Object.values(sheets), approvedPotMaster]) {
  if (!existsSync(requiredPath)) {
    throw new Error(`Missing plant-a-seed production input: ${requiredPath}`);
  }
}

const cellCache = new Map();
const masterBuffers = new Map();
let written = 0;
let skipped = 0;

const backgroundBuffer = await sharp(sheets.background)
  .resize(941, 1672, { fit: 'cover', position: 'centre' })
  .removeAlpha()
  .png()
  .toBuffer();

for (const sceneId of [
  'prepare-the-pot',
  'plant-the-seed',
  'first-watering',
]) {
  await writeMaster(sceneId, 'background', backgroundBuffer);
}

await cutObjects('prepare-the-pot', 'prepare', [
  ['soil', 0],
  ['scoop-empty', 1],
  ['scoop-filled', 2],
  ['drainage-hole', 3],
  ['potting-mix', 4],
]);
await cutObjects('prepare-the-pot', 'logicFixes', [['potting-mix-v2', 0]]);

await cutObjects('prepare-the-pot', 'actions', [
  ['fill-pot-soil', 0],
  ['leave-space', 1],
]);

await cutObjects('plant-the-seed', 'plant', [
  ['seed-packet', 0],
  ['seed', 1],
  ['finger', 2],
  ['hole', 3],
  ['cover-soil', 4],
  ['plant-label', 5],
  ['planted-label', 6],
]);

await cutObjects('plant-the-seed', 'actions', [
  ['plant-seed', 2],
  ['cover-seed', 3],
]);
await cutObjects('plant-the-seed', 'logicFixes', [['cover-seed-v2', 1]]);

await cutObjects('first-watering', 'watering', [
  ['water', 0],
  ['watering-can', 1],
  ['damp', 2],
  ['sprout', 3],
  ['time-cue', 4],
  ['spout', 5],
  ['puddle', 7],
]);
await writeNoPuddleIcon();

await cutObjects('first-watering', 'actions', [
  ['water-gently', 4],
  ['wait-sprout', 5],
]);

const emptyPotBuffer = await sharp(approvedPotMaster).png().toBuffer();
masterBuffers.set('prepare-the-pot/plant-pot-empty', emptyPotBuffer);
await writeMaster('prepare-the-pot', 'plant-pot-empty', emptyPotBuffer);
await writePotVariant('prepare-the-pot', 'plant-pot-soil-low', {
  height: 88,
  source: await getCell('prepare', 0),
  top: 393,
  width: 470,
});
await writePotVariant('prepare-the-pot', 'plant-pot-soil-ready', {
  height: 132,
  source: await getCell('prepare', 0),
  top: 365,
  width: 570,
});

await writePotVariant('plant-the-seed', 'pot-soil-flat', {
  height: 132,
  source: await getCell('prepare', 0),
  top: 365,
  width: 570,
});
await writePotVariant('plant-the-seed', 'pot-hole-open', {
  height: 138,
  source: await getCell('plant', 3),
  top: 361,
  width: 580,
});
await writePotVariant('plant-the-seed', 'pot-seed-visible', {
  height: 138,
  seed: await getCell('plant', 1),
  source: await getCell('plant', 3),
  top: 361,
  width: 580,
});
await writePotVariant('plant-the-seed', 'pot-seed-covered', {
  height: 132,
  source: await getCell('plant', 4),
  top: 365,
  width: 570,
});

await writePotVariant('first-watering', 'pot-dry', {
  height: 132,
  source: await getCell('plant', 4),
  top: 365,
  width: 570,
});
await writePotVariant('first-watering', 'pot-damp', {
  height: 132,
  source: await getCell('watering', 2),
  top: 365,
  width: 570,
});

await generateMapIcons();

console.log(`Plant-a-seed production masters written: ${written}`);
console.log(`Skipped existing outputs              : ${skipped}`);

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

  const definitions = {
    actions: {
      columns: 3,
      inset: 4,
      path: sheets.actions,
      regions: {
        4: { bottom: 1020, left: 516, right: 944, top: 516 },
        5: { bottom: 1020, left: 950, right: 1532, top: 516 },
      },
      rows: 2,
    },
    logicFixes: {
      columns: 2,
      inset: 6,
      path: sheets.logicFixes,
      rows: 1,
    },
    plant: { columns: 3, inset: 4, path: sheets.plant, rows: 3 },
    prepare: { columns: 4, inset: 18, path: sheets.prepare, rows: 2 },
    watering: { columns: 4, inset: 7, path: sheets.watering, rows: 3 },
  };
  const definition = definitions[sheetId];
  if (!definition || index < 0 || index >= definition.columns * definition.rows) {
    throw new Error(`Invalid ${sheetId} sheet cell: ${index}`);
  }

  const metadata = await sharp(definition.path).metadata();
  const customRegion = definition.regions?.[index];
  if (customRegion) {
    const keyed = await removeMagenta(
      definition.path,
      customRegion.left,
      customRegion.top,
      customRegion.right - customRegion.left,
      customRegion.bottom - customRegion.top,
    );
    cellCache.set(cacheKey, keyed);
    return keyed;
  }
  const column = index % definition.columns;
  const row = Math.floor(index / definition.columns);
  const cellWidth = Math.floor(metadata.width / definition.columns);
  const cellHeight = Math.floor(metadata.height / definition.rows);
  const left = column * cellWidth + definition.inset;
  const top = row * cellHeight + definition.inset;
  const right =
    column === definition.columns - 1
      ? metadata.width
      : (column + 1) * cellWidth;
  const bottom =
    row === definition.rows - 1 ? metadata.height : (row + 1) * cellHeight;
  const keyed = await removeMagenta(
    definition.path,
    left,
    top,
    right - left - definition.inset,
    bottom - top - definition.inset,
  );
  cellCache.set(cacheKey, keyed);
  return keyed;
}

async function removeMagenta(path, left, top, width, height) {
  const { data, info } = await sharp(path)
    .extract({ height, left, top, width })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let offset = 0; offset < data.length; offset += info.channels) {
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const magentaFloor = Math.min(red, blue);
    const magentaDominance = magentaFloor - green;
    if (
      red >= 110 &&
      blue >= 75 &&
      magentaDominance >= 28
    ) {
      const keyStrength = Math.min(
        1,
        Math.max(0, (magentaDominance - 28) / 17),
      );
      data[offset + 3] = Math.round(data[offset + 3] * (1 - keyStrength));
    }
    if (red >= 90 && blue >= 55 && blue >= green * 1.15 && red >= green * 1.3) {
      data[offset + 2] = Math.min(blue, Math.round(green * 0.95));
    }
  }

  removeSmallAlphaComponents(data, info);

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

function removeSmallAlphaComponents(data, info) {
  const pixelCount = info.width * info.height;
  const visited = new Uint8Array(pixelCount);
  const components = [];
  const queue = new Int32Array(pixelCount);

  for (let start = 0; start < pixelCount; start += 1) {
    if (visited[start] || data[start * info.channels + 3] <= 32) {
      continue;
    }
    let head = 0;
    let tail = 1;
    queue[0] = start;
    visited[start] = 1;
    const component = [];

    while (head < tail) {
      const pixel = queue[head];
      head += 1;
      component.push(pixel);
      const x = pixel % info.width;
      const y = Math.floor(pixel / info.width);
      const neighbors = [
        x > 0 ? pixel - 1 : -1,
        x + 1 < info.width ? pixel + 1 : -1,
        y > 0 ? pixel - info.width : -1,
        y + 1 < info.height ? pixel + info.width : -1,
      ];
      for (const neighbor of neighbors) {
        if (
          neighbor >= 0 &&
          !visited[neighbor] &&
          data[neighbor * info.channels + 3] > 32
        ) {
          visited[neighbor] = 1;
          queue[tail] = neighbor;
          tail += 1;
        }
      }
    }
    components.push(component);
  }

  const largestSize = components.reduce(
    (largest, component) => Math.max(largest, component.length),
    0,
  );
  const minimumSize = Math.max(16, Math.round(largestSize * 0.002));
  for (const component of components) {
    if (component.length >= minimumSize) {
      continue;
    }
    for (const pixel of component) {
      data[pixel * info.channels + 3] = 0;
    }
  }
}

async function normalizeObject(source) {
  return sharp(source)
    .trim({ background: { alpha: 0, b: 0, g: 0, r: 0 }, threshold: 12 })
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

async function writeNoPuddleIcon() {
  const puddle = await normalizeObject(await getCell('watering', 7));
  const noMark = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><path d="M270 270L754 754M754 270L270 754" fill="none" stroke="#F04438" stroke-width="86" stroke-linecap="round"/><path d="M270 270L754 754M754 270L270 754" fill="none" stroke="#FFFFFF" stroke-width="22" stroke-linecap="round" opacity=".22"/></svg>',
  );
  const buffer = await sharp(puddle)
    .composite([{ input: noMark }])
    .png()
    .toBuffer();
  masterBuffers.set('first-watering/puddle-card', buffer);
  await writeMaster('first-watering', 'puddle-card', buffer);
}

async function writePotVariant(sceneId, assetName, options) {
  const left = Math.round((1254 - options.width) / 2);
  const soilSurface = await makeSoilSurface(
    options.source,
    options.width,
    options.height,
  );
  const composites = [{ input: soilSurface, left, top: options.top }];

  if (options.seed) {
    const seed = await sharp(options.seed)
      .trim({ background: { alpha: 0, b: 0, g: 0, r: 0 }, threshold: 8 })
      .resize(54, 70, { fit: 'contain' })
      .png()
      .toBuffer();
    composites.push({
      input: seed,
      left: Math.round((1254 - 54) / 2),
      top: options.top + Math.round((options.height - 70) / 2),
    });
  }

  const buffer = await sharp(approvedPotMaster, { limitInputPixels: false })
    .composite(composites)
    .png()
    .toBuffer();
  masterBuffers.set(`${sceneId}/${assetName}`, buffer);
  await writeMaster(sceneId, assetName, buffer);
}

async function makeSoilSurface(source, width, height) {
  const texture = await sharp(source)
    .trim({ background: { alpha: 0, b: 0, g: 0, r: 0 }, threshold: 8 })
    .resize(width, height, { fit: 'fill' })
    .flatten({ background: '#70452F' })
    .png()
    .toBuffer();
  const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><ellipse cx="${width / 2}" cy="${height / 2}" rx="${width / 2 - 2}" ry="${height / 2 - 2}" fill="#fff"/></svg>`);
  return sharp(texture)
    .ensureAlpha()
    .composite([{ blend: 'dest-in', input: mask }])
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
      fileName: 'theme-little-garden.png',
      parts: [
        ['prepare-the-pot/plant-pot-soil-ready', 225, 360, 575, 575],
        ['first-watering/sprout', 335, 120, 360, 360],
      ],
    },
    {
      fileName: 'prepare-the-pot.png',
      parts: [
        ['prepare-the-pot/plant-pot-empty', 185, 340, 620, 620],
        ['prepare-the-pot/scoop-empty', 520, 115, 390, 390],
      ],
    },
    {
      fileName: 'plant-the-seed.png',
      parts: [
        ['plant-the-seed/pot-soil-flat', 185, 340, 620, 620],
        ['plant-the-seed/seed', 405, 120, 245, 245],
      ],
    },
    {
      fileName: 'first-watering.png',
      parts: [
        ['first-watering/watering-can', 120, 290, 600, 600],
        ['first-watering/water', 650, 230, 235, 235],
      ],
    },
    {
      fileName: 'milestone-plant-a-seed.png',
      parts: [
        ['first-watering/pot-damp', 185, 370, 620, 620],
        ['first-watering/sprout', 330, 110, 370, 370],
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
    const base = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><defs><radialGradient id="bg"><stop stop-color="#FFF9DF"/><stop offset="1" stop-color="#CDEFD8"/></radialGradient></defs><circle cx="512" cy="512" r="478" fill="url(#bg)" stroke="#6DB883" stroke-width="28"/></svg>`);
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
        input: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="230" height="230" viewBox="0 0 230 230"><path d="M115 10l28 64 70 7-53 46 16 69-61-36-61 36 16-69-53-46 70-7z" fill="#FFD154" stroke="#E29A36" stroke-width="10"/></svg>'),
        left: 730,
        top: 80,
      });
    }
    const composed = await sharp(base)
      .composite(composites)
      .png()
      .toBuffer();
    await sharp(composed)
      .resize(320, 320)
      .png({ colors: 256, compressionLevel: 9, effort: 10, palette: true })
      .toFile(target);
    written += 1;
  }
}
