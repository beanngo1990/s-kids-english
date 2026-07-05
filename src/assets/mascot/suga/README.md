# Suga Mascot Assets

This folder contains the phase-1 mascot asset contract for Suga.

Current pose files are transparent PNG cutouts generated from a new 3D mascot
sheet for S-Kids English:

- `suga-source-poster.png`: stable source reference used by the app manifest.
- `suga-3d-sheet-source.png`: generated 3D character sheet with chroma-key background.
- `suga-3d-sheet-transparent.png`: same sheet after chroma-key removal.
- `suga-hero.png`: large full-body hero pose.
- `suga-avatar.png`: close-up avatar.
- `suga-hello.png`: greeting/waving pose.
- `suga-learn.png`: reading/learning pose.
- `suga-great-job.png`: celebration pose with star.
- `suga-lets-go.png`: pointing/guide pose.
- `suga-hint.png`: thinking/hint pose.
- `suga-try-again.png`: encouraging retry pose.

Replacement guideline:

- Keep these filenames stable so UI code can evolve without asset churn.
- Prefer hand-finished transparent PNG or WebP cutouts for future art passes.
- Keep Suga centered with a small amount of padding around the full pose.
- Avoid embedding text in pose files; localize copy in app data instead.
