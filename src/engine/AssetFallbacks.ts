import type { Scene } from '../types/lesson';

export const objectFallbackEmojiMap: Record<string, string> = {
  apple: '🍎',
  bag: '🎒',
  baby: '👧',
  bed: '🛏️',
  blanket: '🧺',
  box: '📦',
  bread: '🍞',
  clock: '🕒',
  doll: '🧸',
  lamp: '💡',
  milk: '🥛',
  mirror: '🪞',
  pillow: '🛏️',
  school: '🏫',
  shoes: '👟',
  sink: '🚰',
  soap: '🧼',
  socks: '🧦',
  sun: '☀️',
  toothpaste: '🦷',
  toothbrush: '🪥',
  towel: '🧻',
  water: '💧',
};

type ObjectFallbackInput = {
  assetId: string;
  assetSource: string;
  label: string;
  objectId: string;
};

export function getObjectFallbackEmoji({
  assetId,
  assetSource,
  label,
  objectId,
}: ObjectFallbackInput) {
  const candidates = [assetId, assetSource, label, objectId].map(normalizeKey);

  for (const candidate of candidates) {
    if (objectFallbackEmojiMap[candidate]) {
      return objectFallbackEmojiMap[candidate];
    }
  }

  const matchedKey = Object.keys(objectFallbackEmojiMap).find(key =>
    candidates.some(candidate => candidate.includes(key)),
  );

  return matchedKey ? objectFallbackEmojiMap[matchedKey] : '⭐';
}

export function canRenderImageSource(source: string) {
  return /^(https?:|file:|content:|data:)/u.test(source);
}

export function getSceneFallbackPalette(scene: Scene) {
  switch (scene.id) {
    case 'bedroom':
      return {
        accent: '#FFD77A',
        floor: '#FFE7C2',
        panel: '#FFF6D7',
        wall: '#F5ECFF',
      };
    case 'bathroom':
      return {
        accent: '#69C9B9',
        floor: '#D7F4FF',
        panel: '#FFFFFF',
        wall: '#E6F8FF',
      };
    case 'breakfast':
      return {
        accent: '#FF9C8A',
        floor: '#FFE2CC',
        panel: '#FFF4C7',
        wall: '#FFF7E8',
      };
    case 'go-to-school':
      return {
        accent: '#8FD6FF',
        floor: '#D8F0D2',
        panel: '#F2FBFF',
        wall: '#E9F6FF',
      };
    default:
      return {
        accent: '#FFD77A',
        floor: '#FFE7C2',
        panel: '#FFFFFF',
        wall: '#F2FBFF',
      };
  }
}

function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/u, '')
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-|-$/gu, '');
}
