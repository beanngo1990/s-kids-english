import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const endpoint = 'https://texttospeech.googleapis.com/v1/text:synthesize';
const pilotVersion = 1;
const concurrency = 4;
const audioConfig = {
  audioEncoding: 'LINEAR16',
  sampleRateHertz: 24000,
  speakingRate: 0.9,
};

const pilotWords = [
  { text: 'water', focus: 'Khác biệt nguyên âm và âm /t/ giữa US/UK.' },
  { text: 'bottle', focus: 'Flap/glottal /t/ và cách đọc âm tiết cuối.' },
  { text: 'banana', focus: 'Khác biệt nguyên âm nhấn giữa US/UK.' },
  { text: 'basket', focus: 'BATH split tạo khác biệt nguyên âm rõ.' },
  { text: 'clock', focus: 'LOT vowel khác nhau giữa Anh–Mỹ và Anh–Anh.' },
  { text: 'car', focus: 'Mẫu rhotic/non-rhotic đơn giản.' },
  { text: 'yogurt', focus: 'Khác biệt nguyên âm và âm /r/.' },
  { text: 'mirror', focus: 'Rhoticity và số âm tiết nghe được.' },
  { text: 'towel', focus: 'Nguyên âm đôi và cách tách âm tiết.' },
  { text: 'shower', focus: 'Âm /ʃ/ đầu, nguyên âm đôi và âm /r/ cuối.' },
  { text: 'pajamas', focus: 'Biến thể nguyên âm và chính tả thiên Mỹ.' },
  { text: 'crayon', focus: 'Có biến thể cách đọc một hoặc hai âm tiết.' },
  { text: 'moon mobile', focus: '“Mobile” khác rõ theo accent/ngữ nghĩa.' },
  { text: 'toothbrush', focus: 'Âm /θ/, cụm /br/ và âm /ʃ/ cuối.' },
  { text: 'socks', focus: 'Âm /s/ đầu và cụm /ks/ cuối dễ bị cắt.' },
  { text: 'shoes', focus: 'Âm /ʃ/ đầu và /z/ cuối dễ bị cắt.' },
  { text: 'cloth', focus: 'Âm /θ/ cuối và nguyên âm khác theo accent.' },
  { text: 'vegetables', focus: 'Từ dài, thường có hiện tượng nuốt âm.' },
  { text: 'good morning', focus: 'Nhịp câu, nguyên âm và rhoticity.' },
  { text: 'draw a circle', focus: 'Weak form “a” và nhiều âm /r/.' },
  { text: 'drink water', focus: 'Nối âm và cách đọc “water” trong câu.' },
  { text: 'say thank you', focus: 'Âm /θ/ và ngữ điệu cụm từ.' },
  {
    text: 'throw away wrapper',
    focus: 'Cụm /θr/, âm câm, nối âm và rhoticity.',
  },
  {
    text: 'check temperature',
    focus: 'Từ nhiều âm tiết thường bị rút gọn không tự nhiên.',
  },
];

const variants = [
  {
    accent: 'en-US',
    id: 'en-US-chirp3-aoede',
    label: 'Anh–Mỹ · Chirp 3 Aoede',
    languageCode: 'en-US',
    voice: 'en-US-Chirp3-HD-Aoede',
  },
  {
    accent: 'en-GB',
    id: 'en-GB-chirp3-aoede',
    label: 'Anh–Anh · Chirp 3 Aoede',
    languageCode: 'en-GB',
    voice: 'en-GB-Chirp3-HD-Aoede',
  },
  {
    accent: 'en-US',
    id: 'en-US-neural2-c',
    label: 'Anh–Mỹ · Neural2 C',
    languageCode: 'en-US',
    voice: 'en-US-Neural2-C',
  },
  {
    accent: 'en-GB',
    id: 'en-GB-neural2-c',
    label: 'Anh–Anh · Neural2 C',
    languageCode: 'en-GB',
    voice: 'en-GB-Neural2-C',
  },
];

