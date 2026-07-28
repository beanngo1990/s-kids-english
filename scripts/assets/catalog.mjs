import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, extname, join, resolve } from 'node:path';

import ts from 'typescript';

import { repoRoot, toPosixPath } from './config.mjs';

const nodeRequire = createRequire(import.meta.url);
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

export function loadLessons() {
  const lessonsModule = loadTsModule(join(repoRoot, 'src/data/lessons.ts'));
  const lessons = lessonsModule.lessons ?? [];
  if (!Array.isArray(lessons) || lessons.length === 0) {
    throw new Error('No lessons found in src/data/lessons.ts');
  }
  return lessons;
}

export function collectImageUsages() {
  const usages = new Map();

  const addUsage = ({ lessonId, maxPercent = 0, role, sceneId, source }) => {
    if (!source || !/^lessons\/.+\/images\/.+\.(?:png|jpe?g|webp)$/iu.test(source)) {
      return;
    }
    const normalizedSource = toPosixPath(source);
    const current = usages.get(normalizedSource) ?? {
      lessonIds: new Set(),
      maxPercent: 0,
      roles: new Set(),
      sceneIds: new Set(),
      source: normalizedSource,
    };
    current.lessonIds.add(lessonId);
    current.sceneIds.add(sceneId);
    current.roles.add(role);
    current.maxPercent = Math.max(current.maxPercent, maxPercent);
    usages.set(normalizedSource, current);
  };

  for (const lesson of loadLessons()) {
    for (const scene of lesson.scenes ?? []) {
      addUsage({
        lessonId: lesson.id,
        maxPercent: 100,
        role: 'background',
        sceneId: scene.id,
        source: scene.background?.source,
      });

      if (scene.character?.asset?.source) {
        addUsage({
          lessonId: lesson.id,
          maxPercent: maxPositionPercent(scene.character.position),
          role: 'character',
          sceneId: scene.id,
          source: scene.character.asset.source,
        });
      }

      for (const object of scene.objects ?? []) {
        addUsage({
          lessonId: lesson.id,
          maxPercent: maxPositionPercent(object.position),
          role: object.role === 'character' ? 'character' : 'object',
          sceneId: scene.id,
          source: object.asset?.source,
        });
      }

      for (const step of scene.steps ?? []) {
        for (const effect of step.effects ?? []) {
          addUsage({
            lessonId: lesson.id,
            role: 'effect',
            sceneId: scene.id,
            source: effect.asset?.source,
          });
        }
      }
    }
  }

  return [...usages.values()]
    .map(usage => ({
      ...usage,
      lessonIds: [...usage.lessonIds].sort(),
      roles: [...usage.roles].sort(),
      sceneIds: [...usage.sceneIds].sort(),
    }))
    .sort((a, b) => a.source.localeCompare(b.source));
}

export function walkFiles(root, predicate = () => true) {
  if (!existsSync(root)) {
    return [];
  }
  const files = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const fullPath = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath, predicate));
    } else if (entry.isFile() && predicate(fullPath)) {
      files.push(fullPath);
    }
  }
  return files;
}

function maxPositionPercent(position) {
  if (!position) {
    return 0;
  }
  return Math.max(position.width ?? 0, position.height ?? 0);
}
