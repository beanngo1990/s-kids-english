# Theme 3 Content Draft - Co the, cam xuc va tu cham soc

**Draft date:** 2026-08-01

**Scope:** Theme `co-the-cam-xuc-va-tu-cham-soc` / "Co the, cam xuc va tu cham soc" /
"My Body, Feelings, and Self-Care".

This document records the first complete authoring pass. It is intended for in-app content review
before final image and Google TTS production.

## Draft Summary

- Theme 3 contains 8 lesson packs and 24 mini-scenes.
- Each lesson has 3 scenes.
- Each scene has 9 vocabulary targets:
  - 3 `core` targets for mode `core`.
  - 3 additional `expanded` targets for mode `expanded`.
  - 3 additional `challenge` phrase targets for mode `challenge`.
- The full theme has 216 unique vocabulary targets: 72 core, 72 expanded, and 72 challenge.
- Each lesson review game keeps 4 concrete or visually clear vocabulary IDs.
- Theme 3 remains subject to the same Premium and progress locks in local and production builds.

## Learning Journey

| Order | Lesson ID | Lesson Title | Scenes | Review Focus |
| --- | --- | --- | --- | --- |
| 1 | `my-body` | Co the cua be / My Body | `head-and-face`, `arms-and-hands`, `legs-and-feet` | head, eyes, hand, foot |
| 2 | `five-senses` | Nam giac quan / My Five Senses | `seeing-world`, `hearing-world`, `smell-taste-touch` | color, magnifying glass, bell, soft |
| 3 | `my-feelings` | Cam xuc cua be / My Feelings | `happy-and-sad`, `angry-and-scared`, `excited-and-proud` | happy, sad, angry, proud |
| 4 | `calm-myself` | Be binh tinh lai / I Can Calm Down | `body-signals`, `slow-breathing`, `comfort-corner` | heartbeat, feather, pinwheel, comfort toy |
| 5 | `personal-care` | Be tu cham soc / Personal Care | `face-and-hair-care`, `cough-and-sneeze-care`, `care-items` | hairbrush, face cloth, tissue, toothbrush |
| 6 | `dress-myself` | Be tu mac do / I Can Get Dressed | `choose-clothes`, `put-on-clothes`, `fasteners-and-shoes` | T-shirt, raincoat, sleeve, zipper |
| 7 | `toilet-routine` | Be tu di ve sinh / My Toilet Routine | `toilet-signals`, `toilet-steps`, `clean-and-private` | toilet, step stool, toilet paper, hand soap |
| 8 | `speaking-up` | Be noi dieu minh can / I Can Speak Up | `body-needs`, `pain-and-help`, `body-boundaries` | hungry, thirsty, tummy ache, trusted grown-up |

## Content Decisions

- The journey moves from concrete body awareness to senses, emotion naming, regulation, practical
  self-care, independence, and speaking up.
- Emotion and body-state words use vocabulary type `adjective`, so teacher prompts do not describe
  `happy`, `sad`, or `hungry` as nouns.
- Toilet content stays calm and shame-free. It teaches basic sequencing, privacy, and asking a
  grown-up for help without introducing a door-locking step.
- Boundary content uses direct child-safe phrases: `No, thank you`, `Stop, please`,
  `I don't like that`, and `tell a trusted grown-up`.
- Practice prompts describe fixed screen regions and never depend on another object that may have
  moved during an earlier drag step.
- Vietnamese practice instructions stay at 12 words or fewer in this draft.

## Layout And Copy Review

- All 24 scenes use contextual layouts instead of the original shared 3-by-3 card grid.
- The three body scenes place the child in the center and arrange body-part callouts around the
  relevant upper-body, hand, or leg areas.
- Other scenes group concrete items by context, such as a care shelf, clothes area, sink, quiet
  corner, or body-state callouts. Challenge phrase cards remain in one stable bottom row.
- Primary instructions now state only the required action. Absolute position wording is reserved
  for the retry hint after an incorrect choice.
- Drag interactions are limited to 10 objects with a clear destination. Emotion pictures,
  abstract states, and phrase cards use tap interactions so moved cards cannot make later prompts
  inaccurate.
- Demo backgrounds no longer contain a nine-panel grid. Concrete demo objects use open pictorial
  callouts, while phrase targets keep a card treatment so the two roles remain visually distinct.

## Asset Status

- `my-body` now has final local PNG masters and generated WebP output for all 33 image references
  across its three scenes. It reuses the approved Theme 2 child character, uses a quiet room
  background, and replaces generic callouts with polished body-part cutouts and action cards.
- `my-body` and `five-senses` also have complete local Google TTS corpora for Vietnamese, en-US,
  and en-GB. The current development audio overlay is generated with
  `npm run generate:audio:local-preview -- --lesson=five-senses` for pre-R2 QA.
- `five-senses` now has final local PNG masters and generated WebP output for all 33 image
  references across its three scenes. Its quiet sensory-room backgrounds, isolated vocabulary
  pictures, and stable bottom-row action cards follow the approved Theme 2 visual direction.
- The other six lesson packs still use demo PNG masters. Their asset keys follow the production
  folder contract and can be replaced without changing lesson data.
- Scene and lesson milestone icons have dedicated bundled SKids PNGs produced from per-lesson
  ImageGen sprite sheets and are no longer the temporary semantic ring icons.
- Remaining demo labels are review aids and are not the visual direction for final child-facing
  assets.

## Not Yet Final

- Lesson copy and vocabulary IDs are a review draft, not a content freeze.
- Images and production audio for the six lesson packs after `five-senses` are not final.
- Theme 3 assets have not been uploaded to R2.
