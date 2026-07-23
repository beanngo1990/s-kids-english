import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  ImageBackground,
  type LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { KidIconButton } from '../components/KidIconButton';
import { MascotImage, MascotSpeechBubble } from '../components/mascot';
import { SKidsIcon } from '../components/SKidsIcon';
import { SpeakPracticeControls } from '../components/SpeakPracticeControls';
import { getSceneForLearningMode } from '../data/learningModes';
import {
  getViAudioAsset,
  getWordAudioAsset,
  type RemoteAudioAsset,
} from '../data/audioManifest';
import { getRemoteAssetUrl } from '../config/remoteAssets';
import { lessons } from '../data/lessons';
import { useSavedAppLanguage, useTranslations } from '../i18n';
import { getLocalizedSceneTitle } from '../i18n/domainCopy';
import {
  getTeacherInstructionEn,
  resolveRecordingEncouragementPrompt,
  resolveSceneCompletionPrompt,
  resolveSpeechPracticePrompt,
  resolveTeacherFeedback,
  resolveTeacherInstruction,
} from '../i18n/teacherPrompts';
import type { TeacherPromptMode } from '../i18n/types';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { useResponsiveLayout } from '../theme/responsive';
import { radius, spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import type {
  EntityId,
  LearningMode,
  PercentRect,
  Scene,
  SceneObject,
  SceneStep,
} from '../types/lesson';
import { DEFAULT_ENGLISH_ACCENT, type EnglishAccent } from '../types/audio';
import {
  cancelNarration,
  playCorrectSound,
  playTeacherPromptNarration,
  playWordNarration,
  playSoundEffect,
  playTapSound,
  playWrongSound,
  speakVi,
  speakWord,
  startNarrationSession,
  type NarrationPlaybackResult,
  type NarrationSession,
} from './AudioManager';
import { getSceneFallbackPalette } from './AssetFallbacks';
import { prefetchAssets, resolveAsset } from './AssetRegistry';
import {
  prefetchRemoteAssets,
  prepareRemoteAssets,
  type RemoteAssetCacheEntry,
} from './AssetCacheManager';
import {
  type DragTranslation,
  getDraggedRect,
  getPercentRectStyle,
  getSnapRect,
  isDropAccepted,
} from './PositionUtils';
import {
  saveCurrentStepProgress,
  saveLearnedWord,
  saveSceneProgress,
} from './ProgressManager';
import { AdminSceneEditor } from './AdminSceneEditor';
import {
  SceneObjectRenderer,
  type SceneObjectEffect,
} from './SceneObjectRenderer';
import {
  getParentSettings,
  subscribeParentSettings,
} from './ParentSettingsManager';
import {
  canPressObjects,
  getInitialStep,
  getStepById,
  getStepIndex,
  isListenStep,
  isStepTargetObject,
  resolveContinueInteraction,
  resolveDragInteraction,
  resolveObjectInteraction,
  type StepInteractionResult,
  type StepObjectEffect,
} from './StepController';

type FeedbackState = {
  type: 'success' | 'fail' | 'info';
  text: string;
};

type FeedbackAudioStatus = 'playing' | 'preparing';

type RequiredAssetFailure = 'feedback' | 'scene' | 'step';

type ObjectEffectMap = Partial<Record<EntityId, SceneObjectEffect>>;

type AutoRecordRequest = {
  requestId: number;
  stepId: EntityId;
};

type SceneCompletionState = {
  isFinalScene: boolean;
  nextSceneIndex: number | undefined;
  scene: Scene;
  sceneIndex: number;
  xpGained: number;
};

const objectAudioCooldownMs = 900;
const interactionCooldownMs = 400;
const feedbackPlaybackTimeoutMs = 15000;

type ScenePlayerProps = {
  lessonId?: string;
  scene?: Scene;
  initialSceneId?: string;
  learningMode?: LearningMode;
  completeCurrentSceneOnly?: boolean;
  onExit?: () => void;
  onComplete?: () => void;
};

function AnimatedLoadingMascot() {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -12,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();

    return () => animation.stop();
  }, [floatAnim]);

  const shadowScale = floatAnim.interpolate({
    inputRange: [-12, 0],
    outputRange: [0.75, 1],
  });

  const shadowOpacity = floatAnim.interpolate({
    inputRange: [-12, 0],
    outputRange: [0.08, 0.2],
  });

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
      }}
    >
      {/* Spotlight Faux Gradient */}
      <View
        style={{
          position: 'absolute',
          width: 280,
          height: 280,
          borderRadius: 140,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          transform: [{ scale: 1.5 }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
        }}
      />

      <Animated.View
        style={{ transform: [{ translateY: floatAnim }], zIndex: 2 }}
      >
        <MascotImage pose="learn" size="xl" />
      </Animated.View>

      {/* Contact Shadow */}
      <Animated.View
        style={{
          width: 100,
          height: 16,
          backgroundColor: '#000',
          borderRadius: 8,
          marginTop: -8,
          opacity: shadowOpacity,
          transform: [{ scale: shadowScale }],
          zIndex: 1,
        }}
      />
    </View>
  );
}

function CustomProgressBar({ progress }: { progress: number }) {
  const [containerWidth, setContainerWidth] = useState(200);

  const pillWidth = Math.max(14, (progress / 100) * containerWidth); // minimum width to show rounding

  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          height: 14,
          width: 200,
          backgroundColor: colors.white,
          borderRadius: radius.pill,
          overflow: 'hidden',
          marginTop: spacing.md,
          borderColor: colors.border,
          borderWidth: 2,
        }}
        onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <View
          style={{
            height: '100%',
            width: pillWidth,
            backgroundColor: colors.primary,
            borderRadius: radius.pill,
          }}
        />
      </View>
      <Text
        style={{
          marginTop: spacing.xs,
          color: colors.primaryDark,
          fontWeight: 'bold',
          fontSize: 14,
        }}
      >
        {Math.round(progress)}%
      </Text>
    </View>
  );
}

function AnimatedAudioWave() {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnim = (
      anim: Animated.Value,
      duration: number,
      animationDelay: number,
    ) => {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
            delay: animationDelay,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
      return animation;
    };

    const animations = [
      startAnim(anim1, 400, 0),
      startAnim(anim2, 350, 150),
      startAnim(anim3, 450, 50),
    ];

    return () => animations.forEach(animation => animation.stop());
  }, [anim1, anim2, anim3]);

  const scaleY = (anim: Animated.Value) =>
    anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1.2] });

  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: 4, height: 18 }}
    >
      <Animated.View
        style={{
          width: 4,
          height: 18,
          backgroundColor: colors.primary,
          borderRadius: 2,
          transform: [{ scaleY: scaleY(anim1) }],
        }}
      />
      <Animated.View
        style={{
          width: 4,
          height: 18,
          backgroundColor: colors.primary,
          borderRadius: 2,
          transform: [{ scaleY: scaleY(anim2) }],
        }}
      />
      <Animated.View
        style={{
          width: 4,
          height: 18,
          backgroundColor: colors.primary,
          borderRadius: 2,
          transform: [{ scaleY: scaleY(anim3) }],
        }}
      />
    </View>
  );
}

