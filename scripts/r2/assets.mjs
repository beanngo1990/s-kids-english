import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

import { walkFiles } from '../assets/catalog.mjs';
import { assetsRoot, manifestPath } from '../assets/config.mjs';

const audioExtensions = new Set(['.mp3', '.ogg', '.wav']);

export function collectUploadFiles({ assetVersion, lessonFilter } = {}) {
  if (!existsSync(manifestPath)) {
    throw new Error('Missing src/assets/asset-manifest.json. Run assets:build first.');
  }
  const imageManifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const imageFiles = imageManifest.entries
    .filter(
      entry =>
        !lessonFilter || entry.output.startsWith(`lessons/${lessonFilter}/`),
    )
    .map(entry => createFileRecord(entry.output, assetVersion));

  const audioFiles = [join(assetsRoot, 'lessons'), join(assetsRoot, 'shared')]
    .flatMap(root =>
      walkFiles(root, filePath => audioExtensions.has(extname(filePath).toLowerCase())),
    )
    .map(filePath => filePath.slice(`${assetsRoot}/`.length).replaceAll('\\', '/'))
    .filter(
      relativePath =>
        !lessonFilter || relativePath.startsWith(`lessons/${lessonFilter}/`),
    )
    .map(relativePath => createFileRecord(relativePath, assetVersion));

  return [...imageFiles, ...audioFiles].sort((a, b) => a.key.localeCompare(b.key));
}

export function buildR2Manifest(files, assetVersion) {
  return {
    files: Object.fromEntries(
      files.map(file => [file.relativePath, {
        contentType: file.contentType,
        sha256: file.sha256,
        size: file.size,
      }]),
    ),
    totalFiles: files.length,
    totalSizeBytes: files.reduce((sum, file) => sum + file.size, 0),
    updatedAt: new Date().toISOString(),
    version: assetVersion,
  };
}

function createFileRecord(relativePath, assetVersion) {
  const localPath = join(assetsRoot, relativePath);
  if (!existsSync(localPath)) {
    throw new Error(`Missing upload asset: ${relativePath}`);
  }
  const content = readFileSync(localPath);
  return {
    contentType: getContentType(extname(relativePath).toLowerCase()),
    key: `${assetVersion}/${relativePath}`,
    localPath,
    relativePath,
    sha256: createHash('sha256').update(content).digest('hex'),
    size: statSync(localPath).size,
  };
}

function getContentType(extension) {
  const types = {
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg',
    '.wav': 'audio/wav',
    '.webp': 'image/webp',
  };
  return types[extension] ?? 'application/octet-stream';
}
