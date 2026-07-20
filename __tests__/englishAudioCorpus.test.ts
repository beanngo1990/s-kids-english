import {
  getViAudioAsset,
  getWordAudioAsset,
} from '../src/data/audioManifest';
import { kidLockAudioPrompts } from '../src/data/kidLockAudioPrompts';
import { generatedUiAudioRegistry } from '../src/engine/GeneratedUiAudioRegistry';
import { ENGLISH_ACCENTS, type EnglishAccent } from '../src/types/audio';

declare const __dirname: string;

type Hash = {
  digest: (encoding: 'hex') => string;
  update: (content: Uint8Array) => Hash;
};

type FileSystem = {
  readFileSync(path: string): Uint8Array;
  readFileSync(path: string, encoding: 'utf8'): string;
};

const { createHash } = jest.requireActual<{
  createHash: (algorithm: string) => Hash;
}>('crypto');
const { readFileSync } = jest.requireActual<FileSystem>('fs');
const { join } = jest.requireActual<{
  join: (...paths: string[]) => string;
}>('path');

type GenerationTarget = {
  accent: EnglishAccent;
  bytes: number;
  key: string;
  sha256: string;
  text: string;
  voice: string;
};

type GenerationManifest = {
  config: {
    audioEncoding: string;
    channels: number;
    sampleRateHertz: number;
    speakingRate: number;
    trimSilence: boolean;
  };
  release: string;
  schemaVersion: number;
  targets: GenerationTarget[];
  voices: Record<EnglishAccent, { languageCode: string; name: string }>;
};

const repoRoot = join(__dirname, '..');
const manifest = JSON.parse(
  readFileSync(
    join(repoRoot, 'src/data/englishAudioGenerationManifest.json'),
    'utf8',
  ),
) as GenerationManifest;

test('English Neural2-C corpus is complete and matches its provenance', () => {
  expect(manifest).toMatchObject({
    config: {
      audioEncoding: 'LINEAR16',
      channels: 1,
      sampleRateHertz: 24000,
      speakingRate: 0.9,
      trimSilence: false,
    },
    release: 'neural2-c-r1',
    schemaVersion: 1,
    voices: {
      'en-GB': {
        languageCode: 'en-GB',
        name: 'en-GB-Neural2-C',
      },
      'en-US': {
        languageCode: 'en-US',
        name: 'en-US-Neural2-C',
      },
    },
  });

  const counts = new Map<EnglishAccent, number>(
    ENGLISH_ACCENTS.map(accent => [accent, 0]),
  );
  const uniqueKeys = new Set<string>();

  for (const target of manifest.targets) {
    expect(uniqueKeys.has(target.key)).toBe(false);
    uniqueKeys.add(target.key);
    counts.set(target.accent, (counts.get(target.accent) ?? 0) + 1);

    expect(target.key).toContain(
      `/audio/${target.accent}/${manifest.release}/`,
    );
    expect(target.voice).toBe(`${target.accent}-Neural2-C`);
    expect(getWordAudioAsset(target.text, target.accent)?.key).toBe(target.key);

    const content = readFileSync(join(repoRoot, 'src/assets', target.key));
    expect(content.length).toBe(target.bytes);
    expect(createHash('sha256').update(content).digest('hex')).toBe(
      target.sha256,
    );
  }

  expect(manifest.targets).toHaveLength(2250);
  expect(Object.fromEntries(counts)).toEqual({ 'en-GB': 1125, 'en-US': 1125 });
  expect(uniqueKeys.size).toBe(manifest.targets.length);
});

test('kid-facing map lock prompts have bundled production audio', () => {
  for (const prompt of Object.values(kidLockAudioPrompts)) {
    const viAsset = getViAudioAsset(prompt.vi);
    expect(viAsset?.key).toMatch(/^ui\/audio\/vi\//u);
    expect(generatedUiAudioRegistry[viAsset?.key ?? '']).toBeDefined();
    expect(
      readFileSync(join(repoRoot, 'src/assets', viAsset?.key ?? '')).length,
    ).toBeGreaterThan(44);

    for (const accent of ENGLISH_ACCENTS) {
      const enAsset = getWordAudioAsset(prompt.en, accent);
      expect(enAsset?.key).toContain(`ui/audio/${accent}/`);
      expect(generatedUiAudioRegistry[enAsset?.key ?? '']).toBeDefined();
      expect(
        readFileSync(join(repoRoot, 'src/assets', enAsset?.key ?? '')).length,
      ).toBeGreaterThan(44);
    }
  }
});
