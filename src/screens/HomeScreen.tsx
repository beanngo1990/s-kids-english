import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { type SKidsIconName } from '../assets/icons/skids';
import { AppLogo } from '../components/AppLogo';
import { KidBadge } from '../components/KidBadge';
import { KidIconButton } from '../components/KidIconButton';
import { Screen } from '../components/Screen';
import { SKidsIcon } from '../components/SKidsIcon';
import { lessons } from '../data/lessons';
import { getParentSettings } from '../engine/ParentSettingsManager';
import { getProgress, type LocalProgress } from '../engine/ProgressManager';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import type { LearningMode, Lesson, Scene } from '../types/lesson';
import type { RootStackParamList } from '../types/navigation';
import { getLessonIconName, getSceneIconName } from '../utils/lessonIcons';
import {
  getCompletedSceneCount,
  getNextScene,
  isLessonComplete,
  isSceneUnlocked,
} from '../utils/lessonProgress';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
type MapAlignment = 'left' | 'center' | 'right';

const connectorDots = Array.from({ length: 11 }, (_, index) => index);
const connectorHeight = 82;

export function HomeScreen({ navigation }: Props) {
  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const [learningMode, setLearningMode] = useState<LearningMode>('core');
  const [selectedLessonId, setSelectedLessonId] = useState<string | undefined>(
    lessons[0]?.id,
  );
  const featuredLesson =
    lessons.find(lesson => lesson.id === selectedLessonId) ?? lessons[0];
  const scenes = useMemo(() => featuredLesson?.scenes ?? [], [featuredLesson]);
  const sceneIds = useMemo(
    () => new Set(scenes.map(scene => scene.id)),
    [scenes],
  );
  const completedSceneIds = useMemo(
    () => new Set(progress?.completedSceneIds ?? []),
    [progress],
  );
  const completedSceneCount = getCompletedSceneCount(scenes, completedSceneIds);
  const isFeaturedLessonComplete = isLessonComplete(scenes, completedSceneIds);
  const nextScene = isFeaturedLessonComplete
    ? undefined
    : getNextScene(scenes, completedSceneIds);
  const pendingProgress = progress?.currentLessonProgress;
  const shouldResumeProgress = Boolean(
    featuredLesson &&
      pendingProgress &&
      pendingProgress.lessonId === featuredLesson.id &&
      sceneIds.has(pendingProgress.sceneId) &&
      !completedSceneIds.has(pendingProgress.sceneId),
  );
  const rewardAlignment = getRewardAlignment(scenes.length);
  const primaryLabel = isFeaturedLessonComplete ? 'MỞ QUÀ' : 'Chơi ngay';
  const primaryIconName: SKidsIconName = isFeaturedLessonComplete
    ? 'sticker'
    : 'next';

  const refreshHomeData = useCallback(() => {
    getProgress()
      .then(setProgress)
      .catch(() => setProgress(null));
    getParentSettings()
      .then(settings => setLearningMode(settings.learningMode))
      .catch(() => setLearningMode('core'));
  }, []);

  useEffect(() => {
    refreshHomeData();
    return navigation.addListener('focus', refreshHomeData);
  }, [navigation, refreshHomeData]);

  const handleStart = () => {
    if (shouldResumeProgress && pendingProgress) {
      navigation.navigate('ScenePlayer', {
        learningMode,
        lessonId: pendingProgress.lessonId,
        sceneId: pendingProgress.sceneId,
      });
      return;
    }

    if (isFeaturedLessonComplete && featuredLesson) {
      navigation.navigate('Reward', { lessonId: featuredLesson.id });
      return;
    }

    if (featuredLesson && nextScene) {
      navigation.navigate('ScenePlayer', {
        learningMode,
        lessonId: featuredLesson.id,
        sceneId: nextScene.id,
      });
      return;
    }

    navigation.navigate('LessonList');
  };

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View pointerEvents="none" style={styles.skyDecor}>
          <View style={[styles.cloud, styles.cloudLeft]} />
          <View style={[styles.cloud, styles.cloudBottom]} />
          <Text style={[styles.sparkle, styles.sparkleTop]}>★</Text>
          <Text style={[styles.sparkle, styles.sparkleMid]}>★</Text>
        </View>

        <View style={styles.topBar}>
          <View style={styles.brandCluster}>
            <AppLogo size={64} />
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

        {lessons.length > 1 ? (
          <LessonSwitcher
            completedSceneIds={completedSceneIds}
            lessons={lessons}
            selectedLessonId={featuredLesson?.id}
            onSelectLesson={setSelectedLessonId}
          />
        ) : null}

        {featuredLesson ? (
          <View style={styles.world}>
            <View style={styles.mapHeader}>
              <View style={styles.lessonTitleGroup}>
                <KidBadge tone="teal">Bản đồ học tập</KidBadge>
                <Text style={styles.mapTitle}>{featuredLesson.titleVi}</Text>
              </View>
              <View style={styles.progressChip}>
                <SKidsIcon name="star" size={24} />
                <Text style={styles.progressChipText}>
                  {completedSceneCount}/{scenes.length}
                </Text>
              </View>
            </View>

            <View style={styles.learningMap}>
              <View pointerEvents="none" style={styles.mapBackdrop}>
                <View style={[styles.mapHill, styles.mapHillLeft]} />
                <View style={[styles.mapHill, styles.mapHillRight]} />
                <Text style={[styles.mapStar, styles.mapStarOne]}>★</Text>
                <Text style={[styles.mapStar, styles.mapStarTwo]}>★</Text>
              </View>

              {scenes.map((scene, index) => {
                const alignment = getMapAlignment(index);
                const nextAlignment =
                  index < scenes.length - 1
                    ? getMapAlignment(index + 1)
                    : rewardAlignment;
                const isCompleted = completedSceneIds.has(scene.id);
                const isCurrent =
                  !isFeaturedLessonComplete && nextScene?.id === scene.id;
                const isUnlocked = isSceneUnlocked(
                  scenes,
                  scene,
                  completedSceneIds,
                );

                return (
                  <React.Fragment key={scene.id}>
                    <SceneMapStop
                      alignment={alignment}
                      index={index}
                      isCompleted={isCompleted}
                      isCurrent={isCurrent}
                      isLocked={!isUnlocked}
                      scene={scene}
                      onPress={() => {
                        if (!isUnlocked) {
                          return;
                        }

                        navigation.navigate('ScenePlayer', {
                          learningMode,
                          lessonId: featuredLesson.id,
                          sceneId: scene.id,
                        });
                      }}
                    />
                    <MapConnector
                      from={alignment}
                      isComplete={isCompleted}
                      to={nextAlignment}
                    />
                  </React.Fragment>
                );
              })}

              <RewardMapStop
                alignment={rewardAlignment}
                isUnlocked={isFeaturedLessonComplete}
                onPress={() =>
                  navigation.navigate('Reward', { lessonId: featuredLesson.id })
                }
              />
            </View>

            <View style={styles.playCluster}>
              <PlayNowButton
                accessibilityLabel={
                  isFeaturedLessonComplete ? 'Mở quà' : 'Chơi ngay'
                }
                iconName={primaryIconName}
                isReward={isFeaturedLessonComplete}
                label={primaryLabel}
                onPress={handleStart}
              />
              <View style={styles.sideActions}>
                <KidIconButton
                  accessibilityLabel="Xem gói bài học"
                  icon="map"
                  label="Gói bài"
                  onPress={() =>
                    navigation.navigate('LessonPack', {
                      lessonId: featuredLesson.id,
                    })
                  }
                  size="md"
                  style={styles.sideActionButton}
                  tone="secondary"
                />
                <KidIconButton
                  accessibilityLabel="Album sticker của bé"
                  disabled={!isFeaturedLessonComplete}
                  icon="sticker"
                  label="Album"
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

type LessonSwitcherProps = {
  completedSceneIds: Set<string>;
  lessons: Lesson[];
  onSelectLesson: (lessonId: string) => void;
  selectedLessonId?: string;
};

function LessonSwitcher({
  completedSceneIds,
  lessons,
  onSelectLesson,
  selectedLessonId,
}: LessonSwitcherProps) {
  return (
    <View style={styles.lessonSwitcher}>
      <View style={styles.lessonSwitcherHeader}>
        <KidBadge tone="sky">Gói bài</KidBadge>
        <Text style={styles.lessonSwitcherHint}>Chọn hành trình cho bé</Text>
      </View>

      <View style={styles.lessonSwitcherList}>
        {lessons.map(lesson => {
          const isSelected = lesson.id === selectedLessonId;
          const completedSceneCount = getCompletedSceneCount(
            lesson.scenes,
            completedSceneIds,
          );

          return (
            <Pressable
              accessibilityLabel={`Chọn bài ${lesson.titleVi}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              key={lesson.id}
              onPress={() => onSelectLesson(lesson.id)}
              style={({ pressed }) => [
                styles.lessonChip,
                isSelected && styles.lessonChipSelected,
                pressed && styles.lessonChipPressed,
              ]}
            >
              <View
                style={[
                  styles.lessonChipIcon,
                  isSelected && styles.lessonChipIconSelected,
                ]}
              >
                <SKidsIcon name={getLessonIconName(lesson)} size={52} />
              </View>
              <View style={styles.lessonChipText}>
                <Text numberOfLines={2} style={styles.lessonChipTitle}>
                  {lesson.titleVi}
                </Text>
                <Text style={styles.lessonChipMeta}>
                  {completedSceneCount}/{lesson.scenes.length} trạm
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type SceneMapStopProps = {
  alignment: MapAlignment;
  index: number;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  onPress: () => void;
  scene: Scene;
};

function SceneMapStop({
  alignment,
  index,
  isCompleted,
  isCurrent,
  isLocked,
  onPress,
  scene,
}: SceneMapStopProps) {
  const accessibilityLabel = isLocked
    ? `${scene.titleVi} chưa mở khóa`
    : `${isCompleted ? 'Chơi lại' : 'Học tiếp'} ${scene.titleVi}`;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: isLocked }}
      disabled={isLocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.mapStop,
        alignment === 'left' && styles.mapStopLeft,
        alignment === 'center' && styles.mapStopCenter,
        alignment === 'right' && styles.mapStopRight,
        pressed && !isLocked && styles.mapStopPressed,
      ]}
    >
      <View
        style={[
          styles.stopNode,
          isCompleted && styles.stopNodeDone,
          isCurrent && styles.stopNodeCurrent,
          isLocked && styles.stopNodeLocked,
        ]}
      >
        {isCurrent ? <View style={styles.stopGlow} /> : null}
        <SKidsIcon
          name={getSceneIconName(scene)}
          size={isCurrent ? 96 : 86}
          style={isLocked ? styles.lockedIcon : undefined}
        />
        <View style={styles.stopNumber}>
          <Text style={styles.stopNumberText}>{index + 1}</Text>
        </View>
        {isCompleted ? (
          <View style={styles.doneBadge}>
            <Text style={styles.doneBadgeText}>✓</Text>
          </View>
        ) : null}
        {isLocked ? (
          <View style={styles.lockBadge}>
            <SKidsIcon name="parentLock" size={28} />
          </View>
        ) : null}
      </View>
      <Text
        numberOfLines={2}
        style={[styles.stopTitle, isLocked && styles.stopTitleLocked]}
      >
        {scene.titleVi}
      </Text>
    </Pressable>
  );
}

type RewardMapStopProps = {
  alignment: MapAlignment;
  isUnlocked: boolean;
  onPress: () => void;
};

function RewardMapStop({ alignment, isUnlocked, onPress }: RewardMapStopProps) {
  return (
    <Pressable
      accessibilityLabel={isUnlocked ? 'Mở quà' : 'Quà tặng chưa mở khóa'}
      accessibilityRole="button"
      accessibilityState={{ disabled: !isUnlocked }}
      disabled={!isUnlocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.mapStop,
        alignment === 'left' && styles.mapStopLeft,
        alignment === 'center' && styles.mapStopCenter,
        alignment === 'right' && styles.mapStopRight,
        pressed && isUnlocked && styles.mapStopPressed,
      ]}
    >
      <View
        style={[
          styles.stopNode,
          styles.rewardNode,
          isUnlocked ? styles.rewardNodeOpen : styles.stopNodeLocked,
        ]}
      >
        {isUnlocked ? <View style={styles.rewardGlow} /> : null}
        <SKidsIcon
          name="star"
          size={isUnlocked ? 98 : 86}
          style={!isUnlocked ? styles.lockedIcon : undefined}
        />
        {!isUnlocked ? (
          <View style={styles.lockBadge}>
            <SKidsIcon name="parentLock" size={28} />
          </View>
        ) : null}
      </View>
      <Text
        numberOfLines={1}
        style={[styles.stopTitle, !isUnlocked && styles.stopTitleLocked]}
      >
        Quà tặng
      </Text>
    </Pressable>
  );
}

type MapConnectorProps = {
  from: MapAlignment;
  isComplete: boolean;
  to: MapAlignment;
};

function MapConnector({ from, isComplete, to }: MapConnectorProps) {
  const fromX = getAlignmentX(from);
  const toX = getAlignmentX(to);

  return (
    <View pointerEvents="none" style={styles.connector}>
      {connectorDots.map(dot => {
        const progress = (dot + 1) / (connectorDots.length + 1);
        const x = fromX + (toX - fromX) * progress;
        const y = progress * connectorHeight;

        return (
          <View
            key={dot}
            style={[
              styles.connectorDot,
              isComplete ? styles.connectorDotDone : styles.connectorDotIdle,
              {
                left: percent(x),
                top: y,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

type PlayNowButtonProps = {
  accessibilityLabel: string;
  iconName: SKidsIconName;
  isReward: boolean;
  label: string;
  onPress: () => void;
};

function PlayNowButton({
  accessibilityLabel,
  iconName,
  isReward,
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
        isReward && styles.playNowButtonReward,
        pressed && styles.playNowButtonPressed,
      ]}
    >
      <View style={styles.playGlowOuter} />
      <View style={styles.playGlowInner} />
      <SKidsIcon name={iconName} size={92} style={styles.playNowIcon} />
      <View style={styles.playLabelPill}>
        <Text numberOfLines={1} style={styles.playLabel}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function getMapAlignment(index: number): MapAlignment {
  return index % 2 === 0 ? 'left' : 'right';
}

function getRewardAlignment(sceneCount: number): MapAlignment {
  if (sceneCount < 2) {
    return 'right';
  }

  return 'center';
}

function getAlignmentX(alignment: MapAlignment) {
  switch (alignment) {
    case 'left':
      return 24;
    case 'right':
      return 76;
    case 'center':
    default:
      return 50;
  }
}

function percent(value: number): `${number}%` {
  return `${value}%`;
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
  cloudBottom: {
    bottom: 40,
    height: 92,
    left: 48,
    width: 220,
  },
  cloudLeft: {
    height: 72,
    left: -54,
    top: 142,
    width: 150,
  },
  connector: {
    height: connectorHeight,
    position: 'relative',
  },
  connectorDot: {
    borderRadius: radius.pill,
    height: 12,
    marginLeft: -6,
    marginTop: -6,
    position: 'absolute',
    width: 12,
  },
  connectorDotDone: {
    backgroundColor: colors.secondary,
    borderColor: colors.white,
    borderWidth: 2,
  },
  connectorDotIdle: {
    backgroundColor: colors.white,
    borderColor: colors.borderWarm,
    borderWidth: 2,
  },
  container: {
    gap: spacing.lg,
    minHeight: 720,
    overflow: 'hidden',
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  doneBadge: {
    alignItems: 'center',
    backgroundColor: colors.green,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 4,
    height: 42,
    justifyContent: 'center',
    position: 'absolute',
    right: -8,
    top: -8,
    width: 42,
    ...shadows.soft,
  },
  doneBadgeText: {
    color: colors.white,
    fontSize: 25,
    fontWeight: '900',
    lineHeight: 29,
  },
  learningMap: {
    minHeight: 420,
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.md,
    position: 'relative',
  },
  lessonChip: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.borderWarm,
    borderRadius: radius.lg,
    borderWidth: 2,
    flexBasis: '47%',
    flexDirection: 'row',
    flexGrow: 1,
    gap: spacing.sm,
    minHeight: 98,
    padding: spacing.sm,
    ...shadows.soft,
  },
  lessonChipIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 2,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  lessonChipIconSelected: {
    backgroundColor: colors.white,
    borderColor: colors.secondary,
  },
  lessonChipMeta: {
    color: colors.textSoft,
    ...typography.caption,
  },
  lessonChipPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  lessonChipSelected: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
  },
  lessonChipText: {
    flex: 1,
    gap: spacing.xxs,
  },
  lessonChipTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 20,
  },
  lessonSwitcher: {
    gap: spacing.sm,
    zIndex: 1,
  },
  lessonSwitcherHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  lessonSwitcherHint: {
    color: colors.textSoft,
    ...typography.caption,
  },
  lessonSwitcherList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  lessonTitleGroup: {
    flex: 1,
    gap: spacing.xs,
  },
  lockBadge: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 3,
    bottom: 4,
    height: 42,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 42,
    ...shadows.soft,
  },
  lockedIcon: {
    opacity: 0.32,
  },
  mapBackdrop: {
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  mapHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  mapHill: {
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    opacity: 0.28,
    position: 'absolute',
  },
  mapHillLeft: {
    height: 164,
    left: -82,
    top: 90,
    width: 260,
  },
  mapHillRight: {
    height: 220,
    right: -130,
    top: 360,
    width: 330,
  },
  mapStar: {
    color: colors.secondary,
    fontSize: 22,
    fontWeight: '900',
    opacity: 0.58,
    position: 'absolute',
  },
  mapStarOne: {
    right: 62,
    top: 44,
    transform: [{ rotate: '14deg' }],
  },
  mapStarTwo: {
    left: 72,
    top: 330,
    transform: [{ rotate: '-10deg' }],
  },
  mapStop: {
    alignItems: 'center',
    gap: spacing.xs,
    width: 154,
    zIndex: 1,
  },
  mapStopCenter: {
    alignSelf: 'center',
  },
  mapStopLeft: {
    alignSelf: 'flex-start',
  },
  mapStopPressed: {
    opacity: 0.92,
    transform: [{ translateY: 2 }, { scale: 0.98 }],
  },
  mapStopRight: {
    alignSelf: 'flex-end',
  },
  mapTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  parentGate: {
    backgroundColor: colors.white,
    borderColor: colors.white,
    borderRadius: radius.pill,
    height: 72,
    minHeight: 72,
    minWidth: 72,
    width: 72,
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
  playNowButtonReward: {
    backgroundColor: colors.primary,
  },
  playNowIcon: {
    marginTop: -spacing.xs,
  },
  progressChip: {
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
  progressChipText: {
    color: colors.textSoft,
    ...typography.caption,
  },
  rewardGlow: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 5,
    bottom: -12,
    left: -12,
    opacity: 0.78,
    position: 'absolute',
    right: -12,
    top: -12,
  },
  rewardNode: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
  },
  rewardNodeOpen: {
    backgroundColor: colors.white,
    borderColor: colors.secondary,
    ...shadows.warm,
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
  stopGlow: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 5,
    bottom: -12,
    left: -12,
    opacity: 0.78,
    position: 'absolute',
    right: -12,
    top: -12,
  },
  stopNode: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 5,
    height: 132,
    justifyContent: 'center',
    position: 'relative',
    width: 132,
    ...shadows.floating,
  },
  stopNodeCurrent: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
    height: 142,
    width: 142,
  },
  stopNodeDone: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  stopNodeLocked: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
  },
  stopNumber: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    bottom: -4,
    height: 34,
    justifyContent: 'center',
    position: 'absolute',
    right: -4,
    width: 34,
    ...shadows.soft,
  },
  stopNumberText: {
    color: colors.text,
    ...typography.caption,
  },
  stopTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 20,
    maxWidth: 154,
    textAlign: 'center',
    width: 154,
  },
  stopTitleLocked: {
    color: colors.muted,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 38,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  world: {
    gap: spacing.md,
  },
});
