import React from 'react';
import { Image, type ImageSourcePropType, Text, View } from 'react-native';

import { AppCard } from './AppCard';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type StatTileProps = {
  label: string;
  value: number | string;
  icon?: string;
  image?: ImageSourcePropType;
};

export function StatTile({ icon, image, label, value }: StatTileProps) {
  useThemeSync();
  return (
    <AppCard style={styles.tile}>
      <View style={styles.topRow}>
        {image ? (
          <Image source={image} style={styles.imageIcon} />
        ) : icon ? (
          <Text style={styles.icon}>{icon}</Text>
        ) : null}
        <Text style={styles.value}>{value}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </AppCard>
  );
}

const styles = createThemedStyles(() => ({
  icon: {
    fontSize: 24,
    lineHeight: 28,
    color: colors.primaryDark,
  },
  imageIcon: {
    height: 32,
    width: 32,
    resizeMode: 'contain',
  },
  label: {
    color: colors.muted,
    ...typography.caption,
  },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    gap: spacing.xs,
    minHeight: 104,
    padding: spacing.md,
  },
  value: {
    color: colors.text,
    ...typography.title,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
}));
