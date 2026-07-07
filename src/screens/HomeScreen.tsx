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
  LayoutChangeEvent,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { type SKidsIconName } from '../assets/icons/skids';
import { KidBadge } from '../components/KidBadge';
import { KidModeHeader } from '../components/KidModeHeader';
import { KidModeTabs, type KidModeTab } from '../components/KidModeTabs';
import { KidPlayPanel } from '../components/KidPlayPanel';
import { MascotSpeechBubble } from '../components/mascot';
import { Screen } from '../components/Screen';
import { SKidsIcon } from '../components/SKidsIcon';
import { lessons } from '../data/lessons';
import {
  sugaHomeCompleteTapMessages,
  sugaHomeGuideTapMessages,
  sugaHomeReviewTapMessages,
} from '../data/mascotPrompts';
import { DEFAULT_THEME_ID, getThemeById, themes } from '../data/themes';
import { playTapSound, speakVi } from '../engine/AudioManager';
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

function speakSugaLine(message: string) {
  playTapSound().catch(() => undefined);
  speakVi(message).catch(() => undefined);
}

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
const connectorLongHeight = 72;
const connectorShortHeight = 44;
const duplicateSceneIconFallbacks: Partial<Record<string, SKidsIconName>> = {
  classroom: 'teacherInstructions',
  'go-to-school': 'schoolSupplies',
  school: 'schoolSupplies',
};

