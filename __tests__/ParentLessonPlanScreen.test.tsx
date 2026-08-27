import React from 'react';
import { Alert } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';

const mockGetParentSettings = jest.fn();
const mockSaveParentSettings = jest.fn();
const mockGetProgress = jest.fn();
const mockSaveActiveThemeId = jest.fn();
const mockAddListener = jest.fn();
const mockDispatch = jest.fn();
const mockGoBack = jest.fn();
const mockReplace = jest.fn();

jest.mock('../src/engine/ParentAccessSession', () => ({
  useParentAccessSnapshot: () => ({ isGranted: true }),
}));

jest.mock('../src/engine/ParentSettingsManager', () => {
  const actual = jest.requireActual('../src/engine/ParentSettingsManager');
  return {
    ...actual,
    getParentSettings: () => mockGetParentSettings(),
    saveParentSettings: (settings: unknown) => mockSaveParentSettings(settings),
  };
});

jest.mock('../src/engine/ProgressManager', () => {
  const actual = jest.requireActual('../src/engine/ProgressManager');
  return {
    ...actual,
    getProgress: () => mockGetProgress(),
    saveActiveThemeId: (themeId: string) =>
      mockSaveActiveThemeId(themeId),
  };
});

jest.mock('../src/i18n', () => {
  const actual = jest.requireActual('../src/i18n');
  return {
    ...actual,
    useI18n: () => actual.createTranslator('vi'),
    useSavedAppLanguage: () => 'vi',
  };
});

import { ParentLessonPlanScreen } from '../src/screens/ParentLessonPlanScreen';
import { lessons } from '../src/data/lessons';
import { DEFAULT_THEME_ID, themes } from '../src/data/themes';

