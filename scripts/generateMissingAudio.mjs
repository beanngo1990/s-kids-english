import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  renameSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import { trimWavSilence } from './audioSilence.mjs';

const nodeRequire = createRequire(import.meta.url);
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const endpoint = 'https://texttospeech.googleapis.com/v1/text:synthesize';
const englishGenerationManifestPath = join(
  repoRoot,
  'src/data/englishAudioGenerationManifest.json',
);
const uiAudioRegistryPath = join(
  repoRoot,
  'src/engine/GeneratedUiAudioRegistry.ts',
);
const localAudioManifestPath = join(
  repoRoot,
  'src/data/audioManifest.local.ts',
);
const localAudioPreviewConfigPath = join(
  repoRoot,
  'src/config/localAudioPreview.local.ts',
);
const ENGLISH_ACCENTS = ['en-US', 'en-GB'];
const DEFAULT_AUDIO_RELEASE = 'neural2-c-r1';
const DEFAULT_CONCURRENCY = 4;
const MAX_CONCURRENCY = 8;
const MAX_TTS_ATTEMPTS = 3;
const MIN_WAV_DURATION_SECONDS = 0.1;

const args = parseArgs(process.argv.slice(2));
const englishAudioConfig = {
  audioEncoding: 'LINEAR16',
  sampleRateHertz: 24000,
  speakingRate: 0.9,
};
const viSampleRateHertz = Number(process.env.GOOGLE_TTS_SAMPLE_RATE ?? 24000);
if (!Number.isInteger(viSampleRateHertz) || viSampleRateHertz <= 0) {
  throw new Error('GOOGLE_TTS_SAMPLE_RATE must be a positive integer.');
}
const viAudioConfig = {
  audioEncoding: 'LINEAR16',
  sampleRateHertz: viSampleRateHertz,
};
const voices = {
  'en-US': {
    languageCode: 'en-US',
    name: 'en-US-Neural2-C',
  },
  'en-GB': {
    languageCode: 'en-GB',
    name: 'en-GB-Neural2-C',
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
      'lessons/morning-routine/bedroom/audio/vi/teach_bed_intro.mp3',
    ],
    [
      'Đây là cái giường.',
      'lessons/morning-routine/bedroom/audio/vi/bed_meaning.mp3',
    ],
    [
      'Chạm vào cái giường nhé.',
      'lessons/morning-routine/bedroom/audio/vi/tap_bed.mp3',
    ],
    [
      'Thử chạm cái giường nhé.',
      'lessons/morning-routine/bedroom/audio/vi/tap_bed_fail.mp3',
    ],
    [
      'Tiếp theo là cái chăn nhé.',
      'lessons/morning-routine/bedroom/audio/vi/teach_blanket_intro.mp3',
    ],
    [
      'Đây là cái chăn.',
      'lessons/morning-routine/bedroom/audio/vi/blanket_meaning.mp3',
    ],
    [
      'Kéo chăn gọn nào.',
      'lessons/morning-routine/bedroom/audio/vi/drag_blanket.mp3',
    ],
    [
      'Gọn gàng quá!',
      'lessons/morning-routine/bedroom/audio/vi/blanket_success.mp3',
    ],
    [
      'Kéo chăn vào vùng sáng nhé.',
      'lessons/morning-routine/bedroom/audio/vi/drag_blanket_fail.mp3',
    ],
    [
      'Bây giờ mình nhìn mặt trời nhé.',
      'lessons/morning-routine/bedroom/audio/vi/teach_sun_intro.mp3',
    ],
    [
      'Đây là mặt trời.',
      'lessons/morning-routine/bedroom/audio/vi/sun_meaning.mp3',
    ],
    [
      'Chạm vào mặt trời cho sáng nhé.',
      'lessons/morning-routine/bedroom/audio/vi/tap_sun.mp3',
    ],
    [
      'Mặt trời đang ở trên cao đó.',
      'lessons/morning-routine/bedroom/audio/vi/sun_fail.mp3',
    ],
    [
      'Phòng sáng rồi!',
      'lessons/morning-routine/bedroom/audio/vi/sun_success.mp3',
    ],
    [
      'Trên giường có cái gối.',
      'lessons/morning-routine/bedroom/audio/vi/teach_pillow_intro.mp3',
    ],
    [
      'Đây là cái gối.',
      'lessons/morning-routine/bedroom/audio/vi/pillow_meaning.mp3',
    ],
    [
      'Gối ở trên giường đó.',
      'lessons/morning-routine/bedroom/audio/vi/tap_pillow_fail.mp3',
    ],
    [
      'Chạm vào cái gối nhé.',
      'lessons/morning-routine/bedroom/audio/vi/tap_pillow.mp3',
    ],
    [
      'Đúng rồi, đó là cái gối.',
      'lessons/morning-routine/bedroom/audio/vi/pillow_success.mp3',
    ],
    [
      'Đây là cái đèn ngủ.',
      'lessons/morning-routine/bedroom/audio/vi/teach_lamp_intro.mp3',
    ],
    [
      'Từ này nghĩa là đèn ngủ.',
      'lessons/morning-routine/bedroom/audio/vi/lamp_meaning.mp3',
    ],
    [
      'Đèn ngủ ở cạnh giường đó.',
      'lessons/morning-routine/bedroom/audio/vi/tap_lamp_fail.mp3',
    ],
    [
      'Chạm vào đèn ngủ nhé.',
      'lessons/morning-routine/bedroom/audio/vi/tap_lamp.mp3',
    ],
    [
      'Con tìm thấy đèn ngủ rồi!',
      'lessons/morning-routine/bedroom/audio/vi/lamp_success.mp3',
    ],
    [
      'Trên tường có cái đồng hồ.',
      'lessons/morning-routine/bedroom/audio/vi/teach_clock_intro.mp3',
    ],
    [
      'Từ này nghĩa là đồng hồ.',
      'lessons/morning-routine/bedroom/audio/vi/clock_meaning.mp3',
    ],
    [
      'Đồng hồ ở trên tường đó.',
      'lessons/morning-routine/bedroom/audio/vi/tap_clock_fail.mp3',
    ],
    [
      'Chạm vào đồng hồ nhé.',
      'lessons/morning-routine/bedroom/audio/vi/tap_clock.mp3',
    ],
    [
      'Đúng rồi, đó là đồng hồ.',
      'lessons/morning-routine/bedroom/audio/vi/clock_success.mp3',
    ],
    [
      'Đây là cái hộp.',
      'lessons/morning-routine/bedroom/audio/vi/teach_box_intro.mp3',
    ],
    [
      'Từ này nghĩa là cái hộp.',
      'lessons/morning-routine/bedroom/audio/vi/box_meaning.mp3',
    ],
    [
      'Cái hộp ở bên phải đó.',
      'lessons/morning-routine/bedroom/audio/vi/tap_box_fail.mp3',
    ],
    [
      'Chạm vào cái hộp nhé.',
      'lessons/morning-routine/bedroom/audio/vi/tap_box.mp3',
    ],
    [
      'Đúng rồi, đó là cái hộp.',
      'lessons/morning-routine/bedroom/audio/vi/box_success.mp3',
    ],
    [
      'Đây là đôi tất.',
      'lessons/morning-routine/bedroom/audio/vi/teach_socks_intro.mp3',
    ],
    [
      'Từ này nghĩa là đôi tất.',
      'lessons/morning-routine/bedroom/audio/vi/socks_meaning.mp3',
    ],
    [
      'Đôi tất ở gần giường đó.',
      'lessons/morning-routine/bedroom/audio/vi/tap_socks_fail.mp3',
    ],
    [
      'Chạm vào đôi tất nhé.',
      'lessons/morning-routine/bedroom/audio/vi/tap_socks.mp3',
    ],
    [
      'Con tìm thấy đôi tất rồi!',
      'lessons/morning-routine/bedroom/audio/vi/socks_success.mp3',
    ],
    [
      'Đây là búp bê.',
      'lessons/morning-routine/bedroom/audio/vi/teach_doll_intro.mp3',
    ],
    [
      'Từ này nghĩa là búp bê.',
      'lessons/morning-routine/bedroom/audio/vi/doll_meaning.mp3',
    ],
    [
      'Búp bê ở cạnh giường đó.',
      'lessons/morning-routine/bedroom/audio/vi/tap_doll_fail.mp3',
    ],
    [
      'Chạm vào búp bê nhé.',
      'lessons/morning-routine/bedroom/audio/vi/tap_doll.mp3',
    ],
    [
      'Đúng rồi, đó là búp bê.',
      'lessons/morning-routine/bedroom/audio/vi/doll_success.mp3',
    ],
    [
      'Mình cùng chào buổi sáng nhé.',
      'lessons/morning-routine/bedroom/audio/vi/teach_good_morning_intro.mp3',
    ],
    [
      'Câu này nghĩa là chào buổi sáng.',
      'lessons/morning-routine/bedroom/audio/vi/good_morning_meaning.mp3',
    ],
    [
      'Mình học câu dọn giường nhé.',
      'lessons/morning-routine/bedroom/audio/vi/teach_make_the_bed_intro.mp3',
    ],
    [
      'Câu này nghĩa là dọn giường.',
      'lessons/morning-routine/bedroom/audio/vi/make_the_bed_meaning.mp3',
    ],
    [
      'Cất gối vào hộp nhé.',
      'lessons/morning-routine/bedroom/audio/vi/drag_pillow_to_box.mp3',
    ],
    [
      'Kéo gối vào cái hộp nhé.',
      'lessons/morning-routine/bedroom/audio/vi/drag_pillow_to_box_fail.mp3',
    ],
    [
      'Gối đã ở trong hộp rồi!',
      'lessons/morning-routine/bedroom/audio/vi/pillow_in_box_success.mp3',
    ],
    [
      'Cất chăn vào hộp để dọn giường nhé.',
      'lessons/morning-routine/bedroom/audio/vi/drag_blanket_to_box.mp3',
    ],
    [
      'Kéo chăn vào cái hộp nhé.',
      'lessons/morning-routine/bedroom/audio/vi/drag_blanket_to_box_fail.mp3',
    ],
    [
      'Giường gọn gàng rồi!',
      'lessons/morning-routine/bedroom/audio/vi/make_the_bed_success.mp3',
    ],
    [
      'Cất tất vào hộp nhé.',
      'lessons/morning-routine/bedroom/audio/vi/drag_socks_to_box.mp3',
    ],
    [
      'Kéo tất vào cái hộp nhé.',
      'lessons/morning-routine/bedroom/audio/vi/drag_socks_to_box_fail.mp3',
    ],
    [
      'Tất đã ở trong hộp rồi!',
      'lessons/morning-routine/bedroom/audio/vi/socks_in_box_success.mp3',
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
const teacherPromptsModule = loadTsModule(
  join(repoRoot, 'src/i18n/teacherPrompts.ts'),
);
const mascotPromptsModule = loadTsModule(
  join(repoRoot, 'src/data/mascotPrompts.ts'),
);
const kidLockAudioPromptsModule = loadTsModule(
  join(repoRoot, 'src/data/kidLockAudioPrompts.ts'),
);
const enDictionaryModule = loadTsModule(
  join(repoRoot, 'src/i18n/dictionaries/en.ts'),
);
const lessons = lessonsModule.lessons ?? [];
const existingWordAudio = audioManifestModule.getWordAudioAsset;
const existingViAudio = audioManifestModule.getViAudioAsset;

if (!Array.isArray(lessons) || lessons.length === 0) {
  throw new Error('No lessons found in src/data/lessons.ts');
}

const audioTargets = collectAudioTargets(lessons, {
  audioRelease: args.audioRelease,
  enDictionary: enDictionaryModule.en,
  existingViAudio,
  existingWordAudio,
  kidLockAudioPrompts: kidLockAudioPromptsModule.kidLockAudioPrompts,
  mascotPrompts: mascotPromptsModule,
  reviewGamePrompts: reviewGamePromptsModule,
  speechPrompts: speechPromptsModule,
  teacherPrompts: teacherPromptsModule,
});
const publishedEnglishGenerationManifest =
  loadPublishedEnglishGenerationManifest();
validatePublishedEnglishTargets(
  audioTargets,
  publishedEnglishGenerationManifest,
  args,
);
const selectedAudioTargets = collectAudioTargets(lessons, {
  audioRelease: args.audioRelease,
  enDictionary: enDictionaryModule.en,
  existingViAudio,
  existingWordAudio,
  kidLockAudioPrompts: kidLockAudioPromptsModule.kidLockAudioPrompts,
  lessonId: args.lesson,
  mascotPrompts: mascotPromptsModule,
  reviewGamePrompts: reviewGamePromptsModule,
  sceneId: args.scene,
  speechPrompts: speechPromptsModule,
  teacherPrompts: teacherPromptsModule,
});
const filteredAudioTargets = filterAudioTargets(selectedAudioTargets, args);
assertUniqueTargetKeys(filteredAudioTargets);
assertNoPublishedEnglishOverwrite(
  filteredAudioTargets,
  publishedEnglishGenerationManifest,
  args,
);
const pendingTargets = filteredAudioTargets.filter(
  target => args.force || !auditTarget(target).valid,
);

printSummary(filteredAudioTargets, pendingTargets);

if (args.dryRun) {
  printPendingTargets(pendingTargets);
  process.exit(0);
}

if (args.localPreview) {
  if (pendingTargets.length > 0) {
    printPendingTargets(pendingTargets);
    throw new Error(
      'Cannot create local preview: selected audio has missing or invalid files.',
    );
  }
  writeLocalAudioPreview(filteredAudioTargets, args.lesson);
  process.exit(0);
}

if (!args.manifestOnly) {
  const limitedTargets =
    args.limit === undefined
      ? pendingTargets
      : pendingTargets.slice(0, args.limit);

  if (limitedTargets.length > 0) {
    const auth = getGoogleAuth();
    await generateTargets(limitedTargets, auth, args.concurrency);
  }

  if (args.limit !== undefined && pendingTargets.length > args.limit) {
    console.log(
      `Skipped ${pendingTargets.length - args.limit} file(s) because --limit=${
        args.limit
      }.`,
    );
  }
}

const productionAudit = auditProductionTargets(audioTargets);
printProductionAudit(productionAudit);

const validAudioTargets = audioTargets.filter(
  target => auditTarget(target).valid,
);

if (args.manifestOnly) {
  publishGeneratedAudioManifests(validAudioTargets);
  if (args.writeBundledRegistry) {
    writeGeneratedAudioRegistry();
  } else {
    console.log(
      'kept src/engine/GeneratedAudioRegistry.ts unchanged (R2-first audio)',
    );
  }
  process.exit(0);
}

if (!productionAudit.complete) {
  console.log(
    'kept audioManifest and English provenance unchanged because the production corpus is incomplete',
  );
} else {
  publishGeneratedAudioManifests(validAudioTargets);
  if (args.writeBundledRegistry) {
    writeGeneratedAudioRegistry();
  } else {
    console.log(
      'kept src/engine/GeneratedAudioRegistry.ts unchanged (R2-first audio)',
    );
  }
}


function parseArgs(rawArgs) {
  const options = {
    accent: 'all',
    audioRelease: DEFAULT_AUDIO_RELEASE,
    concurrency: DEFAULT_CONCURRENCY,
    dryRun: false,
    force: false,
    language: 'all',
    lesson: undefined,
    limit: undefined,
    localPreview: false,
    manifestOnly: false,
    scene: undefined,
    writeBundledRegistry: false,
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
    if (arg === '--local-preview') {
      options.localPreview = true;
      continue;
    }
    if (arg === '--write-bundled-registry') {
      options.writeBundledRegistry = true;
      continue;
    }
    if (arg.startsWith('--language=')) {
      const language = arg.slice('--language='.length);
      if (!['all', 'en', 'vi'].includes(language)) {
        throw new Error('--language must be all, en, or vi.');
      }
      options.language = language;
      continue;
    }
    if (arg.startsWith('--accent=')) {
      const accent = arg.slice('--accent='.length);
      if (accent !== 'all' && !ENGLISH_ACCENTS.includes(accent)) {
        throw new Error('--accent must be all, en-US, or en-GB.');
      }
      options.accent = accent;
      continue;
    }
    if (arg.startsWith('--audio-release=')) {
      const audioRelease = arg.slice('--audio-release='.length);
      if (!/^[a-z0-9][a-z0-9-]*$/u.test(audioRelease)) {
        throw new Error(
          '--audio-release must contain only lowercase letters, numbers, and hyphens.',
        );
      }
      options.audioRelease = audioRelease;
      continue;
    }
    if (arg.startsWith('--concurrency=')) {
      const concurrency = Number(arg.slice('--concurrency='.length));
      if (
        !Number.isInteger(concurrency) ||
        concurrency < 1 ||
        concurrency > MAX_CONCURRENCY
      ) {
        throw new Error(
          `--concurrency must be an integer from 1 to ${MAX_CONCURRENCY}.`,
        );
      }
      options.concurrency = concurrency;
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
  if (options.localPreview && (options.dryRun || options.manifestOnly)) {
    throw new Error(
      '--local-preview cannot be combined with --dry-run or --manifest-only.',
    );
  }
  if (options.localPreview && !options.lesson) {
    throw new Error('--local-preview requires --lesson=<id>.');
  }
  if (
    options.localPreview &&
    (options.scene ||
      options.language !== 'all' ||
      options.accent !== 'all' ||
      options.force ||
      options.limit !== undefined)
  ) {
    throw new Error(
      '--local-preview requires the complete lesson: do not combine it with --scene, --language, --accent, --force, or --limit.',
    );
  }
  if (options.manifestOnly && options.limit !== undefined) {
    throw new Error('--manifest-only cannot be combined with --limit.');
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
  node scripts/generateMissingAudio.mjs --language=en --accent=en-US
  node scripts/generateMissingAudio.mjs --lesson=morning-routine --scene=bathroom

Options:
  --dry-run, -n       List missing files without writing or calling Google TTS.
  --manifest-only    Audit the complete production corpus, then rewrite manifests.
  --local-preview    Write a dev-only manifest for one complete --lesson.
                     Does not call Google TTS or change production manifests.
  --language=<value> Generate all, en, or vi targets (default: all).
  --accent=<value>   Generate all, en-US, or en-GB English targets (default: all).
  --audio-release=<id>
                     Immutable English audio release path segment
                     (default: ${DEFAULT_AUDIO_RELEASE}).
  --concurrency=<n>  Concurrent Google TTS requests, 1-${MAX_CONCURRENCY}
                     (default: ${DEFAULT_CONCURRENCY}).
  --write-bundled-registry
                     Rewrite GeneratedAudioRegistry with bundled require() entries.
                     Default leaves it unchanged for R2-first lesson audio.
  --force            Regenerate files that are not published immutable English keys.
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
    audioRelease,
    enDictionary,
    existingViAudio,
    existingWordAudio,
    kidLockAudioPrompts,
    lessonId,
    mascotPrompts,
    reviewGamePrompts,
    sceneId,
    speechPrompts,
    teacherPrompts,
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
          audioRelease,
          existingWordAudio,
          lesson,
          scene,
          text: vocabularyItem.word,
        });
      }

      for (const step of scene.steps ?? []) {
        const instructionPromptEn = getEnglishSegment(
          teacherPrompts.resolveTeacherInstruction(step, 'en', scene),
        );
        addEnglishPromptTarget(targets, {
          audioRelease,
          defaultKey: getEnglishStepAudioKey(
            lesson.id,
            scene.id,
            step.id,
            instructionPromptEn,
          ),
          existingWordAudio,
          text: instructionPromptEn,
        });
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

        const successFeedbackEn = teacherPrompts.getTeacherFeedbackEn(
          'success',
          step,
          scene,
        );
        if (successFeedbackEn?.trim()) {
          addEnglishPromptTarget(targets, {
            audioRelease,
            defaultKey: getEnglishStepFeedbackAudioKey(
              lesson.id,
              scene.id,
              step.id,
              'success',
              successFeedbackEn,
            ),
            existingWordAudio,
            text: successFeedbackEn,
          });
        }

        const failFeedbackEn = teacherPrompts.getTeacherFeedbackEn(
          'fail',
          step,
          scene,
        );
        if (failFeedbackEn?.trim()) {
          addEnglishPromptTarget(targets, {
            audioRelease,
            defaultKey: getEnglishStepFeedbackAudioKey(
              lesson.id,
              scene.id,
              step.id,
              'fail',
              failFeedbackEn,
            ),
            existingWordAudio,
            text: failFeedbackEn,
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

      const completionPromptEn = getEnglishSegment(
        teacherPrompts.resolveSceneCompletionPrompt(scene, 'en'),
      );
      addEnglishPromptTarget(targets, {
        audioRelease,
        defaultKey: getEnglishCompletionAudioKey(
          lesson.id,
          scene.id,
          completionPromptEn,
        ),
        existingWordAudio,
        text: completionPromptEn,
      });
    }
  }

  const speechPromptEn = getEnglishSegment(
    teacherPrompts.resolveSpeechPracticePrompt('en'),
  );
  const recordingEncouragementEn = getEnglishSegment(
    teacherPrompts.resolveRecordingEncouragementPrompt('en'),
  );
  const recordingTryNextWordEn = getEnglishSegment(
    teacherPrompts.resolveRecordingEncouragementPrompt('en', 'tryNextWord'),
  );
  const recordingTryNextWordVi = getViSegment(
    teacherPrompts.resolveRecordingEncouragementPrompt('vi', 'tryNextWord'),
  );
  const successFeedbackEn = getEnglishSegment(
    teacherPrompts.resolveTeacherFeedback({
      mode: 'en',
      type: 'success',
    }),
  );
  const failFeedbackEn = getEnglishSegment(
    teacherPrompts.resolveTeacherFeedback({
      mode: 'en',
      type: 'fail',
    }),
  );
  const memoryGameIntroEn = getEnglishSegment(
    teacherPrompts.resolveReviewGameIntroPrompt('memory', 'en'),
  );
  const listenChooseGameIntroEn = getEnglishSegment(
    teacherPrompts.resolveReviewGameIntroPrompt('listenAndChoose', 'en'),
  );
  const matchingGameIntroEn = getEnglishSegment(
    teacherPrompts.resolveReviewGameIntroPrompt('matching', 'en'),
  );
  const reviewGameIntroEn = getEnglishSegment(
    teacherPrompts.resolveReviewGameIntroPrompt(undefined, 'en'),
  );

  addSharedEnglishTarget(targets, {
    audioRelease,
    defaultKey: getSharedEnglishAudioKey('speak_prompt', speechPromptEn),
    existingWordAudio,
    text: speechPromptEn,
  });
  addSharedEnglishTarget(targets, {
    audioRelease,
    defaultKey: getSharedEnglishAudioKey(
      'recording_encouragement',
      recordingEncouragementEn,
    ),
    existingWordAudio,
    text: recordingEncouragementEn,
  });
  addSharedEnglishTarget(targets, {
    audioRelease,
    defaultKey: getSharedEnglishAudioKey(
      'recording_try_next_word',
      recordingTryNextWordEn,
    ),
    existingWordAudio,
    text: recordingTryNextWordEn,
  });
  addSharedEnglishTarget(targets, {
    audioRelease,
    defaultKey: getSharedEnglishAudioKey('feedback_success', successFeedbackEn),
    existingWordAudio,
    text: successFeedbackEn,
  });
  addSharedEnglishTarget(targets, {
    audioRelease,
    defaultKey: getSharedEnglishAudioKey('feedback_fail', failFeedbackEn),
    existingWordAudio,
    text: failFeedbackEn,
  });
  addSharedEnglishTarget(targets, {
    audioRelease,
    defaultKey: getSharedEnglishAudioKey(
      'memory_game_intro',
      memoryGameIntroEn,
    ),
    existingWordAudio,
    text: memoryGameIntroEn,
  });
  addSharedEnglishTarget(targets, {
    audioRelease,
    defaultKey: getSharedEnglishAudioKey(
      'listen_choose_game_intro',
      listenChooseGameIntroEn,
    ),
    existingWordAudio,
    text: listenChooseGameIntroEn,
  });
  addSharedEnglishTarget(targets, {
    audioRelease,
    defaultKey: getSharedEnglishAudioKey(
      'matching_game_intro',
      matchingGameIntroEn,
    ),
    existingWordAudio,
    text: matchingGameIntroEn,
  });
  addSharedEnglishTarget(targets, {
    audioRelease,
    defaultKey: getSharedEnglishAudioKey(
      'review_game_intro',
      reviewGameIntroEn,
    ),
    existingWordAudio,
    text: reviewGameIntroEn,
  });

  addSharedViTarget(targets, {
    defaultKey: 'shared/audio/vi/speak_prompt.mp3',
    existingViAudio,
    text: speechPrompts.speakPracticePromptVi,
  });
  addSharedViTarget(targets, {
    defaultKey: 'shared/audio/vi/speak_encourage.mp3',
    existingViAudio,
    text: 'Cô nghe rồi! Giỏi quá!',
  });
  addSharedViTarget(targets, {
    defaultKey: `shared/audio/vi/recording_try_next_word_${textDigest(
      recordingTryNextWordVi,
    )}.mp3`,
    existingViAudio,
    text: recordingTryNextWordVi,
  });
  addSharedViTarget(targets, {
    defaultKey: 'shared/audio/vi/correct.mp3',
    existingViAudio,
    text: 'Đúng rồi! Bé giỏi quá!',
  });
  addSharedViTarget(targets, {
    defaultKey: 'shared/audio/vi/memory_game_intro.mp3',
    existingViAudio,
    text: reviewGamePrompts.memoryGameIntroPromptVi,
  });
  addSharedViTarget(targets, {
    defaultKey: `shared/audio/vi/listen_choose_game_intro_${textDigest(
      reviewGamePrompts.listenChooseGameIntroPromptVi,
    )}.mp3`,
    existingViAudio,
    text: reviewGamePrompts.listenChooseGameIntroPromptVi,
  });
  addSharedViTarget(targets, {
    defaultKey: `shared/audio/vi/matching_game_intro_${textDigest(
      reviewGamePrompts.matchingGameIntroPromptVi,
    )}.mp3`,
    existingViAudio,
    text: reviewGamePrompts.matchingGameIntroPromptVi,
  });
  for (const text of mascotPrompts.sungySpeechLines ?? []) {
    addSharedViTarget(targets, {
      defaultKey: getSungyAudioKey(text),
      existingViAudio,
      text,
    });
  }

  for (const [reason, prompt] of Object.entries(kidLockAudioPrompts ?? {})) {
    addSharedEnglishTarget(targets, {
      audioRelease,
      defaultKey: getUiEnglishAudioKey(reason, prompt.en),
      existingWordAudio,
      includeLegacyFallback: false,
      kind: 'ui',
      text: prompt.en,
    });
    addSharedViTarget(targets, {
      defaultKey: getUiViAudioKey(reason, prompt.vi),
      existingViAudio,
      kind: 'ui',
      text: prompt.vi,
    });
  }

  addBundledEnglishUiTargets(targets, {
    audioRelease,
    enDictionary,
    existingWordAudio,
  });

  return Array.from(targets.values()).sort((left, right) =>
    left.key.localeCompare(right.key),
  );
}

function addBundledEnglishUiTargets(
  targets,
  { audioRelease, enDictionary, existingWordAudio },
) {
  const uiPromptKeys = [
    ['onboarding.coach.greeting', 'sungy_onboarding_greeting'],
    ['home.coach.default', 'home_coach_default'],
    ['home.coach.complete', 'home_coach_complete'],
    ['home.coach.completeTapOne', 'home_complete_tap_one'],
    ['home.coach.completeTapTwo', 'home_complete_tap_two'],
    ['home.coach.completeTapThree', 'home_complete_tap_three'],
    ['home.coach.reviewTapOne', 'home_review_tap_one'],
    ['home.coach.reviewTapTwo', 'home_review_tap_two'],
    ['home.coach.reviewTapThree', 'home_review_tap_three'],
    ['home.coach.guideTapOne', 'home_guide_tap_one'],
    ['home.coach.guideTapTwo', 'home_guide_tap_two'],
    ['home.coach.guideTapThree', 'home_guide_tap_three'],
  ];

  for (const [translationKey, fileStem] of uiPromptKeys) {
    const text = enDictionary?.[translationKey];
    if (typeof text !== 'string') {
      throw new Error(`Missing English UI prompt ${translationKey}.`);
    }

    addSharedEnglishTarget(targets, {
      audioRelease,
      defaultKey: getNamedUiEnglishAudioKey(fileStem),
      existingWordAudio,
      includeLegacyFallback: false,
      kind: 'ui',
      text,
    });
  }
}

function addWordTarget(
  targets,
  { audioRelease, existingWordAudio, lesson, scene, text },
) {
  addEnglishPromptTarget(targets, {
    audioRelease,
    defaultKey: `lessons/${lesson.id}/${scene.id}/audio/en/${slug(text)}.mp3`,
    existingWordAudio,
    text,
  });
}

function addEnglishPromptTarget(
  targets,
  {
    audioRelease,
    defaultKey,
    existingWordAudio,
    includeLegacyFallback = true,
    kind = 'word',
    text,
  },
) {
  if (!text?.trim()) {
    return;
  }

  const existingAsset = existingWordAudio?.(text);
  const audioBaseKey = getLegacyEnglishAudioKey(existingAsset?.key, defaultKey);

  if (!audioBaseKey) {
    throw new Error(`Missing English audio key for "${text}".`);
  }

  for (const accent of ENGLISH_ACCENTS) {
    const legacyKey =
      includeLegacyFallback &&
      existsSync(join(repoRoot, 'src/assets', audioBaseKey))
        ? audioBaseKey
        : undefined;
    addTarget(targets, {
      accent,
      key: getAccentEnglishAudioKey(audioBaseKey, accent, audioRelease),
      kind,
      language: 'en',
      legacyKey,
      lookupText: text,
      text: existingAsset?.text ?? text,
    });
  }
}

function addSharedEnglishTarget(targets, input) {
  addEnglishPromptTarget(targets, input);
}

function addViTarget(
  targets,
  { defaultKey, existingViAudio, kind = 'vi', text },
) {
  if (!text?.trim()) {
    return;
  }

  const legacyKey = getLegacyViAudioKey(text);
  const existingAsset = existingViAudio?.(text);
  addTarget(targets, {
    key: legacyKey ?? existingAsset?.key ?? defaultKey,
    kind,
    language: 'vi',
    lookupText: text,
    text: existingAsset?.text ?? text,
  });
}

function addSharedViTarget(targets, input) {
  addViTarget(targets, input);
}

function addTarget(targets, target) {
  const mapKey = `${target.kind}:${target.accent ?? ''}:${normalizeText(
    target.lookupText,
  )}`;
  if (targets.has(mapKey)) {
    return;
  }

  targets.set(mapKey, target);
}

function getLegacyEnglishAudioKey(existingKey, defaultKey) {
  if (existingKey?.includes('/audio/en/')) {
    return existingKey;
  }

  if (existingKey) {
    const legacyKey = existingKey.replace(
      /\/audio\/en-(?:US|GB)\/[^/]+\//u,
      '/audio/en/',
    );
    if (legacyKey !== existingKey) {
      return legacyKey;
    }
  }

  return defaultKey;
}

function getAccentEnglishAudioKey(legacyKey, accent, audioRelease) {
  if (!legacyKey.includes('/audio/en/')) {
    throw new Error(
      `English audio key is not in an audio/en directory: ${legacyKey}`,
    );
  }

  return legacyKey.replace('/audio/en/', `/audio/${accent}/${audioRelease}/`);
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
  )}.mp3`;
}

function getEnglishStepAudioKey(lessonId, sceneId, stepId, text) {
  const stepSlug = slug(stripScenePrefix(sceneId, stepId));
  return `lessons/${lessonId}/${sceneId}/audio/en/prompt_${stepSlug}_${textDigest(
    text,
  )}.mp3`;
}

function getEnglishStepFeedbackAudioKey(lessonId, sceneId, stepId, part, text) {
  const stepSlug = slug(stripScenePrefix(sceneId, stepId));
  return `lessons/${lessonId}/${sceneId}/audio/en/${stepSlug}_${part}_${textDigest(
    text,
  )}.mp3`;
}

function getCompletionAudioKey(lessonId, sceneId, text) {
  return `lessons/${lessonId}/${sceneId}/audio/vi/completion_${textDigest(
    text,
  )}.mp3`;
}

function getEnglishCompletionAudioKey(lessonId, sceneId, text) {
  return `lessons/${lessonId}/${sceneId}/audio/en/completion_${textDigest(
    text,
  )}.mp3`;
}

function getSharedEnglishAudioKey(name, text) {
  return `shared/audio/en/${name}_${textDigest(text)}.mp3`;
}

function getUiEnglishAudioKey(reason, text) {
  return `ui/audio/en/kid_lock_${slug(reason)}_${textDigest(text)}.mp3`;
}

function getNamedUiEnglishAudioKey(fileStem) {
  return `ui/audio/en/${fileStem}.mp3`;
}

function getUiViAudioKey(reason, text) {
  return `ui/audio/vi/kid_lock_${slug(reason)}_${textDigest(text)}.mp3`;
}

function getSungyAudioKey(text) {
  return `shared/audio/vi/sungy/${slug(text)}_${textDigest(text)}.mp3`;
}

function getEnglishSegment(resolution) {
  const text = resolution.segments.find(
    segment => segment.language === 'en',
  )?.text;

  if (!text?.trim()) {
    throw new Error('Teacher prompt resolution did not include English text.');
  }

  return text;
}

function getViSegment(resolution) {
  const text = resolution.segments.find(
    segment => segment.language === 'vi',
  )?.text;

  if (!text?.trim()) {
    throw new Error('Teacher prompt resolution did not include Vietnamese text.');
  }

  return text;
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
  const account = process.env.GOOGLE_TTS_ACCOUNT;

  if (account) {
    gcloudArgs.push(`--account=${account}`);
  }

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

async function generateTargets(targets, auth, concurrency) {
  const errors = [];
  let nextIndex = 0;
  let completed = 0;

  await Promise.all(
    Array.from({ length: Math.min(concurrency, targets.length) }, async () => {
      while (nextIndex < targets.length) {
        const target = targets[nextIndex];
        nextIndex += 1;

        try {
          await synthesizeTargetWithRetry(target, auth);
          completed += 1;
          console.log(`wrote ${target.key} (${completed}/${targets.length})`);
        } catch (error) {
          errors.push({ error, target });
        }
      }
    }),
  );

  if (errors.length > 0) {
    for (const { error, target } of errors) {
      console.error(
        `ERROR [${formatTargetLanguage(target)}] ${target.key}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
    throw new Error(`Google TTS failed for ${errors.length} target(s).`);
  }
}

async function synthesizeTargetWithRetry(target, auth) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_TTS_ATTEMPTS; attempt += 1) {
    try {
      await synthesizeTarget(target, auth);
      return;
    } catch (error) {
      lastError = error;
      const retryable = error?.retryable !== false;
      if (!retryable || attempt === MAX_TTS_ATTEMPTS) {
        break;
      }

      await delay(250 * 2 ** (attempt - 1));
    }
  }

  throw lastError;
}

