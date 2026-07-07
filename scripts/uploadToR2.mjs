/**
 * Upload S-Kids English assets to Cloudflare R2.
 *
 * Usage:
 *   node scripts/uploadToR2.mjs                    # Upload new/changed files
 *   node scripts/uploadToR2.mjs --dry-run           # List what would be uploaded
 *   node scripts/uploadToR2.mjs --force             # Re-upload everything
 *   node scripts/uploadToR2.mjs --lesson=bedtime    # Upload only one lesson
 *   node scripts/uploadToR2.mjs --limit=10          # Upload at most N files
 *   node scripts/uploadToR2.mjs --manifest-only     # Rebuild manifest without uploading
 *
 * Required environment variables (in .env):
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 *   R2_BUCKET_NAME, R2_PUBLIC_URL, ASSET_VERSION
 */

import { createHash } from 'node:crypto';
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = join(__dirname, '..');
const assetsRoot = join(repoRoot, 'src/assets');

// ---------------------------------------------------------------------------
// 1. Load .env
// ---------------------------------------------------------------------------

loadDotEnv(join(repoRoot, '.env'));

const config = {
  accountId: requireEnv('R2_ACCOUNT_ID'),
  accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
  secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
  bucketName: requireEnv('R2_BUCKET_NAME'),
  publicUrl: process.env.R2_PUBLIC_URL ?? '',
  assetVersion: process.env.ASSET_VERSION ?? 'v1',
};

const S3_ENDPOINT = `https://${config.accountId}.r2.cloudflarestorage.com`;

// ---------------------------------------------------------------------------
// 2. Parse CLI args
// ---------------------------------------------------------------------------

const args = parseArgs(process.argv.slice(2));

// ---------------------------------------------------------------------------
// 3. Collect uploadable files
// ---------------------------------------------------------------------------

/** Directories to upload (relative to src/assets/) */
const UPLOAD_DIRS = ['lessons', 'mascot', 'shared'];

/** File extensions to upload */
const UPLOAD_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.wav', '.mp3', '.ogg', '.webp']);

/** Directories to skip */
const SKIP_DIRS = new Set(['source', '.DS_Store']);

const allFiles = collectFiles(assetsRoot, UPLOAD_DIRS, args.lesson);

console.log(`\nAsset version : ${config.assetVersion}`);
console.log(`Bucket        : ${config.bucketName}`);
console.log(`Total files   : ${allFiles.length}`);
console.log(`Total size    : ${formatSize(allFiles.reduce((sum, f) => sum + f.size, 0))}`);

// ---------------------------------------------------------------------------
// 4. Fetch remote manifest to detect changes
// ---------------------------------------------------------------------------

let remoteManifest = { files: {} };

if (!args.force) {
  remoteManifest = await fetchRemoteManifest();
}

const filesToUpload = allFiles.filter(file => {
  if (args.force) {
    return true;
  }
  const remoteEntry = remoteManifest.files?.[file.relPath];
  return !remoteEntry || remoteEntry.md5 !== file.md5;
});

console.log(`Changed/new   : ${filesToUpload.length}`);
console.log(`Unchanged     : ${allFiles.length - filesToUpload.length}`);

// ---------------------------------------------------------------------------
// 5. Upload
// ---------------------------------------------------------------------------

if (args.dryRun) {
  console.log('\n--- DRY RUN (no files will be uploaded) ---\n');
  for (const file of filesToUpload) {
    console.log(`  ${file.r2Key}  (${formatSize(file.size)})`);
  }
  console.log(`\n${filesToUpload.length} file(s) would be uploaded.`);
  process.exit(0);
}

