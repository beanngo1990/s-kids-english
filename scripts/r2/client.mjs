import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { S3Client } from '@aws-sdk/client-s3';

import { imageReleaseVersion, repoRoot } from '../assets/config.mjs';

export function loadDotEnv(envPath = join(repoRoot, '.env')) {
  if (!existsSync(envPath)) {
    return;
  }
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const separator = trimmed.indexOf('=');
    if (separator < 0) {
      continue;
    }
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed
      .slice(separator + 1)
      .trim()
      .replace(/^(['"])(.*)\1$/u, '$2');
    process.env[key] ??= value;
  }
}

export function getR2Config() {
  loadDotEnv();
  const accountId = requireEnv('R2_ACCOUNT_ID');
  const accessKeyId = requireEnv('R2_ACCESS_KEY_ID');
  const secretAccessKey = requireEnv('R2_SECRET_ACCESS_KEY');
  const bucketName = requireEnv('R2_BUCKET_NAME');
  const assetVersion = process.env.ASSET_VERSION ?? imageReleaseVersion;
  return {
    accountId,
    assetVersion,
    bucketName,
    client: new S3Client({
      credentials: { accessKeyId, secretAccessKey },
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      forcePathStyle: true,
      region: 'auto',
    }),
    publicUrl: (process.env.R2_PUBLIC_URL ?? '').replace(/\/+$/u, ''),
  };
}

export function getArgValue(name) {
  const prefix = `${name}=`;
  return process.argv.slice(2).find(arg => arg.startsWith(prefix))?.slice(prefix.length);
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env and configure R2 credentials.`,
    );
  }
  return value;
}
