import type { Scene } from '../types/lesson';

export const objectFallbackEmojiMap: Record<string, string> = {
  apple: '🍎',
  bag: '🎒',
  baby: '👧',
  ball: '⚽',
  banana: '🍌',
  bed: '🛏️',
  bench: '🪑',
  blanket: '🧺',
  book: '📘',
  bottle: '🥤',
  bowl: '🥣',
  board: '🟩',
  box: '📦',
  bread: '🍞',
  bite: '😋',
  blocks: '🧱',
  bucket: '🪣',
  bus: '🚌',
  basket: '🧺',
  car: '🚗',
  chair: '🪑',
  clock: '🕒',
  classroom: '🏫',
  cloth: '🧽',
  cookie: '🍪',
  cracker: '🥨',
  crumbs: '🍚',
  crayon: '🖍️',
  cup: '🥤',
  desk: '📝',
  doll: '🧸',
  door: '🚪',
  drum: '🥁',
  egg: '🥚',
  eraser: '🧽',
  face: '🙂',
  family: '👨‍👩‍👧',
  folder: '📁',
  floor: '▭',
  friend: '🧒',
  fork: '🍴',
  fruit: '🍎',
  goodbye: '👋',
  hand: '✋',
  hands: '👐',
  home: '🏠',
  hug: '🤗',
  jacket: '🧥',
  juice: '🧃',
  'juice-container': '🧃',
  jump: '⭕',
  kite: '🪁',
  lamp: '💡',
  line: '➖',
  lunchbox: '🍱',
  milk: '🥛',
  mirror: '🪞',
  mouth: '🙂',
  music: '🎵',
  napkin: '🧻',
  notebook: '📓',
  open: '🍱',
  paper: '📄',
  pillow: '🛏️',
  pencil: '✏️',
  plate: '🍽️',
  play: '🎲',
  playground: '🏫',
  puzzle: '🧩',
  rope: '➰',
  road: '🛣️',
  run: '👟',
  raisins: '🍇',
  ruler: '📏',
  rice: '🍚',
  school: '🏫',
  seesaw: '⚖️',
  'seat-belt': '🎗️',
  shade: '🌳',
  shelf: '🗄️',
  shoes: '👟',
  sink: '🚰',
  slide: '🛝',
  snack: '🥨',
  'snack-box': '🍱',
  soap: '🧼',
  soup: '🥣',
  sip: '🥤',
  spoon: '🥄',
  sponge: '🧽',
  socks: '🧦',
  sun: '☀️',
  swing: '🛝',
  table: '🍽️',
  teacher: '👩‍🏫',
  'thank-you': '🙏',
  toothpaste: '🦷',
  toothbrush: '🪥',
  towel: '🧻',
  toy: '🧸',
  tray: '🍽️',
  'trash-bin': '🗑️',
  'traffic-light': '🚦',
  turn: '🔄',
  uniform: '👕',
  wait: '⏳',
  water: '💧',
  window: '🪟',
  wrapper: '🍬',
  yogurt: '🥣',
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
    case 'classroom':
      return {
        accent: '#6BCB77',
        floor: '#E6D7BC',
        panel: '#FFF8E8',
        wall: '#E8F7F0',
      };
    case 'school-supplies':
      return {
        accent: '#FFB703',
        floor: '#F3E4C7',
        panel: '#FFF9DF',
        wall: '#F0F7FF',
      };
    case 'teacher-instructions':
      return {
        accent: '#5DADEC',
        floor: '#E5D7C2',
        panel: '#F7FBFF',
        wall: '#EAF1FF',
      };
    case 'playground':
      return {
        accent: '#74D889',
        floor: '#D8F0D2',
        panel: '#FFF9DF',
        wall: '#DDF5FF',
      };
    case 'friend-games':
      return {
        accent: '#FFB703',
        floor: '#F3E4C7',
        panel: '#FFF8E8',
        wall: '#EAF1FF',
      };
    case 'playtime-rest':
      return {
        accent: '#69C9B9',
        floor: '#E6D7BC',
        panel: '#FFFFFF',
        wall: '#E8F7F0',
      };
    case 'lunch-box':
      return {
        accent: '#FFB703',
        floor: '#F3E4C7',
        panel: '#FFF9DF',
        wall: '#FFF7E8',
      };
    case 'lunch-table':
      return {
        accent: '#FF9C8A',
        floor: '#FFE2CC',
        panel: '#FFF8E8',
        wall: '#F0F7FF',
      };
    case 'after-lunch':
      return {
        accent: '#69C9B9',
        floor: '#E6D7BC',
        panel: '#FFFFFF',
        wall: '#E8F7F0',
      };
    case 'going-home':
      return {
        accent: '#5DADEC',
        floor: '#E5D7C2',
        panel: '#F7FBFF',
        wall: '#EAF1FF',
      };
    case 'ride-home':
      return {
        accent: '#8FD6FF',
        floor: '#D8F0D2',
        panel: '#F2FBFF',
        wall: '#E9F6FF',
      };
    case 'home-arrival':
      return {
        accent: '#74D889',
        floor: '#F3E4C7',
        panel: '#FFF8E8',
        wall: '#E8F7F0',
      };
    case 'snack-prep':
      return {
        accent: '#FFB703',
        floor: '#F3E4C7',
        panel: '#FFF9DF',
        wall: '#FFF7E8',
      };
    case 'snack-table':
      return {
        accent: '#FF9C8A',
        floor: '#FFE2CC',
        panel: '#FFF8E8',
        wall: '#F0F7FF',
      };
    case 'snack-cleanup':
      return {
        accent: '#69C9B9',
        floor: '#E6D7BC',
        panel: '#FFFFFF',
        wall: '#E8F7F0',
      };
    case 'home-toy-corner':
      return {
        accent: '#FFB703',
        floor: '#F3E4C7',
        panel: '#FFF9DF',
        wall: '#F0F7FF',
      };
    case 'creative-play':
      return {
        accent: '#FF9C8A',
        floor: '#FFE2CC',
        panel: '#FFF8E8',
        wall: '#FFF7E8',
      };
    case 'toy-cleanup':
      return {
        accent: '#69C9B9',
        floor: '#E6D7BC',
        panel: '#FFFFFF',
        wall: '#E8F7F0',
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
