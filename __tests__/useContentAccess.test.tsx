import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

import { useContentAccess } from '../src/engine/useContentAccess';

let mockMonetizationStatus:
  | 'free'
  | 'initializing'
  | 'premium'
  | 'signedOut'
  | 'unavailable' = 'initializing';

jest.mock('../src/engine/MonetizationManager', () => ({
  useMonetizationSnapshot: () => ({ status: mockMonetizationStatus }),
}));

type ProbeProps = Readonly<{
  latchWhenGranted?: boolean;
  lessonId: string;
}>;

function AccessProbe({ latchWhenGranted, lessonId }: ProbeProps) {
  const decision = useContentAccess(
    {
      kind: 'scene',
      lessonId,
      sceneId: 'scene',
    },
    { latchWhenGranted },
  );

  return (
    <Text>
      {decision.isAccessGranted
        ? 'granted'
        : decision.isResolving
          ? 'resolving'
          : 'blocked'}
    </Text>
  );
}

beforeEach(() => {
  mockMonetizationStatus = 'initializing';
});

test('keeps free content open while monetization is initializing', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <AccessProbe lessonId="morning-routine" />,
    );
  });

  expect(tree?.root.findByType(Text).props.children).toBe('granted');

  await ReactTestRenderer.act(() => {
    tree?.unmount();
  });
});

test('resolves Premium content before granting access', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<AccessProbe lessonId="bedtime" />);
  });

  expect(tree?.root.findByType(Text).props.children).toBe('resolving');

  mockMonetizationStatus = 'free';
  await ReactTestRenderer.act(() => {
    tree?.update(<AccessProbe lessonId="bedtime" />);
  });

  expect(tree?.root.findByType(Text).props.children).toBe('blocked');

  mockMonetizationStatus = 'premium';
  await ReactTestRenderer.act(() => {
    tree?.update(<AccessProbe lessonId="bedtime" />);
  });

  expect(tree?.root.findByType(Text).props.children).toBe('granted');

  await ReactTestRenderer.act(() => {
    tree?.unmount();
  });
});

test('latches a started scene when entitlement changes mid-session', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  mockMonetizationStatus = 'premium';

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <AccessProbe latchWhenGranted lessonId="bedtime" />,
    );
  });

  expect(tree?.root.findByType(Text).props.children).toBe('granted');

  mockMonetizationStatus = 'free';
  await ReactTestRenderer.act(() => {
    tree?.update(<AccessProbe latchWhenGranted lessonId="bedtime" />);
  });

  expect(tree?.root.findByType(Text).props.children).toBe('granted');

  await ReactTestRenderer.act(() => {
    tree?.unmount();
  });
});

test('does not carry a scene latch into a different lesson', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  mockMonetizationStatus = 'premium';

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <AccessProbe latchWhenGranted lessonId="bedtime" />,
    );
  });

  mockMonetizationStatus = 'free';
  await ReactTestRenderer.act(() => {
    tree?.update(<AccessProbe latchWhenGranted lessonId="family-dinner" />);
  });

  expect(tree?.root.findByType(Text).props.children).toBe('blocked');

  await ReactTestRenderer.act(() => {
    tree?.unmount();
  });
});
