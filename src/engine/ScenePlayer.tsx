import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ImageBackground,
  type LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';

import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { ProgressDots } from '../components/ProgressDots';
import { lessons } from '../data/lessons';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type {
  EntityId,
  PercentRect,
  Scene,
  SceneObject,
  SceneStep,
  VocabularyItem,
} from '../types/lesson';
import {
  playCorrectSound,
  playTapSound,
  playWrongSound,
  speakVi,
  speakWord,
} from './AudioManager';
import {
  canRenderImageSource,
  getSceneFallbackPalette,
} from './AssetFallbacks';
import {
  type DragTranslation,
  getDraggedRect,
  getPercentRectStyle,
  getRectCenter,
  getSnapRect,
  isPointInsideRect,
} from './PositionUtils';
import {
  SceneObjectRenderer,
  type SceneObjectEffect,
} from './SceneObjectRenderer';
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
  shouldDimObjectForStep,
  type StepInteractionResult,
} from './StepController';

type FeedbackState = {
  type: 'success' | 'fail' | 'info';
  text: string;
};

type ScenePlayerProps = {
  lessonId?: string;
  scene?: Scene;
  initialSceneId?: string;
  onComplete?: () => void;
};

export function ScenePlayer({
  lessonId,
  scene,
  initialSceneId,
  onComplete,
}: ScenePlayerProps) {
  const lesson = useMemo(
    () => lessons.find(item => item.id === lessonId),
    [lessonId],
  );
  const scenes = useMemo(() => {
    if (scene) {
      return [scene];
    }

    return lesson?.scenes ?? [];
  }, [lesson?.scenes, scene]);
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
  const [successObjectIds, setSuccessObjectIds] = useState<EntityId[]>([]);
  const [shakeObjectIds, setShakeObjectIds] = useState<EntityId[]>([]);
  const [failedBackgroundIds, setFailedBackgroundIds] = useState<
    Record<EntityId, boolean>
  >({});
  const [stageSize, setStageSize] = useState({ height: 0, width: 0 });
  const [snappedObjectPositions, setSnappedObjectPositions] = useState<
    Record<EntityId, PercentRect>
  >({});
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    setSceneIndex(initialSceneIndex);
  }, [initialSceneIndex]);

  useEffect(() => {
    setStepId(currentScene ? getInitialStep(currentScene)?.id : undefined);
    setFeedback(null);
    setSuccessObjectIds([]);
    setShakeObjectIds([]);
    setSnappedObjectPositions({});
  }, [currentScene]);

  useEffect(() => {
    return () => {
      clearTimer(advanceTimerRef);
      clearTimer(clearFeedbackTimerRef);
    };
  }, []);

  const currentStep = currentScene
    ? getStepById(currentScene, stepId) ?? getInitialStep(currentScene)
    : undefined;

  useEffect(() => {
    if (!currentScene || !currentStep) {
      return;
    }

    playAudioForStep(currentScene, currentStep);
  }, [currentScene, currentStep]);

  if (!currentScene) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Chưa có scene</Text>
      </View>
    );
  }

  if (!currentStep) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Scene chưa có bước học</Text>
      </View>
    );
  }

  const allObjects = getRenderableObjects(currentScene);
  const currentStepIndex = getStepIndex(currentScene, currentStep.id) + 1;
  const isAdvancing = feedback?.type === 'success';
  const backgroundSource = {
    uri: currentScene.background.source,
  } satisfies ImageSourcePropType;
  const shouldUseBackgroundFallback =
    !canRenderImageSource(currentScene.background.source) ||
    failedBackgroundIds[currentScene.background.id] === true;

  const handleReplayInstruction = () => {
    if (isAdvancing) {
      return;
    }

    runAudio(playTapSound());
    playAudioForStep(currentScene, currentStep);
    showTemporaryFeedback({
      text: currentStep.instructionVi,
      type: 'info',
    });
  };

  const handleContinue = () => {
    if (isAdvancing) {
      return;
    }

    runAudio(playTapSound());
    const result = resolveContinueInteraction(currentScene, currentStep);
    handleInteractionResult(currentScene, result);
  };

  const handleObjectPress = (objectId: EntityId) => {
    if (isAdvancing) {
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

  const handleObjectDrop = (
    objectId: EntityId,
    translation: DragTranslation,
  ) => {
    if (isAdvancing || currentStep.interaction.type !== 'drag') {
      return false;
    }

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
    const draggedRect = getDraggedRect(currentPosition, translation, stageSize);
    const isInsideDropZone = isPointInsideRect(
      getRectCenter(draggedRect),
      dropZone.position,
    );
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

    clearTimer(clearFeedbackTimerRef);

    if (result.status === 'incorrect') {
      runAudio(playWrongSound());
      setSuccessObjectIds([]);
      setShakeObjectIds(result.effectObjectIds);
      setFeedback({
        text: result.feedbackVi ?? 'Thử lại nhé.',
        type: 'fail',
      });
      clearFeedbackTimerRef.current = setTimeout(() => {
        setShakeObjectIds([]);
      }, 700);
      return;
    }

    runAudio(playCorrectSound());
    setShakeObjectIds([]);
    setSuccessObjectIds(result.effectObjectIds);
    setFeedback({
      text: result.feedbackVi ?? 'Giỏi lắm!',
      type: 'success',
    });
    clearTimer(advanceTimerRef);
    advanceTimerRef.current = setTimeout(() => {
      goToNextStep(activeScene, result);
    }, 900);
  };

  const showTemporaryFeedback = (nextFeedback: FeedbackState) => {
    clearTimer(clearFeedbackTimerRef);
    setFeedback(nextFeedback);
    clearFeedbackTimerRef.current = setTimeout(() => {
      setFeedback(current => (current?.type === 'info' ? null : current));
    }, 1300);
  };

  const goToNextStep = (activeScene: Scene, result: StepInteractionResult) => {
    setFeedback(null);
    setSuccessObjectIds([]);
    setShakeObjectIds([]);

    if (result.nextStep) {
      setStepId(result.nextStep.id);
      return;
    }

    if (!result.isSceneComplete) {
      return;
    }

    const activeSceneIndex = scenes.findIndex(
      item => item.id === activeScene.id,
    );
    const nextScene = scenes[activeSceneIndex + 1];

    if (nextScene) {
      setSceneIndex(activeSceneIndex + 1);
      return;
    }

    onComplete?.();
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <ProgressDots
          current={currentStepIndex}
          total={currentScene.steps.length}
        />
        <Text style={styles.sceneLabel}>
          {currentScene.titleVi} {sceneIndex + 1}/{scenes.length}
        </Text>
      </View>

      <View style={styles.stage}>
        {shouldUseBackgroundFallback ? (
          <View onLayout={handleStageLayout} style={styles.background}>
            {renderSceneLayer(currentScene)}
            {renderSceneObjects()}
          </View>
        ) : (
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
        )}
      </View>

      <AppCard style={styles.instructionCard}>
        <Text style={styles.stepType}>{getStepTypeLabel(currentStep)}</Text>
        <Text style={styles.instruction}>{currentStep.instructionVi}</Text>
        {currentStep.promptText ? (
          <Text style={styles.prompt}>{currentStep.promptText}</Text>
        ) : null}
        {feedback ? (
          <Text
            style={[
              styles.feedback,
              feedback.type === 'success' && styles.successFeedback,
              feedback.type === 'fail' && styles.failFeedback,
            ]}
          >
            {feedback.text}
          </Text>
        ) : null}

        <View style={styles.actionRow}>
          <AppButton
            title="Nghe lại"
            variant="secondary"
            onPress={handleReplayInstruction}
            style={styles.actionButton}
            textStyle={styles.smallButtonText}
          />
          {isListenStep(currentStep) ? (
            <AppButton
              title="Tiếp tục"
              onPress={handleContinue}
              style={styles.actionButton}
              textStyle={styles.smallButtonText}
            />
          ) : null}
        </View>
      </AppCard>
    </View>
  );

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

          return (
            <SceneObjectRenderer
              key={object.id}
              effect={getObjectEffect(
                object.id,
                successObjectIds,
                shakeObjectIds,
              )}
              isDimmed={shouldDimObjectForStep(currentStep, object.id)}
              isDisabled={!canPressObjects(currentStep) || isAdvancing}
              isDraggable={
                currentStep.interaction.type === 'drag' &&
                object.isInteractive &&
                !isAdvancing
              }
              isTargeted={isStepTargetObject(currentStep, object.id)}
              label={getObjectLabel(currentScene, object)}
              object={renderObject}
              onDragEnd={handleObjectDrop}
              onPress={handleObjectPress}
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

function getObjectLabel(scene: Scene, object: SceneObject) {
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
  const targetObject = getRenderableObjects(scene).find(object =>
    step.targetObjectIds.includes(object.id),
  );

  if (!targetObject) {
    return undefined;
  }

  return getObjectVocabulary(scene, targetObject);
}

function playAudioForStep(scene: Scene, step: SceneStep) {
  const vocabularyItem = getStepVocabulary(scene, step);
  const speech = getStepSpeech(step, vocabularyItem);

  if (!speech) {
    return;
  }

  if (speech.language === 'en') {
    runAudio(speakWord(speech.text));
    return;
  }

  runAudio(speakVi(speech.text));
}

function getStepSpeech(step: SceneStep, vocabularyItem?: VocabularyItem) {
  if (step.type === 'teach' && vocabularyItem) {
    return {
      language: 'en' as const,
      text: vocabularyItem.word,
    };
  }

  return {
    language: 'vi' as const,
    text: step.instructionVi,
  };
}

function runAudio(audioPromise: Promise<void>) {
  audioPromise.catch(() => undefined);
}

function getObjectEffect(
  objectId: EntityId,
  successObjectIds: EntityId[],
  shakeObjectIds: EntityId[],
): SceneObjectEffect {
  if (shakeObjectIds.includes(objectId)) {
    return 'shake';
  }

  if (successObjectIds.includes(objectId)) {
    return 'sparkle';
  }

  return 'none';
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

function getStepTypeLabel(step: SceneStep) {
  switch (step.type) {
    case 'intro':
      return 'Bắt đầu';
    case 'teach':
      return 'Học từ mới';
    case 'practice':
      return 'Bé thử nhé';
    case 'review':
      return 'Ôn lại';
    default:
      return 'Học nào';
  }
}

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
    minHeight: 54,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  background: {
    backgroundColor: colors.backgroundCool,
    flex: 1,
  },
  backgroundImage: {
    opacity: 0.22,
  },
  backgroundTint: {
    backgroundColor: colors.sky,
    bottom: 0,
    left: 0,
    opacity: 0.25,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  dropZone: {
    borderColor: colors.accent,
    borderRadius: radius.lg,
    borderStyle: 'dashed',
    borderWidth: 3,
    backgroundColor: colors.accentSoft,
    opacity: 0.75,
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
  failFeedback: {
    color: colors.accent,
  },
  feedback: {
    color: colors.primaryDark,
    textAlign: 'center',
    ...typography.body,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  instruction: {
    color: colors.text,
    textAlign: 'center',
    ...typography.subtitle,
  },
  instructionCard: {
    gap: spacing.sm,
    padding: spacing.md,
  },
  prompt: {
    color: colors.textSoft,
    textAlign: 'center',
    ...typography.body,
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
    gap: spacing.md,
    padding: spacing.lg,
  },
  sceneLabel: {
    color: colors.textSoft,
    textAlign: 'center',
    ...typography.caption,
  },
  smallButtonText: {
    fontSize: 17,
    lineHeight: 22,
  },
  stage: {
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    elevation: 3,
    flex: 1,
    minHeight: 360,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: {
      height: 8,
      width: 0,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  stepType: {
    color: colors.accent,
    textAlign: 'center',
    ...typography.caption,
  },
  successFeedback: {
    color: colors.primaryDark,
  },
});
