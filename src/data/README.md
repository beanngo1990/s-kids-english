# Lesson Data Authoring

Use one file per lesson pack under `src/data/lessons/`, then register it in
`src/data/lessons.ts`. A `Lesson` is the parent pack; each item in `scenes`
should be a short mini-scene that can be completed independently.

## Add A Lesson Pack

1. Create `src/data/lessons/myLesson.ts`.
2. Export one `Lesson` with small, ordered mini-scenes in `scenes`.
3. Add it to `lessonCatalog` in `src/data/lessons.ts`.
4. Add bundled images to `AssetRegistry.ts` only when the asset is local.
5. Run `npm run generate:audio:dry-run` to preview missing audio and inspect the
   printed `Missing files` count; exit code `0` does not mean the count is zero.
   Run real generation only when Google TTS auth/network access and the file
   changes are in scope. Newly generated files are trimmed automatically. Run
   `npm run trim:audio` to apply the same cleanup to existing TTS files.
6. Run `npm test -- --runInBand`.

## Asset Layout

Keep lesson-specific assets with the mini-scene that owns them:

```text
src/assets/lessons/<lesson-pack-id>/<scene-id>/
  images/
    background.webp
    baby.webp
    <object>.webp
  audio/
    en/
      <word_or_teacher_prompt>.wav
    vi/
      intro.wav
      <action_or_feedback>.wav
```

Keep reusable assets outside lesson folders:

```text
src/assets/shared/audio/sfx/
src/assets/shared/audio/en/
src/assets/shared/audio/vi/
```

## Audio Generation

`scripts/generateMissingAudio.mjs` scans the registered lesson catalog, builds
English vocabulary/prompt audio plus Vietnamese instruction/feedback audio,
skips files that already exist, and rewrites:

```text
src/data/audioManifest.ts
```

English lesson audio comes from vocabulary words, resolved English teacher
instructions, scene completion cues and shared teacher prompts such as
speech-practice and generic feedback. A step can provide `instructionEn`,
`successFeedbackEn` or `failFeedbackEn` for author-written English copy; when
`instructionEn` is absent, the teacher prompt resolver builds a child-friendly
English instruction from the interaction, vocabulary and `promptText`. Teach-step
success feedback can also fall back to a vocabulary meaning sentence such as
`It means good morning.` instead of the generic success cue.
Vietnamese audio comes from `instructionVi`, `successFeedbackVi`,
`failFeedbackVi`, completion messages and shared Vietnamese prompts. Bilingual
teacher mode does not have its own generated files; runtime plays the Vietnamese
segment and then the English segment.

### R2-first registry mode

The checked-in `GeneratedAudioRegistry.ts` is intentionally empty so lesson
audio loads from R2. The generator leaves this registry unchanged by default,
including in `--manifest-only` mode. Use `--write-bundled-registry` only for a
task that deliberately changes the delivery model or adds a bundled fallback.
Routine audio generation should keep the registry empty and update
`src/data/audioManifest.ts` plus the local WAV files only.

Use Google Cloud Text-to-Speech auth through one of:

```text
GOOGLE_TTS_API_KEY
GOOGLE_TTS_ACCESS_TOKEN
gcloud auth print-access-token
```

Optional filters:

```bash
npm run generate:audio -- --lesson=morning-routine --scene=bathroom
npm run generate:audio -- --limit=10
npm run generate:audio -- --manifest-only
npm run generate:audio -- --manifest-only --write-bundled-registry
```

Generated source files that are useful for re-cutting assets should mirror the
same lesson/scene folder under `src/assets/source/lessons/`. Final lossless PNG
masters live under `src/assets/source/master/lessons/`; WebP files under
`src/assets/lessons/` are generated and must not be edited manually.

## Image Asset Pipeline

Add or replace the final PNG master, then build and validate the generated
WebP output:

```bash
npm run assets:audit -- --lesson=my-lesson
npm run assets:build -- --lesson=my-lesson
npm run assets:verify -- --lesson=my-lesson
npm run check:images
npm run upload:r2:dry-run -- --lesson=my-lesson
npm run upload:r2 -- --lesson=my-lesson
npm run r2:verify -- --lesson=my-lesson
```

The four local asset commands (`assets:audit`, `assets:build`, `assets:verify`,
and `check:images`) do not require R2. The upload dry-run does not mutate the
bucket, but it still loads `.env`, requires R2 credentials and network access,
and reads the remote manifest. Run it only when that access is in scope; an
actual upload additionally requires explicit approval.

The build selects a 512, 768, or 1024 pixel object profile from the maximum
scene position, uses up to 1280 pixels for large characters, and 2048 pixels
for backgrounds. It never enlarges a master image. Configuration and per-asset
overrides live in `scripts/assets/config.mjs`.

R2 uses the `v1` prefix. Generated URLs include an image manifest revision so
an iPad does not reuse a stale device cache after the R2/CDN cache is purged.
Use `npm run r2:clear -- --prefix=v1/` to preview a purge; destructive execution
requires `--apply` and the confirmation printed by the script.

## Prefer Helpers

Use helpers from `src/data/lessonAuthoring.ts`:

```ts
import {
  characterObject,
  dragStep,
  imageAsset,
  learningObject,
  listenStep,
  rect,
  tapStep,
} from '../lessonAuthoring';
```

They keep object shape, position, and interaction config consistent.

## Learning Modes

Use `learningScope` when one scene needs older-child content:

```ts
{
  id: 'scene-teach-doll',
  learningScope: { minAge: 5, minMode: 'challenge' },
  vocabId: vocabulary.doll.id,
}
```

`core` is the default for 3-4 tuổi. `expanded` adds a few extra words or
phrases. `challenge` can add longer phrases or faster review steps. Keep
Vietnamese instruction and feedback text Vietnamese-only. Use `promptText` for
the English word/phrase cue, and add `instructionEn`, `successFeedbackEn` or
`failFeedbackEn` only when the generated English teacher instruction/feedback
needs author-written copy.

## Validator

`assertValidLessons()` runs automatically when `src/data/lessons.ts` loads in
dev. It catches common mistakes:

- duplicated lesson, scene, object, drop zone, or step ids
- missing `targetObjectId`, `correctObjectIds`, `dropZoneId`, or `nextStepId`
- object `vocabId` not listed in scene vocabulary
- invalid percent positions
- unreachable steps
- review game vocabulary ids not included in the lesson

The Jest test `lessonValidation.test.ts` also checks the lesson catalog.
