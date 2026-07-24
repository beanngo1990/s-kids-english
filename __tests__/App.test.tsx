/**
 * @format
 */

import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

import { lessons } from '../src/data/lessons';
import { DEFAULT_THEME_ID } from '../src/data/themes';
import { FREE_LESSON_IDS } from '../src/engine/ContentAccessPolicy';
import {
  resetProgress,
  saveProgress,
  type LocalProgress,
} from '../src/engine/ProgressManager';
import { HomeScreen } from '../src/screens/HomeScreen';
import { OnboardingScreen } from '../src/screens/OnboardingScreen';
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