export function ScenePlayer({
  lessonId,
  scene,
  initialSceneId,
  learningMode = 'core',
  completeCurrentSceneOnly = false,
  onExit,
  onComplete,
}: ScenePlayerProps) {
  useThemeSync();
  const appLanguage = useSavedAppLanguage();
  const [teacherPromptMode, setTeacherPromptMode] =
    useState<TeacherPromptMode>('vi');
  const [englishAccent, setEnglishAccent] = useState<EnglishAccent>(
    DEFAULT_ENGLISH_ACCENT,
  );
  const [isLocalizationReady, setIsLocalizationReady] = useState(false);
  const t = useTranslations(appLanguage);
  const insets = useSafeAreaInsets();
  const responsiveLayout = useResponsiveLayout();
  const isTabletLandscapeLayout = responsiveLayout.isTabletLandscape;
  const lesson = useMemo(
    () => lessons.find(item => item.id === lessonId),
    [lessonId],
  );
  const sourceScenes = useMemo(() => {
    if (scene) {
      return [scene];
    }

    return lesson?.scenes ?? [];
  }, [lesson?.scenes, scene]);
  const scenes = useMemo(
    () =>
      sourceScenes.map(sourceScene =>
        getSceneForLearningMode(sourceScene, learningMode),
      ),
    [learningMode, sourceScenes],
  );
  const initialSceneIndex = useMemo(() => {
    const requestedIndex = scenes.findIndex(item => item.id === initialSceneId);
    return requestedIndex >= 0 ? requestedIndex : 0;
  }, [initialSceneId, scenes]);
  const [sceneIndex, setSceneIndex] = useState(initialSceneIndex);
  const currentScene = scenes[sceneIndex];
  const [stepId, setStepId] = useState<EntityId | undefined>(
    currentScene ? getInitialStep(currentScene)?.id : undefined,
  );
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [successObjectEffects, setSuccessObjectEffects] =
    useState<ObjectEffectMap>({});
  const [shakeObjectIds, setShakeObjectIds] = useState<EntityId[]>([]);
  const [hintObjectIds, setHintObjectIds] = useState<EntityId[]>([]);
  const [wrongAttemptsByStepId, setWrongAttemptsByStepId] = useState<
    Record<EntityId, number>
  >({});
  const [failedBackgroundIds, setFailedBackgroundIds] = useState<
    Record<EntityId, boolean>
  >({});
  const [stageSize, setStageSize] = useState({ height: 0, width: 0 });
  const [snappedObjectPositions, setSnappedObjectPositions] = useState<
    Record<EntityId, PercentRect>
  >({});
  const [autoRecordRequest, setAutoRecordRequest] =
    useState<AutoRecordRequest | null>(null);
  const [isSpeechPracticeBusy, setIsSpeechPracticeBusy] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSceneEditorControl, setShowSceneEditorControl] = useState(false);
  const [sceneCompletion, setSceneCompletion] =
    useState<SceneCompletionState | null>(null);
  const [isPreloading, setIsPreloading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [preparedStepAudioKey, setPreparedStepAudioKey] = useState<
    string | null
  >(null);
  const [preparedFeedbackAudioKey, setPreparedFeedbackAudioKey] = useState<
    string | null
  >(null);
  const [feedbackAudioStatus, setFeedbackAudioStatus] =
    useState<FeedbackAudioStatus | null>(null);
  const [requiredAssetFailure, setRequiredAssetFailure] =
    useState<RequiredAssetFailure | null>(null);
  const [assetRetryNonce, setAssetRetryNonce] = useState(0);
  const [completedListenInstructionKey, setCompletedListenInstructionKey] =
    useState<string | null>(null);

  // Floating drag setup
  const floatEditPos = useRef({ x: 20, y: 100 });
  const floatEditAnim = useRef(new Animated.ValueXY({ x: 20, y: 100 })).current;
  const floatEditStart = useRef({ x: 20, y: 100 });
  const floatEditPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        floatEditStart.current = {
          x: floatEditPos.current.x,
          y: floatEditPos.current.y,
        };
      },
      onPanResponderMove: (_, state) => {
        const newX = floatEditStart.current.x + state.dx;
        const newY = floatEditStart.current.y + state.dy;
        floatEditPos.current = { x: newX, y: newY };
        floatEditAnim.setValue({ x: newX, y: newY });
      },
      onPanResponderRelease: () => {},
    }),
  ).current;

  const advanceRequestIdRef = useRef(0);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const objectAudioLastPlayedAtRef = useRef<Record<EntityId, number>>({});
  const lastInteractionAtRef = useRef(0);

  useEffect(() => {
    setSceneIndex(initialSceneIndex);
  }, [initialSceneIndex]);

  useEffect(() => {
    let isMounted = true;

    const applyRuntimeSettings = (
      settings: Awaited<ReturnType<typeof getParentSettings>>,
    ) => {
      setTeacherPromptMode(settings.teacherPromptMode ?? 'vi');
      setEnglishAccent(settings.englishAccent ?? DEFAULT_ENGLISH_ACCENT);
      if (__DEV__) {
        setShowSceneEditorControl(settings.enableSceneEditor || false);
      }
    };

    const unsubscribe = subscribeParentSettings(settings => {
      if (isMounted) {
        applyRuntimeSettings(settings);
      }
    });

    getParentSettings()
      .then(settings => {
        if (isMounted) {
          applyRuntimeSettings(settings);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (isMounted) {
          setIsLocalizationReady(true);
        }
      });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    advanceRequestIdRef.current += 1;
    setStepId(currentScene ? getInitialStep(currentScene)?.id : undefined);
    setFeedback(null);
    setSuccessObjectEffects({});
    setShakeObjectIds([]);
    setHintObjectIds([]);
    setWrongAttemptsByStepId({});
    setSnappedObjectPositions({});
    setAutoRecordRequest(null);
    setIsSpeechPracticeBusy(false);
    setCompletedListenInstructionKey(null);
    setSceneCompletion(null);
    setIsPreloading(true);
    setLoadProgress(0);
    setPreparedStepAudioKey(null);
    setPreparedFeedbackAudioKey(null);
    setFeedbackAudioStatus(null);
    setRequiredAssetFailure(null);
  }, [currentScene]);

  useEffect(() => {
    if (!currentScene) {
      setIsPreloading(false);
      return;
    }

    if (!isLocalizationReady) {
      return;
    }

    let isMounted = true;
    setIsPreloading(true);

    const preloadCurrentScene = async () => {
      try {
        const imageAssets = getSceneImageSources(currentScene);
        const audioAssets = getSceneRequiredAudioAssets(
          currentScene,
          teacherPromptMode,
          englishAccent,
        );

        let loaded = 0;
        const total = imageAssets.length + audioAssets.length;

        if (total === 0) {
          setLoadProgress(100);
        }

        const updateProgress = () => {
          loaded++;
          if (isMounted) {
            setLoadProgress(Math.min(99, Math.round((loaded / total) * 100)));
          }
        };

        const imagePromises = imageAssets.map(async asset => {
          try {
            return await prefetchAssets([asset]);
          } catch {
            return false;
          } finally {
            updateProgress();
          }
        });
        const audioPromises = audioAssets.map(async asset => {
          try {
            return await prepareRemoteAssets([asset]);
          } catch {
            return false;
          } finally {
            updateProgress();
          }
        });

        const readiness = await Promise.all([
          ...imagePromises,
          ...audioPromises,
        ]);
        if (!readiness.every(Boolean)) {
          if (isMounted) {
            setRequiredAssetFailure('scene');
          }
          return;
        }

        if (isMounted) {
          setRequiredAssetFailure(null);
          setLoadProgress(100);
        }
      } catch {
        if (isMounted) {
          setRequiredAssetFailure('scene');
        }
      } finally {
        if (isMounted) {
          setIsPreloading(false);
        }
      }
    };

    preloadCurrentScene();

    return () => {
      isMounted = false;
    };
  }, [
    assetRetryNonce,
    currentScene,
    englishAccent,
    isLocalizationReady,
    teacherPromptMode,
  ]);

  useEffect(() => {
    if (
      !currentScene ||
      isPreloading ||
      !isLocalizationReady ||
      requiredAssetFailure
    ) {
      return;
    }

    const timer = setTimeout(() => {
      const nextScene = scenes[sceneIndex + 1];
      const backgroundAudioAssets = [
        ...getSceneRequiredAudioAssets(
          currentScene,
          teacherPromptMode,
          englishAccent,
        ),
        ...(nextScene
          ? getSceneRequiredAudioAssets(
              nextScene,
              teacherPromptMode,
              englishAccent,
            )
          : []),
      ];

      if (nextScene) {
        prefetchAssets(getSceneImageSources(nextScene)).catch(() => undefined);
      }
      prefetchRemoteAssets(backgroundAudioAssets).catch(() => undefined);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [
    currentScene,
    englishAccent,
    isLocalizationReady,
    isPreloading,
    requiredAssetFailure,
    sceneIndex,
    scenes,
    teacherPromptMode,
  ]);

  useEffect(() => {
    if (!requiredAssetFailure) {
      return;
    }

    advanceRequestIdRef.current += 1;
    clearTimer(advanceTimerRef);
    clearTimer(clearFeedbackTimerRef);
    cancelStepAudioSequence();
  }, [requiredAssetFailure]);

  useEffect(() => {
    return () => {
      advanceRequestIdRef.current += 1;
      clearTimer(advanceTimerRef);
      clearTimer(clearFeedbackTimerRef);
      cancelStepAudioSequence();
    };
  }, []);

  const currentStep = currentScene
    ? getStepById(currentScene, stepId) ?? getInitialStep(currentScene)
    : undefined;
  const stepAudioPreparationKey =
    currentScene && currentStep
      ? getStepAudioPreparationKey(
          currentScene,
          currentStep,
          teacherPromptMode,
          englishAccent,
        )
      : null;
  const feedbackAudioPreparationKey =
    currentScene && currentStep
      ? getFeedbackAudioPreparationKey(
          currentScene,
          currentStep,
          teacherPromptMode,
          englishAccent,
        )
      : null;

  useEffect(() => {
    if (
      !currentScene ||
      !currentStep ||
      isPreloading ||
      !isLocalizationReady ||
      requiredAssetFailure
    ) {
      return;
    }

    let isActive = true;
    setIsSpeechPracticeBusy(false);
    const isListeningStep = isListenStep(currentStep);
    const instructionKey = getListenInstructionKey(currentScene, currentStep);
    if (isListeningStep) {
      setCompletedListenInstructionKey(null);
    }

    if (lessonId) {
      saveCurrentStepProgress(lessonId, currentScene.id, currentStep.id);
    }

    const prepareAndPlayStepAudio = async () => {
      const stepAudioAssets = getStepAudioAssets(
        currentScene,
        currentStep,
        teacherPromptMode,
        englishAccent,
      );
      const isStepAudioReady =
        stepAudioAssets.length === 0 ||
        (await prepareRemoteAssets(stepAudioAssets));
      if (!isActive || !stepAudioPreparationKey) {
        return;
      }
      if (!isStepAudioReady) {
        setRequiredAssetFailure('step');
        return;
      }

      setPreparedStepAudioKey(stepAudioPreparationKey);
      playAudioForStep(currentScene, currentStep, teacherPromptMode, {
        onAudioFailure: () => {
          if (isActive) {
            setRequiredAssetFailure('step');
          }
        },
        onAudioComplete: () => {
          if (isListeningStep) {
            setCompletedListenInstructionKey(instructionKey);
          }
        },
        onTeachAudioComplete: () => {
          setAutoRecordRequest(previousRequest => ({
            requestId: (previousRequest?.requestId ?? 0) + 1,
            stepId: currentStep.id,
          }));
        },
      });

      if (feedbackAudioPreparationKey) {
        const feedbackAssets = getStepFeedbackAudioAssets(
          currentScene,
          currentStep,
          teacherPromptMode,
          englishAccent,
        );
        const feedbackPreparation =
          feedbackAssets.length === 0
            ? Promise.resolve(true)
            : prepareRemoteAssets(feedbackAssets);
        feedbackPreparation
          .then(isReady => {
            if (isActive && isReady) {
              setPreparedFeedbackAudioKey(feedbackAudioPreparationKey);
            } else if (isActive) {
              setRequiredAssetFailure('feedback');
            }
          })
          .catch(() => {
            if (isActive) {
              setRequiredAssetFailure('feedback');
            }
          });
      }

      const nextStep = currentStep.nextStepId
        ? getStepById(currentScene, currentStep.nextStepId)
        : undefined;
      if (nextStep) {
        prepareRemoteAssets(
          getStepAudioAssets(
            currentScene,
            nextStep,
            teacherPromptMode,
            englishAccent,
          ),
        ).catch(() => undefined);
      }
    };

    prepareAndPlayStepAudio().catch(() => {
      if (isActive) {
        setRequiredAssetFailure('step');
      }
    });

    return () => {
      isActive = false;
    };
  }, [
    currentScene,
    currentStep,
    englishAccent,
    feedbackAudioPreparationKey,
    isLocalizationReady,
    isPreloading,
    lessonId,
    requiredAssetFailure,
    stepAudioPreparationKey,
    teacherPromptMode,
  ]);

  const handleRequiredAssetRetry = () => {
    advanceRequestIdRef.current += 1;
    clearTimer(advanceTimerRef);
    clearTimer(clearFeedbackTimerRef);
    cancelStepAudioSequence();
    setFeedback(null);
    setFeedbackAudioStatus(null);
    setPreparedStepAudioKey(null);
    setPreparedFeedbackAudioKey(null);
    setCompletedListenInstructionKey(null);
    setRequiredAssetFailure(null);
    setIsPreloading(true);
    setLoadProgress(0);
    setAssetRetryNonce(value => value + 1);
  };

  if (!currentScene) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>{t('scene.empty.noScene')}</Text>
      </View>
    );
  }

  if (!currentStep) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>{t('scene.empty.noStep')}</Text>
      </View>
    );
  }

  if (requiredAssetFailure) {
    return (
      <View style={[styles.root, styles.emptyState]}>
        <MascotImage pose="tryAgain" size="lg" />
        <Text style={styles.resourceErrorTitle}>
          {t('scene.resourcesUnavailableTitle')}
        </Text>
        <Text style={styles.resourceErrorBody}>
          {t('scene.resourcesUnavailableBody')}
        </Text>
        <View style={styles.resourceErrorActions}>
          <AppButton
            onPress={handleRequiredAssetRetry}
            title={t('scene.resourcesRetry')}
          />
          {onExit ? (
            <AppButton
              onPress={onExit}
              title={t('scene.resourcesExit')}
              variant="secondary"
            />
          ) : null}
        </View>
      </View>
    );
  }

  if (isPreloading) {
    return (
      <View style={[styles.root, styles.emptyState]}>
        <AnimatedLoadingMascot />
        <CustomProgressBar progress={loadProgress} />
        <Text style={[styles.emptyTitle, { marginTop: spacing.md }]}>
          {t('scene.loading')}
        </Text>
      </View>
    );
  }

  const currentListenInstructionKey = getListenInstructionKey(
    currentScene,
    currentStep,
  );
  const isInstructionPending =
    isListenStep(currentStep) &&
    completedListenInstructionKey !== currentListenInstructionKey;
  const isInstructionPreparing =
    isInstructionPending && preparedStepAudioKey !== stepAudioPreparationKey;
  const isInstructionPlaying = isInstructionPending && !isInstructionPreparing;
  const isFeedbackAudioReady =
    preparedFeedbackAudioKey === feedbackAudioPreparationKey;
  const isContinuePreparingFeedback =
    isListenStep(currentStep) && !isInstructionPending && !isFeedbackAudioReady;
  const allObjects = getRenderableObjects(currentScene);
  const currentStepIndex = getStepIndex(currentScene, currentStep.id) + 1;
  const totalStepCount = Math.max(1, currentScene.steps.length);
  const progressPercent = `${Math.max(
    5,
    (currentStepIndex / totalStepCount) * 100,
  )}%` as `${number}%`;
  const rootPaddingTop = Math.max(spacing.xs, insets.top + spacing.xs);
  const rootPaddingHorizontal = isTabletLandscapeLayout
    ? spacing.lg
    : spacing.md;
  const rootPaddingStyle = {
    paddingBottom: spacing.xs,
    paddingHorizontal: rootPaddingHorizontal,
    paddingTop: rootPaddingTop,
  };
  const sidePanelStyle = isTabletLandscapeLayout
    ? { width: responsiveLayout.sidePanelWidth }
    : null;
  const isAdvancing = feedback?.type === 'success';
  const isSceneComplete = sceneCompletion !== null;
  const speakPracticeWord = getSpeakPracticeWord(currentScene, currentStep);
  const backgroundSource = resolveAsset(currentScene.background.source);
  const shouldUseBackgroundFallback =
    !backgroundSource ||
    failedBackgroundIds[currentScene.background.id] === true;

  const handleReplayInstruction = () => {
    if (isAdvancing || isSceneComplete || isInstructionPreparing) {
      return;
    }

    const now = Date.now();
    if (now - lastInteractionAtRef.current < interactionCooldownMs) {
      return;
    }
    lastInteractionAtRef.current = now;

    runAudio(playTapSound());
    playAudioForStep(
      currentScene,
      currentStep,
      teacherPromptMode,
      {
        onAudioFailure: () => setRequiredAssetFailure('step'),
        ...(isListenStep(currentStep) && isInstructionPlaying
          ? {
            onAudioComplete: () =>
              setCompletedListenInstructionKey(currentListenInstructionKey),
            }
          : {}),
      },
    );

    const targetIds =
      currentStep.targetObjectIds.length > 0
        ? currentStep.targetObjectIds
        : currentScene.character
        ? [currentScene.character.id]
        : [];

    setSuccessObjectEffects(createUniformObjectEffectMap(targetIds, 'bounce'));
    showTemporaryFeedback({
      text: resolveTeacherInstruction(
        currentStep,
        teacherPromptMode,
        currentScene,
      ).displayText,
      type: 'info',
    });
  };

  const handleReplayModelWord = () => {
    if (!speakPracticeWord || isAdvancing || isSceneComplete) {
      return;
    }

    const now = Date.now();
    if (now - lastInteractionAtRef.current < interactionCooldownMs) {
      return;
    }
    lastInteractionAtRef.current = now;

    cancelStepAudioSequence();
    clearTimer(clearFeedbackTimerRef);
    runAudio(
      playObjectVocabularyAudio(speakPracticeWord, startNarrationSession()),
    );
  };

  const handleContinue = () => {
    if (
      isAdvancing ||
      isInstructionPending ||
      isContinuePreparingFeedback ||
      isSpeechPracticeBusy ||
      isSceneComplete
    ) {
      return;
    }

    const now = Date.now();
    if (now - lastInteractionAtRef.current < interactionCooldownMs) {
      return;
    }
    lastInteractionAtRef.current = now;

    runAudio(playTapSound());
    const result = resolveContinueInteraction(currentScene, currentStep);
    handleInteractionResult(currentScene, result);
  };

  const handleObjectPress = (objectId: EntityId) => {
    if (isAdvancing || isInstructionPending || isSceneComplete) {
      return;
    }

    const now = Date.now();
    if (now - lastInteractionAtRef.current < interactionCooldownMs) {
      return;
    }
    lastInteractionAtRef.current = now;

    const object = allObjects.find(item => item.id === objectId);
    if (object && canTapObjectToHear(currentScene, currentStep, object)) {
      handleObjectAudioPress(object);
      return;
    }

    runAudio(playTapSound());
    const result = resolveObjectInteraction(
      currentScene,
      currentStep,
      objectId,
    );
    handleInteractionResult(currentScene, result);
  };

  const handleObjectAudioPress = (object: SceneObject) => {
    if (isInstructionPending || isSpeechPracticeBusy) {
      return;
    }

    const vocabularyItem = getObjectVocabulary(currentScene, object);
    if (!vocabularyItem) {
      return;
    }

    const now = Date.now();
    const lastPlayedAt = objectAudioLastPlayedAtRef.current[object.id] ?? 0;
    if (now - lastPlayedAt < objectAudioCooldownMs) {
      return;
    }

    objectAudioLastPlayedAtRef.current[object.id] = now;
    cancelStepAudioSequence();
    clearTimer(clearFeedbackTimerRef);
    setShakeObjectIds([]);
    setHintObjectIds([]);
    setSuccessObjectEffects(
      createUniformObjectEffectMap([object.id], 'bounce'),
    );
    showTemporaryFeedback({
      text: vocabularyItem.word,
      type: 'info',
    });
    runAudio(
      playObjectVocabularyAudio(vocabularyItem.word, startNarrationSession()),
    );
  };

  const handleObjectDrop = (
    objectId: EntityId,
    translation: DragTranslation,
  ) => {
    if (
      isAdvancing ||
      isSceneComplete ||
      currentStep.interaction.type !== 'drag'
    ) {
      return false;
    }

    const now = Date.now();
    if (now - lastInteractionAtRef.current < interactionCooldownMs) {
      return false;
    }
    lastInteractionAtRef.current = now;

    runAudio(playTapSound());
    const object = allObjects.find(item => item.id === objectId);
    const dropZone = currentScene.dropZones?.find(
      item => item.id === currentStep.interaction.dropZoneId,
    );

    if (!object || !dropZone) {
      const result = resolveDragInteraction(
        currentScene,
        currentStep,
        objectId,
        false,
      );
      handleInteractionResult(currentScene, result);
      return false;
    }

    const currentPosition = snappedObjectPositions[objectId] ?? object.position;
    const baseRect = object.touchArea ?? currentPosition;
    const draggedRect = getDraggedRect(baseRect, translation, stageSize);
    const targetDropZoneRect = dropZone.touchArea ?? dropZone.position;
    const isInsideDropZone = isDropAccepted(draggedRect, targetDropZoneRect);
    const result = resolveDragInteraction(
      currentScene,
      currentStep,
      objectId,
      isInsideDropZone,
    );

    if (result.status === 'correct') {
      setSnappedObjectPositions(currentPositions => ({
        ...currentPositions,
        [objectId]: getSnapRect(currentPosition, dropZone.position),
      }));
    }

    handleInteractionResult(currentScene, result);
    return result.status === 'correct';
  };

  const handleStageLayout = (event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;
    setStageSize({ height, width });
  };

  const handleBackgroundError = () => {
    setFailedBackgroundIds(currentIds => ({
      ...currentIds,
      [currentScene.background.id]: true,
    }));
  };

  const handleInteractionResult = (
    activeScene: Scene,
    result: StepInteractionResult,
  ) => {
    if (result.status === 'ignored') {
      return;
    }

    cancelStepAudioSequence();
    clearTimer(clearFeedbackTimerRef);

    if (result.status === 'incorrect') {
      const feedbackPrompt = resolveTeacherFeedback({
        enText: result.feedbackEn,
        mode: teacherPromptMode,
        scene: activeScene,
        step: currentStep,
        type: 'fail',
        viText: result.feedbackVi,
      });
      const nextAttemptCount = currentStep
        ? (wrongAttemptsByStepId[currentStep.id] ?? 0) + 1
        : 1;
      const hintIds =
        currentStep && nextAttemptCount >= 2 ? currentStep.targetObjectIds : [];

      if (currentStep) {
        setWrongAttemptsByStepId(currentAttempts => ({
          ...currentAttempts,
          [currentStep.id]: (currentAttempts[currentStep.id] ?? 0) + 1,
        }));
      }

      setSuccessObjectEffects({});
      setHintObjectIds(hintIds);
      setShakeObjectIds(dedupeIds([...result.effectObjectIds, ...hintIds]));
      setFeedback({
        text: feedbackPrompt.displayText,
        type: 'fail',
      });
      const narrationSession = startNarrationSession();
      runAudio(
        playInteractionFeedbackAudio(
          'fail',
          feedbackPrompt,
          narrationSession,
        ).then(playbackResult => {
          if (
            playbackResult === 'failed' &&
            narrationSession.isActive()
          ) {
            setRequiredAssetFailure('feedback');
          }
        }),
      );
      clearFeedbackTimerRef.current = setTimeout(() => {
        setShakeObjectIds([]);
        setHintObjectIds([]);
      }, 700);
      return;
    }

    const feedbackPrompt = resolveTeacherFeedback({
      enText: result.feedbackEn,
      mode: teacherPromptMode,
      scene: activeScene,
      step: currentStep,
      type: 'success',
      viText: result.feedbackVi,
    });
    setShakeObjectIds([]);
    setHintObjectIds([]);
    setWrongAttemptsByStepId({});
    setSuccessObjectEffects(createObjectEffectMap(result.objectEffects));
    setFeedback({
      text: feedbackPrompt.displayText,
      type: 'success',
    });
    scheduleNextStepAfterFeedback(activeScene, result, feedbackPrompt);
  };

  const scheduleNextStepAfterFeedback = (
    activeScene: Scene,
    result: StepInteractionResult,
    feedbackPrompt: ReturnType<typeof resolveTeacherFeedback>,
  ) => {
    const requestId = advanceRequestIdRef.current + 1;
    advanceRequestIdRef.current = requestId;

    const advanceIfCurrent = () => {
      if (advanceRequestIdRef.current !== requestId) {
        return;
      }

      advanceRequestIdRef.current += 1;
      clearTimer(advanceTimerRef);
      setFeedbackAudioStatus(null);
      goToNextStep(activeScene, result);
    };

    clearTimer(advanceTimerRef);
    setFeedbackAudioStatus('preparing');

    const prepareAndPlayFeedback = async () => {
      const feedbackAssets = getPromptAudioAssets(
        feedbackPrompt.segments,
        englishAccent,
      );
      const isFeedbackReady =
        feedbackAssets.length === 0 ||
        (await prepareRemoteAssets(feedbackAssets));
      if (advanceRequestIdRef.current !== requestId) {
        return;
      }
      if (!isFeedbackReady) {
        setFeedbackAudioStatus(null);
        setRequiredAssetFailure('feedback');
        return;
      }

      setFeedbackAudioStatus('playing');
      const narrationSession = startNarrationSession();
      advanceTimerRef.current = setTimeout(() => {
        if (
          advanceRequestIdRef.current !== requestId ||
          !narrationSession.isActive()
        ) {
          return;
        }

        cancelStepAudioSequence();
        setFeedbackAudioStatus(null);
        setRequiredAssetFailure('feedback');
      }, feedbackPlaybackTimeoutMs);

      const playbackResult = await playInteractionFeedbackAudio(
        'success',
        feedbackPrompt,
        narrationSession,
        result.soundEffect,
      );
      if (
        advanceRequestIdRef.current !== requestId ||
        !narrationSession.isActive()
      ) {
        return;
      }
      clearTimer(advanceTimerRef);
      if (playbackResult !== 'completed') {
        if (playbackResult === 'failed') {
          setFeedbackAudioStatus(null);
          setRequiredAssetFailure('feedback');
        }
        return;
      }
      await delay(260);
      if (
        advanceRequestIdRef.current !== requestId ||
        !narrationSession.isActive()
      ) {
        return;
      }
      advanceIfCurrent();
    };

    prepareAndPlayFeedback().catch(() => {
      if (advanceRequestIdRef.current === requestId) {
        setFeedbackAudioStatus(null);
        setRequiredAssetFailure('feedback');
      }
    });
  };

  const showTemporaryFeedback = (nextFeedback: FeedbackState) => {
    clearTimer(clearFeedbackTimerRef);
    setFeedback(nextFeedback);
    clearFeedbackTimerRef.current = setTimeout(() => {
      setFeedback(current => (current?.type === 'info' ? null : current));
      setSuccessObjectEffects({});
      setShakeObjectIds([]);
      setHintObjectIds([]);
    }, 1300);
  };

  const goToNextStep = (activeScene: Scene, result: StepInteractionResult) => {
    setFeedback(null);
    setSuccessObjectEffects({});
    setShakeObjectIds([]);
    setHintObjectIds([]);

    if (lessonId && currentStep) {
      const vocabItem =
        currentStep.type === 'teach' || currentStep.type === 'practice'
          ? getStepVocabulary(activeScene, currentStep)
          : undefined;

      if (vocabItem) {
        saveLearnedWord(vocabItem.id);
      }
    }

    if (result.nextStep) {
      setStepId(result.nextStep.id);
      return;
    }

    if (!result.isSceneComplete) {
      return;
    }

    const saveSceneProgressPromise = lessonId
      ? saveSceneProgress(lessonId, activeScene.id)
      : undefined;

    const activeSceneIndex = scenes.findIndex(
      item => item.id === activeScene.id,
    );
    const nextScene = scenes[activeSceneIndex + 1];

    if (completeCurrentSceneOnly) {
      showSceneCompletionAfterSave(
        activeScene,
        activeSceneIndex,
        nextScene ? activeSceneIndex + 1 : undefined,
        !nextScene,
        saveSceneProgressPromise,
      );
      return;
    }

    if (nextScene) {
      showSceneCompletionAfterSave(
        activeScene,
        activeSceneIndex,
        activeSceneIndex + 1,
        false,
        saveSceneProgressPromise,
      );
      return;
    }

    showSceneCompletionAfterSave(
      activeScene,
      activeSceneIndex,
      undefined,
      true,
      saveSceneProgressPromise,
    );
  };

  const showSceneCompletionAfterSave = (
    completedScene: Scene,
    completedSceneIndex: number,
    nextSceneIndex: number | undefined,
    isFinalScene: boolean,
    saveSceneProgressPromise?: Promise<unknown>,
  ) => {
    const showCompletion = (result?: any) => {
      const xpGained =
        result &&
        typeof result === 'object' &&
        typeof result.xpGained === 'number'
          ? result.xpGained
          : 0;
      if (isFinalScene && !completeCurrentSceneOnly) {
        onComplete?.();
        return;
      }
      setSceneCompletion({
        isFinalScene,
        nextSceneIndex,
        scene: completedScene,
        sceneIndex: completedSceneIndex,
        xpGained,
      });
      runAudio(
        playSceneCompletionAudio(
          completedScene,
          teacherPromptMode,
          startNarrationSession(),
        ),
      );
    };

    if (saveSceneProgressPromise) {
      saveSceneProgressPromise.then(showCompletion).catch(showCompletion);
      return;
    }

    showCompletion();
  };

  const restartSceneAtIndex = (targetSceneIndex: number) => {
    const targetScene = scenes[targetSceneIndex];

    if (!targetScene) {
      return;
    }

    cancelStepAudioSequence();
    runAudio(playTapSound());
    advanceRequestIdRef.current += 1;
    clearTimer(advanceTimerRef);
    clearTimer(clearFeedbackTimerRef);
    setSceneIndex(targetSceneIndex);
    setStepId(getInitialStep(targetScene)?.id);
    setFeedback(null);
    setSuccessObjectEffects({});
    setShakeObjectIds([]);
    setHintObjectIds([]);
    setWrongAttemptsByStepId({});
    setSnappedObjectPositions({});
    setAutoRecordRequest(null);
    setIsSpeechPracticeBusy(false);
    setSceneCompletion(null);
  };

  const handleCompletionPrimaryAction = () => {
    if (!sceneCompletion) {
      return;
    }

    if (sceneCompletion.nextSceneIndex !== undefined) {
      restartSceneAtIndex(sceneCompletion.nextSceneIndex);
      return;
    }

    if (completeCurrentSceneOnly) {
      runAudio(playTapSound());
      onExit?.();
      return;
    }

    runAudio(playTapSound());
    onComplete?.();
  };

  const handleCompletionSecondaryAction = () => {
    if (!sceneCompletion) {
      return;
    }

    if (sceneCompletion.isFinalScene && !completeCurrentSceneOnly) {
      restartSceneAtIndex(sceneCompletion.sceneIndex);
      return;
    }

    runAudio(playTapSound());
    if (onExit) {
      onExit();
      return;
    }

    onComplete?.();
  };

  return (
    <View
      style={[
        styles.root,
        isTabletLandscapeLayout && styles.rootTabletLandscape,
        rootPaddingStyle,
      ]}
    >
      <View style={styles.topHud}>
        {onExit ? (
          <TouchableOpacity
            accessibilityLabel={t('scene.exitAccessibility')}
            accessibilityRole="button"
            activeOpacity={0.82}
            onPress={onExit}
            style={styles.exitButton}
          >
            <View style={styles.exitIcon}>
              <View style={styles.exitStroke} />
              <View style={[styles.exitStroke, styles.exitStrokeReverse]} />
            </View>
          </TouchableOpacity>
        ) : null}
        <View style={styles.lessonHud}>
          <Text numberOfLines={1} style={styles.lessonTag}>
            {getLocalizedSceneTitle(currentScene, appLanguage)}
          </Text>
          <View style={styles.hudProgressTrack}>
            <View
              style={[styles.hudProgressFill, { width: progressPercent }]}
            />
          </View>
        </View>
      </View>

      <View
        style={[
          styles.contentArea,
          isTabletLandscapeLayout && styles.contentAreaTabletLandscape,
        ]}
      >
        <View
          style={[
            styles.stage,
            isTabletLandscapeLayout && styles.stageTabletLandscape,
          ]}
        >
          {shouldUseBackgroundFallback ? (
            <View onLayout={handleStageLayout} style={styles.background}>
              {renderSceneLayer(currentScene)}
              {renderSceneObjects()}
            </View>
          ) : backgroundSource ? (
            <ImageBackground
              imageStyle={styles.backgroundImage}
              onError={handleBackgroundError}
              onLayout={handleStageLayout}
              resizeMode="cover"
              source={backgroundSource}
              style={styles.background}
            >
              <View style={styles.backgroundTint} />
              {renderSceneObjects()}
            </ImageBackground>
          ) : null}

          {isEditMode && (
            <AdminSceneEditor
              scene={currentScene}
              stageSize={stageSize}
              onClose={() => setIsEditMode(false)}
            />
          )}
        </View>

        <View
          style={[
            styles.bottomArea,
            isTabletLandscapeLayout && styles.bottomAreaTabletLandscape,
            sidePanelStyle,
          ]}
        >
          <AppCard
            style={[
              styles.instructionCard,
              isTabletLandscapeLayout && styles.instructionCardTabletLandscape,
            ]}
          >
            {isAdvancing && feedback ? (
              <View accessible style={styles.feedbackPanel}>
                <View style={styles.feedbackStatusRow}>
                  {feedbackAudioStatus === 'preparing' ? (
                    <SKidsIcon name="listen" size={28} />
                  ) : (
                    <AnimatedAudioWave />
                  )}
                  <Text style={styles.feedbackStatusText}>
                    {feedbackAudioStatus === 'preparing'
                      ? t('scene.preparingFeedback')
                      : t('scene.feedbackSpeaking')}
                  </Text>
                </View>
                <Text style={styles.feedbackText}>{feedback.text}</Text>
              </View>
            ) : (
              <>
                {speakPracticeWord ? (
                  <SpeakPracticeControls
                    autoStartRequestId={
                      autoRecordRequest?.stepId === currentStep.id
                        ? autoRecordRequest.requestId
                        : 0
                    }
                    disabled={isInstructionPending || isSceneComplete}
                    isInstructionPreparing={isInstructionPreparing}
                    isInstructionPlaying={isInstructionPlaying}
                    onAudioStart={cancelStepAudioSequence}
                    onBusyChange={setIsSpeechPracticeBusy}
                    onContinue={
                      isListenStep(currentStep) &&
                      !isInstructionPending &&
                      !isContinuePreparingFeedback
                        ? handleContinue
                        : undefined
                    }
                    onReplayModel={handleReplayModelWord}
                    teacherPromptMode={teacherPromptMode}
                    word={speakPracticeWord}
                  />
                ) : getStepVocabulary(currentScene, currentStep) ? (
                  <Text
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    style={styles.targetWord}
                  >
                    {getStepVocabulary(currentScene, currentStep)?.word}
                  </Text>
                ) : null}

                {!speakPracticeWord ? (
                  <View style={styles.actionRow}>
                    <KidIconButton
                      accessibilityLabel={t(
                        'scene.replayInstructionAccessibility',
                      )}
                      icon="listen"
                      label={t('scene.replayInstruction')}
                      onPress={handleReplayInstruction}
                      style={[
                        styles.actionButton,
                        styles.secondaryActionButton,
                      ]}
                      tone="quiet"
                    />
                    {isListenStep(currentStep) ? (
                      isInstructionPreparing ? (
                        <View
                          accessible
                          accessibilityLabel={t('scene.preparingAudio')}
                          style={[styles.actionButton, styles.listeningStatus]}
                        >
                          <SKidsIcon name="listen" size={24} />
                          <Text style={styles.listeningStatusText}>
                            {t('scene.preparingAudio')}
                          </Text>
                        </View>
                      ) : isInstructionPlaying ? (
                        <View
                          accessible
                          accessibilityLabel={t('scene.listeningAccessibility')}
                          style={[styles.actionButton, styles.listeningStatus]}
                        >
                          <AnimatedAudioWave />
                          <Text style={styles.listeningStatusText}>
                            {t('scene.listeningStatus')}
                          </Text>
                        </View>
                      ) : isContinuePreparingFeedback ? (
                        <View
                          accessible
                          accessibilityLabel={t('scene.preparingFeedback')}
                          style={[styles.actionButton, styles.listeningStatus]}
                        >
                          <SKidsIcon name="listen" size={24} />
                          <Text style={styles.listeningStatusText}>
                            {t('scene.preparingFeedback')}
                          </Text>
                        </View>
                      ) : (
                        <KidIconButton
                          accessibilityLabel={t('scene.continueAccessibility')}
                          icon="next"
                          label={t('scene.continue')}
                          onPress={handleContinue}
                          style={[
                            styles.actionButton,
                            styles.primaryActionButton,
                          ]}
                        />
                      )
                    ) : null}
                  </View>
                ) : null}
              </>
            )}
          </AppCard>
        </View>
      </View>

      {sceneCompletion ? renderSceneCompletionOverlay(sceneCompletion) : null}

      {/* Floating Edit Button — DEV only */}
      {__DEV__ && showSceneEditorControl && (
        <Animated.View
          style={[
            styles.floatEditBtn,
            isEditMode && styles.floatEditBtnActive,
            { transform: floatEditAnim.getTranslateTransform() },
          ]}
        >
          {/* Separate drag surface */}
          <View style={styles.floatDragHandle} {...floatEditPan.panHandlers}>
            <Text style={styles.floatDragIcon}>⠿</Text>
          </View>
          {/* Separate tap surface */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsEditMode(prev => !prev)}
            style={styles.floatEditInner}
          >
            <Text style={styles.floatEditText}>
              {isEditMode ? 'Close' : 'Edit 🛠️'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );

  function renderSceneCompletionOverlay(completion: SceneCompletionState) {
    const reward = completion.scene.completionReward;
    const starCount = reward?.stars ?? 3;
    const hasNextScene = completion.nextSceneIndex !== undefined;
    const nextScene =
      completion.nextSceneIndex !== undefined
        ? scenes[completion.nextSceneIndex]
        : undefined;
    const primaryTitle = hasNextScene
      ? t('scene.completion.primaryNext')
      : completeCurrentSceneOnly
      ? t('scene.completion.backToLesson')
      : t('scene.completion.primaryReward');
    const primaryIcon: import('../assets/icons/skids').SKidsIconName = hasNextScene
      ? 'next'
      : completeCurrentSceneOnly
      ? 'map'
      : 'sticker';
    const secondaryTitle =
      completion.isFinalScene && !completeCurrentSceneOnly
        ? t('scene.completion.replayScene')
        : t('scene.completion.backToLesson');
    const secondaryIcon: import('../assets/icons/skids').SKidsIconName =
      completion.isFinalScene && !completeCurrentSceneOnly ? 'replay' : 'map';
    const completionCoachMessage = hasNextScene
      ? t('scene.completion.coach.next')
      : completeCurrentSceneOnly
      ? t('scene.completion.coach.single')
      : t('scene.completion.coach.final');
    const completionSceneTitle = getLocalizedSceneTitle(
      completion.scene,
      appLanguage,
    );
    const completionMessage =
      appLanguage === 'vi' && reward?.messageVi
        ? reward.messageVi
        : t('scene.completion.defaultMessage', {
            sceneTitle: completionSceneTitle,
          });

    return (
      <View style={styles.completionOverlay}>
        <AppCard style={styles.completionCard}>
          <Text style={styles.completionEyebrow}>
            {t('scene.completion.eyebrow', {
              current: completion.sceneIndex + 1,
              total: scenes.length,
            })}
          </Text>
          <MascotSpeechBubble
            mascotPosition="right"
            mascotSize="sm"
            message={completionCoachMessage}
            onMascotPress={message => {
              runAudio(playTapSound());
              const narrationSession = startNarrationSession();
              runAudio(
                appLanguage === 'en'
                  ? speakWord(message, undefined, narrationSession)
                  : speakVi(message, narrationSession),
              );
            }}
            pose="greatJob"
            style={styles.completionCoach}
            tapMessages={
              nextScene
                ? [
                    t('scene.completion.tapDone'),
                    t('scene.completion.tapNext'),
                    t('scene.completion.tapContinue'),
                  ]
                : [
                    t('scene.completion.tapDone'),
                    t('scene.completion.tapReward'),
                    t('scene.completion.tapContinue'),
                  ]
            }
            tone="success"
          />
          <Text style={styles.completionTitle}>
            {t('scene.completion.title')}
          </Text>
          {completion.xpGained > 0 && (
            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>+{completion.xpGained}</Text>
              <SKidsIcon name="acorn" size={24} />
            </View>
          )}
          <View style={styles.starRow}>
            {Array.from({ length: starCount }).map((_, index) => (
              <Text key={index} style={styles.star}>
                ★
              </Text>
            ))}
          </View>
          <Text style={styles.completionMessage}>{completionMessage}</Text>
          {nextScene ? (
            <Text style={styles.nextSceneText}>
              {t('scene.completion.nextScene', {
                sceneTitle: getLocalizedSceneTitle(nextScene, appLanguage),
              })}
            </Text>
          ) : null}
          <View style={styles.completionActions}>
            <AppButton
              iconName={primaryIcon}
              iconSize={26}
              title={primaryTitle}
              onPress={handleCompletionPrimaryAction}
            />
            {!(completeCurrentSceneOnly && !hasNextScene) && (
              <AppButton
                iconName={secondaryIcon}
                iconSize={22}
                title={secondaryTitle}
                variant="secondary"
                onPress={handleCompletionSecondaryAction}
              />
            )}
          </View>
        </AppCard>
      </View>
    );
  }

  function renderSceneObjects() {
    if (!currentStep) {
      return null;
    }

    return (
      <>
        {renderActiveDropZone(currentScene, currentStep)}
        {allObjects.map(object => {
          const renderObject = {
            ...object,
            position: snappedObjectPositions[object.id] ?? object.position,
          };
          const canTapToHear = canTapObjectToHear(
            currentScene,
            currentStep,
            object,
          );

          return (
            <SceneObjectRenderer
              key={object.id}
              effect={getObjectEffect(
                object.id,
                successObjectEffects,
                shakeObjectIds,
              )}
              isDimmed={false}
              isDisabled={
                isAdvancing ||
                isInstructionPending ||
                isSpeechPracticeBusy ||
                (!canPressObjects(currentStep) && !canTapToHear)
              }
              isDraggable={
                currentStep.interaction.type === 'drag' &&
                currentStep.interaction.targetObjectId === object.id &&
                object.isInteractive &&
                !isAdvancing
              }
              isTargeted={
                isStepTargetObject(currentStep, object.id) ||
                hintObjectIds.includes(object.id)
              }
              label={getObjectLabel(
                currentScene,
                object,
                t('scene.characterLabel'),
              )}
              object={renderObject}
              onDragEnd={handleObjectDrop}
              onPress={handleObjectPress}
              stageSize={stageSize}
            />
          );
        })}
      </>
    );
  }
}

function clearTimer(
  timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
) {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }
}

function getRenderableObjects(scene: Scene) {
  return scene.character ? [scene.character, ...scene.objects] : scene.objects;
}

function getSceneImageSources(scene: Scene) {
  const sources = [
    scene.background.source,
    ...getRenderableObjects(scene).map(object => object.asset.source),
  ];

  for (const step of scene.steps) {
    for (const effect of step.effects ?? []) {
      if (effect.asset?.source) {
        sources.push(effect.asset.source);
      }
    }
  }

  return Array.from(new Set(sources));
}

function getSceneRequiredAudioAssets(
  scene: Scene,
  teacherPromptMode: TeacherPromptMode,
  englishAccent: EnglishAccent,
) {
  const assets: RemoteAssetCacheEntry[] = [];

  for (const step of scene.steps) {
    assets.push(
      ...getStepAudioAssets(scene, step, teacherPromptMode, englishAccent),
      ...getStepFeedbackAudioAssets(
        scene,
        step,
        teacherPromptMode,
        englishAccent,
      ),
    );
  }

  for (const vocabularyItem of scene.vocabulary ?? []) {
    const wordAsset = getWordAudioAsset(vocabularyItem.word, englishAccent);
    if (wordAsset) {
      assets.push(...getRemoteAudioCacheEntries([wordAsset]));
    }
  }

  assets.push(
    ...getPromptAudioAssets(
      resolveRecordingEncouragementPrompt(teacherPromptMode).segments,
      englishAccent,
    ),
    ...getPromptAudioAssets(
      resolveSceneCompletionPrompt(scene, teacherPromptMode).segments,
      englishAccent,
    ),
  );

  return dedupeRemoteAssetCacheEntries(assets);
}

function getStepAudioAssets(
  scene: Scene,
  step: SceneStep,
  teacherPromptMode: TeacherPromptMode,
  englishAccent: EnglishAccent,
) {
  const assets: RemoteAudioAsset[] = [];
  const vocabularyItem = getStepVocabulary(scene, step);

  addPromptAudioAssets(
    assets,
    resolveTeacherInstruction(step, teacherPromptMode, scene).segments,
    englishAccent,
  );

  if (step.type === 'teach' && vocabularyItem) {
    if (
      shouldPlayVocabularyAfterInstruction(
        step,
        teacherPromptMode,
        vocabularyItem.word,
        scene,
      )
    ) {
      const wordAsset = getWordAudioAsset(vocabularyItem.word, englishAccent);
      if (wordAsset) assets.push(wordAsset);
    }

    addPromptAudioAssets(
      assets,
      resolveSpeechPracticePrompt(teacherPromptMode).segments,
      englishAccent,
    );

    const modelWordAsset = getWordAudioAsset(
      vocabularyItem.word,
      englishAccent,
    );
    if (modelWordAsset) assets.push(modelWordAsset);
  } else if (
    step.vocabId &&
    vocabularyItem &&
    shouldPlayVocabularyAfterInstruction(
      step,
      teacherPromptMode,
      vocabularyItem.word,
      scene,
    )
  ) {
    const wordAsset = getWordAudioAsset(vocabularyItem.word, englishAccent);
    if (wordAsset) assets.push(wordAsset);
  }

  return getRemoteAudioCacheEntries(assets);
}

function getStepAudioPreparationKey(
  scene: Scene,
  step: SceneStep,
  teacherPromptMode: TeacherPromptMode,
  englishAccent: EnglishAccent,
) {
  return `${scene.id}:${step.id}:${teacherPromptMode}:${englishAccent}`;
}

function getFeedbackAudioPreparationKey(
  scene: Scene,
  step: SceneStep,
  teacherPromptMode: TeacherPromptMode,
  englishAccent: EnglishAccent,
) {
  return `${getStepAudioPreparationKey(
    scene,
    step,
    teacherPromptMode,
    englishAccent,
  )}:feedback`;
}

function getStepFeedbackAudioAssets(
  scene: Scene,
  step: SceneStep,
  teacherPromptMode: TeacherPromptMode,
  englishAccent: EnglishAccent,
) {
  const assets: RemoteAudioAsset[] = [];

  for (const type of ['success', 'fail'] as const) {
    const feedbackPrompt = resolveTeacherFeedback({
      enText: type === 'success' ? step.successFeedbackEn : step.failFeedbackEn,
      mode: teacherPromptMode,
      scene,
      step,
      type,
      viText: type === 'success' ? step.successFeedbackVi : step.failFeedbackVi,
    });
    addPromptAudioAssets(assets, feedbackPrompt.segments, englishAccent);
  }

  return getRemoteAudioCacheEntries(assets);
}

function getPromptAudioAssets(
  segments: ReturnType<typeof resolveTeacherInstruction>['segments'],
  englishAccent: EnglishAccent,
) {
  const assets: RemoteAudioAsset[] = [];
  addPromptAudioAssets(assets, segments, englishAccent);
  return getRemoteAudioCacheEntries(assets);
}

function addPromptAudioAssets(
  assets: RemoteAudioAsset[],
  segments: ReturnType<typeof resolveTeacherInstruction>['segments'],
  englishAccent: EnglishAccent,
) {
  for (const segment of segments) {
    const asset =
      segment.language === 'en'
        ? getWordAudioAsset(segment.text, englishAccent)
        : getViAudioAsset(segment.text);
    if (asset) assets.push(asset);
  }
}

function getRemoteAudioCacheEntries(assets: RemoteAudioAsset[]) {
  const urlsToKeys = new Map<string, string>();
  for (const asset of assets) {
    const remoteUrl = getRemoteAssetUrl(asset.key);
    if (remoteUrl) {
      urlsToKeys.set(remoteUrl, asset.key);
    }
  }

  return Array.from(urlsToKeys.entries()).map(([remoteUrl, cacheKey]) => ({
    remoteUrl,
    cacheKey,
  }));
}

function dedupeRemoteAssetCacheEntries(assets: RemoteAssetCacheEntry[]) {
  return Array.from(
    new Map(
      assets.map(asset => [`${asset.cacheKey}\n${asset.remoteUrl}`, asset]),
    ).values(),
  );
}

function getObjectLabel(
  scene: Scene,
  object: SceneObject,
  characterLabel: string,
) {
  if (object.role === 'character') {
    return characterLabel;
  }

  const vocabularyItem = getObjectVocabulary(scene, object);

  if (vocabularyItem) {
    return vocabularyItem.word;
  }

  return object.asset.id.replace(/[-_]/g, ' ');
}

function getObjectVocabulary(scene: Scene, object: SceneObject) {
  return scene.vocabulary?.find(item => item.id === object.vocabId);
}

function getStepVocabulary(scene: Scene, step: SceneStep) {
  if (step.vocabId) {
    return scene.vocabulary?.find(item => item.id === step.vocabId);
  }

  const targetObject = getRenderableObjects(scene).find(object =>
    step.targetObjectIds.includes(object.id),
  );

  if (!targetObject) {
    return undefined;
  }

  return getObjectVocabulary(scene, targetObject);
}

function getSpeakPracticeWord(scene: Scene, step: SceneStep) {
  if (step.type !== 'teach') {
    return undefined;
  }

  return getStepVocabulary(scene, step)?.word;
}

function canTapObjectToHear(
  scene: Scene,
  step: SceneStep,
  object: SceneObject,
) {
  return (
    step.type === 'teach' &&
    isStepTargetObject(step, object.id) &&
    Boolean(getObjectVocabulary(scene, object))
  );
}

let globalAudioSequenceId = 0;

function getListenInstructionKey(scene: Scene, step: SceneStep) {
  return `${scene.id}:${step.id}`;
}

type PlayStepAudioOptions = {
  onAudioFailure?: () => void;
  onAudioComplete?: () => void;
  onTeachAudioComplete?: () => void;
};

function playAudioForStep(
  scene: Scene,
  step: SceneStep,
  teacherPromptMode: TeacherPromptMode,
  options: PlayStepAudioOptions = {},
) {
  globalAudioSequenceId += 1;
  const currentId = globalAudioSequenceId;
  const narrationSession = startNarrationSession();
  const isActive = () =>
    globalAudioSequenceId === currentId && narrationSession.isActive();

  runAudio(
    playStepAudioSequence(
      scene,
      step,
      teacherPromptMode,
      narrationSession,
      isActive,
      options,
    ).then(playbackResult => {
      if (playbackResult === 'failed') {
        options.onAudioFailure?.();
      }
    }),
  );
}

function cancelStepAudioSequence() {
  globalAudioSequenceId += 1;
  cancelNarration().catch(() => undefined);
}

async function playObjectVocabularyAudio(
  word: string,
  narrationSession: NarrationSession,
) {
  await narrationSession.ready;
  if (!narrationSession.isActive()) return;
  runAudio(playTapSound());
  await speakWord(word, undefined, narrationSession);
}

async function playStepAudioSequence(
  scene: Scene,
  step: SceneStep,
  teacherPromptMode: TeacherPromptMode,
  narrationSession: NarrationSession,
  isActive: () => boolean,
  options: PlayStepAudioOptions,
): Promise<NarrationPlaybackResult> {
  const vocabularyItem = getStepVocabulary(scene, step);

  if (step.type === 'teach' && vocabularyItem) {
    if (!isActive()) return 'cancelled';
    const instructionResult = await playTeacherPromptNarration(
      resolveTeacherInstruction(step, teacherPromptMode, scene).segments,
      undefined,
      narrationSession,
    );
    if (instructionResult !== 'completed') return instructionResult;

    if (!isActive()) return 'cancelled';
    await delay(100);

    if (!isActive()) return 'cancelled';
    if (
      shouldPlayVocabularyAfterInstruction(
        step,
        teacherPromptMode,
        vocabularyItem.word,
        scene,
      )
    ) {
      const vocabularyResult = await playWordNarration(
        vocabularyItem.word,
        undefined,
        narrationSession,
      );
      if (vocabularyResult !== 'completed') return vocabularyResult;
    }

    if (!isActive()) return 'cancelled';
    await delay(120);

    if (!isActive()) return 'cancelled';
    const practicePromptResult = await playTeacherPromptNarration(
      resolveSpeechPracticePrompt(teacherPromptMode).segments,
      undefined,
      narrationSession,
    );
    if (practicePromptResult !== 'completed') return practicePromptResult;

    if (!isActive()) return 'cancelled';
    await delay(60);

    if (!isActive()) return 'cancelled';
    const modelResult = await playWordNarration(
      vocabularyItem.word,
      undefined,
      narrationSession,
    );
    if (modelResult !== 'completed') return modelResult;

    if (!isActive()) return 'cancelled';
    options.onTeachAudioComplete?.();
    options.onAudioComplete?.();
    return 'completed';
  }

  if (!isActive()) return 'cancelled';
  const instructionResult = await playTeacherPromptNarration(
    resolveTeacherInstruction(step, teacherPromptMode, scene).segments,
    undefined,
    narrationSession,
  );
  if (instructionResult !== 'completed') return instructionResult;

  if (
    step.vocabId &&
    vocabularyItem &&
    shouldPlayVocabularyAfterInstruction(
      step,
      teacherPromptMode,
      vocabularyItem.word,
      scene,
    )
  ) {
    if (!isActive()) return 'cancelled';
    await delay(100);

    if (!isActive()) return 'cancelled';
    const vocabularyResult = await playWordNarration(
      vocabularyItem.word,
      undefined,
      narrationSession,
    );
    if (vocabularyResult !== 'completed') return vocabularyResult;
  }

  if (!isActive()) return 'cancelled';
  options.onAudioComplete?.();
  return 'completed';
}

function shouldPlayVocabularyAfterInstruction(
  step: SceneStep,
  teacherPromptMode: TeacherPromptMode,
  word: string,
  scene: Scene,
) {
  if (teacherPromptMode !== 'en') {
    return true;
  }

  return !normalizePromptText(getTeacherInstructionEn(step, scene)).includes(
    normalizePromptText(word),
  );
}

function normalizePromptText(value: string | undefined) {
  return value?.trim().toLocaleLowerCase('en-US') ?? '';
}

function runAudio(audioPromise: Promise<unknown>) {
  audioPromise.catch(() => undefined);
}

async function playInteractionFeedbackAudio(
  type: FeedbackState['type'],
  feedbackPrompt: ReturnType<typeof resolveTeacherFeedback>,
  narrationSession: NarrationSession,
  successSoundEffect?: StepInteractionResult['soundEffect'],
): Promise<NarrationPlaybackResult> {
  await narrationSession.ready;
  if (!narrationSession.isActive()) return 'cancelled';

  if (type === 'success') {
    if (successSoundEffect) {
      await playSoundEffect(successSoundEffect);
    } else {
      await playCorrectSound();
    }
  } else if (type === 'fail') {
    await playWrongSound();
  }

  if (!narrationSession.isActive()) return 'cancelled';
  await delay(120);
  if (!narrationSession.isActive()) return 'cancelled';
  return playTeacherPromptNarration(
    feedbackPrompt.segments,
    undefined,
    narrationSession,
  );
}

async function playSceneCompletionAudio(
  scene: Scene,
  teacherPromptMode: TeacherPromptMode,
  narrationSession: NarrationSession,
): Promise<NarrationPlaybackResult> {
  await narrationSession.ready;
  if (!narrationSession.isActive()) return 'cancelled';
  await playSoundEffect('complete');
  if (!narrationSession.isActive()) return 'cancelled';
  await delay(140);
  if (!narrationSession.isActive()) return 'cancelled';
  return playTeacherPromptNarration(
    resolveSceneCompletionPrompt(scene, teacherPromptMode).segments,
    undefined,
    narrationSession,
  );
}

function delay(durationMs: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, durationMs);
  });
}

