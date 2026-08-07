import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  Pressable,
  Text,
  type PanResponderGestureState,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { SparkleEffect } from '../components/SparkleEffect';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { SceneObject } from '../types/lesson';
import {
  createBounceAnimation,
  createShakeAnimation,
  dimOpacity,
  shouldBounce,
  type ObjectAnimationEffect,
} from './animations';
import { getObjectFallbackEmoji } from './AssetFallbacks';
import { resolveAsset } from './AssetRegistry';
import { type DragTranslation, getPercentRectStyle } from './PositionUtils';

export type SceneObjectEffect = ObjectAnimationEffect;

type SceneObjectRendererProps = {
  object: SceneObject;
  label: string;
  isTargeted: boolean;
  isDimmed: boolean;
  isDisabled: boolean;
  isDraggable?: boolean;
  shouldMagnify?: boolean;
  effect: SceneObjectEffect;
  onPress: (objectId: string) => void;
  onDragEnd?: (objectId: string, translation: DragTranslation) => boolean;
  style?: StyleProp<ViewStyle>;
  stageSize?: { width: number; height: number };
};

const focusedObjectThresholdDp = 48;
const minimumFocusedObjectSizeDp = 52;
const maximumFocusedObjectScale = 1.22;
const fallbackSmallSidePercent = 11;
const fallbackFocusedObjectScale = 1.16;

