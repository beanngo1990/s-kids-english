import { HeadObjectCommand } from '@aws-sdk/client-s3';

import { collectUploadFiles } from './assets.mjs';
import { getArgValue, getR2Config } from './client.mjs';

const lessonFilter = getArgValue('--lesson');
const { assetVersion, bucketName, client, publicUrl } = getR2Config();
const files = collectUploadFiles({ assetVersion, lessonFilter });
const errors = [];
let checked = 0;

await runWithConcurrency(files, 10, async file => {
  try {
    const response = await client.send(
      new HeadObjectCommand({ Bucket: bucketName, Key: file.key }),
    );
    if (response.ContentLength !== file.size) {
      errors.push(`Size mismatch: ${file.key}`);
    }
    if (response.ContentType !== file.contentType) {
      errors.push(
        `Content-Type mismatch: ${file.key} (${response.ContentType ?? 'missing'})`,
      );
    }
    if (!response.CacheControl?.includes('max-age=31536000')) {
      errors.push(`Cache-Control mismatch: ${file.key}`);
    }
  } catch (error) {
    errors.push(`Missing/unreadable: ${file.key} (${error.message})`);
  }
  checked += 1;
  if (checked % 100 === 0 || checked === files.length) {
    console.log(`Checked ${checked}/${files.length}`);
  }
});

console.log(`Verified: ${checked}`);
console.log(`Errors  : ${errors.length}`);
if (publicUrl) {
  console.log(`Public  : ${publicUrl}/${assetVersion}/`);
}
errors.forEach(error => console.error(`ERROR: ${error}`));
if (errors.length > 0) {
  process.exitCode = 1;
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
