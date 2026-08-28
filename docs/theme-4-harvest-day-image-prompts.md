# Harvest Day - ImageGen Prompt Log

**Generation mode:** built-in ImageGen tool, then local Sharp cutter
`scripts/assets/cutHarvestDayProductionSheets.mjs`.

**Workspace outputs:**

- `src/assets/source/lessons/harvest-day/production-sheets/find-the-ripe-ones-chroma.png`
- `src/assets/source/lessons/harvest-day/production-sheets/pick-gently-chroma.png`
- `src/assets/source/lessons/harvest-day/production-sheets/sort-the-harvest-chroma.png`

Each initial generation needed one ImageGen edit pass because the model rendered a gradient
instead of the requested flat chroma background. The edit prompts below produced the final
workspace sheets.

## `find-the-ripe-ones`

### Initial generation

> Create a production sprite sheet for a polished preschool English-learning app called Sungy.
> Wide 3:2 canvas, exact 4 columns by 3 rows grid, but DO NOT draw grid lines. Flat perfectly
> uniform chroma-magenta background color #FF00FF across the entire canvas. One isolated,
> centered, text-free 3D clay-like storybook object in each cell, with very generous empty
> magenta padding around every object; nothing may cross a cell boundary; no ground plane, no
> environmental background, no cast shadow, no labels, no letters, no numbers, no logos, no
> watermark. Warm rounded forms, soft highlights, clean readable silhouettes, consistent with a
> premium friendly children’s garden app. Use the exact cell order left-to-right, top-to-bottom:
> (1) a healthy young tomato plant in a terracotta pot, green stems and broad leaves, NO tomatoes
> on it, front view; (2) one ripe red tomato attached to a short small green branch, round and
> plump; (3) one smaller unripe green tomato attached to a short small green branch; (4) a large
> teal magnifying-glass observation ring, front view. Row 2: (5) close-up ripe red tomato on a
> small green branch, visibly round, smooth, firm and ready, with only a subtle golden sparkle
> halo and no symbol; (6) one broad green tomato leaf cover facing forward, fully closed/down;
> (7) the same broad green tomato leaf lifted upward, clearly an open/lifted variant; (8) a
> positive action vignette: a gentle open child hand staying back while a green unripe tomato
> remains safely attached to its branch, visually meaning leave it on the plant. Row 3: (9) a
> wrong-action distractor vignette: a child hand pulling a green unripe tomato away from its
> branch, clear but not scary; (10) a small empty woven harvest basket, front three-quarter view;
> (11) a small round teal tap/observation control with a simple eye icon made only from shapes, no
> text; (12) a small cheerful golden sparkle burst. Every cell must remain fully separate with at
> least 12 percent cell-width blank magenta gutter on every side. The leaf variants and action
> vignettes must be visually distinguishable at thumbnail size. No baked text of any kind.

### Final chroma edit

> Edit this exact sprite sheet. Preserve all 12 objects, their 4-column by 3-row placement,
> scale, shape, colors and generous separation. Replace EVERY background pixel and every colored
> glow/background patch behind the objects with one perfectly flat, solid, uniform pure chroma
> magenta #FF00FF. Remove all ambient background gradients, colored halos, cast shadows, floor
> planes and scenery. Keep only the isolated objects and intentional small golden sparkles around
> the ripe tomato and in the final sparkle object. The red tomato must not have any red glow
> behind it. The result must be suitable for deterministic chroma-key cutting: background exactly
> #FF00FF everywhere outside object silhouettes. No grid lines, text, letters, numbers, labels,
> logos or watermark. Do not crop any object.

## `pick-gently`

### Initial generation

> Create a deterministic production sprite sheet for a premium preschool English-learning garden
> app, text-free 3D clay storybook style, warm rounded forms, clean readable silhouettes. Wide
> 3:2 canvas with an exact invisible 4-column by 3-row grid. The entire background must be one
> perfectly flat solid pure chroma magenta #FF00FF with NO gradient, NO glow behind objects, NO
> floor, NO scenery, NO cast shadows, NO grid lines. Each cell contains one isolated centered
> object with at least 14 percent of the cell width as untouched magenta padding on every side;
> nothing crosses cell borders. Exact cell order left-to-right, top-to-bottom: Row 1: (1) healthy
> young tomato plant in a terracotta pot, green stems and leaves, NO tomatoes; (2) ripe red tomato
> still attached to a short green branch, easy to drag; (3) close-up of a red tomato connected to
> a branch by one clearly visible green fruit stem; (4) an open child hand control, palm up,
> friendly and ready. Row 2: (5) positive action vignette of a child hand gently supporting and
> twisting a ripe red tomato from its stem, no tool; (6) small empty woven harvest basket; (7) the
> exact same woven basket holding one ripe red tomato; (8) a round teal tap control with a simple
> open-hand symbol made only of shapes. Row 3: (9) healthy tomato plant after fruit was picked,
> branch intact, no fruit; (10) small golden success sparkle; (11) empty placeholder cell, pure
> magenta only; (12) empty placeholder cell, pure magenta only. Absolutely no scissors, knife,
> text, letters, numbers, logo, watermark or labels. Preserve fully flat #FF00FF outside the
> object silhouettes; no colored aura or halo around any object.

