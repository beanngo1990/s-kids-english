import AsyncStorage from '@react-native-async-storage/async-storage';

import { getParentSettings } from '../src/engine/ParentSettingsManager';
import { themes } from '../src/data/themes';

const PARENT_SETTINGS_STORAGE_KEY = '@skidsenglish/parent-settings/v1';

beforeEach(async () => {
  await AsyncStorage.clear();
});

test('keeps all lessons visible when no custom lesson plan is stored', async () => {
  const settings = await getParentSettings();

  expect(settings.visibleLessonIds).toBeUndefined();
});

test('adds the first lesson of a newly cataloged theme to an existing custom plan', async () => {
  const previousThemeLessonIds = themes
    .slice(0, -1)
    .flatMap(theme => theme.lessonIds);
  const newTheme = themes[themes.length - 1];

  await AsyncStorage.setItem(
    PARENT_SETTINGS_STORAGE_KEY,
    JSON.stringify({ visibleLessonIds: previousThemeLessonIds }),
  );

  const settings = await getParentSettings();

  expect(settings.visibleLessonIds).toEqual([
    ...previousThemeLessonIds,
    newTheme.lessonIds[0],
  ]);
});

test('preserves a custom lesson choice when the theme already has one visible lesson', async () => {
  const selectedLessonIds = themes.map(theme => theme.lessonIds[1]);

  await AsyncStorage.setItem(
    PARENT_SETTINGS_STORAGE_KEY,
    JSON.stringify({ visibleLessonIds: selectedLessonIds }),
  );

  await expect(getParentSettings()).resolves.toMatchObject({
    visibleLessonIds: selectedLessonIds,
  });
});
