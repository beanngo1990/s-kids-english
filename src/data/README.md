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
   printed `Missing files` and `Invalid files` counts; exit code `0` does not
   mean the corpus is complete. Run real generation only when Google TTS
   auth/network access and the file changes are in scope. Production English
   WAVs are not silence-trimmed; Vietnamese generation keeps its current trim
   behavior. Do not run `npm run trim:audio` over the production English accent
   directories.
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
    en-US/
      neural2-c-r1/
        <word_or_teacher_prompt>.wav
    en-GB/
      neural2-c-r1/
        <word_or_teacher_prompt>.wav
    vi/
      intro.wav
      <action_or_feedback>.wav
```

Keep reusable assets outside lesson folders:

```text
src/assets/shared/audio/sfx/
src/assets/shared/audio/en-US/neural2-c-r1/
src/assets/shared/audio/en-GB/neural2-c-r1/
src/assets/shared/audio/vi/
```

Child-facing UI prompts are generated with the same production Google TTS
profiles but bundled as UI assets for immediate playback:

```text
src/assets/ui/audio/en-US/neural2-c-r1/
src/assets/ui/audio/en-GB/neural2-c-r1/
src/assets/ui/audio/vi/
```

Their copy currently comes from `src/data/kidLockAudioPrompts.ts` plus selected
Sungy Home/Onboarding English lines in `src/i18n/dictionaries/en.ts`; the
generator owns `src/engine/GeneratedUiAudioRegistry.ts`. Do not edit the
generated registry by hand. Keep the WAV files as the manifest/provenance
source, then run `npm run assets:optimize-ui-audio` to create bundled MP3
sidecars and rewrite the registry so stable WAV manifest keys resolve to those
smaller local files.

`audio/en/` is the legacy en-US corpus. Keep it intact as a compatibility and
rollback source, but do not write new production English releases there. New
dual-accent targets omit the legacy manifest fallback unless a legacy file
already exists.

## Audio Generation

`scripts/generateMissingAudio.mjs` scans the registered lesson catalog, audits
or builds English vocabulary/prompt audio plus Vietnamese instruction/feedback
audio, and publishes the generated manifests only after the complete production
corpus is present and valid. Each file uses atomic replacement; provenance is
written first and the runtime manifest last as the commit point:

```text
src/data/audioManifest.ts
src/data/englishAudioGenerationManifest.json
```

The production English profile is fixed for release `neural2-c-r1`:

- `en-US` uses `en-US-Neural2-C`.
- `en-GB` uses `en-GB-Neural2-C`.
- Both accents use LINEAR16 PCM mono WAV at 24 kHz, speaking rate `0.9`.
- English output is not silence-trimmed.

The provenance manifest records the release, synthesis configuration, voices,
target keys, byte sizes and SHA-256 values. Do not hand-edit either generated
manifest. A filtered or limited generation run may create WAVs, but it must not
publish a partial manifest: publication remains gated on every current en-US,
en-GB and Vietnamese target passing the full-corpus audit.

English lesson audio comes from vocabulary words, resolved English teacher
instructions, scene completion cues and shared teacher prompts such as
speech-practice and generic feedback. A step can provide `instructionEn`,
`successFeedbackEn` or `failFeedbackEn` for author-written English copy; when
`instructionEn` is absent, the teacher prompt resolver builds a child-friendly
English instruction from the interaction, vocabulary and `promptText`. Missing
English feedback first uses contextual lesson data, such as vocabulary,
interaction, action prompt and drop zone, before falling back to generic cues.
Teach-step success feedback can also fall back to a vocabulary meaning sentence
such as `It means good morning.`.
Scene intros and completion messages with child-facing narrative meaning should
provide explicit English copy (`instructionEn`, `successFeedbackEn`, and
`completionReward.messageEn`) instead of reusing a scene title as a translation.
Location hints are resolved as English hints rather than being collapsed into a
generic tap instruction.
Vietnamese audio comes from `instructionVi`, `successFeedbackVi`,
`failFeedbackVi`, completion messages and shared Vietnamese prompts such as
speech-practice feedback and review-game intros. Bilingual
teacher mode does not have its own generated files; runtime plays the Vietnamese
segment and then the English segment.

The generator also audits and builds localized Kid Mode UI prompts. These UI
clips are bundled instead of uploaded as lesson audio so locked-map and Sungy
coach feedback remains immediate and does not depend on R2 availability.

### R2-first registry mode

The checked-in `GeneratedAudioRegistry.ts` is intentionally empty so lesson
audio loads from R2. The generator leaves this registry unchanged by default,
including in `--manifest-only` mode. Use `--write-bundled-registry` only for a
task that deliberately changes the delivery model or adds a bundled fallback.
Routine audio generation should keep the registry empty and update
the local WAV files plus both generated manifests only after the full-corpus
gate passes.

Use Google Cloud Text-to-Speech auth through one of:

```text
GOOGLE_TTS_API_KEY
GOOGLE_TTS_ACCESS_TOKEN
gcloud auth print-access-token
```

Optional filters:

```bash
npm run generate:audio -- --language=en --accent=en-US
npm run generate:audio -- --language=en --accent=en-GB
npm run generate:audio -- --lesson=morning-routine --scene=bathroom
npm run generate:audio -- --limit=10
npm run generate:audio -- --manifest-only
npm run generate:audio -- --manifest-only --write-bundled-registry
npm run generate:audio:local-preview -- --lesson=supermarket-trip
```

The local-preview command audits every English accent and Vietnamese target for
the selected lesson, then writes gitignored `audioManifest.local.ts` and
`localAudioPreview.local.ts` overlays. It never calls Google TTS, rewrites the
production manifests, or bundles lesson WAVs. In a Metro development build,
the overlay resolves those keys through the active local asset server; other
lessons keep the normal unpublished-audio QA behavior. Restart Metro after
changing the preview lesson. Run `npm run assets:use-r2` to clear the local
asset/audio preview overlays before checking a dev build against R2.

`--audio-release=neural2-c-r1` is the current default. Once a release has been
published, its R2 keys are immutable: a voice, synthesis, pronunciation or
post-processing change must use a new release ID instead of overwriting the
published path. The generator compares published provenance with local bytes
and refuses `--force`, config/voice drift or a SHA mismatch for an existing
English release key.

Generated source files that are useful for re-cutting assets should mirror the
same lesson/scene folder under `src/assets/source/lessons/`. Final lossless PNG
masters live under `src/assets/source/master/lessons/`; WebP files under
`src/assets/lessons/` are generated and must not be edited manually.

For the US/UK voice evaluation record, use the isolated 24-word pilot described
in `docs/audio-accent-pilot.md`. Its preview is read-only and its generated WAVs
stay under gitignored `build/`; it does not change production audio or R2. The
approved production voices are the two Neural2-C variants above.

The Parent Mode accent choice changes pronunciation only. It does not change
app language, teacher prompt mode, vocabulary spelling or lesson/UI copy.
Missing or legacy persisted settings normalize to en-US.

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
requires `--apply` and the confirmation printed by the script. Never clear
`v1` as part of an English accent rollout: that shared prefix also contains
production images and Vietnamese audio. Publish the immutable accent/release
keys in place and verify them without a prefix clear.

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
Keep `VocabularyItem.word` natural when spoken aloud: action phrases should
include required articles or possessives, such as `open the book`,
`raise your hand`, and `wash your hands`.
Use vocabulary type `adjective` for standalone describing words such as
`happy`, `quiet`, or `hungry`; do not model them as nouns only to reuse noun
teacher copy.

Lesson and theme titles should keep `titleVi` plus `titleEn`. Use
`descriptionVi` for Vietnamese app copy and add `descriptionEn` when the
description is shown in English UI. Themes can set `iconName` to a bundled
SKids icon for app UI; keep `thumbnailEmoji` as a fallback.

## Review Game Config

Use `reviewGame.config.vocabularyIds` to choose the vocabulary items for the
end-of-lesson review. Runtime treats this list as an ordered allow-list, then
filters it through the current `learningMode` and available image objects before
passing items to Memory, Listen & Choose, or Matching. If no list is provided,
runtime falls back to the available lesson vocabulary and applies the default
mode counts: 4 for `core`, 5 for `expanded`, and 6 for `challenge`.

## Validator

`assertValidLessons()` runs automatically when `src/data/lessons.ts` loads in
dev. It catches common mistakes:

- duplicated lesson, scene, object, drop zone, or step ids
- missing `targetObjectId`, `correctObjectIds`, `dropZoneId`, or `nextStepId`
- drag targets marked as non-interactive
- object `vocabId` not listed in scene vocabulary
- invalid percent positions
- unreachable steps
- review game vocabulary ids not included in the lesson

The Jest test `lessonValidation.test.ts` also checks the lesson catalog.
