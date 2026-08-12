import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, NativeModules, Platform } from 'react-native';

import {
  APP_REVIEW_ANDROID_WEB_URL,
  APP_REVIEW_STORE_URLS,
} from '../config/appInfo';

export const APP_REVIEW_STORAGE_KEY = '@skidsenglish/app-review/v1';

const DAY_MS = 24 * 60 * 60 * 1000;
const MINIMUM_APP_AGE_MS = 7 * DAY_MS;
const MINIMUM_ACTIVE_DAYS = 3;
const MINIMUM_COMPLETED_LESSONS = 3;
const ATTEMPT_COOLDOWN_MS = 90 * DAY_MS;
const ATTEMPT_WINDOW_MS = 365 * DAY_MS;
const MAX_ATTEMPTS_PER_WINDOW = 2;
const MAX_STORED_ATTEMPTS = 12;

type SkidsAppReviewModule = {
  requestReview?: () => Promise<boolean | void>;
};

type AppReviewAttempt = Readonly<{
  appVersion: string;
  attemptedAt: string;
}>;

export type AppReviewState = Readonly<{
  attempts: readonly AppReviewAttempt[];
  firstSeenAt: string;
  schemaVersion: 1;
}>;

export type AppReviewActivityEntry = Readonly<{
  date: string;
  scenesCompleted: number;
  wordsLearned: number;
}>;

export type AppReviewEligibilityInput = Readonly<{
  activityEntries: readonly AppReviewActivityEntry[];
  appVersion: string;
  completedLessonCount: number;
  now?: number;
}>;

export type AutomaticAppReviewResult =
  | 'failed'
  | 'ineligible'
  | 'requested'
  | 'unavailable';

type AppReviewPlatform = 'android' | 'ios';

let automaticRequestPromise: Promise<AutomaticAppReviewResult> | null = null;

function getNativeAppReview() {
  return NativeModules.SkidsAppReview as SkidsAppReviewModule | undefined;
}

export async function initializeAppReviewTracking(
  now = Date.now(),
): Promise<AppReviewState> {
  const existingState = await readAppReviewState();
  if (existingState) {
    return existingState;
  }

  const initialState = createInitialState(now);
  await persistAppReviewState(initialState);
  return initialState;
}

export function requestAutomaticAppReview(
  input: AppReviewEligibilityInput,
): Promise<AutomaticAppReviewResult> {
  if (!automaticRequestPromise) {
    automaticRequestPromise = runAutomaticAppReviewRequest(input).finally(
      () => {
        automaticRequestPromise = null;
      },
    );
  }

  return automaticRequestPromise;
}

export function evaluateAppReviewEligibility(
  state: AppReviewState,
  input: AppReviewEligibilityInput,
): boolean {
  const now = input.now ?? Date.now();
  const appVersion = input.appVersion.trim();
  const firstSeenAt = Date.parse(state.firstSeenAt);

  if (
    !appVersion ||
    !Number.isFinite(now) ||
    !Number.isFinite(firstSeenAt) ||
    firstSeenAt > now ||
    now - firstSeenAt < MINIMUM_APP_AGE_MS ||
    input.completedLessonCount < MINIMUM_COMPLETED_LESSONS ||
    countActiveDays(input.activityEntries) < MINIMUM_ACTIVE_DAYS
  ) {
    return false;
  }

  const pastAttempts = state.attempts.filter(attempt => {
    const attemptedAt = Date.parse(attempt.attemptedAt);
    return Number.isFinite(attemptedAt) && attemptedAt <= now;
  });

  if (pastAttempts.some(attempt => attempt.appVersion === appVersion)) {
    return false;
  }

  const recentAttemptTimes = pastAttempts
    .map(attempt => Date.parse(attempt.attemptedAt))
    .filter(attemptedAt => now - attemptedAt < ATTEMPT_WINDOW_MS);

  if (recentAttemptTimes.length >= MAX_ATTEMPTS_PER_WINDOW) {
    return false;
  }

  const lastAttemptAt = Math.max(...recentAttemptTimes, -Infinity);
  return now - lastAttemptAt >= ATTEMPT_COOLDOWN_MS;
}

export function parseAppReviewState(rawValue: string | null) {
  if (!rawValue) {
    return null;
  }

  try {
    const value: unknown = JSON.parse(rawValue);
    if (
      !isRecord(value) ||
      value.schemaVersion !== 1 ||
      !isValidIsoDate(value.firstSeenAt)
    ) {
      return null;
    }

    const rawAttempts = Array.isArray(value.attempts) ? value.attempts : [];
    const attempts = rawAttempts
      .map(parseAttempt)
      .filter((attempt): attempt is AppReviewAttempt => Boolean(attempt))
      .sort(
        (first, second) =>
          Date.parse(first.attemptedAt) - Date.parse(second.attemptedAt),
      )
      .slice(-MAX_STORED_ATTEMPTS);

    return {
      attempts,
      firstSeenAt: value.firstSeenAt,
      schemaVersion: 1,
    } satisfies AppReviewState;
  } catch {
    return null;
  }
}

