import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

const nodeRequire = createRequire(import.meta.url);
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const endpoint = 'https://texttospeech.googleapis.com/v1/text:synthesize';

const args = parseArgs(process.argv.slice(2));
const audioConfig = {
  audioEncoding: 'LINEAR16',
  sampleRateHertz: Number(process.env.GOOGLE_TTS_SAMPLE_RATE ?? 24000),
};
const voices = {
  en: {
    languageCode: 'en-US',
    name: process.env.GOOGLE_TTS_EN_VOICE ?? 'en-US-Chirp3-HD-Aoede',
  },
  vi: {
    languageCode: 'vi-VN',
    name: process.env.GOOGLE_TTS_VI_VOICE ?? 'vi-VN-Chirp3-HD-Aoede',
  },
};
const legacyViAudioKeyByText = new Map(
  [
    [
      'Mình bắt đầu với cái giường nhé.',
      'lessons/morning-routine/bedroom/audio/vi/teach_bed_intro.wav',
    ],
    [
      'Đây là cái giường.',
      'lessons/morning-routine/bedroom/audio/vi/bed_meaning.wav',
    ],
    [
      'Chạm vào cái giường nhé.',
      'lessons/morning-routine/bedroom/audio/vi/tap_bed.wav',
    ],
    [
      'Thử chạm cái giường nhé.',
      'lessons/morning-routine/bedroom/audio/vi/tap_bed_fail.wav',
    ],
    [
      'Tiếp theo là cái chăn nhé.',
      'lessons/morning-routine/bedroom/audio/vi/teach_blanket_intro.wav',
    ],
    [
      'Đây là cái chăn.',
      'lessons/morning-routine/bedroom/audio/vi/blanket_meaning.wav',
    ],
    [
      'Kéo chăn gọn nào.',
      'lessons/morning-routine/bedroom/audio/vi/drag_blanket.wav',
    ],
    [
      'Gọn gàng quá!',
      'lessons/morning-routine/bedroom/audio/vi/blanket_success.wav',
    ],
    [
      'Kéo chăn vào vùng sáng nhé.',
      'lessons/morning-routine/bedroom/audio/vi/drag_blanket_fail.wav',
    ],
    [
      'Bây giờ mình nhìn mặt trời nhé.',
      'lessons/morning-routine/bedroom/audio/vi/teach_sun_intro.wav',
    ],
    [
      'Đây là mặt trời.',
      'lessons/morning-routine/bedroom/audio/vi/sun_meaning.wav',
    ],
    [
      'Chạm vào mặt trời cho sáng nhé.',
      'lessons/morning-routine/bedroom/audio/vi/tap_sun.wav',
    ],
    [
      'Mặt trời đang ở trên cao đó.',
      'lessons/morning-routine/bedroom/audio/vi/sun_fail.wav',
    ],
    [
      'Phòng sáng rồi!',
      'lessons/morning-routine/bedroom/audio/vi/sun_success.wav',
    ],
    [
      'Trên giường có cái gối.',
      'lessons/morning-routine/bedroom/audio/vi/teach_pillow_intro.wav',
    ],
    [
      'Đây là cái gối.',
      'lessons/morning-routine/bedroom/audio/vi/pillow_meaning.wav',
    ],
    [
      'Gối ở trên giường đó.',
      'lessons/morning-routine/bedroom/audio/vi/tap_pillow_fail.wav',
    ],
    [
      'Chạm vào cái gối nhé.',
      'lessons/morning-routine/bedroom/audio/vi/tap_pillow.wav',
    ],
    [
      'Đúng rồi, đó là cái gối.',
      'lessons/morning-routine/bedroom/audio/vi/pillow_success.wav',
    ],
    [
      'Đây là cái đèn ngủ.',
      'lessons/morning-routine/bedroom/audio/vi/teach_lamp_intro.wav',
    ],
    [
      'Từ này nghĩa là đèn ngủ.',
      'lessons/morning-routine/bedroom/audio/vi/lamp_meaning.wav',
    ],
    [
      'Đèn ngủ ở cạnh giường đó.',
      'lessons/morning-routine/bedroom/audio/vi/tap_lamp_fail.wav',
    ],
    [
      'Chạm vào đèn ngủ nhé.',
      'lessons/morning-routine/bedroom/audio/vi/tap_lamp.wav',
    ],
    [
      'Con tìm thấy đèn ngủ rồi!',
      'lessons/morning-routine/bedroom/audio/vi/lamp_success.wav',
    ],
    [
      'Trên tường có cái đồng hồ.',
      'lessons/morning-routine/bedroom/audio/vi/teach_clock_intro.wav',
    ],
    [
      'Từ này nghĩa là đồng hồ.',
      'lessons/morning-routine/bedroom/audio/vi/clock_meaning.wav',
    ],
    [
      'Đồng hồ ở trên tường đó.',
      'lessons/morning-routine/bedroom/audio/vi/tap_clock_fail.wav',
    ],
    [
      'Chạm vào đồng hồ nhé.',
      'lessons/morning-routine/bedroom/audio/vi/tap_clock.wav',
    ],
    [
      'Đúng rồi, đó là đồng hồ.',
      'lessons/morning-routine/bedroom/audio/vi/clock_success.wav',
    ],
    [
      'Đây là cái hộp.',
      'lessons/morning-routine/bedroom/audio/vi/teach_box_intro.wav',
    ],
    [
      'Từ này nghĩa là cái hộp.',
      'lessons/morning-routine/bedroom/audio/vi/box_meaning.wav',
    ],
    [
      'Cái hộp ở bên phải đó.',
      'lessons/morning-routine/bedroom/audio/vi/tap_box_fail.wav',
    ],
    [
      'Chạm vào cái hộp nhé.',
      'lessons/morning-routine/bedroom/audio/vi/tap_box.wav',
    ],
    [
      'Đúng rồi, đó là cái hộp.',
      'lessons/morning-routine/bedroom/audio/vi/box_success.wav',
    ],
    [
      'Đây là đôi tất.',
      'lessons/morning-routine/bedroom/audio/vi/teach_socks_intro.wav',
    ],
    [
      'Từ này nghĩa là đôi tất.',
      'lessons/morning-routine/bedroom/audio/vi/socks_meaning.wav',
    ],
    [
      'Đôi tất ở gần giường đó.',
      'lessons/morning-routine/bedroom/audio/vi/tap_socks_fail.wav',
    ],
    [
      'Chạm vào đôi tất nhé.',
      'lessons/morning-routine/bedroom/audio/vi/tap_socks.wav',
    ],
    [
      'Con tìm thấy đôi tất rồi!',
      'lessons/morning-routine/bedroom/audio/vi/socks_success.wav',
    ],
    [
      'Đây là búp bê.',
      'lessons/morning-routine/bedroom/audio/vi/teach_doll_intro.wav',
    ],
    [
      'Từ này nghĩa là búp bê.',
      'lessons/morning-routine/bedroom/audio/vi/doll_meaning.wav',
    ],
    [
      'Búp bê ở cạnh giường đó.',
      'lessons/morning-routine/bedroom/audio/vi/tap_doll_fail.wav',
    ],
    [
      'Chạm vào búp bê nhé.',
      'lessons/morning-routine/bedroom/audio/vi/tap_doll.wav',
    ],
    [
      'Đúng rồi, đó là búp bê.',
      'lessons/morning-routine/bedroom/audio/vi/doll_success.wav',
    ],
    [
      'Mình cùng chào buổi sáng nhé.',
      'lessons/morning-routine/bedroom/audio/vi/teach_good_morning_intro.wav',
    ],
    [
      'Câu này nghĩa là chào buổi sáng.',
      'lessons/morning-routine/bedroom/audio/vi/good_morning_meaning.wav',
    ],
    [
      'Mình học câu dọn giường nhé.',
      'lessons/morning-routine/bedroom/audio/vi/teach_make_the_bed_intro.wav',
    ],
    [
      'Câu này nghĩa là dọn giường.',
      'lessons/morning-routine/bedroom/audio/vi/make_the_bed_meaning.wav',
    ],
    [
      'Cất gối vào hộp nhé.',
      'lessons/morning-routine/bedroom/audio/vi/drag_pillow_to_box.wav',
    ],
    [
      'Kéo gối vào cái hộp nhé.',
      'lessons/morning-routine/bedroom/audio/vi/drag_pillow_to_box_fail.wav',
    ],
    [
      'Gối đã ở trong hộp rồi!',
      'lessons/morning-routine/bedroom/audio/vi/pillow_in_box_success.wav',
    ],
    [
      'Cất chăn vào hộp để dọn giường nhé.',
      'lessons/morning-routine/bedroom/audio/vi/drag_blanket_to_box.wav',
    ],
    [
      'Kéo chăn vào cái hộp nhé.',
      'lessons/morning-routine/bedroom/audio/vi/drag_blanket_to_box_fail.wav',
    ],
    [
      'Giường gọn gàng rồi!',
      'lessons/morning-routine/bedroom/audio/vi/make_the_bed_success.wav',
    ],
    [
      'Cất tất vào hộp nhé.',
      'lessons/morning-routine/bedroom/audio/vi/drag_socks_to_box.wav',
    ],
    [
      'Kéo tất vào cái hộp nhé.',
      'lessons/morning-routine/bedroom/audio/vi/drag_socks_to_box_fail.wav',
    ],
    [
      'Tất đã ở trong hộp rồi!',
      'lessons/morning-routine/bedroom/audio/vi/socks_in_box_success.wav',
    ],
  ].map(([text, key]) => [normalizeText(text), key]),
);

