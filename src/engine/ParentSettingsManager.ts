import AsyncStorage from '@react-native-async-storage/async-storage';

import type { LearningMode } from '../types/lesson';

const PARENT_SETTINGS_STORAGE_KEY = '@skidsenglish/parent-settings/v1';

export type ParentSettings = {
  enableSceneEditor?: boolean;
  hasCompletedOnboarding: boolean;
  learningMode: LearningMode;
  updatedAt?: string;
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
  learningMode: 'core',
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
    learningMode: normalizeLearningMode(settings.learningMode),
    updatedAt:
      typeof settings.updatedAt === 'string' ? settings.updatedAt : undefined,
  };
}

function normalizeLearningMode(value: unknown): LearningMode {
  return value === 'expanded' || value === 'challenge' ? value : 'core';
}
