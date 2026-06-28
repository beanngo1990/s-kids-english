import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppCard } from '../components/AppCard';
import { AppLogo } from '../components/AppLogo';
import { KidBadge } from '../components/KidBadge';
import { KidIconButton } from '../components/KidIconButton';
import { Screen } from '../components/Screen';
import { SKidsIcon } from '../components/SKidsIcon';
import { lessons } from '../data/lessons';
import { getProgress, type LocalProgress } from '../engine/ProgressManager';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import type { Scene } from '../types/lesson';
import type { RootStackParamList } from '../types/navigation';
import { getSceneIconName } from '../utils/lessonIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const horizontalTrailDots = Array.from({ length: 7 }, (_, index) => index);
const verticalTrailDots = Array.from({ length: 4 }, (_, index) => index);

export function HomeScreen({ navigation }: Props) {
  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const featuredLesson = lessons[0];
  const completedSceneIds = useMemo(
    () => new Set(progress?.completedSceneIds ?? []),
    [progress],
  );
  const totalSceneCount = featuredLesson?.scenes.length ?? 0;
  const completedSceneCount =
    featuredLesson?.scenes.filter(scene => completedSceneIds.has(scene.id))
      .length ?? 0;
  const isFeaturedLessonComplete =
    Boolean(featuredLesson) &&
    totalSceneCount > 0 &&
    completedSceneCount >= totalSceneCount;
  const nextScene =
    !isFeaturedLessonComplete && featuredLesson
      ? featuredLesson.scenes.find(scene => !completedSceneIds.has(scene.id)) ??
        featuredLesson.scenes[0]
      : undefined;
  const missionSubtitle = isFeaturedLessonComplete
    ? 'Hoàn thành rồi! Bé nhận sticker nhé'
    : `Tiếp theo: ${nextScene?.titleVi ?? 'Bắt đầu hành trình'}`;
  const journeyScenes = featuredLesson?.scenes.slice(0, 4) ?? [];

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

  const renderJourneyNode = (scene: Scene | undefined, index: number) => {
    if (!scene) {
      return null;
    }

    const isCompleted = completedSceneIds.has(scene.id);
    const isCurrent =
      nextScene?.id === scene.id ||
      (isFeaturedLessonComplete && index === totalSceneCount - 1);
    const isUnlocked = isCompleted || isCurrent;
    const accessibilityLabel = isUnlocked
      ? `${isCompleted ? 'Chơi lại' : 'Học tiếp'} ${scene.titleVi}`
      : `${scene.titleVi} chưa mở khóa`;

    return (
      <LevelNode
        accessibilityLabel={accessibilityLabel}
        iconName={getSceneIconName(scene)}
        index={index}
        isCompleted={isCompleted}
        isCurrent={isCurrent}
        isLocked={!isUnlocked}
        key={scene.id}
        onPress={() => {
          if (!featuredLesson || !isUnlocked) {
            return;
          }

          navigation.navigate('ScenePlayer', {
            learningMode: 'core',
            lessonId: featuredLesson.id,
            sceneId: scene.id,
          });
        }}
      />
    );
  };

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.skyDecor}>
          <View style={[styles.cloud, styles.cloudLeft]} />
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
            style={styles.parentGate}
            tone="quiet"
          />
        </View>

        {featuredLesson ? (
          <View style={styles.gameWorld}>
            <AppCard style={styles.questCard}>
              <View style={styles.questHeader}>
                <View style={styles.questText}>
                  <View style={styles.questBadgeRow}>
                    <KidBadge tone="teal">Nhiệm vụ hôm nay</KidBadge>
                    <View style={styles.questRewardChip}>
                      <SKidsIcon name="star" size={26} />
                      <Text style={styles.questRewardText}>
                        {completedSceneCount}/{totalSceneCount}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.questTitle}>
                    {featuredLesson.titleVi}
                  </Text>
                  <Text style={styles.questSubtitle}>{missionSubtitle}</Text>
                </View>
              </View>

              <View style={styles.levelPath}>
                <View style={styles.pathRow}>
                  {renderJourneyNode(journeyScenes[0], 0)}
                  <DottedTrail
                    isComplete={completedSceneCount > 0}
                    style={styles.topTrail}
                  />
                  {renderJourneyNode(journeyScenes[1], 1)}
                </View>

                <DottedTrail
                  isComplete={completedSceneCount > 1}
                  style={styles.dropTrail}
                  vertical
                />

                <View style={[styles.pathRow, styles.pathRowReverse]}>
                  {renderJourneyNode(journeyScenes[2], 2)}
                  <DottedTrail
                    isComplete={completedSceneCount > 2}
                    style={styles.bottomTrail}
                  />
                  {renderJourneyNode(journeyScenes[3], 3)}
                </View>
              </View>
            </AppCard>

            <View style={styles.playCluster}>
              <PlayNowButton
                accessibilityLabel="Bắt đầu học"
                label="Chơi ngay"
                onPress={handleStart}
              />
              <View style={styles.sideActions}>
                <KidIconButton
                  accessibilityLabel="Bản đồ bài học"
                  icon="map"
                  label="Bản đồ"
                  onPress={() => navigation.navigate('LessonList')}
                  size="md"
                  style={styles.sideActionButton}
                  tone="secondary"
                />
                <KidIconButton
                  accessibilityLabel="Sticker của bé"
                  disabled={!isFeaturedLessonComplete}
                  icon="sticker"
                  label="Sticker"
                  onPress={() =>
                    navigation.navigate('Reward', {
                      lessonId: featuredLesson.id,
                    })
                  }
                  size="md"
                  style={styles.sideActionButton}
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

type LevelNodeProps = {
  accessibilityLabel: string;
  iconName: ReturnType<typeof getSceneIconName>;
  index: number;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  onPress: () => void;
};

function LevelNode({
  accessibilityLabel,
  iconName,
  index,
  isCompleted,
  isCurrent,
  isLocked,
  onPress,
}: LevelNodeProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: isLocked }}
      disabled={isLocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.levelNode,
        isCompleted && styles.levelNodeDone,
        isCurrent && styles.levelNodeCurrent,
        isLocked && styles.levelNodeLocked,
        pressed && !isLocked && styles.levelNodePressed,
      ]}
    >
      {isCurrent ? <View style={styles.levelNodeGlow} /> : null}
      <SKidsIcon
        name={iconName}
        size={isCurrent ? 66 : 58}
        style={!isCurrent && isCompleted ? styles.levelIconDone : undefined}
      />
      <View style={styles.levelBadge}>
        <Text style={styles.levelNumber}>{index + 1}</Text>
      </View>
      {isCompleted ? (
        <View style={styles.levelTick}>
          <Text style={styles.levelTickText}>✓</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

type DottedTrailProps = {
  isComplete: boolean;
  style?: StyleProp<ViewStyle>;
  vertical?: boolean;
};

function DottedTrail({
  isComplete,
  style,
  vertical = false,
}: DottedTrailProps) {
  const dots = vertical ? verticalTrailDots : horizontalTrailDots;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.dottedTrail,
        vertical ? styles.dottedTrailVertical : styles.dottedTrailHorizontal,
        style,
      ]}
    >
      {dots.map(dot => (
        <View
          key={dot}
          style={[
            styles.trailDot,
            isComplete ? styles.trailDotDone : styles.trailDotIdle,
          ]}
        />
      ))}
    </View>
  );
}

