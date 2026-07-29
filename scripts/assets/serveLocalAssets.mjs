import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { resolve, sep } from 'node:path';

const port = parsePort(getArgValue('--port') ?? '8787');
const host = getArgValue('--host') ?? '127.0.0.1';
const releasePath = stripSlashes(getArgValue('--release') ?? 'v1');
const assetRoot = resolve(process.cwd(), getArgValue('--root') ?? 'src/assets');

const server = createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end();
    return;
  }

  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
  const assetPath = resolveAssetPath(url.pathname);
  if (!assetPath) {
    response.writeHead(400);
    response.end('Invalid asset path');
    return;
  }

  if (!existsSync(assetPath) || !statSync(assetPath).isFile()) {
    response.writeHead(404);
    response.end('Asset not found');
    return;
  }

  response.writeHead(200, {
    'Cache-Control': 'no-store',
    'Content-Type': getContentType(assetPath),
  });
  if (request.method === 'HEAD') {
    response.end();
    return;
  }

  createReadStream(assetPath).pipe(response);
});

server.listen(port, host, () => {
  const baseUrl = `http://${host}:${port}/${releasePath}`;
  console.log('Serving local SKids assets');
  console.log(`Root    : ${assetRoot}`);
  console.log(`Base URL: ${baseUrl}`);
  console.log('');
  console.log('Android device over USB: adb reverse tcp:8787 tcp:8787, then use http://127.0.0.1:8787/v1');
  console.log('Android emulator       : use http://10.0.2.2:8787/v1');
  console.log('iOS simulator          : use http://localhost:8787/v1');
});

function resolveAssetPath(pathname) {
  const decodedPath = decodeURIComponent(pathname);
  const pathParts = decodedPath.split('/').filter(Boolean);
  const relativeParts =
    pathParts[0] === releasePath ? pathParts.slice(1) : pathParts;
  const resolvedPath = resolve(assetRoot, ...relativeParts);
  const isWithinRoot =
    resolvedPath === assetRoot || resolvedPath.startsWith(`${assetRoot}${sep}`);

  return isWithinRoot ? resolvedPath : undefined;
}

function getContentType(filePath) {
  if (/\.webp$/iu.test(filePath)) {
    return 'image/webp';
  }
  if (/\.png$/iu.test(filePath)) {
    return 'image/png';
  }
  if (/\.jpe?g$/iu.test(filePath)) {
    return 'image/jpeg';
  }
  if (/\.json$/iu.test(filePath)) {
    return 'application/json';
  }
  if (/\.wav$/iu.test(filePath)) {
    return 'audio/wav';
  }
  return 'application/octet-stream';
}

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

function stripSlashes(value) {
  return value.replace(/^\/+|\/+$/gu, '');
}
