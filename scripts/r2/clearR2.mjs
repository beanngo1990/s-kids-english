import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';

import { getArgValue, getR2Config } from './client.mjs';

const apply = process.argv.includes('--apply');
const clearAll = process.argv.includes('--all');
const requestedPrefix = getArgValue('--prefix');
const confirmation = getArgValue('--confirm');
const bucketConfirmation = getArgValue('--confirm-bucket');
const { assetVersion, bucketName, client } = getR2Config();
const prefix = clearAll ? '' : requestedPrefix ?? `${assetVersion}/`;

if (!clearAll && !prefix) {
  throw new Error('Refusing to clear an empty prefix. Use --all explicitly.');
}
if (apply && clearAll && bucketConfirmation !== bucketName) {
  throw new Error(`Use --confirm-bucket=${bucketName} to clear the entire bucket.`);
}
if (apply && !clearAll && confirmation !== `${bucketName}:${prefix}`) {
  throw new Error(`Use --confirm=${bucketName}:${prefix} to clear this prefix.`);
}

const objects = await listAllObjects(prefix);
const totalBytes = objects.reduce((sum, object) => sum + (object.Size ?? 0), 0);
console.log(`Bucket : ${bucketName}`);
console.log(`Prefix : ${prefix || '(entire bucket)'}`);
console.log(`Objects: ${objects.length}`);
console.log(`Size   : ${formatSize(totalBytes)}`);

if (!apply) {
  const confirmationFlag = clearAll
    ? `--confirm-bucket=${bucketName}`
    : `--confirm=${bucketName}:${prefix}`;
  console.log(
    `Dry run only. Add --apply ${confirmationFlag} to delete.`,
  );
  process.exit(0);
}

for (let index = 0; index < objects.length; index += 100) {
  const batch = objects.slice(index, index + 100);
  await client.send(
    new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: {
        Objects: batch.map(object => ({ Key: object.Key })),
        Quiet: true,
      },
    }),
  );
  console.log(`Deleted ${Math.min(index + batch.length, objects.length)}/${objects.length}`);
}

const remaining = await listAllObjects(prefix);
if (remaining.length > 0) {
  throw new Error(`R2 clear incomplete: ${remaining.length} object(s) remain.`);
}
console.log('R2 clear completed and verified.');

async function listAllObjects(listPrefix) {
  const results = [];
  let continuationToken;
  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        ContinuationToken: continuationToken,
        Prefix: listPrefix || undefined,
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
  return `${(bytes / 1024 / 1024).toFixed(1)} MiB`;
}
