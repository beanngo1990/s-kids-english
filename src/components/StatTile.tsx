import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from './AppCard';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type StatTileProps = {
  label: string;
  value: number | string;
  icon?: string;
};

export function StatTile({ icon, label, value }: StatTileProps) {
  return (
    <AppCard style={styles.tile}>
      <View style={styles.topRow}>
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <Text style={styles.value}>{value}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 24,
    lineHeight: 28,
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
});
