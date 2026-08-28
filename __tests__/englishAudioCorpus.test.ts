import {
  getViAudioAsset,
  getWordAudioAsset,
} from '../src/data/audioManifest';
import { kidLockAudioPrompts } from '../src/data/kidLockAudioPrompts';
import {
  sceneVocabularyMeaningDisabledPromptVi,
  sceneVocabularyMeaningEnabledPromptVi,
} from '../src/data/speechPrompts';
import { generatedUiAudioRegistry } from '../src/engine/GeneratedUiAudioRegistry';
import { en } from '../src/i18n/dictionaries/en';
import { vi, type TranslationKey } from '../src/i18n/dictionaries/vi';
import { ENGLISH_ACCENTS, type EnglishAccent } from '../src/types/audio';

declare const __dirname: string;

type FileSystem = {
  existsSync(path: string): boolean;
  readFileSync(path: string): Uint8Array;
  readFileSync(path: string, encoding: 'utf8'): string;
};

const { existsSync, readFileSync } = jest.requireActual<FileSystem>('fs');
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
const bundledSungyUiPromptKeys = [
  'onboarding.coach.greeting',
  'home.coach.default',
  'home.coach.complete',
  'home.coach.completeTapOne',
  'home.coach.completeTapTwo',
  'home.coach.completeTapThree',
  'home.coach.reviewTapOne',
  'home.coach.reviewTapTwo',
  'home.coach.reviewTapThree',
  'home.coach.guideTapOne',
  'home.coach.guideTapTwo',
  'home.coach.guideTapThree',
] as const satisfies readonly TranslationKey[];

// `generate:audio:dry-run` owns current-corpus completeness. This test protects
// the integrity and cross-accent parity of the published provenance snapshot.
test('English Neural2-C provenance is internally consistent across accents', () => {
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
  const textsByAccent = new Map<EnglishAccent, Set<string>>(
    ENGLISH_ACCENTS.map(accent => [accent, new Set<string>()]),
  );
  const uniqueKeys = new Set<string>();

  for (const target of manifest.targets) {
    expect(ENGLISH_ACCENTS).toContain(target.accent);
    expect(uniqueKeys.has(target.key)).toBe(false);
    uniqueKeys.add(target.key);
    counts.set(target.accent, (counts.get(target.accent) ?? 0) + 1);
    textsByAccent.get(target.accent)?.add(target.text);

    expect(target.key).toContain(
      `/audio/${target.accent}/${manifest.release}/`,
    );
    expect(target.voice).toBe(`${target.accent}-Neural2-C`);
    expect(target.bytes).toBeGreaterThan(0);
    expect(target.sha256).toMatch(/^[0-9a-f]{64}$/u);
    expect(target.text.trim()).toBe(target.text);
    expect(target.text.length).toBeGreaterThan(0);
    expect(getWordAudioAsset(target.text, target.accent)?.key).toBe(target.key);

    const assetPath = join(repoRoot, 'src/assets', target.key);
    if (existsSync(assetPath)) {
      const content = readFileSync(assetPath);
      expect(content.length).toBe(target.bytes);
    }
  }

  const usTexts = textsByAccent.get('en-US') ?? new Set<string>();
  const gbTexts = textsByAccent.get('en-GB') ?? new Set<string>();

  expect(counts.get('en-US')).toBeGreaterThan(0);
  expect(counts.get('en-GB')).toBe(counts.get('en-US'));
  expect(usTexts.size).toBe(counts.get('en-US'));
  expect(gbTexts.size).toBe(counts.get('en-GB'));
  expect([...gbTexts].sort()).toEqual([...usTexts].sort());
  expect(manifest.targets).toHaveLength(
    (counts.get('en-US') ?? 0) + (counts.get('en-GB') ?? 0),
  );
  expect(uniqueKeys.size).toBe(manifest.targets.length);
});