if (!args.manifestOnly) {
  const limited = args.limit != null ? filesToUpload.slice(0, args.limit) : filesToUpload;

  if (limited.length > 0) {
    console.log(`\nUploading ${limited.length} file(s)...\n`);
  }

  // Upload in batches of 10 for concurrency
  const BATCH_SIZE = 10;
  for (let i = 0; i < limited.length; i += BATCH_SIZE) {
    const batch = limited.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(file => uploadFile(file)));
    for (const file of batch) {
      const idx = i + batch.indexOf(file) + 1;
      console.log(`  ✓ ${file.r2Key}  (${idx}/${limited.length})`);
    }
  }

  if (args.limit != null && filesToUpload.length > args.limit) {
    console.log(`\nSkipped ${filesToUpload.length - args.limit} file(s) due to --limit=${args.limit}`);
  }
}

// ---------------------------------------------------------------------------
// 6. Upload manifest.json
// ---------------------------------------------------------------------------

const manifest = buildManifest(allFiles);
await uploadManifest(manifest);
console.log(`\n✓ manifest.json uploaded (${Object.keys(manifest.files).length} entries)`);
console.log(`\nPublic URL: ${config.publicUrl}/${config.assetVersion}/`);
console.log('Done!\n');

// ===========================================================================
// Helper functions
// ===========================================================================

function parseArgs(rawArgs) {
  const options = {
    dryRun: false,
    force: false,
    lesson: undefined,
    limit: undefined,
    manifestOnly: false,
  };

  for (const arg of rawArgs) {
    if (arg === '--dry-run' || arg === '-n') {
      options.dryRun = true;
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--manifest-only') {
      options.manifestOnly = true;
    } else if (arg.startsWith('--lesson=')) {
      options.lesson = arg.slice('--lesson='.length);
    } else if (arg.startsWith('--limit=')) {
      options.limit = Number(arg.slice('--limit='.length));
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Upload assets to Cloudflare R2.

Usage:
  node scripts/uploadToR2.mjs [options]

Options:
  --dry-run, -n     List files that would be uploaded without uploading.
  --force           Re-upload all files, ignoring the remote manifest.
  --manifest-only   Rebuild and upload only the manifest.json.
  --lesson=<id>     Upload only assets for a specific lesson.
  --limit=<n>       Upload at most n files.
  --help, -h        Show this help.

Environment:
  Copy .env.example to .env and fill in your Cloudflare R2 credentials.
`.trim());
}

function loadDotEnv(envPath) {
  if (!existsSync(envPath)) {
    return;
  }

  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) {
      continue;
    }

    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    console.error('Copy .env.example to .env and fill in your R2 credentials.');
    process.exit(1);
  }
  return value;
}

function collectFiles(root, uploadDirs, lessonFilter) {
  const files = [];

  for (const dir of uploadDirs) {
    const dirPath = join(root, dir);
    if (!existsSync(dirPath)) {
      continue;
    }

    walkDir(dirPath, (filePath) => {
      const ext = extname(filePath).toLowerCase();
      if (!UPLOAD_EXTENSIONS.has(ext)) {
        return;
      }

      const relPath = relative(root, filePath).replaceAll('\\', '/');

      // Apply lesson filter
      if (lessonFilter && relPath.startsWith('lessons/')) {
        const parts = relPath.split('/');
        if (parts.length >= 2 && parts[1] !== lessonFilter) {
          return;
        }
      }

      const content = readFileSync(filePath);
      const md5 = createHash('md5').update(content).digest('hex');
      const stat = statSync(filePath);

      files.push({
        localPath: filePath,
        relPath,
        r2Key: `${config.assetVersion}/${relPath}`,
        size: stat.size,
        md5,
        contentType: getContentType(ext),
      });
    });
  }

  return files.sort((a, b) => a.r2Key.localeCompare(b.r2Key));
}

function walkDir(dir, callback) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) {
      continue;
    }

    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, callback);
    } else if (entry.isFile()) {
      callback(fullPath);
    }
  }
}

function getContentType(ext) {
  const types = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg',
  };
  return types[ext] ?? 'application/octet-stream';
}

// ---------------------------------------------------------------------------
// S3-compatible API helpers (using native fetch, no AWS SDK needed)
// ---------------------------------------------------------------------------

function sha256Hex(data) {
  return createHash('sha256').update(data).digest('hex');
}

async function signRequest(method, path, headers, body) {
  const { createHmac } = await import('node:crypto');

  const now = new Date();
  const dateStamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 8);
  const amzDate = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const region = 'auto';
  const service = 's3';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

  headers['x-amz-date'] = amzDate;
  headers['x-amz-content-sha256'] = sha256Hex(body ?? '');

  const url = new URL(`${S3_ENDPOINT}${path}`);
  const signedHeaderKeys = Object.keys(headers)
    .map(k => k.toLowerCase())
    .sort();
  const signedHeaders = signedHeaderKeys.join(';');

  const canonicalHeaders = signedHeaderKeys
    .map(k => `${k}:${headers[Object.keys(headers).find(h => h.toLowerCase() === k)].trim()}`)
    .join('\n');

  const canonicalRequest = [
    method,
    url.pathname,
    '', // query string
    canonicalHeaders + '\n',
    signedHeaders,
    headers['x-amz-content-sha256'],
  ].join('\n');

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n');

  // Derive signing key
  let signingKey = Buffer.from(`AWS4${config.secretAccessKey}`);
  for (const part of [dateStamp, region, service, 'aws4_request']) {
    signingKey = createHmac('sha256', signingKey).update(part).digest();
  }

  const signature = createHmac('sha256', signingKey)
    .update(stringToSign)
    .digest('hex');

  headers['Authorization'] = [
    `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`,
  ].join(', ');

  return headers;
}

async function uploadFile(file) {
  const body = readFileSync(file.localPath);
  const path = `/${config.bucketName}/${file.r2Key}`;
  const headers = {
    'Content-Type': file.contentType,
    'Content-Length': String(body.length),
    'Host': new URL(S3_ENDPOINT).host,
    'Cache-Control': 'public, max-age=31536000, immutable',
  };

  await signRequest('PUT', path, headers, body);

  const response = await fetch(`${S3_ENDPOINT}${path}`, {
    method: 'PUT',
    headers,
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upload failed for ${file.r2Key}: ${response.status} ${text}`);
  }
}

