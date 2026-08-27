/**
 * @format
 */

import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

import { SKidsIcon } from '../src/components/SKidsIcon';
import { lessons } from '../src/data/lessons';
import { DEFAULT_THEME_ID } from '../src/data/themes';
import { FREE_LESSON_IDS } from '../src/engine/ContentAccessPolicy';
import { resetParentSettings } from '../src/engine/ParentSettingsManager';
import {
  resetProgress,
  saveProgress,
  type LocalProgress,
} from '../src/engine/ProgressManager';
import { hasSceneVocabularyVisuals } from '../src/engine/VocabularyVisualResolver';
import { HomeScreen } from '../src/screens/HomeScreen';
import { OnboardingScreen } from '../src/screens/OnboardingScreen';
import { createEmptyStickerPlaygroundState } from '../src/types/stickerPlayground';
import { getSceneProgressId } from '../src/utils/lessonProgress';

let mockMonetizationStatus = 'free';

jest.mock('../src/engine/MonetizationManager', () => {
  return {
    getMonetizationSnapshot: () => ({ status: mockMonetizationStatus }),
    useMonetizationSnapshot: () => ({ status: mockMonetizationStatus }),
  };
});

beforeEach(async () => {
  mockMonetizationStatus = 'free';
  await resetParentSettings();
  await resetProgress();
});

test('renders the home screen', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <HomeScreen
        navigation={
          {
            addListener: jest.fn(() => jest.fn()),
            navigate: jest.fn(),
          } as never
        }
        route={{ key: 'Home', name: 'Home' } as never}
      />,
    );
  });

  const textValues = tree?.root
    .findAllByType(Text)
    .map(node => node.props.children);

  await ReactTestRenderer.act(() => {
    tree?.unmount();
  });

  expect(textValues).toContain('Sungy');
  expect(textValues).not.toContain('Premium');
  expect(textValues).toContain('Bản đồ');
  expect(textValues).toContain('Chơi');
  expect(textValues).not.toContain('Chơi ngay');
  expect(textValues).toContain('Ở Trường Của Bé');
  expect(textValues).toContain('Giờ Ra Chơi');
  expect(textValues).toContain('Bữa trưa của bé');
  expect(textValues).toContain('Về nhà buổi chiều');
  expect(textValues).toContain('Bữa xế của bé');
  expect(textValues).toContain('Chơi ở nhà');
  expect(textValues).toContain('Tắm rửa buổi chiều');
  expect(textValues).toContain('Bữa tối của gia đình');
  expect(textValues).toContain('Dọn dẹp sau bữa tối');
  expect(textValues).toContain('Giờ đi ngủ');
});

test('shows the Premium badge in the home header for active access', async () => {
  mockMonetizationStatus = 'premium';
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <HomeScreen
        navigation={
          {
            addListener: jest.fn(() => jest.fn()),
            navigate: jest.fn(),
          } as never
        }
        route={{ key: 'Home', name: 'Home' } as never}
      />,
    );
  });

  const hasPremiumAccessibilityLabel = tree?.root
    .findAll(
      node =>
        typeof node.props.accessibilityLabel === 'string' &&
        node.props.accessibilityLabel.includes(
          'Sungy Premium đang hoạt động',
        ),
    )
    .some(Boolean);

  await ReactTestRenderer.act(() => {
    tree?.unmount();
  });

  expect(hasPremiumAccessibilityLabel).toBe(true);
});

test('shows a progress-based Premium CTA after free lessons are complete', async () => {
  const navigate = jest.fn();
  await saveProgress(createCompletedFreeProgress());

  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <HomeScreen
        navigation={
          {
            addListener: jest.fn(() => jest.fn()),
            navigate,
          } as never
        }
        route={{ key: 'Home', name: 'Home' } as never}
      />,
    );
  });

  const textValues = getRenderedText(tree);
  expect(textValues).toContain('Hoàn thành phần miễn phí');
  expect(textValues).toContain('Bé đã sẵn sàng cho chặng tiếp theo');
  expect(textValues).toContain('Nhờ ba mẹ mở khóa');

  const ctaButton = tree?.root.find(
    node =>
      node.props.accessibilityRole === 'button' &&
      typeof node.props.accessibilityLabel === 'string' &&
      node.props.accessibilityLabel.includes(
        'Bé đã hoàn thành phần miễn phí',
      ),
  );
  ctaButton?.props.onPress();

  expect(navigate).toHaveBeenCalledWith('Parent', {
    intent: 'premium',
    lessonId: 'playtime',
  });

  await ReactTestRenderer.act(() => {
    tree?.unmount();
  });
});

