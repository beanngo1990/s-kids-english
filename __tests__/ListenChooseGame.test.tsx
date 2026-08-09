import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';

import {
  ListenChooseGame,
  type ListenChooseItem,
} from '../src/games/listenChoose/ListenChooseGame';
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

const mockItems: ListenChooseItem[] = [
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

const difficultyItems: ListenChooseItem[] = [
  ...mockItems,
  {
    id: 'vocab-head',
    imageSource: { uri: 'file://head.png' },
    meaningVi: 'đầu',
    word: 'head',
  },
  {
    id: 'vocab-hand',
    imageSource: { uri: 'file://hand.png' },
    meaningVi: 'bàn tay',
    word: 'hand',
  },
];

describe('ListenChooseGame', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.clearAllTimers();
    });
    jest.useRealTimers();
  });

  it('renders correctly and plays audio on mount', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <ListenChooseGame items={mockItems} onComplete={jest.fn()} />,
      );
    });

    // Advance initial 300ms audio timer
    act(() => {
      jest.advanceTimersByTime(350);
    });

    expect(speakWord).toHaveBeenCalledWith('swing');
    const cards = renderer!.root.findAll(
      node =>
        node.props.accessibilityLabel === 'swing' ||
        node.props.accessibilityLabel === 'slide',
    );
    expect(cards.length).toBeGreaterThanOrEqual(2);

    act(() => {
      renderer!.unmount();
    });
  });

  it.each([
    ['core', 2],
    ['expanded', 3],
    ['challenge', 4],
  ] as const)('shows %s mode with %i answer choices', (learningMode, count) => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <ListenChooseGame
          items={difficultyItems}
          learningMode={learningMode}
          onComplete={jest.fn()}
        />,
      );
    });

    const words = new Set(difficultyItems.map(item => item.word));
    const optionCards = renderer!.root.findAll(
      node =>
        words.has(node.props.accessibilityLabel) &&
        typeof node.props.onPress === 'function',
    );
    expect(optionCards).toHaveLength(count);

    act(() => {
      renderer!.unmount();
    });
  });

  it('waits for the intro instruction before playing the first word', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <ListenChooseGame
          isIntroPlaying
          items={mockItems}
          onComplete={jest.fn()}
        />,
      );
    });

    act(() => {
      jest.advanceTimersByTime(350);
    });
    expect(speakWord).not.toHaveBeenCalled();

    act(() => {
      renderer!.update(
        <ListenChooseGame items={mockItems} onComplete={jest.fn()} />,
      );
    });

    act(() => {
      jest.advanceTimersByTime(350);
    });

    expect(speakWord).toHaveBeenCalledWith('swing');

    act(() => {
      renderer!.unmount();
    });
  });

  it('triggers wrong sound when incorrect option is selected', () => {
    const onMatchMock = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <ListenChooseGame
          items={mockItems}
          onComplete={jest.fn()}
          onMatch={onMatchMock}
        />,
      );
    });

    // Find the slide option card (wrong answer for round 1 target 'swing')
    const slideCard = renderer!.root.find(
      node =>
        node.props.accessibilityLabel === 'slide' &&
        typeof node.props.onPress === 'function',
    );
    expect(slideCard).toBeDefined();

    act(() => {
      slideCard.props.onPress();
    });

    expect(playWrongSound).toHaveBeenCalled();
    expect(onMatchMock).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(750);
      renderer!.unmount();
    });
  });

  it('triggers correct sound and still completes if progress persistence throws', () => {
    const onCompleteMock = jest.fn();
    const onMatchMock = jest.fn(() => {
      throw new Error('storage unavailable');
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    act(() => {
      renderer = ReactTestRenderer.create(
        <ListenChooseGame
          items={[mockItems[0]]}
          onComplete={onCompleteMock}
          onMatch={onMatchMock}
        />,
      );
    });

    const swingCard = renderer!.root.find(
      node =>
        node.props.accessibilityLabel === 'swing' &&
        typeof node.props.onPress === 'function',
    );
    expect(swingCard).toBeDefined();

    act(() => {
      swingCard.props.onPress();
    });

    expect(playCorrectSound).toHaveBeenCalled();
    expect(onMatchMock).toHaveBeenCalledWith('vocab-swing', true);

    // Fast-forward transition timer (1200ms)
    act(() => {
      jest.advanceTimersByTime(1250);
      renderer!.unmount();
    });

    expect(onCompleteMock).toHaveBeenCalled();
  });

  it('resets to the first target when the item set changes', () => {
    const nextItem: ListenChooseItem = {
      id: 'vocab-head',
      imageSource: { uri: 'file://head.png' },
      meaningVi: 'đầu',
      word: 'head',
    };
    let renderer: ReactTestRenderer.ReactTestRenderer;

    act(() => {
      renderer = ReactTestRenderer.create(
        <ListenChooseGame items={mockItems} onComplete={jest.fn()} />,
      );
    });

    const swingCard = renderer!.root.find(
      node =>
        node.props.accessibilityLabel === 'swing' &&
        typeof node.props.onPress === 'function',
    );
    act(() => {
      swingCard.props.onPress();
      jest.advanceTimersByTime(1_200);
    });

    act(() => {
      renderer!.update(
        <ListenChooseGame items={[nextItem]} onComplete={jest.fn()} />,
      );
    });

    expect(
      renderer!.root.find(
        node =>
          node.props.accessibilityLabel === 'head' &&
          typeof node.props.onPress === 'function',
      ),
    ).toBeDefined();

    act(() => {
      renderer!.unmount();
    });
  });
});
