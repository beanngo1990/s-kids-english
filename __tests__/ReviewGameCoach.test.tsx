import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';

import { ReviewGameCoach } from '../src/components/ReviewGameCoach';
import { MascotImage } from '../src/components/mascot';
import { ProgressStars } from '../src/components/ProgressStars';
import { SparkleEffect } from '../src/components/SparkleEffect';

jest.mock('../src/components/mascot', () => ({
  MascotImage: jest.fn(() => null),
}));

jest.mock('../src/components/SparkleEffect', () => ({
  SparkleEffect: jest.fn(() => null),
}));

jest.mock('../src/i18n', () => ({
  useI18n: () => (key: string, params?: Record<string, string>) => {
    if (key === 'reviewGame.coachCorrect') {
      return 'Tuyệt lắm!';
    }
    if (key === 'reviewGame.coachSpeaking') {
      return 'Sungy đang hướng dẫn…';
    }
    if (key === 'reviewGame.coachTryAgain') {
      return 'Gần đúng rồi, thử lại nhé!';
    }
    if (key === 'reviewGame.progressAccessibility') {
      return `Đã hoàn thành ${params?.completed} trên ${params?.total} từ ôn tập`;
    }

    return key;
  },
}));

describe('ReviewGameCoach', () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  afterEach(() => {
    act(() => {
      renderer?.unmount();
    });
    renderer = undefined;
    jest.clearAllMocks();
  });

  function renderCoach(
    props: Partial<React.ComponentProps<typeof ReviewGameCoach>> = {},
  ) {
    let nextRenderer: ReactTestRenderer.ReactTestRenderer;

    act(() => {
      nextRenderer = ReactTestRenderer.create(
        <ReviewGameCoach
          completed={2}
          prompt="Chọn một tấm thẻ nhé!"
          reduceMotion={false}
          total={4}
          {...props}
        />,
      );
    });

    renderer = nextRenderer!;
    return nextRenderer!;
  }

  it('shows the game prompt, progress accessibility, detail, and action', () => {
    const tree = renderCoach({
      action: <Text>Nghe lại</Text>,
      detail: '2/4 cặp',
    });

    expect(getTextValues(tree)).toEqual(
      expect.arrayContaining(['Chọn một tấm thẻ nhé!', '2/4 cặp', 'Nghe lại']),
    );
    expect(tree.root.findByType(MascotImage).props.pose).toBe('learn');

    const progress = tree.root.findByType(ProgressStars);
    expect(progress.props).toMatchObject({
      accessibilityLabel: 'Đã hoàn thành 2 trên 4 từ ôn tập',
      completed: 2,
      size: 'sm',
      total: 4,
    });
    expect(
      tree.root.findByProps({ accessibilityRole: 'progressbar' }).props
        .accessibilityLabel,
    ).toBe('Đã hoàn thành 2 trên 4 từ ôn tập');
    expect(
      tree.root.findByProps({ accessibilityRole: 'progressbar' }).props
        .accessibilityValue,
    ).toEqual({
      max: 4,
      min: 0,
      now: 2,
    });
  });

  it.each([
    {
      feedback: 'correct' as const,
      message: 'Tuyệt lắm!',
      pose: 'greatJob',
      sparkleActive: true,
    },
    {
      feedback: 'wrong' as const,
      message: 'Gần đúng rồi, thử lại nhé!',
      pose: 'tryAgain',
      sparkleActive: false,
    },
  ])(
    'shows the $feedback coach message and visual state',
    ({ feedback, message, pose, sparkleActive }) => {
      const tree = renderCoach({ feedback });

      expect(getTextValues(tree)).toContain(message);
      expect(tree.root.findByType(MascotImage).props.pose).toBe(pose);
      expect(tree.root.findByType(SparkleEffect).props.active).toBe(
        sparkleActive,
      );
    },
  );

  it('keeps correct feedback but disables sparkle with Reduced Motion', () => {
    const tree = renderCoach({ feedback: 'correct', reduceMotion: true });

    expect(getTextValues(tree)).toContain('Tuyệt lắm!');
    expect(tree.root.findByType(MascotImage).props.pose).toBe('greatJob');
    expect(tree.root.findByType(SparkleEffect).props.active).toBe(false);
  });
});

function getTextValues(tree: ReactTestRenderer.ReactTestRenderer) {
  return tree.root
    .findAllByType(Text)
    .flatMap(node => flattenText(node.props.children));
}

function flattenText(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value];
  }

  if (typeof value === 'number') {
    return [String(value)];
  }

  if (Array.isArray(value)) {
    return value.flatMap(flattenText);
  }

  return [];
}
