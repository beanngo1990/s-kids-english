import React from 'react';
import { Keyboard, Text, TextInput } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';

const mockGrantParentAccess = jest.fn();

jest.mock('../src/engine/ParentAccessSession', () => ({
  grantParentAccess: () => mockGrantParentAccess(),
}));

jest.mock('../src/i18n', () => {
  const actual = jest.requireActual('../src/i18n');
  return {
    ...actual,
    useI18n: () => actual.createTranslator('vi'),
  };
});

import {
  createParentGateChallenge,
  ParentGateChallengeCard,
} from '../src/components/ParentGateChallengeCard';

describe('ParentGateChallengeCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('generates valid parent gate challenge', () => {
    for (let i = 0; i < 20; i++) {
      const challenge = createParentGateChallenge();
      expect(typeof challenge.answer).toBe('number');
      expect(challenge.answer).toBeGreaterThanOrEqual(0);
      expect(challenge.expression).toMatch(/^[0-9]+ [+\u2212] [0-9]+$/);
    }
  });

  test('submits correct answer with keyboard dismissal and blurs input', () => {
    const dismissSpy = jest.spyOn(Keyboard, 'dismiss');
    const onGranted = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    act(() => {
      renderer = ReactTestRenderer.create(
        <ParentGateChallengeCard onGranted={onGranted} />,
      );
    });

    const allTexts = renderer!.root.findAllByType(Text);
    const questionNode = allTexts.find(node =>
      typeof node.props.children === 'string'
        ? node.props.children.includes('= ?')
        : Array.isArray(node.props.children) &&
          node.props.children.some((c: unknown) => typeof c === 'string' && c.includes('= ?')),
    );
    expect(questionNode).toBeDefined();

    const fullQuestionText = Array.isArray(questionNode!.props.children)
      ? questionNode!.props.children.join('')
      : String(questionNode!.props.children);

    const expressionPart = fullQuestionText.replace(' = ?', '').trim();
    let expectedAnswer: number;
    if (expressionPart.includes('+')) {
      const [a, b] = expressionPart.split('+').map((s: string) => Number(s.trim()));
      expectedAnswer = a + b;
    } else {
      const [a, b] = expressionPart.split('\u2212').map((s: string) => Number(s.trim()));
      expectedAnswer = a - b;
    }

    const textInput = renderer!.root.findByType(TextInput);
    act(() => {
      textInput.props.onChangeText(String(expectedAnswer));
    });

    const submitButton = renderer!.root.findByProps({
      accessibilityRole: 'button',
    });

    act(() => {
      submitButton.props.onPress();
    });

    // Keyboard dismissal should be triggered
    expect(dismissSpy).toHaveBeenCalledTimes(1);

    // After timer expires, access should be granted
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockGrantParentAccess).toHaveBeenCalledTimes(1);
    expect(onGranted).toHaveBeenCalledTimes(1);

    act(() => {
      renderer?.unmount();
    });
  });
});
