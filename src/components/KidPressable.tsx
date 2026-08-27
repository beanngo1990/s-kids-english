import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { playTapSound } from '../engine/AudioManager';

type KidPressFeedback = 'card' | 'soft' | 'standard';

type KidPressableProps = Omit<
  PressableProps,
  'onPress' | 'onPressIn' | 'onPressOut' | 'style'
> & {
  feedback?: KidPressFeedback;
  onPress: NonNullable<PressableProps['onPress']>;
  onPressIn?: PressableProps['onPressIn'];
  onPressOut?: PressableProps['onPressOut'];
  playSound?: boolean;
  reducedMotion: boolean;
  style?: StyleProp<ViewStyle>;
  throttleMs?: number;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const DEFAULT_THROTTLE_MS = 350;

const feedbackScale: Record<KidPressFeedback, number> = {
  card: 0.98,
  soft: 0.99,
  standard: 0.97,
};

const feedbackTranslateY: Record<KidPressFeedback, number> = {
  card: 2,
  soft: 1,
  standard: 2,
};

export function KidPressable({
  disabled = false,
  feedback = 'standard',
  onPress,
  onPressIn,
  onPressOut,
  playSound = false,
  reducedMotion,
  style,
  throttleMs = DEFAULT_THROTTLE_MS,
  ...pressableProps
}: KidPressableProps) {
  const pressProgress = useRef(new Animated.Value(0)).current;
  const lastAcceptedPressAtRef = useRef(0);

  const animatedFeedbackStyle = useMemo(() => {
    const opacity = pressProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.9],
    });

    if (reducedMotion) {
      return { opacity };
    }

    return {
      opacity,
      transform: [
        {
          translateY: pressProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, feedbackTranslateY[feedback]],
          }),
        },
        {
          scale: pressProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [1, feedbackScale[feedback]],
          }),
        },
      ],
    };
  }, [feedback, pressProgress, reducedMotion]);

  const animateTo = useCallback(
    (toValue: 0 | 1) => {
      pressProgress.stopAnimation();

      if (reducedMotion) {
        pressProgress.setValue(toValue);
        return;
      }

      Animated.timing(pressProgress, {
        duration: toValue === 1 ? 70 : 150,
        easing:
          toValue === 1
            ? Easing.out(Easing.quad)
            : Easing.out(Easing.back(1.3)),
        toValue,
        useNativeDriver: true,
      }).start();
    },
    [pressProgress, reducedMotion],
  );

  useEffect(() => {
    return () => pressProgress.stopAnimation();
  }, [pressProgress]);

  const handlePressIn: NonNullable<PressableProps['onPressIn']> = event => {
    animateTo(1);
    onPressIn?.(event);
  };

  const handlePressOut: NonNullable<PressableProps['onPressOut']> = event => {
    animateTo(0);
    onPressOut?.(event);
  };

  const handlePress: NonNullable<PressableProps['onPress']> = event => {
    const now = Date.now();
    if (now - lastAcceptedPressAtRef.current < throttleMs) {
      return;
    }
    lastAcceptedPressAtRef.current = now;

    if (playSound) {
      playTapSound().catch(() => undefined);
    }
    onPress(event);
  };

  return (
    <AnimatedPressable
      {...pressableProps}
      disabled={disabled}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedFeedbackStyle]}
    />
  );
}
