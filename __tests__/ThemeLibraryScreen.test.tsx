import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

import { lessons } from '../src/data/lessons';
import { DEFAULT_THEME_ID, themes } from '../src/data/themes';
import {
  resetParentSettings,
  saveParentSettings,
} from '../src/engine/ParentSettingsManager';
import {
  getProgress,
  resetProgress,
  saveProgress,
} from '../src/engine/ProgressManager';
import { playTapSound } from '../src/engine/AudioManager';
import { ThemeLibraryScreen } from '../src/screens/ThemeLibraryScreen';
import { getSceneProgressId } from '../src/utils/lessonProgress';

jest.mock('../src/engine/AudioManager', () => ({
  playTapSound: jest.fn(() => Promise.resolve()),
  speakVi: jest.fn(() => Promise.resolve()),
  speakWord: jest.fn(() => Promise.resolve()),
}));

jest.mock('../src/engine/MonetizationManager', () => ({
  getMonetizationSnapshot: () => ({ status: 'premium' }),
  useMonetizationSnapshot: () => ({ status: 'premium' }),
}));

beforeEach(async () => {
  jest.clearAllMocks();
  await resetParentSettings();
  await resetProgress();
});

test('uses a compact start state before the first station', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <ThemeLibraryScreen
        navigation={{ navigate: jest.fn() } as never}
        route={{ key: 'ThemeLibrary', name: 'ThemeLibrary' } as never}
      />,
    );
    await flushPromises();
  });

  const renderedText = getRenderedText(tree);
  expect(renderedText.some(text => text.includes('Bắt đầu hành trình'))).toBe(
    true,
  );
  expect(renderedText).not.toContain(themes[0].descriptionVi);

  await ReactTestRenderer.act(() => {
    tree?.unmount();
  });
});

test('separates the current journey from a compact theme grid', async () => {
  const activeTheme = themes.find(theme => theme.id === DEFAULT_THEME_ID);
  expect(activeTheme).toBeDefined();

  const activeLessonIds = new Set(activeTheme!.lessonIds);
  const completedSceneIds = lessons
    .filter(lesson => activeLessonIds.has(lesson.id))
    .flatMap(lesson =>
      lesson.scenes.map(scene => getSceneProgressId(lesson.id, scene.id)),
    );
  const initialProgress = await getProgress();
  await saveProgress({
    ...initialProgress,
    activeThemeId: DEFAULT_THEME_ID,
    completedSceneIds,
  });

  const navigate = jest.fn();
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <ThemeLibraryScreen
        navigation={{ navigate } as never}
        route={{ key: 'ThemeLibrary', name: 'ThemeLibrary' } as never}
      />,
    );
    await flushPromises();
  });

  const renderedText = getRenderedText(tree);
  expect(renderedText).toContain('Bé muốn khám phá gì?');
  expect(renderedText).toContain('Hành trình của bé');
  expect(renderedText).toContain('Khám phá thêm');
  expect(renderedText.some(text => text.includes('Đã hoàn thành'))).toBe(true);
  expect(renderedText.some(text => text.includes('Xem lại bản đồ'))).toBe(true);
  expect(renderedText).not.toContain('Ghi chú cho phụ huynh');

  expect(
    tree?.root.findByProps({ testID: 'theme-library-current' }),
  ).toBeDefined();
  const themeCardIds = new Set(
    tree?.root
      .findAll(
        node =>
          typeof node.props.testID === 'string' &&
          node.props.testID.startsWith('theme-library-card-'),
      )
      .map(node => node.props.testID as string) ?? [],
  );
  expect(themeCardIds.size).toBe(themes.length - 1);
  expect(
    tree?.root.findAllByProps({
      testID: `theme-library-card-${DEFAULT_THEME_ID}`,
    }),
  ).toHaveLength(0);

  const nextTheme = themes.find(theme => theme.id !== DEFAULT_THEME_ID);
  const nextThemeCard = tree?.root
    .findAllByProps({
      testID: `theme-library-card-${nextTheme?.id}`,
    })
    .find(node => typeof node.props.onPress === 'function');
  await ReactTestRenderer.act(async () => {
    nextThemeCard?.props.onPress();
    await flushPromises();
  });

  expect(navigate).toHaveBeenCalledWith('Home');
  expect(playTapSound).toHaveBeenCalledTimes(1);
  expect((await getProgress()).activeThemeId).toBe(nextTheme?.id);

  await ReactTestRenderer.act(() => {
    tree?.unmount();
  });
});

test('hides disabled themes and falls back when the active theme is off', async () => {
  await saveParentSettings({ disabledThemeIds: [DEFAULT_THEME_ID] });
  const fallbackTheme = themes.find(theme => theme.id !== DEFAULT_THEME_ID);
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <ThemeLibraryScreen
        navigation={{ navigate: jest.fn() } as never}
        route={{ key: 'ThemeLibrary', name: 'ThemeLibrary' } as never}
      />,
    );
    await flushPromises();
  });

  const currentCard = tree?.root.findByProps({
    testID: 'theme-library-current',
  });
  expect(currentCard?.props.accessibilityLabel).toContain(
    fallbackTheme?.titleVi,
  );
  expect(
    tree?.root.findAllByProps({
      testID: `theme-library-card-${DEFAULT_THEME_ID}`,
    }),
  ).toHaveLength(0);
  const themeCardIds = new Set(
    tree?.root
      .findAll(
        node =>
          typeof node.props.testID === 'string' &&
          node.props.testID.startsWith('theme-library-card-'),
      )
      .map(node => node.props.testID as string) ?? [],
  );
  expect(themeCardIds.size).toBe(themes.length - 2);

  await ReactTestRenderer.act(() => {
    tree?.unmount();
  });
});

function getRenderedText(
  tree: ReactTestRenderer.ReactTestRenderer | undefined,
) {
  return (
    tree?.root
      .findAllByType(Text)
      .map(node => flattenText(node.props.children)) ?? []
  );
}

function flattenText(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(flattenText).join('');
  }

  if (typeof value === 'number' || typeof value === 'string') {
    return String(value);
  }

  return '';
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}
