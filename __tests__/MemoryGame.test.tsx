import React from 'react';
import { AccessibilityInfo, Animated } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';

import {
  MemoryGame,
  getMemoryGridLayout,
  type MemoryGameItem,
} from '../src/games/memory/MemoryGame';
import {
  playCorrectSound,
  playTapSound,
  playWrongSound,
  speakWord,
} from '../src/engine/AudioManager';
import { getResponsiveLayout } from '../src/theme/responsive';

jest.mock('../src/engine/AudioManager', () => ({
  playCorrectSound: jest.fn(() => Promise.resolve()),
  playTapSound: jest.fn(() => Promise.resolve()),
  playWrongSound: jest.fn(() => Promise.resolve()),
  speakWord: jest.fn(() => Promise.resolve()),
}));

const mockItems: MemoryGameItem[] = [
  {
    id: 'vocab-swing',
    imageSource: { uri: 'file://swing.png' },
    meaningVi: 'xích đu',
    word: 'swing',
  },
  {
    id: 'vocab-slide',
    imageSource: { uri: 'file://slide.png' },
    meaningVi: 'cầu trượt',
    word: 'slide',
  },
];

const mockReduceMotion =
  AccessibilityInfo.isReduceMotionEnabled as jest.MockedFunction<
    typeof AccessibilityInfo.isReduceMotionEnabled
  >;

describe('MemoryGame', () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockReduceMotion.mockResolvedValue(false);
  });

  afterEach(() => {
    act(() => {
      renderer?.unmount();
      renderer = null;
      jest.clearAllTimers();
    });
    jest.useRealTimers();
  });

  async function renderGame(
    props: Partial<React.ComponentProps<typeof MemoryGame>> = {},
  ) {
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <MemoryGame items={mockItems} onComplete={jest.fn()} {...props} />,
      );
      await Promise.resolve();
    });

    return renderer;
  }

  function pressCard(cardId: string) {
    act(() => {
      renderer!.root
        .findByProps({ testID: `memory-card-${cardId}` })
        .props.onPress();
    });
  }

  it('keeps every card at the same fixed grid width', () => {
    const phoneLayout = getMemoryGridLayout(8, getResponsiveLayout(390, 844));

    expect(phoneLayout.columnCount).toBe(3);
    expect(phoneLayout.cardStyle.flexGrow).toBe(0);
    expect(phoneLayout.cardStyle.flexShrink).toBe(0);
    expect(phoneLayout.cardStyle.width).toBe(phoneLayout.cardStyle.flexBasis);
  });

  it('ignores card taps while the intro is playing', async () => {
    await renderGame({ isIntroPlaying: true });

    pressCard('vocab-swing-a');

    expect(playTapSound).not.toHaveBeenCalled();
    expect(speakWord).not.toHaveBeenCalled();
  });

  it('shows and resolves a matching pair', async () => {
    const onMatch = jest.fn(() => Promise.resolve());
    await renderGame({ onMatch });

    pressCard('vocab-swing-a');
    pressCard('vocab-swing-b');

    expect(playCorrectSound).toHaveBeenCalledTimes(1);
    expect(playWrongSound).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(420);
      await Promise.resolve();
    });

    expect(onMatch).toHaveBeenCalledWith('vocab-swing', true);
    expect(
      renderer!.root.findByProps({ testID: 'memory-card-vocab-swing-a' }).props
        .accessibilityState.selected,
    ).toBe(true);
  });

  it('keeps the board interactive when progress persistence is still pending', async () => {
    const onMatch = jest.fn(() => new Promise<void>(() => undefined));
    await renderGame({ onMatch });

    pressCard('vocab-swing-a');
    pressCard('vocab-swing-b');

    await act(async () => {
      jest.advanceTimersByTime(420);
      await Promise.resolve();
    });

    pressCard('vocab-slide-a');

    expect(playTapSound).toHaveBeenCalledTimes(3);
    expect(
      renderer!.root.findByProps({ testID: 'memory-card-vocab-slide-a' }).props
        .accessibilityState.selected,
    ).toBe(true);
  });

  it('marks both words missed and closes a wrong pair', async () => {
    const onMatch = jest.fn(() => Promise.resolve());
    await renderGame({ onMatch });

    pressCard('vocab-swing-a');
    pressCard('vocab-slide-a');

    expect(playWrongSound).toHaveBeenCalledTimes(1);
    expect(
      renderer!.root.findByProps({ testID: 'memory-card-vocab-swing-a' }).props
        .accessibilityState.selected,
    ).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(820);
      await Promise.resolve();
    });

    expect(
      renderer!.root.findByProps({ testID: 'memory-card-vocab-swing-a' }).props
        .accessibilityState.selected,
    ).toBe(false);

    pressCard('vocab-swing-a');
    pressCard('vocab-swing-b');
    await act(async () => {
      jest.advanceTimersByTime(420);
      await Promise.resolve();
    });

    expect(onMatch).toHaveBeenCalledWith('vocab-swing', false);
  });

  it('waits for the final celebration and completes only once', async () => {
    const onComplete = jest.fn();
    const onMatch = jest.fn(() => Promise.resolve());
    await renderGame({
      items: [mockItems[0]],
      onComplete,
      onMatch,
    });

    pressCard('vocab-swing-a');
    pressCard('vocab-swing-b');

    await act(async () => {
      jest.advanceTimersByTime(420);
      await Promise.resolve();
    });
    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(649);
    });
    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1_001);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('snaps card state without flip animation when Reduce Motion is on', async () => {
    mockReduceMotion.mockResolvedValue(true);
    const timingSpy = jest.spyOn(Animated, 'timing');
    await renderGame();

    timingSpy.mockClear();
    pressCard('vocab-swing-a');

    expect(timingSpy).not.toHaveBeenCalled();
    timingSpy.mockRestore();
  });
});