test('recording try-next prompt has generated shared audio', () => {
  const viAsset = getViAudioAsset('Không sao, từ sau mình thử đọc cùng cô nhé.');
  expect(viAsset?.key).toBe(
    'shared/audio/vi/recording_try_next_word_cc8c9ffc.mp3',
  );
  const viPath = join(repoRoot, 'src/assets', viAsset?.key ?? '');
  if (existsSync(viPath)) {
    expect(readFileSync(viPath).length).toBeGreaterThan(0);
  }

  for (const accent of ENGLISH_ACCENTS) {
    const enAsset = getWordAudioAsset(
      "That's okay. Try saying the next word with me.",
      accent,
    );
    expect(enAsset?.key).toBe(
      `shared/audio/${accent}/neural2-c-r1/recording_try_next_word_44ea0a64.mp3`,
    );
    const enPath = join(repoRoot, 'src/assets', enAsset?.key ?? '');
    if (existsSync(enPath)) {
      expect(readFileSync(enPath).length).toBeGreaterThan(0);
    }
  }
});

test('vocabulary meaning toggle has generated Vietnamese confirmations', () => {
  for (const prompt of [
    sceneVocabularyMeaningEnabledPromptVi,
    sceneVocabularyMeaningDisabledPromptVi,
  ]) {
    const asset = getViAudioAsset(prompt);
    expect(asset?.key).toMatch(
      /^shared\/audio\/vi\/scene_vocabulary_meaning_(?:enabled|disabled)_/u,
    );
    const assetPath = join(repoRoot, 'src/assets', asset?.key ?? '');
    if (existsSync(assetPath)) {
      expect(readFileSync(assetPath).length).toBeGreaterThan(0);
    }
  }
});

test('review game intro prompts have generated shared audio', () => {
  const prompts = [
    {
      en: 'Listen to the word and choose the right picture.',
      enKey: 'listen_choose_game_intro_681d6155.mp3',
      vi: 'Bé hãy nghe từ và chọn hình đúng nhé.',
      viKey: 'shared/audio/vi/listen_choose_game_intro_b4d866de.mp3',
    },
    {
      en: 'Match each picture with the correct word.',
      enKey: 'matching_game_intro_4d265559.mp3',
      vi: 'Bé hãy nối hình với từ tương ứng nhé.',
      viKey: 'shared/audio/vi/matching_game_intro_f4c7e47b.mp3',
    },
  ];

  for (const prompt of prompts) {
    const viAsset = getViAudioAsset(prompt.vi);
    expect(viAsset?.key).toBe(prompt.viKey);
    const viPath = join(repoRoot, 'src/assets', viAsset?.key ?? '');
    if (existsSync(viPath)) {
      expect(readFileSync(viPath).length).toBeGreaterThan(0);
    }

    for (const accent of ENGLISH_ACCENTS) {
      const enAsset = getWordAudioAsset(prompt.en, accent);
      expect(enAsset?.key).toBe(
        `shared/audio/${accent}/neural2-c-r1/${prompt.enKey}`,
      );
      const enPath = join(repoRoot, 'src/assets', enAsset?.key ?? '');
      if (existsSync(enPath)) {
        expect(readFileSync(enPath).length).toBeGreaterThan(0);
      }
    }
  }
});

test('Sungy UI prompts keep bundled English and Vietnamese audio', () => {
  for (const promptKey of bundledSungyUiPromptKeys) {
    const viAsset = getViAudioAsset(vi[promptKey]);
    expect(viAsset).toBeDefined();
    expect(viAsset?.key).toContain('ui/audio/vi/');
    expect(generatedUiAudioRegistry[viAsset?.key ?? '']).toBeDefined();
    expect(
      readFileSync(join(repoRoot, 'src/assets', viAsset?.key ?? '')).length,
    ).toBeGreaterThan(44);

    for (const accent of ENGLISH_ACCENTS) {
      const enAsset = getWordAudioAsset(en[promptKey], accent);
      expect(enAsset?.key).toContain(`ui/audio/${accent}/`);
      expect(generatedUiAudioRegistry[enAsset?.key ?? '']).toBeDefined();
      expect(
        readFileSync(join(repoRoot, 'src/assets', enAsset?.key ?? '')).length,
      ).toBeGreaterThan(44);
    }
  }
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
