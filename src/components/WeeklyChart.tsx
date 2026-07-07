import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from './AppCard';
import { KidBadge } from './KidBadge';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type DayData = {
  label: string;
  date: string;
  wordsLearned: number;
  scenesCompleted: number;
};

type WeeklyChartProps = {
  data: DayData[];
};

const CHART_HEIGHT = 100;

export function WeeklyChart({ data }: WeeklyChartProps) {
  const maxWords = Math.max(...data.map(d => d.wordsLearned), 1);
  const todayDate = new Date();
  const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
  const totalWords = data.reduce((sum, d) => sum + d.wordsLearned, 0);

  return (
    <AppCard style={styles.card}>
      <View style={styles.headerRow}>
        <KidBadge tone="sky">Tuần này</KidBadge>
        <Text style={styles.totalText}>{totalWords} từ</Text>
      </View>
      <View style={styles.chartContainer}>
        {data.map(day => {
          const barHeight = day.wordsLearned > 0
            ? Math.max(8, (day.wordsLearned / maxWords) * CHART_HEIGHT)
            : 4;
          const isToday = day.date === todayStr;
          const hasActivity = day.wordsLearned > 0;

          return (
            <View key={day.date} style={styles.column}>
              {hasActivity && (
                <Text style={styles.barValue}>{day.wordsLearned}</Text>
              )}
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    { height: barHeight },
                    isToday && styles.barToday,
                    hasActivity && styles.barActive,
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.dayLabel,
                  isToday && styles.dayLabelToday,
                ]}
              >
                {day.label}
              </Text>
            </View>
          );
        })}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalText: {
    color: colors.primaryDark,
    ...typography.caption,
  },
  chartContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.xs,
    height: CHART_HEIGHT + 40,
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  column: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xxs,
    justifyContent: 'flex-end',
  },
  barTrack: {
    justifyContent: 'flex-end',
    height: CHART_HEIGHT,
  },
  bar: {
    backgroundColor: colors.border,
    borderRadius: radius.sm,
    minWidth: 20,
    width: '100%',
  },
  barActive: {
    backgroundColor: colors.primarySoft,
  },
  barToday: {
    backgroundColor: colors.primary,
  },
  barValue: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '800',
  },
  dayLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  dayLabelToday: {
    color: colors.primaryDark,
    fontWeight: '900',
  },
});
