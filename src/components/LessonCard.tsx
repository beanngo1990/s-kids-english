import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppCard } from './AppCard';
import { KidBadge } from './KidBadge';
import { SKidsIcon } from './SKidsIcon';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Lesson } from '../types/lesson';
import { getLessonIconName } from '../utils/lessonIcons';

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
          <KidBadge tone="sun">{lesson.ageRange.label}</KidBadge>
          <Text style={styles.duration}>
            {lesson.scenes.length} mini-scene
          </Text>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.iconContainer}>
            <SKidsIcon name={getLessonIconName(lesson)} size={62} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{lesson.titleVi}</Text>
            <Text style={styles.subtitle}>{lesson.descriptionVi}</Text>
            <Text style={styles.meta}>{lesson.titleEn}</Text>
          </View>
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  duration: {
    color: colors.muted,
    ...typography.caption,
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 2,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  mainContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  meta: {
    color: colors.primaryDark,
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
  textContainer: {
    flex: 1,
    gap: spacing.xs,
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
