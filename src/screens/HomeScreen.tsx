import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
import { getLessonIconName, getSceneIconName } from '../utils/lessonIcons';
import {
  getSceneProgressId,
  isSceneProgressComplete,
} from '../utils/lessonProgress';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
type MapAlignment = 'left' | 'center' | 'right';

type ThemeMapNode = {
  key: string;
  lessonId: string;
  lessonIndex: number;
  lessonTitleVi: string;
  sceneCountInLesson: number;
  sceneIndexInLesson: number;
  scene: Scene;
};

type ThemeMapSection = {
  key: string;
  lesson: Lesson;
  lessonIndex: number;
  nodes: ThemeMapNode[];
};

const connectorDots = Array.from({ length: 9 }, (_, index) => index);
const connectorHeight = 56;
const connectorLongHeight = 86;
const connectorShortHeight = 44;
const duplicateSceneIconFallbacks: Partial<Record<string, SKidsIconName>> = {
  classroom: 'teacherInstructions',
  'go-to-school': 'schoolSupplies',
  school: 'schoolSupplies',
};

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
  const mapSections = useMemo(
    () => buildThemeMapSections(themeLessons),
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
  const ctaLessonProgress = ctaNode
    ? getLessonNodeProgress(mapNodes, ctaNode.lessonId, completedSceneIds)
    : undefined;

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
                <AppLogo size={38} />
                <View style={styles.brandText}>
                  <Text style={styles.title}>S-Kids</Text>
                </View>
              </View>
              <View style={styles.topActions}>
                <TopProgressStatus
                  completed={completedSceneCount}
                  isComplete={isThemeComplete}
                  total={mapNodes.length}
                />
                <KidIconButton
                  accessibilityLabel="Góc phụ huynh"
                  icon="parentLock"
                  onPress={() => navigation.navigate('Parent')}
                  size="md"
                  style={styles.parentGate}
                  tone="quiet"
                />
              </View>
            </View>

            {activeTheme ? (
              <View style={styles.world}>


                <View style={styles.learningMap}>
                  <View pointerEvents="none" style={styles.mapBackdrop}>
                    <View style={[styles.mapTrailRibbon, styles.mapTrailTop]} />
                    <View style={[styles.mapTrailRibbon, styles.mapTrailMid]} />
                    <View style={[styles.mapTrailRibbon, styles.mapTrailLow]} />
                    <View style={[styles.mapHill, styles.mapHillLeft]} />
                    <View style={[styles.mapHill, styles.mapHillRight]} />
                    <View style={[styles.mapHill, styles.mapHillLower]} />
                    <View style={[styles.mapCloud, styles.mapCloudTop]}>
                      <View style={[styles.mapCloudPuff, styles.mapCloudPuffOne]} />
                      <View style={[styles.mapCloudPuff, styles.mapCloudPuffTwo]} />
                      <View style={[styles.mapCloudPuff, styles.mapCloudPuffThree]} />
                    </View>
                    <View style={[styles.mapCloud, styles.mapCloudMiddle]}>
                      <View style={[styles.mapCloudPuff, styles.mapCloudPuffOne]} />
                      <View style={[styles.mapCloudPuff, styles.mapCloudPuffTwo]} />
                      <View style={[styles.mapCloudPuff, styles.mapCloudPuffThree]} />
                    </View>
                    <View style={[styles.mapBrush, styles.mapBrushLeft]}>
                      <View style={[styles.mapBrushLeaf, styles.mapBrushLeafOne]} />
                      <View style={[styles.mapBrushLeaf, styles.mapBrushLeafTwo]} />
                      <View style={[styles.mapBrushLeaf, styles.mapBrushLeafThree]} />
                    </View>
                    <View style={[styles.mapBrush, styles.mapBrushRight]}>
                      <View style={[styles.mapBrushLeaf, styles.mapBrushLeafOne]} />
                      <View style={[styles.mapBrushLeaf, styles.mapBrushLeafTwo]} />
                      <View style={[styles.mapBrushLeaf, styles.mapBrushLeafThree]} />
                    </View>
                    <Text style={[styles.mapStar, styles.mapStarOne]}>★</Text>
                    <Text style={[styles.mapStar, styles.mapStarTwo]}>★</Text>
                    <Text style={[styles.mapStar, styles.mapStarThree]}>★</Text>
                  </View>

                  {mapNodes.length === 0 ? (
                    <View style={styles.emptyMap}>
                      <KidBadge tone="alert">Chưa có trạm</KidBadge>
                      <Text style={styles.emptyMapTitle}>
                        Chủ đề này chưa có gói bài học.
                      </Text>
                    </View>
                  ) : null}

                  {mapSections.map(section => {
                    const lessonIconName = getLessonIconName({
                      id: section.lesson.id,
                    });
                    const lessonProgress = getLessonNodeProgress(
                      mapNodes,
                      section.lesson.id,
                      completedSceneIds,
                    );
                    const isLessonCompleted = Boolean(
                      lessonProgress.total > 0 &&
                      lessonProgress.completed === lessonProgress.total,
                    );
                    const isLessonCurrent = Boolean(
                      !isThemeComplete &&
                      ctaNode?.lessonId === section.lesson.id,
                    );
                    const lessonMonumentAlignment = getLessonMonumentAlignment();
                    const firstNode = section.nodes[0];
                    const firstNodeAlignment = getSectionMapAlignment(
                      0,
                      section.lessonIndex,
                    );
                    const isFirstNodePathActive = Boolean(
                      firstNode &&
                      (isThemeNodeComplete(firstNode, completedSceneIds) ||
                        ctaNode?.key === firstNode.key ||
                        isThemeComplete),
                    );

                    return (
                      <View key={section.key} style={styles.lessonSection}>
                        <LessonSectionHeader
                          isCompleted={isLessonCompleted}
                          isCurrent={isLessonCurrent}
                          lessonIndex={section.lessonIndex}
                          title={section.lesson.titleVi}
                        />
                        <View style={styles.lessonSectionBody}>
                          <View
                            pointerEvents="none"
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              zIndex: 0,
                            }}
                          >
                            {section.lessonIndex % 2 === 0 ? (
                              <>
                                <Text style={[styles.mapEmoji, { top: '15%', left: '10%' }]}>🌲</Text>
                                <Text style={[styles.mapEmoji, { top: '45%', right: '15%' }]}>🌸</Text>
                                <Text style={[styles.mapEmoji, { top: '75%', left: '20%', transform: [{ rotate: '15deg' }] }]}>🦋</Text>
                                <Text style={[styles.mapEmoji, { top: '90%', right: '10%', fontSize: 30 }]}>🍄</Text>
                              </>
                            ) : (
                              <>
                                <Text style={[styles.mapEmoji, { top: '20%', right: '15%' }]}>🌲</Text>
                                <Text style={[styles.mapEmoji, { top: '50%', left: '10%', fontSize: 28 }]}>🦆</Text>
                                <Text style={[styles.mapEmoji, { top: '80%', right: '20%', fontSize: 32 }]}>☀️</Text>
                                <Text style={[styles.mapEmoji, { top: '10%', left: '25%' }]}>☁️</Text>
                              </>
                            )}
                          </View>
                          {section.lessonIndex > 0 && firstNode ? (
                            <MapConnector
                              from={lessonMonumentAlignment}
                              isComplete={isFirstNodePathActive}
                              size="short"
                              to={firstNodeAlignment}
                            />
                          ) : null}

                          {section.nodes.map((node, nodeIndex) => {
                            const alignment = getSectionMapAlignment(
                              nodeIndex,
                              section.lessonIndex,
                            );
                            const nextAlignment = getSectionMapAlignment(
                              nodeIndex + 1,
                              section.lessonIndex,
                            );
                            const isCompleted = isThemeNodeComplete(
                              node,
                              completedSceneIds,
                            );
                            const isCurrent =
                              !isThemeComplete && ctaNode?.key === node.key;
                            const isUnlocked =
                              isCompleted ||
                              ctaNode?.key === node.key ||
                              nextNode?.key === node.key ||
                              isThemeComplete;

                            return (
                              <React.Fragment key={node.key}>
                                <SceneMapStop
                                  alignment={alignment}
                                  isCompleted={isCompleted}
                                  isCurrent={isCurrent}
                                  isLocked={!isUnlocked}
                                  lessonCount={themeLessons.length}
                                  lessonIndex={node.lessonIndex}
                                  lessonTitleVi={node.lessonTitleVi}
                                  iconName={getMapSceneIconName(
                                    node.scene,
                                    lessonIconName,
                                  )}
                                  sceneCountInLesson={node.sceneCountInLesson}
                                  sceneIndexInLesson={node.sceneIndexInLesson}
                                  scene={node.scene}
                                  onPress={() => {
                                    if (!isUnlocked) {
                                      return;
                                    }

                                    openNode(node);
                                  }}
                                />
                                {nodeIndex < section.nodes.length - 1 ? (
                                  <MapConnector
                                    from={alignment}
                                    isComplete={isCompleted}
                                    to={nextAlignment}
                                  />
                                ) : null}
                              </React.Fragment>
                            );
                          })}

                          {section.nodes.length > 0 ? (
                            <>
                              <MapConnector
                                from={getSectionMapAlignment(
                                  section.nodes.length - 1,
                                  section.lessonIndex,
                                )}
                                isComplete={isLessonCompleted}
                                size="long"
                                to={lessonMonumentAlignment}
                              />

                              <LessonMilestone
                                alignment={lessonMonumentAlignment}
                                iconName={lessonIconName}
                                isCompleted={isLessonCompleted}
                                isCurrent={isLessonCurrent}
                                titleVi={section.lesson.titleVi}
                              />

                              {section.lessonIndex < mapSections.length - 1 ? (
                                <MapConnector
                                  from={lessonMonumentAlignment}
                                  isComplete={isLessonCompleted}
                                  size="long"
                                  to={lessonMonumentAlignment}
                                />
                              ) : null}
                            </>
                          ) : null}
                        </View>
                      </View>
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
          onPress={handleStart}
        />
      </View>
    </Screen>
  );
}

type CourseBannerProps = {
  activeThemeTitle: string;
  completedInTheme: number;
  currentLessonProgress: {
    completed: number;
    total: number;
  };
  isThemeComplete: boolean;
  lessonCount: number;
  node: ThemeMapNode;
  onOpenLibrary: () => void;
  totalInTheme: number;
};

function CourseBanner({
  activeThemeTitle,
  completedInTheme,
  currentLessonProgress,
  isThemeComplete,
  lessonCount,
  node,
  onOpenLibrary,
  totalInTheme,
}: CourseBannerProps) {
  const progressCompleted = isThemeComplete
    ? completedInTheme
    : currentLessonProgress.completed;
  const progressTotal = isThemeComplete
    ? totalInTheme
    : currentLessonProgress.total;
  const progressPercent =
    progressTotal > 0
      ? Math.round((progressCompleted / progressTotal) * 100)
      : 0;

  return (
    <View style={styles.courseBanner}>
      <View style={styles.courseText}>
        <Text style={styles.courseEyebrow}>
          {isThemeComplete
            ? 'SIÊU BẢN ĐỒ'
            : `BÀI ${node.lessonIndex + 1}/${lessonCount}`}
        </Text>
        <Text numberOfLines={1} style={styles.courseTitle}>
          {isThemeComplete ? activeThemeTitle : node.lessonTitleVi}
        </Text>
        <View style={styles.courseMetaRow}>
          <SKidsIcon name="star" size={18} />
          <Text style={styles.courseMetaText}>
            Sao {progressCompleted}/{progressTotal}
          </Text>
        </View>
        <View
          accessibilityLabel={`Bé đã thu thập ${progressCompleted} trên ${progressTotal} sao trong mục này`}
          accessibilityRole="progressbar"
          style={styles.courseProgressTrack}
        >
          <View
            style={[
              styles.courseProgressFill,
              {
                width: percent(progressPercent),
              },
            ]}
          />
        </View>
      </View>
      <Pressable
        accessibilityLabel="Mở thư viện chủ đề"
        accessibilityRole="button"
        onPress={onOpenLibrary}
        style={({ pressed }) => [
          styles.courseLibraryButton,
          pressed && styles.courseLibraryButtonPressed,
        ]}
      >
        <SKidsIcon name="map" size={28} />
      </Pressable>
    </View>
  );
}

type TopProgressStatusProps = {
  completed: number;
  isComplete: boolean;
  total: number;
};

function TopProgressStatus({
  completed,
  isComplete,
  total,
}: TopProgressStatusProps) {
  const safeTotal = Math.max(total, 0);
  const safeCompleted = Math.min(Math.max(completed, 0), safeTotal);
  const progressPercent =
    safeTotal > 0 ? Math.round((safeCompleted / safeTotal) * 100) : 0;

  return (
    <View
      accessibilityLabel={`Bé có ${safeCompleted} sao trong ${safeTotal} trạm`}
      accessibilityRole="progressbar"
      style={styles.topStatusCard}
    >
      <View style={styles.topStatusRow}>
        <SKidsIcon name="star" size={22} />
        <Text style={styles.topStatusCount}>x {safeCompleted}</Text>
      </View>
      <View style={styles.topStatusTrack}>
        <View
          style={[
            styles.topStatusFill,
            {
              width: percent(progressPercent),
            },
          ]}
        />
      </View>
      <Text numberOfLines={1} style={styles.topStatusCaption}>
        {isComplete ? 'Đủ sao!' : `${safeCompleted}/${safeTotal}`}
      </Text>
    </View>
  );
}

type StickyStartButtonProps = {
  accessibilityLabel: string;
  iconName: SKidsIconName;
  isComplete: boolean;
  label: string;
  onPress: () => void;
};

function StickyStartButton({
  accessibilityLabel,
  iconName,
  isComplete,
  label,
  onPress,
}: StickyStartButtonProps) {
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          duration: 780,
          easing: Easing.out(Easing.quad),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          duration: 780,
          easing: Easing.in(Easing.quad),
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.delay(1400),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [breathe]);

  const buttonScale = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.025],
  });

  return (
    <View pointerEvents="box-none" style={styles.stickyFooter}>
      <Animated.View
        style={[
          styles.stickyButtonBreather,
          {
            transform: [{ scale: buttonScale }],
          },
        ]}
      >
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
          <View pointerEvents="none" style={styles.stickyButtonGloss} />
          <View pointerEvents="none" style={styles.stickyButtonLip} />
          <View style={styles.stickyIcon}>
            <SKidsIcon name={iconName} size={34} />
          </View>
          <View style={styles.stickyTextGroup}>
            <Text numberOfLines={1} style={styles.stickyLabel}>
              {label}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

type SceneMapStopProps = {
  alignment: MapAlignment;
  iconName: SKidsIconName;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  lessonCount: number;
  lessonIndex: number;
  lessonTitleVi: string;
  onPress: () => void;
  sceneCountInLesson: number;
  sceneIndexInLesson: number;
  scene: Scene;
};

function SceneMapStop({
  alignment,
  iconName,
  isCompleted,
  isCurrent,
  isLocked,
  lessonCount,
  lessonIndex,
  lessonTitleVi,
  onPress,
  sceneCountInLesson,
  sceneIndexInLesson,
  scene,
}: SceneMapStopProps) {
  const pulse = useRef(new Animated.Value(0)).current;
  const lessonPosition = `Bài ${lessonIndex + 1
    }/${lessonCount}: ${lessonTitleVi}, trạm ${sceneIndexInLesson + 1
    }/${sceneCountInLesson}`;
  const accessibilityLabel = isLocked
    ? `${lessonPosition}: ${scene.titleVi} chưa mở khóa`
    : `${lessonPosition}: ${isCompleted ? 'Chơi lại' : 'Học tiếp'
    } ${scene.titleVi}`;

  useEffect(() => {
    if (!isCurrent) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          duration: 860,
          easing: Easing.out(Easing.quad),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          duration: 860,
          easing: Easing.in(Easing.quad),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [isCurrent, pulse]);

  const currentScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.055],
  });
  const glowScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });
  const glowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.56, 0.88],
  });
  const bubbleLift = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });

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
        isLocked && styles.mapStopLocked,
        pressed && !isLocked && styles.mapStopPressed,
      ]}
    >

      <Animated.View
        style={[
          styles.stopNode,
          isCompleted && styles.stopNodeDone,
          isCurrent && styles.stopNodeCurrent,
          isLocked && styles.stopNodeLocked,
          isCurrent && {
            transform: [{ scale: currentScale }],
          },
        ]}
      >
        {isCurrent ? (
          <>
            <Animated.View
              style={[
                styles.stopGlow,
                {
                  opacity: glowOpacity,
                  transform: [{ scale: glowScale }],
                },
              ]}
            />
            <Text style={[styles.stopSparkle, styles.stopSparkleTop]}>★</Text>
            <Text style={[styles.stopSparkle, styles.stopSparkleBottom]}>
              ★
            </Text>
          </>
        ) : null}
        <SKidsIcon
          name={iconName}
          size={isCurrent ? 64 : isLocked ? 44 : 52}
          style={isLocked ? styles.lockedIcon : undefined}
        />
        <View style={styles.stopNumber}>
          <Text style={styles.stopNumberText}>
            {sceneIndexInLesson + 1}
          </Text>
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
      </Animated.View>
    </Pressable>
  );
}

