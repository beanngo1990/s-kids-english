import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';

import { colors, createThemedStyles, useThemeSync } from '../theme/colors';

type SparkleEffectProps = {
  active: boolean;
};

const sparkles = [
  { left: '18%', top: '48%', x: -14, y: -30, delay: 0 },
  { left: '36%', top: '32%', x: -6, y: -38, delay: 40 },
  { left: '50%', top: '42%', x: 4, y: -34, delay: 75 },
  { left: '66%', top: '30%', x: 12, y: -42, delay: 110 },
  { left: '80%', top: '50%', x: 18, y: -32, delay: 145 },
] as const;

export function SparkleEffect({ active }: SparkleEffectProps) {
  useThemeSync();
  const progressValues = useRef(
    sparkles.map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    if (!active) {
      progressValues.forEach(progress => progress.setValue(0));
      return;
    }

    const animations = progressValues.map((progress, index) => {
      progress.stopAnimation();
      progress.setValue(0);

      return Animated.timing(progress, {
        delay: sparkles[index].delay,
        duration: 650,
        easing: Easing.out(Easing.quad),
        toValue: 1,
        useNativeDriver: true,
      });
    });

    Animated.parallel(animations).start();
  }, [active, progressValues]);

  if (!active) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.container}>
      {sparkles.map((sparkle, index) => {
        const progress = progressValues[index];
        const opacity = progress.interpolate({
          inputRange: [0, 0.15, 0.78, 1],
          outputRange: [0, 1, 1, 0],
        });
        const translateX = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, sparkle.x],
        });
        const translateY = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, sparkle.y],
        });
        const scale = progress.interpolate({
          inputRange: [0, 0.3, 1],
          outputRange: [0.4, 1, 0.78],
        });

        return (
          <Animated.View
            key={`${sparkle.left}-${index}`}
            style={[
              styles.sparkle,
              {
                left: sparkle.left,
                opacity,
                top: sparkle.top,
                transform: [{ translateX }, { translateY }, { scale }],
              },
            ]}
          >
            <Text style={styles.star}>★</Text>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = createThemedStyles(() => ({
  container: {
    bottom: 0,
    left: 0,
    overflow: 'visible',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  sparkle: {
    position: 'absolute',
  },
  star: {
    color: colors.secondary,
    fontSize: 18,
    fontWeight: '900',
    textShadowColor: colors.white,
    textShadowOffset: {
      height: 1,
      width: 0,
    },
    textShadowRadius: 2,
  },
}));
