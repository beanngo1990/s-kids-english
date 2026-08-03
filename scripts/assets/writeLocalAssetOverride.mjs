import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const overridePath = resolve(process.cwd(), 'src/config/remoteAssetOverrides.local.ts');
const localPreviewPaths = [
  overridePath,
  resolve(process.cwd(), 'src/data/audioManifest.local.ts'),
  resolve(process.cwd(), 'src/config/localAudioPreview.local.ts'),
];
const shouldClear = process.argv.includes('--clear');

if (shouldClear) {
  let removedCount = 0;
  for (const localPreviewPath of localPreviewPaths) {
    if (existsSync(localPreviewPath)) {
      unlinkSync(localPreviewPath);
      removedCount++;
      console.log(`Removed ${localPreviewPath}`);
    }
  }

  if (removedCount === 0) {
    console.log('No local asset or audio preview overrides found.');
  }
  process.exit(0);
}

const port = parsePort(getArgValue('--port') ?? '8787');
const host = getArgValue('--host') ?? '127.0.0.1';
const baseUrl = getArgValue('--base-url') ?? `http://${host}:${port}/v1`;

mkdirSync(dirname(overridePath), { recursive: true });
writeFileSync(
  overridePath,
  `import type { RemoteAssetOverrides } from './remoteAssetOverrides';\n\n` +
    `export const remoteAssetOverrides: RemoteAssetOverrides = {\n` +
    `  allowMissingLessonAudio: true,\n` +
    `  baseUrl: ${JSON.stringify(baseUrl)},\n` +
    `  cacheRemoteAssets: false,\n` +
    `  preferRemoteImages: true,\n` +
    `};\n`,
);

console.log(`Wrote ${overridePath}`);
console.log(`Local asset base URL: ${baseUrl}`);

function getArgValue(name) {
  const prefix = `${name}=`;
  return process.argv.slice(2).find(arg => arg.startsWith(prefix))?.slice(prefix.length);
}

function parsePort(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(`Invalid --port value: ${value}`);
  }
  return parsed;
}
