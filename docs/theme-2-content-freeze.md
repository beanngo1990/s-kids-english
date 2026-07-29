# Theme 2 Content Freeze - Be ra ngoai kham pha

**Freeze date:** 2026-07-29

**Scope:** Theme `be-ra-ngoai-kham-pha` / "Be ra ngoai kham pha" / "Out and About".

This document records the content state approved for final image and audio work. It is a
production-content checkpoint, not an asset release note.

## Freeze Summary

- Theme 2 contains 8 lesson packs and 24 mini-scenes.
- Each lesson has 3 scenes.
- Each scene has 9 vocabulary targets:
  - 3 `core` targets for mode `core`.
  - 3 additional `expanded` targets for mode `expanded`.
  - 3 additional `challenge` phrase targets for mode `challenge`.
- The full theme has 216 vocabulary targets: 72 core, 72 expanded, and 72 challenge.
- Each lesson review game keeps 4 curated vocabulary IDs.
- Lesson, scene, object, vocabulary, review and asset keys are considered stable for final asset
  work.
- Final image work should replace PNG masters only; do not rename asset keys unless there is a
  separate migration task.
- Final audio work should run after this content freeze, because the copy below is now the source
  for vocabulary and prompt audio.

## Content Decisions

- Keep the theme organized by familiar outside contexts: supermarket, park, beach, animals,
  library, doctor, birthday party and grandparents.
- Keep the child-facing Vietnamese instructions short and warm.
- Keep English vocabulary natural for spoken audio, especially challenge phrases with required
  articles or possessives.
- Keep review games focused on concrete, image-friendly vocabulary instead of long action phrases.
- Keep premium/content-lock behavior identical between local and production builds. Local asset
  preview does not unlock Theme 2.

## Lesson Checklist

| Order | Lesson ID | Lesson Title | Scenes | Review Focus |
| --- | --- | --- | --- | --- |
| 1 | `supermarket-trip` | Be di sieu thi / Supermarket Trip | `shopping-list`, `fresh-foods`, `checkout-counter` | shopping list, cart, vegetables, cashier |
| 2 | `park-visit` | Be di cong vien / Park Visit | `park-entrance`, `park-games`, `park-picnic` | gate, path, frisbee, picnic mat |
| 3 | `beach-day` | Be di bien / Beach Day | `beach-bag`, `sand-play`, `sea-safety` | sun hat, sunscreen, sandcastle, lifeguard |
| 4 | `animal-trip` | Be tham dong vat / Animal Visit | `animal-gate`, `farm-yard`, `zoo-path` | ticket, goat, cow, zebra |
| 5 | `library-visit` | Be di thu vien / Library Visit | `library-card`, `book-corner`, `story-circle` | library card, shelf, picture book, storyteller |
| 6 | `doctor-visit` | Be di bac si / Doctor Visit | `clinic-room`, `health-check`, `medicine-care` | doctor, nurse, thermometer, tissue |
| 7 | `birthday-party` | Be di sinh nhat / Birthday Party | `party-prep`, `party-games`, `party-table` | balloon, gift, game, cake |
| 8 | `grandparents-visit` | Be tham ong ba / Visiting Grandparents | `family-visit`, `garden-help`, `goodbye-home` | grandma, grandpa, watering can, thank-you card |

## Scene Vocabulary Shape

Every scene follows this shape:

- `core`: concrete, easy-to-show nouns or child-friendly verbs.
- `expanded`: additional nouns that enrich the scene.
- `challenge`: short everyday action phrases.

Notable copy polish applied before freeze:

- `throw away trash` -> `throw away the trash`.
- `Sea Safety` -> `Beach Safety`; Vietnamese title updated to "An toan o bien".
- `keeper` -> `zookeeper`; `follow the keeper` -> `follow the zookeeper`.
- `library bell` -> `story bell`.
- `take medicine` -> `take your medicine`.
- `drink water` -> `drink some water`.
- `blow out candles` -> `blow out the candles`.
- `Grandparents Visit` -> `Visiting Grandparents`.
- `Goodbye Home` -> `Saying Goodbye`.
- `visit bag` -> `small bag`.
- The grandparents scene keeps `wave`, with Vietnamese meaning clarified as a goodbye gesture.
- `put on shoes` -> `put on your shoes`.

## Ready For Final Assets

Before creating or replacing final images:

- Keep source PNG masters under `src/assets/source/master/lessons/<lesson>/<scene>/images/`.
- Keep the current asset keys and filenames unless a separate migration is approved.
- Use child-clear, inspectable visuals for each object and action card.
- After replacing masters, run the local image pipeline:
  - `npm run assets:audit -- --lesson=<lesson-id>`
  - `npm run assets:build -- --lesson=<lesson-id>`
  - `npm run assets:verify -- --lesson=<lesson-id>`
  - `npm run check:images`

## Ready For Audio

Before generating production audio:

- Do not hand-edit `src/data/audioManifest.ts`.
- Run `npm run generate:audio:dry-run` and inspect both `Missing files` and `Invalid files`.
- Generate real audio only after final text approval and explicit permission for Google TTS/network
  file generation.
- Keep production English audio in both `en-US` and `en-GB` under release `neural2-c-r1`.

## Known Non-Final Items

- Current Theme 2 images are still demo/placeholder art.
- Production audio for changed Theme 2 copy has not been generated in this freeze pass.
- R2 upload/publish is not part of this freeze pass.
