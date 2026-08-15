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

OAuth requests use `GOOGLE_CLOUD_PROJECT`, then `GCLOUD_PROJECT`, and default
to the quota/billing project `project-264a7ff9-a6b6-41ab-90e`. The active `gcloud` account
provides the token unless `GOOGLE_TTS_ACCOUNT` selects a different account.

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

Object state variants use the same master/generated layout as base object
images. The catalog, audit, build, verify, missing-image check, and runtime
preloader scan every `SceneObject.variants[].asset`; a variant may therefore be
initially hidden and still remains a required scene image.

The Theme 4 narrative slices have bounded sheet cutters before the standard
pipeline. `plant-a-seed` uses `assets:cut-plant-a-seed-production` and
`assets:verify-plant-a-seed-cutouts`; `help-it-grow` uses
`assets:cut-help-it-grow-production` and `assets:verify-help-it-grow-cutouts`;
`garden-friends` uses `assets:cut-garden-friends-production` and
`assets:verify-garden-friends-cutouts`. The garden-friends cutter takes one
text-free chroma sheet per scene, cuts transparent masters, reuses the approved
garden background and creates its four bundled map icons.
These commands only create local PNG masters and bundled map icons. They do not
create WebP, synthesize audio, or contact R2.

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
  findStep,
  imageAsset,
  learningObject,
  listenStep,
  objectVariant,
  rect,
  sceneObject,
  sceneStateChanges,
  tapStep,
} from '../lessonAuthoring';
```

They keep object shape, position, and interaction config consistent.
Use `sceneObject` for non-vocabulary action/decoration/drop-zone objects and
`findStep` when the child is asked to locate an object. The registered
`src/data/lessons/plantASeed.ts` pilot is the end-to-end reference for combining
these helpers with learning-mode filtering and Scene State v1.

## Scene State v1

Use Scene State v1 when a successful action needs a visible, durable result for
the rest of the current scene session. Objects keep their required base `asset`
and may add image `variants`, an `initialVariantId`, or an
`initialVisibility` of `hidden`/`visible`. A variant can override `position` and
`touchArea`; otherwise it inherits the base object geometry.

```ts
const pot = learningObject({
  assetSource: 'lessons/plant-a-seed/prepare-the-pot/images/pot-empty.webp',
  id: 'prepare-pot-pot',
  position: rect(38, 46, 24, 24),
  variants: [
    objectVariant({
      assetSource:
        'lessons/plant-a-seed/prepare-the-pot/images/pot-filled.webp',
      id: 'soil-ready',
    }),
  ],
  vocab: vocabulary.pot,
});

