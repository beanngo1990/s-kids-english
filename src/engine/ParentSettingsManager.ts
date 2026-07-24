import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AppLanguage, TeacherPromptMode } from '../i18n/types';
import {
  DEFAULT_ENGLISH_ACCENT,
  isEnglishAccent,
  type EnglishAccent,
} from '../types/audio';
import type { LearningMode } from '../types/lesson';
import { CLOUD_PROGRESS_SYNC_CONSENT_VERSION } from '../config/cloudProgressSync';

const PARENT_SETTINGS_STORAGE_KEY = '@skidsenglish/parent-settings/v1';

export type { AppLanguage, TeacherPromptMode } from '../i18n/types';
export type { EnglishAccent } from '../types/audio';
export type AppTheme = 'light' | 'dark' | 'system';

export type ChildProfile = {
  name: string;
  avatarEmoji: string;
  birthYear?: number;
};

export type CloudProgressSyncPreference = {
  consentedAt?: string;
  consentVersion?: number;
  enabled: boolean;
  ownerUid?: string;
};

export const AVATAR_EMOJI_OPTIONS = [
  '🧒', '👦', '👧', '🐰', '🦊', '🐻', '🐼', '🦁', '🌟', '🦄', '🐬', '🦋',
] as const;

export const defaultChildProfile: ChildProfile = {
  name: 'Bé yêu',
  avatarEmoji: '🧒',
};

export type ParentSettings = {
  cloudProgressSync: CloudProgressSyncPreference;
  enableSceneEditor?: boolean;
  hasCompletedOnboarding: boolean;
  journeyMode: 'guided' | 'free';
  learningMode: LearningMode;
  updatedAt?: string;
  visibleLessonIds?: string[]; // If undefined, all lessons are visible
  appLanguage: AppLanguage;
  englishAccent: EnglishAccent;
  teacherPromptMode: TeacherPromptMode;
  appTheme: AppTheme;
  reminderEnabled: boolean;
  reminderTime: string; // e.g. "19:30"
  childProfile: ChildProfile;
};

export type ParentSettingsListener = (settings: ParentSettings) => void;

export type LearningDifficultyOption = {
  learningMode: LearningMode;
  title: string;
  subtitle: string;
  detail: string;
};

export const learningDifficultyOptions: LearningDifficultyOption[] = [
  {
    detail: 'Ít từ hơn, thao tác chạm/nghe đơn giản.',
    learningMode: 'core',
    subtitle: 'Bắt đầu nhẹ nhàng',
    title: 'Dễ',
  },
  {
    detail: 'Thêm từ mới, vẫn giữ nhịp học thoải mái.',
    learningMode: 'expanded',
    subtitle: 'Tăng vốn từ',
    title: 'Vừa',
  },
  {
    detail: 'Nhiều từ hơn, có thêm thử thách kéo thả/cụm từ.',
    learningMode: 'challenge',
    subtitle: 'Thử thách hơn',
    title: 'Khó',
  },
];

export function detectDeviceLanguage(): AppLanguage {
  try {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
      return 'vi';
    }

    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      const intlLocale = Intl.DateTimeFormat().resolvedOptions().locale;
      if (typeof intlLocale === 'string') {
        const lower = intlLocale.toLowerCase();
        if (lower.startsWith('en')) {
          return 'en';
        }
        if (lower.startsWith('vi')) {
          return 'vi';
        }
      }
    }

    const appleLanguages =
      NativeModules.SettingsManager?.settings?.AppleLanguages;
    const primaryAppleLang = Array.isArray(appleLanguages)
      ? appleLanguages[0]
      : undefined;

    const locale =
      Platform.OS === 'ios'
        ? primaryAppleLang || NativeModules.SettingsManager?.settings?.AppleLocale
        : NativeModules.I18nManager?.localeIdentifier;

    if (typeof locale === 'string') {
      const lower = locale.toLowerCase();
      if (lower.startsWith('en')) {
        return 'en';
      }
      if (lower.startsWith('vi')) {
        return 'vi';
      }
    }
  } catch {
    // Fallback safely to Vietnamese
  }
  return 'vi';
}

export function getDefaultParentSettings(): ParentSettings {
  const initialLanguage = detectDeviceLanguage();
  return {
    cloudProgressSync: { enabled: false },
    enableSceneEditor: false,
    hasCompletedOnboarding: false,
    journeyMode: 'guided',
    learningMode: 'core',
    appLanguage: initialLanguage,
    englishAccent: DEFAULT_ENGLISH_ACCENT,
    teacherPromptMode: initialLanguage,
    appTheme: 'system',
    reminderEnabled: false,
    reminderTime: '19:30',
    childProfile: defaultChildProfile,
  };
}

export const defaultParentSettings: ParentSettings = getDefaultParentSettings();

const parentSettingsListeners = new Set<ParentSettingsListener>();

export function subscribeParentSettings(listener: ParentSettingsListener) {
  parentSettingsListeners.add(listener);

  return () => {
    parentSettingsListeners.delete(listener);
  };
}

export async function getParentSettings(): Promise<ParentSettings> {
  const rawSettings = await AsyncStorage.getItem(PARENT_SETTINGS_STORAGE_KEY);

  if (!rawSettings) {
    return getDefaultParentSettings();
  }

  return normalizeParentSettings(JSON.parse(rawSettings));
}

