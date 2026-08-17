import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import sharp from 'sharp';

import { repoRoot, toMasterPath } from './config.mjs';

const force = process.argv.includes('--force');
const lessonId = 'care-for-the-rabbit';
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

mkdirSync(sheetRoot, { recursive: true });

// Copy artifacts if available
const artifactDir = '/Users/sangngo/.gemini/antigravity-ide/brain/bbacb931-9a54-4851-a39f-c63efb629450';
const rawFiles = {
  hay: join(artifactDir, 'rabbit_scene1_sheet_1786939392000.jpg'),
  water: join(artifactDir, 'rabbit_scene2_sheet_1786939582112.jpg'),
  snack: join(artifactDir, 'rabbit_scene3_sheet_1786939914019.jpg'),
};

const sheets = {
  hay: {
    sourcePath: join(sheetRoot, 'prepare-the-hay-chroma.png'),
    alphaPath: join(sheetRoot, 'prepare-the-hay-alpha.png'),
  },
  water: {
    sourcePath: join(sheetRoot, 'fill-the-water-chroma.png'),
    alphaPath: join(sheetRoot, 'fill-the-water-alpha.png'),
  },
  snack: {
    sourcePath: join(sheetRoot, 'rabbit-snack-and-hop-chroma.png'),
    alphaPath: join(sheetRoot, 'rabbit-snack-and-hop-alpha.png'),
  },
};

for (const [key, artifactPath] of Object.entries(rawFiles)) {
  const destPath = sheets[key].sourcePath;
  if (existsSync(artifactPath) && (!existsSync(destPath) || force)) {
    const buffer = await sharp(artifactPath).png().toBuffer();
    writeFileSync(destPath, buffer);
  }
}

if (!existsSync(backgroundPath)) {
  throw new Error(`Missing shared animal-room background: ${backgroundPath}`);
}

for (const definition of Object.values(sheets)) {
  if (!existsSync(definition.sourcePath)) {
    throw new Error(`Missing production sheet: ${definition.sourcePath}`);
  }
  if (!existsSync(definition.alphaPath) || force) {
    await removeChromaMagenta(definition.sourcePath, definition.alphaPath);
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
  'prepare-the-hay',
  'fill-the-water',
  'rabbit-snack-and-hop',
]) {
  await writeMaster(sceneId, 'background', backgroundBuffer);
}

// Scene 1: prepare-the-hay
await cutObjects('prepare-the-hay', 'hay', [
  ['rabbit-sitting', 0],
  ['rabbit-looking-rack', 1],
  ['rabbit-chewing-hay', 2],
  ['rabbit-standing-calm', 3],
  ['hay-bundle', 4],
  ['hay-rack-empty', 5],
  ['hay-rack-full', 6],
  ['rabbit-hutch', 7],
  ['rabbit-chewing-closeup', 8],
  ['fresh-hay-pile', 9],
  ['fill-hay-rack-action', 10],
]);

// Scene 2: fill-the-water
await cutObjects('fill-the-water', 'water', [
  ['rabbit-thirsty', 0],
  ['rabbit-drinking-water', 1],
  ['rabbit-refreshed', 2],
  ['water-pitcher', 3],
  ['bowl-empty', 4],
  ['bowl-filled', 5],
  ['drink-water-action', 6],
  ['clean-water-stream', 7],
  ['put-bowl-down-action', 8],
]);

// Scene 3: rabbit-snack-and-hop
await cutObjects('rabbit-snack-and-hop', 'snack', [
  ['rabbit-curious', 0],
  ['rabbit-nibbling-carrot', 1],
  ['rabbit-pet-soft', 2],
  ['rabbit-happy', 3],
  ['rabbit-hopping-binky', 4],
  ['carrot-slice', 5],
  ['carrot-offered', 6],
  ['carrot-crumb', 7],
  ['treat-plate', 8],
  ['rabbit-ears-closeup', 9],
  ['soft-rabbit-fur', 10],
]);

// Extra mapped cue assets for scene 3
const hopActionBuf = masterBuffers.get('rabbit-snack-and-hop/rabbit-hopping-binky');
if (hopActionBuf) {
  await writeMaster('rabbit-snack-and-hop', 'rabbit-hop-action', hopActionBuf);
}
const petGentlyBuf = masterBuffers.get('rabbit-snack-and-hop/rabbit-pet-soft');
if (petGentlyBuf) {
  await writeMaster('rabbit-snack-and-hop', 'pet-rabbit-gently', petGentlyBuf);
}
const feedActionBuf = masterBuffers.get('rabbit-snack-and-hop/rabbit-nibbling-carrot');
if (feedActionBuf) {
  await writeMaster('rabbit-snack-and-hop', 'feed-rabbit-action', feedActionBuf);
}

await generateMapIcons();

console.log(`Care-for-the-rabbit production masters written: ${written}`);
console.log(`Skipped existing outputs                      : ${skipped}`);

