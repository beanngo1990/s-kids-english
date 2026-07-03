import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { type SKidsIconName } from '../assets/icons/skids';
import { AppLogo } from '../components/AppLogo';
import { KidBadge } from '../components/KidBadge';
import { KidIconButton } from '../components/KidIconButton';
import { Screen } from '../components/Screen';
import { SKidsIcon } from '../components/SKidsIcon';
import { lessons } from '../data/lessons';
import { DEFAULT_THEME_ID, getThemeById, themes } from '../data/themes';
import { getParentSettings } from '../engine/ParentSettingsManager';
import { getProgress, type LocalProgress } from '../engine/ProgressManager';
import { colors } from '../theme/colors';
import { layout, radius, spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import type { LearningMode, Lesson, LessonTheme, Scene } from '../types/lesson';
import type { RootStackParamList } from '../types/navigation';
import { getSceneIconName } from '../utils/lessonIcons';
import {
  getSceneProgressId,
  isSceneProgressComplete,
} from '../utils/lessonProgress';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
type MapAlignment = 'left' | 'center' | 'right';

type ThemeMapNode = {
  key: string;
  lessonId: string;
  lessonTitleVi: string;
  scene: Scene;
};

const connectorDots = Array.from({ length: 11 }, (_, index) => index);
const connectorHeight = 82;

export function HomeScreen({ navigation }: Props) {
  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const [learningMode, setLearningMode] = useState<LearningMode>('core');
  const activeThemeId = progress?.activeThemeId ?? DEFAULT_THEME_ID;
  const activeTheme =
    getThemeById(activeThemeId) ?? getThemeById(DEFAULT_THEME_ID) ?? themes[0];
  const themeLessons = useMemo(
    () => getThemeLessons(activeTheme),
    [activeTheme],
  );
  const mapNodes = useMemo(
    () => buildThemeMapNodes(themeLessons),
    [themeLessons],
  );
  const completedSceneIds = useMemo(
    () => new Set(progress?.completedSceneIds ?? []),
    [progress],
  );
  const completedSceneCount = getCompletedThemeNodeCount(
    mapNodes,
    completedSceneIds,
  );
  const isThemeComplete =
    mapNodes.length > 0 &&
    completedSceneCount === mapNodes.length;
  const nextNode = isThemeComplete
    ? undefined
    : getNextThemeNode(mapNodes, completedSceneIds);
  const pendingProgress = progress?.currentLessonProgress;
  const pendingNode = pendingProgress
    ? mapNodes.find(
        node =>
          node.lessonId === pendingProgress.lessonId &&
          node.scene.id === pendingProgress.sceneId,
      )
    : undefined;
  const shouldResumeProgress = Boolean(
    pendingNode && !isThemeNodeComplete(pendingNode, completedSceneIds),
  );
  const primaryLabel = isThemeComplete
    ? 'Ôn lại'
    : shouldResumeProgress
      ? 'Học tiếp'
      : 'Chơi ngay';
  const primaryIconName: SKidsIconName = isThemeComplete ? 'replay' : 'next';
  const ctaNode = shouldResumeProgress && pendingNode
    ? pendingNode
    : nextNode ?? mapNodes[0];
  const ctaSubtitle = ctaNode
    ? `${ctaNode.lessonTitleVi} · ${ctaNode.scene.titleVi}`
    : 'Chọn chủ đề để bắt đầu';

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

  const openNode = (node: ThemeMapNode) => {
    navigation.navigate('ScenePlayer', {
      learningMode,
      lessonId: node.lessonId,
      sceneId: node.scene.id,
    });
  };

  const handleStart = () => {
    if (shouldResumeProgress && pendingNode) {
      openNode(pendingNode);
      return;
    }

    if (nextNode) {
      openNode(nextNode);
      return;
    }

    if (mapNodes[0]) {
      openNode(mapNodes[0]);
      return;
    }

    navigation.navigate('ThemeLibrary');
  };

  return (
    <Screen>
      <View style={styles.shell}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View pointerEvents="none" style={styles.skyDecor}>
              <View style={[styles.cloud, styles.cloudLeft]} />
              <View style={[styles.cloud, styles.cloudBottom]} />
              <Text style={[styles.sparkle, styles.sparkleTop]}>★</Text>
              <Text style={[styles.sparkle, styles.sparkleMid]}>★</Text>
            </View>

            <View style={styles.topBar}>
              <View style={styles.brandCluster}>
                <AppLogo size={52} />
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

            {activeTheme ? (
              <View style={styles.world}>
                <View style={styles.mapHeader}>
                  <View style={styles.lessonTitleGroup}>
                    <KidBadge tone="teal">Siêu bản đồ</KidBadge>
                    <Text style={styles.mapTitle}>{activeTheme.titleVi}</Text>
                    <Text style={styles.mapDescription}>
                      {themeLessons.length} gói bài · {mapNodes.length} trạm
                    </Text>
                  </View>
                  <View style={styles.mapHeaderActions}>
                    <View style={styles.progressChip}>
                      <SKidsIcon name="star" size={22} />
                      <Text style={styles.progressChipText}>
                        {completedSceneCount}/{mapNodes.length}
                      </Text>
                    </View>
                    <Pressable
                      accessibilityLabel="Mở thư viện chủ đề"
                      accessibilityRole="button"
                      onPress={() => navigation.navigate('ThemeLibrary')}
                      style={({ pressed }) => [
                        styles.themeLibraryButton,
                        pressed && styles.themeLibraryButtonPressed,
                      ]}
                    >
                      <SKidsIcon name="map" size={28} />
                      <Text numberOfLines={1} style={styles.themeLibraryText}>
                        Thư viện
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.learningMap}>
                  <View pointerEvents="none" style={styles.mapBackdrop}>
                    <View style={[styles.mapHill, styles.mapHillLeft]} />
                    <View style={[styles.mapHill, styles.mapHillRight]} />
                    <Text style={[styles.mapStar, styles.mapStarOne]}>★</Text>
                    <Text style={[styles.mapStar, styles.mapStarTwo]}>★</Text>
                  </View>

                  {mapNodes.length === 0 ? (
                    <View style={styles.emptyMap}>
                      <KidBadge tone="alert">Chưa có trạm</KidBadge>
                      <Text style={styles.emptyMapTitle}>
                        Chủ đề này chưa có gói bài học.
                      </Text>
                    </View>
                  ) : null}

                  {mapNodes.map((node, index) => {
                    const alignment = getMapAlignment(index);
                    const nextAlignment = getMapAlignment(index + 1);
                    const isCompleted = isThemeNodeComplete(
                      node,
                      completedSceneIds,
                    );
                    const isCurrent =
                      !isThemeComplete && nextNode?.key === node.key;
                    const isUnlocked =
                      isCompleted ||
                      nextNode?.key === node.key ||
                      isThemeComplete;

                    return (
                      <React.Fragment key={node.key}>
                        <SceneMapStop
                          alignment={alignment}
                          index={index}
                          isCompleted={isCompleted}
                          isCurrent={isCurrent}
                          isLocked={!isUnlocked}
                          lessonTitleVi={node.lessonTitleVi}
                          scene={node.scene}
                          onPress={() => {
                            if (!isUnlocked) {
                              return;
                            }

                            openNode(node);
                          }}
                        />
                        {index < mapNodes.length - 1 ? (
                          <MapConnector
                            from={alignment}
                            isComplete={isCompleted}
                            to={nextAlignment}
                          />
                        ) : null}
                      </React.Fragment>
                    );
                  })}
                </View>
              </View>
            ) : null}
          </View>
        </ScrollView>

        <StickyStartButton
          accessibilityLabel={`${primaryLabel}: ${ctaSubtitle}`}
          iconName={primaryIconName}
          isComplete={isThemeComplete}
          label={primaryLabel}
          subtitle={ctaSubtitle}
          onPress={handleStart}
        />
      </View>
    </Screen>
  );
}

