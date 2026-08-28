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
  AppState,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import {
  GestureDetector,
  ScrollView as GestureScrollView,
  usePanGesture,
  usePinchGesture,
  useRotationGesture,
  useSimultaneousGestures,
  useTapGesture,
} from 'react-native-gesture-handler';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { MascotImage } from '../components/mascot';
import { Screen } from '../components/Screen';
import { SKidsIcon } from '../components/SKidsIcon';
import { StickerArtwork } from '../components/stickers/StickerArtwork';
import { stickerPlaygroundBackgrounds } from '../data/stickerPlayground';
import {
  getActivityLog,
  type ActivityLog,
} from '../engine/DailyActivityTracker';
import {
  getProgress,
  saveEarnedAchievementRecords,
  saveStickerPlaygroundState,
  type LocalProgress,
} from '../engine/ProgressManager';
import { playTapSound } from '../engine/AudioManager';
import { useI18n, useSavedAppLanguage } from '../i18n';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing, touchTarget } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import type { RootStackParamList } from '../types/navigation';
import type { UnlockedSticker } from '../utils/unlockedStickers';
import {
  getMissingAchievementStickerRecords,
  getUnlockedStickers,
} from '../utils/unlockedStickers';
import {
  createEmptyStickerPlaygroundState,
  STICKER_PLAYGROUND_MAX_PLACEMENTS,
  STICKER_PLAYGROUND_MAX_SCALE,
  STICKER_PLAYGROUND_MIN_SCALE,
  type StickerPlacement,
  type StickerPlaygroundBackgroundId,
  type StickerPlaygroundState,
} from '../types/stickerPlayground';

type Props = NativeStackScreenProps<RootStackParamList, 'StickerPlayground'>;

type CanvasSize = {
  height: number;
  width: number;
};

type WindowRect = CanvasSize & {
  x: number;
  y: number;
};

type TransformSnapshot = Pick<
  StickerPlacement,
  'rotation' | 'scale' | 'x' | 'y'
>;

type SaveStatus = 'saved' | 'saving' | 'error';

const BASE_STICKER_SIZE = 92;
const SAVE_DEBOUNCE_MS = 350;
const MAX_UNDO_STEPS = 20;