const configHash = createHash('sha256')
  .update(
    JSON.stringify({
      audioConfig,
      pilotVersion,
      trimApplied: false,
      variants: variants.map(({ id, languageCode, voice }) => ({
        id,
        languageCode,
        voice,
      })),
      words: pilotWords.map(word => word.text),
    }),
  )
  .digest('hex')
  .slice(0, 12);
const outputRoot = join(repoRoot, 'build/audio-accent-pilot', configHash);

const args = parseArgs(process.argv.slice(2));
validatePilotConfiguration();

const allTargets = pilotWords.flatMap(word =>
  variants.map(variant => createTarget(word, variant)),
);

if (args.verify) {
  verifyPilotArtifacts(allTargets);
  process.exit(0);
}

const selectedTargets = allTargets.filter(target => {
  const matchesWord =
    !args.word ||
    normalizeText(target.text) === normalizeText(args.word) ||
    slug(target.text) === slug(args.word);
  const matchesVariant = !args.variant || target.variant.id === args.variant;
  return matchesWord && matchesVariant;
});

if (selectedTargets.length === 0) {
  throw new Error('No pilot targets matched the supplied filters.');
}

const pendingTargets = selectedTargets.filter(
  target => args.force || !isReadyTarget(target),
);
const limitedTargets =
  args.limit === undefined
    ? pendingTargets
    : pendingTargets.slice(0, args.limit);

printSummary(selectedTargets, pendingTargets, limitedTargets);

if (!args.apply) {
  printPlannedTargets(limitedTargets);
  console.log(
    '\nDry run only. Add --apply to call Google TTS and write WAV files.',
  );
  process.exit(0);
}

const failures = [];
if (limitedTargets.length > 0) {
  const auth = getGoogleAuth();
  let completed = 0;

  await runWithConcurrency(limitedTargets, concurrency, async target => {
    try {
      await synthesizeTarget(target, auth);
      completed += 1;
      console.log(
        `wrote ${formatRepoPath(target.outputPath)} (${completed}/${
          limitedTargets.length
        })`,
      );
    } catch (error) {
      failures.push({
        error: error instanceof Error ? error.message : String(error),
        target,
      });
    }
  });
}

writePilotArtifacts(allTargets);

if (args.limit !== undefined && pendingTargets.length > args.limit) {
  console.log(
    `Skipped ${pendingTargets.length - args.limit} target(s) because --limit=${
      args.limit
    }.`,
  );
}

if (failures.length > 0) {
  console.error(`Failed targets: ${failures.length}`);
  for (const failure of failures) {
    console.error(
      `ERROR [${failure.target.variant.id}] ${failure.target.text}: ${failure.error}`,
    );
  }
  process.exitCode = 1;
}

