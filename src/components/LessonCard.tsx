import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppCard } from './AppCard';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Lesson } from '../types/lesson';

type LessonCardProps = {
  lesson: Lesson;
  onPress: () => void;
};

export function LessonCard({ lesson, onPress }: LessonCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      <AppCard style={styles.card}>
        <View style={styles.topRow}>
          <Text style={styles.badge}>{lesson.ageRange.label}</Text>
          <Text style={styles.duration}>
            {lesson.scenes.length} mini-scene
          </Text>
        </View>

        <Text style={styles.title}>{lesson.titleVi}</Text>
        <Text style={styles.subtitle}>{lesson.descriptionVi}</Text>
        <Text style={styles.meta}>{lesson.titleEn}</Text>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.secondary,
    borderRadius: radius.pill,
    color: colors.text,
    overflow: 'hidden',
    ...typography.caption,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  card: {
    gap: spacing.sm,
  },
  duration: {
    color: colors.muted,
    ...typography.caption,
  },
  meta: {
    color: colors.primaryDark,
    marginTop: spacing.xs,
    ...typography.caption,
  },
  pressable: {
    borderRadius: radius.xl,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  subtitle: {
    color: colors.textSoft,
    ...typography.body,
  },
  title: {
    color: colors.text,
    ...typography.subtitle,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
