import {
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { trimWavSilence } from './audioSilence.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const audioRoots = [
  join(repoRoot, 'src/assets/lessons'),
  join(repoRoot, 'src/assets/shared/audio/vi'),
];

let changedFiles = 0;
let savedBytes = 0;

for (const root of audioRoots) {
  if (!existsSync(root)) {
    continue;
  }

  for (const filePath of listFiles(root)) {
    if (extname(filePath).toLowerCase() !== '.wav') {
      continue;
    }

    const input = readFileSync(filePath);
    const output = trimWavSilence(input);
    if (output.length >= input.length) {
      continue;
    }

    writeFileSync(filePath, output);
    changedFiles += 1;
    savedBytes += input.length - output.length;
  }
}

console.log(
  `Trimmed ${changedFiles} audio file(s), saving ${savedBytes} byte(s).`,
);

function listFiles(rootDir) {
  return readdirSync(rootDir, { withFileTypes: true }).flatMap(entry => {
    const entryPath = join(rootDir, entry.name);
    return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
  });
}
