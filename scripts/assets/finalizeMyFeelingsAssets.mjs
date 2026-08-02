import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import sharp from 'sharp';

const rawRoot = 'src/assets/source/lessons/my-feelings';
const masterRoot = 'src/assets/source/master/lessons/my-feelings';
const referenceBaby =
  'src/assets/source/master/lessons/five-senses/seeing-world/images/baby.png';

const scenes = [
  {
    id: 'happy-and-sad',
    background: 'happy-room-background.png',
    faceSheet: 'happy-sad-faces-sheet-alpha.png',
    faces: ['happy', 'sad', 'smile', 'tears', 'laugh', 'frown'],
    actions: ['feel-happy', 'feel-sad', 'how-you-feel'],
    actionRow: 0,
  },
  {
    id: 'angry-and-scared',
    background: 'calm-room-background.png',
    faceSheet: 'angry-scared-faces-sheet-alpha.png',
    faces: ['angry', 'scared', 'worried', 'brave', 'safe', 'upset'],
    actions: ['feel-angry', 'feel-scared', 'stay-with-me'],
    actionRow: 1,
  },
  {
    id: 'excited-and-proud',
    background: 'proud-room-background.png',
    faceSheet: 'excited-proud-faces-sheet-alpha.png',
    faces: [
      'excited',
      'proud',
      'surprised',
      'curious',
      'shy',
      'disappointed',
    ],
    actions: ['am-excited', 'did-it', 'feel-proud'],
    actionRow: 2,
  },
];

const actionSheet = join(rawRoot, 'shared/feeling-action-cards-sheet-alpha.png');
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

  const faceSheet = join(sceneRawRoot, scene.faceSheet);
  const faceMetadata = await sharp(faceSheet).metadata();
  const faceCellWidth = exactCellSize(faceMetadata.width, 3, faceSheet);
  const faceCellHeight = exactCellSize(faceMetadata.height, 2, faceSheet);

  for (const [index, assetName] of scene.faces.entries()) {
    await extractAsset({
      cellHeight: faceCellHeight,
      cellWidth: faceCellWidth,
      column: index % 3,
      input: faceSheet,
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

console.log('Finalized 33 my-feelings master PNGs across 3 scenes.');

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
