# Sungy Mascot Assets

This folder contains the phase-1 mascot asset contract for Sungy.

Current pose files are transparent PNG cutouts generated from a new 3D mascot
sheet for S-Kids English:

- `sungy-source-poster.png`: stable source reference used by the app manifest.
- `sungy-3d-sheet-source.png`: generated 3D character sheet with chroma-key background.
- `sungy-3d-sheet-transparent.png`: same sheet after chroma-key removal.
- `sungy-hero.png`: large full-body hero pose.
- `sungy-avatar.png`: close-up avatar.
- `sungy-hello.png`: greeting/waving pose.
- `sungy-learn.png`: reading/learning pose.
- `sungy-great-job.png`: celebration pose with star.
- `sungy-lets-go.png`: pointing/guide pose.
- `sungy-hint.png`: thinking/hint pose.
- `sungy-try-again.png`: encouraging retry pose.

Replacement guideline:

- Keep these filenames stable so UI code can evolve without asset churn.
- Prefer hand-finished transparent PNG or WebP cutouts for future art passes.
- Keep Sungy centered with a small amount of padding around the full pose.
- Avoid embedding text in pose files; localize copy in app data instead.
