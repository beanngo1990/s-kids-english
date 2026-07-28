import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { repoRoot } from './config.mjs';

const apply = process.argv.includes('--apply');
const lessonsDir = join(repoRoot, 'src/data/lessons');
const files = readdirSync(lessonsDir)
  .filter(fileName => fileName.endsWith('.ts'))
  .sort();
let changedFiles = 0;
let replacements = 0;

for (const fileName of files) {
  const filePath = join(lessonsDir, fileName);
  const source = readFileSync(filePath, 'utf8');
  let fileReplacements = 0;
  const nextSource = source.replace(
    /(lessons\/[^'"`\s]+\/images\/[^'"`\s]+)\.png/gu,
    (_, assetPath) => {
      fileReplacements += 1;
      return `${assetPath}.webp`;
    },
  );
  if (fileReplacements === 0) {
    continue;
  }
  console.log(`${apply ? 'UPDATE' : 'WOULD UPDATE'} ${fileName}: ${fileReplacements}`);
  if (apply) {
    writeFileSync(filePath, nextSource);
  }
  changedFiles += 1;
  replacements += fileReplacements;
}

console.log(`\nFiles        : ${changedFiles}`);
console.log(`Replacements : ${replacements}`);
if (!apply) {
  console.log('Dry run only. Add --apply to update lesson references.');
}