function parseArgs(rawArgs) {
  const options = {
    apply: false,
    dryRun: false,
    force: false,
    limit: undefined,
    variant: undefined,
    verify: false,
    word: undefined,
  };

  for (const arg of rawArgs) {
    if (arg === '--apply') {
      options.apply = true;
      continue;
    }
    if (arg === '--dry-run' || arg === '-n') {
      options.dryRun = true;
      continue;
    }
    if (arg === '--force') {
      options.force = true;
      continue;
    }
    if (arg === '--verify') {
      options.verify = true;
      continue;
    }
    if (arg.startsWith('--limit=')) {
      const limit = Number(arg.slice('--limit='.length));
      if (!Number.isInteger(limit) || limit < 0) {
        throw new Error('--limit must be a non-negative integer.');
      }
      options.limit = limit;
      continue;
    }
    if (arg.startsWith('--variant=')) {
      options.variant = arg.slice('--variant='.length);
      continue;
    }
    if (arg.startsWith('--word=')) {
      options.word = arg.slice('--word='.length);
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (
    [options.apply, options.dryRun, options.verify].filter(Boolean).length > 1
  ) {
    throw new Error('Use only one of --apply, --dry-run, or --verify.');
  }
  if (
    options.verify &&
    (options.force ||
      options.limit !== undefined ||
      options.variant ||
      options.word)
  ) {
    throw new Error('--verify does not accept generation filters.');
  }

  return options;
}

function printHelp() {
  console.log(
    `
Generate a local US/UK English TTS audition pack.

Usage:
  npm run generate:audio:accent-pilot
  npm run generate:audio:accent-pilot -- --apply
  npm run generate:audio:accent-pilot -- --apply --variant=en-GB-chirp3-aoede
  npm run generate:audio:accent-pilot -- --apply --word=water

Options:
  --apply          Call Google TTS and write build/audio-accent-pilot.
  --dry-run, -n    Preview only; this is also the default behavior.
  --force          Regenerate matching files even when the signed path exists.
  --limit=<n>      Generate at most n matching targets.
  --variant=<id>   Limit to one voice variant.
  --verify         Validate all WAVs, hashes, manifest and review HTML.
  --word=<text>    Limit to one pilot word or phrase.
  --help, -h       Show this help.
`.trim(),
  );
}

function validatePilotConfiguration() {
  if (pilotWords.length < 20 || pilotWords.length > 30) {
    throw new Error('The accent pilot must contain between 20 and 30 words.');
  }

  const normalizedWords = pilotWords.map(word => normalizeText(word.text));
  if (new Set(normalizedWords).size !== normalizedWords.length) {
    throw new Error('The accent pilot contains duplicate vocabulary text.');
  }

  const variantIds = variants.map(variant => variant.id);
  if (new Set(variantIds).size !== variantIds.length) {
    throw new Error('The accent pilot contains duplicate variant ids.');
  }

  for (const variant of variants) {
    if (!variant.voice.startsWith(`${variant.languageCode}-`)) {
      throw new Error(
        `Voice ${variant.voice} does not match locale ${variant.languageCode}.`,
      );
    }
  }

  const vocabularySource = readFileSync(
    join(repoRoot, 'src/data/vocabulary.ts'),
    'utf8',
  );
  const catalogWords = new Set(
    Array.from(vocabularySource.matchAll(/\bword:\s*'([^']+)'/gu), match =>
      normalizeText(match[1]),
    ),
  );
  const missingWords = pilotWords.filter(
    word => !catalogWords.has(normalizeText(word.text)),
  );

  if (missingWords.length > 0) {
    throw new Error(
      `Pilot words missing from src/data/vocabulary.ts: ${missingWords
        .map(word => word.text)
        .join(', ')}`,
    );
  }
}

function createTarget(word, variant) {
  const signature = createHash('sha256')
    .update(
      JSON.stringify({
        audioConfig,
        input: { text: word.text },
        pilotVersion,
        trim: false,
        voice: {
          languageCode: variant.languageCode,
          name: variant.voice,
        },
      }),
    )
    .digest('hex')
    .slice(0, 12);
  const relativePath = `${variant.id}/${slug(word.text)}_${signature}.wav`;

  return {
    focus: word.focus,
    outputPath: join(outputRoot, relativePath),
    relativePath,
    signature,
    text: word.text,
    variant,
  };
}

function getGoogleAuth() {
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (apiKey) {
    return {
      endpoint: `${endpoint}?key=${encodeURIComponent(apiKey)}`,
      headers: {},
    };
  }

  const accessToken =
    process.env.GOOGLE_TTS_ACCESS_TOKEN ?? getGcloudAccessToken();
  const headers = { Authorization: `Bearer ${accessToken}` };
  const project = getGoogleCloudProject();
  if (project) {
    headers['x-goog-user-project'] = project;
  }

  return { endpoint, headers };
}

function getGcloudAccessToken() {
  const gcloudArgs = ['auth', 'print-access-token'];
  if (process.env.GOOGLE_TTS_ACCOUNT) {
    gcloudArgs.push(`--account=${process.env.GOOGLE_TTS_ACCOUNT}`);
  }

  try {
    return execFileSync('gcloud', gcloudArgs, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch (error) {
    throw new Error(
      [
        'Unable to get a Google access token.',
        'Set GOOGLE_TTS_API_KEY, GOOGLE_TTS_ACCESS_TOKEN, or sign in with gcloud.',
        error instanceof Error ? error.message : String(error),
      ].join('\n'),
    );
  }
}

function getGoogleCloudProject() {
  const configuredProject =
    process.env.GOOGLE_CLOUD_PROJECT ?? process.env.GCLOUD_PROJECT;
  if (configuredProject) {
    return configuredProject;
  }

  try {
    const project = execFileSync('gcloud', ['config', 'get-value', 'project'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return project && project !== '(unset)' ? project : undefined;
  } catch {
    return undefined;
  }
}

async function synthesizeTarget(target, auth) {
  const response = await fetch(auth.endpoint, {
    body: JSON.stringify({
      audioConfig,
      input: { text: target.text },
      voice: {
        languageCode: target.variant.languageCode,
        name: target.variant.voice,
      },
    }),
    headers: {
      ...auth.headers,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(
      `${response.status} ${response.statusText}: ${await response.text()}`,
    );
  }

  const responseBody = await response.json();
  const audioBuffer = Buffer.from(responseBody.audioContent, 'base64');
  validateWav(audioBuffer, target);
  mkdirSync(dirname(target.outputPath), { recursive: true });
  const partialPath = `${target.outputPath}.part`;
  writeFileSync(partialPath, audioBuffer);
  renameSync(partialPath, target.outputPath);
}

function validateWav(audioBuffer, target) {
  const metadata = parseWav(audioBuffer);
  if (!metadata) {
    throw new Error(
      `Google TTS returned invalid WAV data for “${target.text}”.`,
    );
  }
  if (
    metadata.audioFormat !== 1 ||
    metadata.bitsPerSample !== 16 ||
    metadata.channels !== 1 ||
    metadata.sampleRate !== audioConfig.sampleRateHertz
  ) {
    throw new Error(
      `Unexpected WAV format for “${target.text}”: ` +
        `${metadata.audioFormat}/${metadata.channels}/${metadata.sampleRate}/` +
        `${metadata.bitsPerSample}.`,
    );
  }
}

function isReadyTarget(target) {
  if (!existsSync(target.outputPath)) {
    return false;
  }

  const metadata = parseWav(readFileSync(target.outputPath));
  return Boolean(
    metadata &&
      metadata.audioFormat === 1 &&
      metadata.bitsPerSample === 16 &&
      metadata.channels === 1 &&
      metadata.sampleRate === audioConfig.sampleRateHertz,
  );
}

function writePilotArtifacts(targets) {
  mkdirSync(outputRoot, { recursive: true });
  const entries = targets.map(describeTarget);
  const generatedCount = entries.filter(
    entry => entry.status === 'ready',
  ).length;
  const manifest = {
    audioConfig,
    configHash,
    entries,
    generatedAt: new Date().toISOString(),
    outputPolicy: {
      contentSignedPaths: true,
      productionRuntimeAsset: false,
      trimApplied: false,
      uploadedToR2: false,
    },
    pilotVersion,
    summary: {
      generatedCount,
      totalTargets: entries.length,
      variants: variants.length,
      words: pilotWords.length,
    },
    variants,
    words: pilotWords,
  };

  writeFileSync(
    join(outputRoot, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  writeFileSync(join(outputRoot, 'index.html'), renderAuditionPage(entries));
  console.log(`wrote ${formatRepoPath(join(outputRoot, 'manifest.json'))}`);
  console.log(`wrote ${formatRepoPath(join(outputRoot, 'index.html'))}`);
}

function describeTarget(target) {
  if (!existsSync(target.outputPath)) {
    return {
      accent: target.variant.accent,
      focus: target.focus,
      languageCode: target.variant.languageCode,
      relativePath: target.relativePath,
      signature: target.signature,
      status: 'missing',
      text: target.text,
      variantId: target.variant.id,
      voice: target.variant.voice,
    };
  }

  const audioBuffer = readFileSync(target.outputPath);
  const metadata = parseWav(audioBuffer);
  return {
    accent: target.variant.accent,
    bytes: audioBuffer.length,
    durationSeconds: metadata
      ? Number((metadata.frameCount / metadata.sampleRate).toFixed(3))
      : undefined,
    focus: target.focus,
    languageCode: target.variant.languageCode,
    relativePath: target.relativePath,
    sha256: createHash('sha256').update(audioBuffer).digest('hex'),
    signature: target.signature,
    status: isReadyTarget(target) ? 'ready' : 'invalid',
    text: target.text,
    variantId: target.variant.id,
    voice: target.variant.voice,
  };
}

function verifyPilotArtifacts(targets) {
  const errors = [];
  const manifestPath = join(outputRoot, 'manifest.json');
  const htmlPath = join(outputRoot, 'index.html');

  if (!existsSync(manifestPath)) errors.push('Missing manifest.json.');
  if (!existsSync(htmlPath)) errors.push('Missing index.html.');
  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }

  const manifestSource = readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestSource);
  if (manifest.configHash !== configHash) {
    errors.push(
      `Manifest config hash is ${manifest.configHash}; expected ${configHash}.`,
    );
  }
  if (manifestSource.includes(repoRoot)) {
    errors.push('Manifest contains a machine-specific absolute path.');
  }
  if (manifest.entries?.length !== targets.length) {
    errors.push(
      `Manifest has ${manifest.entries?.length ?? 0} entries; expected ${
        targets.length
      }.`,
    );
  }

  const manifestEntries = new Map(
    (manifest.entries ?? []).map(entry => [
      `${normalizeText(entry.text)}:${entry.variantId}`,
      entry,
    ]),
  );
  const uniquePaths = new Set();

  for (const target of targets) {
    const entryKey = `${normalizeText(target.text)}:${target.variant.id}`;
    const entry = manifestEntries.get(entryKey);
    if (!entry) {
      errors.push(`Missing manifest entry for ${entryKey}.`);
      continue;
    }
    if (uniquePaths.has(entry.relativePath)) {
      errors.push(`Duplicate manifest path: ${entry.relativePath}.`);
    }
    uniquePaths.add(entry.relativePath);

    if (!isReadyTarget(target)) {
      errors.push(`Missing or invalid WAV: ${target.relativePath}.`);
      continue;
    }
    if (existsSync(`${target.outputPath}.part`)) {
      errors.push(`Stale partial WAV: ${target.relativePath}.part.`);
    }

    const audioBuffer = readFileSync(target.outputPath);
    const actualSha = createHash('sha256').update(audioBuffer).digest('hex');
    if (entry.bytes !== audioBuffer.length) {
      errors.push(`Byte-size mismatch: ${target.relativePath}.`);
    }
    if (entry.sha256 !== actualSha) {
      errors.push(`SHA-256 mismatch: ${target.relativePath}.`);
    }
    if (entry.languageCode !== target.variant.languageCode) {
      errors.push(`Locale mismatch: ${target.relativePath}.`);
    }
    if (entry.voice !== target.variant.voice) {
      errors.push(`Voice mismatch: ${target.relativePath}.`);
    }
    if (!(entry.durationSeconds > 0)) {
      errors.push(`Invalid duration: ${target.relativePath}.`);
    }
  }

  const htmlSource = readFileSync(htmlPath, 'utf8');
  const audioControls = htmlSource.match(/<audio\b/gu)?.length ?? 0;
  const radioControls =
    htmlSource.match(/<input\b[^>]*\btype="radio"/gu)?.length ?? 0;
  if (audioControls !== targets.length) {
    errors.push(`Review HTML has ${audioControls} audio controls.`);
  }
  if (radioControls !== targets.length) {
    errors.push(`Review HTML has ${radioControls} radio controls.`);
  }
  for (const target of targets) {
    if (!htmlSource.includes(`src="${escapeHtml(target.relativePath)}"`)) {
      errors.push(`Review HTML is missing ${target.relativePath}.`);
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Accent pilot verification failed (${errors.length}):\n${errors.join(
        '\n',
      )}`,
    );
  }

  console.log(`Verified config   : ${configHash}`);
  console.log(`Verified words    : ${pilotWords.length}`);
  console.log(`Verified variants : ${variants.length}`);
  console.log(`Verified WAVs     : ${targets.length}`);
  console.log(`Review page       : ${formatRepoPath(htmlPath)}`);
}

function renderAuditionPage(entries) {
  const rows = pilotWords
    .map((word, wordIndex) => {
      const cells = variants
        .map(variant => {
          const entry = entries.find(
            candidate =>
              candidate.text === word.text &&
              candidate.variantId === variant.id,
          );
          const player =
            entry?.status === 'ready'
              ? `<audio controls preload="none" src="${escapeHtml(
                  entry.relativePath,
                )}"></audio>`
              : '<span class="missing">Chưa tạo</span>';
          return `<td>
            ${player}
            <label class="pick">
              <input type="radio" name="choice-${wordIndex}" value="${escapeHtml(
            variant.id,
          )}" data-word="${escapeHtml(word.text)}" />
              Chọn mẫu này
            </label>
          </td>`;
        })
        .join('\n');

      return `<tr>
        <th scope="row">
          <span class="word">${escapeHtml(word.text)}</span>
          <span class="focus">${escapeHtml(word.focus)}</span>
        </th>
        ${cells}
      </tr>`;
    })
    .join('\n');
  const headers = variants
    .map(
      variant =>
        `<th scope="col">${escapeHtml(variant.label)}<small>${escapeHtml(
          variant.voice,
        )}</small></th>`,
    )
    .join('\n');

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SKidsEnglish · Accent audio pilot</title>
  <style>
    :root { color-scheme: light dark; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    body { margin: 0; padding: 24px; background: #f5f7fb; color: #162033; }
    main { max-width: 1500px; margin: 0 auto; }
    h1 { margin-bottom: 8px; }
    .intro { max-width: 900px; color: #4b5870; line-height: 1.55; }
    .actions { display: flex; gap: 12px; margin: 20px 0; }
    button { border: 0; border-radius: 10px; padding: 10px 16px; background: #2357d9; color: white; font-weight: 700; cursor: pointer; }
    .table-wrap { overflow-x: auto; border: 1px solid #d8deea; border-radius: 14px; background: white; }
    table { width: 100%; border-collapse: collapse; min-width: 1180px; }
    th, td { border-bottom: 1px solid #e4e8f0; border-right: 1px solid #e4e8f0; padding: 14px; vertical-align: top; }
    thead th { position: sticky; top: 0; background: #eef3ff; z-index: 1; }
    tbody th { width: 220px; text-align: left; background: #fafbfe; }
    th small, .focus { display: block; margin-top: 6px; color: #63708a; font-size: 12px; font-weight: 400; }
    .word { font-size: 19px; }
    audio { width: 230px; max-width: 100%; }
    .pick { display: block; margin-top: 10px; font-size: 13px; }
    .missing { display: inline-block; padding: 8px 10px; border-radius: 8px; background: #fff1d6; color: #7a4d00; }
    @media (prefers-color-scheme: dark) {
      body { background: #101522; color: #eef3ff; }
      .intro, th small, .focus { color: #aeb9ce; }
      .table-wrap, thead th, tbody th { background: #171e2d; }
      th, td, .table-wrap { border-color: #303a4e; }
      .missing { background: #493515; color: #ffe0a3; }
    }
  </style>
</head>
<body>
  <main>
    <h1>Accent audio pilot</h1>
    <p class="intro">
      24 từ × 4 giọng, cùng tốc độ 0.9 và không trim silence. Hãy nghe bằng tai nghe,
      ưu tiên độ rõ phụ âm đầu/cuối, trọng âm và mức phù hợp với trẻ em. Lựa chọn được
      lưu trong trình duyệt; nút xuất sẽ tải một JSON review cục bộ.
    </p>
    <div class="actions">
      <button id="export" type="button">Xuất đánh giá</button>
      <button id="clear" type="button">Xóa lựa chọn</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th scope="col">Từ / điểm cần nghe</th>${headers}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </main>
  <script>
    const storageKey = 'skidsenglish-accent-pilot-v1';
    const choices = JSON.parse(localStorage.getItem(storageKey) || '{}');
    document.querySelectorAll('input[type="radio"]').forEach(input => {
      if (choices[input.dataset.word] === input.value) input.checked = true;
      input.addEventListener('change', () => {
        choices[input.dataset.word] = input.value;
        localStorage.setItem(storageKey, JSON.stringify(choices));
      });
    });
    document.getElementById('export').addEventListener('click', () => {
      const payload = JSON.stringify({ exportedAt: new Date().toISOString(), choices }, null, 2);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
      link.download = 'audio-accent-pilot-review.json';
      link.click();
      URL.revokeObjectURL(link.href);
    });
    document.getElementById('clear').addEventListener('click', () => {
      Object.keys(choices).forEach(key => delete choices[key]);
      localStorage.removeItem(storageKey);
      document.querySelectorAll('input[type="radio"]').forEach(input => { input.checked = false; });
    });
  </script>
</body>
</html>
`;
}

function parseWav(input) {
  if (
    !Buffer.isBuffer(input) ||
    input.length < 44 ||
    input.toString('ascii', 0, 4) !== 'RIFF' ||
    input.toString('ascii', 8, 12) !== 'WAVE'
  ) {
    return null;
  }

  let offset = 12;
  let format;
  let dataSize;
  while (offset + 8 <= input.length) {
    const chunkId = input.toString('ascii', offset, offset + 4);
    const chunkSize = input.readUInt32LE(offset + 4);
    const chunkDataOffset = offset + 8;
    if (chunkDataOffset + chunkSize > input.length) {
      return null;
    }
    if (chunkId === 'fmt ' && chunkSize >= 16) {
      format = {
        audioFormat: input.readUInt16LE(chunkDataOffset),
        bitsPerSample: input.readUInt16LE(chunkDataOffset + 14),
        channels: input.readUInt16LE(chunkDataOffset + 2),
        sampleRate: input.readUInt32LE(chunkDataOffset + 4),
      };
    } else if (chunkId === 'data') {
      dataSize = chunkSize;
    }
    offset = chunkDataOffset + chunkSize + (chunkSize % 2);
  }

  if (!format || dataSize === undefined) {
    return null;
  }
  const bytesPerFrame = format.channels * (format.bitsPerSample / 8);
  return {
    ...format,
    frameCount: bytesPerFrame > 0 ? dataSize / bytesPerFrame : 0,
  };
}

async function runWithConcurrency(items, maxConcurrency, worker) {
  let nextIndex = 0;
  await Promise.all(
    Array.from({ length: Math.min(maxConcurrency, items.length) }, async () => {
      while (nextIndex < items.length) {
        const item = items[nextIndex];
        nextIndex += 1;
        await worker(item);
      }
    }),
  );
}

function printSummary(selected, pending, limited) {
  console.log(`Pilot words     : ${pilotWords.length}`);
  console.log(`Voice variants  : ${variants.length}`);
  console.log(`Config hash     : ${configHash}`);
  console.log(`Selected targets: ${selected.length}`);
  console.log(`Pending targets : ${pending.length}`);
  console.log(`This run        : ${limited.length}`);
  console.log(`Output           : ${formatRepoPath(outputRoot)}`);
  if (args.word) console.log(`Word filter      : ${args.word}`);
  if (args.variant) console.log(`Variant filter   : ${args.variant}`);
}

function printPlannedTargets(targets) {
  if (targets.length === 0) {
    return;
  }
  console.log('');
  for (const target of targets) {
    console.log(
      `[${target.variant.id}] ${target.text} -> ${formatRepoPath(
        target.outputPath,
      )}`,
    );
  }
}

function normalizeText(text) {
  return text.trim().toLowerCase();
}

function slug(text) {
  return normalizeText(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .replace(/[^a-z0-9]+/gu, '_')
    .replace(/^_+|_+$/gu, '');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatRepoPath(filePath) {
  return filePath.replace(`${repoRoot}/`, '');
}
