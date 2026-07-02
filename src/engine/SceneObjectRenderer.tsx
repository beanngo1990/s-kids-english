import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PanResponderGestureState,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { SparkleEffect } from '../components/SparkleEffect';
import { colors } from '../theme/colors';
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
  const [hasImageLoaded, setHasImageLoaded] = React.useState(false);
  const [hasImageError, setHasImageError] = React.useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const drag = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const fallbackEmoji = getObjectFallbackEmoji({
    assetId: object.asset.id,
    assetSource: object.asset.source,
    label,
    objectId: object.id,
  });
  const imageSource = resolveAsset(object.asset.source);
  const canUseImage = !!imageSource;
  const isBundledImage = typeof imageSource === 'number';
  const shouldShowImage =
    canUseImage && (isBundledImage || hasImageLoaded) && !hasImageError;
  const shouldShowFallback = !shouldShowImage;
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
    drag.setValue({ x: 0, y: 0 });
  }, [
    drag,
    object.position.height,
    object.position.width,
    object.position.x,
    object.position.y,
  ]);

  useEffect(() => {
    setHasImageLoaded(false);
    setHasImageError(false);
  }, [object.asset.source]);

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
              ]}
            >
              {fallbackEmoji}
            </Text>
          ) : null}
          {canUseImage && !hasImageError ? (
            <Image
              onError={() => setHasImageError(true)}
              onLoad={() => setHasImageLoaded(true)}
              resizeMode="contain"
              source={imageSource!}
              style={[
                styles.image,
                isLearningObject && styles.learningImage,
                object.role === 'character' && styles.characterImage,
                !shouldShowImage && styles.hiddenImage,
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

const styles = StyleSheet.create({
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
  targetedWrapper: {
    zIndex: 3,
  },
  targetedLearning: {
    backgroundColor: 'rgba(255, 246, 215, 0.42)',
    borderColor: colors.secondary,
    borderWidth: 3,
  },
  targetedCharacter: {
    backgroundColor: 'rgba(255, 246, 215, 0.18)',
  },
  wrapper: {
  },
});
