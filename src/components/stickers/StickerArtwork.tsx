import React from 'react';
import { Image, Text, View } from 'react-native';

import { MascotImage } from '../mascot';
import { SKidsIcon } from '../SKidsIcon';
import { colors, createThemedStyles, useThemeSync } from '../../theme/colors';
import { radius } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import type { StickerVisual } from '../../types/sticker';

export type StickerArtworkSize = 'card' | 'modal' | 'playground' | 'tray';

type StickerArtworkProps = {
  item: StickerVisual;
  size: StickerArtworkSize;
};

const sizeConfig = {
  card: {
    asset: 112,
    frame: 104,
    icon: 30,
    lessonFrame: 92,
    mascot: 64,
  },
  modal: {
    asset: 196,
    frame: 184,
    icon: 40,
    lessonFrame: 164,
    mascot: 112,
  },
  playground: {
    asset: 104,
    frame: 92,
    icon: 28,
    lessonFrame: 86,
    mascot: 60,
  },
  tray: {
    asset: 76,
    frame: 68,
    icon: 22,
    lessonFrame: 64,
    mascot: 44,
  },
} as const;

export function StickerArtwork({ item, size }: StickerArtworkProps) {
  useThemeSync();
  const config = sizeConfig[size];
  const lockBadgeSize = size === 'modal' ? 42 : 28;

  if (item.stickerImageSource) {
    return (
      <View
        style={[
          styles.assetFrame,
          { height: config.frame, width: config.frame },
        ]}
      >
        <Image
          accessibilityIgnoresInvertColors
          blurRadius={item.isUnlocked ? 0 : 3}
          resizeMode="contain"
          source={item.stickerImageSource}
          style={[
            { height: config.asset, width: config.asset },
            !item.isUnlocked && styles.lockedArtwork,
          ]}
        />
        {!item.isUnlocked ? (
          <View
            style={[
              styles.lockBadge,
              { height: lockBadgeSize, width: lockBadgeSize },
            ]}
          >
            <Text style={styles.lockBadgeText}>?</Text>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.lessonFrame,
        getToneStyle(item.tone),
        {
          height: config.lessonFrame,
          width: config.lessonFrame,
        },
        !item.isUnlocked && styles.lockedFrame,
      ]}
    >
      <MascotImage
        decorative
        imageStyle={!item.isUnlocked && styles.lockedArtwork}
        pose={item.pose}
        size={config.mascot}
      />
      <View
        style={[
          styles.iconBadge,
          {
            height: config.icon + 12,
            width: config.icon + 12,
          },
        ]}
      >
        <SKidsIcon
          name={item.iconName}
          size={config.icon}
          style={!item.isUnlocked && styles.lockedArtwork}
        />
      </View>
      {!item.isUnlocked ? (
        <View
          style={[
            styles.lockBadge,
            { height: lockBadgeSize, width: lockBadgeSize },
          ]}
        >
          <Text style={styles.lockBadgeText}>?</Text>
        </View>
      ) : null}
    </View>
  );
}

function getToneStyle(tone: StickerVisual['tone']) {
  switch (tone) {
    case 'coral':
      return styles.coral;
    case 'sky':
      return styles.sky;
    case 'teal':
      return styles.teal;
    case 'sun':
    default:
      return styles.sun;
  }
}

const styles = createThemedStyles(() => ({
  assetFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  coral: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  iconBadge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 2,
    bottom: -4,
    justifyContent: 'center',
    position: 'absolute',
    right: -4,
    ...shadows.soft,
  },
  lessonFrame: {
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 2,
    justifyContent: 'center',
    position: 'relative',
  },
  lockBadge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 2,
    justifyContent: 'center',
    position: 'absolute',
    right: -4,
    top: -4,
  },
  lockBadgeText: {
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: '900',
  },
  lockedArtwork: {
    opacity: 0.4,
  },
  lockedFrame: {
    backgroundColor: colors.surface,
  },
  sky: {
    backgroundColor: colors.backgroundCool,
    borderColor: colors.sky,
  },
  sun: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
  },
  teal: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
}));
