# Lesson Data Authoring

Use one file per lesson under `src/data/lessons/`, then register it in
`src/data/lessons.ts`.

## Add A Lesson

1. Create `src/data/lessons/myLesson.ts`.
2. Export one `Lesson`.
3. Add it to `lessonCatalog` in `src/data/lessons.ts`.
4. Add bundled images to `AssetRegistry.ts` only when the asset is local.
5. Add bundled audio to `audioManifest.ts` and `AudioAssetRegistry.ts` only
   when the audio should work offline before R2 is enabled.
6. Run `npm test -- --runInBand`.

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