export async function saveParentSettings(
  settings: Partial<ParentSettings>,
): Promise<ParentSettings> {
  const currentSettings = await getParentSettings();
  const nextSettings = normalizeParentSettings({
    ...currentSettings,
    ...settings,
    updatedAt: new Date().toISOString(),
  });

  await AsyncStorage.setItem(
    PARENT_SETTINGS_STORAGE_KEY,
    JSON.stringify(nextSettings),
  );

  notifyParentSettingsChanged(nextSettings);

  return nextSettings;
}

export async function resetParentSettings(): Promise<ParentSettings> {
  await AsyncStorage.removeItem(PARENT_SETTINGS_STORAGE_KEY);

  const nextSettings = getDefaultParentSettings();
  notifyParentSettingsChanged(nextSettings);
  return nextSettings;
}

export function completeParentOnboarding(learningMode: LearningMode) {
  return saveParentSettings({
    hasCompletedOnboarding: true,
    learningMode,
  });
}

export function saveParentLearningMode(learningMode: LearningMode) {
  return saveParentSettings({ learningMode });
}

export function getLearningDifficultyOption(learningMode: LearningMode) {
  return (
    learningDifficultyOptions.find(
      option => option.learningMode === learningMode,
    ) ?? learningDifficultyOptions[0]
  );
}

function normalizeParentSettings(value: unknown): ParentSettings {
  const settings = value as Partial<ParentSettings>;
  const appLanguage = normalizeAppLanguage(settings.appLanguage);

  return {
    cloudProgressSync: normalizeCloudProgressSyncPreference(
      settings.cloudProgressSync,
    ),
    enableSceneEditor: Boolean(settings.enableSceneEditor),
    hasCompletedOnboarding: Boolean(settings.hasCompletedOnboarding),
    journeyMode: settings.journeyMode === 'free' ? 'free' : 'guided',
    learningMode: normalizeLearningMode(settings.learningMode),
    updatedAt:
      typeof settings.updatedAt === 'string' ? settings.updatedAt : undefined,
    visibleLessonIds: Array.isArray(settings.visibleLessonIds)
      ? settings.visibleLessonIds.filter(id => typeof id === 'string')
      : undefined,
    appLanguage,
    englishAccent: normalizeEnglishAccent(settings.englishAccent),
    teacherPromptMode: normalizeTeacherPromptMode(settings.teacherPromptMode),
    appTheme: normalizeAppTheme(settings.appTheme),
    reminderEnabled: Boolean(settings.reminderEnabled),
    reminderTime:
      typeof settings.reminderTime === 'string' ? settings.reminderTime : '19:30',
    childProfile: normalizeChildProfile(settings.childProfile),
  };
}

function normalizeCloudProgressSyncPreference(value: unknown) {
  const preference = value as Partial<CloudProgressSyncPreference> | undefined;
  const ownerUid =
    typeof preference?.ownerUid === 'string' &&
    preference.ownerUid.trim().length > 0
      ? preference.ownerUid.trim()
      : undefined;
  const consentedAt =
    typeof preference?.consentedAt === 'string' &&
    !Number.isNaN(new Date(preference.consentedAt).getTime())
      ? preference.consentedAt
      : undefined;
  const consentVersion =
    preference?.consentVersion === CLOUD_PROGRESS_SYNC_CONSENT_VERSION
      ? preference.consentVersion
      : undefined;

  return {
    ...(consentedAt ? { consentedAt } : {}),
    ...(consentVersion ? { consentVersion } : {}),
    enabled: Boolean(
      preference?.enabled && ownerUid && consentedAt && consentVersion,
    ),
    ...(ownerUid ? { ownerUid } : {}),
  } satisfies CloudProgressSyncPreference;
}

function notifyParentSettingsChanged(settings: ParentSettings) {
  for (const listener of parentSettingsListeners) {
    try {
      listener(settings);
    } catch {
      // Settings listeners should not break persistence.
    }
  }
}

function normalizeLearningMode(value: unknown): LearningMode {
  return value === 'expanded' || value === 'challenge' ? value : 'core';
}

function normalizeAppLanguage(value: unknown): AppLanguage {
  if (value === 'en' || value === 'vi') {
    return value;
  }
  return detectDeviceLanguage();
}

function normalizeEnglishAccent(value: unknown): EnglishAccent {
  return isEnglishAccent(value) ? value : DEFAULT_ENGLISH_ACCENT;
}

function normalizeTeacherPromptMode(value: unknown): TeacherPromptMode {
  if (value === 'en' || value === 'vi' || value === 'bilingual') {
    return value;
  }
  return detectDeviceLanguage();
}

function normalizeAppTheme(value: unknown): AppTheme {
  return value === 'light' || value === 'dark' ? value : 'system';
}

function normalizeChildProfile(value: unknown): ChildProfile {
  const profile = value as Partial<ChildProfile> | undefined;
  if (!profile || typeof profile !== 'object') {
    return defaultChildProfile;
  }
  return {
    name: typeof profile.name === 'string' && profile.name.trim().length > 0
      ? profile.name.trim()
      : defaultChildProfile.name,
    avatarEmoji: typeof profile.avatarEmoji === 'string' && profile.avatarEmoji.length > 0
      ? profile.avatarEmoji
      : defaultChildProfile.avatarEmoji,
    birthYear: typeof profile.birthYear === 'number' && !Number.isNaN(profile.birthYear)
      ? profile.birthYear
      : undefined,
  };
}
