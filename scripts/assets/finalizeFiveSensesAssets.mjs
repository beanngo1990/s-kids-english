import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import sharp from 'sharp';

const rawRoot = 'src/assets/source/lessons/five-senses';
const masterRoot = 'src/assets/source/master/lessons/five-senses';
const referenceBaby =
  'src/assets/source/master/lessons/supermarket-trip/shopping-list/images/baby.png';

const scenes = [
  {
    id: 'seeing-world',
    background: 'seeing-room-background.png',
    objectSheet: 'seeing-objects-sheet-alpha.png',
    objects: ['see', 'color', 'shape', 'light', 'shadow', 'magnifying-glass'],
    actions: ['look-closely', 'find-red-circle', 'close-eyes'],
    actionRow: 0,
  },
  {
    id: 'hearing-world',
    background: 'hearing-room-background.png',
    objectSheet: 'hearing-objects-sheet-alpha.png',
    objects: ['hear', 'sound', 'music', 'loud', 'quiet', 'bell'],
    actions: ['listen-carefully', 'cover-ears', 'follow-sound'],
    actionRow: 1,
  },
  {
    id: 'smell-taste-touch',
    background: 'sensory-room-background.png',
    objectSheet: 'sensory-objects-sheet-alpha.png',
    objects: ['smell', 'taste', 'touch', 'sweet', 'sour', 'soft'],
    actions: ['smell-flower', 'taste-lemon', 'touch-feather'],
    actionRow: 2,
  },
];

const actionSheet = join(rawRoot, 'shared/action-cards-sheet-alpha.png');
const actionMetadata = await sharp(actionSheet).metadata();
const actionCellWidth = exactCellSize(actionMetadata.width, 3, actionSheet);
const actionCellHeight = exactCellSize(actionMetadata.height, 3, actionSheet);

for (const scene of scenes) {
  const sceneRawRoot = join(rawRoot, scene.id, 'images');
  const outputDir = join(masterRoot, scene.id, 'images');
  await mkdir(outputDir, { recursive: true });

  await sharp(join(sceneRawRoot, scene.background))
    .resize(941, 1672, { fit: 'cover', position: 'centre' })
    .flatten({ background: '#ffffff' })
    .removeAlpha()
    .png()
    .toFile(join(outputDir, 'background.png'));

  await sharp(referenceBaby).png().toFile(join(outputDir, 'baby.png'));

  const objectSheet = join(sceneRawRoot, scene.objectSheet);
  const objectMetadata = await sharp(objectSheet).metadata();
  const objectCellWidth = exactCellSize(objectMetadata.width, 3, objectSheet);
  const objectCellHeight = exactCellSize(objectMetadata.height, 2, objectSheet);

  for (const [index, assetName] of scene.objects.entries()) {
    await extractAsset({
      cellHeight: objectCellHeight,
      cellWidth: objectCellWidth,
      column: index % 3,
      input: objectSheet,
      inset: 10,
      output: join(outputDir, `${assetName}.png`),
      padding: 40,
      row: Math.floor(index / 3),
    });
  }

  for (const [column, assetName] of scene.actions.entries()) {
    await extractAsset({
      cellHeight: actionCellHeight,
      cellWidth: actionCellWidth,
      column,
      input: actionSheet,
      inset: 8,
      output: join(outputDir, `${assetName}.png`),
      padding: 18,
      row: scene.actionRow,
    });
  }
}

console.log('Finalized 33 five-senses master PNGs across 3 scenes.');

async function extractAsset({
  cellHeight,
  cellWidth,
  column,
  input,
  inset = 0,
  output,
  padding,
  row,
}) {
  await mkdir(dirname(output), { recursive: true });
  let cell = await sharp(input)
    .extract({
      height: cellHeight,
      left: column * cellWidth,
      top: row * cellHeight,
      width: cellWidth,
    })
    .png()
    .toBuffer();

  if (inset > 0) {
    cell = await sharp(cell)
      .extract({
        height: cellHeight - inset * 2,
        left: inset,
        top: inset,
        width: cellWidth - inset * 2,
      })
      .png()
      .toBuffer();
  }

  await sharp(cell)
    .trim({
      background: { alpha: 0, b: 0, g: 0, r: 0 },
      threshold: 1,
    })
    .extend({
      background: { alpha: 0, b: 0, g: 0, r: 0 },
      bottom: padding,
      left: padding,
      right: padding,
      top: padding,
    })
    .png()
    .toFile(output);
}

function exactCellSize(size, cells, filePath) {
  if (!size || size % cells !== 0) {
    throw new Error(`${filePath} cannot be divided into ${cells} equal cells.`);
  }

  return size / cells;
}