function createScreen() {
  return ReactTestRenderer.create(
    <ParentLessonPlanScreen
      navigation={
        {
          goBack: mockGoBack,
          addListener: mockAddListener,
          dispatch: mockDispatch,
          replace: mockReplace,
        } as never
      }
      route={{ key: 'lesson-plan', name: 'ParentLessonPlan' }}
    />,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetParentSettings.mockResolvedValue({ visibleLessonIds: undefined });
  mockGetProgress.mockResolvedValue({ activeThemeId: DEFAULT_THEME_ID });
  mockSaveParentSettings.mockResolvedValue({});
  mockSaveActiveThemeId.mockResolvedValue({});
  mockAddListener.mockReturnValue(jest.fn());
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('enables Save changes only after the draft changes', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await act(async () => {
    renderer = createScreen();
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(
    renderer!.root.findByProps({ accessibilityLabel: 'Lưu thay đổi' }).props
      .accessibilityState,
  ).toEqual({ disabled: true });

  const suggestedPreset = renderer!.root.findByProps({
    accessibilityLabel: 'Gợi ý',
  });
  act(() => suggestedPreset.props.onPress());

  expect(mockSaveParentSettings).not.toHaveBeenCalled();
  expect(
    renderer!.root.findByProps({ children: '5 bài đang bật' }),
  ).toBeTruthy();
  expect(
    renderer!.root.findByProps({ accessibilityLabel: 'Lưu thay đổi' }).props
      .accessibilityState,
  ).toEqual({ disabled: false });

  const doneButton = renderer!.root.findByProps({
    accessibilityLabel: 'Lưu thay đổi',
  });
  await act(async () => {
    doneButton.props.onPress();
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(mockSaveParentSettings).toHaveBeenCalledWith({
    visibleLessonIds: [
      'morning-routine',
      'supermarket-trip',
      'my-body',
      'plant-a-seed',
      'feed-the-puppy',
    ],
  });
  expect(mockGoBack).toHaveBeenCalledTimes(1);
});

test('turns off a theme without losing its lesson choices and moves the active map on save', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await act(async () => {
    renderer = createScreen();
    await Promise.resolve();
    await Promise.resolve();
  });

  const disabledTheme = themes[0];
  const nextTheme = themes[1];
  const switchControl = renderer!.root.findByProps({
    accessibilityLabel: `Tắt chủ đề ${disabledTheme.titleVi}`,
  });

  act(() => switchControl.props.onValueChange(false));

  expect(
    renderer!.root.findByProps({
      children: `${lessons.length - disabledTheme.lessonIds.length} bài đang bật`,
    }),
  ).toBeTruthy();
  expect(
    renderer!.root.findByProps({
      children: `Khi lưu, bản đồ của bé sẽ chuyển sang “${nextTheme.titleVi}”.`,
    }),
  ).toBeTruthy();

  await act(async () => {
    renderer!.root
      .findByProps({ accessibilityLabel: 'Lưu thay đổi' })
      .props.onPress();
    await Promise.resolve();
    await Promise.resolve();
  });

  const savedUpdate = mockSaveParentSettings.mock.calls[0][0];
  expect(savedUpdate.disabledThemeIds).toEqual([disabledTheme.id]);
  expect(savedUpdate.visibleLessonIds).toHaveLength(lessons.length);
  expect(savedUpdate.visibleLessonIds).toEqual(
    expect.arrayContaining(disabledTheme.lessonIds),
  );
  expect(mockSaveActiveThemeId).toHaveBeenCalledWith(nextTheme.id);
  expect(mockGoBack).toHaveBeenCalledTimes(1);
});

test('keeps the switch for the final enabled theme disabled', async () => {
  const finalTheme = themes[themes.length - 1];
  mockGetParentSettings.mockResolvedValue({
    disabledThemeIds: themes.slice(0, -1).map(theme => theme.id),
    visibleLessonIds: undefined,
  });
  mockGetProgress.mockResolvedValue({ activeThemeId: finalTheme.id });
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await act(async () => {
    renderer = createScreen();
    await Promise.resolve();
    await Promise.resolve();
  });

  const finalThemeSwitch = renderer!.root.findByProps({
    accessibilityLabel: `Tắt chủ đề ${finalTheme.titleVi}`,
  });
  expect(finalThemeSwitch.props.disabled).toBe(true);
  expect(finalThemeSwitch.props.accessibilityHint).toBe(
    'Luôn giữ ít nhất 1 chủ đề cho bé.',
  );
});

test('uses a dedicated balanced control to collapse the lesson list', async () => {
  const alertSpy = jest
    .spyOn(Alert, 'alert')
    .mockImplementation(() => undefined);
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await act(async () => {
    renderer = createScreen();
    await Promise.resolve();
    await Promise.resolve();
  });

  const collapseControl = renderer!.root.findByProps({
    accessibilityLabel: 'Ẩn danh sách bài',
  });
  expect(collapseControl.props.accessibilityState).toEqual({
    expanded: true,
  });

  act(() => collapseControl.props.onPress());

  expect(
    renderer!.root.findAllByProps({
      accessibilityLabel: 'Buổi sáng của bé',
    }),
  ).toHaveLength(0);
  expect(
    renderer!.root.findByProps({ accessibilityLabel: 'Xem 11 bài' }),
  ).toBeTruthy();
  expect(
    renderer!.root.findByProps({ accessibilityLabel: 'Lưu thay đổi' }).props
      .accessibilityState,
  ).toEqual({ disabled: true });

  const preventDefault = jest.fn();
  act(() => {
    getLatestBeforeRemoveListener()({
      data: { action: { type: 'GO_BACK' } },
      preventDefault,
    });
  });
  expect(preventDefault).not.toHaveBeenCalled();
  expect(alertSpy).not.toHaveBeenCalled();
});

test('asks before leaving with unsaved changes and can discard the draft', async () => {
  const alertSpy = jest
    .spyOn(Alert, 'alert')
    .mockImplementation(() => undefined);
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await act(async () => {
    renderer = createScreen();
    await Promise.resolve();
    await Promise.resolve();
  });

  act(() => {
    renderer!.root
      .findByProps({ accessibilityLabel: 'Gợi ý' })
      .props.onPress();
  });

  const beforeRemoveListener = getLatestBeforeRemoveListener();
  const navigationAction = { type: 'GO_BACK' };
  const preventDefault = jest.fn();
  act(() => {
    beforeRemoveListener({
      data: { action: navigationAction },
      preventDefault,
    });
  });

  expect(preventDefault).toHaveBeenCalledTimes(1);
  expect(alertSpy).toHaveBeenCalledWith(
    'Bỏ thay đổi?',
    'Những điều chỉnh trong lộ trình chưa được lưu.',
    expect.any(Array),
  );

  const buttons = alertSpy.mock.calls[0][2] ?? [];
  const discardButton = buttons.find(button => button.text === 'Bỏ thay đổi');
  act(() => discardButton?.onPress?.());

  expect(mockDispatch).toHaveBeenCalledWith(navigationAction);
  expect(mockSaveParentSettings).not.toHaveBeenCalled();
});

test('protects the final selected lesson in each theme', async () => {
  mockGetParentSettings.mockResolvedValue({
    visibleLessonIds: [
      'morning-routine',
      'supermarket-trip',
      'my-body',
      'plant-a-seed',
      'feed-the-puppy',
    ],
  });
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await act(async () => {
    renderer = createScreen();
    await Promise.resolve();
    await Promise.resolve();
  });

  const requiredLesson = renderer!.root.findByProps({
    accessibilityLabel: 'Buổi sáng của bé',
  });
  expect(requiredLesson.props.accessibilityState).toEqual({
    checked: true,
    disabled: true,
  });

  const secondLesson = renderer!.root.findByProps({
    accessibilityLabel: 'Ở Trường Của Bé',
  });
  act(() => secondLesson.props.onPress());

  expect(
    renderer!.root.findByProps({
      accessibilityLabel: 'Buổi sáng của bé',
    }).props.accessibilityState,
  ).toEqual({ checked: true, disabled: false });
});

function getLatestBeforeRemoveListener() {
  const registration = [...mockAddListener.mock.calls]
    .reverse()
    .find(([eventName]) => eventName === 'beforeRemove');

  if (!registration) {
    throw new Error('beforeRemove listener was not registered');
  }

  return registration[1] as (event: {
    data: { action: { type: string } };
    preventDefault: () => void;
  }) => void;
}
