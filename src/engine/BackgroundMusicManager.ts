import { AppState, type AppStateStatus } from 'react-native';

import { resolveBackgroundMusicUri } from './BackgroundMusicRegistry';
import {
  DEFAULT_BACKGROUND_MUSIC_VOLUME,
  playBackgroundMusicUri,
  stopBackgroundMusic,
} from './AudioManager';
import {
  getParentSettings,
  subscribeParentSettings,
} from './ParentSettingsManager';

let stopCurrentManager: (() => void) | null = null;
let isSuppressedByLearningRoute = false;
let syncCurrentManager: (() => void) | null = null;

const learningRoutesWithoutBackgroundMusic = new Set([
  'ReviewGame',
  'ScenePlayer',
]);

export function isBackgroundMusicSuppressedRoute(routeName?: string) {
  return Boolean(
    routeName && learningRoutesWithoutBackgroundMusic.has(routeName),
  );
}

export function setBackgroundMusicSuppressedByRoute(isSuppressed: boolean) {
  if (isSuppressedByLearningRoute === isSuppressed) {
    return;
  }

  isSuppressedByLearningRoute = isSuppressed;
  syncCurrentManager?.();
}

export function startBackgroundMusicManager() {
  if (stopCurrentManager) {
    return stopCurrentManager;
  }

  let isDisposed = false;
  let isPlaying = false;
  let activeUri: string | null = null;
  let appState: AppStateStatus = AppState.currentState;
  let isEnabled = false;
  let syncQueue = Promise.resolve();

  const syncState = () => {
    syncQueue = syncQueue
      .catch(() => undefined)
      .then(async () => {
        if (isDisposed) {
          return;
        }

        const shouldPlay =
          isEnabled && appState === 'active' && !isSuppressedByLearningRoute;
        const musicUri = shouldPlay ? resolveBackgroundMusicUri() : null;

        if (shouldPlay && musicUri) {
          if (isPlaying && activeUri === musicUri) {
            return;
          }

          const didPlay = await playBackgroundMusicUri(
            musicUri,
            DEFAULT_BACKGROUND_MUSIC_VOLUME,
          );
          if (!isDisposed) {
            isPlaying = didPlay;
            activeUri = didPlay ? musicUri : null;
          }
          return;
        }

        if (isPlaying) {
          await stopBackgroundMusic();
          if (!isDisposed) {
            isPlaying = false;
            activeUri = null;
          }
        }
      });
  };

  syncCurrentManager = syncState;

  const appStateSubscription = AppState.addEventListener(
    'change',
    nextState => {
      appState = nextState;
      syncState();
    },
  );
  const unsubscribeSettings = subscribeParentSettings(settings => {
    isEnabled = settings.backgroundMusicEnabled;
    syncState();
  });

  getParentSettings()
    .then(settings => {
      if (isDisposed) {
        return;
      }
      isEnabled = settings.backgroundMusicEnabled;
      syncState();
    })
    .catch(() => undefined);

  const stopManager = () => {
    isDisposed = true;
    appStateSubscription.remove();
    unsubscribeSettings();
    stopCurrentManager = null;
    if (syncCurrentManager === syncState) {
      syncCurrentManager = null;
    }
    stopBackgroundMusic().catch(() => undefined);
  };

  stopCurrentManager = stopManager;
  return stopManager;
}