export function getAppReviewStoreUrl(
  remoteStoreUrl?: string,
  platform: string = Platform.OS,
): string | null {
  if (platform !== 'android' && platform !== 'ios') {
    return null;
  }

  const candidate = selectAllowedStoreUrl(
    remoteStoreUrl,
    APP_REVIEW_STORE_URLS[platform],
    platform,
  );
  if (!candidate) {
    return null;
  }

  return platform === 'ios' ? appendWriteReviewAction(candidate) : candidate;
}

export async function openAppReviewStore(
  remoteStoreUrl?: string,
): Promise<boolean> {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    return false;
  }

  const platform = Platform.OS;
  const primaryUrl = getAppReviewStoreUrl(remoteStoreUrl, platform);
  if (!primaryUrl) {
    return false;
  }

  const candidates =
    platform === 'android'
      ? Array.from(new Set([primaryUrl, APP_REVIEW_ANDROID_WEB_URL]))
      : [primaryUrl];

  for (const candidate of candidates) {
    try {
      await Linking.openURL(candidate);
      return true;
    } catch {
      // Try the browser fallback on Android before reporting failure.
    }
  }

  return false;
}

async function runAutomaticAppReviewRequest(
  input: AppReviewEligibilityInput,
): Promise<AutomaticAppReviewResult> {
  try {
    const state = await initializeAppReviewTracking(input.now);
    if (!evaluateAppReviewEligibility(state, input)) {
      return 'ineligible';
    }

    const requestReview = getNativeAppReview()?.requestReview;
    if (!requestReview) {
      return 'unavailable';
    }

    const didRequest = await requestReview();
    if (didRequest === false) {
      return 'unavailable';
    }

    const attemptedAt = new Date(input.now ?? Date.now()).toISOString();
    const nextState: AppReviewState = {
      ...state,
      attempts: [
        ...state.attempts,
        { appVersion: input.appVersion.trim(), attemptedAt },
      ].slice(-MAX_STORED_ATTEMPTS),
    };
    await persistAppReviewState(nextState);
    return 'requested';
  } catch {
    return 'failed';
  }
}

async function readAppReviewState() {
  try {
    return parseAppReviewState(
      await AsyncStorage.getItem(APP_REVIEW_STORAGE_KEY),
    );
  } catch {
    return null;
  }
}

function persistAppReviewState(state: AppReviewState) {
  return AsyncStorage.setItem(APP_REVIEW_STORAGE_KEY, JSON.stringify(state));
}

function createInitialState(now: number): AppReviewState {
  const safeNow = Number.isFinite(now) ? now : Date.now();
  return {
    attempts: [],
    firstSeenAt: new Date(safeNow).toISOString(),
    schemaVersion: 1,
  };
}

function countActiveDays(entries: readonly AppReviewActivityEntry[]) {
  return new Set(
    entries
      .filter(entry => entry.wordsLearned > 0 || entry.scenesCompleted > 0)
      .map(entry => entry.date.trim())
      .filter(Boolean),
  ).size;
}

function parseAttempt(value: unknown): AppReviewAttempt | null {
  if (!isRecord(value)) {
    return null;
  }

  const appVersion =
    typeof value.appVersion === 'string' ? value.appVersion.trim() : '';
  if (!appVersion || !isValidIsoDate(value.attemptedAt)) {
    return null;
  }

  return { appVersion, attemptedAt: value.attemptedAt };
}

function selectAllowedStoreUrl(
  remoteStoreUrl: string | undefined,
  configuredStoreUrl: string,
  platform: AppReviewPlatform,
) {
  const candidates = [remoteStoreUrl, configuredStoreUrl];
  for (const candidate of candidates) {
    const normalizedCandidate = candidate?.trim();
    if (
      normalizedCandidate &&
      isAllowedStoreUrl(normalizedCandidate, platform)
    ) {
      return normalizedCandidate;
    }
  }

  return null;
}

function appendWriteReviewAction(url: string) {
  if (/[?&]action=write-review(?:&|$)/i.test(url)) {
    return url;
  }

  return `${url}${url.includes('?') ? '&' : '?'}action=write-review`;
}

function isAllowedStoreUrl(url: string, platform: AppReviewPlatform) {
  const normalizedUrl = url.toLowerCase();
  if (platform === 'android') {
    return (
      normalizedUrl.startsWith('market://details?') ||
      normalizedUrl.startsWith('https://play.google.com/store/apps/details?')
    );
  }

  return (
    normalizedUrl.startsWith('https://apps.apple.com/') ||
    normalizedUrl.startsWith('https://itunes.apple.com/') ||
    normalizedUrl.startsWith('itms-apps://apps.apple.com/') ||
    normalizedUrl.startsWith('itms-apps://itunes.apple.com/')
  );
}

function isValidIsoDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
