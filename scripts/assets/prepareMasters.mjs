import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { walkFiles } from './catalog.mjs';
import {
  assetsRoot,
  lessonAssetsRoot,
  toMasterPath,
  toRuntimePath,
} from './config.mjs';

const apply = process.argv.includes('--apply');
const force = process.argv.includes('--force');
const lessonFilter = getArgValue('--lesson');
const runtimeSources = walkFiles(
  lessonAssetsRoot,
  filePath => filePath.endsWith('.png'),
)
  .map(toRuntimePath)
  .filter(
    source => !lessonFilter || source.startsWith(`lessons/${lessonFilter}/`),
  );
let copied = 0;
let unchanged = 0;
let conflicts = 0;
let missing = 0;

for (const runtimeSource of runtimeSources) {
  const sourcePath = `${assetsRoot}/${runtimeSource}`;
  const masterPath = toMasterPath(runtimeSource);
  if (!existsSync(sourcePath)) {
    if (existsSync(masterPath)) {
      unchanged += 1;
      continue;
    }
    missing += 1;
    console.error(`Missing runtime source: ${runtimeSource}`);
    continue;
  }

  if (existsSync(masterPath)) {
    if (fileHash(sourcePath) === fileHash(masterPath)) {
      unchanged += 1;
      continue;
    }
    if (!force) {
      conflicts += 1;
      console.error(`Master conflict: ${runtimeSource}`);
      continue;
    }
  }

  console.log(`${apply ? 'COPY' : 'WOULD COPY'} ${runtimeSource}`);
  if (apply) {
    mkdirSync(dirname(masterPath), { recursive: true });
    copyFileSync(sourcePath, masterPath);
  }
  copied += 1;
}

console.log(`\nCopied    : ${copied}`);
console.log(`Unchanged : ${unchanged}`);
console.log(`Conflicts : ${conflicts}`);
console.log(`Missing   : ${missing}`);
if (!apply) {
  console.log('Dry run only. Add --apply to write master files.');
}
if (conflicts > 0 || missing > 0) {
  process.exitCode = 1;
}

function fileHash(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function getArgValue(name) {
  const prefix = `${name}=`;
  return process.argv.slice(2).find(arg => arg.startsWith(prefix))?.slice(prefix.length);
}
