import React from 'react';
import { StyleSheet } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { KidModeTabs } from '../src/components/KidModeTabs';
import { spacing } from '../src/theme/spacing';

test('stays above the system navigation area supplied by its parent screen', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <SafeAreaInsetsContext.Provider
        value={{ bottom: 48, left: 0, right: 0, top: 0 }}
      >
        <KidModeTabs
          activeTab="map"
          onSelectMap={() => undefined}
          onSelectPlay={() => undefined}
        />
      </SafeAreaInsetsContext.Provider>,
    );
  });

  const footer = tree?.root.findByProps({ testID: 'kid-mode-tabs' });
  const footerStyle = StyleSheet.flatten(footer?.props.style);

  expect(footerStyle?.bottom).toBe(spacing.xs);

  await ReactTestRenderer.act(async () => {
    tree?.unmount();
  });
});
