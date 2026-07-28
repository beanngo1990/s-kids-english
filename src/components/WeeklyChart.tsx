import React from 'react';
import { Text, View } from 'react-native';

import { AppCard } from './AppCard';
import { KidBadge } from './KidBadge';
import { useI18n } from '../i18n';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
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
  weeklyTarget?: number;
};

const CHART_HEIGHT = 100;

export function WeeklyChart({ data, weeklyTarget = 30 }: WeeklyChartProps) {
  useThemeSync();
  const t = useI18n();
  const maxWords = Math.max(...data.map(d => d.wordsLearned), 1);
  const todayDate = new Date();
  const todayStr = `${todayDate.getFullYear()}-${String(
    todayDate.getMonth() + 1,
  ).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
  const totalWords = data.reduce((sum, d) => sum + d.wordsLearned, 0);
  const target = Math.max(weeklyTarget, 1);
  const remainingWords = Math.max(target - totalWords, 0);
  const progressPercent = Math.min(
    Math.round((totalWords / target) * 100),
    100,
  );
  const activeDayCount = data.filter(
    day => day.wordsLearned > 0 || day.scenesCompleted > 0,
  ).length;
  const insight =
    totalWords >= target
      ? t('weeklyChart.goalReached')
      : totalWords > 0
      ? t('weeklyChart.wordsRemaining', { remaining: String(remainingWords) })
      : t('weeklyChart.startJourney');

  return (
    <AppCard style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <KidBadge tone="sky">{t('weeklyChart.last7Days')}</KidBadge>
          <Text style={styles.totalText}>
            {t('weeklyChart.words', { total: String(totalWords), target: String(target) })}
          </Text>
        </View>
        <View style={styles.progressSummary}>
          <Text style={styles.progressPercent}>{progressPercent}%</Text>
          <Text style={styles.progressSummaryLabel}>{t('weeklyChart.goal')}</Text>
        </View>
      </View>

      <View
        accessibilityLabel={t('weeklyChart.accessibility', { percent: String(progressPercent) })}
        accessibilityRole="progressbar"
        style={styles.goalTrack}
      >
        {progressPercent > 0 ? (
          <View style={[styles.goalFill, { width: `${progressPercent}%` }]} />
        ) : null}
      </View>

      <View style={styles.chartContainer}>
        {data.map(day => {
          const hasWordActivity = day.wordsLearned > 0;
          const hasActivity = hasWordActivity || day.scenesCompleted > 0;
          const barHeight = hasWordActivity
            ? Math.max(8, (day.wordsLearned / maxWords) * CHART_HEIGHT)
            : hasActivity
            ? 8
            : 4;
          const isToday = day.date === todayStr;

          return (
            <View key={day.date} style={styles.column}>
              {hasWordActivity && (
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
              <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                {t(`weeklyChart.day.${day.label}` as any)}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.insightRow}>
        <View style={styles.insightDot} />
        <Text style={styles.insightText}>{insight}</Text>
      </View>
      {activeDayCount > 0 ? (
        <Text style={styles.activeDaysText}>
          {t('weeklyChart.activeDays', { active: String(activeDayCount) })}
        </Text>
      ) : null}
    </AppCard>
  );
}

const styles = createThemedStyles(() => ({
  card: {
    borderColor: colors.border,
    borderWidth: 1,
    gap: spacing.md,
  },
  activeDaysText: {
    color: colors.muted,
    ...typography.caption,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  goalFill: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: '100%',
  },
  goalTrack: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 10,
    overflow: 'hidden',
  },
  insightDot: {
    backgroundColor: colors.secondary,
    borderRadius: radius.pill,
    height: 10,
    marginTop: 4,
    width: 10,
  },
  insightRow: {
    alignItems: 'flex-start',
    backgroundColor: colors.backgroundWarm,
    borderColor: colors.borderWarm,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  insightText: {
    color: colors.text,
    flex: 1,
    ...typography.caption,
  },
  totalText: {
    color: colors.primaryDark,
    ...typography.subtitle,
  },
  progressPercent: {
    color: colors.primaryDark,
    ...typography.subtitle,
  },
  progressSummary: {
    alignItems: 'flex-end',
    gap: spacing.xxs,
  },
  progressSummaryLabel: {
    color: colors.textSoft,
    ...typography.caption,
  },
  chartContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: CHART_HEIGHT + 48,
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
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
    minWidth: 18,
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
}));
