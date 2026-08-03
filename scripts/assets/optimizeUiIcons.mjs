import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

import sharp from 'sharp';

import { assetsRoot } from './config.mjs';

const defaultMaxEdge = 320;
const maxEdge = Number(getArgValue('--max-edge') ?? defaultMaxEdge);
const shouldBackup = !process.argv.includes('--no-backup');
const iconDir = join(assetsRoot, 'icons/skids');
const backupDir = join(assetsRoot, 'source/ui-icons/skids-original');

if (!Number.isFinite(maxEdge) || maxEdge <= 0) {
  throw new Error(`Invalid --max-edge value: ${maxEdge}`);
}

const files = readdirSync(iconDir)
  .filter(file => file.endsWith('.png'))
  .sort();

if (files.length === 0) {
  throw new Error(`No PNG icons found in ${iconDir}`);
}

if (shouldBackup) {
  mkdirSync(backupDir, { recursive: true });
}

let beforeBytes = 0;
let afterBytes = 0;
let backupSourceCount = 0;

for (const file of files) {
  const outputPath = join(iconDir, file);
  const backupPath = join(backupDir, file);

  if (shouldBackup && !existsSync(backupPath)) {
    copyFileSync(outputPath, backupPath);
  }

  const sourcePath = existsSync(backupPath) ? backupPath : outputPath;
  if (sourcePath === backupPath) {
    backupSourceCount += 1;
  }

  const beforeSize = statSync(outputPath).size;
  beforeBytes += beforeSize;

  const input = sharp(sourcePath, { limitInputPixels: false });
  const metadata = await input.metadata();
  const sourceWidth = metadata.width ?? 1;
  const sourceHeight = metadata.height ?? 1;
  const scale = Math.min(1, maxEdge / Math.max(sourceWidth, sourceHeight));
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
  afterBytes += optimized.length;
}

console.log(`Optimized ${files.length} S-Kids icons`);
console.log(`Max edge : ${maxEdge}px`);
console.log(`Before   : ${formatSize(beforeBytes)}`);
console.log(`After    : ${formatSize(afterBytes)}`);
console.log(`Saved    : ${((1 - afterBytes / beforeBytes) * 100).toFixed(1)}%`);
if (shouldBackup) {
  console.log(`Backup   : ${backupDir}`);
  console.log(`Source   : ${backupSourceCount}/${files.length} from backup`);
}

function getArgValue(name) {
  const inline = process.argv.find(arg => arg.startsWith(`${name}=`));
  if (inline) {
    return inline.slice(name.length + 1);
  }

  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function formatSize(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
}