### Final chroma edit

> Edit this exact 4 by 3 sprite sheet. Keep all ten existing objects in exactly the same cells and
> preserve their shapes, scale, colors, details, safety and separation. Replace every background
> pixel, every black empty-cell region, every gradient, colored aura and glow behind objects with
> a single perfectly flat solid pure chroma magenta #FF00FF. No floor, scenery, cast shadow or
> grid line. The two empty cells at bottom right must be pure #FF00FF. Preserve only the isolated
> object silhouettes and the intentional golden sparkle object; remove the yellow/red/green/teal
> glow surrounding all other assets. No crop, no text, letters, numbers, logo, watermark,
> scissors or knife. Output must be deterministic chroma-key-ready with #FF00FF everywhere
> outside object silhouettes.

## `sort-the-harvest`

### Initial generation

> Create a deterministic production sprite sheet for Sungy, a premium preschool English-learning
> app. Friendly polished 3D clay storybook garden objects, warm rounded forms, clean readable
> silhouettes. Wide 3:2 canvas with an exact invisible 4-column by 4-row grid. Entire background
> must be one perfectly flat solid pure chroma magenta #FF00FF, with NO gradient, NO glow behind
> objects, NO floor, NO scenery, NO cast shadows, NO grid lines. One isolated centered text-free
> object per cell with generous untouched magenta gutter around it; nothing crosses a cell
> boundary. Exact order left-to-right, top-to-bottom: Row 1: (1) a compact group of garden
> vegetables: two orange carrots and two green pea pods, clearly vegetables; (2) a tied bunch of
> fresh green basil and parsley herbs; (3) one ripe round red tomato; (4) one red tomato with a
> clearly visible brown bruised dent on one side, not rotten or scary. Row 2: (5) small empty woven
> basket with an orange carrot-shaped color marker made only from shapes, no text; (6) exact same
> basket filled with carrots and pea pods; (7) small empty woven basket with a green leaf-shaped
> color marker; (8) exact same basket filled with green basil and parsley herbs. Row 3: (9) small
> empty woven basket with a red round tomato-shaped color marker; (10) exact same basket holding
> one ripe red tomato; (11) shallow cream adult-check tray with a large friendly adult hand
> hovering above it, empty tray; (12) exact same tray holding the bruised tomato while the adult
> hand gently examines it. Row 4: (13) positive sorting action vignette: three separate small
> baskets side by side, one with tomato, one with carrots and peas, one with herbs; (14)
> wrong-action distractor vignette: tomatoes, carrots, pea pods and herbs visibly jumbled together
> in one basket; (15) cheerful final composite of the three neatly sorted filled baskets with a
> few small golden sparkles; (16) small golden success sparkle burst. Important: do not include
> any words, labels, letters, numbers, logos, watermark, knives or scissors. Keep the basket
> variants visually consistent. Preserve flat #FF00FF everywhere outside object silhouettes with
> no aura or halo.

### Final chroma edit

> Edit this exact 4 by 4 sprite sheet. Preserve all sixteen objects in their exact cells, their
> shapes, size, colors, basket consistency and details. Replace every background pixel and every
> orange/green/red/gray/gold gradient, aura, glow and shadow behind the objects with one perfectly
> flat solid pure chroma magenta #FF00FF. No floor, scenery, cast shadow or grid line. Preserve
> only the isolated object silhouettes and the intentional small gold sparkles in the last two
> cells. Remove the gold glow behind the final sparkle cell and behind the sorted baskets. No crop
> and nothing may cross cell boundaries. No text, letters, numbers, labels, logo, watermark,
> knife or scissors. Output must be deterministic chroma-key-ready with #FF00FF everywhere
> outside object silhouettes.
