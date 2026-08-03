import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';

import sharp from 'sharp';

import { assetsRoot, toPosixPath } from './config.mjs';

const shouldBackup = !process.argv.includes('--no-backup');
const backupRoot = join(assetsRoot, 'source/ui-art-original');

const groups = [
  {
    files: ['images/app-logo.png'],
    maxEdge: 512,
    name: 'app-logo',
  },
  {
    files: [
      'mascot/sungy/sungy-avatar.png',
      'mascot/sungy/sungy-great-job.png',
      'mascot/sungy/sungy-hello.png',
      'mascot/sungy/sungy-hero.png',
      'mascot/sungy/sungy-hint.png',
      'mascot/sungy/sungy-learn.png',
      'mascot/sungy/sungy-lets-go.png',
      'mascot/sungy/sungy-source-poster.png',
      'mascot/sungy/sungy-try-again.png',
    ],
    maxEdge: 640,
    name: 'mascot',
  },
  {
    files: ['icons/premium/premium-crown.png'],
    maxEdge: 384,
    name: 'premium',
  },
  {
    files: readdirSync(join(assetsRoot, 'stickers/achievements'))
      .filter(file => file.endsWith('.png'))
      .map(file => `stickers/achievements/${file}`)
      .sort(),
    maxEdge: 384,
    name: 'achievement-stickers',
  },
];

let totalBeforeBytes = 0;
let totalAfterBytes = 0;
let totalFiles = 0;
let backupSourceCount = 0;

for (const group of groups) {
  let groupBeforeBytes = 0;
  let groupAfterBytes = 0;

  for (const runtimePath of group.files) {
    const outputPath = join(assetsRoot, runtimePath);
    if (!existsSync(outputPath)) {
      throw new Error(`Missing UI art asset: ${toPosixPath(outputPath)}`);
    }

    const backupPath = join(backupRoot, runtimePath);
    if (shouldBackup && !existsSync(backupPath)) {
      mkdirSync(dirname(backupPath), { recursive: true });
      copyFileSync(outputPath, backupPath);
    }

    const sourcePath = existsSync(backupPath) ? backupPath : outputPath;
    if (sourcePath === backupPath) {
      backupSourceCount += 1;
    }

    const beforeSize = statSync(outputPath).size;
    groupBeforeBytes += beforeSize;

    const input = sharp(sourcePath, { limitInputPixels: false });
    const metadata = await input.metadata();
    const sourceWidth = metadata.width ?? 1;
    const sourceHeight = metadata.height ?? 1;
    const scale = Math.min(1, group.maxEdge / Math.max(sourceWidth, sourceHeight));
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));

    const optimized = await input
      .resize({ fit: 'inside', height, width, withoutEnlargement: true })
      .png({
        colors: 256,
        compressionLevel: 9,
        effort: 10,
        palette: true,
        quality: 92,
      })
      .toBuffer();

    writeFileSync(outputPath, optimized);
    groupAfterBytes += optimized.length;
    totalFiles += 1;
  }

  totalBeforeBytes += groupBeforeBytes;
  totalAfterBytes += groupAfterBytes;
  console.log(
    `${group.name.padEnd(20)} ${String(group.files.length).padStart(2)} files ` +
      `${formatSize(groupBeforeBytes)} -> ${formatSize(groupAfterBytes)} ` +
      `(${formatSaved(groupBeforeBytes, groupAfterBytes)} saved)`,
  );
}

console.log(`Optimized ${totalFiles} bundled UI art assets`);
console.log(`Before   : ${formatSize(totalBeforeBytes)}`);
console.log(`After    : ${formatSize(totalAfterBytes)}`);
console.log(`Saved    : ${formatSaved(totalBeforeBytes, totalAfterBytes)}`);
if (shouldBackup) {
  console.log(`Backup   : ${backupRoot}`);
  console.log(`Source   : ${backupSourceCount}/${totalFiles} from backup`);
}

function formatSaved(beforeBytes, afterBytes) {
  if (beforeBytes === 0) {
    return '0.0%';
  }

  return `${((1 - afterBytes / beforeBytes) * 100).toFixed(1)}%`;
}

function formatSize(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
}