type StickyStartButtonProps = {
  accessibilityLabel: string;
  iconName: SKidsIconName;
  isComplete: boolean;
  label: string;
  onPress: () => void;
  subtitle: string;
};

function StickyStartButton({
  accessibilityLabel,
  iconName,
  isComplete,
  label,
  onPress,
  subtitle,
}: StickyStartButtonProps) {
  return (
    <View pointerEvents="box-none" style={styles.stickyFooter}>
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.stickyButton,
          isComplete && styles.stickyButtonComplete,
          pressed && styles.stickyButtonPressed,
        ]}
      >
        <View style={styles.stickyIcon}>
          <SKidsIcon name={iconName} size={48} />
        </View>
        <View style={styles.stickyTextGroup}>
          <Text numberOfLines={1} style={styles.stickyLabel}>
            {label}
          </Text>
          <Text numberOfLines={1} style={styles.stickySubtitle}>
            {subtitle}
          </Text>
        </View>
        <View style={styles.stickyArrow}>
          <SKidsIcon name="next" size={34} />
        </View>
      </Pressable>
    </View>
  );
}

type SceneMapStopProps = {
  alignment: MapAlignment;
  index: number;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  lessonTitleVi: string;
  onPress: () => void;
  scene: Scene;
};

function SceneMapStop({
  alignment,
  index,
  isCompleted,
  isCurrent,
  isLocked,
  lessonTitleVi,
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
        numberOfLines={1}
        style={[styles.stopLessonTitle, isLocked && styles.stopTitleLocked]}
      >
        {lessonTitleVi}
      </Text>
      <Text
        numberOfLines={2}
        style={[styles.stopTitle, isLocked && styles.stopTitleLocked]}
      >
        {scene.titleVi}
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

function getThemeLessons(theme: LessonTheme | undefined): Lesson[] {
  if (!theme) {
    return [];
  }

  return theme.lessonIds
    .map(lessonId => lessons.find(lesson => lesson.id === lessonId))
    .filter((lesson): lesson is Lesson => Boolean(lesson));
}

function buildThemeMapNodes(themeLessons: Lesson[]): ThemeMapNode[] {
  return themeLessons.flatMap(lesson =>
    lesson.scenes.map(scene => ({
      key: getSceneProgressId(lesson.id, scene.id),
      lessonId: lesson.id,
      lessonTitleVi: lesson.titleVi,
      scene,
    })),
  );
}

function getCompletedThemeNodeCount(
  nodes: ThemeMapNode[],
  completedSceneIds: Set<string>,
) {
  return nodes.filter(node => isThemeNodeComplete(node, completedSceneIds))
    .length;
}

function getNextThemeNode(
  nodes: ThemeMapNode[],
  completedSceneIds: Set<string>,
) {
  return nodes.find(node => !isThemeNodeComplete(node, completedSceneIds));
}

function isThemeNodeComplete(
  node: ThemeMapNode | undefined,
  completedSceneIds: Set<string>,
) {
  if (!node) {
    return false;
  }

  return isSceneProgressComplete(
    completedSceneIds,
    node.lessonId,
    node.scene.id,
  );
}

function getMapAlignment(index: number): MapAlignment {
  return index % 2 === 0 ? 'left' : 'right';
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
    flex: 1,
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
    gap: spacing.md,
    minHeight: 720,
    overflow: 'hidden',
    paddingBottom: spacing.xl,
    paddingTop: spacing.xs,
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
  emptyMap: {
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 320,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emptyMapTitle: {
    color: colors.text,
    textAlign: 'center',
    ...typography.subtitle,
  },
  learningMap: {
    minHeight: 520,
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.md,
    position: 'relative',
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
  mapDescription: {
    color: colors.textSoft,
    ...typography.caption,
  },
  mapHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  mapHeaderActions: {
    alignItems: 'flex-end',
    gap: spacing.xs,
    paddingTop: spacing.xs,
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
    height: 64,
    minHeight: 64,
    minWidth: 64,
    width: 64,
    ...shadows.floating,
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
    minWidth: 92,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    ...shadows.soft,
  },
  progressChipText: {
    color: colors.textSoft,
    ...typography.caption,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: layout.screenPadding,
    paddingBottom: 152,
  },
  shell: {
    flex: 1,
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
  stickyArrow: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  stickyButton: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 4,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 86,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.warm,
  },
  stickyButtonComplete: {
    backgroundColor: colors.primary,
  },
  stickyButtonPressed: {
    opacity: 0.92,
    transform: [{ translateY: 2 }, { scale: 0.99 }],
  },
  stickyFooter: {
    bottom: spacing.md,
    left: layout.screenPadding,
    position: 'absolute',
    right: layout.screenPadding,
    zIndex: 20,
  },
  stickyIcon: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  stickyLabel: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 26,
  },
  stickySubtitle: {
    color: colors.textSoft,
    ...typography.caption,
  },
  stickyTextGroup: {
    flex: 1,
    gap: spacing.xxs,
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
  stopLessonTitle: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 16,
    maxWidth: 154,
    textAlign: 'center',
    width: 154,
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
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 34,
  },
  themeLibraryButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.primarySoft,
    borderRadius: radius.pill,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.xxs,
    minHeight: 42,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    ...shadows.soft,
  },
  themeLibraryButtonPressed: {
    opacity: 0.9,
    transform: [{ translateY: 1 }, { scale: 0.98 }],
  },
  themeLibraryText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 18,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  world: {
    gap: spacing.md,
  },
});
