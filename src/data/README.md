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
   Do not run `npm run generate:audio` until the R2-only registry conflict below
   has been resolved for the task. Newly generated files are trimmed
   automatically. Run `npm run trim:audio` to apply the same cleanup to existing
   TTS files.
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
      <word>.wav
    vi/
      intro.wav
      <action_or_feedback>.wav
```

Keep reusable assets outside lesson folders:

```text
src/assets/shared/audio/sfx/
src/assets/shared/audio/vi/
```

## Audio Generation

`scripts/generateMissingAudio.mjs` scans the registered lesson catalog, builds
English word audio plus Vietnamese instruction/feedback audio, skips files that
already exist, and rewrites:

```text
src/data/audioManifest.ts
src/engine/GeneratedAudioRegistry.ts
```

### Current R2-only registry conflict

The checked-in `GeneratedAudioRegistry.ts` is intentionally empty so lesson
audio loads from R2. The generator currently scans all local WAV/MP3 files and
rewrites that registry with bundled `require(...)` entries, including in
`--manifest-only` mode. Running or committing the generator output can therefore
bundle the complete lesson-audio catalog and change the runtime delivery model.

Until the generator has an explicit remote-only mode, do not run
`generate:audio` or `--manifest-only` as a routine refresh. A task that genuinely
needs generation must first decide whether audio remains R2-only or gains a
bundled fallback, then update the generator and documentation consistently.

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
Vietnamese instruction and feedback text Vietnamese-only; put English in
`promptText` or vocabulary so the English voice reads it.

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
