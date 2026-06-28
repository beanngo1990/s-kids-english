import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { AppLogo } from '../components/AppLogo';
import { KidBadge } from '../components/KidBadge';
import { ProgressStars } from '../components/ProgressStars';
import { Screen } from '../components/Screen';
import { lessons } from '../data/lessons';
import { getProgress, type LocalProgress } from '../engine/ProgressManager';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const featuredLesson = lessons[0];
  const completedSceneIds = useMemo(
    () => new Set(progress?.completedSceneIds ?? []),
    [progress],
  );
  const completedSceneCount =
    featuredLesson?.scenes.filter(scene => completedSceneIds.has(scene.id))
      .length ?? 0;
  const nextScene =
    featuredLesson?.scenes.find(scene => !completedSceneIds.has(scene.id)) ??
    featuredLesson?.scenes[0];

  useEffect(() => {
    getProgress()
      .then(setProgress)
      .catch(() => setProgress(null));
  }, []);

  const handleStart = () => {
    if (progress?.currentLessonProgress) {
      navigation.navigate('ScenePlayer', {
        learningMode: 'core',
        lessonId: progress.currentLessonProgress.lessonId,
        sceneId: progress.currentLessonProgress.sceneId,
      });
      return;
    }

    if (featuredLesson) {
      navigation.navigate('LessonPack', { lessonId: featuredLesson.id });
      return;
    }

    navigation.navigate('LessonList');
  };

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.skyDecor}>
          <View style={[styles.cloud, styles.cloudLeft]} />
          <View style={[styles.cloud, styles.cloudRight]} />
          <Text style={styles.sparkle}>★</Text>
        </View>

        <View style={styles.hero}>
          <AppLogo />
          <KidBadge tone="sun">Hôm nay bé học gì?</KidBadge>
          <Text style={styles.title}>S-Kids English</Text>
          <Text style={styles.subtitle}>
            Nghe, chạm và nói tiếng Anh qua những cảnh quen thuộc mỗi ngày.
          </Text>
        </View>

        {featuredLesson ? (
          <AppCard style={styles.todayCard}>
            <View style={styles.todayTopRow}>
              <View style={styles.lessonIcon}>
                <Text style={styles.lessonEmoji}>
                  {featuredLesson.thumbnailEmoji}
                </Text>
              </View>
              <View style={styles.todayText}>
                <Text style={styles.todayLabel}>Bài học hôm nay</Text>
                <Text style={styles.todayTitle}>{featuredLesson.titleVi}</Text>
                <Text style={styles.todaySubtitle}>
                  Tiếp theo: {nextScene?.titleVi ?? 'Sẵn sàng bắt đầu'}
                </Text>
              </View>
            </View>
            <View style={styles.progressRow}>
              <ProgressStars
                completed={completedSceneCount}
                total={featuredLesson.scenes.length}
              />
              <Text style={styles.progressText}>
                {completedSceneCount}/{featuredLesson.scenes.length} cảnh
              </Text>
            </View>
          </AppCard>
        ) : null}

        <View style={styles.actionPanel}>
          <AppButton
            title="Bắt đầu học"
            onPress={handleStart}
          />
          <AppButton
            title="Bản đồ bài học"
            variant="secondary"
            onPress={() => navigation.navigate('LessonList')}
          />
          <AppButton
            title="Góc phụ huynh"
            variant="ghost"
            onPress={() => navigation.navigate('Parent')}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actionPanel: {
    gap: spacing.sm,
    width: '100%',
  },
  cloud: {
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    opacity: 0.42,
    position: 'absolute',
  },
  cloudLeft: {
    height: 72,
    left: -54,
    top: 142,
    width: 150,
  },
  cloudRight: {
    height: 92,
    right: -68,
    top: 46,
    width: 180,
  },
  container: {
    gap: spacing.xl,
    minHeight: 700,
    overflow: 'hidden',
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  lessonEmoji: {
    fontSize: 34,
    lineHeight: 42,
  },
  lessonIcon: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 2,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  progressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    color: colors.textSoft,
    ...typography.caption,
  },
  skyDecor: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  sparkle: {
    color: colors.secondary,
    fontSize: 32,
    lineHeight: 36,
    position: 'absolute',
    right: spacing.xl,
    top: 12,
    transform: [{ rotate: '12deg' }],
  },
  subtitle: {
    color: colors.textSoft,
    maxWidth: 320,
    textAlign: 'center',
    ...typography.body,
  },
  title: {
    color: colors.text,
    textAlign: 'center',
    ...typography.hero,
  },
  todayCard: {
    gap: spacing.md,
  },
  todayLabel: {
    color: colors.primaryDark,
    ...typography.caption,
    textTransform: 'uppercase',
  },
  todaySubtitle: {
    color: colors.textSoft,
    ...typography.caption,
  },
  todayText: {
    flex: 1,
    gap: spacing.xxs,
  },
  todayTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  todayTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
});