globalThis.__DEV__ = false;

const moduleCache = new Map();
const lessonsModule = loadTsModule(join(repoRoot, 'src/data/lessons.ts'));
const audioManifestModule = loadTsModule(
  join(repoRoot, 'src/data/audioManifest.ts'),
);
const speechPromptsModule = loadTsModule(
  join(repoRoot, 'src/data/speechPrompts.ts'),
);
const reviewGamePromptsModule = loadTsModule(
  join(repoRoot, 'src/data/reviewGamePrompts.ts'),
);
const mascotPromptsModule = loadTsModule(
  join(repoRoot, 'src/data/mascotPrompts.ts'),
);
const lessons = lessonsModule.lessons ?? [];
const existingWordAudio = audioManifestModule.getWordAudioAsset;
const existingViAudio = audioManifestModule.getViAudioAsset;

if (!Array.isArray(lessons) || lessons.length === 0) {
  throw new Error('No lessons found in src/data/lessons.ts');
}

const audioTargets = collectAudioTargets(lessons, {
  existingViAudio,
  existingWordAudio,
  mascotPrompts: mascotPromptsModule,
  reviewGamePrompts: reviewGamePromptsModule,
  speechPrompts: speechPromptsModule,
});
const selectedAudioTargets = collectAudioTargets(lessons, {
  existingViAudio,
  existingWordAudio,
  lessonId: args.lesson,
  mascotPrompts: mascotPromptsModule,
  reviewGamePrompts: reviewGamePromptsModule,
  sceneId: args.scene,
  speechPrompts: speechPromptsModule,
});
const missingTargets = selectedAudioTargets.filter(
  target => args.force || !existsSync(join(repoRoot, 'src/assets', target.key)),
);

