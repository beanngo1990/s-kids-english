import React, { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { KidBadge } from '../components/KidBadge';
import { Screen } from '../components/Screen';
import { SKidsIcon } from '../components/SKidsIcon';
import { lessons } from '../data/lessons';
import { lessonRewards } from '../data/rewards';
import { getProgress, type LocalProgress } from '../engine/ProgressManager';
import { getLocalizedLessonTitle } from '../i18n/domainCopy';
import { useI18n, useSavedAppLanguage } from '../i18n';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'StickerCollection'>;

export function StickerCollectionScreen({ navigation, route }: Props) {
  useThemeSync();
  const t = useI18n();
  const appLanguage = useSavedAppLanguage();
  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const highlightedStickerId = route.params?.highlightedStickerId;

  useEffect(() => {
    let isMounted = true;

    getProgress()
      .then(nextProgress => {
        if (isMounted) {
          setProgress(nextProgress);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProgress(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const earnedStickerIds = useMemo(
    () => new Set(progress?.earnedStickerIds ?? []),
    [progress?.earnedStickerIds],
  );

  const collectionItems = useMemo(
    () =>
      lessonRewards.map(reward => ({
        isHighlighted: highlightedStickerId === reward.stickerId,
        isUnlocked: earnedStickerIds.has(reward.stickerId),
        lesson: lessons.find(item => item.id === reward.lessonId),
        reward,
      })),
    [earnedStickerIds, highlightedStickerId],
  );
  const unlockedCount = collectionItems.filter(item => item.isUnlocked).length;
  const totalCount = collectionItems.length;
  const progressPercent =
    totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <SKidsIcon name="sticker" size={64} />
          </View>
          <KidBadge tone="sun">{t('stickerCollection.badge')}</KidBadge>
          <Text style={styles.title}>{t('stickerCollection.title')}</Text>
          <Text style={styles.subtitle}>
            {t('stickerCollection.subtitle')}
          </Text>
          <View style={styles.progressBlock}>
            <View style={styles.progressTopRow}>
              <Text style={styles.progressLabel}>
                {t('stickerCollection.progress', {
                  earned: String(unlockedCount),
                  total: String(totalCount),
                })}
              </Text>
              <Text style={styles.progressPercent}>{progressPercent}%</Text>
            </View>
            <View
              accessibilityLabel={t('stickerCollection.progressAccessibility', {
                earned: String(unlockedCount),
                total: String(totalCount),
              })}
              accessibilityRole="progressbar"
              style={styles.progressTrack}
            >
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercent}%` },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.grid}>
          {collectionItems.map(({ isHighlighted, isUnlocked, lesson, reward }) => (
            <View
              key={reward.id}
              accessibilityLabel={
                isUnlocked
                  ? t('stickerCollection.unlockedAccessibility', {
                      stickerName: reward.stickerName,
                    })
                  : t('stickerCollection.lockedAccessibility', {
                      lessonTitle: lesson
                        ? getLocalizedLessonTitle(lesson, appLanguage)
                        : reward.stickerName,
                    })
              }
              style={[
                styles.stickerCard,
                !isUnlocked && styles.stickerCardLocked,
                isHighlighted && styles.stickerCardHighlighted,
              ]}
            >
              <View
                style={[
                  styles.stickerIconFrame,
                  !isUnlocked && styles.stickerIconFrameLocked,
                ]}
              >
                <SKidsIcon
                  name="sticker"
                  size={58}
                  style={!isUnlocked && styles.lockedStickerIcon}
                />
                {!isUnlocked ? (
                  <View style={styles.lockBadge}>
                    <Text style={styles.lockBadgeText}>?</Text>
                  </View>
                ) : null}
              </View>
              <Text
                numberOfLines={2}
                style={[styles.stickerName, !isUnlocked && styles.lockedText]}
              >
                {isUnlocked
                  ? reward.stickerName
                  : t('stickerCollection.lockedSticker')}
              </Text>
              <Text numberOfLines={2} style={styles.lessonTitle}>
                {lesson
                  ? getLocalizedLessonTitle(lesson, appLanguage)
                  : reward.stickerName}
              </Text>
              <KidBadge tone={isUnlocked ? 'teal' : 'sky'}>
                {isUnlocked
                  ? t('stickerCollection.unlocked')
                  : t('stickerCollection.locked')}
              </KidBadge>
            </View>
          ))}
        </View>

        <AppButton
          title={t('stickerCollection.keepLearning')}
          onPress={() => navigation.navigate('Home')}
        />
      </View>
    </Screen>
  );
}

const styles = createThemedStyles(() => ({
  container: {
    gap: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  hero: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 2,
    gap: spacing.sm,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadows.soft,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 104,
    justifyContent: 'center',
    width: 104,
  },
  lessonTitle: {
    color: colors.textSoft,
    textAlign: 'center',
    ...typography.caption,
  },
  lockBadge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    right: -4,
    top: -4,
    width: 30,
  },
  lockBadgeText: {
    color: colors.primaryDark,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 21,
  },
  lockedStickerIcon: {
    opacity: 0.42,
  },
  lockedText: {
    color: colors.textSoft,
  },
  progressBlock: {
    alignSelf: 'stretch',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  progressFill: {
    backgroundColor: colors.secondary,
    borderRadius: radius.pill,
    height: '100%',
  },
  progressLabel: {
    color: colors.text,
    ...typography.caption,
  },
  progressPercent: {
    color: colors.primaryDark,
    ...typography.caption,
  },
  progressTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressTrack: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    height: 12,
    overflow: 'hidden',
  },
  stickerCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 2,
    flexBasis: '47%',
    flexGrow: 1,
    gap: spacing.sm,
    justifyContent: 'space-between',
    minHeight: 210,
    padding: spacing.md,
  },
  stickerCardHighlighted: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.secondary,
    ...shadows.warm,
  },
  stickerCardLocked: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
  },
  stickerIconFrame: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 92,
    justifyContent: 'center',
    position: 'relative',
    width: 92,
  },
  stickerIconFrameLocked: {
    backgroundColor: colors.surface,
  },
  stickerName: {
    color: colors.text,
    textAlign: 'center',
    ...typography.body,
  },
  subtitle: {
    color: colors.textSoft,
    textAlign: 'center',
    ...typography.body,
  },
  title: {
    color: colors.text,
    textAlign: 'center',
    ...typography.title,
  },
}));
