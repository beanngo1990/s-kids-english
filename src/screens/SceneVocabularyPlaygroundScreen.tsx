import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  ImageBackground,
  Pressable,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import {
  GestureDetector,
  usePanGesture,
  useSimultaneousGestures,
  useTapGesture,
} from 'react-native-gesture-handler';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { AppUiIcon } from '../components/AppUiIcon';
import { KidHeaderActionButton } from '../components/KidRouteHeader';
import { Screen } from '../components/Screen';
import { SKidsIcon } from '../components/SKidsIcon';
import { SparkleEffect } from '../components/SparkleEffect';
import {
  getKidLockAudioPrompt,
  type KidLockReason,
} from '../data/kidLockAudioPrompts';
import { lessons } from '../data/lessons';
import {
  sceneVocabularyMeaningDisabledPromptVi,
  sceneVocabularyMeaningEnabledPromptVi,
} from '../data/speechPrompts';
import {
  playTapSound,
  playVietnameseNarration,
  playWordNarration,
  speakVi,
  speakWord,
  startNarrationSession,
  type NarrationSession,
} from '../engine/AudioManager';
import { prefetchAssets, resolveAsset } from '../engine/AssetRegistry';
import { resolveLearningModePreference } from '../engine/ParentSettingsManager';
import {
  clearSceneVocabularyLayout,
  loadSceneVocabularyLayout,
  loadSceneVocabularyMeaningEnabled,
  saveSceneVocabularyLayout,
  saveSceneVocabularyMeaningEnabled,
  type SceneVocabularySavedPlacement,
} from '../engine/SceneVocabularyLayoutStore';
import { useContentAccess } from '../engine/useContentAccess';
import {
  getDefaultSceneVocabularyPositions,
  getSceneVocabularyPlayItems,
  type SceneVocabularyPlayItem,
} from '../games/sceneVocabularyItems';
import { useI18n, useSavedPromptLanguage } from '../i18n';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { useReducedMotion } from '../theme/motion';
import { useResponsiveLayout } from '../theme/responsive';
import { radius, spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import type { LearningMode } from '../types/lesson';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'SceneVocabularyPlayground'
>;

type CanvasSize = {
  height: number;
  width: number;
};

type VocabularyPlacement = {
  itemId: string;
  x: number;
  y: number;
  zIndex: number;
};

const PLAY_ITEM_SIZE = 96;
const WORD_BUBBLE_CANVAS_MARGIN = 12;
const TAP_FEEDBACK_DURATION_MS = 1800;
const MEANING_TAP_FEEDBACK_DURATION_MS = 3200;
const COACH_DURATION_MS = 2800;
const MEANING_NARRATION_DELAY_MS = 120;

let hasShownPlaygroundCoachThisSession = false;

export function SceneVocabularyPlaygroundScreen({ navigation, route }: Props) {
  useThemeSync();
  const t = useI18n();
  const promptLanguage = useSavedPromptLanguage();
  const responsiveLayout = useResponsiveLayout();
  const reduceMotion = useReducedMotion();
  const hasShownAccessPromptRef = useRef(false);
  const nextZIndexRef = useRef(1);
  const nextTapFeedbackRunRef = useRef(1);
  const placementsRef = useRef<VocabularyPlacement[]>([]);
  const hasChangedMeaningPreferenceRef = useRef(false);
  const lesson = lessons.find(item => item.id === route.params.lessonId);
  const scene = lesson?.scenes.find(item => item.id === route.params.sceneId);
  const openedFromParent = route.params.openedFromParent === true;
  const [learningMode, setLearningMode] = useState<LearningMode | undefined>(
    route.params.learningMode,
  );
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({
    height: 0,
    width: 0,
  });
  const [placements, setPlacements] = useState<VocabularyPlacement[]>([]);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [isMeaningEnabled, setIsMeaningEnabled] = useState(false);
  const [isMeaningPreferenceReady, setIsMeaningPreferenceReady] =
    useState(false);
  const [tapFeedback, setTapFeedback] = useState<
    { itemId: string; run: number } | undefined
  >();
  const [showCoach, setShowCoach] = useState(false);
  const { isAccessGranted, isResolving } = useContentAccess(
    {
      kind: 'scene',
      lessonId: route.params.lessonId,
      sceneId: route.params.sceneId,
    },
    { latchWhenGranted: true },
  );

  useEffect(() => {
    let isMounted = true;

    if (route.params.learningMode) {
      setLearningMode(route.params.learningMode);
      return () => {
        isMounted = false;
      };
    }

    setLearningMode(undefined);
    resolveLearningModePreference().then(mode => {
      if (isMounted) {
        setLearningMode(mode);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [route.params.learningMode]);

  const vocabularyItems = useMemo(
    () =>
      scene && learningMode && isAccessGranted
        ? getSceneVocabularyPlayItems(scene, learningMode)
        : [],
    [isAccessGranted, learningMode, scene],
  );
  const itemById = useMemo(
    () => new Map(vocabularyItems.map(item => [item.id, item])),
    [vocabularyItems],
  );
  const defaultPlacements = useMemo<VocabularyPlacement[]>(
    () =>
      getDefaultSceneVocabularyPositions(vocabularyItems).map(
        (position, index) => ({ ...position, zIndex: index + 1 }),
      ),
    [vocabularyItems],
  );
  const backgroundSource =
    scene && isAccessGranted
      ? resolveAsset(scene.background.source)
      : undefined;

  useEffect(() => {
    let isMounted = true;
    setIsLayoutReady(false);
    setTapFeedback(undefined);
    placementsRef.current = [];
    setPlacements([]);

    const applyPlacements = (nextPlacements: VocabularyPlacement[]) => {
      if (!isMounted) {
        return;
      }
      placementsRef.current = nextPlacements;
      setPlacements(nextPlacements);
      nextZIndexRef.current = getNextZIndex(nextPlacements);
      setIsLayoutReady(true);
    };

    if (!lesson || !scene || !learningMode || !isAccessGranted) {
      applyPlacements(defaultPlacements);
      return () => {
        isMounted = false;
      };
    }

    loadSceneVocabularyLayout(lesson.id, scene.id, learningMode)
      .then(savedPlacements => {
        applyPlacements(
          restoreSceneVocabularyPlacements(defaultPlacements, savedPlacements),
        );
      })
      .catch(() => {
        applyPlacements(defaultPlacements);
      });

    return () => {
      isMounted = false;
    };
  }, [defaultPlacements, isAccessGranted, learningMode, lesson, scene]);

  useEffect(() => {
    let isMounted = true;
    loadSceneVocabularyMeaningEnabled()
      .then(meaningEnabled => {
        if (isMounted && !hasChangedMeaningPreferenceRef.current) {
          setIsMeaningEnabled(meaningEnabled);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (isMounted) {
          setIsMeaningPreferenceReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!tapFeedback) {
      return;
    }

    const timer = setTimeout(
      () => setTapFeedback(undefined),
      isMeaningEnabled
        ? MEANING_TAP_FEEDBACK_DURATION_MS
        : TAP_FEEDBACK_DURATION_MS,
    );
    return () => clearTimeout(timer);
  }, [isMeaningEnabled, tapFeedback]);

  useEffect(() => {
    if (!isAccessGranted || hasShownPlaygroundCoachThisSession) {
      return;
    }

    hasShownPlaygroundCoachThisSession = true;
    setShowCoach(true);
    const timer = setTimeout(() => setShowCoach(false), COACH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [isAccessGranted]);

  useEffect(() => {
    if (!scene || !isAccessGranted || vocabularyItems.length === 0) {
      return;
    }

    prefetchAssets([
      scene.background.source,
      ...vocabularyItems
        .map(item => item.assetSource)
        .filter((source): source is string => Boolean(source)),
    ]).catch(() => undefined);
  }, [isAccessGranted, scene, vocabularyItems]);

  const returnAfterBlockedAccess = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    if (lesson) {
      navigation.replace('LessonPack', {
        lessonId: lesson.id,
        openedFromParent,
      });
      return;
    }

    navigation.navigate('Home');
  }, [lesson, navigation, openedFromParent]);

  const playKidLockPrompt = useCallback(
    (reason: KidLockReason) => {
      playTapSound().catch(() => undefined);
      const message = getKidLockAudioPrompt(reason, promptLanguage);
      const speech =
        promptLanguage === 'en' ? speakWord(message) : speakVi(message);
      speech.catch(() => undefined);
    },
    [promptLanguage],
  );

  const showPremiumAccessPrompt = useCallback(() => {
    if (!lesson) {
      return;
    }

    if (isResolving) {
      playKidLockPrompt('resolving');
      Alert.alert(
        t('premium.kidLockedTitle'),
        t('premium.resolving'),
        [{ onPress: returnAfterBlockedAccess, text: t('common.close') }],
        { cancelable: false },
      );
      return;
    }

    playKidLockPrompt('premium');
    Alert.alert(
      t('premium.kidLockedTitle'),
      t('premium.kidLockedText'),
      [
        {
          onPress: returnAfterBlockedAccess,
          style: 'cancel',
          text: t('common.close'),
        },
        {
          onPress: () =>
            navigation.replace('Parent', {
              intent: 'premium',
              lessonId: lesson.id,
            }),
          text: t('premium.askParent'),
        },
      ],
      { cancelable: false },
    );
  }, [
    isResolving,
    lesson,
    navigation,
    playKidLockPrompt,
    returnAfterBlockedAccess,
    t,
  ]);

  useEffect(() => {
    if (!lesson || isAccessGranted || hasShownAccessPromptRef.current) {
      return;
    }

    hasShownAccessPromptRef.current = true;
    showPremiumAccessPrompt();
  }, [isAccessGranted, lesson, showPremiumAccessPrompt]);

  const handleCanvasLayout = (event: LayoutChangeEvent) => {
    setCanvasSize({
      height: event.nativeEvent.layout.height,
      width: event.nativeEvent.layout.width,
    });
  };

  const speakVocabularyItem = useCallback(
    (item: SceneVocabularyPlayItem) => {
      setTapFeedback({
        itemId: item.id,
        run: nextTapFeedbackRunRef.current,
      });
      nextTapFeedbackRunRef.current += 1;
      const session = startNarrationSession();
      playVocabularyWithOptionalMeaning(item, isMeaningEnabled, session).catch(
        () => undefined,
      );
    },
    [isMeaningEnabled],
  );

  const handleToggleMeaning = () => {
    if (!isMeaningPreferenceReady) {
      return;
    }
    playTapSound().catch(() => undefined);
    const nextMeaningEnabled = !isMeaningEnabled;
    hasChangedMeaningPreferenceRef.current = true;
    setIsMeaningEnabled(nextMeaningEnabled);
    saveSceneVocabularyMeaningEnabled(nextMeaningEnabled).catch(
      () => undefined,
    );
    const session = startNarrationSession();
    playVietnameseNarration(
      nextMeaningEnabled
        ? sceneVocabularyMeaningEnabledPromptVi
        : sceneVocabularyMeaningDisabledPromptVi,
      session,
    ).catch(() => undefined);
  };

  const bringItemToFront = useCallback((itemId: string) => {
    const zIndex = nextZIndexRef.current;
    nextZIndexRef.current += 1;
    const nextPlacements = placementsRef.current.map(placement =>
      placement.itemId === itemId ? { ...placement, zIndex } : placement,
    );
    placementsRef.current = nextPlacements;
    setPlacements(nextPlacements);
  }, []);

  const startItemInteraction = useCallback(
    (itemId: string) => {
      setTapFeedback(undefined);
      bringItemToFront(itemId);
    },
    [bringItemToFront],
  );

  const handleMovePlacement = useCallback(
    (itemId: string, x: number, y: number) => {
      const nextPlacements = placementsRef.current.map(placement =>
        placement.itemId === itemId
          ? {
              ...placement,
              x: clamp(x, 0.06, 0.94),
              y: clamp(y, 0.08, 0.92),
            }
          : placement,
      );
      placementsRef.current = nextPlacements;
      setPlacements(nextPlacements);

      if (lesson && scene && learningMode) {
        saveSceneVocabularyLayout(
          lesson.id,
          scene.id,
          learningMode,
          nextPlacements,
        ).catch(() => undefined);
      }
    },
    [learningMode, lesson, scene],
  );

  const handleReset = () => {
    playTapSound().catch(() => undefined);
    placementsRef.current = defaultPlacements;
    setPlacements(defaultPlacements);
    setTapFeedback(undefined);
    nextZIndexRef.current = getNextZIndex(defaultPlacements);
    if (lesson && scene && learningMode) {
      clearSceneVocabularyLayout(lesson.id, scene.id, learningMode).catch(
        () => undefined,
      );
    }
  };

  const handleClose = () => {
    playTapSound().catch(() => undefined);
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    if (lesson) {
      navigation.replace('LessonPack', {
        lessonId: lesson.id,
        openedFromParent,
      });
      return;
    }
    navigation.navigate('Home');
  };

  if (!lesson || !scene) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>
            {t('sceneVocabularyPlayground.notFound')}
          </Text>
          <AppButton
            title={t('scenePlayer.backToList')}
            onPress={() => navigation.navigate('LessonList')}
          />
        </View>
      </Screen>
    );
  }

  if (!isAccessGranted || !learningMode) {
    return (
      <Screen>
        <View />
      </Screen>
    );
  }

  const canvasContents = (
    <>
      {(isLayoutReady ? placements : [])
        .slice()
        .sort((left, right) => left.zIndex - right.zIndex)
        .map(placement => {
          const item = itemById.get(placement.itemId);
          if (!item) {
            return null;
          }
          return (
            <MovableVocabularyItem
              canvasSize={canvasSize}
              item={item}
              key={item.id}
              onInteractionStart={startItemInteraction}
              onMoveEnd={handleMovePlacement}
              onSpeak={speakVocabularyItem}
              placement={placement}
              reduceMotion={reduceMotion}
              showMeaning={isMeaningEnabled}
              tapEffectRun={
                tapFeedback?.itemId === item.id ? tapFeedback.run : 0
              }
            />
          );
        })}
    </>
  );

  return (
    <Screen
      safeAreaEdges={['top', 'bottom', 'left', 'right']}
      withBottomSpace={false}
    >
      <View
        style={[
          styles.container,
          responsiveLayout.isTabletLandscape && styles.containerWide,
        ]}
      >
        <View
          onLayout={handleCanvasLayout}
          style={styles.canvas}
          testID="scene-vocabulary-canvas"
        >
          {backgroundSource ? (
            <ImageBackground
              imageStyle={styles.backgroundImage}
              resizeMode="cover"
              source={backgroundSource}
              style={styles.backgroundImage}
            >
              {canvasContents}
            </ImageBackground>
          ) : (
            <View style={styles.backgroundFallback}>{canvasContents}</View>
          )}

          <View pointerEvents="box-none" style={styles.canvasTopBar}>
            <KidHeaderActionButton
              action="close"
              onPress={handleClose}
              testID="scene-vocabulary-close"
            />
            <Pressable
              accessibilityHint={t(
                'sceneVocabularyPlayground.meaningToggleHint',
              )}
              accessibilityLabel={t(
                isMeaningEnabled
                  ? 'sceneVocabularyPlayground.disableMeaning'
                  : 'sceneVocabularyPlayground.enableMeaning',
              )}
              accessibilityRole="switch"
              accessibilityState={{
                checked: isMeaningEnabled,
                disabled: !isMeaningPreferenceReady,
              }}
              disabled={!isMeaningPreferenceReady}
              onPress={handleToggleMeaning}
              style={({ pressed }) => [
                styles.meaningToggle,
                isMeaningEnabled && styles.meaningToggleEnabled,
                !isMeaningPreferenceReady && styles.meaningToggleDisabled,
                pressed && styles.pressed,
              ]}
              testID="scene-vocabulary-meaning-toggle"
            >
              <AppUiIcon
                name="language"
                size={38}
                style={[
                  styles.meaningToggleIcon,
                  isMeaningEnabled && styles.meaningToggleIconEnabled,
                ]}
              />
              <View
                pointerEvents="none"
                style={[
                  styles.meaningFlagBadge,
                  !isMeaningEnabled && styles.meaningFlagBadgeDisabled,
                ]}
                testID="scene-vocabulary-meaning-language-flag"
              >
                <Text style={styles.meaningFlagStar}>★</Text>
              </View>
              {isMeaningEnabled ? (
                <View
                  pointerEvents="none"
                  style={styles.meaningToggleCheckBadge}
                  testID="scene-vocabulary-meaning-enabled-badge"
                >
                  <Text style={styles.meaningToggleCheck}>✓</Text>
                </View>
              ) : null}
            </Pressable>
            <Pressable
              accessibilityLabel={t('sceneVocabularyPlayground.reset')}
              accessibilityRole="button"
              hitSlop={8}
              onPress={handleReset}
              style={({ pressed }) => [
                styles.compactIconButton,
                pressed && styles.pressed,
              ]}
              testID="scene-vocabulary-reset"
            >
              <SKidsIcon name="replay" size={24} />
            </Pressable>
          </View>

          {showCoach ? (
            <Pressable
              accessibilityLabel={t('sceneVocabularyPlayground.coach')}
              accessibilityRole="button"
              onPress={() => setShowCoach(false)}
              style={styles.coachOverlay}
              testID="scene-vocabulary-coach"
            >
              <Text style={styles.coachText}>
                {t('sceneVocabularyPlayground.hint')}
              </Text>
            </Pressable>
          ) : null}

          {vocabularyItems.length === 0 ? (
            <View style={styles.emptyVocabularyHint}>
              <SKidsIcon name="sticker" size={42} />
              <Text style={styles.emptyVocabularyHintText}>
                {t('sceneVocabularyPlayground.emptyVocabulary')}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

type MovableVocabularyItemProps = {
  canvasSize: CanvasSize;
  item: SceneVocabularyPlayItem;
  onInteractionStart: (itemId: string) => void;
  onMoveEnd: (itemId: string, x: number, y: number) => void;
  onSpeak: (item: SceneVocabularyPlayItem) => void;
  placement: VocabularyPlacement;
  reduceMotion: boolean;
  showMeaning: boolean;
  tapEffectRun: number;
};

function MovableVocabularyItem({
  canvasSize,
  item,
  onInteractionStart,
  onMoveEnd,
  onSpeak,
  placement,
  reduceMotion,
  showMeaning,
  tapEffectRun,
}: MovableVocabularyItemProps) {
  const translateX = useRef(
    new Animated.Value(placement.x * canvasSize.width),
  ).current;
  const translateY = useRef(
    new Animated.Value(placement.y * canvasSize.height),
  ).current;
  const currentPositionRef = useRef({ x: placement.x, y: placement.y });
  const panStartRef = useRef(currentPositionRef.current);
  const isPanningRef = useRef(false);
  const artworkScale = useRef(new Animated.Value(1)).current;
  const haloOpacity = useRef(new Animated.Value(0)).current;
  const haloScale = useRef(new Animated.Value(0.72)).current;
  const wordOpacity = useRef(new Animated.Value(0)).current;
  const wordTranslateY = useRef(new Animated.Value(6)).current;

  useEffect(() => {
    artworkScale.stopAnimation();
    haloOpacity.stopAnimation();
    haloScale.stopAnimation();
    wordOpacity.stopAnimation();
    wordTranslateY.stopAnimation();

    if (tapEffectRun <= 0) {
      if (!isPanningRef.current) {
        artworkScale.setValue(1);
      }
      haloOpacity.setValue(0);
      haloScale.setValue(0.72);
      wordOpacity.setValue(0);
      wordTranslateY.setValue(6);
      return;
    }

    artworkScale.setValue(1);
    haloOpacity.setValue(0);
    haloScale.setValue(reduceMotion ? 1 : 0.72);
    wordOpacity.setValue(0);
    wordTranslateY.setValue(reduceMotion ? 0 : 6);

    const feedbackAnimations = [
      Animated.sequence([
        Animated.timing(haloOpacity, {
          duration: 90,
          easing: Easing.out(Easing.quad),
          toValue: 0.58,
          useNativeDriver: true,
        }),
        Animated.timing(haloOpacity, {
          duration: reduceMotion ? 280 : 430,
          easing: Easing.out(Easing.quad),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.parallel([
          Animated.timing(wordOpacity, {
            duration: 120,
            easing: Easing.out(Easing.quad),
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(wordTranslateY, {
            duration: 180,
            easing: Easing.out(Easing.quad),
            toValue: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(1050),
        Animated.timing(wordOpacity, {
          duration: 260,
          easing: Easing.in(Easing.quad),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    ];

    if (!reduceMotion) {
      feedbackAnimations.push(
        Animated.timing(haloScale, {
          duration: 520,
          easing: Easing.out(Easing.cubic),
          toValue: 1.35,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(artworkScale, {
            duration: 70,
            easing: Easing.inOut(Easing.quad),
            toValue: 0.9,
            useNativeDriver: true,
          }),
          Animated.spring(artworkScale, {
            bounciness: 11,
            speed: 24,
            toValue: 1.12,
            useNativeDriver: true,
          }),
          Animated.spring(artworkScale, {
            bounciness: 7,
            speed: 18,
            toValue: 1,
            useNativeDriver: true,
          }),
        ]),
      );
    }

    const animation = Animated.parallel(feedbackAnimations);
    animation.start();
    return () => animation.stop();
  }, [
    artworkScale,
    haloOpacity,
    haloScale,
    reduceMotion,
    tapEffectRun,
    wordOpacity,
    wordTranslateY,
  ]);

  useEffect(() => {
    if (isPanningRef.current) {
      return;
    }
    currentPositionRef.current = { x: placement.x, y: placement.y };
    translateX.setValue(placement.x * canvasSize.width);
    translateY.setValue(placement.y * canvasSize.height);
  }, [
    canvasSize.height,
    canvasSize.width,
    placement.x,
    placement.y,
    translateX,
    translateY,
  ]);

  const animateDragLift = () => {
    if (reduceMotion) {
      return;
    }
    artworkScale.stopAnimation();
    Animated.spring(artworkScale, {
      bounciness: 4,
      speed: 22,
      toValue: 1.04,
      useNativeDriver: true,
    }).start();
  };

  const animateDrop = () => {
    artworkScale.stopAnimation();
    if (reduceMotion) {
      artworkScale.setValue(1);
      return;
    }
    artworkScale.setValue(0.94);
    Animated.sequence([
      Animated.spring(artworkScale, {
        bounciness: 9,
        speed: 24,
        toValue: 1.07,
        useNativeDriver: true,
      }),
      Animated.spring(artworkScale, {
        bounciness: 6,
        speed: 19,
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const speakItem = () => {
    onInteractionStart(item.id);
    onSpeak(item);
  };

  const panGesture = usePanGesture({
    averageTouches: true,
    disableReanimated: true,
    minDistance: 6,
    onActivate: () => {
      isPanningRef.current = true;
      panStartRef.current = { ...currentPositionRef.current };
      onInteractionStart(item.id);
      animateDragLift();
    },
    onDeactivate: () => {
      isPanningRef.current = false;
      onMoveEnd(
        item.id,
        currentPositionRef.current.x,
        currentPositionRef.current.y,
      );
      animateDrop();
    },
    onUpdate: event => {
      if (canvasSize.width <= 0 || canvasSize.height <= 0) {
        return;
      }
      const x = clamp(
        panStartRef.current.x + event.translationX / canvasSize.width,
        0.06,
        0.94,
      );
      const y = clamp(
        panStartRef.current.y + event.translationY / canvasSize.height,
        0.08,
        0.92,
      );
      currentPositionRef.current = { x, y };
      translateX.setValue(x * canvasSize.width);
      translateY.setValue(y * canvasSize.height);
    },
    testID: `scene-vocabulary-placement-${item.id}`,
  });
  const tapGesture = useTapGesture({
    disableReanimated: true,
    maxDistance: 5,
    onDeactivate: event => {
      if (!event.canceled) {
        speakItem();
      }
    },
  });
  const gesture = useSimultaneousGestures(panGesture, tapGesture);
  const wordBubbleLayout = getVocabularyBubbleLayout(
    showMeaning ? `${item.word} ${item.meaningVi}` : item.word,
    canvasSize.width,
    placement.x,
  );

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        accessibilityHint={item.meaningVi}
        accessibilityLabel={item.word}
        accessibilityRole="button"
        onAccessibilityTap={speakItem}
        style={[
          styles.placedItem,
          {
            transform: [{ translateX }, { translateY }],
            zIndex: placement.zIndex,
          },
        ]}
        testID={`scene-vocabulary-object-${item.id}`}
      >
        {tapEffectRun > 0 ? (
          <>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.tapHalo,
                {
                  opacity: haloOpacity,
                  transform: [{ scale: haloScale }],
                },
              ]}
              testID={`scene-vocabulary-halo-${item.id}`}
            />
            {!reduceMotion ? (
              <View
                pointerEvents="none"
                style={styles.sparkleLayer}
                testID={`scene-vocabulary-sparkles-${item.id}`}
              >
                <SparkleEffect active key={tapEffectRun} />
              </View>
            ) : null}
          </>
        ) : null}
        <Animated.View style={{ transform: [{ scale: artworkScale }] }}>
          <VocabularyArtwork item={item} />
        </Animated.View>
        {tapEffectRun > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.objectWordPill,
              placement.y < 0.18
                ? styles.objectWordPillBelow
                : styles.objectWordPillAbove,
              {
                borderRadius: wordBubbleLayout.borderRadius,
                left: wordBubbleLayout.left,
                width: wordBubbleLayout.width,
              },
              {
                opacity: wordOpacity,
                transform: [{ translateY: wordTranslateY }],
              },
            ]}
            testID={`scene-vocabulary-word-${item.id}`}
          >
            <Text
              style={[
                styles.objectWordText,
                {
                  fontSize: wordBubbleLayout.fontSize,
                  lineHeight: wordBubbleLayout.lineHeight,
                },
              ]}
            >
              {item.word}
            </Text>
            {showMeaning ? (
              <Text style={styles.objectMeaningText}>{item.meaningVi}</Text>
            ) : null}
          </Animated.View>
        ) : null}
      </Animated.View>
    </GestureDetector>
  );
}

function VocabularyArtwork({ item }: { item: SceneVocabularyPlayItem }) {
  return (
    <Image
      accessibilityIgnoresInvertColors
      resizeMode="contain"
      source={item.imageSource}
      style={styles.playgroundArtwork}
    />
  );
}

async function playVocabularyWithOptionalMeaning(
  item: SceneVocabularyPlayItem,
  meaningEnabled: boolean,
  session: NarrationSession,
) {
  const englishResult = await playWordNarration(item.word, undefined, session);
  if (
    englishResult !== 'completed' ||
    !meaningEnabled ||
    !item.meaningVi.trim() ||
    !session.isActive()
  ) {
    return;
  }

  await waitForMeaningNarrationDelay();
  if (!session.isActive()) {
    return;
  }
  await playVietnameseNarration(item.meaningVi, session);
}

function waitForMeaningNarrationDelay() {
  return new Promise<void>(resolve => {
    setTimeout(resolve, MEANING_NARRATION_DELAY_MS);
  });
}

function restoreSceneVocabularyPlacements(
  defaultPlacements: readonly VocabularyPlacement[],
  savedPlacements: readonly SceneVocabularySavedPlacement[],
): VocabularyPlacement[] {
  const savedPlacementByItemId = new Map(
    savedPlacements.map(placement => [placement.itemId, placement]),
  );
  const currentItemIds = new Set(
    defaultPlacements.map(placement => placement.itemId),
  );
  const maximumSavedZIndex = savedPlacements.reduce(
    (maximum, placement) =>
      currentItemIds.has(placement.itemId)
        ? Math.max(maximum, placement.zIndex)
        : maximum,
    0,
  );
  let nextDefaultZIndex = maximumSavedZIndex + 1;

  return defaultPlacements.map(defaultPlacement => {
    const savedPlacement = savedPlacementByItemId.get(defaultPlacement.itemId);
    if (!savedPlacement) {
      const placement = {
        ...defaultPlacement,
        zIndex: nextDefaultZIndex,
      };
      nextDefaultZIndex += 1;
      return placement;
    }

    return {
      itemId: defaultPlacement.itemId,
      x: clamp(savedPlacement.x, 0.06, 0.94),
      y: clamp(savedPlacement.y, 0.08, 0.92),
      zIndex: savedPlacement.zIndex,
    };
  });
}

function getNextZIndex(placements: readonly VocabularyPlacement[]) {
  return (
    placements.reduce(
      (maximum, placement) => Math.max(maximum, placement.zIndex),
      0,
    ) + 1
  );
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function getVocabularyBubbleLayout(
  word: string,
  measuredCanvasWidth: number,
  normalizedX: number,
) {
  const canvasWidth = measuredCanvasWidth > 0 ? measuredCanvasWidth : 360;
  const characterCount = Array.from(word.trim()).length;
  const wordCount = word.trim().split(/\s+/).filter(Boolean).length;
  const isCompact = characterCount <= 14 && wordCount <= 2;
  const isMedium = !isCompact && characterCount <= 26;
  const desiredWidth = isCompact
    ? clamp(64 + characterCount * 8, 120, 176)
    : isMedium
    ? 224
    : 280;
  const availableWidth = Math.max(
    120,
    canvasWidth - WORD_BUBBLE_CANVAS_MARGIN * 2,
  );
  const width = Math.min(desiredWidth, availableWidth);
  const itemCenterX = normalizedX * canvasWidth;
  const itemLeft = itemCenterX - PLAY_ITEM_SIZE / 2;
  const desiredCanvasLeft = itemCenterX - width / 2;
  const maximumCanvasLeft = Math.max(
    WORD_BUBBLE_CANVAS_MARGIN,
    canvasWidth - width - WORD_BUBBLE_CANVAS_MARGIN,
  );
  const canvasLeft = clamp(
    desiredCanvasLeft,
    WORD_BUBBLE_CANVAS_MARGIN,
    maximumCanvasLeft,
  );

  return {
    borderRadius: isCompact ? radius.pill : radius.lg,
    fontSize: isCompact ? 22 : isMedium ? 20 : 18,
    left: canvasLeft - itemLeft,
    lineHeight: isCompact ? 28 : isMedium ? 26 : 24,
    width,
  };
}

const styles = createThemedStyles(() => ({
  backgroundFallback: {
    backgroundColor: colors.backgroundWarm,
    flex: 1,
  },
  backgroundImage: {
    borderRadius: radius.xl,
    flex: 1,
    overflow: 'hidden',
    width: '100%',
  },
  canvas: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.outlineStrong,
    borderRadius: radius.xl,
    borderWidth: 3,
    flex: 1,
    minHeight: 320,
    overflow: 'hidden',
    ...shadows.soft,
  },
  canvasTopBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: spacing.sm,
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
    zIndex: 1000,
  },
  coachOverlay: {
    alignSelf: 'center',
    backgroundColor: colors.imageLabelSurface,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    borderWidth: 2,
    left: '10%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    position: 'absolute',
    right: '10%',
    top: '16%',
    zIndex: 900,
    ...shadows.soft,
  },
  coachText: {
    color: colors.text,
    textAlign: 'center',
    ...typography.body,
  },
  compactIconButton: {
    alignItems: 'center',
    backgroundColor: colors.imageLabelSurface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 48,
    justifyContent: 'center',
    width: 48,
    ...shadows.soft,
  },
  container: {
    flex: 1,
    padding: spacing.xs,
  },
  containerWide: {
    alignSelf: 'center',
    maxWidth: 1040,
    width: '100%',
  },
  emptyVocabularyHint: {
    alignItems: 'center',
    backgroundColor: colors.imageLabelSurface,
    borderRadius: radius.lg,
    gap: spacing.xxs,
    left: '18%',
    padding: spacing.md,
    position: 'absolute',
    right: '18%',
    top: '38%',
  },
  emptyVocabularyHintText: {
    color: colors.text,
    textAlign: 'center',
    ...typography.body,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.lg,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  errorTitle: {
    color: colors.text,
    textAlign: 'center',
    ...typography.title,
  },
  meaningToggle: {
    alignItems: 'center',
    backgroundColor: colors.imageLabelSurface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 58,
    justifyContent: 'center',
    position: 'relative',
    width: 64,
    ...shadows.soft,
  },
  meaningFlagBadge: {
    alignItems: 'center',
    backgroundColor: '#DA251D',
    borderColor: colors.surface,
    borderRadius: 5,
    borderWidth: 2,
    bottom: 4,
    height: 18,
    justifyContent: 'center',
    position: 'absolute',
    right: 5,
    width: 25,
  },
  meaningFlagBadgeDisabled: {
    opacity: 0.42,
  },
  meaningFlagStar: {
    color: '#FFDD00',
    fontSize: 11,
    lineHeight: 13,
    textAlign: 'center',
  },
  meaningToggleCheck: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 16,
    textAlign: 'center',
  },
  meaningToggleCheckBadge: {
    alignItems: 'center',
    backgroundColor: colors.green,
    borderColor: colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: -5,
    top: -5,
    width: 24,
  },
  meaningToggleDisabled: {
    opacity: 0.62,
  },
  meaningToggleEnabled: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  meaningToggleIcon: {
    opacity: 0.6,
  },
  meaningToggleIconEnabled: {
    opacity: 1,
  },
  objectMeaningText: {
    color: colors.textSoft,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
    marginTop: 1,
    textAlign: 'center',
  },
  placedItem: {
    alignItems: 'center',
    height: PLAY_ITEM_SIZE,
    justifyContent: 'center',
    left: -PLAY_ITEM_SIZE / 2,
    position: 'absolute',
    top: -PLAY_ITEM_SIZE / 2,
    width: PLAY_ITEM_SIZE,
  },
  objectWordPill: {
    alignItems: 'center',
    backgroundColor: colors.imageLabelSurface,
    borderColor: colors.primary,
    borderWidth: 2,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    position: 'absolute',
    zIndex: 8,
    ...shadows.soft,
  },
  objectWordPillAbove: {
    bottom: PLAY_ITEM_SIZE - 10,
  },
  objectWordPillBelow: {
    top: PLAY_ITEM_SIZE - 10,
  },
  objectWordText: {
    color: colors.primaryDark,
    textAlign: 'center',
    ...typography.subtitle,
  },
  playgroundArtwork: {
    height: PLAY_ITEM_SIZE - 10,
    width: PLAY_ITEM_SIZE - 10,
  },
  pressed: {
    opacity: 0.82,
  },
  sparkleLayer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 2,
  },
  tapHalo: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
    borderRadius: 46,
    borderWidth: 3,
    height: 92,
    left: 2,
    position: 'absolute',
    top: 2,
    width: 92,
  },
}));