test('completed map scene keeps replay and adds a direct vocabulary shortcut', async () => {
  mockMonetizationStatus = 'premium';
  const lesson = lessons.find(item =>
    item.scenes.some(scene => hasSceneVocabularyVisuals(scene, 'core')),
  );
  const scene = lesson?.scenes.find(item =>
    hasSceneVocabularyVisuals(item, 'core'),
  );

  expect(lesson).toBeDefined();
  expect(scene).toBeDefined();
  await saveProgress({
    ...createCompletedFreeProgress(),
    activeThemeId: lesson!.themeId,
    completedLessonIds: [],
    completedReviewGameIds: [],
    completedSceneIds: [getSceneProgressId(lesson!.id, scene!.id)],
  });
  const navigate = jest.fn();
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <HomeScreen
        navigation={
          {
            addListener: jest.fn(() => jest.fn()),
            navigate,
          } as never
        }
        route={{ key: 'Home', name: 'Home' } as never}
      />,
    );
    await flushPromises();
    await flushPromises();
  });

  const shortcutLabel = `Ôn từ trong cảnh ${scene!.titleVi}`;
  const shortcut = tree?.root.findByProps({
    accessibilityLabel: shortcutLabel,
  });
  const replayAction = tree?.root
    .findAll(
      node =>
        node.props.accessibilityRole === 'button' &&
        typeof node.props.accessibilityLabel === 'string',
    )
    .find(node =>
      node.props.accessibilityLabel.includes(`Chơi lại ${scene!.titleVi}`),
    );

  expect(shortcut).toBeDefined();
  expect(replayAction).toBeDefined();
  expect(
    shortcut
      ?.findAllByType(SKidsIcon)
      .some(node => node.props.name === 'vocabularyReview'),
  ).toBe(true);

  await ReactTestRenderer.act(async () => {
    shortcut?.props.onPress();
    await flushPromises();
  });

  expect(navigate).toHaveBeenCalledWith('SceneVocabularyPlayground', {
    learningMode: 'core',
    lessonId: lesson!.id,
    sceneId: scene!.id,
  });

  await ReactTestRenderer.act(() => {
    tree?.unmount();
  });
});

test('makes the compact next-stop card and CTA share the primary action', async () => {
  const navigate = jest.fn();
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <HomeScreen
        navigation={
          {
            addListener: jest.fn(() => jest.fn()),
            navigate,
          } as never
        }
        route={{ key: 'Home', name: 'Home' } as never}
      />,
    );
    await flushPromises();
    await flushPromises();
  });

  const openHubButton = tree?.root.findByProps({
    accessibilityLabel: 'Mở chặng tiếp theo',
  });

  await ReactTestRenderer.act(() => {
    openHubButton?.props.onPress();
  });

  const textValues = getRenderedText(tree);
  const defaultThemeStopCount = lessons
    .filter(lesson => lesson.themeId === DEFAULT_THEME_ID)
    .reduce((count, lesson) => count + lesson.scenes.length, 0);
  const primaryActionLabels =
    tree?.root
      .findAllByType(Text)
      .filter(
        node =>
          flattenText(node.props.children) === 'Đi đến trạm tiếp theo',
      ) ?? [];
  const heroCardAction = tree?.root
    .findAll(
      node =>
        typeof node.props.accessibilityLabel === 'string' &&
        node.props.accessibilityLabel.startsWith(
          'Đi đến trạm tiếp theo:',
        ) &&
        typeof node.props.onPress === 'function',
    )
    .at(0);

  expect(textValues).toContain('Chặng tiếp theo');
  expect(textValues).toContain(`0/${defaultThemeStopCount} trạm`);
  expect(textValues).toContain('Hoàn thành bài để nhận sticker mới.');
  expect(textValues).toContain('Xem bộ sưu tập sticker');
  expect(textValues).not.toContain('Hôm nay mình đi đâu?');
  expect(textValues).not.toContain('Sao đã nhận');
  expect(textValues).not.toContain('Trạm còn lại');
  expect(textValues).not.toContain('Về trạm hiện tại');
  expect(primaryActionLabels).toHaveLength(1);
  expect(
    tree?.root
      .findAll(
        node =>
          node.props.accessibilityLabel === 'Đóng chặng tiếp theo' &&
          node.props.accessibilityRole === 'button',
      )
      .some(Boolean),
  ).toBe(true);

  await ReactTestRenderer.act(async () => {
    heroCardAction?.props.onPress();
    await flushPromises();
    await flushPromises();
  });

  expect(heroCardAction).toBeDefined();
  expect(navigate).toHaveBeenCalledWith(
    'ScenePlayer',
    expect.objectContaining({ learningMode: 'core' }),
  );

  await ReactTestRenderer.act(() => {
    tree?.unmount();
  });
});

