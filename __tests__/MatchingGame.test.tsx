import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';

import {
  MatchingGame,
  type MatchingItem,
} from '../src/games/matching/MatchingGame';
import {
  playCorrectSound,
  playWrongSound,
  speakWord,
} from '../src/engine/AudioManager';

jest.mock('../src/engine/AudioManager', () => ({
  playCorrectSound: jest.fn(() => Promise.resolve()),
  playTapSound: jest.fn(() => Promise.resolve()),
  playWrongSound: jest.fn(() => Promise.resolve()),
  speakWord: jest.fn(() => Promise.resolve()),
}));

const mockItems: MatchingItem[] = [
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

describe('MatchingGame', () => {
  let renderers: ReactTestRenderer.ReactTestRenderer[] = [];

  const renderWithinAct = async (element: React.ReactElement) => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(element);
      await Promise.resolve();
      await Promise.resolve();
    });

    renderers.push(renderer!);
    return renderer!;
  };

  beforeEach(() => {
    renderers = [];
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(async () => {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    act(() => {
      renderers.forEach(renderer => renderer.unmount());
      renderers = [];
      jest.clearAllTimers();
    });
    jest.useRealTimers();
  });

  it('renders correctly with 2 columns of items', async () => {
    const renderer = await renderWithinAct(
      <MatchingGame items={mockItems} onComplete={jest.fn()} />,
    );

    const cards = renderer.root.findAll(
      node =>
        node.props.accessibilityLabel === 'swing' ||
        node.props.accessibilityLabel === 'slide',
    );
    expect(cards.length).toBeGreaterThanOrEqual(4); // 2 swing cards + 2 slide cards
  });

  it('ignores card taps while the intro instruction is playing', async () => {
    const renderer = await renderWithinAct(
      <MatchingGame isIntroPlaying items={mockItems} onComplete={jest.fn()} />,
    );

    const swingCards = renderer.root.findAll(
      node =>
        node.props.accessibilityLabel === 'swing' &&
        typeof node.props.onPress === 'function',
    );
    expect(swingCards.length).toBe(2);

    act(() => {
      swingCards[0].props.onPress();
      swingCards[1].props.onPress();
    });

    expect(speakWord).not.toHaveBeenCalled();
    expect(playCorrectSound).not.toHaveBeenCalled();
  });

  it('removes selection audio in challenge mode but speaks after a match', async () => {
    const renderer = await renderWithinAct(
      <MatchingGame
        items={mockItems}
        learningMode="challenge"
        onComplete={jest.fn()}
      />,
    );
    const swingCards = renderer.root.findAll(
      node =>
        node.props.accessibilityLabel === 'swing' &&
        typeof node.props.onPress === 'function',
    );

    act(() => {
      swingCards[0].props.onPress();
    });
    expect(speakWord).not.toHaveBeenCalled();

    act(() => {
      swingCards[1].props.onPress();
    });
    expect(speakWord).toHaveBeenCalledTimes(1);
    expect(speakWord).toHaveBeenCalledWith('swing');
  });

  it('handles correct match and triggers completion when all matched', async () => {
    const onCompleteMock = jest.fn();
    const onMatchMock = jest.fn(() => {
      throw new Error('storage unavailable');
    });
    const renderer = await renderWithinAct(
      <MatchingGame
        items={mockItems}
        onComplete={onCompleteMock}
        onMatch={onMatchMock}
      />,
    );

    const swingCards = renderer.root.findAll(
      node =>
        node.props.accessibilityLabel === 'swing' &&
        typeof node.props.onPress === 'function',
    );
    expect(swingCards.length).toBe(2);

    // Tap swing image card then swing word card
    act(() => {
      swingCards[0].props.onPress();
    });

    act(() => {
      swingCards[1].props.onPress();
    });

    expect(playCorrectSound).toHaveBeenCalledTimes(1);
    expect(speakWord).toHaveBeenCalledWith('swing');
    expect(onMatchMock).toHaveBeenCalledWith('vocab-swing', true);

    const slideCards = renderer.root.findAll(
      node =>
        node.props.accessibilityLabel === 'slide' &&
        typeof node.props.onPress === 'function',
    );
    // Tap slide image card then slide word card
    act(() => {
      slideCards[0].props.onPress();
    });

    act(() => {
      slideCards[1].props.onPress();
    });

    expect(playCorrectSound).toHaveBeenCalledTimes(2);

    // Advance completion timer
    act(() => {
      jest.advanceTimersByTime(1100);
    });

    expect(onCompleteMock).toHaveBeenCalledTimes(1);
  });

  it('handles wrong match with sound and error feedback', async () => {
    const renderer = await renderWithinAct(
      <MatchingGame items={mockItems} onComplete={jest.fn()} />,
    );

    const swingCards = renderer.root.findAll(
      node =>
        node.props.accessibilityLabel === 'swing' &&
        typeof node.props.onPress === 'function',
    );
    const slideCards = renderer.root.findAll(
      node =>
        node.props.accessibilityLabel === 'slide' &&
        typeof node.props.onPress === 'function',
    );

    // Tap swing image card then slide word card (mismatch)
    act(() => {
      swingCards[0].props.onPress();
    });

    act(() => {
      slideCards[1].props.onPress();
    });

    expect(playWrongSound).toHaveBeenCalledTimes(1);
  });
});
