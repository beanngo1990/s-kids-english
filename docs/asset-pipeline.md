# Image and R2 Asset Pipeline

## Source of truth

- Put final, lossless lesson PNGs in
  `src/assets/source/master/lessons/<lesson>/<scene>/images/`.
- Keep raw/chroma generation inputs in `src/assets/source/lessons/`.
- Treat `src/assets/lessons/**/images/*.webp` as generated output.
- Keep bundled UI icons and mascot images outside this lesson pipeline.
- Bundled app UI PNG icons live in `src/assets/icons/app-ui/`; they are imported
  with local `require(...)` calls and are not uploaded to R2.

## Normal workflow

```bash
npm run assets:audit
npm run assets:build
npm run assets:verify
npm run check:images
npm run upload:r2:dry-run
npm run upload:r2
npm run r2:verify
```

`npm run upload:r2:dry-run` is the preview command. `npm run upload:r2` already
passes `--apply` and mutates the bucket; run it only after explicit approval and
after reviewing the dry-run output.

The R2 dry-run does not write to the bucket, but it still loads `.env`, requires
R2 credentials and network access, and reads the remote manifest. Run it only
when that access is in scope; otherwise report it as not run and keep the local
asset checks separate.

All image scripts accept `--lesson=<lesson-id>`. `assets:build` also accepts
`--force`; otherwise it skips outputs whose source hash, profile, and config
signature are unchanged.

The generated `src/assets/asset-manifest.json` records source and output hashes,
dimensions, selected profile, alpha information, and the global image revision.
`src/config/generatedAssetRelease.ts` exposes that revision to React Native.

## R2 reset during local testing

Preview the current `v1` prefix:

```bash
npm run r2:clear -- --prefix=v1/
```

The command prints the exact confirmation required for destructive execution.
Do not construct or reuse that confirmation without explicit approval.
To clear the entire bucket, both `--all` and `--confirm-bucket=<bucket>` are
required. After a clear, upload and verify before launching a build configured
to prefer remote images.

Purging Cloudflare cache does not clear the image cache already stored on a
device. The manifest revision query parameter changes whenever generated image
content changes, while keeping the R2 prefix at `v1`.
