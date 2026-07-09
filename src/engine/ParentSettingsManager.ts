import AsyncStorage from '@react-native-async-storage/async-storage';

import type { LearningMode } from '../types/lesson';

const PARENT_SETTINGS_STORAGE_KEY = '@skidsenglish/parent-settings/v1';

export type AppLanguage = 'vi' | 'en';
export type AppTheme = 'light' | 'dark' | 'system';

export type ChildProfile = {
  name: string;
  avatarEmoji: string;
  birthYear?: number;
};

export const AVATAR_EMOJI_OPTIONS = [
  '🧒', '👦', '👧', '🐰', '🦊', '🐻', '🐼', '🦁', '🌟', '🦄', '🐬', '🦋',
] as const;

export const defaultChildProfile: ChildProfile = {
  name: 'Bé yêu',
  avatarEmoji: '🧒',
};

export type ParentSettings = {
  enableSceneEditor?: boolean;
  hasCompletedOnboarding: boolean;
  journeyMode: 'guided' | 'free';
  learningMode: LearningMode;
  updatedAt?: string;
  visibleLessonIds?: string[]; // If undefined, all lessons are visible
  appLanguage: AppLanguage;
  appTheme: AppTheme;
  reminderEnabled: boolean;
  reminderTime: string; // e.g. "19:30"
  childProfile: ChildProfile;
};

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

export const defaultParentSettings: ParentSettings = {
  enableSceneEditor: false,
  hasCompletedOnboarding: false,
  journeyMode: 'guided',
  learningMode: 'core',
  appLanguage: 'vi',
  appTheme: 'system',
  reminderEnabled: false,
  reminderTime: '19:30',
  childProfile: defaultChildProfile,
};

export async function getParentSettings(): Promise<ParentSettings> {
  const rawSettings = await AsyncStorage.getItem(PARENT_SETTINGS_STORAGE_KEY);

  if (!rawSettings) {
    return defaultParentSettings;
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

  return {
    enableSceneEditor: Boolean(settings.enableSceneEditor),
    hasCompletedOnboarding: Boolean(settings.hasCompletedOnboarding),
    journeyMode: settings.journeyMode === 'free' ? 'free' : 'guided',
    learningMode: normalizeLearningMode(settings.learningMode),
    updatedAt:
      typeof settings.updatedAt === 'string' ? settings.updatedAt : undefined,
    visibleLessonIds: Array.isArray(settings.visibleLessonIds)
      ? settings.visibleLessonIds.filter(id => typeof id === 'string')
      : undefined,
    appLanguage: normalizeAppLanguage(settings.appLanguage),
    appTheme: normalizeAppTheme(settings.appTheme),
    reminderEnabled: Boolean(settings.reminderEnabled),
    reminderTime:
      typeof settings.reminderTime === 'string' ? settings.reminderTime : '19:30',
    childProfile: normalizeChildProfile(settings.childProfile),
  };
}

function normalizeLearningMode(value: unknown): LearningMode {
  return value === 'expanded' || value === 'challenge' ? value : 'core';
}

function normalizeAppLanguage(value: unknown): AppLanguage {
  return value === 'en' ? 'en' : 'vi';
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
