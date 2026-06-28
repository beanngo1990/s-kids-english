import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppCard } from '../components/AppCard';
import { AppLogo } from '../components/AppLogo';
import { KidBadge } from '../components/KidBadge';
import { KidIconButton } from '../components/KidIconButton';
import { ProgressStars } from '../components/ProgressStars';
import { Screen } from '../components/Screen';
import { SKidsIcon } from '../components/SKidsIcon';
import { lessons } from '../data/lessons';
import { getProgress, type LocalProgress } from '../engine/ProgressManager';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import type { RootStackParamList } from '../types/navigation';
import { getLessonIconName, getSceneIconName } from '../utils/lessonIcons';

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
  const isFeaturedLessonComplete =
    Boolean(featuredLesson) &&
    completedSceneCount === featuredLesson.scenes.length;

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
          <View style={[styles.cloud, styles.cloudBottom]} />
          <Text style={[styles.sparkle, styles.sparkleTop]}>★</Text>
          <Text style={[styles.sparkle, styles.sparkleMid]}>★</Text>
        </View>

        <View style={styles.topBar}>
          <View style={styles.brandCluster}>
            <AppLogo size={76} />
            <View style={styles.brandText}>
              <Text style={styles.title}>S-Kids</Text>
              <KidBadge tone="sun">English Quest</KidBadge>
            </View>
          </View>
          <KidIconButton
            accessibilityLabel="Góc phụ huynh"
            icon="parentLock"
            onPress={() => navigation.navigate('Parent')}
            size="md"
            tone="quiet"
          />
        </View>

        {featuredLesson ? (
          <View style={styles.gameWorld}>
            <AppCard style={styles.questCard}>
              <View style={styles.questHeader}>
                <View style={styles.questIcon}>
                  <SKidsIcon name={getLessonIconName(featuredLesson)} size={92} />
                </View>
                <View style={styles.questText}>
                  <KidBadge tone="teal">Nhiệm vụ hôm nay</KidBadge>
                  <Text style={styles.questTitle}>{featuredLesson.titleVi}</Text>
                  <Text style={styles.questSubtitle}>
                    Tiếp theo: {nextScene?.titleVi ?? 'Nhận sticker'}
                  </Text>
                </View>
              </View>

              <View style={styles.levelPath}>
                {featuredLesson.scenes.map((scene, index) => {
                  const isCompleted = completedSceneIds.has(scene.id);
                  const isNext =
                    nextScene?.id === scene.id && !isFeaturedLessonComplete;

                  return (
                    <View
                      key={scene.id}
                      style={[
                        styles.levelNode,
                        isCompleted && styles.levelNodeDone,
                        isNext && styles.levelNodeNext,
                      ]}
                    >
                      <SKidsIcon name={getSceneIconName(scene)} size={58} />
                      <View style={styles.levelBadge}>
                        <Text style={styles.levelNumber}>{index + 1}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              <View style={styles.progressPanel}>
                <ProgressStars
                  completed={completedSceneCount}
                  total={featuredLesson.scenes.length}
                />
                <Text style={styles.progressText}>
                  {completedSceneCount}/{featuredLesson.scenes.length}
                </Text>
              </View>
            </AppCard>

            <View style={styles.playCluster}>
              <KidIconButton
                accessibilityLabel="Bắt đầu học"
                icon="next"
                label="Chơi ngay"
                onPress={handleStart}
                style={styles.playButton}
              />
              <View style={styles.sideActions}>
                <KidIconButton
                  accessibilityLabel="Bản đồ bài học"
                  icon="map"
                  label="Bản đồ"
                  onPress={() => navigation.navigate('LessonList')}
                  size="md"
                  tone="secondary"
                />
                <KidIconButton
                  accessibilityLabel="Sticker của bé"
                  disabled={!isFeaturedLessonComplete}
                  icon="sticker"
                  label="Sticker"
                  onPress={() =>
                    navigation.navigate('Reward', { lessonId: featuredLesson.id })
                  }
                  size="md"
                  tone="quiet"
                />
              </View>
            </View>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandCluster: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  brandText: {
    gap: spacing.xs,
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
  cloudBottom: {
    bottom: 40,
    height: 92,
    left: 48,
    width: 220,
  },
  cloudRight: {
    height: 92,
    right: -68,
    top: 46,
    width: 180,
  },
  container: {
    gap: spacing.xl,
    minHeight: 720,
    overflow: 'hidden',
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  gameWorld: {
    gap: spacing.lg,
  },
  levelBadge: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    bottom: -4,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: -4,
    width: 24,
  },
  levelNode: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 2,
    height: 86,
    justifyContent: 'center',
    position: 'relative',
    width: 86,
    ...shadows.soft,
  },
  levelNodeDone: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  levelNodeNext: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
    transform: [{ scale: 1.04 }],
  },
  levelNumber: {
    color: colors.text,
    ...typography.caption,
  },
  levelPath: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  playButton: {
    flex: 1,
    minHeight: 138,
  },
  playCluster: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: spacing.md,
  },
  progressPanel: {
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
  questCard: {
    backgroundColor: colors.cream,
    borderColor: colors.borderWarm,
    gap: spacing.md,
  },
  questHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  questIcon: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 3,
    height: 108,
    justifyContent: 'center',
    width: 108,
    ...shadows.soft,
  },
  questSubtitle: {
    color: colors.textSoft,
    ...typography.caption,
  },
  questText: {
    flex: 1,
    gap: spacing.xs,
  },
  questTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  sideActions: {
    gap: spacing.sm,
    width: 104,
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
    fontSize: 30,
    lineHeight: 36,
    position: 'absolute',
  },
  sparkleMid: {
    left: spacing.lg,
    top: 262,
    transform: [{ rotate: '-12deg' }],
  },
  sparkleTop: {
    right: spacing.xl,
    top: 12,
    transform: [{ rotate: '12deg' }],
  },
  title: {
    color: colors.text,
    ...typography.hero,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
});
