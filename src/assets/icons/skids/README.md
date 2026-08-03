# Sungy Icon Pack

Custom icon pack for Sungy English.

Style:

- Premium cartoon 3D-lite
- Soft rounded shapes
- White sticker outline
- Logo palette: teal, sun yellow, sky blue, coral, cream
- Designed for child-first UI where icons carry the primary action

Icons:

- `listen.png`
- `speak.png`
- `next.png`
- `replay.png`
- `map.png`
- `parent-lock.png`
- `sticker.png`
- `star.png`
- `bedroom.png`
- `bathroom.png`
- `breakfast.png`
- `school.png`

New or updated icon assets use `512x512` transparent PNG files. Theme assets follow
`theme-<theme-summary>.png`, are referenced by `LessonTheme.iconName`, and replace emoji-only
theme badges in app UI. Lesson milestone assets follow `milestone-<lesson-id>.png`, are registered
statically in `index.ts`, and must not reuse a scene icon. Completion state remains dynamic in the
milestone stars/pedestal, so milestone PNGs do not bake in a checkmark or completion badge.

Theme 2 and Theme 3 map station icons were produced with ImageGen, primarily from 2-by-2 sprite
sheets, then chroma-keyed and cropped into the static PNG files consumed by `SKidsIcon`.

This bundled icon pack is separate from lesson WebP generation and R2 upload. `preview.png` is
only a contact sheet for visual review.
