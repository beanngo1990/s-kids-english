# S-Kids Icon Pack

Custom icon pack for S-Kids English.

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

New or updated icon assets use `512x512` transparent PNG files. Lesson milestone assets follow
`milestone-<lesson-id>.png`, are registered statically in `index.ts`, and must not reuse a scene
icon. Completion state remains dynamic in the milestone stars/pedestal, so milestone PNGs do not
bake in a checkmark or completion badge.

This bundled icon pack is separate from lesson WebP generation and R2 upload. `preview.png` is
only a contact sheet for visual review.
