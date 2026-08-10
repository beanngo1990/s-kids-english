import AsyncStorage from '@react-native-async-storage/async-storage';

import { lessonRewards } from '../src/data/rewards';
import {
  getCloudProgressFingerprint,
  mergeProgressSnapshots,
  toCloudProgressData,
} from '../src/engine/CloudProgressMerge';
import {
  getProgress,
  normalizeProgress,
  saveStickerPlaygroundState,
} from '../src/engine/ProgressManager';
import {
  createEmptyStickerPlaygroundState,
  STICKER_PLAYGROUND_MAX_SCALE,
  type StickerPlacement,
} from '../src/types/stickerPlayground';
import {
  getMissingAchievementStickerRecords,
  getUnlockedStickers,
} from '../src/utils/unlockedStickers';

beforeEach(async () => {
  await AsyncStorage.clear();
});

test('normalizes legacy and malformed sticker playground layouts', () => {
  const progress = normalizeProgress({
    stickerPlayground: {
      activeBackgroundId: 'space',
      boards: {
        bedroom: {
          placements: [
            {
              instanceId: 'placement-a',
              rotation: Math.PI * 5,
              scale: 99,
              stickerId: 'sticker-a',
              x: 3,
              y: -1,
              zIndex: -4,
            },
            {
              instanceId: 'placement-a',
              rotation: 0,
              scale: 1,
              stickerId: 'duplicate',
              x: 0.5,
              y: 0.5,
              zIndex: 1,
            },
            { instanceId: 'missing-fields' },
          ],
        },
      },
    },
  });

  expect(progress.stickerPlayground.activeBackgroundId).toBe('bedroom');
  expect(progress.stickerPlayground.boards.park.placements).toEqual([]);
  expect(progress.stickerPlayground.boards.bedroom.placements).toHaveLength(1);
  expect(progress.stickerPlayground.boards.bedroom.placements[0]).toMatchObject({
    instanceId: 'placement-a',
    scale: STICKER_PLAYGROUND_MAX_SCALE,
    stickerId: 'sticker-a',
    x: 1,
    y: 0,
    zIndex: 0,
  });
  expect(
    Math.abs(
      progress.stickerPlayground.boards.bedroom.placements[0].rotation,
    ),
  ).toBeLessThanOrEqual(Math.PI);
});

test('normalizes legacy duplicate stickers to the topmost placement per background', () => {
  const progress = normalizeProgress({
    stickerPlayground: {
      boards: {
        bedroom: {
          placements: [
            { ...makePlacement('older-copy', 'sticker-a'), zIndex: 2 },
            { ...makePlacement('other-sticker', 'sticker-b'), zIndex: 3 },
            { ...makePlacement('top-copy', 'sticker-a'), zIndex: 8 },
          ],
        },
      },
    },
  });

  expect(progress.stickerPlayground.boards.bedroom.placements).toHaveLength(2);
  expect(progress.stickerPlayground.boards.bedroom.placements).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        instanceId: 'top-copy',
        stickerId: 'sticker-a',
      }),
      expect.objectContaining({
        instanceId: 'other-sticker',
        stickerId: 'sticker-b',
      }),
    ]),
  );
});

test('persists independent background layouts through ProgressManager', async () => {
  const state = createEmptyStickerPlaygroundState();
  state.activeBackgroundId = 'beach';
  state.boards.bedroom = {
    placements: [makePlacement('bedroom-item', 'sticker-a')],
    updatedAt: '2026-08-10T08:00:00.000Z',
  };
  state.boards.beach = {
    placements: [makePlacement('beach-item', 'sticker-b')],
    updatedAt: '2026-08-10T09:00:00.000Z',
  };

  await saveStickerPlaygroundState(state);
  const stored = await getProgress();

  expect(stored.stickerPlayground.activeBackgroundId).toBe('beach');
  expect(stored.stickerPlayground.boards.bedroom.placements[0].instanceId).toBe(
    'bedroom-item',
  );
  expect(stored.stickerPlayground.boards.beach.placements[0].instanceId).toBe(
    'beach-item',
  );
});

test('keeps playground local-only while preserving newest local boards in merges', () => {
  const firstState = createEmptyStickerPlaygroundState();
  firstState.activeBackgroundId = 'bedroom';
  firstState.updatedAt = '2026-08-10T08:00:00.000Z';
  firstState.boards.bedroom = {
    placements: [makePlacement('bedroom-item', 'sticker-a')],
    updatedAt: '2026-08-10T08:00:00.000Z',
  };
  const secondState = createEmptyStickerPlaygroundState();
  secondState.activeBackgroundId = 'beach';
  secondState.updatedAt = '2026-08-10T09:00:00.000Z';
  secondState.boards.beach = {
    placements: [makePlacement('beach-item', 'sticker-b')],
    updatedAt: '2026-08-10T09:00:00.000Z',
  };
  const first = normalizeProgress({ stickerPlayground: firstState });
  const second = normalizeProgress({ stickerPlayground: secondState });
  const merged = mergeProgressSnapshots(first, second);

  expect(merged.stickerPlayground.activeBackgroundId).toBe('beach');
  expect(merged.stickerPlayground.boards.bedroom.placements).toHaveLength(1);
  expect(merged.stickerPlayground.boards.beach.placements).toHaveLength(1);
  expect(toCloudProgressData(merged)).not.toHaveProperty('stickerPlayground');
  expect(getCloudProgressFingerprint(first)).toBe(
    getCloudProgressFingerprint(second),
  );
});

test('returns unlocked lesson and achievement stickers for the tray', () => {
  const lessonReward = lessonRewards[0];
  expect(lessonReward).toBeDefined();
  if (!lessonReward) {
    throw new Error('Lesson reward catalog is empty.');
  }

  const progress = normalizeProgress({
    earnedStickerIds: [lessonReward.stickerId],
    learnedWordIds: ['first-word'],
  });
  const activityLog = {
    currentStreak: 0,
    entries: [],
    longestStreak: 0,
  };
  const stickers = getUnlockedStickers(progress, activityLog, 'vi');
  const missingRecords = getMissingAchievementStickerRecords(
    progress,
    activityLog,
    '2026-08-10T09:00:00.000Z',
  );

  expect(stickers.map(sticker => sticker.stickerId)).toEqual(
    expect.arrayContaining([
      lessonReward.stickerId,
      'achievement-sticker-first-word',
    ]),
  );
  expect(missingRecords).toContainEqual({
    achievementId: 'achievement-first-word',
    earnedAt: '2026-08-10T09:00:00.000Z',
    stickerId: 'achievement-sticker-first-word',
  });
});

function makePlacement(
  instanceId: string,
  stickerId: string,
): StickerPlacement {
  return {
    instanceId,
    rotation: 0,
    scale: 1,
    stickerId,
    x: 0.5,
    y: 0.5,
    zIndex: 1,
  };
}
