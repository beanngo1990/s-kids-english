import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  Pressable,
  Text,
  View,
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
  glowStyle,
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
  effect: SceneObjectEffect;
  onPress: (objectId: string) => void;
  onDragEnd?: (objectId: string, translation: DragTranslation) => boolean;
  style?: StyleProp<ViewStyle>;
  stageSize?: { width: number; height: number };
};

export function SceneObjectRenderer({
  object,
  label,
  isTargeted,
  isDimmed,
  isDisabled,
  isDraggable = false,
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

  const targetHaloOpacity = targetPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.34, 0.12],
  });
  const targetHaloScale = targetPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
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
          isTargeted && styles.targeted,
          isTargeted && isLearningObject && styles.targetedLearning,
          isTargeted && object.role === 'character' && styles.targetedCharacter,
          isDragEnabled && styles.draggable,
          pressed && !isDisabled && styles.pressed,
        ]}
      >
        {isTargeted ? (
          <>
            <Animated.View
              style={[
                styles.targetHalo,
                {
                  opacity: targetHaloOpacity,
                  transform: [{ scale: targetHaloScale }],
                },
              ]}
            />
            <View style={styles.targetRing} />
          </>
        ) : null}
        <View
          style={[
            styles.assetBubble,
            isLearningObject && styles.learningAssetBubble,
            object.role === 'character' && styles.characterAssetBubble,
          ]}
        >
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
        </View>
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
  targeted: {
    ...glowStyle,
  },
  targetHalo: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.pill,
    bottom: -6,
    elevation: 5,
    left: -6,
    position: 'absolute',
    right: -6,
    shadowColor: colors.warmShadow,
    shadowOffset: {
      height: 3,
      width: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    top: -6,
  },
  targetRing: {
    backgroundColor: 'rgba(255, 211, 77, 0.07)',
    borderColor: 'rgba(255, 198, 38, 0.82)',
    borderRadius: radius.pill,
    borderWidth: 3,
    bottom: -2,
    left: -2,
    position: 'absolute',
    right: -2,
    top: -2,
  },
  targetedWrapper: {
    zIndex: 3,
  },
  targetedLearning: {
    backgroundColor: 'transparent',
  },
  targetedCharacter: {
    backgroundColor: 'transparent',
  },
  wrapper: {
  },
}));
