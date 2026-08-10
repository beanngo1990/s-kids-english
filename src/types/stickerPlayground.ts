export const STICKER_PLAYGROUND_BACKGROUND_IDS = [
  'bedroom',
  'park',
  'beach',
] as const;

export type StickerPlaygroundBackgroundId =
  (typeof STICKER_PLAYGROUND_BACKGROUND_IDS)[number];

export const STICKER_PLAYGROUND_MIN_SCALE = 0.45;
export const STICKER_PLAYGROUND_MAX_SCALE = 2.4;
export const STICKER_PLAYGROUND_MAX_PLACEMENTS = 80;

export type StickerPlacement = {
  instanceId: string;
  rotation: number;
  scale: number;
  stickerId: string;
  x: number;
  y: number;
  zIndex: number;
};

export type StickerPlaygroundBoard = {
  placements: StickerPlacement[];
  updatedAt?: string;
};

export type StickerPlaygroundState = {
  activeBackgroundId: StickerPlaygroundBackgroundId;
  boards: Record<StickerPlaygroundBackgroundId, StickerPlaygroundBoard>;
  updatedAt?: string;
};

export function createEmptyStickerPlaygroundState(): StickerPlaygroundState {
  return {
    activeBackgroundId: 'bedroom',
    boards: {
      beach: { placements: [] },
      bedroom: { placements: [] },
      park: { placements: [] },
    },
  };
}
