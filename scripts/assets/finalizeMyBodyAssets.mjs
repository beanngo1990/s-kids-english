import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import sharp from 'sharp';

const rawRoot = 'src/assets/source/lessons/my-body';
const masterRoot = 'src/assets/source/master/lessons/my-body';
const referenceBaby =
  'src/assets/source/master/lessons/supermarket-trip/shopping-list/images/baby.png';

const scenes = [
  {
    id: 'head-and-face',
    objects: ['head', 'eyes', 'mouth', 'hair', 'ears', 'nose'],
    objectInsets: { eyes: 32 },
    actions: ['touch-head', 'point-nose', 'open-mouth'],
    actionRow: 0,
  },
  {
    id: 'arms-and-hands',
    objects: ['arm', 'hand', 'fingers', 'elbow', 'wrist', 'thumb'],
    objectOverrides: {
      wrist: 'arms-and-hands/images/wrist-closeup-alpha.png',
    },
    actions: ['raise-arms', 'clap-hands', 'wiggle-fingers'],
    actionRow: 1,
  },
  {
    id: 'legs-and-feet',
    objects: ['leg', 'foot', 'toes', 'knee', 'ankle', 'heel'],
    objectOverrides: {
      ankle: 'legs-and-feet/images/ankle-closeup-alpha.png',
    },
    actions: ['bend-knees', 'stomp-feet', 'tiptoes'],
    actionOverrides: {
      tiptoes: 'legs-and-feet/images/tiptoes-card-alpha.png',
    },
    actionRow: 2,
  },
];

const actionSheet = join(rawRoot, 'shared/action-cards-sheet-alpha.png');
const actionMetadata = await sharp(actionSheet).metadata();
const actionCellWidth = exactCellSize(actionMetadata.width, 3, actionSheet);
const actionCellHeight = exactCellSize(actionMetadata.height, 3, actionSheet);

for (const scene of scenes) {
  const outputDir = join(masterRoot, scene.id, 'images');
  await mkdir(outputDir, { recursive: true });

  await sharp(join(rawRoot, 'shared/body-room-background.png'))
    .resize(941, 1672, { fit: 'cover', position: 'centre' })
    .flatten({ background: '#ffffff' })
    .removeAlpha()
    .png()
    .toFile(join(outputDir, 'background.png'));

  await sharp(referenceBaby).png().toFile(join(outputDir, 'baby.png'));

  const objectSheet = join(
    rawRoot,
    scene.id,
    'images/body-parts-sheet-alpha.png',
  );
  const objectMetadata = await sharp(objectSheet).metadata();
  const objectCellWidth = exactCellSize(objectMetadata.width, 3, objectSheet);
  const objectCellHeight = exactCellSize(objectMetadata.height, 2, objectSheet);

  for (const [index, assetName] of scene.objects.entries()) {
    const override = scene.objectOverrides?.[assetName];
    if (override) {
      await trimAsset({
        input: join(rawRoot, override),
        output: join(outputDir, `${assetName}.png`),
        padding: 40,
      });
      continue;
    }

    await extractAsset({
      cellHeight: objectCellHeight,
      cellWidth: objectCellWidth,
      column: index % 3,
      input: objectSheet,
      inset: scene.objectInsets?.[assetName] ?? 12,
      output: join(outputDir, `${assetName}.png`),
      padding: 40,
      row: Math.floor(index / 3),
    });
  }

  for (const [column, assetName] of scene.actions.entries()) {
    const override = scene.actionOverrides?.[assetName];
    if (override) {
      await trimAsset({
        input: join(rawRoot, override),
        output: join(outputDir, `${assetName}.png`),
        padding: 18,
      });
      continue;
    }

    await extractAsset({
      cellHeight: actionCellHeight,
      cellWidth: actionCellWidth,
      column,
      input: actionSheet,
      output: join(outputDir, `${assetName}.png`),
      padding: 18,
      row: scene.actionRow,
    });
  }
}

console.log('Finalized 33 my-body master PNGs across 3 scenes.');

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

  await trimAsset({ input: cell, output, padding });
}

async function trimAsset({ input, output, padding }) {
  await sharp(input)
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