async function fetchRemoteManifest() {
  const path = `/${config.bucketName}/manifest.json`;
  const headers = {
    'Host': new URL(S3_ENDPOINT).host,
  };

  await signRequest('GET', path, headers, '');

  try {
    const response = await fetch(`${S3_ENDPOINT}${path}`, {
      method: 'GET',
      headers,
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`Remote manifest: ${Object.keys(data.files ?? {}).length} entries (version: ${data.version ?? '?'})`);
      return data;
    }

    if (response.status === 404) {
      console.log('Remote manifest: not found (first upload)');
      return { files: {} };
    }

    console.warn(`Warning: could not fetch manifest (${response.status}), uploading all files.`);
    return { files: {} };
  } catch (error) {
    console.warn(`Warning: could not fetch manifest: ${error.message}`);
    return { files: {} };
  }
}

function buildManifest(files) {
  const fileEntries = {};
  let totalSize = 0;

  for (const file of files) {
    fileEntries[file.relPath] = {
      size: file.size,
      md5: file.md5,
    };
    totalSize += file.size;
  }

  return {
    version: config.assetVersion,
    updatedAt: new Date().toISOString(),
    totalFiles: files.length,
    totalSizeBytes: totalSize,
    files: fileEntries,
  };
}

async function uploadManifest(manifest) {
  const body = Buffer.from(JSON.stringify(manifest, null, 2));
  const path = `/${config.bucketName}/manifest.json`;
  const headers = {
    'Content-Type': 'application/json',
    'Content-Length': String(body.length),
    'Host': new URL(S3_ENDPOINT).host,
    'Cache-Control': 'no-cache',
  };

  await signRequest('PUT', path, headers, body);

  const response = await fetch(`${S3_ENDPOINT}${path}`, {
    method: 'PUT',
    headers,
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Manifest upload failed: ${response.status} ${text}`);
  }
}

function formatSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