test('opens a pending review when its hub card is pressed', async () => {
  const navigate = jest.fn();
  const completedFreeProgress = createCompletedFreeProgress();
  await saveProgress({
    ...completedFreeProgress,
    completedLessonIds: [],
    completedReviewGameIds: [],
  });
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <HomeScreen
        navigation={
          {
            addListener: jest.fn(() => jest.fn()),
            navigate,
          } as never
        }
        route={{ key: 'Home', name: 'Home' } as never}
      />,
    );
    await flushPromises();
    await flushPromises();
  });

  const openHubButton = tree?.root.findByProps({
    accessibilityLabel: 'Mở chặng tiếp theo',
  });
  await ReactTestRenderer.act(() => {
    openHubButton?.props.onPress();
  });

  const reviewCardAction = tree?.root
    .findAll(
      node =>
        typeof node.props.accessibilityLabel === 'string' &&
        node.props.accessibilityLabel.startsWith('Chơi ôn tập:') &&
        typeof node.props.onPress === 'function',
    )
    .at(0);

  await ReactTestRenderer.act(async () => {
    reviewCardAction?.props.onPress();
    await flushPromises();
    await flushPromises();
  });

  expect(reviewCardAction).toBeDefined();
  expect(navigate).toHaveBeenCalledWith(
    'ReviewGame',
    expect.objectContaining({ learningMode: 'core' }),
  );

  await ReactTestRenderer.act(() => {
    tree?.unmount();
  });
});

test('renders parent onboarding before first use', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <OnboardingScreen
        navigation={{ replace: jest.fn() } as never}
        route={{ key: 'Onboarding', name: 'Onboarding' } as never}
      />,
    );
  });

  const textValues = tree?.root
    .findAllByType(Text)
    .map(node => node.props.children);

  expect(textValues).toContain('Học Tiếng Anh thật vui cùng Sungy!');
  expect(textValues).toContain('Tiếp tục');

  const continueButton = tree?.root.findByProps({ title: 'Tiếp tục' });
  await ReactTestRenderer.act(() => {
    continueButton?.props.onPress();
  });

  const step2TextValues = tree?.root
    .findAllByType(Text)
    .map(node => node.props.children);

  await ReactTestRenderer.act(() => {
    tree?.unmount();
  });

  expect(step2TextValues).toContain('Chọn độ khó cho bé');
  expect(step2TextValues).toContain('Dễ');
  expect(step2TextValues).toContain('Vừa');
  expect(step2TextValues).toContain('Khó');
});

function createCompletedFreeProgress(): LocalProgress {
  const freeLessons = lessons.filter(lesson =>
    FREE_LESSON_IDS.some(lessonId => lessonId === lesson.id),
  );

  return {
    activeThemeId: DEFAULT_THEME_ID,
    completedLessonIds: [...FREE_LESSON_IDS],
    completedReviewGameIds: freeLessons
      .map(lesson => lesson.reviewGame?.id)
      .filter((id): id is string => Boolean(id)),
    completedSceneIds: freeLessons.flatMap(lesson =>
      lesson.scenes.map(scene => getSceneProgressId(lesson.id, scene.id)),
    ),
    earnedAchievementRecords: [],
    earnedStickerIds: [],
    earnedStickerRecords: [],
    learnedWordIds: [],
    stickerPlayground: createEmptyStickerPlaygroundState(),
    totalXP: 0,
    vocabularyProgress: {},
  };
}

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
