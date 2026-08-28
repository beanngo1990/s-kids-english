import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { KidModeHeader } from '../components/KidModeHeader';
import { KidModeTabs } from '../components/KidModeTabs';
import { KidPlayPanel } from '../components/KidPlayPanel';
import { Screen } from '../components/Screen';
import { lessons } from '../data/lessons';
import { themes } from '../data/themes';
import { useMonetizationSnapshot } from '../engine/MonetizationManager';
import { getParentSettings } from '../engine/ParentSettingsManager';
import { getProgress, type LocalProgress } from '../engine/ProgressManager';
import { useSavedAppLanguage } from '../i18n';
import { layout } from '../theme/spacing';
import type { RootStackParamList } from '../types/navigation';
import { getEnabledLessonIds } from '../utils/lessonPlan';

type Props = NativeStackScreenProps<RootStackParamList, 'ReviewLibrary'>;
const allLessonIds = lessons.map(lesson => lesson.id);

export function ReviewLibraryScreen({ navigation }: Props) {
  const monetizationSnapshot = useMonetizationSnapshot();
  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const [visibleLessonIds, setVisibleLessonIds] = useState<
    string[] | undefined
  >(undefined);
  const [disabledThemeIds, setDisabledThemeIds] = useState<string[]>([]);
  const enabledLessonIds = useMemo(
    () =>
      getEnabledLessonIds(
        allLessonIds,
        visibleLessonIds,
        themes,
        disabledThemeIds,
      ),
    [disabledThemeIds, visibleLessonIds],
  );
  const disabledThemeIdSet = useMemo(
    () => new Set(disabledThemeIds),
    [disabledThemeIds],
  );
  const activeThemeId =
    themes.find(
      theme =>
        theme.id === progress?.activeThemeId &&
        !disabledThemeIdSet.has(theme.id),
    )?.id ??
    themes.find(theme => !disabledThemeIdSet.has(theme.id))?.id;
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
    getParentSettings()
      .then(settings => {
        setDisabledThemeIds(settings.disabledThemeIds ?? []);
        setVisibleLessonIds(settings.visibleLessonIds);
      })
      .catch(() => {
        setDisabledThemeIds([]);
        setVisibleLessonIds(undefined);
      });
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
            activeThemeId={activeThemeId}
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
            onOpenStickerPlayground={() =>
              navigation.navigate('StickerPlayground')
            }
            visibleLessonIds={enabledLessonIds}
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
