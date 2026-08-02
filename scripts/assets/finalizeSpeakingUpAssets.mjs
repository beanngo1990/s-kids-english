import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import sharp from 'sharp';

const rawRoot = 'src/assets/source/lessons/speaking-up';
const masterRoot = 'src/assets/source/master/lessons/speaking-up';
const referenceBaby =
  'src/assets/source/master/lessons/my-feelings/happy-and-sad/images/baby.png';

const scenes = [
  {
    id: 'body-needs',
    background: 'body-needs-background.png',
    objectSheet: 'body-needs-objects-sheet-alpha.png',
    objectInsets: {
      thirsty: 42,
    },
    objects: [
      'hungry',
      'thirsty',
      'tired',
      'hot',
      'cold',
      'uncomfortable',
    ],
    actions: ['am-hungry', 'need-water', 'need-rest'],
    actionRow: 0,
  },
  {
    id: 'pain-and-help',
    background: 'pain-help-background.png',
    frameObjects: true,
    objectSheet: 'pain-help-objects-sheet-alpha.png',
    objects: [
      'hurt',
      'tummy-ache',
      'headache',
      'sore-throat',
      'dizzy',
      'itchy',
    ],
    actions: ['hurts-here', 'not-feel-well', 'please-help'],
    actionRow: 1,
  },
  {
    id: 'body-boundaries',
    background: 'body-boundaries-background.png',
    objectSheet: 'body-boundaries-objects-sheet-alpha.png',
    objects: [
      'yes-please',
      'no-thank-you',
      'stop-please',
      'personal-space',
      'permission',
      'trusted-grown-up',
    ],
    actions: [
      'do-not-like-that',
      'ask-before-touching',
      'tell-trusted-grown-up',
    ],
    actionRow: 2,
  },
];

const actionSheet = join(
  rawRoot,
  'shared/speaking-up-action-cards-sheet-alpha.png',
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
      frame: scene.frameObjects
        ? {
            background: '#fff8ea',
            height: 540,
            padding: 34,
            radius: 54,
            width: 540,
          }
        : undefined,
      input: objectSheet,
      inset: scene.objectInsets?.[assetName] ?? 8,
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

console.log('Finalized 33 speaking-up master PNGs across 3 scenes.');

async function extractAsset({
  cellHeight,
  cellWidth,
  column,
  input,
  inset = 0,
  frame,
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

  let asset = await sharp(cell)
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
    .toBuffer();

  if (frame) {
    asset = await frameInRoundedCard(asset, frame);
  }

  await sharp(asset).png().toFile(output);
}

async function frameInRoundedCard(input, frame) {
  const content = await sharp(input)
    .resize(frame.width - frame.padding * 2, frame.height - frame.padding * 2, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .png()
    .toBuffer();
  const contentMetadata = await sharp(content).metadata();
  const card = Buffer.from(
    `<svg width="${frame.width}" height="${frame.height}" viewBox="0 0 ${frame.width} ${frame.height}" xmlns="http://www.w3.org/2000/svg"><rect width="${frame.width}" height="${frame.height}" rx="${frame.radius}" ry="${frame.radius}" fill="${frame.background}"/></svg>`,
  );

  return sharp({
    create: {
      background: { alpha: 0, b: 0, g: 0, r: 0 },
      channels: 4,
      height: frame.height,
      width: frame.width,
    },
  })
    .composite([
      { input: card, left: 0, top: 0 },
      {
        input: content,
        left: Math.round((frame.width - contentMetadata.width) / 2),
        top: Math.round((frame.height - contentMetadata.height) / 2),
      },
    ])
    .png()
    .toBuffer();
}

function exactCellSize(size, cells, filePath) {
  if (!size || size % cells !== 0) {
    throw new Error(`${filePath} cannot be divided into ${cells} equal cells.`);
  }

  return size / cells;
}
