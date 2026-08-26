import AsyncStorage from '@react-native-async-storage/async-storage';

import type { LearningMode } from '../types/lesson';

export const SCENE_VOCABULARY_LAYOUTS_STORAGE_KEY =
  '@skidsenglish/scene-vocabulary-layouts/v1';

const STORE_VERSION = 1;
const MAX_LAYOUT_COUNT = 256;
const MAX_PLACEMENTS_PER_LAYOUT = 64;
const MAX_IDENTIFIER_LENGTH = 160;

export type SceneVocabularySavedPlacement = {
  itemId: string;
  x: number;
  y: number;
  zIndex: number;
};

type SceneVocabularySavedLayout = {
  placements: SceneVocabularySavedPlacement[];
  updatedAt: string;
};

type SceneVocabularyLayoutStoreState = {
  layouts: Record<string, SceneVocabularySavedLayout>;
  version: 1;
};

const emptySceneVocabularyLayoutStore: SceneVocabularyLayoutStoreState = {
  layouts: {},
  version: STORE_VERSION,
};

let sceneVocabularyLayoutOperationQueue: Promise<void> = Promise.resolve();

export function getSceneVocabularyLayoutKey(
  lessonId: string,
  sceneId: string,
  learningMode: LearningMode,
) {
  return JSON.stringify([lessonId, sceneId, learningMode]);
}

export function loadSceneVocabularyLayout(
  lessonId: string,
  sceneId: string,
  learningMode: LearningMode,
): Promise<SceneVocabularySavedPlacement[]> {
  return enqueueSceneVocabularyLayoutOperation(async () => {
    const state = await readSceneVocabularyLayoutStore();
    const key = getSceneVocabularyLayoutKey(lessonId, sceneId, learningMode);
    return state.layouts[key]?.placements ?? [];
  });
}

export function saveSceneVocabularyLayout(
  lessonId: string,
  sceneId: string,
  learningMode: LearningMode,
  placements: readonly SceneVocabularySavedPlacement[],
): Promise<SceneVocabularySavedPlacement[]> {
  return enqueueSceneVocabularyLayoutOperation(async () => {
    const state = await readSceneVocabularyLayoutStore();
    const key = getSceneVocabularyLayoutKey(lessonId, sceneId, learningMode);
    const normalizedPlacements = normalizePlacements(placements);

    if (normalizedPlacements.length === 0) {
      const remainingLayouts = { ...state.layouts };
      delete remainingLayouts[key];
      await persistSceneVocabularyLayoutStore({
        layouts: remainingLayouts,
        version: STORE_VERSION,
      });
      return [];
    }

    const layouts = pruneLayouts({
      ...state.layouts,
      [key]: {
        placements: normalizedPlacements,
        updatedAt: new Date().toISOString(),
      },
    });
    await persistSceneVocabularyLayoutStore({
      layouts,
      version: STORE_VERSION,
    });
    return normalizedPlacements;
  });
}

export function clearSceneVocabularyLayout(
  lessonId: string,
  sceneId: string,
  learningMode: LearningMode,
): Promise<void> {
  return enqueueSceneVocabularyLayoutOperation(async () => {
    const state = await readSceneVocabularyLayoutStore();
    const key = getSceneVocabularyLayoutKey(lessonId, sceneId, learningMode);
    if (!state.layouts[key]) {
      return;
    }

    const remainingLayouts = { ...state.layouts };
    delete remainingLayouts[key];
    await persistSceneVocabularyLayoutStore({
      layouts: remainingLayouts,
      version: STORE_VERSION,
    });
  });
}

export function clearAllSceneVocabularyLayouts(): Promise<void> {
  return enqueueSceneVocabularyLayoutOperation(() =>
    AsyncStorage.removeItem(SCENE_VOCABULARY_LAYOUTS_STORAGE_KEY),
  );
}

async function readSceneVocabularyLayoutStore() {
  const rawState = await AsyncStorage.getItem(
    SCENE_VOCABULARY_LAYOUTS_STORAGE_KEY,
  );
  if (!rawState) {
    return emptySceneVocabularyLayoutStore;
  }

  try {
    return normalizeSceneVocabularyLayoutStore(JSON.parse(rawState));
  } catch {
    return emptySceneVocabularyLayoutStore;
  }
}

