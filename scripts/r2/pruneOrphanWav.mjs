import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';

import { getArgValue, getR2Config } from './client.mjs';

const apply = process.argv.includes('--apply');
const confirmation = getArgValue('--confirm');
const { assetVersion, bucketName, client } = getR2Config();

const requiredConfirmation = `${bucketName}:prune-wav`;

if (apply && confirmation !== requiredConfirmation) {
  throw new Error(
    `Safety confirmation failed. Use --confirm=${requiredConfirmation} to proceed with deletion.`,
  );
}

console.log(`Bucket        : ${bucketName}`);
console.log(`Asset version : ${assetVersion}`);
console.log(`Scan prefix   : ${assetVersion}/lessons/`);

// 1. Fetch remote manifest
const remoteManifest = await getRemoteManifest();
const manifestFiles = new Set(Object.keys(remoteManifest.files ?? {}));
console.log(`Manifest files: ${manifestFiles.size} registered files`);

// 2. Scan all objects under lessons/
const allLessonObjects = await listAllObjects(`${assetVersion}/lessons/`);
console.log(`Total objects under lessons/: ${allLessonObjects.length}`);

// 3. Filter for orphan .wav files (not in manifest)
const orphanWavObjects = [];
let orphanWavBytes = 0;
let activeMp3Count = 0;
let activeWebpCount = 0;

for (const obj of allLessonObjects) {
  const key = obj.Key;
  const size = obj.Size ?? 0;
  const relativePath = key.startsWith(`${assetVersion}/`)
    ? key.slice(`${assetVersion}/`.length)
    : key;

  if (key.endsWith('.wav')) {
    // Only delete if NOT in active manifest
    if (!manifestFiles.has(relativePath)) {
      orphanWavObjects.push({ Key: key, Size: size });
      orphanWavBytes += size;
    }
  } else if (key.endsWith('.mp3')) {
    activeMp3Count += 1;
  } else if (key.endsWith('.webp')) {
    activeWebpCount += 1;
  }
}

console.log(`Active .mp3 (kept)  : ${activeMp3Count}`);
console.log(`Active .webp (kept) : ${activeWebpCount}`);
console.log(`Orphan .wav to delete: ${orphanWavObjects.length} files (${formatSize(orphanWavBytes)})`);

if (orphanWavObjects.length === 0) {
  console.log('No orphan .wav files found to delete. Bucket is clean!');
  process.exit(0);
}

// 4. Dry-run vs Apply
if (!apply) {
  console.log('\n[DRY RUN ONLY]');
  console.log(`To delete these ${orphanWavObjects.length} orphan .wav files (~${formatSize(orphanWavBytes)}), run:`);
  console.log(`npm run r2:prune-wav -- --apply --confirm=${requiredConfirmation}`);
  process.exit(0);
}

// 5. Delete in batches of 500
console.log(`\nDeleting ${orphanWavObjects.length} orphan .wav files...`);
const batchSize = 500;
let deletedCount = 0;

for (let i = 0; i < orphanWavObjects.length; i += batchSize) {
  const batch = orphanWavObjects.slice(i, i + batchSize);
  await client.send(
    new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: {
        Objects: batch.map(obj => ({ Key: obj.Key })),
        Quiet: true,
      },
    }),
  );
  deletedCount += batch.length;
  console.log(`Deleted ${deletedCount}/${orphanWavObjects.length} objects...`);
}

// 6. Verify cleanup
console.log('\nVerifying cleanup...');
const remainingObjects = await listAllObjects(`${assetVersion}/lessons/`);
const remainingWavs = remainingObjects.filter(o => o.Key.endsWith('.wav'));

console.log(`Remaining .wav files under lessons/: ${remainingWavs.length}`);
console.log(`Remaining .mp3 files under lessons/: ${remainingObjects.filter(o => o.Key.endsWith('.mp3')).length}`);
console.log(`Remaining .webp files under lessons/: ${remainingObjects.filter(o => o.Key.endsWith('.webp')).length}`);

if (remainingWavs.length === 0) {
  console.log('SUCCESS: All orphan .wav files have been safely removed from R2.');
} else {
  console.warn(`WARNING: ${remainingWavs.length} .wav files still remain.`);
}

async function getRemoteManifest() {
  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: `${assetVersion}/manifest.json`,
      }),
    );
    return JSON.parse(await response.Body.transformToString());
  } catch (error) {
    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      return { files: {}, version: assetVersion };
    }
    throw error;
  }
}

async function listAllObjects(prefix) {
  const results = [];
  let continuationToken;
  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        ContinuationToken: continuationToken,
        Prefix: prefix || undefined,
      }),
    );
    results.push(...(response.Contents ?? []));
    continuationToken = response.IsTruncated
      ? response.NextContinuationToken
      : undefined;
  } while (continuationToken);
  return results;
}

function formatSize(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
