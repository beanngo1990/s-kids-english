import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppCard } from '../components/AppCard';
import { KidBadge } from '../components/KidBadge';
import { ProgressStars } from '../components/ProgressStars';
import { Screen } from '../components/Screen';
import { lessons } from '../data/lessons';
import { DEFAULT_THEME_ID, themes } from '../data/themes';
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
  const [visibleLessonIds, setVisibleLessonIds] = useState<string[] | undefined>(undefined);
  const activeThemeId = progress?.activeThemeId ?? DEFAULT_THEME_ID;
  const completedSceneIds = useMemo(
    () => new Set(progress?.completedSceneIds ?? []),
    [progress],
  );

  useEffect(() => {
    getProgress()
      .then(setProgress)
      .catch(() => setProgress(null));
    import('../engine/ParentSettingsManager').then(({ getParentSettings }) => {
      getParentSettings().then(settings => setVisibleLessonIds(settings.visibleLessonIds));
    });
  }, []);

  const handleSelectTheme = async (themeId: string) => {
    if (savingThemeId) {
      return;
    }

    if (themeId === activeThemeId) {
      navigation.navigate('Home');
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
          Mỗi chủ đề là một Siêu bản đồ dài gồm nhiều gói bài. Khi chọn một
          chủ đề, app sẽ lưu lộ trình đang học và quay về Home để bé tiếp tục
          trên bản đồ đó.
        </Text>
        <View style={styles.parentNote}>
          <KidBadge tone="sun">Ghi chú cho phụ huynh</KidBadge>
          <Text style={styles.parentNoteText}>
            Chủ đề có nhãn “Đang học” chính là bản đồ đang hiển thị ở Home.
            Bấm vào chủ đề này sẽ đưa bé quay lại Siêu bản đồ hiện tại, không
            tạo lộ trình mới.
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        {themes.map(theme => {
          const themeProgress = getThemeProgress(theme, completedSceneIds, visibleLessonIds);
          const isActive = activeThemeId === theme.id;
          const isSavingThisTheme = savingThemeId === theme.id;
          const actionLabel = isActive
            ? 'Tiếp tục trên bản đồ'
            : 'Chọn chủ đề này';
          const actionHint = isActive
            ? 'Đang hiển thị trên Home. Bấm để tiếp tục lộ trình hiện tại.'
            : 'Chọn để đổi Siêu bản đồ trên Home sang chủ đề này.';

          return (
            <Pressable
              accessibilityHint={actionHint}
              accessibilityLabel={`${actionLabel}: ${theme.titleVi}`}
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

                <View
                  style={[
                    styles.actionRow,
                    isActive && styles.actionRowActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.actionText,
                      isActive && styles.actionTextActive,
                    ]}
                  >
                    {isSavingThisTheme ? 'Đang lưu...' : actionLabel}
                  </Text>
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.actionHint,
                      isActive && styles.actionHintActive,
                    ]}
                  >
                    {actionHint}
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

function getThemeProgress(
  theme: LessonTheme, 
  completedSceneIds: Set<string>,
  visibleLessonIds: string[] | undefined
) {
  const themeLessons = theme.lessonIds
    .map(lessonId => lessons.find(lesson => lesson.id === lessonId))
    .filter((lesson): lesson is Lesson => {
      if (!lesson) {
        return false;
      }
      if (visibleLessonIds && !visibleLessonIds.includes(lesson.id)) {
        return false;
      }
      return true;
    });
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
  actionHint: {
    color: colors.textSoft,
    flex: 1,
    ...typography.caption,
  },
  actionHintActive: {
    color: colors.primaryDark,
  },
  actionRow: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.borderWarm,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionRowActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  actionText: {
    color: colors.text,
    ...typography.caption,
    fontWeight: '900',
  },
  actionTextActive: {
    color: colors.primaryDark,
  },
  parentNote: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  parentNoteText: {
    color: colors.text,
    ...typography.caption,
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
