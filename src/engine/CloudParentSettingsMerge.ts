import type {
  AppLanguage,
  AppTheme,
  ChildProfile,
  ParentSettings,
  TeacherPromptMode,
} from './ParentSettingsManager';
import { defaultChildProfile } from './ParentSettingsManager';
import { isEnglishAccent, type EnglishAccent } from '../types/audio';
import type { LearningMode } from '../types/lesson';

export type CloudParentSettingsData = {
  appLanguage: AppLanguage;
  appTheme: AppTheme;
  childProfile: ChildProfile;
  disabledThemeIds?: string[];
  englishAccent: EnglishAccent;
  hasCompletedOnboarding: boolean;
  journeyMode: ParentSettings['journeyMode'];
  learningMode: LearningMode;
  reminderEnabled: boolean;
  reminderTime: string;
  teacherPromptMode: TeacherPromptMode;
  updatedAt: string;
  visibleLessonIds?: string[];
};

export function toCloudParentSettingsData(
  settings: ParentSettings,
): CloudParentSettingsData {
  const visibleLessonIds = settings.visibleLessonIds
    ? Array.from(new Set(settings.visibleLessonIds)).sort((left, right) =>
        left.localeCompare(right),
      )
    : undefined;
  const disabledThemeIds = settings.disabledThemeIds
    ? Array.from(new Set(settings.disabledThemeIds)).sort((left, right) =>
        left.localeCompare(right),
      )
    : undefined;
  const childProfile = normalizeCloudChildProfile(settings.childProfile);

  return {
    appLanguage: settings.appLanguage,
    appTheme: settings.appTheme,
    childProfile,
    ...(disabledThemeIds ? { disabledThemeIds } : {}),
    englishAccent: settings.englishAccent,
    hasCompletedOnboarding: settings.hasCompletedOnboarding,
    journeyMode: settings.journeyMode,
    learningMode: settings.learningMode,
    reminderEnabled: settings.reminderEnabled,
    reminderTime: normalizeReminderTime(settings.reminderTime),
    teacherPromptMode: settings.teacherPromptMode,
    updatedAt:
      normalizeIsoTimestamp(settings.updatedAt) ??
      new Date(0).toISOString(),
    ...(visibleLessonIds ? { visibleLessonIds } : {}),
  };
}

export function parseCloudParentSettingsData(
  value: unknown,
): CloudParentSettingsData | null {
  if (!isRecord(value)) {
    return null;
  }

  const appLanguage = parseAppLanguage(value.appLanguage);
  const appTheme = parseAppTheme(value.appTheme);
  const childProfile = parseChildProfile(value.childProfile);
  const disabledThemeIds = parseVisibleLessonIds(value.disabledThemeIds);
  const englishAccent = parseEnglishAccent(value.englishAccent);
  const journeyMode = parseJourneyMode(value.journeyMode);
  const learningMode = parseLearningMode(value.learningMode);
  const reminderTime = parseReminderTime(value.reminderTime);
  const teacherPromptMode = parseTeacherPromptMode(
    value.teacherPromptMode,
  );
  const updatedAt = normalizeIsoTimestamp(value.updatedAt);
  const visibleLessonIds = parseVisibleLessonIds(value.visibleLessonIds);

  if (
    !appLanguage ||
    !appTheme ||
    !childProfile ||
    disabledThemeIds === null ||
    !englishAccent ||
    !journeyMode ||
    !learningMode ||
    reminderTime === null ||
    !teacherPromptMode ||
    !updatedAt ||
    visibleLessonIds === null ||
    typeof value.hasCompletedOnboarding !== 'boolean' ||
    typeof value.reminderEnabled !== 'boolean'
  ) {
    return null;
  }

  return {
    appLanguage,
    appTheme,
    childProfile,
    ...(disabledThemeIds ? { disabledThemeIds } : {}),
    englishAccent,
    hasCompletedOnboarding: value.hasCompletedOnboarding,
    journeyMode,
    learningMode,
    reminderEnabled: value.reminderEnabled,
    reminderTime,
    teacherPromptMode,
    updatedAt,
    ...(visibleLessonIds ? { visibleLessonIds } : {}),
  };
}