function createObjectEffectMap(objectEffects: StepObjectEffect[]) {
  return objectEffects.reduce<ObjectEffectMap>((effectMap, objectEffect) => {
    effectMap[objectEffect.targetObjectId] = objectEffect.animation;
    return effectMap;
  }, {});
}

function createUniformObjectEffectMap(
  objectIds: EntityId[],
  effect: SceneObjectEffect,
) {
  return objectIds.reduce<ObjectEffectMap>((effectMap, objectId) => {
    effectMap[objectId] = effect;
    return effectMap;
  }, {});
}

function dedupeIds(objectIds: EntityId[]) {
  return Array.from(new Set(objectIds));
}

function getObjectEffect(
  objectId: EntityId,
  successObjectEffects: ObjectEffectMap,
  shakeObjectIds: EntityId[],
): SceneObjectEffect {
  if (shakeObjectIds.includes(objectId)) {
    return 'shake';
  }

  return successObjectEffects[objectId] ?? 'none';
}

function renderActiveDropZone(scene: Scene, step: SceneStep) {
  if (step.interaction.type !== 'drag' || !step.interaction.dropZoneId) {
    return null;
  }

  const dropZone = scene.dropZones?.find(
    item => item.id === step.interaction.dropZoneId,
  );

  if (!dropZone) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={[styles.dropZone, getPercentRectStyle(dropZone.position)]}
    />
  );
}