const step = tapStep({
  id: 'prepare-pot-add-soil',
  instructionVi: 'Chạm vào đất để cho vào chậu nhé.',
  successFeedbackVi: 'Chậu đã có đất rồi!',
  successStateChanges: [
    sceneStateChanges.setVariant(pot.id, 'soil-ready'),
    sceneStateChanges.hide('prepare-pot-soil-bag'),
    sceneStateChanges.show('prepare-pot-ready-mark'),
  ],
  targetObjectId: 'prepare-pot-soil-bag',
  type: 'practice',
});
```

`successStateChanges` supports only three v1 actions:

- `setObjectVariant`: switch one object to one of its authored variant IDs;
- `showObject`: make an initially/runtime-hidden object visible;
- `hideObject`: remove an object from rendering and hit testing.

Use `afterSuccessStateChanges` for cleanup that must wait until the success
feedback finishes. The chosen object stays rendered long enough for its
bounce/sparkle and teacher confirmation; runtime applies the deferred changes
only while advancing to the next step. A common use is hiding both illustrations
after a two-choice review. Keep visible cause/effect changes in
`successStateChanges`; do not use deferred changes as a general timing system.

The controller exposes these changes only for a correct interaction. Incorrect
and ignored interactions never change object state. Runtime applies immediate
changes in authored order, then applies deferred changes after successful
feedback playback. If required success-feedback playback fails and the runtime
must keep the child on the same step, that step's immediate state transaction is
rolled back and deferred cleanup is never applied, so its target remains
playable. Runtime resets all object state on scene replay/transition and does
not persist state across scenes or app sessions. V1 has no branching, inventory,
arbitrary variables, cross-scene state, or exact-step resume.

Variants inherit the parent object's `learningScope`. Mode filtering removes a
state change if its target object is unavailable in the selected mode; it does
not independently filter variants. Keep all core prerequisites and core end
state objects in `core` scope.

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
For pre-readers, never rely on a written `meaningVi` label to introduce an
action phrase. Author a `teach` step before its first `review` step: highlight
the text-free action image, explain the action naturally in `instructionVi`,
then let the normal English model and speech-practice sequence run. Repeat the
Vietnamese meaning and a concrete visual cue in the review instruction so the
child can answer without reading the English phrase. Keep each Vietnamese
instruction to one idea and one action; for the pre-reader path, aim for at
most 12 spoken words in teach and 10 in review.

Audit instructions against the whole visible scene, not only the correct
object. If a concept matches more than one object, name the correct visual form
or distinguishing feature (`túi đất có hình mầm`, `đống đất bên trái`, `giọt
nước màu xanh`). A vocabulary image must show the positive concept itself; do
not teach `puddle` with a crossed-out puddle or teach an action with a before-
state that does not visibly perform that action.

For a new concrete noun, introduce the English model and speech practice while
the referenced object is still clearly visible. If a later action hides or
transforms that object, teach the noun first, then use it in the action; do not
wait until after the object disappears to ask the child to repeat the word.
Teach a prerequisite noun such as `soil` before a longer phrase that contains
it. For a part such as `spout`, keep the whole object visible in the scene and
name its relationship to the part without adding the whole object to the
interactive target list. For a visual state such as `damp`, narrate the visible
before/after change before asking the child to identify the new state.

After a correct tap/find/drag interaction, the engine applies its implicit
success animation only to the object the child selected. `targetObjectIds` may
include distractors and must not be treated as a list of objects to celebrate.
Declare explicit animation effects when a successful action intentionally
needs to animate additional scene objects.

`SceneStep.speechPractice` separates vocabulary coverage from forced recording:

- `auto` opens the pronunciation panel and starts the microphone after a correct
  interaction.
- `optional` opens the same panel without starting the microphone, so the child
  can speak or continue.
- When omitted, `teach` keeps the legacy `auto` behavior; other step types do
  not open speech practice.

Prefer one speech-practice encounter per vocabulary item. Use `auto` for core
anchors and selected challenge action phrases, and `optional` for secondary
expanded vocabulary so tapping an object does not repeatedly trigger recording.
Do not narrate the imperative prompt `Bé nói theo cô nhé.` for an `optional`
encounter. The `plant-a-seed` pilot uses `auto` for all authored encounters so
the microphone starts after that prompt; each vocabulary still receives only
one encounter. Treat that pilot coverage as an explicit historical exception,
not as the default density for future narrative lessons.

### Vocabulary encounter roles

For a narrative lesson, classify each important English encounter during
storyboarding. These roles are authoring semantics and do not add fields to the
lesson schema:

- **New Anchor** introduces a word or phrase that the current lesson owns. Add a
  `VocabularyItem`, reference it with `vocabId`, teach its meaning through audio
  and visuals, and give it one speech-practice encounter. Only New Anchors belong
  in that lesson's review pool.
- **Quick Recall** actively reuses a previously introduced concept in a short
  choice or action. It normally does not duplicate the word as a new
  `VocabularyItem`, set `vocabId`, or open speech practice. `promptText` can
  provide context when resolving an English teacher prompt, but without
  vocabulary/model-word semantics it does not independently play the English
  word in Vietnamese teacher mode. Do not put English into `instructionVi` as a
  workaround.
- **Action Enabler** is a familiar object/action used to move the story forward.
  Author it as a regular interactive scene object without `vocabId`; prioritize
  immediate SFX/state feedback over another model-word or recording interruption.

Do not use a global exact-string overlap as proof that a child already knows a
word: free journey order and independently accessible themes mean prior exposure
is not guaranteed. A Quick Recall must remain solvable through Vietnamese audio
and a concrete visual cue even when the child skipped the earlier lesson. Respect
learning-mode scope as well: an expanded-only word cannot become a core
prerequisite later. Repeating a deep-teach flow for an old word requires an
explicit content decision; default to Quick Recall or Action Enabler instead.

Vary pacing around the stable interaction grammar. Reserve the full meaning ->
English model -> action -> speech -> state-change flow for New Anchors. Interleave
short actions, discovery reveals, sequence checks, and celebration beats. Separate
every deep-learn/pronunciation panel with a meaningful action or visual payoff;
`optional` still opens the panel and therefore counts as an interruption too.
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
- duplicated object variant ids or an invalid `initialVariantId`
- missing `targetObjectId`, `correctObjectIds`, `dropZoneId`, or `nextStepId`
- scene-state changes that reference a missing object or variant
- tap, find, or drag targets marked as non-interactive
- object `vocabId` not listed in scene vocabulary
- invalid object, variant, or drop-zone percent positions
- unreachable steps
- review game vocabulary ids not included in the lesson

The Jest test `lessonValidation.test.ts` also checks the lesson catalog.
