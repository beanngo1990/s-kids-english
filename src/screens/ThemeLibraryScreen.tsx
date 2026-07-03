import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppCard } from '../components/AppCard';
import { KidBadge } from '../components/KidBadge';
import { ProgressStars } from '../components/ProgressStars';
import { Screen } from '../components/Screen';
import { lessons } from '../data/lessons';
import { themes } from '../data/themes';
import {
  getProgress,
  saveActiveThemeId,
  type LocalProgress,
} from '../engine/ProgressManager';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import type { Lesson, LessonTheme } from '../types/lesson';
import type { RootStackParamList } from '../types/navigation';
import { isSceneProgressComplete } from '../utils/lessonProgress';

type Props = NativeStackScreenProps<RootStackParamList, 'ThemeLibrary'>;

export function ThemeLibraryScreen({ navigation }: Props) {
  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const [savingThemeId, setSavingThemeId] = useState<string | null>(null);
  const completedSceneIds = useMemo(
    () => new Set(progress?.completedSceneIds ?? []),
    [progress],
  );

  useEffect(() => {
    getProgress()
      .then(setProgress)
      .catch(() => setProgress(null));
  }, []);

  const handleSelectTheme = async (themeId: string) => {
    if (savingThemeId) {
      return;
    }

    setSavingThemeId(themeId);
    try {
      const nextProgress = await saveActiveThemeId(themeId);
      setProgress(nextProgress);
      navigation.navigate('Home');
    } catch {
      setSavingThemeId(null);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <KidBadge tone="teal">Thư viện chủ đề</KidBadge>
        <Text style={styles.title}>Chọn lộ trình học</Text>
        <Text style={styles.subtitle}>
          Mỗi chủ đề là một bản đồ dài gồm nhiều gói bài. Bé chọn một lộ trình,
          rồi quay lại trang chủ để đi tiếp.
        </Text>
      </View>

      <View style={styles.grid}>
        {themes.map(theme => {
          const themeProgress = getThemeProgress(theme, completedSceneIds);
          const isActive = progress?.activeThemeId === theme.id;
          const isSavingThisTheme = savingThemeId === theme.id;

          return (
            <Pressable
              accessibilityLabel={`Chọn chủ đề ${theme.titleVi}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              disabled={Boolean(savingThemeId)}
              key={theme.id}
              onPress={() => handleSelectTheme(theme.id)}
              style={({ pressed }) => [
                styles.themePressable,
                pressed && !savingThemeId && styles.pressed,
                savingThemeId && !isSavingThisTheme && styles.disabled,
              ]}
            >
              <AppCard
                style={[
                  styles.themeCard,
                  isActive && styles.themeCardActive,
                ]}
              >
                <View style={styles.themeTopRow}>
                  <View style={styles.themeIcon}>
                    <Text style={styles.themeEmoji}>
                      {theme.thumbnailEmoji}
                    </Text>
                  </View>
                  <View style={styles.themeText}>
                    <View style={styles.badgeRow}>
                      <KidBadge tone={isActive ? 'teal' : 'sky'}>
                        {isActive ? 'Đang học' : 'Chủ đề'}
                      </KidBadge>
                      {isSavingThisTheme ? (
                        <KidBadge tone="sun">Đang lưu</KidBadge>
                      ) : null}
                    </View>
                    <Text style={styles.themeTitle}>{theme.titleVi}</Text>
                    {theme.descriptionVi ? (
                      <Text style={styles.themeDescription}>
                        {theme.descriptionVi}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.progressRow}>
                  <ProgressStars
                    completed={themeProgress.completed}
                    total={themeProgress.total}
                  />
                  <Text style={styles.progressText}>
                    {themeProgress.completed}/{themeProgress.total} trạm
                  </Text>
                </View>
              </AppCard>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

function getThemeProgress(theme: LessonTheme, completedSceneIds: Set<string>) {
  const themeLessons = theme.lessonIds
    .map(lessonId => lessons.find(lesson => lesson.id === lessonId))
    .filter((lesson): lesson is Lesson => Boolean(lesson));
  const total = themeLessons.reduce(
    (sum, lesson) => sum + lesson.scenes.length,
    0,
  );
  const completed = themeLessons.reduce(
    (sum, lesson) =>
      sum +
      lesson.scenes.filter(scene =>
        isSceneProgressComplete(completedSceneIds, lesson.id, scene.id),
      ).length,
    0,
  );

  return { completed, total };
}

const styles = StyleSheet.create({
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  disabled: {
    opacity: 0.55,
  },
  grid: {
    gap: spacing.md,
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  progressRow: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.borderWarm,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  progressText: {
    color: colors.textSoft,
    ...typography.caption,
  },
  subtitle: {
    color: colors.textSoft,
    ...typography.body,
  },
  themeCard: {
    backgroundColor: colors.cream,
    borderColor: colors.borderWarm,
    gap: spacing.md,
  },
  themeCardActive: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  themeDescription: {
    color: colors.textSoft,
    ...typography.body,
  },
  themeEmoji: {
    fontSize: 48,
    lineHeight: 58,
    textAlign: 'center',
  },
  themeIcon: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 3,
    height: 86,
    justifyContent: 'center',
    width: 86,
    ...shadows.soft,
  },
  themePressable: {
    borderRadius: radius.xl,
  },
  themeText: {
    flex: 1,
    gap: spacing.xs,
  },
  themeTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  themeTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    ...typography.title,
  },
});
