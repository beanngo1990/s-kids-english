# English Accent Audio Pilot

This isolated pilot was created to compare English pronunciation before the
accent choice was wired into the production app. It remains separate from
lesson assets, `audioManifest.ts`, the generated registry and R2.

## Production decision

The approved production profile keeps both English accents and standardizes on
the female Neural2-C voice for each locale:

- en-US: `en-US-Neural2-C`;
- en-GB: `en-GB-Neural2-C`;
- LINEAR16 PCM mono WAV at 24 kHz;
- speaking rate `0.9`;
- no English silence trimming;
- immutable production release path `neural2-c-r1`.

Missing or legacy persisted preferences default to en-US. Parent Mode changes
pronunciation only: choosing en-GB does not change app language, teacher prompt
mode, vocabulary spelling or lesson/UI copy.

## Evaluation scope

- 24 existing vocabulary words or phrases from `src/data/vocabulary.ts`.
- Four female voice variants to keep speaker gender from becoming another
  comparison variable:
  - `en-US-Chirp3-HD-Aoede`
  - `en-GB-Chirp3-HD-Aoede`
  - `en-US-Neural2-C`
  - `en-GB-Neural2-C`
- LINEAR16 mono WAV at 24 kHz.
- Speaking rate `0.9` for a child-oriented first review.
- No silence trimming, SSML or pronunciation override. This keeps model and
  accent as the main variables and avoids the legacy trim behavior affecting
  weak initial or final consonants.

The 24 × 4 matrix produces 96 WAV files. Outputs go to the gitignored directory
`build/audio-accent-pilot/<config-hash>/`. The hash covers the corpus, locale,
voice, audio settings and trim policy, so a configuration change cannot silently
reuse an earlier pilot.

The Chirp3 variants remain in this evaluation matrix as comparison evidence;
they are not production voices for `neural2-c-r1`.

## Commands

Preview without authentication, network calls or file writes:

```bash
npm run generate:audio:accent-pilot
```

Generate the complete pilot after reviewing the preview:

```bash
npm run generate:audio:accent-pilot -- --apply
```

Verify all WAV headers, byte sizes, SHA-256 values, manifest entries and review
page controls without network access:

```bash
npm run verify:audio:accent-pilot
```

Optional bounded runs:

```bash
npm run generate:audio:accent-pilot -- --apply --word=water
npm run generate:audio:accent-pilot -- --apply --variant=en-GB-chirp3-aoede
npm run generate:audio:accent-pilot -- --apply --limit=10
```

Use `--force` only to replace ready files for the exact signed configuration.
The script authenticates from `GOOGLE_TTS_API_KEY`,
`GOOGLE_TTS_ACCESS_TOKEN`, or the active `gcloud` session. It does not load
`.env` or print credentials.

## Review artifacts

An applied run writes:

- `index.html`: offline four-way listening table with one selection per word
  and a local JSON export button.
- `manifest.json`: exact input, locale, voice, signature, duration, byte size
  and SHA-256 for every ready WAV.
- one content-signed WAV per word and voice variant.

Listen with headphones and compare consonant boundaries, word stress, accent
consistency, clarity for children and naturalness. Pilot output remains review
evidence and must never be copied directly into production asset directories.

## Production rollout gate

Production English assets live at:

```text
src/assets/lessons/<lesson>/<scene>/audio/en-US/neural2-c-r1/
src/assets/lessons/<lesson>/<scene>/audio/en-GB/neural2-c-r1/
src/assets/shared/audio/en-US/neural2-c-r1/
src/assets/shared/audio/en-GB/neural2-c-r1/
```

Keep the existing `audio/en/` corpus as the legacy en-US fallback and rollback
source. The generated `src/data/englishAudioGenerationManifest.json` records
the exact production release, voices, synthesis configuration, target keys,
byte sizes and SHA-256 values.

Every current en-US, en-GB and Vietnamese target must exist and pass validation
before publication. Both generated files use atomic replacement; provenance is
written first and the runtime manifest last as the publication commit point. A
24-word pilot or any other partial generation cannot open the production gate.

After the gate passes, upload the immutable accent/release keys and verify them
in place. Do not clear the shared R2 `v1` prefix during this rollout; it also
contains production images, Vietnamese audio and the legacy English rollback
corpus. Any later synthesis change must use a new release path rather than
overwriting `neural2-c-r1`.
