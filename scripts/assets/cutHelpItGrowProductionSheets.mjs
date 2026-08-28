import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

import sharp from 'sharp';

import { repoRoot, toMasterPath } from './config.mjs';

const force = process.argv.includes('--force');
const lessonId = 'help-it-grow';
const sheetRoot = join(
  repoRoot,
  'src/assets/source/lessons/help-it-grow/production-sheets',
);
const pilotMasterRoot = join(
  repoRoot,
  'src/assets/source/master/lessons/plant-a-seed/first-watering/images',
);

const sources = {
  background: join(pilotMasterRoot, 'background.png'),
  newLeaf: join(sheetRoot, 'new-leaf-and-sunlight-alpha.png'),
  rain: join(sheetRoot, 'rainy-day-care-alpha.png'),
  timeCue: join(pilotMasterRoot, 'time-cue.png'),
  wateringCan: join(pilotMasterRoot, 'watering-can.png'),
  wind: join(sheetRoot, 'wind-and-support-alpha.png'),
};

for (const requiredPath of Object.values(sources)) {
  if (!existsSync(requiredPath)) {
    throw new Error(`Missing help-it-grow production input: ${requiredPath}`);
  }
}

const sheetDefinitions = {
  newLeaf: {
    columns: 4,
    path: sources.newLeaf,
    quarterRows: 2,
    rowBounds: [0, 400, 690, 1086],
  },
  rain: {
    columns: 4,
    path: sources.rain,
    quarterRows: 2,
    rowBounds: [0, 400, 650, 1086],
  },
  wind: {
    columns: 4,
    path: sources.wind,
    quarterRows: 3,
    rowBounds: [0, 280, 540, 710, 1024],
  },
};
const cellCache = new Map();
const masterBuffers = new Map();
let skipped = 0;
let written = 0;

const backgroundBuffer = await sharp(sources.background)
  .resize(941, 1672, { fit: 'cover', position: 'centre' })
  .removeAlpha()
  .png()
  .toBuffer();

for (const sceneId of [
  'new-leaf-and-sunlight',
  'rainy-day-care',
  'wind-and-support',
]) {
  await writeMaster(sceneId, 'background', backgroundBuffer);
}

await cutObjects('new-leaf-and-sunlight', 'newLeaf', [
  ['plant-drooping', 0],
  ['plant-perked', 1],
  ['plant-new-leaf', 2],
  ['leaf', 4],
  ['shade-control', 5],
  ['sunlight', 6],
  ['shade', 7],
  ['move-sunlight-action', 8],
  ['stay-shade-action', 9],
]);
await writeSunlitPlantVariant();
await copySharedMaster('new-leaf-and-sunlight', 'watering-can');
await copySharedMaster('new-leaf-and-sunlight', 'time-cue');

await cutObjects('rainy-day-care', 'rain', [
  ['plant-rain-wet', 0],
  ['plant-sheltered', 1],
  ['cloud-gray', 2],
  ['rain', 3],
  ['soil-wet', 4],
  ['soil-checked-wet', 5],
  ['root-window-control', 6],
  ['roots', 7],
  ['check-soil-action', 8],
  ['pour-water-action', 9],
]);

await cutObjects('wind-and-support', 'wind', [
  ['plant-swaying', 0],
  ['plant-leaning', 1],
  ['plant-staked', 2],
  ['plant-supported', 3],
  ['plant-flower-bud', 4],
  ['wind', 5],
  ['stem', 6],
  ['support-stick', 7],
  ['installed-stake', 8],
  ['stake', 9],
  ['soft-tie', 10],
  ['installed-tie', 11],
  ['support-stem-action', 12],
  ['leave-leaning-action', 13],
]);
await copySharedMaster('wind-and-support', 'time-cue');

await generateMapIcons();

console.log(`Help-it-grow production masters written: ${written}`);
console.log(`Skipped existing outputs               : ${skipped}`);

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
    throw new Error(`Unknown help-it-grow sheet: ${sheetId}`);
  }

  const metadata = await sharp(definition.path).metadata();
  const quarterCount = definition.columns * definition.quarterRows;
  const isAction = index >= quarterCount;
  const rows = definition.rowBounds.length - 1;
  let column;
  let columns;
  let row;

  if (isAction) {
    columns = 2;
    column = index - quarterCount;
    row = rows - 1;
  } else {
    columns = definition.columns;
    column = index % definition.columns;
    row = Math.floor(index / definition.columns);
  }

  if (column < 0 || column >= columns || row >= rows) {
    throw new Error(`Invalid ${sheetId} sheet cell: ${index}`);
  }

  const cellWidth = Math.floor(metadata.width / columns);
  const inset = 5;
  const left = column * cellWidth + inset;
  const top = definition.rowBounds[row] + inset;
  const right =
    column === columns - 1 ? metadata.width : (column + 1) * cellWidth;
  const bottom = definition.rowBounds[row + 1] ?? metadata.height;
  const cell = await sharp(definition.path)
    .extract({
      height: bottom - top - inset,
      left,
      top,
      width: right - left - inset,
    })
    .png()
    .toBuffer();
  cellCache.set(cacheKey, cell);
  return cell;
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

async function copySharedMaster(sceneId, assetName) {
  const sourcePath = sources[assetName === 'time-cue' ? 'timeCue' : 'wateringCan'];
  const buffer = await sharp(sourcePath).png().toBuffer();
  masterBuffers.set(`${sceneId}/${assetName}`, buffer);
  await writeMaster(sceneId, assetName, buffer);
}

async function writeSunlitPlantVariant() {
  const source = masterBuffers.get('new-leaf-and-sunlight/plant-new-leaf');
  if (!source) {
    throw new Error('Missing plant-new-leaf source for sunlit variant');
  }
  const buffer = await sharp(source)
    .modulate({ brightness: 1.08, saturation: 1.1 })
    .png()
    .toBuffer();
  masterBuffers.set('new-leaf-and-sunlight/plant-sunlit', buffer);
  await writeMaster('new-leaf-and-sunlight', 'plant-sunlit', buffer);
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
      fileName: 'new-leaf-sunlight.png',
      parts: [
        ['new-leaf-and-sunlight/plant-new-leaf', 170, 280, 650, 650],
        ['new-leaf-and-sunlight/sunlight', 620, 120, 260, 260],
      ],
    },
    {
      fileName: 'rainy-day-care.png',
      parts: [
        ['rainy-day-care/plant-rain-wet', 150, 310, 650, 650],
        ['rainy-day-care/rain', 625, 120, 250, 250],
      ],
    },
    {
      fileName: 'wind-and-support.png',
      parts: [
        ['wind-and-support/plant-supported', 160, 300, 650, 650],
        ['wind-and-support/wind', 590, 115, 300, 300],
      ],
    },
    {
      fileName: 'milestone-help-it-grow.png',
      parts: [
        ['wind-and-support/plant-flower-bud', 170, 280, 650, 650],
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