async function persistSceneVocabularyLayoutStore(
  state: SceneVocabularyLayoutStoreState,
) {
  if (Object.keys(state.layouts).length === 0) {
    await AsyncStorage.removeItem(SCENE_VOCABULARY_LAYOUTS_STORAGE_KEY);
    return;
  }

  await AsyncStorage.setItem(
    SCENE_VOCABULARY_LAYOUTS_STORAGE_KEY,
    JSON.stringify(state),
  );
}

function normalizeSceneVocabularyLayoutStore(
  value: unknown,
): SceneVocabularyLayoutStoreState {
  if (!isRecord(value) || !isRecord(value.layouts)) {
    return emptySceneVocabularyLayoutStore;
  }

  const layouts: Record<string, SceneVocabularySavedLayout> = {};
  for (const [key, candidate] of Object.entries(value.layouts)) {
    if (!isValidLayoutKey(key) || !isRecord(candidate)) {
      continue;
    }
    const placements = normalizePlacements(candidate.placements);
    if (placements.length === 0) {
      continue;
    }
    layouts[key] = {
      placements,
      updatedAt: normalizeTimestamp(candidate.updatedAt),
    };
  }

  return {
    layouts: pruneLayouts(layouts),
    version: STORE_VERSION,
  };
}

function normalizePlacements(value: unknown): SceneVocabularySavedPlacement[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const placementByItemId = new Map<string, SceneVocabularySavedPlacement>();
  for (const candidate of value.slice(0, MAX_PLACEMENTS_PER_LAYOUT)) {
    if (!isRecord(candidate)) {
      continue;
    }
    const itemId = normalizeIdentifier(candidate.itemId);
    const x = normalizeCoordinate(candidate.x);
    const y = normalizeCoordinate(candidate.y);
    const zIndex = normalizeZIndex(candidate.zIndex);
    if (!itemId || x === undefined || y === undefined || !zIndex) {
      continue;
    }
    placementByItemId.set(itemId, { itemId, x, y, zIndex });
  }

  return Array.from(placementByItemId.values());
}

function pruneLayouts(layouts: Record<string, SceneVocabularySavedLayout>) {
  return Object.fromEntries(
    Object.entries(layouts)
      .sort(
        (left, right) =>
          new Date(right[1].updatedAt).getTime() -
          new Date(left[1].updatedAt).getTime(),
      )
      .slice(0, MAX_LAYOUT_COUNT),
  );
}

function isValidLayoutKey(value: string) {
  if (value.length === 0 || value.length > MAX_IDENTIFIER_LENGTH * 2 + 32) {
    return false;
  }
  try {
    const parts: unknown = JSON.parse(value);
    return (
      Array.isArray(parts) &&
      parts.length === 3 &&
      Boolean(normalizeIdentifier(parts[0])) &&
      Boolean(normalizeIdentifier(parts[1])) &&
      (parts[2] === 'core' ||
        parts[2] === 'expanded' ||
        parts[2] === 'challenge')
    );
  } catch {
    return false;
  }
}

function normalizeIdentifier(value: unknown) {
  return typeof value === 'string' &&
    value.length > 0 &&
    value.length <= MAX_IDENTIFIER_LENGTH
    ? value
    : undefined;
}

function normalizeCoordinate(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value)
    ? clamp(value, 0, 1)
    : undefined;
}

function normalizeZIndex(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value)
    ? clamp(Math.round(value), 1, 10000)
    : undefined;
}

function normalizeTimestamp(value: unknown) {
  return typeof value === 'string' && !Number.isNaN(new Date(value).getTime())
    ? value
    : new Date(0).toISOString();
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function enqueueSceneVocabularyLayoutOperation<TResult>(
  operation: () => Promise<TResult>,
): Promise<TResult> {
  const result = sceneVocabularyLayoutOperationQueue.then(operation);
  sceneVocabularyLayoutOperationQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