export function HomeScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<KidModeTab>('map');
  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const [learningMode, setLearningMode] = useState<LearningMode>('core');
  const [visibleLessonIds, setVisibleLessonIds] = useState<string[] | undefined>(undefined);
  const [mapLayoutVersion, setMapLayoutVersion] = useState(0);
  const [showFocusButton, setShowFocusButton] = useState(false);
  const [isHubOpen, setIsHubOpen] = useState(false);
  const mapScrollRef = useRef<ScrollView | null>(null);
  const mapRootYByKeyRef = useRef<Record<string, number>>({});
  const mapSectionYByKeyRef = useRef<Record<string, number>>({});
  const mapSectionBodyYByKeyRef = useRef<Record<string, number>>({});
  const mapNodeYByKeyRef = useRef<Record<string, number>>({});
  const lastAutoScrolledNodeKeyRef = useRef<string | null>(null);
  const activeThemeId = progress?.activeThemeId ?? DEFAULT_THEME_ID;
  const activeTheme =
    getThemeById(activeThemeId) ?? getThemeById(DEFAULT_THEME_ID) ?? themes[0];
  const themeLessons = useMemo(
    () => getThemeLessons(activeTheme, visibleLessonIds),
    [activeTheme, visibleLessonIds],
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
  const completedReviewGameIds = useMemo(
    () => new Set(progress?.completedReviewGameIds ?? []),
    [progress],
  );
  const completedSceneCount = getCompletedThemeNodeCount(
    mapNodes,
    completedSceneIds,
  );
  const pendingReviewLesson = useMemo(
    () =>
      getPendingReviewLesson(
        themeLessons,
        completedSceneIds,
        completedReviewGameIds,
      ),
    [completedReviewGameIds, completedSceneIds, themeLessons],
  );
  const hasPendingReviewGame = Boolean(pendingReviewLesson?.reviewGame);
  const isThemeComplete =
    mapNodes.length > 0 && completedSceneCount === mapNodes.length;
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
  const ctaNode =
    shouldResumeProgress && pendingNode ? pendingNode : nextNode ?? mapNodes[0];
  const currentLessonId = ctaNode?.lessonId;
  const homeCoachMessage = isThemeComplete
    ? 'Tuyệt vời! Bé đã đi hết bản đồ. Mình cùng nhận thêm sao nhé!'
    : hasPendingReviewGame
    ? `Mình cùng ôn lại ${pendingReviewLesson?.titleVi ?? 'bài vừa học'} nhé!`
    : ctaNode
    ? `Đi thôi! Trạm tiếp theo là ${ctaNode.scene.titleVi}.`
    : 'Hôm nay mình học cùng Suga nhé!';
  const homeCoachPose = isThemeComplete
    ? 'greatJob'
    : hasPendingReviewGame
    ? 'learn'
    : 'letsGo';
  const homeCoachTone = isThemeComplete
    ? 'success'
    : hasPendingReviewGame
    ? 'hint'
    : 'guide';
  const homeCoachTapMessages = isThemeComplete
    ? sugaHomeCompleteTapMessages
    : hasPendingReviewGame
    ? sugaHomeReviewTapMessages
    : sugaHomeGuideTapMessages;

  const updateMapLayoutY = useCallback(
    (
      layoutRef: React.MutableRefObject<Record<string, number>>,
      key: string,
      y: number,
    ) => {
      if (layoutRef.current[key] === y) {
        return;
      }

      layoutRef.current = {
        ...layoutRef.current,
        [key]: y,
      };
      setMapLayoutVersion(version => version + 1);
    },
    [],
  );

  const refreshHomeData = useCallback(() => {
    getProgress()
      .then(setProgress)
      .catch(() => setProgress(null));
    getParentSettings()
      .then(settings => {
        setLearningMode(settings.learningMode);
        setVisibleLessonIds(settings.visibleLessonIds);
      })
      .catch(() => {
        setLearningMode('core');
        setVisibleLessonIds(undefined);
      });
  }, []);

  useEffect(() => {
    refreshHomeData();
    return navigation.addListener('focus', refreshHomeData);
  }, [navigation, refreshHomeData]);

  useEffect(() => {
    if (activeTab !== 'map') {
      lastAutoScrolledNodeKeyRef.current = null;
    }
  }, [activeTab]);

  useEffect(() => {
    const targetNodeKey = ctaNode?.key;

    if (
      activeTab !== 'map' ||
      !targetNodeKey ||
      lastAutoScrolledNodeKeyRef.current === targetNodeKey
    ) {
      return;
    }

    const rootY = mapRootYByKeyRef.current;
    const sectionY = mapSectionYByKeyRef.current[ctaNode.lessonId];
    const sectionBodyY = mapSectionBodyYByKeyRef.current[ctaNode.lessonId];
    const nodeY = mapNodeYByKeyRef.current[targetNodeKey];

    if (
      rootY.container === undefined ||
      rootY.world === undefined ||
      rootY.learningMap === undefined ||
      sectionY === undefined ||
      sectionBodyY === undefined ||
      nodeY === undefined
    ) {
      return;
    }

    const targetY =
      rootY.container +
      rootY.world +
      rootY.learningMap +
      sectionY +
      sectionBodyY +
      nodeY;
    const scrollY = Math.max(targetY - 160, 0);
    const scrollTimeout = setTimeout(() => {
      mapScrollRef.current?.scrollTo({ animated: false, y: scrollY });
      lastAutoScrolledNodeKeyRef.current = targetNodeKey;
    }, 40);

    return () => clearTimeout(scrollTimeout);
  }, [activeTab, ctaNode, mapLayoutVersion]);

  const scrollToCurrentNode = useCallback(() => {
    const targetNodeKey = ctaNode?.key;
    if (!targetNodeKey) return;

    const rootY = mapRootYByKeyRef.current;
    const sectionY = mapSectionYByKeyRef.current[ctaNode.lessonId];
    const sectionBodyY = mapSectionBodyYByKeyRef.current[ctaNode.lessonId];
    const nodeY = mapNodeYByKeyRef.current[targetNodeKey];

    if (
      rootY.container === undefined ||
      rootY.world === undefined ||
      rootY.learningMap === undefined ||
      sectionY === undefined ||
      sectionBodyY === undefined ||
      nodeY === undefined
    ) {
      return;
    }

    const targetY =
      rootY.container +
      rootY.world +
      rootY.learningMap +
      sectionY +
      sectionBodyY +
      nodeY;
    const scrollY = Math.max(targetY - 160, 0);
    mapScrollRef.current?.scrollTo({ animated: true, y: scrollY });
  }, [ctaNode]);

  const handleMapScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;

      const targetNodeKey = ctaNode?.key;
      if (!targetNodeKey) return;

      const rootY = mapRootYByKeyRef.current;
      const sectionY = mapSectionYByKeyRef.current[ctaNode.lessonId];
      const sectionBodyY = mapSectionBodyYByKeyRef.current[ctaNode.lessonId];
      const nodeY = mapNodeYByKeyRef.current[targetNodeKey];

      if (
        rootY.container === undefined ||
        rootY.world === undefined ||
        rootY.learningMap === undefined ||
        sectionY === undefined ||
        sectionBodyY === undefined ||
        nodeY === undefined
      ) {
        return;
      }

      const targetY =
        rootY.container +
        rootY.world +
        rootY.learningMap +
        sectionY +
        sectionBodyY +
        nodeY;

      const optimalY = Math.max(targetY - 160, 0);
      const isFar = Math.abs(offsetY - optimalY) > 500;
      if (showFocusButton !== isFar) {
        setShowFocusButton(isFar);
      }
    },
    [ctaNode, showFocusButton],
  );

  const openNode = useCallback(
    (node: ThemeMapNode) => {
      navigation.navigate('ScenePlayer', {
        learningMode,
        lessonId: node.lessonId,
        sceneId: node.scene.id,
      });
    },
    [learningMode, navigation],
  );

  const closeHub = useCallback(() => {
    setIsHubOpen(false);
  }, []);

  const handleOpenHub = useCallback(() => {
    playTapSound().catch(() => undefined);
    setIsHubOpen(true);
  }, []);

  const handleHubPrimaryPress = useCallback(() => {
    setIsHubOpen(false);

    if (pendingReviewLesson?.reviewGame) {
      navigation.navigate('ReviewGame', {
        learningMode,
        lessonId: pendingReviewLesson.id,
      });
      return;
    }

    if (ctaNode) {
      openNode(ctaNode);
    }
  }, [ctaNode, learningMode, navigation, openNode, pendingReviewLesson]);

  const handleHubFocusPress = useCallback(() => {
    setIsHubOpen(false);
    setActiveTab('map');
    setTimeout(scrollToCurrentNode, 80);
  }, [scrollToCurrentNode]);

  return (
    <Screen>
      <View style={styles.shell}>
        <KidModeHeader
          totalXP={progress?.totalXP ?? 0}
          onOpenHub={handleOpenHub}
          onOpenParent={() => navigation.navigate('Parent')}
        />
        <View style={styles.tabContent}>
          <View
            style={[
              styles.tabPane,
              activeTab !== 'map' && styles.tabPaneHidden,
            ]}
          >
            <ScrollView
              ref={mapScrollRef}
              contentInsetAdjustmentBehavior="automatic"
              contentContainerStyle={styles.scrollContent}
              style={styles.scrollArea}
              showsVerticalScrollIndicator={false}
              onScroll={handleMapScroll}
              scrollEventThrottle={32}
            >
              <View
                onLayout={(event: LayoutChangeEvent) =>
                  updateMapLayoutY(
                    mapRootYByKeyRef,
                    'container',
                    event.nativeEvent.layout.y,
                  )
                }
                style={styles.container}
              >
                <View pointerEvents="none" style={styles.skyDecor}>
                  <View style={[styles.cloud, styles.cloudLeft]} />
                  <View style={[styles.cloud, styles.cloudBottom]} />
                  <Text style={[styles.sparkle, styles.sparkleTop]}>★</Text>
                  <Text style={[styles.sparkle, styles.sparkleMid]}>★</Text>
                </View>

                {activeTheme ? (
                  <View
                    onLayout={(event: LayoutChangeEvent) =>
                      updateMapLayoutY(
                        mapRootYByKeyRef,
                        'world',
                        event.nativeEvent.layout.y,
                      )
                    }
                    style={styles.world}
                  >
                    <MascotSpeechBubble
                      mascotSize="sm"
                      message={homeCoachMessage}
                      onMascotPress={speakSugaLine}
                      pose={homeCoachPose}
                      style={styles.mapCoach}
                      tapMessages={homeCoachTapMessages}
                      title="Suga dẫn đường"
                      tone={homeCoachTone}
                    />
                    <View
                      onLayout={(event: LayoutChangeEvent) =>
                        updateMapLayoutY(
                          mapRootYByKeyRef,
                          'learningMap',
                          event.nativeEvent.layout.y,
                        )
                      }
                      style={styles.learningMap}
                    >
                      <View pointerEvents="none" style={styles.mapBackdrop}>
                        <View
                          style={[styles.mapTrailRibbon, styles.mapTrailTop]}
                        />
                        <View
                          style={[styles.mapTrailRibbon, styles.mapTrailMid]}
                        />
                        <View
                          style={[styles.mapTrailRibbon, styles.mapTrailLow]}
                        />
                        <View style={[styles.mapHill, styles.mapHillLeft]} />
                        <View style={[styles.mapHill, styles.mapHillRight]} />
                        <View style={[styles.mapHill, styles.mapHillLower]} />
                        <View style={[styles.mapCloud, styles.mapCloudTop]}>
                          <View
                            style={[
                              styles.mapCloudPuff,
                              styles.mapCloudPuffOne,
                            ]}
                          />
                          <View
                            style={[
                              styles.mapCloudPuff,
                              styles.mapCloudPuffTwo,
                            ]}
                          />
                          <View
                            style={[
                              styles.mapCloudPuff,
                              styles.mapCloudPuffThree,
                            ]}
                          />
                        </View>
                        <View style={[styles.mapCloud, styles.mapCloudMiddle]}>
                          <View
                            style={[
                              styles.mapCloudPuff,
                              styles.mapCloudPuffOne,
                            ]}
                          />
                          <View
                            style={[
                              styles.mapCloudPuff,
                              styles.mapCloudPuffTwo,
                            ]}
                          />
                          <View
                            style={[
                              styles.mapCloudPuff,
                              styles.mapCloudPuffThree,
                            ]}
                          />
                        </View>
                        <View style={[styles.mapBrush, styles.mapBrushLeft]}>
                          <View
                            style={[
                              styles.mapBrushLeaf,
                              styles.mapBrushLeafOne,
                            ]}
                          />
                          <View
                            style={[
                              styles.mapBrushLeaf,
                              styles.mapBrushLeafTwo,
                            ]}
                          />
                          <View
                            style={[
                              styles.mapBrushLeaf,
                              styles.mapBrushLeafThree,
                            ]}
                          />
                        </View>
                        <View style={[styles.mapBrush, styles.mapBrushRight]}>
                          <View
                            style={[
                              styles.mapBrushLeaf,
                              styles.mapBrushLeafOne,
                            ]}
                          />
                          <View
                            style={[
                              styles.mapBrushLeaf,
                              styles.mapBrushLeafTwo,
                            ]}
                          />
                          <View
                            style={[
                              styles.mapBrushLeaf,
                              styles.mapBrushLeafThree,
                            ]}
                          />
                        </View>
                        <Text style={[styles.mapStar, styles.mapStarOne]}>
                          ★
                        </Text>
                        <Text style={[styles.mapStar, styles.mapStarTwo]}>
                          ★
                        </Text>
                        <Text style={[styles.mapStar, styles.mapStarThree]}>
                          ★
                        </Text>
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
                        const isReviewGameCompleted = Boolean(
                          section.lesson.reviewGame &&
                            completedReviewGameIds.has(
                              section.lesson.reviewGame.id,
                            ),
                        );
                        const isReviewGameCurrent = Boolean(
                          isLessonCompleted && !isReviewGameCompleted,
                        );
                        const isLessonCurrent = Boolean(
                          !isThemeComplete &&
                            currentLessonId === section.lesson.id,
                        );
                        const lessonMonumentAlignment =
                          getLessonMonumentAlignment();
                        const firstNode = section.nodes[0];
                        const firstNodeAlignment = getSectionMapAlignment(
                          0,
                          section.lessonIndex,
                        );
                        const isFirstNodePathActive = Boolean(
                          firstNode &&
                            (isThemeNodeComplete(
                              firstNode,
                              completedSceneIds,
                            ) ||
                              ctaNode?.key === firstNode.key ||
                              isThemeComplete),
                        );

                        return (
                          <View
                            key={section.key}
                            onLayout={(event: LayoutChangeEvent) =>
                              updateMapLayoutY(
                                mapSectionYByKeyRef,
                                section.lesson.id,
                                event.nativeEvent.layout.y,
                              )
                            }
                            style={styles.lessonSection}
                          >
                            <LessonSectionHeader
                              isCompleted={isLessonCompleted}
                              isCurrent={isLessonCurrent}
                              lessonIndex={section.lessonIndex}
                              title={section.lesson.titleVi}
                            />
                            <View
                              onLayout={(event: LayoutChangeEvent) =>
                                updateMapLayoutY(
                                  mapSectionBodyYByKeyRef,
                                  section.lesson.id,
                                  event.nativeEvent.layout.y,
                                )
                              }
                              style={styles.lessonSectionBody}
                            >
                              <View
                                pointerEvents="none"
                                style={styles.lessonDecorLayer}
                              >
                                {section.lessonIndex % 2 === 0 ? (
                                  <>
                                    <Text
                                      style={[
                                        styles.mapEmoji,
                                        styles.mapEmojiEvenTree,
                                      ]}
                                    >
                                      🌲
                                    </Text>
                                    <Text
                                      style={[
                                        styles.mapEmoji,
                                        styles.mapEmojiEvenFlower,
                                      ]}
                                    >
                                      🌸
                                    </Text>
                                    <Text
                                      style={[
                                        styles.mapEmoji,
                                        styles.mapEmojiEvenButterfly,
                                      ]}
                                    >
                                      🦋
                                    </Text>
                                    <Text
                                      style={[
                                        styles.mapEmoji,
                                        styles.mapEmojiEvenMushroom,
                                      ]}
                                    >
                                      🍄
                                    </Text>
                                  </>
                                ) : (
                                  <>
                                    <Text
                                      style={[
                                        styles.mapEmoji,
                                        styles.mapEmojiOddTree,
                                      ]}
                                    >
                                      🌲
                                    </Text>
                                    <Text
                                      style={[
                                        styles.mapEmoji,
                                        styles.mapEmojiOddDuck,
                                      ]}
                                    >
                                      🦆
                                    </Text>
                                    <Text
                                      style={[
                                        styles.mapEmoji,
                                        styles.mapEmojiOddSun,
                                      ]}
                                    >
                                      ☀️
                                    </Text>
                                    <Text
                                      style={[
                                        styles.mapEmoji,
                                        styles.mapEmojiOddCloud,
                                      ]}
                                    >
                                      ☁️
                                    </Text>
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
                                      sceneCountInLesson={
                                        node.sceneCountInLesson
                                      }
                                      sceneIndexInLesson={
                                        node.sceneIndexInLesson
                                      }
                                      scene={node.scene}
                                      onLayout={(event: LayoutChangeEvent) =>
                                        updateMapLayoutY(
                                          mapNodeYByKeyRef,
                                          node.key,
                                          event.nativeEvent.layout.y,
                                        )
                                      }
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
                                    size="default"
                                    to={lessonMonumentAlignment}
                                  />

                                  <LessonMilestone
                                    alignment={lessonMonumentAlignment}
                                    iconName={lessonIconName}
                                    isCompleted={isReviewGameCompleted}
                                    isCurrent={isReviewGameCurrent}
                                    titleVi={section.lesson.titleVi}
                                    onPress={() => {
                                      if (
                                        isReviewGameCompleted ||
                                        isReviewGameCurrent
                                      ) {
                                        navigation.navigate('ReviewGame', {
                                          lessonId: section.lesson.id,
                                          learningMode,
                                        });
                                      }
                                    }}
                                  />

                                  {section.lessonIndex <
                                  mapSections.length - 1 ? (
                                    <MapConnector
                                      from={lessonMonumentAlignment}
                                      isComplete={isLessonCompleted}
                                      size="default"
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

            {showFocusButton && activeTab === 'map' ? (
              <Pressable style={styles.focusFab} onPress={scrollToCurrentNode}>
                <SKidsIcon name="focusLesson" size={32} />
              </Pressable>
            ) : null}
          </View>

          <View
            style={[
              styles.tabPane,
              activeTab !== 'play' && styles.tabPaneHidden,
            ]}
          >
            <ScrollView
              contentInsetAdjustmentBehavior="automatic"
              contentContainerStyle={styles.playScrollContent}
              style={styles.scrollArea}
              showsVerticalScrollIndicator={false}
            >
              <KidPlayPanel
                completedReviewGameIds={completedReviewGameIds}
                completedSceneIds={completedSceneIds}
                onOpenReviewGame={lessonId =>
                  navigation.navigate('ReviewGame', { lessonId, learningMode })
                }
              />
            </ScrollView>
          </View>
        </View>
        <KidModeTabs
          activeTab={activeTab}
          hasPendingPlay={hasPendingReviewGame}
          onSelectMap={() => setActiveTab('map')}
          onSelectPlay={() => setActiveTab('play')}
        />
        <SKidsHubSheet
          activeThemeEmoji={activeTheme?.thumbnailEmoji ?? '★'}
          activeThemeTitle={activeTheme?.titleVi ?? 'Bản đồ S-Kids'}
          completed={completedSceneCount}
          hasPendingReviewGame={hasPendingReviewGame}
          isComplete={isThemeComplete}
          nextNode={ctaNode}
          onClose={closeHub}
          onFocusCurrent={handleHubFocusPress}
          onOpenPrimary={handleHubPrimaryPress}
          pendingReviewLesson={pendingReviewLesson}
          total={mapNodes.length}
          visible={isHubOpen}
        />
      </View>
    </Screen>
  );
}

type SKidsHubSheetProps = {
  activeThemeEmoji: string;
  activeThemeTitle: string;
  completed: number;
  hasPendingReviewGame: boolean;
  isComplete: boolean;
  nextNode: ThemeMapNode | undefined;
  onClose: () => void;
  onFocusCurrent: () => void;
  onOpenPrimary: () => void;
  pendingReviewLesson: Lesson | undefined;
  total: number;
  visible: boolean;
};

function SKidsHubSheet({
  activeThemeEmoji,
  activeThemeTitle,
  completed,
  hasPendingReviewGame,
  isComplete,
  nextNode,
  onClose,
  onFocusCurrent,
  onOpenPrimary,
  pendingReviewLesson,
  total,
  visible,
}: SKidsHubSheetProps) {
  const safeTotal = Math.max(total, 0);
  const safeCompleted = Math.min(Math.max(completed, 0), safeTotal);
  const completionPercent =
    safeTotal > 0 ? Math.round((safeCompleted / safeTotal) * 100) : 0;
  const primaryActionDisabled = !hasPendingReviewGame && !nextNode;
  const heroIconName: SKidsIconName = hasPendingReviewGame
    ? 'replay'
    : isComplete
    ? 'star'
    : 'focusLesson';
  const heroTitle = hasPendingReviewGame
    ? `Ôn lại ${pendingReviewLesson?.titleVi ?? 'bài vừa học'}`
    : isComplete
    ? 'Bản đồ đã đủ sao'
    : nextNode?.scene.titleVi ?? 'Sẵn sàng học tiếp';
  const heroSubtitle = hasPendingReviewGame
    ? 'Có game ôn tập đang chờ bé mở khóa thêm phản xạ.'
    : isComplete
    ? 'Bé có thể chơi lại trạm yêu thích hoặc ôn tập để giữ nhịp.'
    : nextNode
    ? `${nextNode.lessonTitleVi} · Trạm ${nextNode.sceneIndexInLesson + 1}/${
        nextNode.sceneCountInLesson
      }`
    : 'Bản đồ sẽ hiện bài mới khi có nội dung.';
  const primaryLabel = hasPendingReviewGame
    ? 'Chơi ôn tập'
    : isComplete
    ? 'Chơi lại trạm đầu'
    : 'Học tiếp';
  const giftText = hasPendingReviewGame
    ? 'Xong phần ôn tập, bé nhận thêm sticker thưởng.'
    : isComplete
    ? 'Chơi lại một trạm để giữ cảm giác tự tin.'
    : 'Hoàn thành trạm hôm nay để nhận sticker mới.';

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.hubModalRoot}>
        <Pressable
          accessibilityLabel="Đóng S-Kids Hub"
          onPress={onClose}
          style={styles.hubBackdrop}
        />
        <View style={styles.hubSheet}>
          <View style={styles.hubHandle} />
          <ScrollView
            contentContainerStyle={styles.hubSheetContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.hubHeader}>
              <View style={styles.hubLogoBadge}>
                <Text style={styles.hubLogoEmoji}>{activeThemeEmoji}</Text>
              </View>
              <View style={styles.hubHeaderText}>
                <Text style={styles.hubEyebrow}>S-Kids Hub</Text>
                <Text style={styles.hubTitle}>Hôm nay mình đi đâu?</Text>
              </View>
              <Pressable
                accessibilityLabel="Đóng S-Kids Hub"
                accessibilityRole="button"
                onPress={onClose}
                style={({ pressed }) => [
                  styles.hubCloseButton,
                  pressed && styles.hubButtonPressed,
                ]}
              >
                <Text style={styles.hubCloseText}>Đóng</Text>
              </Pressable>
            </View>

            <View style={styles.hubHeroCard}>
              <View style={styles.hubHeroIcon}>
                <SKidsIcon name={heroIconName} size={54} />
              </View>
              <View style={styles.hubHeroText}>
                <Text numberOfLines={2} style={styles.hubHeroTitle}>
                  {heroTitle}
                </Text>
                <Text style={styles.hubHeroSubtitle}>{heroSubtitle}</Text>
              </View>
            </View>

            <View style={styles.hubProgressBlock}>
              <View style={styles.hubProgressTopRow}>
                <Text style={styles.hubSectionTitle}>{activeThemeTitle}</Text>
                <Text style={styles.hubProgressLabel}>
                  {safeCompleted}/{safeTotal}
                </Text>
              </View>
              <View
                accessibilityLabel={`Bé đã hoàn thành ${completionPercent} phần trăm bản đồ`}
                accessibilityRole="progressbar"
                style={styles.hubProgressTrack}
              >
                <View
                  style={[
                    styles.hubProgressFill,
                    { width: `${completionPercent}%` },
                  ]}
                />
              </View>
            </View>

            <View style={styles.hubStatsRow}>
              <View style={styles.hubStatCard}>
                <Text style={styles.hubStatValue}>{safeCompleted}</Text>
                <Text style={styles.hubStatLabel}>Sao đã nhận</Text>
              </View>
              <View style={styles.hubStatCard}>
                <Text style={styles.hubStatValue}>
                  {Math.max(safeTotal - safeCompleted, 0)}
                </Text>
                <Text style={styles.hubStatLabel}>Trạm còn lại</Text>
              </View>
            </View>

            <View style={styles.hubGiftCard}>
              <View style={styles.hubGiftIcon}>
                <SKidsIcon name="sticker" size={40} />
              </View>
              <View style={styles.hubGiftText}>
                <Text style={styles.hubGiftTitle}>Quà hôm nay</Text>
                <Text style={styles.hubGiftCopy}>{giftText}</Text>
              </View>
            </View>

            <View style={styles.hubActions}>
              <Pressable
                accessibilityLabel={primaryLabel}
                accessibilityRole="button"
                accessibilityState={{ disabled: primaryActionDisabled }}
                disabled={primaryActionDisabled}
                onPress={onOpenPrimary}
                style={({ pressed }) => [
                  styles.hubPrimaryAction,
                  pressed && !primaryActionDisabled && styles.hubButtonPressed,
                  primaryActionDisabled && styles.hubActionDisabled,
                ]}
              >
                <Text style={styles.hubPrimaryActionText}>{primaryLabel}</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Đưa bản đồ về trạm hiện tại"
                accessibilityRole="button"
                accessibilityState={{ disabled: !nextNode }}
                disabled={!nextNode}
                onPress={onFocusCurrent}
                style={({ pressed }) => [
                  styles.hubSecondaryAction,
                  pressed && nextNode && styles.hubButtonPressed,
                  !nextNode && styles.hubActionDisabled,
                ]}
              >
                <Text style={styles.hubSecondaryActionText}>
                  Về trạm hiện tại
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
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
  onLayout: (event: LayoutChangeEvent) => void;
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
  onLayout,
  onPress,
  sceneCountInLesson,
  sceneIndexInLesson,
  scene,
}: SceneMapStopProps) {
  const isAvailable = !isCompleted && !isCurrent && !isLocked;
  const lessonPosition = `Bài ${
    lessonIndex + 1
  }/${lessonCount}: ${lessonTitleVi}, trạm ${
    sceneIndexInLesson + 1
  }/${sceneCountInLesson}`;
  const accessibilityLabel = isLocked
    ? `${lessonPosition}: ${scene.titleVi} chưa mở khóa`
    : `${lessonPosition}: ${isCompleted ? 'Chơi lại' : 'Học tiếp'} ${
        scene.titleVi
      }`;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: isLocked }}
      disabled={isLocked}
      onLayout={onLayout}
      onPress={onPress}
      style={({ pressed }) => {
        const isPressed = pressed && !isLocked;
        return [
          styles.mapStop,
          alignment === 'left' && styles.mapStopLeft,
          alignment === 'center' && styles.mapStopCenter,
          alignment === 'right' && styles.mapStopRight,
          isLocked && styles.mapStopLocked,
          isPressed && { opacity: 0.92 },
          {
            transform: [
              ...(alignment === 'left' ? [{ translateX: -90 }] : []),
              ...(alignment === 'right' ? [{ translateX: 90 }] : []),
              ...(isPressed ? [{ translateY: 2 }, { scale: 0.98 }] : []),
            ],
          },
        ];
      }}
    >
      {isCurrent ? (
        <CurrentStopNode>
          <SKidsIcon name={iconName} size={64} />
          <View style={[styles.stopNumber, styles.stopNumberCurrent]}>
            <Text style={styles.stopNumberText}>{sceneIndexInLesson + 1}</Text>
          </View>
        </CurrentStopNode>
      ) : (
        <View
          style={[
            styles.stopNode,
            isAvailable && styles.stopNodeAvailable,
            isCompleted && styles.stopNodeDone,
            isLocked && styles.stopNodeLocked,
          ]}
        >
          {isLocked ? (
            <View pointerEvents="none" style={styles.lockedOverlay} />
          ) : null}
          <SKidsIcon
            name={iconName}
            size={isLocked ? 44 : 52}
            style={isLocked ? styles.lockedIcon : undefined}
          />
          <View
            style={[
              styles.stopNumber,
              isCompleted && styles.stopNumberDone,
              isLocked && styles.stopNumberLocked,
            ]}
          >
            <Text
              style={[
                styles.stopNumberText,
                isCompleted && styles.stopNumberTextDone,
                isLocked && styles.stopNumberTextLocked,
              ]}
            >
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
        </View>
      )}
    </Pressable>
  );
}

function CurrentStopNode({ children }: { children: React.ReactNode }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          duration: 900,
          easing: Easing.out(Easing.quad),
          toValue: 1,
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          duration: 900,
          easing: Easing.in(Easing.quad),
          toValue: 0,
          useNativeDriver: false,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [pulse]);

  const currentScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.055],
  });
  const glowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.48, 0.86],
  });
  const sparkleOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.54, 1],
  });

  return (
    <Animated.View
      style={[
        styles.stopNode,
        styles.stopNodeCurrent,
        { transform: [{ scale: currentScale }] },
      ]}
    >
      <Animated.View style={[styles.stopGlow, { opacity: glowOpacity }]} />
      <Animated.Text
        style={[
          styles.stopSparkle,
          styles.stopSparkleTop,
          { opacity: sparkleOpacity },
        ]}
      >
        ★
      </Animated.Text>
      <Animated.Text
        style={[
          styles.stopSparkle,
          styles.stopSparkleBottom,
          { opacity: sparkleOpacity },
        ]}
      >
        ★
      </Animated.Text>
      {children}
    </Animated.View>
  );
}

