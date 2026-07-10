/** Upload generated WebP lesson images and audio assets to Cloudflare R2. */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import {
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

import { repoRoot } from './assets/config.mjs';
import { buildR2Manifest, collectUploadFiles } from './r2/assets.mjs';
import { getArgValue, getR2Config } from './r2/client.mjs';

const apply = process.argv.includes('--apply') && !process.argv.includes('--dry-run');
const force = process.argv.includes('--force');
const lessonFilter = getArgValue('--lesson');
const { assetVersion, bucketName, client, publicUrl } = getR2Config();
const allFiles = collectUploadFiles({ assetVersion });
const selectedFiles = lessonFilter
  ? allFiles.filter(
      file => file.relativePath.startsWith(`lessons/${lessonFilter}/`),
    )
  : allFiles;
const remoteManifest = await getRemoteManifest();
const filesToUpload = selectedFiles.filter(file => {
  if (force) {
    return true;
  }
  const remoteEntry = remoteManifest.files?.[file.relativePath];
  return !remoteEntry || remoteEntry.sha256 !== file.sha256;
});

console.log(`Version       : ${assetVersion}`);
console.log(`Local assets  : ${allFiles.length}`);
console.log(`Selected      : ${selectedFiles.length}`);
console.log(`Changed/new   : ${filesToUpload.length}`);
console.log(`Upload size   : ${formatSize(filesToUpload.reduce((sum, file) => sum + file.size, 0))}`);

if (!apply) {
  console.log('Dry run only. Add --apply to upload.');
  process.exit(0);
}

let uploaded = 0;
await runWithConcurrency(filesToUpload, 8, async file => {
  await client.send(
    new PutObjectCommand({
      Body: readFileSync(file.localPath),
      Bucket: bucketName,
      CacheControl: 'public, max-age=31536000, immutable',
      ContentType: file.contentType,
      Key: file.key,
      Metadata: { sha256: file.sha256 },
    }),
  );
  uploaded += 1;
  if (uploaded % 50 === 0 || uploaded === filesToUpload.length) {
    console.log(`Uploaded ${uploaded}/${filesToUpload.length}`);
  }
});

const nextManifest = lessonFilter
  ? mergeManifest(remoteManifest, selectedFiles)
  : buildR2Manifest(allFiles, assetVersion);
const manifestBody = Buffer.from(`${JSON.stringify(nextManifest, null, 2)}\n`);
await client.send(
  new PutObjectCommand({
    Body: manifestBody,
    Bucket: bucketName,
    CacheControl: 'no-cache',
    ContentType: 'application/json',
    Key: `${assetVersion}/manifest.json`,
  }),
);

const localManifestPath = join(repoRoot, `build/r2-manifest.${assetVersion}.json`);
mkdirSync(dirname(localManifestPath), { recursive: true });
writeFileSync(localManifestPath, manifestBody);
console.log(`Manifest uploaded: ${assetVersion}/manifest.json`);
if (publicUrl) {
  console.log(`Public URL: ${publicUrl}/${assetVersion}/`);
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

function mergeManifest(currentManifest, uploadedFiles) {
  const files = { ...(currentManifest.files ?? {}) };
  for (const file of uploadedFiles) {
    files[file.relativePath] = {
      contentType: file.contentType,
      sha256: file.sha256,
      size: file.size,
    };
  }
  return {
    files,
    totalFiles: Object.keys(files).length,
    totalSizeBytes: Object.values(files).reduce((sum, file) => sum + file.size, 0),
    updatedAt: new Date().toISOString(),
    version: assetVersion,
  };
}

async function runWithConcurrency(items, concurrency, worker) {
  let nextIndex = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (nextIndex < items.length) {
        const item = items[nextIndex];
        nextIndex += 1;
        await worker(item);
      }
    }),
  );
}

function formatSize(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MiB`;
}
