import React from 'react';
import { Pressable } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';

import { ListenChooseGame, type ListenChooseItem } from '../src/games/listenChoose/ListenChooseGame';
import { playCorrectSound, playWrongSound, speakWord } from '../src/engine/AudioManager';

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
      node => node.props.accessibilityLabel === 'slide' && typeof node.props.onPress === 'function',
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

  it('triggers correct sound, onMatch, and advances to onComplete when all targets answered', () => {
    const onCompleteMock = jest.fn();
    const onMatchMock = jest.fn();
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
      node => node.props.accessibilityLabel === 'swing' && typeof node.props.onPress === 'function',
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
});
