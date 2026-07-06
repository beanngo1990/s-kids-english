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
import { MascotSpeechBubble } from '../components/mascot';
import { SpeakPracticeControls } from '../components/SpeakPracticeControls';
import { getSceneForLearningMode } from '../data/learningModes';
import { lessons } from '../data/lessons';
import { sugaCompletionTapMessages } from '../data/mascotPrompts';
import { speakPracticePromptVi } from '../data/speechPrompts';
import { colors } from '../theme/colors';
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
import { AdminSceneEditor } from './AdminSceneEditor';
import {
  SceneObjectRenderer,
  type SceneObjectEffect,
} from './SceneObjectRenderer';
import { getParentSettings } from './ParentSettingsManager';
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

type ScenePlayerProps = {
  lessonId?: string;
  scene?: Scene;
  initialSceneId?: string;
  learningMode?: LearningMode;
  completeCurrentSceneOnly?: boolean;
  onExit?: () => void;
  onComplete?: () => void;
};

export function ScenePlayer({
  lessonId,
  scene,
  initialSceneId,
  learningMode = 'core',
  completeCurrentSceneOnly = false,
  onExit,
  onComplete,
}: ScenePlayerProps) {
  const insets = useSafeAreaInsets();
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

  // Floating drag setup
  const floatEditPos = useRef({ x: 20, y: 100 });
  const floatEditAnim = useRef(new Animated.ValueXY({ x: 20, y: 100 })).current;
  const floatEditStart = useRef({ x: 20, y: 100 });
  const floatEditPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        floatEditStart.current = { x: floatEditPos.current.x, y: floatEditPos.current.y };
      },
      onPanResponderMove: (_, state) => {
        const newX = floatEditStart.current.x + state.dx;
        const newY = floatEditStart.current.y + state.dy;
        floatEditPos.current = { x: newX, y: newY };
        floatEditAnim.setValue({ x: newX, y: newY });
      },
      onPanResponderRelease: () => { },
    })
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
    if (__DEV__) {
      getParentSettings().then(settings => {
        setShowSceneEditorControl(settings.enableSceneEditor || false);
      });
    }
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
    setSceneCompletion(null);
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

    setIsSpeechPracticeBusy(false);
    playAudioForStep(currentScene, currentStep, {
      onTeachAudioComplete: () => {
        setAutoRecordRequest(previousRequest => ({
          requestId: (previousRequest?.requestId ?? 0) + 1,
          stepId: currentStep.id,
        }));
      },
    });

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
  const totalStepCount = Math.max(1, currentScene.steps.length);
  const progressPercent =
    `${Math.max(5, (currentStepIndex / totalStepCount) * 100)}%` as `${number}%`;
  const rootPaddingTop = Math.max(spacing.xs, insets.top + spacing.xs);
  const isAdvancing = feedback?.type === 'success';
  const isSceneComplete = sceneCompletion !== null;
  const speakPracticeWord = getSpeakPracticeWord(currentScene, currentStep);
  const backgroundSource = resolveAsset(currentScene.background.source);
  const shouldUseBackgroundFallback =
    !backgroundSource || failedBackgroundIds[currentScene.background.id] === true;

  const handleReplayInstruction = () => {
    if (isAdvancing || isSceneComplete) {
      return;
    }

    const now = Date.now();
    if (now - lastInteractionAtRef.current < interactionCooldownMs) {
      return;
    }
    lastInteractionAtRef.current = now;

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
    runAudio(playObjectVocabularyAudio(speakPracticeWord));
  };

  const handleContinue = () => {
    if (isAdvancing || isSceneComplete) {
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
    if (isAdvancing || isSceneComplete) {
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
    if (isSpeechPracticeBusy) {
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
    runAudio(playObjectVocabularyAudio(vocabularyItem.word));
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
      const xpGained = result && typeof result === 'object' && typeof result.xpGained === 'number' ? result.xpGained : 0;
      setSceneCompletion({
        isFinalScene,
        nextSceneIndex,
        scene: completedScene,
        sceneIndex: completedSceneIndex,
        xpGained,
      });
      runAudio(playSceneCompletionAudio(completedScene));
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
    <View style={[styles.root, { paddingTop: rootPaddingTop }]}>
      <View style={styles.topHud}>
        {onExit ? (
          <TouchableOpacity
            accessibilityLabel="Thoát bài học"
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
            {currentScene.titleVi}
          </Text>
          <View style={styles.hudProgressTrack}>
            <View style={[styles.hudProgressFill, { width: progressPercent }]} />
          </View>
        </View>
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

        {isEditMode && (
          <AdminSceneEditor
            scene={currentScene}
            stageSize={stageSize}
            onClose={() => setIsEditMode(false)}
          />
        )}
      </View>

      <View style={styles.bottomArea}>
        <AppCard style={styles.instructionCard}>
          {speakPracticeWord ? (
            <SpeakPracticeControls
              autoStartRequestId={
                autoRecordRequest?.stepId === currentStep.id
                  ? autoRecordRequest.requestId
                  : 0
              }
              disabled={isAdvancing || isSceneComplete}
              onAudioStart={cancelStepAudioSequence}
              onBusyChange={setIsSpeechPracticeBusy}
              onContinue={isListenStep(currentStep) ? handleContinue : undefined}
              onReplayModel={handleReplayModelWord}
              word={speakPracticeWord}
            />
          ) : getStepVocabulary(currentScene, currentStep) ? (
            <Text style={styles.targetWord}>
              {getStepVocabulary(currentScene, currentStep)?.word}
            </Text>
          ) : null}

          {!speakPracticeWord ? (
            <View style={styles.actionRow}>
              <KidIconButton
                accessibilityLabel="Nghe lại hướng dẫn"
                icon="listen"
                label="Nghe lại"
                onPress={handleReplayInstruction}
                style={[styles.actionButton, styles.secondaryActionButton]}
                tone="quiet"
              />
              {isListenStep(currentStep) ? (
                <KidIconButton
                  accessibilityLabel="Tiếp tục"
                  icon="next"
                  label="Tiếp tục"
                  onPress={handleContinue}
                  style={[styles.actionButton, styles.primaryActionButton]}
                />
              ) : null}
            </View>
          ) : null}
        </AppCard>
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
          {/* Vùng kéo thả riêng biệt */}
          <View style={styles.floatDragHandle} {...floatEditPan.panHandlers}>
            <Text style={styles.floatDragIcon}>⠿</Text>
          </View>
          {/* Vùng bấm riêng biệt */}
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
      ? 'Học cảnh tiếp theo'
      : completeCurrentSceneOnly
        ? 'Về gói bài học'
        : 'Nhận thưởng';
    const secondaryTitle =
      completion.isFinalScene && !completeCurrentSceneOnly
        ? 'Học lại cảnh này'
        : 'Về gói bài học';
    const completionCoachMessage = hasNextScene
      ? 'Giỏi quá! Mình cùng sang cảnh tiếp theo nhé.'
      : completeCurrentSceneOnly
        ? 'Suga đã đánh dấu trạm này xong rồi. Bé về gói bài học nhé!'
        : 'Tuyệt vời! Suga đã sẵn sàng trao sticker cho bé.';

    return (
      <View style={styles.completionOverlay}>
        <AppCard style={styles.completionCard}>
          <Text style={styles.completionEyebrow}>
            Cảnh {completion.sceneIndex + 1}/{scenes.length}
          </Text>
          <MascotSpeechBubble
            mascotPosition="right"
            mascotSize="sm"
            message={completionCoachMessage}
            onMascotPress={message => {
              runAudio(playTapSound());
              runAudio(speakVi(message));
            }}
            pose="greatJob"
            style={styles.completionCoach}
            tapMessages={
              nextScene
                ? [
                    sugaCompletionTapMessages[0],
                    sugaCompletionTapMessages[1],
                    sugaCompletionTapMessages[3],
                  ]
                : [
                    sugaCompletionTapMessages[0],
                    sugaCompletionTapMessages[2],
                    sugaCompletionTapMessages[3],
                  ]
            }
            tone="success"
          />
          <Text style={styles.completionTitle}>Giỏi quá!</Text>
          {completion.xpGained > 0 && (
            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>+{completion.xpGained} 🌰</Text>
            </View>
          )}
          <View style={styles.starRow}>
            {Array.from({ length: starCount }).map((_, index) => (
              <Text key={index} style={styles.star}>
                ★
              </Text>
            ))}
          </View>
          <Text style={styles.completionMessage}>
            {reward?.messageVi ??
              `Bé đã hoàn thành ${completion.scene.titleVi}.`}
          </Text>
          {nextScene ? (
            <Text style={styles.nextSceneText}>
              Tiếp theo: {nextScene.titleVi}
            </Text>
          ) : null}
          <View style={styles.completionActions}>
            <AppButton
              title={primaryTitle}
              onPress={handleCompletionPrimaryAction}
            />
            <AppButton
              title={secondaryTitle}
              variant="secondary"
              onPress={handleCompletionSecondaryAction}
            />
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

type PlayStepAudioOptions = {
  onTeachAudioComplete?: () => void;
};

function playAudioForStep(
  scene: Scene,
  step: SceneStep,
  options: PlayStepAudioOptions = {},
) {
  globalAudioSequenceId += 1;
  const currentId = globalAudioSequenceId;
  const isActive = () => globalAudioSequenceId === currentId;

  runAudio(playStepAudioSequence(scene, step, isActive, options));
}

function cancelStepAudioSequence() {
  globalAudioSequenceId += 1;
}

async function playObjectVocabularyAudio(word: string) {
  runAudio(playTapSound());
  await speakWord(word);
}

async function playStepAudioSequence(
  scene: Scene,
  step: SceneStep,
  isActive: () => boolean,
  options: PlayStepAudioOptions,
) {
  const vocabularyItem = getStepVocabulary(scene, step);

  if (step.type === 'teach' && vocabularyItem) {
    if (!isActive()) return;
    await speakVi(step.instructionVi);

    if (!isActive()) return;
    await delay(100);

    if (!isActive()) return;
    await speakWord(vocabularyItem.word);

    if (!isActive()) return;
    await delay(120);

    if (!isActive()) return;
    await speakVi(speakPracticePromptVi);

    if (!isActive()) return;
    await delay(60);

    if (!isActive()) return;
    await speakWord(vocabularyItem.word);

    if (!isActive()) return;
    options.onTeachAudioComplete?.();
    return;
  }

  if (!isActive()) return;
  await speakVi(step.instructionVi);

  if (step.vocabId && vocabularyItem) {
    if (!isActive()) return;
    await delay(100);

    if (!isActive()) return;
    await speakWord(vocabularyItem.word);
  }
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

async function playSceneCompletionAudio(scene: Scene) {
  await playSoundEffect('complete');
  await delay(140);
  await speakVi(
    scene.completionReward?.messageVi ??
    `Bé đã hoàn thành ${scene.titleVi}.`,
  );
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

const styles = StyleSheet.create({
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
  dropZone: {
    backgroundColor: 'rgba(255, 211, 77, 0.2)',
    borderColor: colors.secondary,
    borderRadius: radius.xl,
    borderStyle: 'solid',
    borderWidth: 5,
    opacity: 0.78,
    ...shadows.warm,
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
    backgroundColor: colors.white,
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
    backgroundColor: colors.cream,
    borderColor: colors.secondary,
    borderRadius: radius.pill,
    borderWidth: 2,
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
});
