import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { KidModeHeader } from '../components/KidModeHeader';
import { KidModeTabs } from '../components/KidModeTabs';
import { KidPlayPanel } from '../components/KidPlayPanel';
import { Screen } from '../components/Screen';
import { lessons } from '../data/lessons';
import { DEFAULT_THEME_ID, getThemeById, themes } from '../data/themes';
import { getProgress, type LocalProgress } from '../engine/ProgressManager';
import { layout } from '../theme/spacing';
import type { Lesson } from '../types/lesson';
import type { RootStackParamList } from '../types/navigation';
import { isSceneProgressComplete } from '../utils/lessonProgress';

type Props = NativeStackScreenProps<RootStackParamList, 'ReviewLibrary'>;

export function ReviewLibraryScreen({ navigation }: Props) {
  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const completedSceneIds = useMemo(
    () => new Set(progress?.completedSceneIds ?? []),
    [progress],
  );
  const completedReviewGameIds = useMemo(
    () => new Set(progress?.completedReviewGameIds ?? []),
    [progress],
  );
  const activeThemeId = progress?.activeThemeId ?? DEFAULT_THEME_ID;
  const activeTheme =
    getThemeById(activeThemeId) ?? getThemeById(DEFAULT_THEME_ID) ?? themes[0];
  const themeLessons = useMemo(
    () =>
      activeTheme.lessonIds
        .map(lessonId => lessons.find(lesson => lesson.id === lessonId))
        .filter((lesson): lesson is Lesson => Boolean(lesson)),
    [activeTheme],
  );
  const themeSceneTotal = themeLessons.reduce(
    (total, lesson) => total + lesson.scenes.length,
    0,
  );
  const completedThemeSceneCount = themeLessons.reduce(
    (total, lesson) =>
      total +
      lesson.scenes.filter(scene =>
        isSceneProgressComplete(completedSceneIds, lesson.id, scene.id),
      ).length,
    0,
  );
  const isThemeComplete =
    themeSceneTotal > 0 && completedThemeSceneCount === themeSceneTotal;

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
          completed={completedThemeSceneCount}
          isComplete={isThemeComplete}
          onOpenParent={() => navigation.navigate('Parent')}
          total={themeSceneTotal}
        />
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={styles.scrollArea}
        >
          <KidPlayPanel
            completedReviewGameIds={completedReviewGameIds}
            completedSceneIds={completedSceneIds}
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
