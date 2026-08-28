import AsyncStorage from '@react-native-async-storage/async-storage';

import { getParentSettings } from '../src/engine/ParentSettingsManager';
import { themes } from '../src/data/themes';

const PARENT_SETTINGS_STORAGE_KEY = '@skidsenglish/parent-settings/v1';

beforeEach(async () => {
  await AsyncStorage.clear();
});

test('keeps all lessons visible when no custom lesson plan is stored', async () => {
  const settings = await getParentSettings();

  expect(settings.disabledThemeIds).toBeUndefined();
  expect(settings.visibleLessonIds).toBeUndefined();
});

test('normalizes disabled themes and always leaves one theme available', async () => {
  await AsyncStorage.setItem(
    PARENT_SETTINGS_STORAGE_KEY,
    JSON.stringify({
      disabledThemeIds: [
        'unknown-theme',
        ...themes.map(theme => theme.id),
        themes[1].id,
      ],
    }),
  );

  const settings = await getParentSettings();

  expect(settings.disabledThemeIds).toEqual(
    themes.slice(1).map(theme => theme.id),
  );
});

test('keeps lesson choices for a disabled theme so they can be restored', async () => {
  const selectedLessonIds = themes.map(
    theme => theme.lessonIds[1] ?? theme.lessonIds[0],
  );

  await AsyncStorage.setItem(
    PARENT_SETTINGS_STORAGE_KEY,
    JSON.stringify({
      disabledThemeIds: [themes[0].id],
      visibleLessonIds: selectedLessonIds,
    }),
  );

  await expect(getParentSettings()).resolves.toMatchObject({
    disabledThemeIds: [themes[0].id],
    visibleLessonIds: selectedLessonIds,
  });
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

test('preserves a custom lesson choice when every theme already has one visible lesson', async () => {
  const selectedLessonIds = themes.map(
    theme => theme.lessonIds[1] ?? theme.lessonIds[0],
  );

  await AsyncStorage.setItem(
    PARENT_SETTINGS_STORAGE_KEY,
    JSON.stringify({ visibleLessonIds: selectedLessonIds }),
  );

  await expect(getParentSettings()).resolves.toMatchObject({
    visibleLessonIds: selectedLessonIds,
  });
});
