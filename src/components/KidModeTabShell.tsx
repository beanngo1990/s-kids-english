import React, { createContext, useContext, useEffect, useState } from 'react';
import { StyleSheet, View, type AccessibilityProps } from 'react-native';

import { KidModeTabs, type KidModeTab } from './KidModeTabs';

type KidModeTabShellProps = {
  initialTab?: KidModeTab;
  mapPane: React.ReactNode;
  playPane: React.ReactNode;
  requestedTab?: KidModeTab;
};

const KidModeActiveTabContext = createContext<KidModeTab>('map');

export function useKidModeActiveTab() {
  return useContext(KidModeActiveTabContext);
}

export function KidModeTabShell({
  initialTab = 'map',
  mapPane,
  playPane,
  requestedTab,
}: KidModeTabShellProps) {
  const [activeTab, setActiveTab] = useState<KidModeTab>(initialTab);

  useEffect(() => {
    if (requestedTab) {
      setActiveTab(requestedTab);
    }
  }, [requestedTab]);

  return (
    <KidModeActiveTabContext.Provider value={activeTab}>
      <View style={styles.content} testID="kid-mode-tab-content">
        <TabPane active={activeTab === 'map'} testID="kid-mode-map-pane">
          {mapPane}
        </TabPane>
        <TabPane active={activeTab === 'play'} testID="kid-mode-play-pane">
          {playPane}
        </TabPane>
      </View>
      <KidModeTabs
        activeTab={activeTab}
        onSelectMap={() => setActiveTab('map')}
        onSelectPlay={() => setActiveTab('play')}
      />
    </KidModeActiveTabContext.Provider>
  );
}

function TabPane({
  active,
  children,
  testID,
}: {
  active: boolean;
  children: React.ReactNode;
  testID: string;
}) {
  const importantForAccessibility: AccessibilityProps['importantForAccessibility'] =
    active ? 'auto' : 'no-hide-descendants';

  return (
    <View
      accessibilityElementsHidden={!active}
      importantForAccessibility={importantForAccessibility}
      pointerEvents={active ? 'auto' : 'none'}
      style={[styles.pane, !active && styles.paneHidden]}
      testID={testID}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    position: 'relative',
  },
  pane: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  paneHidden: {
    display: 'none',
  },
});