type LessonMilestoneProps = {
  alignment: MapAlignment;
  iconName: SKidsIconName;
  isCompleted: boolean;
  isCurrent: boolean;
  titleVi: string;
};

type LessonSectionHeaderProps = {
  isCompleted: boolean;
  isCurrent: boolean;
  lessonIndex: number;
  title: string;
};

function LessonSectionHeader({
  isCompleted,
  isCurrent,
  lessonIndex,
  title,
}: LessonSectionHeaderProps) {
  const hasTransition = lessonIndex > 0;

  return (
    <View
      style={[
        styles.lessonSectionHeader,
        hasTransition && styles.lessonSectionHeaderWithTransition,
      ]}
    >
      {hasTransition ? (
        <View pointerEvents="none" style={styles.lessonEnvironmentTransition}>
          <View style={styles.lessonRiver}>
            <View
              style={[
                styles.lessonRiverWave,
                styles.lessonRiverWaveTop,
              ]}
            />
            <View
              style={[
                styles.lessonRiverWave,
                styles.lessonRiverWaveBottom,
              ]}
            />
          </View>
          <View style={styles.lessonBridge}>
            {Array.from({ length: 5 }).map((_, index) => (
              <View key={index} style={styles.lessonBridgePlank} />
            ))}
          </View>
          <View
            style={[
              styles.lessonRiverStone,
              styles.lessonRiverStoneLeft,
            ]}
          />
          <View
            style={[
              styles.lessonRiverStone,
              styles.lessonRiverStoneRight,
            ]}
          />
          <View
            style={[
              styles.lessonGrassPatch,
              styles.lessonGrassPatchLeft,
            ]}
          />
          <View
            style={[
              styles.lessonGrassPatch,
              styles.lessonGrassPatchRight,
            ]}
          />
        </View>
      ) : null}

      <View style={styles.lessonSign}>
        <View style={[styles.lessonSignPost, styles.lessonSignPostLeft]} />
        <View style={[styles.lessonSignPost, styles.lessonSignPostRight]} />
        <View
          style={[
            styles.lessonSignBoard,
            isCurrent && styles.lessonSignBoardCurrent,
            isCompleted && styles.lessonSignBoardDone,
          ]}
        >
          <View style={styles.lessonSignBoardShine} />
          <View style={styles.lessonSignRivetLeft} />
          <View style={styles.lessonSignRivetRight} />
        </View>
        <Text
          style={[
            styles.lessonSectionLabel,
            isCurrent && styles.lessonSectionLabelCurrent,
            isCompleted && styles.lessonSectionLabelDone,
          ]}
        >
          {title}
        </Text>
      </View>
    </View>
  );
}

