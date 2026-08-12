import {
  getViAudioAsset,
  getWordAudioAsset,
} from '../src/data/audioManifest';
import { kidLockAudioPrompts } from '../src/data/kidLockAudioPrompts';
import { generatedUiAudioRegistry } from '../src/engine/GeneratedUiAudioRegistry';
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
const expectedEnglishTargetCountPerAccent = 3827;
const bundledEnglishUiPrompts = [
  'Hi! I am Sungy, your child’s learning buddy.',
  'Let’s learn with Sungy today!',
  'Wonderful! The whole map is complete. Let’s collect more stars!',
  'Great job! Let’s look at the sticker collection.',
  'Sungy can see the whole map lighting up!',
  'You can replay a stop to review new words.',
  'Let’s flip cards to remember words longer.',
  'Finish the review and Sungy will give a sticker!',
  'Tap Play to open the unlocked game.',
  'Tap the glowing stop to keep learning.',
  'Sungy is going with you!',
  'Let’s earn more stars!',
];

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

    const assetPath = join(repoRoot, 'src/assets', target.key);
    if (existsSync(assetPath)) {
      const content = readFileSync(assetPath);
      expect(content.length).toBeGreaterThan(0);
    }
  }

  expect(manifest.targets).toHaveLength(
    expectedEnglishTargetCountPerAccent * ENGLISH_ACCENTS.length,
  );
  expect(Object.fromEntries(counts)).toEqual({
    'en-GB': expectedEnglishTargetCountPerAccent,
    'en-US': expectedEnglishTargetCountPerAccent,
  });
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

test('Sungy UI prompts keep bundled English audio', () => {
  for (const prompt of bundledEnglishUiPrompts) {
    for (const accent of ENGLISH_ACCENTS) {
      const enAsset = getWordAudioAsset(prompt, accent);
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
