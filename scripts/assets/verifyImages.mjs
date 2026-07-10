import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

import sharp from 'sharp';

import { collectImageUsages, walkFiles } from './catalog.mjs';
import {
  assetsRoot,
  lessonAssetsRoot,
  manifestPath,
  reportRoot,
  selectProfile,
  toMasterPath,
  toRuntimePath,
  toWebpRuntimePath,
} from './config.mjs';

const lessonFilter = getArgValue('--lesson');
const usages = collectImageUsages().filter(
  usage => !lessonFilter || usage.lessonIds.includes(lessonFilter),
);
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const manifestEntries = new Map(
  manifest.entries.map(entry => [entry.output, entry]),
);
const errors = [];
const warnings = [];
const records = [];

for (const usage of usages) {
  const outputRuntime = toWebpRuntimePath(usage.source);
  const outputPath = join(assetsRoot, outputRuntime);
  const masterPath = toMasterPath(usage.source);
  const profile = selectProfile(usage);
  if (!existsSync(outputPath)) {
    errors.push(`Missing WebP output: ${outputRuntime}`);
    continue;
  }
  if (!existsSync(masterPath)) {
    errors.push(`Missing master PNG: ${masterPath}`);
    continue;
  }

  const [outputMetadata, masterMetadata] = await Promise.all([
    sharp(outputPath).metadata(),
    sharp(masterPath).metadata(),
  ]);
  const outputBuffer = readFileSync(outputPath);
  const entry = manifestEntries.get(outputRuntime);
  const outputSha256 = sha256(outputBuffer);
  if (outputMetadata.format !== 'webp') {
    errors.push(`Invalid format for ${outputRuntime}: ${outputMetadata.format}`);
  }
  if ((masterMetadata.hasAlpha ?? false) && !(outputMetadata.hasAlpha ?? false)) {
    errors.push(`Alpha channel lost: ${outputRuntime}`);
  }
  if (
    Math.max(outputMetadata.width ?? 0, outputMetadata.height ?? 0) >
    profile.options.maxEdge
  ) {
    errors.push(`Image exceeds ${profile.options.maxEdge}px: ${outputRuntime}`);
  }
  if (!entry) {
    errors.push(`Missing manifest entry: ${outputRuntime}`);
  } else if (entry.outputSha256 !== outputSha256) {
    errors.push(`Manifest hash mismatch: ${outputRuntime}`);
  }
  if (statSync(outputPath).size >= statSync(masterPath).size) {
    warnings.push(`WebP is not smaller than master: ${outputRuntime}`);
  }

  records.push({
    height: outputMetadata.height,
    masterBytes: statSync(masterPath).size,
    output: outputRuntime,
    outputBytes: statSync(outputPath).size,
    profile: profile.name,
    width: outputMetadata.width,
  });
}

if (usages.some(usage => usage.source.endsWith('.png'))) {
  warnings.push('Lesson data still contains PNG references; run assets:migrate.');
}

const expectedOutputs = new Set(usages.map(usage => toWebpRuntimePath(usage.source)));
const orphanedWebp = walkFiles(
  lessonAssetsRoot,
  filePath => filePath.endsWith('.webp'),
)
  .map(toRuntimePath)
  .filter(source => !expectedOutputs.has(source));
for (const source of orphanedWebp) {
  warnings.push(`Orphaned WebP output: ${source}`);
}

const report = {
  errors,
  generatedAt: new Date().toISOString(),
  records,
  summary: {
    masterBytes: records.reduce((sum, record) => sum + record.masterBytes, 0),
    outputBytes: records.reduce((sum, record) => sum + record.outputBytes, 0),
    referenced: usages.length,
  },
  warnings,
};
mkdirSync(reportRoot, { recursive: true });
writeFileSync(
  join(reportRoot, `image-verification${lessonFilter ? `-${lessonFilter}` : ''}.json`),
  `${JSON.stringify(report, null, 2)}\n`,
);

console.log(`Verified : ${records.length}/${usages.length}`);
console.log(`Errors   : ${errors.length}`);
console.log(`Warnings : ${warnings.length}`);
console.log(`Master   : ${formatSize(report.summary.masterBytes)}`);
console.log(`WebP     : ${formatSize(report.summary.outputBytes)}`);
if (report.summary.masterBytes > 0) {
  console.log(
    `Saved    : ${((1 - report.summary.outputBytes / report.summary.masterBytes) * 100).toFixed(1)}%`,
  );
}
errors.forEach(error => console.error(`ERROR: ${error}`));
warnings.forEach(warning => console.warn(`WARN: ${warning}`));
if (errors.length > 0) {
  process.exitCode = 1;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function getArgValue(name) {
  const prefix = `${name}=`;
  return process.argv.slice(2).find(arg => arg.startsWith(prefix))?.slice(prefix.length);
}

function formatSize(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MiB`;
}
