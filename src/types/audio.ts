export const ENGLISH_ACCENTS = ['en-US', 'en-GB'] as const;

export type EnglishAccent = (typeof ENGLISH_ACCENTS)[number];

export const DEFAULT_ENGLISH_ACCENT: EnglishAccent = 'en-US';

export function isEnglishAccent(value: unknown): value is EnglishAccent {
  return ENGLISH_ACCENTS.some(accent => accent === value);
}