export function SceneObjectRenderer({
  object,
  label,
  isTargeted,
  isDimmed,
  isDisabled,
  isDraggable = false,
  shouldMagnify = true,
  effect,
  onPress,
  onDragEnd,
  style,
  stageSize,
}: SceneObjectRendererProps) {
  useThemeSync();
  const [hasImageError, setHasImageError] = React.useState(false);
  const imageOpacity = useRef(new Animated.Value(1)).current;
  const targetPulse = useRef(new Animated.Value(0)).current;
  const focusScale = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const drag = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const fallbackEmoji = getObjectFallbackEmoji({
    assetId: object.asset.id,
    assetSource: object.asset.source,
    label,
    objectId: object.id,
  });
  const imageSource = useMemo(() => resolveAsset(object.asset.source), [object.asset.source]);
  const canUseImage = !!imageSource;
  const shouldShowFallback = !canUseImage || hasImageError;
  const isDragEnabled = isDraggable && !isDisabled && object.isInteractive;
  const isLearningObject = object.role === 'learning';
  const imageHeightRatio = isLearningObject
    ? 0.86
    : object.role === 'character'
      ? 0.98
      : 1;
  const focusedObjectScale = getFocusedObjectScale({
    heightPercent: object.position.height,
    imageHeightRatio,
    isEnabled: isTargeted && shouldMagnify && !isDragEnabled,
    stageHeight: stageSize?.height,
    stageWidth: stageSize?.width,
    widthPercent: object.position.width,
  });
  const shouldShowLabel = false; // object.role !== 'character' && (!isDimmed || isTargeted);
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          shouldStartDrag(gestureState, isDragEnabled),
        onPanResponderMove: (_, gestureState) => {
          drag.setValue({
            x: gestureState.dx,
            y: gestureState.dy,
          });
        },
        onPanResponderRelease: (_, gestureState) => {
          const accepted =
            onDragEnd?.(object.id, {
              dx: gestureState.dx,
              dy: gestureState.dy,
            }) ?? false;

          if (accepted) {
            drag.setValue({ x: 0, y: 0 });
            return;
          }

          resetDragPosition(drag);
        },
        onPanResponderTerminate: () => {
          resetDragPosition(drag);
        },
      }),
    [drag, isDragEnabled, object.id, onDragEnd],
  );

  const hitSlop = useMemo(() => {
    if (object.touchArea && stageSize && stageSize.width > 0 && stageSize.height > 0) {
      const slopTop = ((object.position.y - object.touchArea.y) / 100) * stageSize.height;
      const slopBottom =
        (((object.touchArea.y + object.touchArea.height) -
          (object.position.y + object.position.height)) /
          100) *
        stageSize.height;
      const slopLeft = ((object.position.x - object.touchArea.x) / 100) * stageSize.width;
      const slopRight =
        (((object.touchArea.x + object.touchArea.width) -
          (object.position.x + object.position.width)) /
          100) *
        stageSize.width;

      return {
        top: Math.max(0, slopTop),
        bottom: Math.max(0, slopBottom),
        left: Math.max(0, slopLeft),
        right: Math.max(0, slopRight),
      };
    }
    // Default generous hit slop for kids if no touchArea is defined
    return { top: 24, bottom: 24, left: 24, right: 24 };
  }, [object.touchArea, object.position, stageSize]);

  useEffect(() => {
    if (shouldBounce(effect)) {
      createBounceAnimation(scale).start();
    }

    if (effect === 'shake') {
      createShakeAnimation(translateX).start();
    }
  }, [effect, scale, translateX]);

  useEffect(() => {
    if (!isTargeted) {
      targetPulse.stopAnimation();
      targetPulse.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(targetPulse, {
          duration: 850,
          easing: Easing.inOut(Easing.quad),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(targetPulse, {
          duration: 850,
          easing: Easing.inOut(Easing.quad),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();

    return () => animation.stop();
  }, [isTargeted, targetPulse]);

  useEffect(() => {
    focusScale.stopAnimation();
    const animation = Animated.spring(focusScale, {
      friction: 8,
      tension: 100,
      toValue: focusedObjectScale,
      useNativeDriver: true,
    });
    animation.start();

    return () => animation.stop();
  }, [focusScale, focusedObjectScale]);

  useEffect(() => {
    drag.setValue({ x: 0, y: 0 });
  }, [
    drag,
    object.position.height,
    object.position.width,
    object.position.x,
    object.position.y,
  ]);

  useEffect(() => {
    setHasImageError(false);
    // Keep cached native images visible even if a remount skips load callbacks.
    imageOpacity.setValue(1);
  }, [object.asset.source, imageOpacity]);

  const targetOutlineScaleXRange = getTargetScaleRange(
    object.position.width * focusedObjectScale,
    stageSize?.width,
    2,
    3,
    [1.025, 1.045],
    1.16,
  );
  const targetOutlineScaleYRange = getTargetScaleRange(
    object.position.height * imageHeightRatio * focusedObjectScale,
    stageSize?.height,
    2,
    3,
    [1.025, 1.045],
    1.16,
  );
  const targetAuraScaleXRange = getTargetScaleRange(
    object.position.width * focusedObjectScale,
    stageSize?.width,
    5,
    8,
    [1.055, 1.09],
    1.26,
  );
  const targetAuraScaleYRange = getTargetScaleRange(
    object.position.height * imageHeightRatio * focusedObjectScale,
    stageSize?.height,
    5,
    8,
    [1.055, 1.09],
    1.26,
  );
  const targetOutlineOpacity = targetPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 0.9],
  });
  const targetOutlineScaleX = targetPulse.interpolate({
    inputRange: [0, 1],
    outputRange: targetOutlineScaleXRange,
  });
  const targetOutlineScaleY = targetPulse.interpolate({
    inputRange: [0, 1],
    outputRange: targetOutlineScaleYRange,
  });
  const targetAuraOpacity = targetPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.82, 0.58],
  });
  const targetAuraScaleX = targetPulse.interpolate({
    inputRange: [0, 1],
    outputRange: targetAuraScaleXRange,
  });
  const targetAuraScaleY = targetPulse.interpolate({
    inputRange: [0, 1],
    outputRange: targetAuraScaleYRange,
  });
  const fallbackTargetScale = targetPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  return (
    <Animated.View
      hitSlop={hitSlop}
      {...(isDragEnabled ? panResponder.panHandlers : {})}
      style={[
        getPercentRectStyle(object.position),
        styles.wrapper,
        isDimmed && styles.dimmed,
        isTargeted && styles.targetedWrapper,
        isDragEnabled && styles.draggableWrapper,
        {
          transform: [
            { scale },
            { translateX: drag.x },
            { translateY: drag.y },
            { translateX },
            ...(object.position.rotation ? [{ rotate: `${object.position.rotation}deg` }] as const : []),
            ...(object.position.flipX ? [{ scaleX: -1 }] as const : []),
          ],
        },
        style,
      ]}
    >
      <Pressable
        hitSlop={hitSlop}
        accessibilityLabel={label}
        accessibilityRole="button"
        disabled={isDisabled || isDragEnabled || !object.isInteractive}
        onPress={() => onPress(object.id)}
        style={({ pressed }) => [
          styles.pressable,
          isLearningObject && styles.learningPressable,
          object.role === 'character' && styles.character,
          isDragEnabled && styles.draggable,
          pressed && !isDisabled && styles.pressed,
        ]}
      >
        <Animated.View
          style={[
            styles.assetBubble,
            isLearningObject && styles.learningAssetBubble,
            object.role === 'character' && styles.characterAssetBubble,
            { transform: [{ scale: focusScale }] },
          ]}
        >
          {/* Alpha-preserving copies follow irregular assets; adaptive scales
              keep the outline readable at any object size. */}
          {isTargeted && canUseImage && !hasImageError ? (
            <>
              <Animated.Image
                resizeMode="contain"
                source={imageSource!}
                style={[
                  styles.targetSilhouette,
                  isLearningObject && styles.learningTargetSilhouette,
                  object.role === 'character' &&
                    styles.characterTargetSilhouette,
                  styles.targetAura,
                  {
                    opacity: targetAuraOpacity,
                    transform: [
                      { scaleX: targetAuraScaleX },
                      { scaleY: targetAuraScaleY },
                    ],
                  },
                ]}
              />
              <Animated.Image
                resizeMode="contain"
                source={imageSource!}
                style={[
                  styles.targetSilhouette,
                  isLearningObject && styles.learningTargetSilhouette,
                  object.role === 'character' &&
                    styles.characterTargetSilhouette,
                  styles.targetOutline,
                  {
                    opacity: targetOutlineOpacity,
                    transform: [
                      { scaleX: targetOutlineScaleX },
                      { scaleY: targetOutlineScaleY },
                    ],
                  },
                ]}
              />
            </>
          ) : null}
          {isTargeted && shouldShowFallback ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.fallbackTargetHalo,
                {
                  opacity: targetOutlineOpacity,
                  transform: [{ scale: fallbackTargetScale }],
                },
              ]}
            />
          ) : null}
          {shouldShowFallback ? (
            <Text
              accessibilityLabel={`${label} placeholder`}
              style={[
                styles.emoji,
                isLearningObject && styles.learningEmoji,
                object.role === 'character' && styles.characterEmoji,
                styles.placeholderEmoji,
              ]}
            >
              {fallbackEmoji}
            </Text>
          ) : null}
          {canUseImage && !hasImageError ? (
            <Animated.Image
              onError={() => {
                imageOpacity.setValue(1);
                setHasImageError(true);
              }}
              onLoadEnd={() => {
                Animated.timing(imageOpacity, {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: true,
                }).start();
              }}
              onLoadStart={() => {
                imageOpacity.setValue(0);
              }}
              resizeMode="contain"
              source={imageSource!}
              style={[
                styles.image,
                isLearningObject && styles.learningImage,
                object.role === 'character' && styles.characterImage,
                { opacity: imageOpacity },
              ]}
            />
          ) : null}
          {shouldShowLabel ? (
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[styles.label, isLearningObject && styles.learningLabel]}
            >
              {label}
            </Text>
          ) : null}
        </Animated.View>
        <SparkleEffect active={effect === 'sparkle'} />
      </Pressable>
    </Animated.View>
  );
}

