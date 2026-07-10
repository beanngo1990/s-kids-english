import React, { useEffect, useRef, useState } from 'react';
import {
  StyleProp,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';

import { colors, createThemedStyles, useThemeSync } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { typography } from '../../theme/typography';
import type { MascotPoseId } from '../../data/mascot';
import { MascotImage, type MascotImageSize } from './MascotImage';

export type MascotSpeechBubbleTone =
  | 'guide'
  | 'hint'
  | 'success'
  | 'tryAgain';

type MascotPosition = 'left' | 'right';

type MascotSpeechBubbleProps = {
  bubbleStyle?: StyleProp<ViewStyle>;
  mascotAccessibilityLabel?: string;
  mascotPosition?: MascotPosition;
  mascotPressCooldownMs?: number;
  mascotSize?: MascotImageSize;
  message: string;
  onMascotPress?: (message: string) => void;
  pose?: MascotPoseId;
  style?: StyleProp<ViewStyle>;
  tapMessages?: readonly string[];
  textStyle?: StyleProp<TextStyle>;
  title?: string;
  tone?: MascotSpeechBubbleTone;
};

const poseByTone: Record<MascotSpeechBubbleTone, MascotPoseId> = {
  guide: 'hello',
  hint: 'hint',
  success: 'greatJob',
  tryAgain: 'tryAgain',
};

export function MascotSpeechBubble({
  bubbleStyle,
  mascotAccessibilityLabel,
  mascotPosition = 'left',
  mascotPressCooldownMs,
  mascotSize = 'sm',
  message,
  onMascotPress,
  pose,
  style,
  tapMessages = [],
  textStyle,
  title,
  tone = 'guide',
}: MascotSpeechBubbleProps) {
  useThemeSync();
  const activePose = pose ?? poseByTone[tone];
  const isMascotOnRight = mascotPosition === 'right';
  const [displayMessage, setDisplayMessage] = useState(message);
  const nextTapMessageIndexRef = useRef(0);

  useEffect(() => {
    setDisplayMessage(message);
    nextTapMessageIndexRef.current = 0;
  }, [message]);

  const handleMascotPress = () => {
    let nextDisplayedMessage = displayMessage;

    if (tapMessages.length > 0) {
      nextDisplayedMessage = tapMessages[nextTapMessageIndexRef.current];
      nextTapMessageIndexRef.current =
        (nextTapMessageIndexRef.current + 1) % tapMessages.length;
      setDisplayMessage(nextDisplayedMessage);
    }

    onMascotPress?.(nextDisplayedMessage);
  };

  return (
    <View
      accessibilityLabel={
        title ? `${title}. ${displayMessage}` : displayMessage
      }
      style={[
        styles.root,
        isMascotOnRight && styles.rootReversed,
        style,
      ]}
    >
      <MascotImage
        accessibilityLabel={mascotAccessibilityLabel ?? 'Chạm vào Sungy'}
        decorative={!onMascotPress && tapMessages.length === 0}
        onPress={
          onMascotPress || tapMessages.length > 0
            ? handleMascotPress
            : undefined
        }
        pose={activePose}
        pressCooldownMs={mascotPressCooldownMs}
        size={mascotSize}
        style={styles.mascot}
      />
      <View style={[styles.bubble, styles[tone], bubbleStyle]}>
        <View
          pointerEvents="none"
          style={[
            styles.tail,
            styles[`${tone}Tail`],
            isMascotOnRight ? styles.tailRight : styles.tailLeft,
          ]}
        />
        {title ? <Text style={styles.title}>{title}</Text> : null}
        <Text style={[styles.message, textStyle]}>{displayMessage}</Text>
      </View>
    </View>
  );
}

const styles = createThemedStyles(() => ({
  bubble: {
    borderRadius: radius.lg,
    borderWidth: 2,
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    position: 'relative',
    ...shadows.soft,
  },
  guide: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
  },
  guideTail: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
  },
  hint: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  hintTail: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  mascot: {
    flexShrink: 0,
  },
  message: {
    color: colors.text,
    flexShrink: 1,
    ...typography.body,
  },
  root: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rootReversed: {
    flexDirection: 'row-reverse',
  },
  success: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
  },
  successTail: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
  },
  tail: {
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    height: 18,
    position: 'absolute',
    top: '50%',
    transform: [{ rotate: '45deg' }],
    width: 18,
    zIndex: -1,
  },
  tailLeft: {
    left: -9,
  },
  tailRight: {
    right: -9,
  },
  title: {
    color: colors.primaryDark,
    ...typography.caption,
  },
  tryAgain: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  tryAgainTail: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
}));
