# Lesson Data Authoring

Use one file per lesson pack under `src/data/lessons/`, then register it in
`src/data/lessons.ts`. A `Lesson` is the parent pack; each item in `scenes`
should be a short mini-scene that can be completed independently.

## Add A Lesson Pack

1. Create `src/data/lessons/myLesson.ts`.
2. Export one `Lesson` with small, ordered mini-scenes in `scenes`.
3. Add it to `lessonCatalog` in `src/data/lessons.ts`.
4. Add bundled images to `AssetRegistry.ts` only when the asset is local.
5. Add bundled audio to `audioManifest.ts` and `AudioAssetRegistry.ts` only
   when the audio should work offline before R2 is enabled.
6. Run `npm test -- --runInBand`.

## Asset Layout

Keep lesson-specific assets with the mini-scene that owns them:

```text
src/assets/lessons/<lesson-pack-id>/<scene-id>/
  images/
    background.png
    baby.png
    <object>.png
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

Generated source files that are useful for re-cutting assets should mirror the
same lesson/scene folder under `src/assets/source/lessons/`.

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