function shouldStartDrag(
  gestureState: PanResponderGestureState,
  isDragEnabled: boolean,
) {
  if (!isDragEnabled) {
    return false;
  }

  return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
}

function getTargetScaleRange(
  percentSize: number,
  stagePixels: number | undefined,
  startPadding: number,
  endPadding: number,
  fallback: [number, number],
  maxScale: number,
) {
  if (!stagePixels || stagePixels <= 0 || percentSize <= 0) {
    return fallback;
  }

  const renderedSize = (percentSize / 100) * stagePixels;

  return [
    Math.min(maxScale, 1 + (startPadding * 2) / renderedSize),
    Math.min(maxScale, 1 + (endPadding * 2) / renderedSize),
  ];
}

function getFocusedObjectScale({
  heightPercent,
  imageHeightRatio,
  isEnabled,
  stageHeight,
  stageWidth,
  widthPercent,
}: {
  heightPercent: number;
  imageHeightRatio: number;
  isEnabled: boolean;
  stageHeight: number | undefined;
  stageWidth: number | undefined;
  widthPercent: number;
}) {
  if (!isEnabled) {
    return 1;
  }

  const visibleHeightPercent = heightPercent * imageHeightRatio;

  if (!stageWidth || stageWidth <= 0 || !stageHeight || stageHeight <= 0) {
    const shortSidePercent = Math.min(widthPercent, visibleHeightPercent);

    return shortSidePercent < fallbackSmallSidePercent
      ? fallbackFocusedObjectScale
      : 1;
  }

  const renderedWidth = (widthPercent / 100) * stageWidth;
  const renderedHeight = (visibleHeightPercent / 100) * stageHeight;
  const shortSideDp = Math.min(renderedWidth, renderedHeight);

  if (
    !Number.isFinite(shortSideDp) ||
    shortSideDp <= 0 ||
    shortSideDp >= focusedObjectThresholdDp
  ) {
    return 1;
  }

  return Math.min(
    maximumFocusedObjectScale,
    Math.max(1.08, minimumFocusedObjectSizeDp / shortSideDp),
  );
}