export function getCloudParentSettingsFingerprint(
  settings: CloudParentSettingsData,
) {
  const semanticEntries = Object.entries(settings).filter(
    ([key]) => key !== 'updatedAt',
  );
  return JSON.stringify(Object.fromEntries(semanticEntries));
}

export function areCloudParentSettingsEqual(
  first: CloudParentSettingsData,
  second: CloudParentSettingsData,
) {
  return (
    getCloudParentSettingsFingerprint(first) ===
    getCloudParentSettingsFingerprint(second)
  );
}

export function getCloudParentSettingsUpdatedAtMs(
  settings: CloudParentSettingsData,
) {
  return new Date(settings.updatedAt).getTime();
}

function parseAppLanguage(value: unknown): AppLanguage | null {
  return value === 'en' || value === 'vi' ? value : null;
}

function parseTeacherPromptMode(
  value: unknown,
): TeacherPromptMode | null {
  return value === 'en' || value === 'vi' || value === 'bilingual'
    ? value
    : null;
}

function parseEnglishAccent(value: unknown): EnglishAccent | null {
  return isEnglishAccent(value) ? value : null;
}

function parseLearningMode(value: unknown): LearningMode | null {
  return value === 'core' || value === 'expanded' || value === 'challenge'
    ? value
    : null;
}

function parseJourneyMode(
  value: unknown,
): ParentSettings['journeyMode'] | null {
  return value === 'guided' || value === 'free' ? value : null;
}

function parseAppTheme(value: unknown): AppTheme | null {
  return value === 'light' || value === 'dark' || value === 'system'
    ? value
    : null;
}

function parseChildProfile(value: unknown): ChildProfile | null {
  if (!isRecord(value)) {
    return null;
  }

  const name =
    typeof value.name === 'string' ? value.name.trim() : undefined;
  const avatarEmoji =
    typeof value.avatarEmoji === 'string'
      ? value.avatarEmoji.trim()
      : undefined;
  const birthYear =
    'birthYear' in value ? parseBirthYear(value.birthYear) : undefined;

  if (
    !name ||
    name.length > 80 ||
    !avatarEmoji ||
    avatarEmoji.length > 16 ||
    birthYear === null
  ) {
    return null;
  }

  return {
    avatarEmoji,
    ...(birthYear ? { birthYear } : {}),
    name,
  };
}

function normalizeCloudChildProfile(profile: ChildProfile): ChildProfile {
  const name = profile.name.trim() || defaultChildProfile.name;
  const avatarEmoji =
    profile.avatarEmoji.trim() || defaultChildProfile.avatarEmoji;
  const birthYear =
    typeof profile.birthYear === 'number' &&
    Number.isInteger(profile.birthYear) &&
    profile.birthYear >= 1900 &&
    profile.birthYear <= 2200
      ? profile.birthYear
      : undefined;

  return {
    avatarEmoji: avatarEmoji.slice(0, 16),
    ...(birthYear ? { birthYear } : {}),
    name: name.slice(0, 80),
  };
}

function parseVisibleLessonIds(value: unknown): string[] | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value) || value.length > 500) {
    return null;
  }

  const ids = new Set<string>();
  for (const item of value) {
    if (typeof item !== 'string' || item.length > 120) {
      return null;
    }
    ids.add(item);
  }

  return Array.from(ids).sort((left, right) => left.localeCompare(right));
}

function parseReminderTime(value: unknown): string | null {
  return typeof value === 'string' && isValidReminderTime(value)
    ? value
    : null;
}

function normalizeReminderTime(value: string) {
  return isValidReminderTime(value) ? value : '19:30';
}

function isValidReminderTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function parseBirthYear(value: unknown): number | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  return typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 1900 &&
    value <= 2200
    ? value
    : null;
}

function normalizeIsoTimestamp(value: unknown) {
  return typeof value === 'string' &&
    !Number.isNaN(new Date(value).getTime())
    ? value
    : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
