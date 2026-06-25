import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { AppLogo } from '../components/AppLogo';
import { Screen } from '../components/Screen';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.hero}>
          <AppLogo />
          <Text style={styles.title}>S-Kids English</Text>
          <Text style={styles.subtitle}>Học tiếng Anh vui mỗi ngày.</Text>
        </View>

        <View style={styles.actionPanel}>
          <AppButton
            title="Bắt đầu học"
            onPress={() => navigation.navigate('LessonList')}
          />
          <AppButton
            title="Góc phụ huynh"
            variant="secondary"
            onPress={() => navigation.navigate('Parent')}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actionPanel: {
    gap: spacing.md,
    width: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.xl,
  },
  subtitle: {
    color: colors.textSoft,
    maxWidth: 320,
    textAlign: 'center',
    ...typography.body,
  },
  title: {
    backgroundColor: colors.secondary,
    borderRadius: radius.lg,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    textAlign: 'center',
    ...typography.hero,
  },
});
