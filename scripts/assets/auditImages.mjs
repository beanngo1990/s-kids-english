import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';

import sharp from 'sharp';

import { collectImageUsages, walkFiles } from './catalog.mjs';
import {
  assetsRoot,
  lessonAssetsRoot,
  reportRoot,
  selectProfile,
  toMasterPath,
  toPosixPath,
  toRuntimePath,
} from './config.mjs';

const lessonFilter = getArgValue('--lesson');
const usages = collectImageUsages().filter(
  usage => !lessonFilter || usage.lessonIds.includes(lessonFilter),
);
const referenced = new Set(usages.map(usage => usage.source));
const runtimeImages = walkFiles(
  lessonAssetsRoot,
  filePath => /\.(?:png|jpe?g|webp)$/iu.test(filePath),
)
  .map(toRuntimePath)
  .filter(
    source => !lessonFilter || source.startsWith(`lessons/${lessonFilter}/`),
  );

const records = [];
for (const usage of usages) {
  const runtimePath = join(assetsRoot, usage.source);
  const masterPath = toMasterPath(usage.source);
  const inspectedPath = existsSync(runtimePath)
    ? runtimePath
    : existsSync(masterPath)
      ? masterPath
      : undefined;
  const profile = selectProfile(usage);
  if (!inspectedPath) {
    records.push({ ...usage, missing: true, profile: profile.name });
    continue;
  }

  const metadata = await sharp(inspectedPath).metadata();
  const bytes = statSync(inspectedPath).size;
  const sha256 = createHash('sha256')
    .update(readFileSync(inspectedPath))
    .digest('hex');
  records.push({
    ...usage,
    bytes,
    channels: metadata.channels,
    format: metadata.format,
    hasAlpha: metadata.hasAlpha ?? false,
    height: metadata.height,
    maxEdge: profile.options.maxEdge,
    oversized:
      Math.max(metadata.width ?? 0, metadata.height ?? 0) >
      profile.options.maxEdge * 1.5,
    profile: profile.name,
    sha256,
    width: metadata.width,
  });
}

const orphaned = runtimeImages
  .filter(source => !referenced.has(source))
  .sort();
const duplicateGroups = Object.values(
  records.reduce((groups, record) => {
    if (!record.sha256) {
      return groups;
    }
    groups[record.sha256] ??= [];
    groups[record.sha256].push(record.source);
    return groups;
  }, {}),
).filter(group => group.length > 1);

const report = {
  duplicateGroups,
  generatedAt: new Date().toISOString(),
  orphaned,
  records,
  summary: {
    bytes: records.reduce((sum, record) => sum + (record.bytes ?? 0), 0),
    duplicates: duplicateGroups.length,
    missing: records.filter(record => record.missing).length,
    orphaned: orphaned.length,
    oversized: records.filter(record => record.oversized).length,
    referenced: records.length,
  },
};

mkdirSync(reportRoot, { recursive: true });
writeFileSync(
  join(reportRoot, `image-audit${lessonFilter ? `-${lessonFilter}` : ''}.json`),
  `${JSON.stringify(report, null, 2)}\n`,
);

console.log(`Referenced images : ${report.summary.referenced}`);
console.log(`Missing           : ${report.summary.missing}`);
console.log(`Orphaned          : ${report.summary.orphaned}`);
console.log(`Oversized         : ${report.summary.oversized}`);
console.log(`Duplicate groups  : ${report.summary.duplicates}`);
console.log(`Inspected size    : ${formatSize(report.summary.bytes)}`);
if (orphaned.length > 0) {
  console.log('\nOrphaned runtime images:');
  orphaned.forEach(source => console.log(`  - ${source}`));
}
if (report.summary.missing > 0) {
  process.exitCode = 1;
}

function getArgValue(name) {
  const prefix = `${name}=`;
  return process.argv.slice(2).find(arg => arg.startsWith(prefix))?.slice(prefix.length);
}

function formatSize(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MiB`;
}
