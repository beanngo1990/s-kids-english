import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import sharp from 'sharp';

const rawRoot = 'src/assets/source/lessons/personal-care';
const masterRoot = 'src/assets/source/master/lessons/personal-care';
const referenceBaby =
  'src/assets/source/master/lessons/my-feelings/happy-and-sad/images/baby.png';

const scenes = [
  {
    id: 'face-and-hair-care',
    background: 'face-hair-background.png',
    objectSheet: 'face-hair-objects-sheet-alpha.png',
    objects: [
      'hairbrush',
      'comb',
      'face-cloth',
      'mirror',
      'hair-tie',
      'nail-clippers',
    ],
    actions: ['brush-hair', 'wash-face', 'help-with-nails'],
    actionRow: 0,
  },
  {
    id: 'cough-and-sneeze-care',
    background: 'cough-sneeze-background.png',
    objectSheet: 'cough-sneeze-objects-sheet-alpha.png',
    objects: ['cough', 'sneeze', 'tissue', 'sleeve', 'soap', 'trash-can'],
    actions: ['cover-cough', 'sneeze-elbow', 'throw-tissue'],
    actionRow: 1,
  },
  {
    id: 'care-items',
    background: 'care-items-background.png',
    objectSheet: 'care-items-objects-sheet-alpha.png',
    objects: [
      'toothbrush',
      'toothpaste',
      'toothbrush-holder',
      'soap-bar',
      'towel',
      'toiletry-bag',
    ],
    actions: ['own-toothbrush', 'close-toothpaste', 'put-things-away'],
    actionRow: 2,
  },
];

const actionSheet = join(
  rawRoot,
  'shared/personal-care-action-cards-sheet-alpha.png',
);
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
      inset: 8,
      output: join(outputDir, `${assetName}.png`),
      padding: 36,
      row: Math.floor(index / 3),
      topCrop:
        scene.id === 'cough-and-sneeze-care' && (index === 3 || index === 4)
          ? 52
          : 0,
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

console.log('Finalized 33 personal-care master PNGs across 3 scenes.');

async function extractAsset({
  cellHeight,
  cellWidth,
  column,
  input,
  inset = 0,
  output,
  padding,
  row,
  topCrop = 0,
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

  if (topCrop > 0) {
    cell = await sharp(cell)
      .extract({
        height: cellHeight - inset * 2 - topCrop,
        left: 0,
        top: topCrop,
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