type LessonMilestoneProps = {
  alignment: MapAlignment;
  iconName: SKidsIconName;
  isCompleted: boolean;
  isCurrent: boolean;
  titleVi: string;
  onPress: () => void;
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
            <View style={[styles.lessonRiverWave, styles.lessonRiverWaveTop]} />
            <View
              style={[styles.lessonRiverWave, styles.lessonRiverWaveBottom]}
            />
          </View>
          <View style={styles.lessonBridge}>
            {Array.from({ length: 5 }).map((_, index) => (
              <View key={index} style={styles.lessonBridgePlank} />
            ))}
          </View>
          <View
            style={[styles.lessonRiverStone, styles.lessonRiverStoneLeft]}
          />
          <View
            style={[styles.lessonRiverStone, styles.lessonRiverStoneRight]}
          />
          <View
            style={[styles.lessonGrassPatch, styles.lessonGrassPatchLeft]}
          />
          <View
            style={[styles.lessonGrassPatch, styles.lessonGrassPatchRight]}
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
  onPress,
}: LessonMilestoneProps) {
  const starRating = getLessonStarRating(isCompleted);

  return (
    <Pressable
      accessibilityLabel={`Bài ${titleVi} đạt ${starRating} trên 3 sao`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => {
        const isPressed = pressed && (isCurrent || isCompleted);
        return [
          styles.lessonMilestone,
          alignment === 'left' && styles.lessonMilestoneLeft,
          alignment === 'center' && styles.lessonMilestoneCenter,
          alignment === 'right' && styles.lessonMilestoneRight,
          isPressed && { opacity: 0.92, transform: [{ scale: 0.98 }] },
        ];
      }}
    >
      <View
        style={[
          styles.lessonMonumentStage,
          isCurrent && styles.lessonMonumentStageCurrent,
          isCompleted && styles.lessonMonumentStageDone,
        ]}
      >
        {isCurrent || isCompleted ? (
          <View
            style={[
              styles.lessonMonumentGlow,
              isCompleted && styles.lessonMonumentGlowDone,
            ]}
          />
        ) : null}
        {isCurrent || isCompleted ? (
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
              styles.lessonMonumentIconPedestalElevated,
            ]}
          />
          {!isCurrent && !isCompleted ? (
            <View style={styles.lessonMonumentLockBadge}>
              <SKidsIcon name="parentLock" size={28} />
            </View>
          ) : null}
        </View>
        <View style={styles.lessonMonumentIslandShadow} />
        <View
          style={[
            styles.lessonPedestal,
            isCurrent && styles.lessonPedestalCurrent,
            isCompleted && styles.lessonPedestalDone,
          ]}
        >
          <View style={styles.lessonPedestalRing} />
          <View style={styles.lessonPedestalBody}>
            <View style={styles.lessonPedestalBodyHighlight} />
            <View style={styles.lessonPedestalBodyShadow} />
          </View>
          <View style={styles.lessonPedestalSurface}>
            <View style={styles.lessonPedestalSurfaceShine} />
          </View>
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
    </Pressable>
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
        const xOffset =
          fromOffset + (toOffset - fromOffset) * easedProgress + wave;
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

function getThemeLessons(
  theme: LessonTheme | undefined,
  visibleLessonIds: string[] | undefined,
): Lesson[] {
  if (!theme) {
    return [];
  }

  return theme.lessonIds
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

function getPendingReviewLesson(
  themeLessons: Lesson[],
  completedSceneIds: Set<string>,
  completedReviewGameIds: Set<string>,
) {
  return themeLessons.find(lesson => {
    if (
      !lesson.reviewGame ||
      completedReviewGameIds.has(lesson.reviewGame.id)
    ) {
      return false;
    }

    return (
      lesson.scenes.length > 0 &&
      lesson.scenes.every(scene =>
        isSceneProgressComplete(completedSceneIds, lesson.id, scene.id),
      )
    );
  });
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

const styles = StyleSheet.create({
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
    backgroundColor: '#FFFDF5',
    borderColor: '#EDCE83',
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
  hubActionDisabled: {
    opacity: 0.48,
  },
  hubActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  hubBackdrop: {
    backgroundColor: 'rgba(37, 54, 66, 0.32)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  hubButtonPressed: {
    opacity: 0.9,
    transform: [{ translateY: 2 }, { scale: 0.99 }],
  },
  hubCloseButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },
  hubCloseText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 17,
  },
  hubEyebrow: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 15,
    textTransform: 'uppercase',
  },
  hubGiftCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.borderWarm,
    borderRadius: radius.lg,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  hubGiftCopy: {
    color: colors.textSoft,
    flexShrink: 1,
    ...typography.caption,
  },
  hubGiftIcon: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.secondary,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  hubGiftText: {
    flex: 1,
    gap: 2,
  },
  hubGiftTitle: {
    color: colors.text,
    ...typography.caption,
  },
  hubHandle: {
    alignSelf: 'center',
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    height: 5,
    marginTop: spacing.sm,
    width: 56,
  },
  hubHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  hubHeaderText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  hubHeroCard: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 3,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    ...shadows.soft,
  },
  hubHeroIcon: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  hubHeroSubtitle: {
    color: colors.textSoft,
    flexShrink: 1,
    ...typography.caption,
  },
  hubHeroText: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  hubHeroTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 26,
  },
  hubLogoBadge: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 54,
    justifyContent: 'center',
    width: 54,
    ...shadows.soft,
  },
  hubLogoEmoji: {
    fontSize: 28,
    lineHeight: 34,
  },
  hubModalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  hubPrimaryAction: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 3,
    flex: 1,
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: spacing.md,
    ...shadows.warm,
  },
  hubPrimaryActionText: {
    color: colors.text,
    textAlign: 'center',
    ...typography.button,
  },
  hubProgressBlock: {
    gap: spacing.xs,
  },
  hubProgressFill: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: '100%',
  },
  hubProgressLabel: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 18,
  },
  hubProgressTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  hubProgressTrack: {
    backgroundColor: colors.border,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 18,
    overflow: 'hidden',
  },
  hubSecondaryAction: {
    alignItems: 'center',
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.sky,
    borderRadius: radius.pill,
    borderWidth: 3,
    flex: 1,
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: spacing.md,
  },
  hubSecondaryActionText: {
    color: colors.primaryDark,
    textAlign: 'center',
    ...typography.caption,
  },
  hubSectionTitle: {
    color: colors.text,
    flex: 1,
    ...typography.caption,
  },
  hubSheet: {
    backgroundColor: colors.white,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    maxHeight: '86%',
    overflow: 'hidden',
    ...shadows.floating,
  },
  hubSheetContent: {
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  hubStatCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 2,
    flex: 1,
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  hubStatLabel: {
    color: colors.textSoft,
    textAlign: 'center',
    ...typography.caption,
  },
  hubStatsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  hubStatValue: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 34,
  },
  hubTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 27,
  },
  learningMap: {
    minHeight: 520,
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.sm,
    position: 'relative',
  },
  mapCoach: {
    marginHorizontal: spacing.xs,
  },
  lessonSection: {
    marginBottom: spacing.xs,
  },
  lessonSectionBody: {
    paddingBottom: spacing.xs,
    paddingTop: spacing.xs,
    position: 'relative',
  },
  lessonDecorLayer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 0,
  },
  lessonSectionHeader: {
    alignItems: 'center',
    marginBottom: spacing.xs,
    marginTop: spacing.md,
    minHeight: 58,
    position: 'relative',
  },
  lessonSectionHeaderWithTransition: {
    marginTop: spacing.xs,
    minHeight: 86,
    paddingTop: spacing.lg,
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
    marginBottom: spacing.xs,
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
  lessonPedestal: {
    alignItems: 'center',
    bottom: 24,
    height: 60,
    position: 'absolute',
    width: 110,
    zIndex: 2,
  },
  lessonPedestalBody: {
    backgroundColor: '#FFD166',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    borderColor: '#F2A65A',
    borderTopWidth: 0,
    borderWidth: 3,
    height: 30,
    overflow: 'hidden',
    position: 'absolute',
    top: 18,
    width: 90,
    zIndex: 2,
  },
  lessonPedestalBodyHighlight: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    height: '100%',
    left: 12,
    position: 'absolute',
    transform: [{ skewX: '-10deg' }],
    width: 14,
  },
  lessonPedestalBodyShadow: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    height: '100%',
    position: 'absolute',
    right: 0,
    width: 20,
  },
  lessonPedestalCurrent: {
    transform: [{ scale: 1.05 }],
  },
  lessonPedestalDone: {},
  lessonPedestalRing: {
    backgroundColor: '#F4A261',
    borderColor: '#E76F51',
    borderRadius: 50,
    borderWidth: 2,
    height: 24,
    position: 'absolute',
    top: 36,
    width: 106,
    zIndex: 1,
  },
  lessonPedestalSurface: {
    backgroundColor: '#FFFDF9',
    borderColor: '#FFD700',
    borderRadius: 50,
    borderWidth: 3,
    height: 36,
    position: 'absolute',
    shadowColor: '#FFEB3B',
    shadowOffset: {
      height: -2,
      width: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    top: 0,
    width: 90,
    zIndex: 3,
  },
  lessonPedestalSurfaceShine: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 50,
    height: 8,
    left: 8,
    position: 'absolute',
    top: 4,
    width: 30,
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
    opacity: 0.48,
  },
  lessonMonumentIconPedestalElevated: {
    bottom: -10,
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
    height: 152,
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
    backgroundColor: '#F8FEFF',
    borderColor: colors.sky,
    borderRadius: radius.pill,
    borderWidth: 3,
    bottom: 2,
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    right: -2,
    width: 40,
    ...shadows.soft,
  },
  lessonMonumentLockBadge: {
    alignItems: 'center',
    backgroundColor: '#F8FEFF',
    borderColor: colors.sky,
    borderRadius: radius.pill,
    borderWidth: 3,
    bottom: 0,
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    right: 15,
    width: 40,
    ...shadows.soft,
  },
  lockedIcon: {
    opacity: 0.48,
  },
  lockedOverlay: {
    backgroundColor: 'rgba(221, 245, 255, 0.52)',
    borderRadius: radius.pill,
    bottom: 7,
    left: 7,
    position: 'absolute',
    right: 7,
    top: 7,
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
    opacity: 0.36,
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
    width: 54,
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
    opacity: 0.68,
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
    opacity: 0.58,
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
    opacity: 0.66,
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
    opacity: 0.42,
  },
  mapEmojiEvenButterfly: {
    left: '20%',
    top: '75%',
    transform: [{ rotate: '15deg' }],
  },
  mapEmojiEvenFlower: {
    right: '15%',
    top: '45%',
  },
  mapEmojiEvenMushroom: {
    fontSize: 30,
    right: '10%',
    top: '90%',
  },
  mapEmojiEvenTree: {
    left: '10%',
    top: '15%',
  },
  mapEmojiOddCloud: {
    left: '25%',
    top: '10%',
  },
  mapEmojiOddDuck: {
    fontSize: 28,
    left: '10%',
    top: '50%',
  },
  mapEmojiOddSun: {
    fontSize: 32,
    right: '20%',
    top: '80%',
  },
  mapEmojiOddTree: {
    right: '15%',
    top: '20%',
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
    opacity: 0.26,
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
  },
  mapStopLocked: {
    opacity: 0.82,
  },
  mapStopPressed: {
    opacity: 0.92,
  },
  mapStopRight: {
    alignSelf: 'center',
  },
  scrollArea: {
    flex: 1,
    position: 'relative',
  },
  focusFab: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderRadius: 28,
    borderWidth: 2,
    bottom: 100,
    justifyContent: 'center',
    height: 56,
    width: 56,
    position: 'absolute',
    right: spacing.lg,
    ...shadows.soft,
    elevation: 4,
    zIndex: 40,
  },
  scrollContent: {
    padding: layout.screenPadding,
    paddingBottom: 112,
  },
  playScrollContent: {
    padding: layout.screenPadding,
    paddingBottom: 112,
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
  tabContent: {
    flex: 1,
  },
  tabPane: {
    flex: 1,
  },
  tabPaneHidden: {
    display: 'none',
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
  stopNodeAvailable: {
    backgroundColor: '#F9FDFF',
    borderColor: colors.sky,
    borderWidth: 4,
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
    backgroundColor: '#F6FCFF',
    borderColor: '#B9DDED',
    borderWidth: 4,
    elevation: 1,
    height: 90,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    width: 90,
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
  stopNumberCurrent: {
    borderColor: colors.secondary,
  },
  stopNumberDone: {
    backgroundColor: colors.primary,
    borderColor: colors.white,
  },
  stopNumberLocked: {
    backgroundColor: '#EFF9FE',
    borderColor: colors.white,
  },
  stopNumberText: {
    color: colors.text,
    ...typography.caption,
  },
  stopNumberTextDone: {
    color: colors.white,
  },
  stopNumberTextLocked: {
    color: colors.muted,
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
