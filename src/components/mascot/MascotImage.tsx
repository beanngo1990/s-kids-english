import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  type ImageStyle,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

import { SparkleEffect } from '../SparkleEffect';
import {
  getMascotPose,
  type MascotId,
  type MascotPoseId,
} from '../../data/mascot';
import { useI18n } from '../../i18n';

export type MascotImageSize = 'avatar' | 'sm' | 'md' | 'lg' | 'xl' | number;

type MascotImageProps = {
  accessibilityLabel?: string;
  decorative?: boolean;
  mascotId?: MascotId;
  onPress?: () => void;
  pose?: MascotPoseId;
  pressCooldownMs?: number;
  size?: MascotImageSize;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
};

const sizeByName: Record<Exclude<MascotImageSize, number>, number> = {
  avatar: 72,
  sm: 96,
  md: 132,
  lg: 180,
  xl: 240,
};

export function MascotImage({
  accessibilityLabel,
  decorative = false,
  imageStyle,
  mascotId = 'sungy',
  onPress,
  pose = 'hello',
  pressCooldownMs = 900,
  size = 'md',
  style,
}: MascotImageProps) {
  const t = useI18n();
  const mascotPose = getMascotPose(pose, mascotId);
  const bounce = useRef(new Animated.Value(1)).current;
  const sparkleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPressAtRef = useRef(0);
  const [sparklesActive, setSparklesActive] = useState(false);
  const targetHeight = typeof size === 'number' ? size : sizeByName[size];
  const dimensions = useMemo(() => {
    const resolvedSource = Image.resolveAssetSource(mascotPose.source);
    const aspectRatio =
      resolvedSource?.width && resolvedSource?.height
        ? resolvedSource.width / resolvedSource.height
        : 1;

    return {
      height: targetHeight,
      width: Math.round(targetHeight * aspectRatio),
    };
  }, [mascotPose.source, targetHeight]);

  useEffect(() => {
    return () => {
      if (sparkleTimerRef.current) {
        clearTimeout(sparkleTimerRef.current);
      }
    };
  }, []);

  const runInteraction = () => {
    const now = Date.now();
    if (now - lastPressAtRef.current < pressCooldownMs) {
      return;
    }

    lastPressAtRef.current = now;
    setSparklesActive(false);
    bounce.stopAnimation();
    bounce.setValue(1);

    Animated.sequence([
      Animated.timing(bounce, {
        duration: 120,
        easing: Easing.out(Easing.quad),
        toValue: 1.09,
        useNativeDriver: true,
      }),
      Animated.spring(bounce, {
        friction: 3.5,
        tension: 160,
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    requestAnimationFrame(() => {
      setSparklesActive(true);
    });

    if (sparkleTimerRef.current) {
      clearTimeout(sparkleTimerRef.current);
    }
    sparkleTimerRef.current = setTimeout(() => {
      setSparklesActive(false);
    }, 760);

    onPress?.();
  };

  const imageContent = (
    <Animated.View
      style={[
        styles.animatedFrame,
        {
          transform: [{ scale: bounce }],
        },
      ]}
    >
      <Image
        accessibilityIgnoresInvertColors
        accessibilityLabel={
          decorative || onPress
            ? undefined
            : accessibilityLabel ?? t('mascot.name')
        }
        accessible={!decorative && !onPress}
        resizeMode="contain"
        source={mascotPose.source}
        style={[styles.image, imageStyle]}
      />
      <SparkleEffect active={sparklesActive} />
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityLabel={accessibilityLabel ?? t('mascot.touchAccessibility')}
        accessibilityRole="button"
        onPress={runInteraction}
        style={[styles.frame, dimensions, style]}
      >
        {imageContent}
      </Pressable>
    );
  }

  return (
    <View style={[styles.frame, dimensions, style]}>
      {imageContent}
    </View>
  );
}

const styles = StyleSheet.create({
  animatedFrame: {
    height: '100%',
    position: 'relative',
    width: '100%',
  },
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    position: 'relative',
  },
  image: {
    height: '100%',
    width: '100%',
  },
});
