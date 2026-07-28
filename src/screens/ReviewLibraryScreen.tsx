import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { KidModeHeader } from '../components/KidModeHeader';
import { KidModeTabs } from '../components/KidModeTabs';
import { KidPlayPanel } from '../components/KidPlayPanel';
import { Screen } from '../components/Screen';
import { useMonetizationSnapshot } from '../engine/MonetizationManager';
import { getProgress, type LocalProgress } from '../engine/ProgressManager';
import { useSavedAppLanguage } from '../i18n';
import { layout } from '../theme/spacing';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ReviewLibrary'>;

export function ReviewLibraryScreen({ navigation }: Props) {
  const monetizationSnapshot = useMonetizationSnapshot();
  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const appLanguage = useSavedAppLanguage();
  const completedSceneIds = useMemo(
    () => new Set(progress?.completedSceneIds ?? []),
    [progress],
  );
  const completedReviewGameIds = useMemo(
    () => new Set(progress?.completedReviewGameIds ?? []),
    [progress],
  );
  const refreshProgress = useCallback(() => {
    getProgress()
      .then(setProgress)
      .catch(() => setProgress(null));
  }, []);

  useEffect(() => {
    refreshProgress();
    return navigation.addListener('focus', refreshProgress);
  }, [navigation, refreshProgress]);

  return (
    <Screen>
      <View style={styles.shell}>
        <KidModeHeader
          isPremium={monetizationSnapshot.status === 'premium'}
          onOpenParent={() => navigation.navigate('Parent')}
          totalXP={progress?.totalXP ?? 0}
        />
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={styles.scrollArea}
        >
          <KidPlayPanel
            appLanguage={appLanguage}
            completedReviewGameIds={completedReviewGameIds}
            completedSceneIds={completedSceneIds}
            onOpenPremium={lessonId =>
              navigation.navigate('Parent', {
                intent: 'premium',
                lessonId,
              })
            }
            onOpenReviewGame={lessonId =>
              navigation.navigate('ReviewGame', { lessonId })
            }
          />
        </ScrollView>
        <KidModeTabs
          activeTab="play"
          onSelectMap={() => navigation.navigate('Home')}
          onSelectPlay={() => navigation.navigate('ReviewLibrary')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: layout.screenPadding,
    paddingBottom: 112,
  },
  shell: {
    flex: 1,
  },
});
