import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { LessonCard } from '../components/LessonCard';
import { Screen } from '../components/Screen';
import { lessons } from '../data/lessons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonList'>;

export function LessonListScreen({ navigation }: Props) {
  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Hôm nay học gì?</Text>
        <Text style={styles.title}>Chọn bài học</Text>
      </View>

      <View style={styles.list}>
        {lessons.map(lesson => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            onPress={() =>
              navigation.navigate('ScenePlayer', { lessonId: lesson.id })
            }
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: colors.primaryDark,
    ...typography.caption,
    textTransform: 'uppercase',
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  list: {
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    ...typography.title,
  },
});
