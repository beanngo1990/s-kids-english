import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { AppCard } from './AppCard';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type StatTileProps = {
  label: string;
  value: number | string;
};

export function StatTile({ label, value }: StatTileProps) {
  return (
    <AppCard style={styles.tile}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
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
});
