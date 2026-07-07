import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppCard } from './AppCard';
import type { ChildProfile } from '../engine/ParentSettingsManager';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type ChildProfileCardProps = {
  profile: ChildProfile;
  onEditPress?: () => void;
};

export function ChildProfileCard({ profile, onEditPress }: ChildProfileCardProps) {
  const currentYear = new Date().getFullYear();
  const age = profile.birthYear
    ? currentYear - profile.birthYear
    : undefined;

  return (
    <AppCard style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatarContainer}>
          <Image source={require('../assets/mascot/sungy/sungy-avatar.png')} style={styles.avatarImage} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.name}>{profile.name}</Text>
          {age != null && age > 0 && (
            <Text style={styles.ageText}>{age} tuổi</Text>
          )}
        </View>
        {onEditPress && (
          <Pressable
            accessibilityLabel="Sửa hồ sơ bé"
            accessibilityRole="button"
            onPress={onEditPress}
            style={({ pressed }) => [
              styles.editButton,
              pressed && styles.editButtonPressed,
            ]}
          >
            <Text style={styles.editButtonText}>Sửa</Text>
          </Pressable>
        )}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceBlue,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  avatarContainer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    borderWidth: 3,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  avatarImage: {
    height: 48,
    width: 48,
    resizeMode: 'contain',
  },
  textContainer: {
    flex: 1,
    gap: spacing.xxs,
  },
  name: {
    color: colors.text,
    ...typography.subtitle,
  },
  ageText: {
    color: colors.muted,
    ...typography.caption,
  },
  editButton: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  editButtonPressed: {
    opacity: 0.8,
  },
  editButtonText: {
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 13,
  },
});
