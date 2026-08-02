import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import sharp from 'sharp';

const rawRoot = 'src/assets/source/lessons/dress-myself';
const masterRoot = 'src/assets/source/master/lessons/dress-myself';
const referenceBaby =
  'src/assets/source/master/lessons/my-feelings/happy-and-sad/images/baby.png';

const scenes = [
  {
    id: 'choose-clothes',
    background: 'choose-clothes-background.png',
    objectSheet: 'choose-clothes-objects-sheet-alpha.png',
    objects: ['t-shirt', 'shorts', 'dress', 'sweater', 'raincoat', 'cap'],
    actions: [
      'choose-clothes-action',
      'check-weather',
      'lay-out-clothes',
    ],
    actionRow: 0,
    characterColumn: 0,
  },
  {
    id: 'put-on-clothes',
    background: 'put-on-clothes-background.png',
    objectSheet: 'put-on-clothes-objects-sheet-alpha.png',
    objects: [
      'sleeve',
      'collar',
      'waistband',
      'front',
      'back',
      'clothing-tag',
    ],
    actions: [
      'arms-through-sleeves',
      'pull-up-shorts',
      'turn-shirt-around',
    ],
    actionRow: 1,
  },
  {
    id: 'fasteners-and-shoes',
    background: 'fasteners-background.png',
    objectSheet: 'fasteners-objects-sheet-alpha.png',
    objects: [
      'button',
      'zipper',
      'shoelace',
      'buckle',
      'snap-fastener',
      'shoe-strap',
    ],
    actions: ['button-shirt', 'zip-jacket', 'tie-shoelaces'],
    actionRow: 2,
    characterColumn: 1,
  },
];

const actionSheet = join(
  rawRoot,
  'shared/dress-myself-action-cards-sheet-alpha.png',
);
const actionMetadata = await sharp(actionSheet).metadata();
const actionCellWidth = exactCellSize(actionMetadata.width, 3, actionSheet);
const actionCellHeight = exactCellSize(actionMetadata.height, 3, actionSheet);
const characterSheet = join(
  rawRoot,
  'shared/dress-myself-character-variants-sheet-alpha.png',
);
const characterMetadata = await sharp(characterSheet).metadata();
const characterCellWidth = Math.floor((characterMetadata.width ?? 0) / 2);
if (characterCellWidth === 0) {
  throw new Error(`${characterSheet} has no readable width.`);
}

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

  if (scene.characterColumn === undefined) {
    await sharp(referenceBaby).png().toFile(join(outputDir, 'baby.png'));
  } else {
    await extractAsset({
      cellHeight: characterMetadata.height,
      cellWidth: characterCellWidth,
      column: scene.characterColumn,
      input: characterSheet,
      inset: 8,
      output: join(outputDir, 'baby.png'),
      padding: 36,
      row: 0,
    });
  }

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
      inset: 8,
      output: join(outputDir, `${assetName}.png`),
      padding: 36,
      row: Math.floor(index / 3),
    });
  }

  for (const [column, assetName] of scene.actions.entries()) {
    await extractAsset({
      cellHeight: actionCellHeight,
      cellWidth: actionCellWidth,
      column,
      input: actionSheet,
      inset: 6,
      output: join(outputDir, `${assetName}.png`),
      padding: 18,
      row: scene.actionRow,
    });
  }
}

console.log('Finalized 33 dress-myself master PNGs across 3 scenes.');

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