function LessonMilestone({
  alignment,
  iconName,
  isCompleted,
  isCurrent,
  titleVi,
}: LessonMilestoneProps) {
  const starRating = getLessonStarRating(isCompleted);

  return (
    <View
      accessibilityLabel={`Bài ${titleVi} đạt ${starRating} trên 3 sao`}
      style={[
        styles.lessonMilestone,
        alignment === 'left' && styles.lessonMilestoneLeft,
        alignment === 'center' && styles.lessonMilestoneCenter,
        alignment === 'right' && styles.lessonMilestoneRight,
      ]}
    >
      <View
        style={[
          styles.lessonMonumentStage,
          isCurrent && styles.lessonMonumentStageCurrent,
          isCompleted && styles.lessonMonumentStageDone,
        ]}
      >
        {(isCurrent || isCompleted) ? (
          <View
            style={[
              styles.lessonMonumentGlow,
              isCompleted && styles.lessonMonumentGlowDone,
            ]}
          />
        ) : null}
        {(isCurrent || isCompleted) ? (
          <>
            <Text
              style={[
                styles.lessonMonumentSparkle,
                styles.lessonMonumentSparkleLeft,
              ]}
            >
              ★
            </Text>
            <Text
              style={[
                styles.lessonMonumentSparkle,
                styles.lessonMonumentSparkleRight,
              ]}
            >
              ★
            </Text>
          </>
        ) : null}
        <View style={styles.lessonMonumentIllustration}>
          <SKidsIcon
            name={iconName}
            size={isCompleted ? 92 : isCurrent ? 88 : 82}
            style={[
              styles.lessonMonumentIcon,
              !isCurrent && !isCompleted && styles.lessonMonumentIconIdle,
            ]}
          />
        </View>
        <View style={styles.lessonMonumentIslandShadow} />
        <View
          style={[
            styles.lessonMonumentHill,
            isCurrent && styles.lessonMonumentHillCurrent,
            isCompleted && styles.lessonMonumentHillDone,
          ]}
        >
          <View style={styles.lessonMonumentHillHighlight} />
          <View style={styles.lessonMonumentHillDepth} />
          <View
            style={[
              styles.lessonMonumentGrassTuft,
              styles.lessonMonumentGrassTuftLeft,
            ]}
          />
          <View
            style={[
              styles.lessonMonumentGrassTuft,
              styles.lessonMonumentGrassTuftRight,
            ]}
          />
        </View>
        <View
          style={[
            styles.lessonMonumentBase,
            isCurrent && styles.lessonMonumentBaseCurrent,
            isCompleted && styles.lessonMonumentBaseDone,
          ]}
        >
          <View style={styles.lessonMonumentBaseShine} />
          <View style={styles.lessonMilestoneStars}>
            {Array.from({ length: 3 }).map((_, index) => {
              const isFilled = index < starRating;

              return (
                <Text
                  key={index}
                  style={[
                    styles.lessonMilestoneStar,
                    isFilled
                      ? styles.lessonMilestoneStarFilled
                      : styles.lessonMilestoneStarEmpty,
                  ]}
                >
                  ★
                </Text>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

type MapConnectorProps = {
  from: MapAlignment;
  isComplete: boolean;
  size?: 'default' | 'long' | 'short';
  to: MapAlignment;
};

function MapConnector({
  from,
  isComplete,
  size = 'default',
  to,
}: MapConnectorProps) {
  const fromOffset = getAlignmentOffset(from);
  const toOffset = getAlignmentOffset(to);
  const height = getConnectorHeight(size);

  return (
    <View
      pointerEvents="none"
      style={[
        styles.connector,
        size === 'long' && styles.connectorLong,
        size === 'short' && styles.connectorShort,
      ]}
    >
      {connectorDots.map(dot => {
        const progress = (dot + 1) / (connectorDots.length + 1);
        const easedProgress = easePathProgress(progress);
        const wave = Math.sin(progress * Math.PI * 2) * 8;
        const xOffset = fromOffset + (toOffset - fromOffset) * easedProgress + wave;
        const y = progress * height;

        return (
          <View
            key={dot}
            style={[
              styles.connectorDot,
              styles.connectorDotOnPath,
              isComplete ? styles.connectorDotDone : styles.connectorDotIdle,
              {
                marginLeft: xOffset - 4.5,
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
  return themeLessons.flatMap((lesson, lessonIndex) =>
    lesson.scenes.map((scene, sceneIndexInLesson) => ({
      key: getSceneProgressId(lesson.id, scene.id),
      lessonId: lesson.id,
      lessonIndex,
      lessonTitleVi: lesson.titleVi,
      sceneCountInLesson: lesson.scenes.length,
      sceneIndexInLesson,
      scene,
    })),
  );
}

function buildThemeMapSections(themeLessons: Lesson[]): ThemeMapSection[] {
  return themeLessons.map((lesson, lessonIndex) => ({
    key: lesson.id,
    lesson,
    lessonIndex,
    nodes: lesson.scenes.map((scene, sceneIndexInLesson) => ({
      key: getSceneProgressId(lesson.id, scene.id),
      lessonId: lesson.id,
      lessonIndex,
      lessonTitleVi: lesson.titleVi,
      sceneCountInLesson: lesson.scenes.length,
      sceneIndexInLesson,
      scene,
    })),
  }));
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

function getLessonNodeProgress(
  nodes: ThemeMapNode[],
  lessonId: string,
  completedSceneIds: Set<string>,
) {
  const lessonNodes = nodes.filter(node => node.lessonId === lessonId);
  const completed = lessonNodes.filter(node =>
    isThemeNodeComplete(node, completedSceneIds),
  ).length;

  return {
    completed,
    total: lessonNodes.length,
  };
}

function getLessonStarRating(isCompleted: boolean) {
  return isCompleted ? 3 : 0;
}

function getMapSceneIconName(
  scene: Pick<Scene, 'id'>,
  lessonIconName: SKidsIconName,
): SKidsIconName {
  const sceneIconName = getSceneIconName(scene);

  if (sceneIconName !== lessonIconName) {
    return sceneIconName;
  }

  return duplicateSceneIconFallbacks[scene.id] ?? 'schoolSupplies';
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

function getSectionMapAlignment(
  sceneIndexInLesson: number,
  lessonIndex: number,
): MapAlignment {
  const startsLeft = lessonIndex % 2 === 0;
  const pattern: MapAlignment[] = startsLeft
    ? ['center', 'left', 'right', 'center']
    : ['center', 'right', 'left', 'center'];

  return pattern[sceneIndexInLesson % pattern.length];
}

function getLessonMonumentAlignment(): MapAlignment {
  return 'center';
}

function getAlignmentOffset(alignment: MapAlignment) {
  switch (alignment) {
    case 'left':
      return -90;
    case 'right':
      return 90;
    case 'center':
    default:
      return 0;
  }
}

function getConnectorHeight(size: NonNullable<MapConnectorProps['size']>) {
  switch (size) {
    case 'long':
      return connectorLongHeight;
    case 'short':
      return connectorShortHeight;
    case 'default':
    default:
      return connectorHeight;
  }
}

function easePathProgress(value: number) {
  return 0.5 - Math.cos(value * Math.PI) / 2;
}

function percent(value: number): `${number}%` {
  return `${value}%`;
}

const styles = StyleSheet.create({
  brandCluster: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  brandText: {
    gap: spacing.xxs,
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
  connectorLong: {
    height: connectorLongHeight,
  },
  connectorShort: {
    height: connectorShortHeight,
  },
  connectorDot: {
    borderRadius: radius.pill,
    height: 9,
    marginLeft: -4.5,
    marginTop: -4.5,
    position: 'absolute',
    width: 9,
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
  connectorDotOnPath: {
    left: '50%',
  },
  container: {
    gap: spacing.sm,
    minHeight: 720,
    overflow: 'hidden',
    paddingBottom: spacing.xl,
    paddingTop: spacing.xs,
  },
  courseBanner: {
    alignItems: 'center',
    backgroundColor: colors.skyDeep,
    borderColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 76,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    ...shadows.floating,
  },
  courseEyebrow: {
    color: colors.backgroundCool,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 14,
  },
  courseLibraryButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.backgroundCool,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 44,
    justifyContent: 'center',
    width: 44,
    ...shadows.soft,
  },
  courseLibraryButtonPressed: {
    opacity: 0.9,
    transform: [{ translateY: 1 }, { scale: 0.98 }],
  },
  courseMetaRow: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
  },
  courseMetaText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 15,
  },
  courseProgressFill: {
    backgroundColor: colors.secondary,
    borderRadius: radius.pill,
    height: '100%',
  },
  courseProgressTrack: {
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
    borderColor: 'rgba(255, 255, 255, 0.42)',
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 8,
    marginTop: 2,
    overflow: 'hidden',
    width: '100%',
  },
  courseText: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  courseTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 22,
  },
  currentBubble: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 3,
    marginBottom: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    ...shadows.warm,
  },
  currentBubbleText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 16,
  },
  doneBadge: {
    alignItems: 'center',
    backgroundColor: colors.green,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 3,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: -6,
    top: -6,
    width: 32,
    ...shadows.soft,
  },
  doneBadgeText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 22,
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
    paddingTop: spacing.sm,
    position: 'relative',
  },
  lessonSection: {
    marginBottom: spacing.sm,
  },
  lessonSectionBody: {
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
    position: 'relative',
  },
  lessonSectionHeader: {
    alignItems: 'center',
    marginBottom: spacing.xs,
    marginTop: spacing.md,
    minHeight: 58,
    position: 'relative',
  },
  lessonSectionHeaderWithTransition: {
    marginTop: spacing.xl,
    minHeight: 112,
    paddingTop: spacing.xl,
  },
  lessonSectionLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
    left: 16,
    letterSpacing: 0,
    lineHeight: 17,
    position: 'absolute',
    textAlign: 'center',
    top: 21,
    width: 144,
    zIndex: 4,
  },
  lessonSectionLabelCurrent: {
    color: colors.text,
  },
  lessonSectionLabelDone: {
    color: colors.primaryDark,
  },
  lessonBridge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
    height: 44,
    justifyContent: 'center',
    position: 'absolute',
    top: 14,
    transform: [{ rotate: '3deg' }],
    zIndex: 2,
  },
  lessonBridgePlank: {
    backgroundColor: colors.borderWarm,
    borderColor: colors.secondaryDark,
    borderRadius: radius.sm,
    borderWidth: 1,
    height: 38,
    width: 18,
  },
  lessonEnvironmentTransition: {
    alignItems: 'center',
    height: 72,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  lessonGrassPatch: {
    backgroundColor: colors.mint,
    borderRadius: radius.pill,
    bottom: 10,
    height: 18,
    opacity: 0.72,
    position: 'absolute',
    width: 74,
  },
  lessonGrassPatchLeft: {
    left: 0,
    transform: [{ rotate: '-8deg' }],
  },
  lessonGrassPatchRight: {
    right: 4,
    transform: [{ rotate: '7deg' }],
  },
  lessonRiver: {
    backgroundColor: colors.sky,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 38,
    left: -72,
    overflow: 'hidden',
    position: 'absolute',
    right: -72,
    top: 18,
    transform: [{ rotate: '-3deg' }],
    ...shadows.soft,
  },
  lessonRiverStone: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 20,
    opacity: 0.82,
    position: 'absolute',
    top: 45,
    width: 34,
    zIndex: 2,
  },
  lessonRiverStoneLeft: {
    left: 58,
    transform: [{ rotate: '-8deg' }],
  },
  lessonRiverStoneRight: {
    right: 62,
    transform: [{ rotate: '10deg' }],
  },
  lessonRiverWave: {
    backgroundColor: 'rgba(255, 255, 255, 0.52)',
    borderRadius: radius.pill,
    height: 5,
    position: 'absolute',
    width: 182,
  },
  lessonRiverWaveBottom: {
    right: 32,
    top: 24,
  },
  lessonRiverWaveTop: {
    left: 28,
    top: 9,
  },
  lessonSign: {
    alignItems: 'center',
    height: 60,
    justifyContent: 'center',
    position: 'relative',
    width: 176,
    zIndex: 3,
  },
  lessonSignBoard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.borderWarm,
    borderRadius: radius.md,
    borderWidth: 2,
    height: 48,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    width: 160,
    zIndex: 3,
    ...shadows.soft,
  },
  lessonSignBoardCurrent: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
  },
  lessonSignBoardDone: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  lessonSignBoardShine: {
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
    borderRadius: radius.pill,
    height: 10,
    left: 10,
    position: 'absolute',
    right: 10,
    top: 5,
  },
  lessonSignPost: {
    backgroundColor: colors.secondaryDark,
    borderColor: colors.white,
    borderRadius: radius.sm,
    borderWidth: 1,
    bottom: 0,
    height: 30,
    position: 'absolute',
    width: 8,
    zIndex: 1,
  },
  lessonSignPostLeft: {
    left: 68,
  },
  lessonSignPostRight: {
    right: 68,
  },
  lessonSignRivetLeft: {
    backgroundColor: colors.secondaryDark,
    borderRadius: radius.pill,
    height: 5,
    left: 11,
    position: 'absolute',
    top: 16,
    width: 5,
  },
  lessonSignRivetRight: {
    backgroundColor: colors.secondaryDark,
    borderRadius: radius.pill,
    height: 5,
    position: 'absolute',
    right: 11,
    top: 16,
    width: 5,
  },
  lessonMilestone: {
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.xs,
    width: 176,
    zIndex: 2,
  },
  lessonMilestoneCenter: {
    alignSelf: 'center',
  },
  lessonMilestoneLeft: {
    transform: [{ translateX: -90 }],
  },
  lessonMilestoneRight: {
    transform: [{ translateX: 90 }],
  },
  lessonMilestoneStar: {
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 19,
  },
  lessonMilestoneStarEmpty: {
    color: colors.borderWarm,
    opacity: 0.48,
  },
  lessonMilestoneStarFilled: {
    color: colors.secondary,
    textShadowColor: colors.white,
    textShadowOffset: {
      height: 1,
      width: 0,
    },
    textShadowRadius: 3,
  },
  lessonMilestoneStars: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.borderWarm,
    borderRadius: radius.pill,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 1,
    justifyContent: 'center',
    minWidth: 78,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    position: 'relative',
    ...shadows.soft,
  },
  lessonMonumentBase: {
    alignItems: 'center',
    backgroundColor: colors.borderWarm,
    borderColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 3,
    bottom: 0,
    height: 46,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'absolute',
    width: 132,
    zIndex: 4,
    ...shadows.soft,
  },
  lessonMonumentBaseCurrent: {
    backgroundColor: colors.secondary,
    borderColor: colors.white,
    ...shadows.floating,
  },
  lessonMonumentBaseDone: {
    backgroundColor: colors.secondary,
    borderColor: colors.white,
    ...shadows.warm,
  },
  lessonMonumentBaseShine: {
    backgroundColor: 'rgba(255, 255, 255, 0.34)',
    borderRadius: radius.pill,
    height: 13,
    left: 12,
    position: 'absolute',
    right: 12,
    top: 6,
  },
  lessonMonumentGlow: {
    backgroundColor: colors.skyDeep,
    borderRadius: radius.pill,
    bottom: 20,
    height: 128,
    opacity: 0.18,
    position: 'absolute',
    width: 152,
  },
  lessonMonumentGlowDone: {
    backgroundColor: colors.secondary,
    opacity: 0.28,
  },
  lessonMonumentGrassTuft: {
    backgroundColor: colors.mint,
    borderRadius: radius.pill,
    height: 18,
    position: 'absolute',
    top: 6,
    width: 42,
    zIndex: 3,
  },
  lessonMonumentGrassTuftLeft: {
    left: 18,
    transform: [{ rotate: '-9deg' }],
  },
  lessonMonumentGrassTuftRight: {
    right: 18,
    transform: [{ rotate: '8deg' }],
  },
  lessonMonumentHill: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 4,
    bottom: 30,
    height: 58,
    overflow: 'hidden',
    position: 'absolute',
    width: 164,
    zIndex: 2,
    ...shadows.soft,
  },
  lessonMonumentHillCurrent: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
  },
  lessonMonumentHillDone: {
    backgroundColor: colors.mint,
    borderColor: colors.primary,
  },
  lessonMonumentHillDepth: {
    backgroundColor: 'rgba(17, 123, 120, 0.18)',
    bottom: 0,
    height: 18,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  lessonMonumentHillHighlight: {
    backgroundColor: 'rgba(255, 255, 255, 0.34)',
    borderRadius: radius.pill,
    height: 14,
    left: 24,
    position: 'absolute',
    right: 24,
    top: 8,
  },
  lessonMonumentIslandShadow: {
    backgroundColor: colors.shadow,
    borderRadius: radius.pill,
    bottom: 22,
    height: 32,
    opacity: 0.14,
    position: 'absolute',
    width: 150,
    zIndex: 1,
  },
  lessonMonumentIcon: {
    shadowColor: colors.shadow,
    shadowOffset: {
      height: 7,
      width: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  lessonMonumentIconIdle: {
    opacity: 0.62,
  },
  lessonMonumentIllustration: {
    alignItems: 'center',
    bottom: 54,
    height: 96,
    justifyContent: 'flex-end',
    position: 'absolute',
    width: 124,
    zIndex: 5,
  },
  lessonMonumentSparkle: {
    color: colors.secondary,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 21,
    position: 'absolute',
    textShadowColor: colors.white,
    textShadowOffset: {
      height: 1,
      width: 0,
    },
    textShadowRadius: 3,
    zIndex: 6,
  },
  lessonMonumentSparkleLeft: {
    left: 24,
    top: 46,
    transform: [{ rotate: '-16deg' }],
  },
  lessonMonumentSparkleRight: {
    right: 22,
    top: 28,
    transform: [{ rotate: '18deg' }],
  },
  lessonMonumentStage: {
    alignItems: 'center',
    height: 168,
    justifyContent: 'flex-end',
    position: 'relative',
    width: 176,
  },
  lessonMonumentStageCurrent: {
    transform: [{ scale: 1.03 }],
  },
  lessonMonumentStageDone: {
    transform: [{ scale: 1.04 }],
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
    opacity: 0.7,
  },
  mapBackdrop: {
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  mapBrush: {
    height: 54,
    opacity: 0.28,
    position: 'absolute',
    width: 96,
  },
  mapBrushLeaf: {
    backgroundColor: colors.mint,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 2,
    position: 'absolute',
  },
  mapBrushLeafOne: {
    bottom: 0,
    height: 34,
    left: 4,
    width: 52,
  },
  mapBrushLeafThree: {
    bottom: 2,
    height: 28,
    right: 2,
    width: 44,
  },
  mapBrushLeafTwo: {
    bottom: 10,
    height: 40,
    left: 28,
    width: 48,
  },
  mapBrushLeft: {
    left: -20,
    top: 540,
    transform: [{ rotate: '-10deg' }],
  },
  mapBrushRight: {
    right: -28,
    top: 250,
    transform: [{ rotate: '11deg' }],
  },
  mapCloud: {
    height: 58,
    opacity: 0.6,
    position: 'absolute',
    width: 148,
  },
  mapCloudMiddle: {
    left: -18,
    top: 700,
    transform: [{ scale: 0.86 }],
  },
  mapCloudPuff: {
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    position: 'absolute',
  },
  mapCloudPuffOne: {
    bottom: 6,
    height: 34,
    left: 0,
    width: 78,
  },
  mapCloudPuffThree: {
    bottom: 8,
    height: 32,
    right: 0,
    width: 74,
  },
  mapCloudPuffTwo: {
    bottom: 0,
    height: 52,
    left: 46,
    width: 68,
  },
  mapCloudTop: {
    right: -28,
    top: 118,
  },
  mapHill: {
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    opacity: 0.5,
    position: 'absolute',
  },
  mapHillLeft: {
    height: 164,
    left: -82,
    top: 90,
    width: 260,
  },
  mapHillLower: {
    backgroundColor: colors.primarySoft,
    bottom: 80,
    height: 170,
    left: -96,
    opacity: 0.2,
    width: 300,
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
  mapStarThree: {
    right: 42,
    top: 820,
    transform: [{ rotate: '8deg' }],
  },
  mapEmoji: {
    fontSize: 24,
    position: 'absolute',
    opacity: 0.35,
  },
  mapTrailLow: {
    left: -68,
    top: 820,
    transform: [{ rotate: '-18deg' }],
  },
  mapTrailMid: {
    right: -88,
    top: 430,
    transform: [{ rotate: '24deg' }],
  },
  mapTrailRibbon: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 44,
    opacity: 0.18,
    position: 'absolute',
    width: 250,
  },
  mapTrailTop: {
    left: -74,
    top: 40,
    transform: [{ rotate: '20deg' }],
  },
  mapStop: {
    alignItems: 'center',
    gap: spacing.xs,
    width: 136,
    zIndex: 1,
  },
  mapStopCenter: {
    alignSelf: 'center',
  },
  mapStopLeft: {
    alignSelf: 'center',
    transform: [{ translateX: -90 }],
  },
  mapStopLocked: {
    opacity: 0.82,
  },
  mapStopPressed: {
    opacity: 0.92,
    transform: [{ translateY: 2 }, { scale: 0.98 }],
  },
  mapStopRight: {
    alignSelf: 'center',
    transform: [{ translateX: 90 }],
  },
  parentGate: {
    backgroundColor: colors.white,
    borderColor: colors.white,
    borderRadius: radius.pill,
    height: 56,
    minHeight: 56,
    minWidth: 56,
    width: 56,
    ...shadows.floating,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: layout.screenPadding,
    paddingBottom: 144,
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
  stickyButton: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 4,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 64,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    ...shadows.warm,
  },
  stickyButtonBreather: {
    borderRadius: radius.pill,
    ...shadows.warm,
  },
  stickyButtonComplete: {
    backgroundColor: colors.primary,
  },
  stickyButtonGloss: {
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    borderRadius: radius.pill,
    height: 24,
    left: 12,
    position: 'absolute',
    right: 12,
    top: 6,
  },
  stickyButtonLip: {
    backgroundColor: 'rgba(200, 135, 18, 0.22)',
    bottom: 0,
    height: 9,
    left: 16,
    position: 'absolute',
    right: 16,
  },
  stickyButtonPressed: {
    opacity: 0.92,
    transform: [{ translateY: 2 }, { scale: 0.99 }],
  },
  stickyFooter: {
    bottom: spacing.md,
    left: 60,
    position: 'absolute',
    right: 60,
    zIndex: 20,
  },
  stickyIcon: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.secondarySoft,
    borderWidth: 2,
    borderRadius: radius.pill,
    height: 46,
    justifyContent: 'center',
    width: 46,
    ...shadows.soft,
  },
  stickyLabel: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 22,
  },
  stickyTextGroup: {
    flex: 0,
    gap: spacing.xxs,
  },
  stopGlow: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 3,
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
    borderWidth: 4,
    height: 80,
    justifyContent: 'center',
    position: 'relative',
    width: 80,
    ...shadows.floating,
  },
  stopNodeCurrent: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
    borderWidth: 5,
    height: 96,
    width: 96,
    ...shadows.warm,
  },
  stopNodeDone: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  stopNodeLocked: {
    backgroundColor: colors.white,
    borderColor: '#C5E2F0',
    borderWidth: 4,
    elevation: 1,
    height: 92,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    width: 92,
  },
  stopNumber: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.white,
    borderWidth: 2,
    borderRadius: radius.pill,
    bottom: -4,
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    right: -4,
    width: 30,
    ...shadows.soft,
  },
  stopNumberText: {
    color: colors.text,
    ...typography.caption,
  },
  title: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 27,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  topActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  topStatusCaption: {
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 12,
    textAlign: 'center',
  },
  topStatusCard: {
    alignItems: 'stretch',
    backgroundColor: colors.white,
    borderColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 2,
    gap: 2,
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    width: 108,
    ...shadows.floating,
  },
  topStatusCount: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 18,
  },
  topStatusFill: {
    backgroundColor: colors.secondary,
    borderRadius: radius.pill,
    height: '100%',
  },
  topStatusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xxs,
    justifyContent: 'center',
  },
  topStatusTrack: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    height: 6,
    overflow: 'hidden',
  },
  world: {
    gap: spacing.md,
  },
  stopSparkle: {
    color: colors.secondary,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 20,
    position: 'absolute',
    textShadowColor: colors.white,
    textShadowOffset: {
      height: 1,
      width: 0,
    },
    textShadowRadius: 2,
  },
  stopSparkleBottom: {
    bottom: 12,
    left: 9,
    transform: [{ rotate: '-12deg' }],
  },
  stopSparkleTop: {
    right: 12,
    top: 9,
    transform: [{ rotate: '12deg' }],
  },
});