export function StickerPlaygroundScreen({ navigation }: Props) {
  useThemeSync();
  const t = useI18n();
  const appLanguage = useSavedAppLanguage();
  const rootRef = useRef<View>(null);
  const canvasRef = useRef<View>(null);
  const canvasWindowRectRef = useRef<WindowRect | null>(null);
  const rootWindowRectRef = useRef<WindowRect | null>(null);
  const playgroundRef = useRef<StickerPlaygroundState>(
    createEmptyStickerPlaygroundState(),
  );
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirtyRef = useRef(false);
  const mountedRef = useRef(true);
  const revisionRef = useRef(0);
  const instanceCounterRef = useRef(0);
  const undoStacksRef = useRef<
    Record<StickerPlaygroundBackgroundId, StickerPlacement[][]>
  >({ beach: [], bedroom: [], park: [] });
  const previewPosition = useRef(new Animated.ValueXY()).current;
  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLog | null>(null);
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false);
  const [hasLoadedActivity, setHasLoadedActivity] = useState(false);
  const [playground, setPlayground] = useState<StickerPlaygroundState>(() =>
    createEmptyStickerPlaygroundState(),
  );
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({
    height: 0,
    width: 0,
  });
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>();
  const [previewSticker, setPreviewSticker] =
    useState<UnlockedSticker | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [, setUndoVersion] = useState(0);

  useEffect(() => {
    mountedRef.current = true;

    getProgress()
      .then(nextProgress => {
        if (!mountedRef.current) {
          return;
        }

        setProgress(nextProgress);
        playgroundRef.current = nextProgress.stickerPlayground;
        setPlayground(nextProgress.stickerPlayground);
      })
      .catch(() => undefined)
      .finally(() => {
        if (mountedRef.current) {
          setHasLoadedProgress(true);
        }
      });
    getActivityLog()
      .then(nextActivityLog => {
        if (mountedRef.current) {
          setActivityLog(nextActivityLog);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (mountedRef.current) {
          setHasLoadedActivity(true);
        }
      });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const unlockedStickers = useMemo(
    () => getUnlockedStickers(progress, activityLog, appLanguage),
    [activityLog, appLanguage, progress],
  );
  const stickerById = useMemo(
    () => new Map(unlockedStickers.map(item => [item.stickerId, item])),
    [unlockedStickers],
  );
  const activeBackgroundId = playground.activeBackgroundId;
  const activeBackground =
    stickerPlaygroundBackgrounds.find(
      background => background.id === activeBackgroundId,
    ) ?? stickerPlaygroundBackgrounds[0];
  const placements = playground.boards[activeBackgroundId].placements;
  const placedStickerIds = useMemo(
    () => new Set(placements.map(placement => placement.stickerId)),
    [placements],
  );
  const selectedPlacement = placements.find(
    placement => placement.instanceId === selectedInstanceId,
  );
  const undoCount = undoStacksRef.current[activeBackgroundId].length;

  useEffect(() => {
    if (!hasLoadedProgress || !hasLoadedActivity || !progress) {
      return;
    }

    const missingRecords = getMissingAchievementStickerRecords(
      progress,
      activityLog,
      new Date().toISOString(),
    );
    if (missingRecords.length === 0) {
      return;
    }

    saveEarnedAchievementRecords(missingRecords)
      .then(nextProgress => {
        if (mountedRef.current) {
          setProgress(nextProgress);
        }
      })
      .catch(() => undefined);
  }, [activityLog, hasLoadedActivity, hasLoadedProgress, progress]);

  const flushPendingSave = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    if (!dirtyRef.current) {
      return Promise.resolve();
    }

    dirtyRef.current = false;
    const revision = revisionRef.current;
    const state = playgroundRef.current;
    if (mountedRef.current) {
      setSaveStatus('saving');
    }

    return saveStickerPlaygroundState(state)
      .then(() => {
        if (mountedRef.current && revisionRef.current === revision) {
          setSaveStatus('saved');
        }
      })
      .catch(() => {
        dirtyRef.current = true;
        if (mountedRef.current) {
          setSaveStatus('error');
        }
      });
  }, []);

  const scheduleSave = useCallback(() => {
    dirtyRef.current = true;
    revisionRef.current += 1;
    setSaveStatus('saving');
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      flushPendingSave();
    }, SAVE_DEBOUNCE_MS);
  }, [flushPendingSave]);

  useEffect(() => {
    const appStateSubscription = AppState.addEventListener(
      'change',
      nextState => {
        if (nextState !== 'active') {
          flushPendingSave();
        }
      },
    );

    return () => {
      appStateSubscription.remove();
      flushPendingSave();
    };
  }, [flushPendingSave]);

  const replacePlayground = useCallback(
    (
      nextState: StickerPlaygroundState,
      changedBoardId?: StickerPlaygroundBackgroundId,
    ) => {
      const updatedAt = new Date().toISOString();
      const state = changedBoardId
        ? {
            ...nextState,
            boards: {
              ...nextState.boards,
              [changedBoardId]: {
                ...nextState.boards[changedBoardId],
                updatedAt,
              },
            },
            updatedAt,
          }
        : { ...nextState, updatedAt };

      playgroundRef.current = state;
      setPlayground(state);
      scheduleSave();
    },
    [scheduleSave],
  );

  const pushUndoSnapshot = useCallback(
    (backgroundId: StickerPlaygroundBackgroundId) => {
      const stack = undoStacksRef.current[backgroundId];
      const currentPlacements =
        playgroundRef.current.boards[backgroundId].placements;
      stack.push(currentPlacements.map(placement => ({ ...placement })));
      if (stack.length > MAX_UNDO_STEPS) {
        stack.shift();
      }
      setUndoVersion(version => version + 1);
    },
    [],
  );

  const updateActivePlacements = useCallback(
    (
      nextPlacements: StickerPlacement[],
      options: { pushUndo?: boolean } = {},
    ) => {
      const currentState = playgroundRef.current;
      const backgroundId = currentState.activeBackgroundId;
      if (options.pushUndo) {
        pushUndoSnapshot(backgroundId);
      }
      replacePlayground(
        {
          ...currentState,
          boards: {
            ...currentState.boards,
            [backgroundId]: {
              ...currentState.boards[backgroundId],
              placements: nextPlacements,
            },
          },
        },
        backgroundId,
      );
    },
    [pushUndoSnapshot, replacePlayground],
  );

  const handleSelectBackground = (
    backgroundId: StickerPlaygroundBackgroundId,
  ) => {
    if (backgroundId === playgroundRef.current.activeBackgroundId) {
      return;
    }

    playTapSound().catch(() => undefined);
    setSelectedInstanceId(undefined);
    replacePlayground({
      ...playgroundRef.current,
      activeBackgroundId: backgroundId,
    });
  };

  const placeSticker = useCallback(
    (
      stickerId: string,
      x: number,
      y: number,
      options: { moveExisting?: boolean } = {},
    ) => {
      const currentState = playgroundRef.current;
      const backgroundId = currentState.activeBackgroundId;
      const currentPlacements = currentState.boards[backgroundId].placements;
      const maxZIndex = currentPlacements.reduce(
        (maximum, placement) => Math.max(maximum, placement.zIndex),
        0,
      );
      const existingPlacement = currentPlacements.find(
        placement => placement.stickerId === stickerId,
      );

      if (existingPlacement) {
        const shouldUpdatePosition = options.moveExisting === true;
        const isAlreadyOnTop = existingPlacement.zIndex === maxZIndex;
        if (shouldUpdatePosition || !isAlreadyOnTop) {
          updateActivePlacements(
            currentPlacements.map(placement =>
              placement.instanceId === existingPlacement.instanceId
                ? {
                    ...placement,
                    x: shouldUpdatePosition ? clamp(x, 0.04, 0.96) : placement.x,
                    y: shouldUpdatePosition ? clamp(y, 0.04, 0.96) : placement.y,
                    zIndex: maxZIndex + 1,
                  }
                : placement,
            ),
            { pushUndo: true },
          );
        }
        setSelectedInstanceId(existingPlacement.instanceId);
        playTapSound().catch(() => undefined);
        return;
      }

      if (currentPlacements.length >= STICKER_PLAYGROUND_MAX_PLACEMENTS) {
        Alert.alert(
          t('stickerPlayground.limitTitle'),
          t('stickerPlayground.limitText'),
        );
        return;
      }

      instanceCounterRef.current += 1;
      const placement: StickerPlacement = {
        instanceId: `${Date.now().toString(36)}-${instanceCounterRef.current.toString(36)}`,
        rotation: 0,
        scale: 1,
        stickerId,
        x: clamp(x, 0.04, 0.96),
        y: clamp(y, 0.04, 0.96),
        zIndex: maxZIndex + 1,
      };

      updateActivePlacements([...currentPlacements, placement], {
        pushUndo: true,
      });
      setSelectedInstanceId(placement.instanceId);
      playTapSound().catch(() => undefined);
    },
    [t, updateActivePlacements],
  );

  const handleAddSticker = useCallback(
    (sticker: UnlockedSticker) => {
      const offsetIndex = placements.length % 5;
      placeSticker(
        sticker.stickerId,
        0.5 + (offsetIndex - 2) * 0.035,
        0.48 + (offsetIndex % 2) * 0.04,
      );
    },
    [placeSticker, placements.length],
  );

  const handleDropSticker = useCallback(
    (sticker: UnlockedSticker, absoluteX: number, absoluteY: number) => {
      const canvasRect = canvasWindowRectRef.current;
      if (
        !canvasRect ||
        absoluteX < canvasRect.x ||
        absoluteX > canvasRect.x + canvasRect.width ||
        absoluteY < canvasRect.y ||
        absoluteY > canvasRect.y + canvasRect.height
      ) {
        return;
      }

      placeSticker(
        sticker.stickerId,
        (absoluteX - canvasRect.x) / canvasRect.width,
        (absoluteY - canvasRect.y) / canvasRect.height,
        { moveExisting: true },
      );
    },
    [placeSticker],
  );

  const handleBeginPlacementInteraction = useCallback(
    (instanceId: string) => {
      const currentState = playgroundRef.current;
      pushUndoSnapshot(currentState.activeBackgroundId);
      setSelectedInstanceId(instanceId);
    },
    [pushUndoSnapshot],
  );

  const handleTransformPlacement = useCallback(
    (instanceId: string, transform: TransformSnapshot) => {
      const currentState = playgroundRef.current;
      const backgroundId = currentState.activeBackgroundId;
      const currentPlacements = currentState.boards[backgroundId].placements;
      const maxZIndex = currentPlacements.reduce(
        (maximum, placement) => Math.max(maximum, placement.zIndex),
        0,
      );
      const nextPlacements = currentPlacements.map(placement =>
        placement.instanceId === instanceId
          ? {
              ...placement,
              rotation: normalizeRotation(transform.rotation),
              scale: clamp(
                transform.scale,
                STICKER_PLAYGROUND_MIN_SCALE,
                STICKER_PLAYGROUND_MAX_SCALE,
              ),
              x: clamp(transform.x, 0.04, 0.96),
              y: clamp(transform.y, 0.04, 0.96),
              zIndex: maxZIndex + 1,
            }
          : placement,
      );

      updateActivePlacements(nextPlacements);
    },
    [updateActivePlacements],
  );

  const handleDeleteSelected = () => {
    if (!selectedInstanceId) {
      return;
    }

    updateActivePlacements(
      placements.filter(
        placement => placement.instanceId !== selectedInstanceId,
      ),
      { pushUndo: true },
    );
    setSelectedInstanceId(undefined);
    playTapSound().catch(() => undefined);
  };

  const handleUndo = () => {
    const backgroundId = playgroundRef.current.activeBackgroundId;
    const previousPlacements = undoStacksRef.current[backgroundId].pop();
    if (!previousPlacements) {
      return;
    }

    setUndoVersion(version => version + 1);
    updateActivePlacements(previousPlacements);
    setSelectedInstanceId(undefined);
    playTapSound().catch(() => undefined);
  };

  const handleClear = () => {
    if (placements.length === 0) {
      return;
    }

    Alert.alert(
      t('stickerPlayground.clearTitle'),
      t('stickerPlayground.clearText'),
      [
        { style: 'cancel', text: t('common.close') },
        {
          onPress: () => {
            updateActivePlacements([], { pushUndo: true });
            setSelectedInstanceId(undefined);
          },
          style: 'destructive',
          text: t('stickerPlayground.clearConfirm'),
        },
      ],
    );
  };

  const handleCanvasLayout = (event: LayoutChangeEvent) => {
    setCanvasSize({
      height: event.nativeEvent.layout.height,
      width: event.nativeEvent.layout.width,
    });
    requestAnimationFrame(measureDropTargets);
  };

  const measureDropTargets = () => {
    canvasRef.current?.measureInWindow((x, y, width, height) => {
      canvasWindowRectRef.current = { height, width, x, y };
    });
    rootRef.current?.measureInWindow((x, y, width, height) => {
      rootWindowRectRef.current = { height, width, x, y };
    });
  };

  const movePreview = (absoluteX: number, absoluteY: number) => {
    const rootRect = rootWindowRectRef.current;
    previewPosition.setValue({
      x: absoluteX - (rootRect?.x ?? 0) - BASE_STICKER_SIZE / 2,
      y: absoluteY - (rootRect?.y ?? 0) - BASE_STICKER_SIZE / 2,
    });
  };

  const getBackgroundLabel = (id: StickerPlaygroundBackgroundId) =>
    t(`stickerPlayground.background.${id}`);

  const getSaveLabel = () => {
    return saveStatus === 'error'
      ? t('stickerPlayground.saveError')
      : t('common.saveInProgress');
  };

  return (
    <Screen withBottomSpace={false}>
      <View
        onLayout={measureDropTargets}
        ref={rootRef}
        style={styles.container}
      >
        <View style={styles.topRow}>
          <ScrollView
            contentContainerStyle={styles.backgroundList}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.backgroundScroller}
            testID="sticker-background-selector"
          >
            {stickerPlaygroundBackgrounds.map(background => {
              const isSelected = background.id === activeBackgroundId;
              return (
                <Pressable
                  accessibilityLabel={getBackgroundLabel(background.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  key={background.id}
                  onPress={() => handleSelectBackground(background.id)}
                  style={({ pressed }) => [
                    styles.backgroundButton,
                    isSelected && styles.backgroundButtonSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <SKidsIcon name={background.iconName} size={30} />
                  <Text
                    maxFontSizeMultiplier={1.25}
                    numberOfLines={1}
                    style={[
                      styles.backgroundButtonText,
                      isSelected && styles.backgroundButtonTextSelected,
                    ]}
                  >
                    {getBackgroundLabel(background.id)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          {saveStatus !== 'saved' ? (
            <Text
              accessibilityLiveRegion="polite"
              maxFontSizeMultiplier={1.2}
              numberOfLines={1}
              style={[
                styles.saveStatus,
                saveStatus === 'error' && styles.saveStatusError,
              ]}
              testID="sticker-save-status"
            >
              {getSaveLabel()}
            </Text>
          ) : null}
        </View>

        <View
          onLayout={handleCanvasLayout}
          ref={canvasRef}
          style={styles.canvas}
        >
          <ImageBackground
            imageStyle={styles.backgroundImage}
            resizeMode="cover"
            source={activeBackground.imageSource}
            style={styles.backgroundImage}
          >
            <View pointerEvents="none" style={styles.sungyCorner}>
              <MascotImage decorative pose="letsGo" size={76} />
            </View>
            {placements
              .slice()
              .sort((left, right) => left.zIndex - right.zIndex)
              .map(placement => {
                const sticker = stickerById.get(placement.stickerId);
                if (!sticker) {
                  return null;
                }

                return (
                  <TransformableSticker
                    canvasSize={canvasSize}
                    isSelected={placement.instanceId === selectedInstanceId}
                    key={placement.instanceId}
                    onInteractionStart={handleBeginPlacementInteraction}
                    onSelect={setSelectedInstanceId}
                    onTransformEnd={handleTransformPlacement}
                    placement={placement}
                    sticker={sticker}
                  />
                );
              })}
          </ImageBackground>
        </View>

        <View style={styles.toolRow}>
          <View style={styles.toolSelectionText}>
            <Text numberOfLines={1} style={styles.toolTitle}>
              {selectedPlacement
                ? stickerById.get(selectedPlacement.stickerId)?.title ??
                  t('stickerPlayground.selected')
                : t('stickerPlayground.hint')}
            </Text>
            <Text style={styles.toolSubtitle}>
              {t('stickerPlayground.gestureHint')}
            </Text>
          </View>
          <ToolButton
            disabled={undoCount === 0}
            iconName="replay"
            label={t('stickerPlayground.undo')}
            onPress={handleUndo}
          />
          <ToolButton
            disabled={!selectedInstanceId}
            iconName="cleanPrivate"
            label={t('stickerPlayground.delete')}
            onPress={handleDeleteSelected}
          />
          <ToolButton
            disabled={placements.length === 0}
            iconName="toyCleanup"
            label={t('stickerPlayground.clear')}
            onPress={handleClear}
          />
        </View>

        <View style={styles.traySection}>
          <View style={styles.trayHeader}>
            <View>
              <Text style={styles.trayTitle}>
                {t('stickerPlayground.trayTitle')}
              </Text>
              <Text style={styles.traySubtitle}>
                {t('stickerPlayground.trayHint')}
              </Text>
            </View>
            <Text style={styles.trayCount}>{unlockedStickers.length}</Text>
          </View>
          {hasLoadedProgress && hasLoadedActivity ? (
            unlockedStickers.length > 0 ? (
              <GestureScrollView
                contentContainerStyle={styles.trayList}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {unlockedStickers.map(sticker => (
                  <StickerTrayItem
                    isPlaced={placedStickerIds.has(sticker.stickerId)}
                    key={sticker.stickerId}
                    onDragEnd={(absoluteX, absoluteY) => {
                      handleDropSticker(sticker, absoluteX, absoluteY);
                      setPreviewSticker(null);
                    }}
                    onDragMove={movePreview}
                    onDragStart={(absoluteX, absoluteY) => {
                      setPreviewSticker(sticker);
                      movePreview(absoluteX, absoluteY);
                    }}
                    onPress={() => handleAddSticker(sticker)}
                    sticker={sticker}
                  />
                ))}
              </GestureScrollView>
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate('StickerCollection')}
                style={({ pressed }) => [
                  styles.emptyTray,
                  pressed && styles.pressed,
                ]}
              >
                <SKidsIcon name="sticker" size={38} />
                <Text style={styles.emptyTrayText}>
                  {t('stickerPlayground.empty')}
                </Text>
              </Pressable>
            )
          ) : (
            <Text style={styles.loadingText}>
              {t('common.loadingProgress')}
            </Text>
          )}
        </View>

        {previewSticker ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.dragPreview,
              {
                transform: [
                  ...previewPosition.getTranslateTransform(),
                  { scale: 1.08 },
                ],
              },
            ]}
          >
            <StickerArtwork item={previewSticker} size="playground" />
          </Animated.View>
        ) : null}
      </View>
    </Screen>
  );
}

type TransformableStickerProps = {
  canvasSize: CanvasSize;
  isSelected: boolean;
  onInteractionStart: (instanceId: string) => void;
  onSelect: (instanceId: string) => void;
  onTransformEnd: (
    instanceId: string,
    transform: TransformSnapshot,
  ) => void;
  placement: StickerPlacement;
  sticker: UnlockedSticker;
};

function TransformableSticker({
  canvasSize,
  isSelected,
  onInteractionStart,
  onSelect,
  onTransformEnd,
  placement,
  sticker,
}: TransformableStickerProps) {
  const translateX = useRef(
    new Animated.Value(placement.x * canvasSize.width),
  ).current;
  const translateY = useRef(
    new Animated.Value(placement.y * canvasSize.height),
  ).current;
  const scale = useRef(new Animated.Value(placement.scale)).current;
  const rotation = useRef(new Animated.Value(placement.rotation)).current;
  const currentTransformRef = useRef<TransformSnapshot>({
    rotation: placement.rotation,
    scale: placement.scale,
    x: placement.x,
    y: placement.y,
  });
  const panStartRef = useRef(currentTransformRef.current);
  const pinchStartScaleRef = useRef(placement.scale);
  const rotationStartRef = useRef(placement.rotation);
  const activeGestureCountRef = useRef(0);

  useEffect(() => {
    if (activeGestureCountRef.current > 0) {
      return;
    }

    currentTransformRef.current = {
      rotation: placement.rotation,
      scale: placement.scale,
      x: placement.x,
      y: placement.y,
    };
    translateX.setValue(placement.x * canvasSize.width);
    translateY.setValue(placement.y * canvasSize.height);
    scale.setValue(placement.scale);
    rotation.setValue(placement.rotation);
  }, [
    canvasSize.height,
    canvasSize.width,
    placement.rotation,
    placement.scale,
    placement.x,
    placement.y,
    rotation,
    scale,
    translateX,
    translateY,
  ]);

  const beginContinuousGesture = () => {
    if (activeGestureCountRef.current === 0) {
      onInteractionStart(placement.instanceId);
    }
    activeGestureCountRef.current += 1;
  };

  const endContinuousGesture = () => {
    activeGestureCountRef.current = Math.max(
      0,
      activeGestureCountRef.current - 1,
    );
    if (activeGestureCountRef.current === 0) {
      onTransformEnd(placement.instanceId, currentTransformRef.current);
    }
  };

  const panGesture = usePanGesture({
    averageTouches: true,
    disableReanimated: true,
    minDistance: 2,
    onActivate: () => {
      panStartRef.current = { ...currentTransformRef.current };
      beginContinuousGesture();
    },
    onDeactivate: endContinuousGesture,
    onUpdate: event => {
      if (canvasSize.width <= 0 || canvasSize.height <= 0) {
        return;
      }

      const nextX = clamp(
        panStartRef.current.x + event.translationX / canvasSize.width,
        0.04,
        0.96,
      );
      const nextY = clamp(
        panStartRef.current.y + event.translationY / canvasSize.height,
        0.04,
        0.96,
      );
      currentTransformRef.current = {
        ...currentTransformRef.current,
        x: nextX,
        y: nextY,
      };
      translateX.setValue(nextX * canvasSize.width);
      translateY.setValue(nextY * canvasSize.height);
    },
  });
  const pinchGesture = usePinchGesture({
    disableReanimated: true,
    onActivate: () => {
      pinchStartScaleRef.current = currentTransformRef.current.scale;
      beginContinuousGesture();
    },
    onDeactivate: endContinuousGesture,
    onUpdate: event => {
      const nextScale = clamp(
        pinchStartScaleRef.current * event.scale,
        STICKER_PLAYGROUND_MIN_SCALE,
        STICKER_PLAYGROUND_MAX_SCALE,
      );
      currentTransformRef.current = {
        ...currentTransformRef.current,
        scale: nextScale,
      };
      scale.setValue(nextScale);
    },
  });
  const rotationGesture = useRotationGesture({
    disableReanimated: true,
    onActivate: () => {
      rotationStartRef.current = currentTransformRef.current.rotation;
      beginContinuousGesture();
    },
    onDeactivate: endContinuousGesture,
    onUpdate: event => {
      const nextRotation = rotationStartRef.current + event.rotation;
      currentTransformRef.current = {
        ...currentTransformRef.current,
        rotation: nextRotation,
      };
      rotation.setValue(nextRotation);
    },
  });
  const tapGesture = useTapGesture({
    disableReanimated: true,
    maxDistance: 8,
    onDeactivate: event => {
      if (!event.canceled) {
        onSelect(placement.instanceId);
      }
    },
  });
  const gesture = useSimultaneousGestures(
    panGesture,
    pinchGesture,
    rotationGesture,
    tapGesture,
  );
  const rotate = rotation.interpolate({
    extrapolate: 'extend',
    inputRange: [-Math.PI * 2, Math.PI * 2],
    outputRange: ['-6.283rad', '6.283rad'],
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        accessibilityLabel={sticker.title}
        accessibilityRole="button"
        onAccessibilityTap={() => onSelect(placement.instanceId)}
        style={[
          styles.placedSticker,
          isSelected && styles.placedStickerSelected,
          {
            transform: [
              { translateX },
              { translateY },
              { scale },
              { rotate },
            ],
            zIndex: placement.zIndex,
          },
        ]}
      >
        <StickerArtwork item={sticker} size="playground" />
      </Animated.View>
    </GestureDetector>
  );
}

type StickerTrayItemProps = {
  isPlaced: boolean;
  onDragEnd: (absoluteX: number, absoluteY: number) => void;
  onDragMove: (absoluteX: number, absoluteY: number) => void;
  onDragStart: (absoluteX: number, absoluteY: number) => void;
  onPress: () => void;
  sticker: UnlockedSticker;
};

function StickerTrayItem({
  isPlaced,
  onDragEnd,
  onDragMove,
  onDragStart,
  onPress,
  sticker,
}: StickerTrayItemProps) {
  const t = useI18n();
  const dragGesture = usePanGesture({
    activeOffsetY: -8,
    averageTouches: true,
    cancelsJSResponder: true,
    cancelsTouchesInView: true,
    disableReanimated: true,
    failOffsetX: [-14, 14],
    failOffsetY: 10,
    onActivate: event => onDragStart(event.absoluteX, event.absoluteY),
    onDeactivate: event =>
      onDragEnd(
        event.canceled ? -1 : event.absoluteX,
        event.canceled ? -1 : event.absoluteY,
      ),
    onUpdate: event => onDragMove(event.absoluteX, event.absoluteY),
    testID: 'sticker-tray-drag',
  });

  return (
    <GestureDetector gesture={dragGesture}>
      <Pressable
        accessibilityHint={
          isPlaced
            ? t('stickerPlayground.placedHint')
            : t('stickerPlayground.unplacedHint')
        }
        accessibilityLabel={sticker.title}
        accessibilityRole="button"
        accessibilityState={{ selected: isPlaced }}
        onPress={onPress}
        style={({ pressed }) => [
          styles.trayItem,
          isPlaced && styles.trayItemPlaced,
          pressed && styles.pressed,
        ]}
      >
        <StickerArtwork item={sticker} size="tray" />
        {isPlaced ? (
          <View pointerEvents="none" style={styles.trayPlacedBadge}>
            <Text style={styles.trayPlacedBadgeText}>✓</Text>
          </View>
        ) : null}
      </Pressable>
    </GestureDetector>
  );
}

type ToolButtonProps = {
  disabled: boolean;
  iconName: 'cleanPrivate' | 'replay' | 'toyCleanup';
  label: string;
  onPress: () => void;
};

function ToolButton({
  disabled,
  iconName,
  label,
  onPress,
}: ToolButtonProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.toolButton,
        disabled && styles.toolButtonDisabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <SKidsIcon name={iconName} size={24} />
      <Text style={styles.toolButtonText}>{label}</Text>
    </Pressable>
  );
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function normalizeRotation(value: number) {
  const fullTurn = Math.PI * 2;
  return ((value + Math.PI) % fullTurn + fullTurn) % fullTurn - Math.PI;
}

const styles = createThemedStyles(() => ({
  backgroundButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 2,
    flexDirection: 'row',
    flexShrink: 0,
    gap: spacing.xs,
    minHeight: touchTarget.minimum,
    paddingHorizontal: spacing.md,
  },
  backgroundButtonSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  backgroundButtonText: {
    color: colors.textSoft,
    ...typography.caption,
  },
  backgroundButtonTextSelected: {
    color: colors.primaryDark,
  },
  backgroundImage: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  backgroundList: {
    gap: spacing.xs,
    paddingRight: spacing.sm,
  },
  backgroundScroller: {
    flex: 1,
    minWidth: 0,
  },
  canvas: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.outlineStrong,
    borderRadius: radius.lg,
    borderWidth: 3,
    flex: 1,
    minHeight: 280,
    overflow: 'hidden',
    ...shadows.floating,
  },
  container: {
    flex: 1,
    gap: spacing.sm,
    padding: spacing.md,
    position: 'relative',
  },
  dragPreview: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    borderWidth: 3,
    height: BASE_STICKER_SIZE,
    left: 0,
    opacity: 0.96,
    position: 'absolute',
    top: 0,
    width: BASE_STICKER_SIZE,
    zIndex: 20000,
    ...shadows.floating,
  },
  emptyTray: {
    alignItems: 'center',
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 78,
    padding: spacing.md,
  },
  emptyTrayText: {
    color: colors.primaryDark,
    flex: 1,
    ...typography.body,
  },
  loadingText: {
    color: colors.textSoft,
    paddingVertical: spacing.lg,
    textAlign: 'center',
    ...typography.body,
  },
  placedSticker: {
    alignItems: 'center',
    height: BASE_STICKER_SIZE,
    justifyContent: 'center',
    left: -BASE_STICKER_SIZE / 2,
    position: 'absolute',
    top: -BASE_STICKER_SIZE / 2,
    width: BASE_STICKER_SIZE,
  },
  placedStickerSelected: {
    borderColor: colors.focusOutline,
    borderRadius: radius.pill,
    borderStyle: 'dashed',
    borderWidth: 2,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  saveStatus: {
    color: colors.primaryDark,
    flexShrink: 0,
    maxWidth: 96,
    textAlign: 'right',
    ...typography.caption,
  },
  saveStatusError: {
    color: colors.alert,
  },
  sungyCorner: {
    bottom: spacing.xs,
    left: spacing.xs,
    opacity: 0.9,
    position: 'absolute',
    zIndex: 0,
  },
  toolButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: touchTarget.minimum,
    minWidth: touchTarget.minimum,
    paddingHorizontal: spacing.xs,
  },
  toolButtonDisabled: {
    opacity: 0.42,
  },
  toolButtonText: {
    color: colors.textSoft,
    fontSize: 10,
    fontWeight: '800',
  },
  toolRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
  },
  toolSelectionText: {
    flex: 1,
    minWidth: 0,
    paddingLeft: spacing.xs,
  },
  toolSubtitle: {
    color: colors.textSoft,
    fontSize: 10,
    fontWeight: '600',
  },
  toolTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
    overflow: 'hidden',
  },
  trayCount: {
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.pill,
    color: colors.secondaryDark,
    minWidth: 36,
    overflow: 'hidden',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    textAlign: 'center',
    ...typography.caption,
  },
  trayHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trayItem: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 2,
    height: 82,
    justifyContent: 'center',
    width: 82,
  },
  trayItemPlaced: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  trayList: {
    gap: spacing.xs,
    paddingRight: spacing.md,
  },
  trayPlacedBadge: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.outlineStrong,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: 2,
    top: 2,
    width: 24,
  },
  trayPlacedBadgeText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  traySection: {
    gap: spacing.xs,
  },
  traySubtitle: {
    color: colors.textSoft,
    fontSize: 10,
    fontWeight: '600',
  },
  trayTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
}));
