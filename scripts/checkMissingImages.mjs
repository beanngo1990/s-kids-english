import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

const nodeRequire = createRequire(import.meta.url);
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = join(repoRoot, 'src/assets');

const moduleCache = new Map();

function loadTsModule(filePath) {
  const absolutePath = resolve(filePath);
  const cachedModule = moduleCache.get(absolutePath);

  if (cachedModule) {
    return cachedModule.exports;
  }

  const module = { exports: {} };
  moduleCache.set(absolutePath, module);

  const source = readFileSync(absolutePath, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: absolutePath,
  }).outputText;
  
  const localRequire = request => {
    if (request.startsWith('.')) {
      return loadTsModule(resolveImport(dirname(absolutePath), request));
    }

    return nodeRequire(request);
  };

  const compiledModule = new Function(
    'exports',
    'require',
    'module',
    '__filename',
    '__dirname',
    output,
  );
  
  compiledModule(
    module.exports,
    localRequire,
    module,
    absolutePath,
    dirname(absolutePath),
  );

  return module.exports;
}

function resolveImport(baseDir, request) {
  const requestedPath = resolve(baseDir, request);
  const candidates = extname(requestedPath)
    ? [requestedPath]
    : [
        requestedPath,
        `${requestedPath}.ts`,
        `${requestedPath}.tsx`,
        `${requestedPath}.js`,
        join(requestedPath, 'index.ts'),
        join(requestedPath, 'index.tsx'),
        join(requestedPath, 'index.js'),
      ];
  const resolvedPath = candidates.find(candidate => existsSync(candidate));

  if (!resolvedPath) {
    throw new Error(`Cannot resolve import "${request}" from ${baseDir}`);
  }

  return resolvedPath;
}

function checkMissingImages() {
  const lessonsModule = loadTsModule(join(repoRoot, 'src/data/lessons.ts'));
  const lessons = lessonsModule.lessons ?? [];

  if (!Array.isArray(lessons) || lessons.length === 0) {
    throw new Error('No lessons found in src/data/lessons.ts');
  }

  const allImages = new Set();
  
  // Extract all images
  for (const lesson of lessons) {
    for (const scene of lesson.scenes ?? []) {
      if (scene.background && scene.background.type === 'image' && scene.background.source) {
        allImages.add(scene.background.source);
      }
      
      if (scene.character && scene.character.asset && scene.character.asset.type === 'sprite' && scene.character.asset.source) {
        allImages.add(scene.character.asset.source);
      }
      
      for (const obj of scene.objects ?? []) {
        if (obj.asset && (obj.asset.type === 'image' || obj.asset.type === 'sprite') && obj.asset.source) {
          allImages.add(obj.asset.source);
        }
      }
      
      // Also check if any effects use images? effects typically use sound or animation
      for (const step of scene.steps ?? []) {
        for (const effect of step.effects ?? []) {
          if (effect.asset && (effect.asset.type === 'image' || effect.asset.type === 'sprite') && effect.asset.source) {
            allImages.add(effect.asset.source);
          }
        }
      }
    }
  }

  const missingImages = [];
  
  for (const imageSource of allImages) {
    const fullPath = join(assetsDir, imageSource);
    if (!existsSync(fullPath)) {
      missingImages.push(imageSource);
    }
  }

  console.log(`Total image assets referenced: ${allImages.size}`);
  
  if (missingImages.length === 0) {
    console.log('✅ No missing images found!');
  } else {
    console.log(`❌ Found ${missingImages.length} missing images:\n`);
    for (const missing of missingImages.sort()) {
      console.log(`  - ${missing}`);
    }
    process.exitCode = 1;
  }
}

checkMissingImages();