printSummary(selectedAudioTargets, missingTargets);

if (args.dryRun) {
  printMissingTargets(missingTargets);
  process.exit(0);
}

if (!args.manifestOnly) {
  const auth = getGoogleAuth();
  const limitedTargets =
    args.limit === undefined
      ? missingTargets
      : missingTargets.slice(0, args.limit);

  for (const [index, target] of limitedTargets.entries()) {
    await synthesizeTarget(target, auth);
    console.log(`wrote ${target.key} (${index + 1}/${limitedTargets.length})`);
  }

  if (args.limit !== undefined && missingTargets.length > args.limit) {
    console.log(
      `Skipped ${missingTargets.length - args.limit} file(s) because --limit=${
        args.limit
      }.`,
    );
  }
}

writeAudioManifest(audioTargets);
writeGeneratedAudioRegistry();

function parseArgs(rawArgs) {
  const options = {
    dryRun: false,
    force: false,
    lesson: undefined,
    limit: undefined,
    manifestOnly: false,
    scene: undefined,
  };

  for (const arg of rawArgs) {
    if (arg === '--dry-run' || arg === '-n') {
      options.dryRun = true;
      continue;
    }
    if (arg === '--force') {
      options.force = true;
      continue;
    }
    if (arg === '--manifest-only') {
      options.manifestOnly = true;
      continue;
    }
    if (arg.startsWith('--lesson=')) {
      options.lesson = arg.slice('--lesson='.length);
      continue;
    }
    if (arg.startsWith('--scene=')) {
      options.scene = arg.slice('--scene='.length);
      continue;
    }
    if (arg.startsWith('--limit=')) {
      const limit = Number(arg.slice('--limit='.length));
      if (!Number.isInteger(limit) || limit < 0) {
        throw new Error('--limit must be a non-negative integer.');
      }
      options.limit = limit;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (options.dryRun && options.manifestOnly) {
    throw new Error('Use either --dry-run or --manifest-only, not both.');
  }

  return options;
}

function printHelp() {
  console.log(
    `
Generate missing lesson audio with Google Cloud Text-to-Speech.

Usage:
  npm run generate:audio
  npm run generate:audio:dry-run
  node scripts/generateMissingAudio.mjs --lesson=morning-routine --scene=bathroom

Options:
  --dry-run, -n       List missing files without writing or calling Google TTS.
  --manifest-only    Rewrite audioManifest and GeneratedAudioRegistry only.
  --force            Regenerate files even if they already exist.
  --lesson=<id>      Limit to one lesson pack.
  --scene=<id>       Limit to one scene.
  --limit=<n>        Generate at most n missing files.

Auth:
  GOOGLE_TTS_API_KEY can be used directly, or the script will call:
  gcloud auth print-access-token --account=$GOOGLE_TTS_ACCOUNT
`.trim(),
  );
}

function collectAudioTargets(
  lessonCatalog,
  {
    existingViAudio,
    existingWordAudio,
    lessonId,
    mascotPrompts,
    reviewGamePrompts,
    sceneId,
    speechPrompts,
  },
) {
  const targets = new Map();

  for (const lesson of lessonCatalog) {
    if (lessonId && lesson.id !== lessonId) {
      continue;
    }

    for (const scene of lesson.scenes ?? []) {
      if (sceneId && scene.id !== sceneId) {
        continue;
      }

      for (const vocabularyItem of scene.vocabulary ?? []) {
        addWordTarget(targets, {
          existingWordAudio,
          lesson,
          scene,
          text: vocabularyItem.word,
        });
      }

      for (const step of scene.steps ?? []) {
        addViTarget(targets, {
          defaultKey: getStepAudioKey(
            lesson.id,
            scene.id,
            step.id,
            'instruction',
            step.instructionVi,
          ),
          existingViAudio,
          text: step.instructionVi,
        });
        addViTarget(targets, {
          defaultKey: getStepAudioKey(
            lesson.id,
            scene.id,
            step.id,
            'success',
            step.successFeedbackVi,
          ),
          existingViAudio,
          text: step.successFeedbackVi,
        });

        if (step.failFeedbackVi) {
          addViTarget(targets, {
            defaultKey: getStepAudioKey(
              lesson.id,
              scene.id,
              step.id,
              'fail',
              step.failFeedbackVi,
            ),
            existingViAudio,
            text: step.failFeedbackVi,
          });
        }
      }

      if (scene.completionReward?.messageVi) {
        addViTarget(targets, {
          defaultKey: getCompletionAudioKey(
            lesson.id,
            scene.id,
            scene.completionReward.messageVi,
          ),
          existingViAudio,
          text: scene.completionReward.messageVi,
        });
      }
    }
  }

  addSharedViTarget(targets, {
    defaultKey: 'shared/audio/vi/speak_prompt.wav',
    existingViAudio,
    text: speechPrompts.speakPracticePromptVi,
  });
  addSharedViTarget(targets, {
    defaultKey: 'shared/audio/vi/speak_encourage.wav',
    existingViAudio,
    text: 'Cô nghe rồi! Giỏi quá!',
  });
  addSharedViTarget(targets, {
    defaultKey: 'shared/audio/vi/correct.wav',
    existingViAudio,
    text: 'Đúng rồi! Bé giỏi quá!',
  });
  addSharedViTarget(targets, {
    defaultKey: 'shared/audio/vi/memory_game_intro.wav',
    existingViAudio,
    text: reviewGamePrompts.memoryGameIntroPromptVi,
  });
  for (const text of mascotPrompts.sungySpeechLines ?? []) {
    addSharedViTarget(targets, {
      defaultKey: getSungyAudioKey(text),
      existingViAudio,
      text,
    });
  }

  return Array.from(targets.values()).sort((left, right) =>
    left.key.localeCompare(right.key),
  );
}

function addWordTarget(targets, { existingWordAudio, lesson, scene, text }) {
  if (!text?.trim()) {
    return;
  }

  const existingAsset = existingWordAudio?.(text);
  const key =
    existingAsset?.key ??
    `lessons/${lesson.id}/${scene.id}/audio/en/${slug(text)}.wav`;

  addTarget(targets, {
    key,
    kind: 'word',
    language: 'en',
    lookupText: text,
    text: existingAsset?.text ?? text,
  });
}

function addViTarget(targets, { defaultKey, existingViAudio, text }) {
  if (!text?.trim()) {
    return;
  }

  const legacyKey = getLegacyViAudioKey(text);
  const existingAsset = existingViAudio?.(text);
  addTarget(targets, {
    key: legacyKey ?? existingAsset?.key ?? defaultKey,
    kind: 'vi',
    language: 'vi',
    lookupText: text,
    text: existingAsset?.text ?? text,
  });
}

function addSharedViTarget(targets, input) {
  addViTarget(targets, input);
}

function addTarget(targets, target) {
  const mapKey = `${target.kind}:${normalizeText(target.lookupText)}`;
  if (targets.has(mapKey)) {
    return;
  }

  targets.set(mapKey, target);
}

function getLegacyViAudioKey(text) {
  const key = legacyViAudioKeyByText.get(normalizeText(text));
  if (!key || !existsSync(join(repoRoot, 'src/assets', key))) {
    return undefined;
  }

  return key;
}

function getStepAudioKey(lessonId, sceneId, stepId, part, text) {
  const stepSlug = slug(stripScenePrefix(sceneId, stepId));
  const suffix = part === 'instruction' ? '' : `_${part}`;
  return `lessons/${lessonId}/${sceneId}/audio/vi/${stepSlug}${suffix}_${textDigest(
    text,
  )}.wav`;
}

function getCompletionAudioKey(lessonId, sceneId, text) {
  return `lessons/${lessonId}/${sceneId}/audio/vi/completion_${textDigest(
    text,
  )}.wav`;
}

function getSungyAudioKey(text) {
  return `shared/audio/vi/sungy/${slug(text)}_${textDigest(text)}.wav`;
}

function stripScenePrefix(sceneId, stepId) {
  const prefix = `${sceneId}-`;
  return stepId.startsWith(prefix) ? stepId.slice(prefix.length) : stepId;
}

function getGoogleAuth() {
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (apiKey) {
    return {
      endpoint: `${endpoint}?key=${encodeURIComponent(apiKey)}`,
      headers: {},
    };
  }

  const accessToken =
    process.env.GOOGLE_TTS_ACCESS_TOKEN ?? getGcloudAccessToken();
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };
  const project =
    process.env.GOOGLE_CLOUD_PROJECT ??
    process.env.GCLOUD_PROJECT ??
    'vertext-api-images';

  if (project) {
    headers['x-goog-user-project'] = project;
  }

  return {
    endpoint,
    headers,
  };
}

function getGcloudAccessToken() {
  const gcloudArgs = ['auth', 'print-access-token'];
  const account = process.env.GOOGLE_TTS_ACCOUNT ?? 'tomtatvui@gmail.com';

  gcloudArgs.push(`--account=${account}`);

  try {
    return execFileSync('gcloud', gcloudArgs, { encoding: 'utf8' }).trim();
  } catch (error) {
    throw new Error(
      [
        'Unable to get a Google access token.',
        'Set GOOGLE_TTS_API_KEY, GOOGLE_TTS_ACCESS_TOKEN, or sign in with gcloud.',
        error instanceof Error ? error.message : String(error),
      ].join('\n'),
    );
  }
}

async function synthesizeTarget(target, auth) {
  const response = await fetch(auth.endpoint, {
    body: JSON.stringify({
      audioConfig,
      input: { text: target.text },
      voice: voices[target.language],
    }),
    headers: {
      ...auth.headers,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(
      `${response.status} ${response.statusText}: ${await response.text()}`,
    );
  }

  const responseBody = await response.json();
  const outputPath = join(repoRoot, 'src/assets', target.key);

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, Buffer.from(responseBody.audioContent, 'base64'));
}

function writeAudioManifest(targets) {
  const wordTargets = targets.filter(target => target.kind === 'word');
  const viTargets = targets.filter(target => target.kind === 'vi');
  const manifestPath = join(repoRoot, 'src/data/audioManifest.ts');
  const lines = [
    'export type RemoteAudioAsset = {',
    '  key: string;',
    '  text: string;',
    '};',
    '',
    'const wordAudioByWord: Record<string, RemoteAudioAsset> = {',
    ...wordTargets.map(formatAudioMapEntry),
    '};',
    '',
    'const viAudioByText: Record<string, RemoteAudioAsset> = {',
    ...viTargets.map(formatAudioMapEntry),
    '};',
    '',
    'export function getWordAudioAsset(word: string) {',
    '  return wordAudioByWord[normalizeText(word)];',
    '}',
    '',
    'export function getViAudioAsset(text: string) {',
    '  return viAudioByText[normalizeText(text)];',
    '}',
    '',
    'function normalizeText(text: string) {',
    '  return text.trim().toLowerCase();',
    '}',
    '',
  ];

  writeFileSync(manifestPath, lines.join('\n'));
  console.log(`wrote ${formatRepoPath(manifestPath)}`);
}

function formatAudioMapEntry(target) {
  return [
    `  [normalizeText(${formatString(target.lookupText)})]: {`,
    `    key: ${formatString(target.key)},`,
    `    text: ${formatString(target.text)},`,
    '  },',
  ].join('\n');
}

function writeGeneratedAudioRegistry() {
  const registryPath = join(repoRoot, 'src/engine/GeneratedAudioRegistry.ts');
  const audioKeys = listFiles(join(repoRoot, 'src/assets'))
    .filter(filePath => ['.mp3', '.wav'].includes(extname(filePath)))
    .map(filePath => formatAssetKey(filePath))
    .sort((left, right) => left.localeCompare(right));
  const entries = audioKeys.map(
    key => `  '${key}': require('../assets/${key}'),`,
  );
  const lines = [
    "import type { ImageRequireSource } from 'react-native';",
    '',
    'export const generatedAudioRegistry: Record<string, ImageRequireSource> = {',
    ...entries,
    '};',
    '',
  ];

  writeFileSync(registryPath, lines.join('\n'));
  console.log(`wrote ${formatRepoPath(registryPath)}`);
}

function listFiles(rootDir) {
  if (!existsSync(rootDir)) {
    return [];
  }

  return readdirSync(rootDir, { withFileTypes: true }).flatMap(entry => {
    const entryPath = join(rootDir, entry.name);
    if (entry.isDirectory()) {
      return listFiles(entryPath);
    }

    return entry.isFile() ? [entryPath] : [];
  });
}

function formatAssetKey(filePath) {
  return filePath
    .replace(join(repoRoot, 'src/assets') + '/', '')
    .replaceAll('\\', '/');
}

function printSummary(targets, missingTargets) {
  console.log(`Audio targets: ${targets.length}`);
  console.log(`Missing files: ${missingTargets.length}`);

  if (args.lesson) {
    console.log(`Lesson filter: ${args.lesson}`);
  }

  if (args.scene) {
    console.log(`Scene filter: ${args.scene}`);
  }
}

function printMissingTargets(missingTargets) {
  if (missingTargets.length === 0) {
    return;
  }

  console.log('');
  for (const target of missingTargets) {
    console.log(`[${target.language}] ${target.key} <- ${target.text}`);
  }
}

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

function normalizeText(text) {
  return text.trim().toLowerCase();
}

function slug(text) {
  return normalizeText(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .replace(/[^a-z0-9]+/gu, '_')
    .replace(/^_+|_+$/gu, '');
}

function textDigest(text) {
  return createHash('sha1')
    .update(normalizeText(text))
    .digest('hex')
    .slice(0, 8);
}

function formatString(value) {
  return JSON.stringify(value);
}

function formatRepoPath(filePath) {
  return filePath.replace(`${repoRoot}/`, '');
}