function resetDragPosition(drag: Animated.ValueXY) {
  Animated.spring(drag, {
    friction: 6,
    tension: 100,
    toValue: {
      x: 0,
      y: 0,
    },
    useNativeDriver: true,
  }).start();
}

const styles = createThemedStyles(() => ({
  assetBubble: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.lg,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xs,
    width: '100%',
  },
  character: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  characterAssetBubble: {
    backgroundColor: 'transparent',
    padding: 0,
  },
  characterEmoji: {
    fontSize: 64,
    lineHeight: 72,
  },
  characterImage: {
    maxHeight: '98%',
  },
  characterTargetSilhouette: {
    bottom: '1%',
    top: '1%',
  },
  dimmed: {
    opacity: dimOpacity,
  },
  draggable: {
    borderColor: colors.primary,
  },
  draggableWrapper: {
    zIndex: 5,
  },
  emoji: {
    fontSize: 48,
    lineHeight: 56,
    textAlign: 'center',
  },
  placeholderEmoji: {
    position: 'absolute',
  },
  hiddenImage: {
    height: 0,
    opacity: 0,
    width: 0,
  },
  image: {
    flex: 1,
    maxHeight: '100%',
    width: '100%',
  },
  label: {
    color: colors.text,
    textAlign: 'center',
    ...typography.caption,
  },
  learningAssetBubble: {
    backgroundColor: 'transparent',
    padding: 0,
  },
  learningEmoji: {
    fontSize: 58,
    lineHeight: 66,
  },
  learningImage: {
    maxHeight: '86%',
  },
  learningTargetSilhouette: {
    bottom: '7%',
    top: '7%',
  },
  learningLabel: {
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: radius.pill,
    marginTop: spacing.xs,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  learningPressable: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  pressable: {
    alignItems: 'center',
    backgroundColor: colors.mint,
    borderColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 3,
    elevation: 3,
    flex: 1,
    justifyContent: 'center',
    overflow: 'visible',
    position: 'relative',
    shadowColor: colors.shadow,
    shadowOffset: {
      height: 5,
      width: 0,
    },
    shadowOpacity: 0.16,
    shadowRadius: 8,
  },
  pressed: {
    opacity: 0.82,
  },
  fallbackTargetHalo: {
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    borderColor: colors.primary,
    borderRadius: 42,
    borderWidth: 4,
    height: 84,
    left: '50%',
    marginLeft: -42,
    marginTop: -42,
    position: 'absolute',
    top: '50%',
    width: 84,
  },
  targetAura: {
    tintColor: colors.focusOutline,
  },
  targetOutline: {
    tintColor: colors.white,
  },
  targetSilhouette: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  targetedWrapper: {
    zIndex: 3,
  },
  wrapper: {
  },
}));
