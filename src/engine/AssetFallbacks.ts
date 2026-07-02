import type { Scene } from '../types/lesson';

export const objectFallbackEmojiMap: Record<string, string> = {
  apple: '🍎',
  apron: '🥼',
  bag: '🎒',
  baby: '👧',
  'bath-mat': '🟦',
  'bath-sponge': '🧽',
  bathtub: '🛁',
  ball: '⚽',
  banana: '🍌',
  bed: '🛏️',
  bench: '🪑',
  blanket: '🧺',
  book: '📘',
  bookmark: '🔖',
  bottle: '🥤',
  bowl: '🥣',
  bubble: '🫧',
  bubbles: '🫧',
  board: '🟩',
  box: '📦',
  bread: '🍞',
  bite: '😋',
  blocks: '🧱',
  bucket: '🪣',
  bus: '🚌',
  basket: '🧺',
  cabinet: '🗄️',
  car: '🚗',
  carafe: '🍶',
  carton: '📦',
  chair: '🪑',
  clock: '🕒',
  classroom: '🏫',
  'cleaning-brush': '🧹',
  cloth: '🧽',
  coaster: '🟦',
  comb: '🪮',
  'compost-bin': '🟫',
  'comfort-plush': '🧸',
  container: '🥡',
  cookie: '🍪',
  cracker: '🥨',
  crumbs: '🍚',
  crayon: '🖍️',
  cup: '🥤',
  curtain: '🪟',
  desk: '📝',
  dessert: '🍮',
  'dirty-clothes': '👕',
  dinner: '🍽️',
  'dinner-bell': '🔔',
  'dining-light': '💡',
  dish: '🍽️',
  dishes: '🍽️',
  'dish-rack': '🍽️',
  dishwasher: '🧼',
  doll: '🧸',
  door: '🚪',
  'dream-journal': '📓',
  drum: '🥁',
  egg: '🥚',
  eraser: '🧽',
  elbow: '💪',
  face: '🙂',
  family: '👨‍👩‍👧',
  feet: '🦶',
  fish: '🐟',
  folder: '📁',
  foam: '🫧',
  'food-cover': '🥣',
  floor: '▭',
  friend: '🧒',
  fork: '🍴',
  fruit: '🍎',
  goodbye: '👋',
  'glow-sticker': '⭐',
  hand: '✋',
  hands: '👐',
  hair: '💇',
  home: '🏠',
  hook: '🪝',
  hug: '🤗',
  humidifier: '🧴',
  jacket: '🧥',
  juice: '🧃',
  'juice-container': '🧃',
  jump: '⭕',
  knee: '🦵',
  kite: '🪁',
  'kitchen-counter': '▭',
  lamp: '💡',
  ladle: '🥄',
  label: '🏷️',
  line: '➖',
  'laundry-basket': '🧺',
  leftovers: '🥡',
  lunchbox: '🍱',
  'lullaby-card': '🎵',
  milk: '🥛',
  mirror: '🪞',
  'moon-mobile': '🌙',
  mouth: '🙂',
  music: '🎵',
  napkin: '🧻',
  'night-light': '🌙',
  nightstand: '🗄️',
  noodles: '🍜',
  notebook: '📓',
  open: '🍱',
  'page-tab': '🔖',
  paper: '📄',
  pillow: '🛏️',
  pajamas: '🌙',
  pencil: '✏️',
  placemat: '🟩',
  plate: '🍽️',
  'pot-holder': '🧤',
  play: '🎲',
  playground: '🏫',
  puzzle: '🧩',
  'quiet-corner': '🌙',
  rope: '➰',
  road: '🛣️',
  robe: '🧥',
  run: '👟',
  raisins: '🍇',
  'recycling-bin': '♻️',
  ruler: '📏',
  rice: '🍚',
  salad: '🥗',
  sauce: '🧂',
  school: '🏫',
  scraper: '▭',
  seesaw: '⚖️',
  'seat-belt': '🎗️',
  'serving-tray': '🍽️',
  'serving-cart': '🛒',
  shade: '🌳',
  shelf: '🗄️',
  shoes: '👟',
  shampoo: '🧴',
  shoulder: '💪',
  shower: '🚿',
  'shower-head': '🚿',
  sink: '🚰',
  slide: '🛝',
  'sleep-mask': '😴',
  slippers: '🥿',
  snack: '🥨',
  'snack-box': '🍱',
  soap: '🧼',
  'soft-voice-card': '🤫',
  soup: '🥣',
  sip: '🥤',
  'sound-machine': '🎵',
  spoon: '🥄',
  sponge: '🧽',
  socks: '🧦',
  'spray-bottle': '🧴',
  spill: '💦',
  stain: '🔶',
  'star-projector': '🌟',
  'story-shelf': '📚',
  storybook: '📖',
  sun: '☀️',
  swing: '🛝',
  table: '🍽️',
  teacher: '👩‍🏫',
  'thank-you': '🙏',
  timer: '⏱️',
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
  wall: '▭',
  water: '💧',
  vegetables: '🥦',
  window: '🪟',
  wrapper: '🍬',
  yogurt: '🥣',
  'body-wash': '🧴',
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
    case 'bedtime-story':
      return {
        accent: '#FFD77A',
        floor: '#E6D7BC',
        panel: '#FFF8E8',
        wall: '#F5ECFF',
      };
    case 'calm-room':
      return {
        accent: '#8FD6FF',
        floor: '#D8F0D2',
        panel: '#F7FBFF',
        wall: '#EAF1FF',
      };
    case 'sleep-ready':
      return {
        accent: '#69C9B9',
        floor: '#E6D7BC',
        panel: '#FFFFFF',
        wall: '#F2FBFF',
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
    case 'bath-prep':
      return {
        accent: '#69C9B9',
        floor: '#D7F4FF',
        panel: '#FFFFFF',
        wall: '#E6F8FF',
      };
    case 'bath-rinse':
      return {
        accent: '#5DADEC',
        floor: '#D7F4FF',
        panel: '#F7FBFF',
        wall: '#EAF1FF',
      };
    case 'bath-finish':
      return {
        accent: '#74D889',
        floor: '#E6D7BC',
        panel: '#FFF8E8',
        wall: '#E8F7F0',
      };
    case 'dinner-prep':
      return {
        accent: '#FFB703',
        floor: '#F3E4C7',
        panel: '#FFF9DF',
        wall: '#FFF7E8',
      };
    case 'dinner-table':
      return {
        accent: '#FF9C8A',
        floor: '#FFE2CC',
        panel: '#FFF8E8',
        wall: '#F0F7FF',
      };
    case 'dinner-cleanup':
      return {
        accent: '#69C9B9',
        floor: '#E6D7BC',
        panel: '#FFFFFF',
        wall: '#E8F7F0',
      };
    case 'clear-dinner':
      return {
        accent: '#FFB703',
        floor: '#F3E4C7',
        panel: '#FFF9DF',
        wall: '#FFF7E8',
      };
    case 'spot-clean':
      return {
        accent: '#69C9B9',
        floor: '#E6D7BC',
        panel: '#FFFFFF',
        wall: '#E8F7F0',
      };
    case 'sort-and-dry':
      return {
        accent: '#74D889',
        floor: '#D8F0D2',
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
