import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';

import { SparkleEffect } from '../src/components/SparkleEffect';

describe('SparkleEffect', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.clearAllTimers();
    });
    jest.useRealTimers();
  });

  it('hides decorative stars from the accessibility tree', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    act(() => {
      renderer = ReactTestRenderer.create(<SparkleEffect active />);
    });

    const container = renderer!.root.findByProps({
      importantForAccessibility: 'no-hide-descendants',
    });
    expect(container.props).toMatchObject({
      accessibilityElementsHidden: true,
      accessible: false,
    });

    act(() => {
      renderer!.unmount();
    });
  });
});
