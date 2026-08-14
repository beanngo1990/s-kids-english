# Garden-to-Table ImageGen Prompt Log

**Generator:** built-in ImageGen  
**Generated:** 2026-08-14  
**Style reference only:**
`src/assets/source/lessons/harvest-day/production-sheets/find-the-ripe-ones-chroma.png`

The reference controls the warm soft-3D preschool rendering and 4x3 spacing only. No reference
subject was copied. All three final sheets use a flat opaque `#ff00ff` background, no text, no
cell cards, no shadow on the chroma plate, generous cell gutters, and adult-only food/seed hands.

## Final workspace sheets

- `src/assets/source/lessons/garden-to-table/production-sheets/rinse-and-drain-chroma.png`
- `src/assets/source/lessons/garden-to-table/production-sheets/make-and-share-chroma.png`
- `src/assets/source/lessons/garden-to-table/production-sheets/save-for-next-season-chroma.png`

## Prompt 1 — Rinse and Drain

Create exactly 12 text-free cutouts in a 4x3 sheet: dirty cucumber, clean cucumber, dirty lettuce,
clean lettuce; blue water/faucet control, clear water stream, adult hands rinsing cucumber, empty
perforated teal colander; filled colander, adult hands rinsing all sides, tiny splash touching one
lettuce spot as neutral distractor, and clean cucumber plus lettuce. Use warm rounded soft-3D toy
style. No fruit, red X, knife, stove, child hands, text, border, opaque cell background, overlap or
edge contact. Keep the plate perfectly flat opaque `#ff00ff`.

The first result incorrectly put an apple in row 3 column 3. The final edit replaced only that
cell with a small water splash touching one lettuce spot and preserved every other cell.

## Prompt 2 — Make and Share

Create exactly 12 text-free cutouts in a 4x3 sheet: folded mint kitchen towel, towel flat beneath
an empty bowl, empty solid cream bowl, bowl with lettuce; bowl with separate prepared lettuce and
cucumber, mixed salad bowl, two equal small portions, prepared lettuce pieces; prepared cucumber
slices, rounded serving spoon, finished cold salad close-up, and two adult hands offering the two
portions. Use the same warm rounded soft-3D style. No knife, stove, fire, hot water, cutting,
child hands, text, border, opaque cell background, overlap or edge contact. Keep the plate flat
opaque `#ff00ff`.

## Prompt 3 — Save for Next Season

Create exactly 12 text-free cutouts in a 4x3 sheet: adult palm with one dry tomato seed, enlarged
dry tomato seed, plain empty open envelope, envelope with a seed; closed envelope, envelope stored
on a garden shelf, adult hand moving a seed to the envelope, adult pointing hand; sun/leaf season
cycle, new-season soil pot with seed cue, adult hands saving dry seeds into the envelope, and an
adult hand planting directly into a pot as neutral distractor. Use the same warm rounded soft-3D
style. No child hand, mouth, tasting, text, label, knife, stove, border, opaque cell background,
overlap or edge contact. Keep the plate flat opaque `#ff00ff`.

## Local post-processing

`npm run assets:cut-garden-to-table-production -- --force` removes chroma, deletes small detached
components touching a cell gutter, writes transparent 1024x1024 PNG masters and generates four
bundled icons. `npm run assets:verify-garden-to-table-cutouts` checks alpha corners, chroma residue,
empty outputs and opaque-black mattes. A 36-cutout contact sheet was also flattened on white and
visually inspected before WebP build.