async function synthesizeTarget(target, auth) {
  const response = await fetch(auth.endpoint, {
    body: JSON.stringify({
      audioConfig: getTargetAudioConfig(target),
      input: { text: target.text },
      voice: getTargetVoice(target),
    }),
    headers: {
      ...auth.headers,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    const error = new Error(
      `${response.status} ${response.statusText}: ${await response.text()}`,
    );
    error.retryable =
      response.status === 408 ||
      response.status === 429 ||
      response.status >= 500;
    throw error;
  }

  const responseBody = await response.json();
  const outputPath = join(repoRoot, 'src/assets', target.key);
  const audioBuffer = Buffer.from(responseBody.audioContent ?? '', 'base64');
  const outputBuffer =
    target.language === 'en' ? audioBuffer : trimWavSilence(audioBuffer);
  const validation = validateWavBuffer(outputBuffer, target);

  if (!validation.valid) {
    const error = new Error(`Invalid Google TTS WAV: ${validation.reason}`);
    error.retryable = true;
    throw error;
  }

  if (outputPath.endsWith('.mp3')) {
    const tempWavPath = outputPath.replace(/\.mp3$/, '.tmp.mp3');
    writeFileAtomically(tempWavPath, outputBuffer);
    encodeWavToMp3(tempWavPath, outputPath);
    unlinkSync(tempWavPath);
  } else {
    writeFileAtomically(outputPath, outputBuffer);
  }
}

function encodeWavToMp3(wavPath, mp3Path) {
  mkdirSync(dirname(mp3Path), { recursive: true });
  execFileSync('ffmpeg', ['-y', '-i', wavPath, '-codec:a', 'libmp3lame', '-b:a', '96k', '-ac', '1', mp3Path], {
    stdio: 'ignore',
  });
}

function getTargetAudioConfig(target) {
  return target.language === 'en' ? englishAudioConfig : viAudioConfig;
}

function getTargetVoice(target) {
  return target.language === 'en' ? voices[target.accent] : voices.vi;
}

function delay(durationMs) {
  return new Promise(resolve => setTimeout(resolve, durationMs));
}

function loadPublishedEnglishGenerationManifest() {
  if (!existsSync(englishGenerationManifestPath)) {
    return undefined;
  }

  try {
    return JSON.parse(readFileSync(englishGenerationManifestPath, 'utf8'));
  } catch (error) {
    throw new Error(
      `Unable to read ${formatRepoPath(englishGenerationManifestPath)}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

function validatePublishedEnglishTargets(targets, manifest, options) {
  if (!manifest || manifest.release !== options.audioRelease) {
    return;
  }

  const expectedConfig = getEnglishGenerationConfig();
  if (JSON.stringify(manifest.config) !== JSON.stringify(expectedConfig)) {
    throwImmutableReleaseError(
      `published config does not match the ${options.audioRelease} generator config`,
      options.audioRelease,
    );
  }

  for (const accent of ENGLISH_ACCENTS) {
    const publishedVoice = manifest.voices?.[accent];
    if (
      publishedVoice?.languageCode !== voices[accent].languageCode ||
      publishedVoice?.name !== voices[accent].name
    ) {
      throwImmutableReleaseError(
        `published ${accent} voice does not match ${voices[accent].name}`,
        options.audioRelease,
      );
    }
  }

  const publishedTargets = new Map();
  for (const entry of manifest.targets ?? []) {
    if (typeof entry?.key !== 'string' || publishedTargets.has(entry.key)) {
      throwImmutableReleaseError(
        'published provenance has a missing or duplicate target key',
        options.audioRelease,
      );
    }
    publishedTargets.set(entry.key, entry);
  }

  for (const target of targets) {
    if (target.language !== 'en') {
      continue;
    }
    const publishedTarget = publishedTargets.get(target.key);
    if (!publishedTarget) {
      continue;
    }

    const filePath = join(repoRoot, 'src/assets', target.key);
    if (!existsSync(filePath)) {
      throwImmutableReleaseError(
        `published target is missing locally: ${target.key}`,
        options.audioRelease,
      );
    }
    const content = readFileSync(filePath);
    const sha256 = createHash('sha256').update(content).digest('hex');
    if (
      publishedTarget.accent !== target.accent ||
      publishedTarget.bytes !== content.length ||
      publishedTarget.sha256 !== sha256 ||
      publishedTarget.voice !== voices[target.accent].name
    ) {
      throwImmutableReleaseError(
        `published target bytes or metadata changed: ${target.key}`,
        options.audioRelease,
      );
    }
  }
}

function assertNoPublishedEnglishOverwrite(targets, manifest, options) {
  if (
    !options.force ||
    !manifest ||
    manifest.release !== options.audioRelease
  ) {
    return;
  }

  const publishedKeys = new Set(
    (manifest.targets ?? []).map(target => target?.key).filter(Boolean),
  );
  const publishedTarget = targets.find(
    target => target.language === 'en' && publishedKeys.has(target.key),
  );
  if (publishedTarget) {
    throwImmutableReleaseError(
      `--force would overwrite ${publishedTarget.key}`,
      options.audioRelease,
    );
  }
}

function throwImmutableReleaseError(reason, audioRelease) {
  throw new Error(
    `English audio release ${audioRelease} is immutable: ${reason}. ` +
      'Use a new --audio-release value instead of replacing published bytes.',
  );
}

function publishGeneratedAudioManifests(targets) {
  const provenance = buildEnglishAudioGenerationManifest(targets);
  const uiAudioRegistry = buildGeneratedUiAudioRegistry(targets);
  const runtimeManifest = buildAudioManifest(targets);

  writeFileAtomically(provenance.path, provenance.content);
  console.log(`wrote ${formatRepoPath(provenance.path)}`);
  writeFileAtomically(uiAudioRegistry.path, uiAudioRegistry.content);
  console.log(`wrote ${formatRepoPath(uiAudioRegistry.path)}`);
  writeFileAtomically(runtimeManifest.path, runtimeManifest.content);
  console.log(`wrote ${formatRepoPath(runtimeManifest.path)}`);
}

function writeLocalAudioPreview(targets, lessonId) {
  const runtimeManifest = buildLocalAudioManifest(targets);
  const previewConfig = buildLocalAudioPreviewConfig(lessonId);

  writeFileAtomically(runtimeManifest.path, runtimeManifest.content);
  console.log(`wrote ${formatRepoPath(runtimeManifest.path)}`);
  writeFileAtomically(previewConfig.path, previewConfig.content);
  console.log(`wrote ${formatRepoPath(previewConfig.path)}`);
  console.log(
    `Local audio preview is ready for lesson ${lessonId}. Restart Metro after changing the preview lesson.`,
  );
}

function buildLocalAudioPreviewConfig(lessonId) {
  const lines = [
    '/** Generated by scripts/generateMissingAudio.mjs. Do not edit manually. */',
    `export const localAudioPreviewLessonIds: readonly string[] = [${formatString(
      lessonId,
    )}];`,
    '',
  ];

  return {
    content: lines.join('\n'),
    path: localAudioPreviewConfigPath,
  };
}

function buildGeneratedUiAudioRegistry(targets) {
  const uiTargets = targets
    .filter(target => target.kind === 'ui')
    .sort((left, right) => left.key.localeCompare(right.key));
  const lines = [
    "import type { ImageRequireSource } from 'react-native';",
    '',
    '/** Generated by scripts/generateMissingAudio.mjs. Do not edit manually. */',
    'export const generatedUiAudioRegistry: Record<string, ImageRequireSource> = {',
    ...uiTargets.map(
      target =>
        `  ${formatString(target.key)}: require(${formatString(
          `../assets/${target.key}`,
        )}),`,
    ),
    '};',
    '',
  ];

  return { content: lines.join('\n'), path: uiAudioRegistryPath };
}

function buildAudioManifest(targets) {
  const enTargets = targets.filter(target => target.language === 'en');
  const viTargets = targets.filter(target => target.language === 'vi');
  const englishEntries = groupEnglishTargets(enTargets);
  const manifestPath = join(repoRoot, 'src/data/audioManifest.ts');
  const lines = [
    'import {',
    '  DEFAULT_ENGLISH_ACCENT,',
    '  type EnglishAccent,',
    "} from '../types/audio';",
    '',
    'export type RemoteAudioAsset = {',
    '  key: string;',
    '  text: string;',
    '};',
    '',
    'type EnglishAudioAssets = Partial<Record<EnglishAccent, RemoteAudioAsset>> & {',
    '  legacy?: RemoteAudioAsset;',
    '};',
    '',
    'const enAudioByText: Record<string, EnglishAudioAssets> = {',
    ...englishEntries.map(formatEnglishAudioMapEntry),
    '};',
    '',
    'const viAudioByText: Record<string, RemoteAudioAsset> = {',
    ...viTargets.map(formatAudioMapEntry),
    '};',
    '',
    'export function getWordAudioAssets(',
    '  word: string,',
    '  accent: EnglishAccent = DEFAULT_ENGLISH_ACCENT,',
    ') {',
    '  const assets = enAudioByText[normalizeText(word)];',
    '  const candidates: Array<RemoteAudioAsset | undefined> = [',
    '    assets?.[accent],',
    '    assets?.[DEFAULT_ENGLISH_ACCENT],',
    '    assets?.legacy,',
    '  ];',
    '  const seenKeys = new Set<string>();',
    '  return candidates.filter((asset): asset is RemoteAudioAsset => {',
    '    if (!asset || seenKeys.has(asset.key)) {',
    '      return false;',
    '    }',
    '    seenKeys.add(asset.key);',
    '    return true;',
    '  });',
    '}',
    '',
    'export function getWordAudioAsset(',
    '  word: string,',
    '  accent: EnglishAccent = DEFAULT_ENGLISH_ACCENT,',
    ') {',
    '  return getWordAudioAssets(word, accent)[0];',
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

  return { content: lines.join('\n'), path: manifestPath };
}

function buildLocalAudioManifest(targets) {
  const enTargets = targets.filter(target => target.language === 'en');
  const viTargets = targets
    .filter(target => target.language === 'vi')
    .sort((left, right) =>
      normalizeText(left.lookupText).localeCompare(
        normalizeText(right.lookupText),
      ),
    );
  const englishEntries = groupEnglishTargets(enTargets);
  const lines = [
    'import {',
    '  getViAudioAsset as getPublishedViAudioAsset,',
    '  getWordAudioAssets as getPublishedWordAudioAssets,',
    "  type RemoteAudioAsset,",
    "} from './audioManifest';",
    'import {',
    '  DEFAULT_ENGLISH_ACCENT,',
    '  type EnglishAccent,',
    "} from '../types/audio';",
    '',
    "export type { RemoteAudioAsset } from './audioManifest';",
    '',
    'type EnglishAudioAssets = Partial<Record<EnglishAccent, RemoteAudioAsset>> & {',
    '  legacy?: RemoteAudioAsset;',
    '};',
    '',
    '/** Generated local preview overlay. Production builds never resolve this module. */',
    'const enAudioByText: Record<string, EnglishAudioAssets> = {',
    ...englishEntries.map(formatEnglishAudioMapEntry),
    '};',
    '',
    'const viAudioByText: Record<string, RemoteAudioAsset> = {',
    ...viTargets.map(formatAudioMapEntry),
    '};',
    '',
    'export function getWordAudioAssets(',
    '  word: string,',
    '  accent: EnglishAccent = DEFAULT_ENGLISH_ACCENT,',
    ') {',
    '  const assets = enAudioByText[normalizeText(word)];',
    '  return dedupeAudioAssets([',
    '    assets?.[accent],',
    '    assets?.[DEFAULT_ENGLISH_ACCENT],',
    '    assets?.legacy,',
    '    ...getPublishedWordAudioAssets(word, accent),',
    '  ]);',
    '}',
    '',
    'export function getWordAudioAsset(',
    '  word: string,',
    '  accent: EnglishAccent = DEFAULT_ENGLISH_ACCENT,',
    ') {',
    '  return getWordAudioAssets(word, accent)[0];',
    '}',
    '',
    'export function getViAudioAsset(text: string) {',
    '  return (',
    '    viAudioByText[normalizeText(text)] ?? getPublishedViAudioAsset(text)',
    '  );',
    '}',
    '',
    'function dedupeAudioAssets(',
    '  candidates: Array<RemoteAudioAsset | undefined>,',
    ') {',
    '  const seenKeys = new Set<string>();',
    '  return candidates.filter((asset): asset is RemoteAudioAsset => {',
    '    if (!asset || seenKeys.has(asset.key)) {',
    '      return false;',
    '    }',
    '    seenKeys.add(asset.key);',
    '    return true;',
    '  });',
    '}',
    '',
    'function normalizeText(text: string) {',
    '  return text.trim().toLowerCase();',
    '}',
    '',
  ];

  return {
    content: lines.join('\n'),
    path: localAudioManifestPath,
  };
}

function groupEnglishTargets(targets) {
  const entriesByText = new Map();

  for (const target of targets) {
    const mapKey = normalizeText(target.lookupText);
    const entry = entriesByText.get(mapKey) ?? {
      assets: {},
      legacyKey: target.legacyKey,
      lookupText: target.lookupText,
      text: target.text,
    };
    entry.assets[target.accent] = target;
    entriesByText.set(mapKey, entry);
  }

  return Array.from(entriesByText.values()).sort((left, right) =>
    normalizeText(left.lookupText).localeCompare(
      normalizeText(right.lookupText),
    ),
  );
}

function formatEnglishAudioMapEntry(entry) {
  const lines = [`  [normalizeText(${formatString(entry.lookupText)})]: {`];

  for (const accent of ENGLISH_ACCENTS) {
    const target = entry.assets[accent];
    if (!target) {
      continue;
    }
    lines.push(
      `    ${formatString(accent)}: {`,
      `      key: ${formatString(target.key)},`,
      `      text: ${formatString(target.text)},`,
      '    },',
    );
  }

  if (entry.legacyKey) {
    lines.push(
      '    legacy: {',
      `      key: ${formatString(entry.legacyKey)},`,
      `      text: ${formatString(entry.text)},`,
      '    },',
    );
  }

  lines.push('  },');
  return lines.join('\n');
}

function formatAudioMapEntry(target) {
  return [
    `  [normalizeText(${formatString(target.lookupText)})]: {`,
    `    key: ${formatString(target.key)},`,
    `    text: ${formatString(target.text)},`,
    '  },',
  ].join('\n');
}

function buildEnglishAudioGenerationManifest(targets) {
  const englishTargets = targets
    .filter(target => target.language === 'en')
    .sort((left, right) => left.key.localeCompare(right.key));
  const generationManifest = {
    schemaVersion: 1,
    release: args.audioRelease,
    config: getEnglishGenerationConfig(),
    voices: Object.fromEntries(
      ENGLISH_ACCENTS.map(accent => [accent, voices[accent]]),
    ),
    targets: englishTargets.map(target => {
      const filePath = join(repoRoot, 'src/assets', target.key);
      const content = readFileSync(filePath);
      return {
        accent: target.accent,
        bytes: content.length,
        key: target.key,
        sha256: createHash('sha256').update(content).digest('hex'),
        text: target.text,
        voice: voices[target.accent].name,
      };
    }),
  };

  return {
    content: `${JSON.stringify(generationManifest, null, 2)}\n`,
    path: englishGenerationManifestPath,
  };
}

function getEnglishGenerationConfig() {
  return {
    audioEncoding: englishAudioConfig.audioEncoding,
    channels: 1,
    sampleRateHertz: englishAudioConfig.sampleRateHertz,
    speakingRate: englishAudioConfig.speakingRate,
    trimSilence: false,
  };
}

function writeGeneratedAudioRegistry() {
  const registryPath = join(repoRoot, 'src/engine/GeneratedAudioRegistry.ts');
  const audioKeys = listFiles(join(repoRoot, 'src/assets'))
    .filter(filePath => ['.mp3', '.mp3'].includes(extname(filePath)))
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

  writeFileAtomically(registryPath, lines.join('\n'));
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

function filterAudioTargets(targets, options) {
  return targets.filter(target => {
    if (options.language !== 'all' && target.language !== options.language) {
      return false;
    }
    if (
      target.language === 'en' &&
      options.accent !== 'all' &&
      target.accent !== options.accent
    ) {
      return false;
    }
    return true;
  });
}

function auditProductionTargets(targets) {
  const issues = [];
  const keys = new Map();

  for (const target of targets) {
    const existingTarget = keys.get(target.key);
    if (existingTarget) {
      issues.push({
        reason: `duplicate key also used by ${formatTargetLanguage(
          existingTarget,
        )}:${existingTarget.lookupText}`,
        target,
      });
      continue;
    }
    keys.set(target.key, target);

    const result = auditTarget(target);
    if (!result.valid) {
      issues.push({ reason: result.reason, target });
    }
  }

  const legacyKeys = new Set();
  let legacyTargets = 0;
  for (const target of targets) {
    if (
      target.language !== 'en' ||
      !target.legacyKey ||
      legacyKeys.has(target.legacyKey)
    ) {
      continue;
    }
    legacyKeys.add(target.legacyKey);
    legacyTargets += 1;
    const legacyTarget = {
      ...target,
      accent: 'legacy-en-US',
      key: target.legacyKey,
    };
    const result = auditTarget(legacyTarget);
    if (!result.valid) {
      issues.push({
        reason: `legacy fallback ${result.reason}`,
        target: legacyTarget,
      });
    }
  }

  return {
    complete: issues.length === 0,
    issues,
    legacyTargets,
    targets: targets.length,
  };
}

function assertUniqueTargetKeys(targets) {
  const targetsByKey = new Map();
  for (const target of targets) {
    const existingTarget = targetsByKey.get(target.key);
    if (existingTarget) {
      throw new Error(
        `Duplicate audio key ${target.key} for "${existingTarget.lookupText}" and "${target.lookupText}".`,
      );
    }
    targetsByKey.set(target.key, target);
  }
}

function auditTarget(target) {
  const filePath = join(repoRoot, 'src/assets', target.key);
  if (!existsSync(filePath)) {
    return { reason: 'missing', valid: false };
  }

  try {
    return validateAudioBuffer(readFileSync(filePath), target);
  } catch (error) {
    return {
      reason: error instanceof Error ? error.message : String(error),
      valid: false,
    };
  }
}

function validateAudioBuffer(input, target) {
  if (target.key.endsWith('.mp3')) {
    const mp3 = inspectMp3(input);
    if (mp3.valid) {
      return mp3;
    }
  }
  return validateWavBuffer(input, target);
}

function inspectMp3(input) {
  if (!Buffer.isBuffer(input) || input.length < 128) {
    return { reason: 'empty or too short MP3 buffer', valid: false };
  }
  if (
    input.toString('ascii', 0, 3) === 'ID3' ||
    (input[0] === 0xff && (input[1] & 0xe0) === 0xe0)
  ) {
    return { valid: true };
  }
  return { reason: 'not a valid MP3 buffer', valid: false };
}


function validateWavBuffer(input, target) {
  const wav = inspectWav(input);
  if (!wav.valid) {
    return wav;
  }

  const expectedSampleRate =
    target.language === 'en'
      ? englishAudioConfig.sampleRateHertz
      : viAudioConfig.sampleRateHertz;
  if (wav.audioFormat !== 1) {
    return {
      reason: `audioFormat=${wav.audioFormat}, expected PCM 1`,
      valid: false,
    };
  }
  if (wav.channels !== 1) {
    return {
      reason: `channels=${wav.channels}, expected mono 1`,
      valid: false,
    };
  }
  if (wav.sampleRate !== expectedSampleRate) {
    return {
      reason: `sampleRate=${wav.sampleRate}, expected ${expectedSampleRate}`,
      valid: false,
    };
  }
  if (wav.bitsPerSample !== 16) {
    return {
      reason: `bitsPerSample=${wav.bitsPerSample}, expected 16`,
      valid: false,
    };
  }
  if (wav.dataSize <= 0) {
    return { reason: 'empty data chunk', valid: false };
  }

  const expectedBlockAlign = wav.channels * (wav.bitsPerSample / 8);
  if (wav.blockAlign !== expectedBlockAlign) {
    return {
      reason: `blockAlign=${wav.blockAlign}, expected ${expectedBlockAlign}`,
      valid: false,
    };
  }
  if (wav.dataSize % wav.blockAlign !== 0) {
    return {
      reason: `dataSize=${wav.dataSize} is not aligned to ${wav.blockAlign}`,
      valid: false,
    };
  }
  const durationSeconds = wav.dataSize / (wav.sampleRate * wav.blockAlign);
  if (durationSeconds < MIN_WAV_DURATION_SECONDS) {
    return {
      reason: `duration=${durationSeconds.toFixed(
        4,
      )}s, expected at least ${MIN_WAV_DURATION_SECONDS}s`,
      valid: false,
    };
  }

  return { valid: true };
}

function inspectWav(input) {
  if (
    !Buffer.isBuffer(input) ||
    input.length < 44 ||
    input.toString('ascii', 0, 4) !== 'RIFF' ||
    input.toString('ascii', 8, 12) !== 'WAVE'
  ) {
    return { reason: 'not a RIFF/WAVE buffer', valid: false };
  }

  const declaredFileSize = input.readUInt32LE(4) + 8;
  if (declaredFileSize !== input.length) {
    return {
      reason: `RIFF size=${declaredFileSize}, actual=${input.length}`,
      valid: false,
    };
  }

  let offset = 12;
  let format;
  let dataSize;
  while (offset + 8 <= input.length) {
    const chunkId = input.toString('ascii', offset, offset + 4);
    const chunkSize = input.readUInt32LE(offset + 4);
    const chunkDataOffset = offset + 8;
    if (chunkDataOffset + chunkSize > input.length) {
      return { reason: `truncated ${chunkId} chunk`, valid: false };
    }

    if (chunkId === 'fmt ' && chunkSize >= 16) {
      format = {
        audioFormat: input.readUInt16LE(chunkDataOffset),
        bitsPerSample: input.readUInt16LE(chunkDataOffset + 14),
        blockAlign: input.readUInt16LE(chunkDataOffset + 12),
        channels: input.readUInt16LE(chunkDataOffset + 2),
        sampleRate: input.readUInt32LE(chunkDataOffset + 4),
      };
    } else if (chunkId === 'data') {
      dataSize = chunkSize;
    }

    offset = chunkDataOffset + chunkSize + (chunkSize % 2);
  }

  if (!format) {
    return { reason: 'missing fmt chunk', valid: false };
  }
  if (dataSize === undefined) {
    return { reason: 'missing data chunk', valid: false };
  }

  return { ...format, dataSize, valid: true };
}

function writeFileAtomically(filePath, content) {
  mkdirSync(dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.tmp`;
  try {
    writeFileSync(tempPath, content);
    renameSync(tempPath, filePath);
  } finally {
    if (existsSync(tempPath)) {
      unlinkSync(tempPath);
    }
  }
}

function printSummary(targets, pendingTargets) {
  const missingFiles = pendingTargets.filter(
    target => !existsSync(join(repoRoot, 'src/assets', target.key)),
  ).length;
  console.log(`Audio targets: ${targets.length}`);
  console.log(`Missing files: ${missingFiles}`);
  console.log(`Invalid files: ${pendingTargets.length - missingFiles}`);
  console.log(`Language filter: ${args.language}`);
  console.log(`Accent filter: ${args.accent}`);
  console.log(`Audio release: ${args.audioRelease}`);
  console.log(`Concurrency: ${args.concurrency}`);

  if (args.lesson) {
    console.log(`Lesson filter: ${args.lesson}`);
  }

  if (args.scene) {
    console.log(`Scene filter: ${args.scene}`);
  }
}

function printPendingTargets(pendingTargets) {
  if (pendingTargets.length === 0) {
    return;
  }

  console.log('');
  for (const target of pendingTargets) {
    const audit = auditTarget(target);
    const reason = args.force && audit.valid ? 'forced' : audit.reason;
    console.log(
      `[${formatTargetLanguage(target)}] ${target.key} (${reason}) <- ${
        target.text
      }`,
    );
  }
}

function printProductionAudit(audit) {
  console.log(`Production targets: ${audit.targets}`);
  console.log(`Legacy English fallbacks: ${audit.legacyTargets}`);
  console.log(`Production audit errors: ${audit.issues.length}`);
  if (audit.complete) {
    return;
  }

  const displayedIssues = audit.issues.slice(0, 25);
  for (const { reason, target } of displayedIssues) {
    console.error(
      `AUDIT [${formatTargetLanguage(target)}] ${target.key}: ${reason}`,
    );
  }
  if (audit.issues.length > displayedIssues.length) {
    console.error(
      `AUDIT ... ${audit.issues.length - displayedIssues.length} more issue(s)`,
    );
  }
}

function formatTargetLanguage(target) {
  return target.language === 'en' ? target.accent : 'vi';
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
