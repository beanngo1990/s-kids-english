import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ImageBackground,
  type LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { ProgressDots } from '../components/ProgressDots';
import { SpeakPracticeControls } from '../components/SpeakPracticeControls';
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
} from '../types/lesson';
import {
  playCorrectSound,
  playSoundEffect,
  playTapSound,
  playWrongSound,
  speakVi,
  speakWord,
} from './AudioManager';
import { getSceneFallbackPalette } from './AssetFallbacks';
import { resolveAsset } from './AssetRegistry';
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
  type StepObjectEffect,
} from './StepController';

type FeedbackState = {
  type: 'success' | 'fail' | 'info';
  text: string;
};

type ObjectEffectMap = Partial<Record<EntityId, SceneObjectEffect>>;

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
  const advanceRequestIdRef = useRef(0);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    setSceneIndex(initialSceneIndex);
  }, [initialSceneIndex]);

  useEffect(() => {
    advanceRequestIdRef.current += 1;
    setStepId(currentScene ? getInitialStep(currentScene)?.id : undefined);
    setFeedback(null);
    setSuccessObjectEffects({});
    setShakeObjectIds([]);
    setHintObjectIds([]);
    setWrongAttemptsByStepId({});
    setSnappedObjectPositions({});
  }, [currentScene]);

  useEffect(() => {
    return () => {
      advanceRequestIdRef.current += 1;
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

    if (lessonId) {
      saveCurrentStepProgress(lessonId, currentScene.id, currentStep.id);
    }
  }, [currentScene, currentStep, lessonId]);

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
  const speakPracticeWord = getSpeakPracticeWord(currentScene, currentStep);
  const backgroundSource = resolveAsset(currentScene.background.source);
  const shouldUseBackgroundFallback =
    !backgroundSource || failedBackgroundIds[currentScene.background.id] === true;

  const handleReplayInstruction = () => {
    if (isAdvancing) {
      return;
    }

    runAudio(playTapSound());
    playAudioForStep(currentScene, currentStep);

    const targetIds = currentStep.targetObjectIds.length > 0
      ? currentStep.targetObjectIds
      : (currentScene.character ? [currentScene.character.id] : []);
    
    setSuccessObjectEffects(createUniformObjectEffectMap(targetIds, 'bounce'));
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

    clearTimer(clearFeedbackTimerRef);

    if (result.status === 'incorrect') {
      const feedbackText = result.feedbackVi ?? 'Thử lại nhé.';
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
        text: feedbackText,
        type: 'fail',
      });
      runAudio(playInteractionFeedbackAudio('fail', feedbackText));
      clearFeedbackTimerRef.current = setTimeout(() => {
        setShakeObjectIds([]);
        setHintObjectIds([]);
      }, 700);
      return;
    }

    const feedbackText = result.feedbackVi ?? 'Giỏi lắm!';
    setShakeObjectIds([]);
    setHintObjectIds([]);
    setWrongAttemptsByStepId({});
    setSuccessObjectEffects(createObjectEffectMap(result.objectEffects));
    setFeedback({
      text: feedbackText,
      type: 'success',
    });
    scheduleNextStepAfterFeedback(activeScene, result, feedbackText);
  };

  const scheduleNextStepAfterFeedback = (
    activeScene: Scene,
    result: StepInteractionResult,
    feedbackText: string,
  ) => {
    const requestId = advanceRequestIdRef.current + 1;
    advanceRequestIdRef.current = requestId;

    const advanceIfCurrent = () => {
      if (advanceRequestIdRef.current !== requestId) {
        return;
      }

      advanceRequestIdRef.current += 1;
      clearTimer(advanceTimerRef);
      goToNextStep(activeScene, result);
    };

    clearTimer(advanceTimerRef);
    advanceTimerRef.current = setTimeout(() => {
      advanceIfCurrent();
    }, getFeedbackFallbackDelay(feedbackText));

    playInteractionFeedbackAudio('success', feedbackText, result.soundEffect)
      .then(() => delay(260))
      .then(advanceIfCurrent)
      .catch(advanceIfCurrent);
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
      const vocabItem = (currentStep.type === 'teach' || currentStep.type === 'practice')
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

    if (lessonId) {
      saveSceneProgress(activeScene.id);
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
          Cảnh {sceneIndex + 1}/{scenes.length} - {currentScene.titleVi}
        </Text>
      </View>

      <View style={styles.stage}>
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
      </View>

      <AppCard style={styles.instructionCard}>
        <Text style={styles.stepType}>{getStepTypeLabel(currentStep)}</Text>
        <Text style={styles.instruction}>{currentStep.instructionVi}</Text>
        {currentStep.promptText ? (
          <Text style={styles.prompt}>{currentStep.promptText}</Text>
        ) : null}
        {speakPracticeWord ? (
          <SpeakPracticeControls
            disabled={isAdvancing}
            word={speakPracticeWord}
          />
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
                successObjectEffects,
                shakeObjectIds,
              )}
              isDimmed={shouldDimObjectForStep(currentStep, object.id)}
              isDisabled={!canPressObjects(currentStep) || isAdvancing}
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
              label={getObjectLabel(currentScene, object)}
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

function getObjectLabel(scene: Scene, object: SceneObject) {
  if (object.role === 'character') {
    return 'bé';
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

let globalAudioSequenceId = 0;

function playAudioForStep(scene: Scene, step: SceneStep) {
  globalAudioSequenceId += 1;
  const currentId = globalAudioSequenceId;
  const isActive = () => globalAudioSequenceId === currentId;
  
  runAudio(playStepAudioSequence(scene, step, isActive));
}

async function playStepAudioSequence(
  scene: Scene,
  step: SceneStep,
  isActive: () => boolean,
) {
  const vocabularyItem = getStepVocabulary(scene, step);

  if (step.type === 'teach' && vocabularyItem) {
    if (!isActive()) return;
    await speakVi(step.instructionVi);
    
    if (!isActive()) return;
    await delay(180);
    
    if (!isActive()) return;
    await speakWord(vocabularyItem.word);
    return;
  }

  if (!isActive()) return;
  await speakVi(step.instructionVi);
}

function runAudio(audioPromise: Promise<void>) {
  audioPromise.catch(() => undefined);
}

async function playInteractionFeedbackAudio(
  type: FeedbackState['type'],
  feedbackText: string,
  successSoundEffect?: StepInteractionResult['soundEffect'],
) {
  if (type === 'success') {
    if (successSoundEffect) {
      await playSoundEffect(successSoundEffect);
    } else {
      await playCorrectSound();
    }
  } else if (type === 'fail') {
    await playWrongSound();
  }

  await delay(120);
  await speakVi(feedbackText);
}

function getFeedbackFallbackDelay(feedbackText: string) {
  return Math.min(5200, Math.max(2800, 1500 + feedbackText.length * 70));
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
    opacity: 0.82,
  },
  backgroundTint: {
    backgroundColor: colors.sky,
    bottom: 0,
    left: 0,
    opacity: 0.06,
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
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
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
    minHeight: 220,
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
    color: colors.accentDark,
    textAlign: 'center',
    ...typography.caption,
  },
  successFeedback: {
    color: colors.primaryDark,
  },
});