type PlayNowButtonProps = {
  accessibilityLabel: string;
  label: string;
  onPress: () => void;
};

function PlayNowButton({
  accessibilityLabel,
  label,
  onPress,
}: PlayNowButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.playNowButton,
        pressed && styles.playNowButtonPressed,
      ]}
    >
      <View style={styles.playGlowOuter} />
      <View style={styles.playGlowInner} />
      <SKidsIcon name="next" size={92} style={styles.playNowIcon} />
      <View style={styles.playLabelPill}>
        <Text numberOfLines={1} style={styles.playLabel}>
          {label}
        </Text>
      </View>
    </Pressable>
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
  bottomTrail: {
    marginHorizontal: -spacing.xs,
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
  dottedTrail: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dottedTrailHorizontal: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.xs,
  },
  dottedTrailVertical: {
    flexDirection: 'column',
  },
  dropTrail: {
    alignSelf: 'flex-end',
    height: 38,
    marginRight: 45,
    marginVertical: -spacing.xs,
    width: 18,
  },
  levelBadge: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    bottom: -5,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: -5,
    width: 28,
    ...shadows.soft,
  },
  levelIconDone: {
    opacity: 0.76,
  },
  levelNode: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 34,
    borderWidth: 3,
    height: 96,
    justifyContent: 'center',
    position: 'relative',
    width: 96,
    zIndex: 1,
    ...shadows.soft,
  },
  levelNodeCurrent: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
    height: 108,
    width: 108,
    ...shadows.warm,
  },
  levelNodeDone: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  levelNodeGlow: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 4,
    bottom: -10,
    left: -10,
    opacity: 0.62,
    position: 'absolute',
    right: -10,
    top: -10,
  },
  levelNodeLocked: {
    opacity: 0.5,
  },
  levelNodePressed: {
    opacity: 0.9,
    transform: [{ translateY: 2 }, { scale: 0.97 }],
  },
  levelNumber: {
    color: colors.text,
    ...typography.caption,
  },
  levelPath: {
    gap: spacing.xs,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.sm,
  },
  levelTick: {
    alignItems: 'center',
    backgroundColor: colors.green,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 3,
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    right: -8,
    top: -8,
    width: 30,
    ...shadows.soft,
  },
  levelTickText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 21,
  },
  pathRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 110,
  },
  pathRowReverse: {
    flexDirection: 'row-reverse',
  },
  parentGate: {
    backgroundColor: colors.white,
    borderColor: colors.white,
    borderRadius: radius.pill,
    height: 78,
    minHeight: 78,
    minWidth: 78,
    width: 78,
    ...shadows.floating,
  },
  playCluster: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: spacing.md,
  },
  playGlowInner: {
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    height: 120,
    opacity: 0.15,
    position: 'absolute',
    right: -30,
    top: 16,
    width: 120,
  },
  playGlowOuter: {
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    height: 210,
    left: -70,
    opacity: 0.18,
    position: 'absolute',
    top: -64,
    width: 210,
  },
  playLabel: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 26,
    textAlign: 'center',
  },
  playLabelPill: {
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    marginTop: -spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  playNowButton: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 4,
    flex: 1,
    justifyContent: 'center',
    minHeight: 166,
    overflow: 'hidden',
    padding: spacing.md,
    ...shadows.warm,
  },
  playNowButtonPressed: {
    opacity: 0.92,
    transform: [{ translateY: 3 }, { scale: 0.98 }],
  },
  playNowIcon: {
    marginTop: -spacing.xs,
  },
  questBadgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  questCard: {
    backgroundColor: colors.cream,
    borderColor: colors.borderWarm,
    gap: spacing.lg,
  },
  questHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  questRewardChip: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.borderWarm,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xxs,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    ...shadows.soft,
  },
  questRewardText: {
    color: colors.textSoft,
    ...typography.caption,
  },
  questSubtitle: {
    color: colors.textSoft,
    ...typography.caption,
  },
  questText: {
    flex: 1,
    gap: spacing.sm,
  },
  questTitle: {
    color: colors.text,
    ...typography.title,
  },
  sideActionButton: {
    borderRadius: radius.lg,
    minHeight: 88,
  },
  sideActions: {
    gap: spacing.sm,
    width: 112,
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
    right: 74,
    top: 10,
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
  topTrail: {
    marginHorizontal: -spacing.xs,
  },
  trailDot: {
    borderRadius: radius.pill,
    height: 9,
    width: 9,
  },
  trailDotDone: {
    backgroundColor: colors.secondary,
    borderColor: colors.white,
    borderWidth: 1,
  },
  trailDotIdle: {
    backgroundColor: colors.white,
    borderColor: colors.borderWarm,
    borderWidth: 1,
  },
});