function renderSceneLayer(scene: Scene) {
  const palette = getSceneFallbackPalette(scene);

  return (
    <View
      pointerEvents="none"
      style={[styles.sceneFallback, { backgroundColor: palette.wall }]}
    >
      <View
        style={[
          styles.scenePanel,
          {
            backgroundColor: palette.panel,
            borderColor: palette.accent,
          },
        ]}
      />
      <View
        style={[
          styles.sceneAccent,
          {
            backgroundColor: palette.accent,
          },
        ]}
      />
      <View
        style={[
          styles.sceneFloor,
          {
            backgroundColor: palette.floor,
          },
        ]}
      />
    </View>
  );
}

const styles = createThemedStyles(() => ({
  actionButton: {
    flex: 1,
    minHeight: 108,
  },
  actionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  background: {
    backgroundColor: colors.backgroundCool,
    flex: 1,
  },
  backgroundImage: {
    opacity: 1,
  },
  backgroundTint: {
    backgroundColor: colors.sky,
    bottom: 0,
    left: 0,
    opacity: 0.02,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  completionActions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
    width: '100%',
  },
  bottomArea: {
    flex: 0.3,
    minHeight: 180,
    justifyContent: 'center',
  },
  bottomAreaTabletLandscape: {
    alignSelf: 'stretch',
    flex: 0,
    justifyContent: 'center',
    minHeight: 0,
  },
  completionCard: {
    alignItems: 'center',
    backgroundColor: colors.cream,
    borderColor: colors.borderWarm,
    gap: spacing.sm,
    maxWidth: 420,
    padding: spacing.lg,
    width: '100%',
  },
  completionCoach: {
    alignSelf: 'stretch',
  },
  completionEyebrow: {
    color: colors.primaryDark,
    textAlign: 'center',
    textTransform: 'uppercase',
    ...typography.caption,
  },
  completionMessage: {
    color: colors.text,
    textAlign: 'center',
    ...typography.subtitle,
  },
  completionOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    backgroundColor: 'rgba(37, 54, 66, 0.42)',
    justifyContent: 'center',
    padding: spacing.lg,
    zIndex: 20,
  },
  completionTitle: {
    color: colors.text,
    textAlign: 'center',
    ...typography.title,
  },
  contentArea: {
    flex: 1,
    gap: spacing.sm,
    minHeight: 0,
  },
  contentAreaTabletLandscape: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: spacing.md,
  },
  dropZone: {
    backgroundColor: 'rgba(255, 211, 77, 0.2)',
    borderColor: colors.secondary,
    borderRadius: radius.xl,
    borderStyle: 'solid',
    borderWidth: 5,
    opacity: 0.78,
    ...shadows.warm,
  },
  feedbackPanel: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
    borderRadius: radius.xl,
    borderWidth: 3,
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 148,
    padding: spacing.md,
  },
  feedbackStatusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  feedbackStatusText: {
    color: colors.textSoft,
    textAlign: 'center',
    ...typography.caption,
  },
  feedbackText: {
    color: colors.text,
    textAlign: 'center',
    ...typography.subtitle,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emptyTitle: {
    color: colors.text,
    textAlign: 'center',
    ...typography.subtitle,
  },
  resourceErrorActions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
    maxWidth: 360,
    width: '100%',
  },
  resourceErrorBody: {
    color: colors.textSoft,
    maxWidth: 480,
    textAlign: 'center',
    ...typography.body,
  },
  resourceErrorTitle: {
    color: colors.text,
    marginTop: spacing.sm,
    textAlign: 'center',
    ...typography.title,
  },
  exitButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 3,
    height: 50,
    justifyContent: 'center',
    width: 50,
    ...shadows.warm,
  },
  exitIcon: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  exitStroke: {
    backgroundColor: colors.accentDark,
    borderRadius: radius.pill,
    height: 5,
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
    width: 24,
  },
  exitStrokeReverse: {
    transform: [{ rotate: '-45deg' }],
  },
  hudProgressFill: {
    backgroundColor: colors.secondary,
    borderRadius: radius.pill,
    height: '100%',
  },
  hudProgressTrack: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 5,
    overflow: 'hidden',
    width: '100%',
  },
  instructionCard: {
    backgroundColor: colors.cream,
    borderColor: colors.borderWarm,
    gap: spacing.xs,
    padding: spacing.sm,
  },
  instructionCardTabletLandscape: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    padding: spacing.md,
  },
  listeningStatus: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderRadius: radius.xl,
    borderWidth: 3,
    flex: 1.35,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 76,
    padding: spacing.sm,
  },
  listeningStatusText: {
    color: colors.text,
    textAlign: 'center',
    ...typography.caption,
  },
  sceneAccent: {
    borderRadius: radius.pill,
    height: 20,
    opacity: 0.42,
    position: 'absolute',
    right: '8%',
    top: '12%',
    width: 80,
  },
  sceneFallback: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  sceneFloor: {
    bottom: 0,
    height: '34%',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  scenePanel: {
    borderRadius: radius.lg,
    borderWidth: 2,
    height: '28%',
    left: '8%',
    opacity: 0.72,
    position: 'absolute',
    top: '12%',
    width: '34%',
  },
  root: {
    flex: 1,
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    position: 'relative',
  },
  rootTabletLandscape: {
    gap: spacing.sm,
  },
  lessonHud: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 2,
    flex: 1,
    gap: spacing.xxs,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    ...shadows.soft,
  },
  lessonTag: {
    color: colors.text,
    textAlign: 'center',
    ...typography.caption,
  },
  primaryActionButton: {
    backgroundColor: colors.secondary,
    borderColor: colors.white,
    flex: 1.35,
    minHeight: 76,
    ...shadows.warm,
  },
  secondaryActionButton: {
    backgroundColor: colors.surface,
    borderColor: colors.primarySoft,
    flex: 0.95,
    minHeight: 76,
  },
  nextSceneText: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
    borderRadius: radius.pill,
    borderWidth: 1,
    color: colors.text,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    textAlign: 'center',
    ...typography.caption,
  },
  star: {
    color: colors.secondary,
    fontSize: 34,
    lineHeight: 38,
    textShadowColor: colors.shadow,
    textShadowOffset: {
      height: 2,
      width: 0,
    },
    textShadowRadius: 4,
  },
  starRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  stage: {
    borderColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 4,
    flex: 1,
    minHeight: 240,
    overflow: 'hidden',
    ...shadows.floating,
  },
  stageTabletLandscape: {
    minHeight: 0,
  },
  stepType: {
    color: colors.accentDark,
    textAlign: 'center',
    ...typography.caption,
  },
  targetWord: {
    color: colors.primaryDark,
    textAlign: 'center',
    ...typography.title,
    fontSize: 42,
    lineHeight: 52,
    marginVertical: spacing.sm,
  },
  topHud: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 50,
    zIndex: 4,
  },
  // --- Floating Edit Button (DEV) ---
  floatEditBtn: {
    position: 'absolute',
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 180, 0, 0.95)',
    borderRadius: 24,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  floatEditBtnActive: {
    backgroundColor: 'rgba(220, 60, 60, 0.95)',
  },
  floatDragHandle: {
    width: 36,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  floatDragIcon: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  floatEditInner: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
  },
  floatEditText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  xpBadge: {
    alignItems: 'center',
    backgroundColor: colors.cream,
    borderColor: colors.secondary,
    borderRadius: radius.pill,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.sm,
    ...shadows.soft,
  },
  xpText: {
    color: colors.primaryDark,
    fontSize: 24,
    fontWeight: '900',
  },
}));
