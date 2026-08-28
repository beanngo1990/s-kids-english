import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, resolve, sep } from 'node:path';

import sharp from 'sharp';

import {
  assetsRoot,
  imageReleaseVersion,
  manifestPath,
  masterRoot,
} from './config.mjs';

const lessonId = getArgValue('--lesson');
const baseUrl = (getArgValue('--base-url') ?? 'https://assets.sungy.net').replace(/\/$/u, '');
const dryRun = process.argv.includes('--dry-run');
const concurrency = Number.parseInt(getArgValue('--concurrency') ?? '4', 10);

if (!lessonId || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(lessonId)) {
  throw new Error('Pass a valid lesson ID with --lesson=<lesson-id>.');
}
if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 12) {
  throw new Error('--concurrency must be an integer from 1 to 12.');
}
if (!existsSync(manifestPath)) {
  throw new Error(`Asset manifest not found: ${manifestPath}`);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const lessonPrefix = `lessons/${lessonId}/`;
const entries = (manifest.entries ?? []).filter(
  entry =>
    entry.output.startsWith(lessonPrefix) &&
    entry.output.includes('/images/') &&
    entry.output.endsWith('.webp'),
);

if (entries.length === 0) {
  throw new Error(`No image manifest entries found for lesson ${lessonId}.`);
}

const expectedRevision = sha256(
  Buffer.from(
    (manifest.entries ?? [])
      .map(entry => `${entry.output}:${entry.outputSha256}`)
      .join('\n'),
  ),
).slice(0, 16);
if (manifest.revision !== expectedRevision) {
  throw new Error(
    `Local image manifest revision mismatch: expected ${expectedRevision}, got ${manifest.revision}.`,
  );
}

console.log(`Lesson      : ${lessonId}`);
console.log(`Images      : ${entries.length}`);
console.log(`Source      : ${baseUrl}/${imageReleaseVersion}/${lessonPrefix}`);
console.log(`Dry run     : ${dryRun ? 'yes' : 'no'}`);

let nextIndex = 0;
let restored = 0;
await Promise.all(
  Array.from({ length: Math.min(concurrency, entries.length) }, async () => {
    while (nextIndex < entries.length) {
      const index = nextIndex;
      nextIndex += 1;
      await restoreEntry(entries[index], index);
    }
  }),
);

if (!dryRun) {
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

console.log(`${dryRun ? 'Validated' : 'Restored'}   : ${restored}/${entries.length}`);
console.log(`Revision    : ${manifest.revision} (unchanged)`);

async function restoreEntry(entry, index) {
  const url = `${baseUrl}/${imageReleaseVersion}/${entry.output}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed (${response.status}) for ${url}`);
  }

  const webpBuffer = Buffer.from(await response.arrayBuffer());
  const outputSha256 = sha256(webpBuffer);
  if (webpBuffer.length !== entry.outputBytes) {
    throw new Error(
      `Byte count mismatch for ${entry.output}: expected ${entry.outputBytes}, got ${webpBuffer.length}.`,
    );
  }
  if (outputSha256 !== entry.outputSha256) {
    throw new Error(
      `SHA-256 mismatch for ${entry.output}: expected ${entry.outputSha256}, got ${outputSha256}.`,
    );
  }

  const pngBuffer = await sharp(webpBuffer, { failOn: 'error' })
    .png({ adaptiveFiltering: true, compressionLevel: 9 })
    .toBuffer();
  const pngMetadata = await sharp(pngBuffer).metadata();
  if ((pngMetadata.hasAlpha ?? false) !== entry.hasAlpha) {
    throw new Error(`Alpha metadata mismatch while restoring ${entry.output}.`);
  }

  if (!dryRun) {
    const outputPath = resolveInside(assetsRoot, entry.output);
    const sourcePath = resolveInside(masterRoot, entry.source);
    mkdirSync(dirname(outputPath), { recursive: true });
    mkdirSync(dirname(sourcePath), { recursive: true });
    writeFileSync(outputPath, webpBuffer);
    writeFileSync(sourcePath, pngBuffer);
    entry.sourceBytes = pngBuffer.length;
    entry.sourceSha256 = sha256(pngBuffer);
  }

  restored += 1;
  console.log(
    `${dryRun ? 'CHECKED' : 'RESTORED'} ${index + 1}/${entries.length} ${entry.output}`,
  );
}

function resolveInside(root, relativePath) {
  const resolvedRoot = resolve(root);
  const resolvedPath = resolve(resolvedRoot, relativePath);
  if (resolvedPath !== resolvedRoot && !resolvedPath.startsWith(`${resolvedRoot}${sep}`)) {
    throw new Error(`Path escapes expected root: ${relativePath}`);
  }
  return resolvedPath;
}

function getArgValue(name) {
  const prefix = `${name}=`;
  return process.argv.slice(2).find(arg => arg.startsWith(prefix))?.slice(prefix.length);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}