async function removeChromaMagenta(sourcePath, targetPath) {
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

  const isMagenta = index => {
    const offset = index * info.channels;
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    return (
      red >= 150 &&
      blue >= 120 &&
      green <= 85 &&
      Math.min(red, blue) - green >= 60
    );
  };

  // Mark all magenta pixels across the entire sheet (including enclosed holes like pitcher handles)
  for (let index = 0; index < pixelCount; index += 1) {
    if (isMagenta(index)) {
      background[index] = 1;
    }
  }

  // 8 passes of boundary expansion for anti-aliased fringe around all background edges
  for (let pass = 0; pass < 8; pass += 1) {
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
        green <= 115 &&
        red >= 120 &&
        blue >= 80 &&
        Math.min(red, blue) - green >= 25
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
    const isBg = background[index] === 1;

    rgba[targetOffset] = isBg ? 0 : red;
    rgba[targetOffset + 1] = isBg ? 0 : green;
    rgba[targetOffset + 2] = isBg ? 0 : blue;
    rgba[targetOffset + 3] = isBg ? 0 : 255;
  }

  await sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(targetPath);
}

async function cutObjects(sceneId, sheetId, specs) {
  for (const [assetName, cellOrSeeds] of specs) {
    const buffer = typeof cellOrSeeds === 'number'
      ? await extractCellComponents(sheetId, cellOrSeeds)
      : await extractSeededComponents(sheetId, cellOrSeeds);
    await assertSafeCutout(buffer, sceneId, assetName);
    masterBuffers.set(`${sceneId}/${assetName}`, buffer);
    await writeMaster(sceneId, assetName, buffer);
  }
}

async function extractCellComponents(sheetId, cellIndex) {
  const sheet = await loadSheet(sheetId);
  const columns = 4;
  const rows = 3;
  const col = cellIndex % columns;
  const row = Math.floor(cellIndex / columns);
  const minCellX = (col / columns) * sheet.info.width;
  const maxCellX = ((col + 1) / columns) * sheet.info.width;
  const minCellY = (row / rows) * sheet.info.height;
  const maxCellY = ((row + 1) / rows) * sheet.info.height;

  const meaningful = [];
  for (const component of sheet.components) {
    if (component.size < 50) continue;
    const centerX = (component.minX + component.maxX) / 2;
    const centerY = (component.minY + component.maxY) / 2;
    if (
      centerX >= minCellX - 10 &&
      centerX <= maxCellX + 10 &&
      centerY >= minCellY - 10 &&
      centerY <= maxCellY + 10
    ) {
      meaningful.push(component.id);
    }
  }

  if (meaningful.length === 0) {
    throw new Error(`No meaningful component in ${sheetId} cell ${cellIndex}`);
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

async function loadSheet(sheetId) {
  if (sheetCache.has(sheetId)) return sheetCache.get(sheetId);
  const definition = sheets[sheetId];
  if (!definition) throw new Error(`Unknown sheet: ${sheetId}`);
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
  for (let radius = 4; radius <= 160; radius += 4) {
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
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const alpha = data[(y * info.width + x) * info.channels + 3];
      if (alpha > 32) visible += 1;
    }
  }
  if (visible < 200) {
    throw new Error(`Cutout ${sceneId}/${assetName} has too few visible pixels: ${visible}`);
  }
}

async function writeMaster(sceneId, assetName, buffer) {
  const runtimeSource = `lessons/${lessonId}/${sceneId}/images/${assetName}.webp`;
  const masterPath = toMasterPath(runtimeSource);
  mkdirSync(dirname(masterPath), { recursive: true });
  if (existsSync(masterPath) && !force) {
    const current = readFileSync(masterPath);
    if (current.equals(buffer)) {
      skipped += 1;
      return;
    }
  }
  writeFileSync(masterPath, buffer);
  written += 1;
}

async function generateMapIcons() {
  const iconDefinitions = [
    {
      fileName: 'prepare-the-hay.png',
      sceneId: 'prepare-the-hay',
      assetName: 'hay-bundle',
    },
    {
      fileName: 'fill-the-water.png',
      sceneId: 'fill-the-water',
      assetName: 'water-pitcher',
    },
    {
      fileName: 'rabbit-snack-and-hop.png',
      sceneId: 'rabbit-snack-and-hop',
      assetName: 'carrot-slice',
    },
    {
      fileName: 'milestone-care-for-the-rabbit.png',
      sceneId: 'prepare-the-hay',
      assetName: 'rabbit-sitting',
    },
  ];

  for (const def of iconDefinitions) {
    const sourceBuffer = masterBuffers.get(`${def.sceneId}/${def.assetName}`);
    if (!sourceBuffer) continue;
    const targetPath = join(repoRoot, 'src/assets/icons/skids', def.fileName);
    const icon = await sharp(sourceBuffer)
      .trim()
      .resize(100, 100, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .extend({
        top: 14,
        bottom: 14,
        left: 14,
        right: 14,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
    writeFileSync(targetPath, icon);
  }
}
