import React, { useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  type ImageSourcePropType,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { SKidsIconName } from '../assets/icons/skids';
import { achievementStickerAssets } from '../assets/stickers/achievements';
import { AppButton } from '../components/AppButton';
import { KidBadge } from '../components/KidBadge';
import { MascotImage } from '../components/mascot';
import { Screen } from '../components/Screen';
import { SKidsIcon } from '../components/SKidsIcon';
import {
  achievementRewards,
  getAchievementProgress,
  type AchievementCategory,
  type AchievementReward,
} from '../data/achievementRewards';
import { lessons } from '../data/lessons';
import type { MascotPoseId } from '../data/mascot';
import {
  lessonRewards,
  type StickerArtDirection,
  type StickerArtMotif,
  type StickerArtTone,
} from '../data/rewards';
import { playCompleteSound, playTapSound } from '../engine/AudioManager';
import {
  getActivityLog,
  type ActivityLog,
} from '../engine/DailyActivityTracker';
import {
  getProgress,
  saveEarnedAchievementRecords,
  type EarnedAchievementRecord,
  type LocalProgress,
} from '../engine/ProgressManager';
import { getLocalizedLessonTitle } from '../i18n/domainCopy';
import { useI18n, useSavedAppLanguage, type Translator } from '../i18n';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import type { RootStackParamList } from '../types/navigation';
import {
  getAchievementStats,
  isAchievementStickerEarned,
} from '../utils/stickerStats';

type Props = NativeStackScreenProps<RootStackParamList, 'StickerCollection'>;

type StickerDisplayItem = {
  art?: StickerArtDirection;
  cardTitle: string;
  category?: AchievementCategory;
  detailDescription: string;
  detailSubtitle: string;
  detailTitle: string;
  earnedText?: string;
  iconName: SKidsIconName;
  id: string;
  isHighlighted?: boolean;
  isUnlocked: boolean;
  pose: MascotPoseId;
  progressText?: string;
  requirementText: string;
  statusText: string;
  stickerImageSource?: ImageSourcePropType;
  tone: StickerArtTone;
};

export function StickerCollectionScreen({ navigation, route }: Props) {
  useThemeSync();
  const t = useI18n();
  const appLanguage = useSavedAppLanguage();
  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLog | null>(null);
  const [selectedSticker, setSelectedSticker] =
    useState<StickerDisplayItem | null>(null);
  const albumOpenAnim = React.useRef(new Animated.Value(0)).current;
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
    getActivityLog()
      .then(nextActivityLog => {
        if (isMounted) {
          setActivityLog(nextActivityLog);
        }
      })
      .catch(() => {
        if (isMounted) {
          setActivityLog(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    Animated.timing(albumOpenAnim, {
      duration: 780,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [albumOpenAnim]);

  const earnedStickerIds = useMemo(
    () => new Set(progress?.earnedStickerIds ?? []),
    [progress?.earnedStickerIds],
  );
  const earnedRecordByStickerId = useMemo(() => {
    const records = new Map(
      (progress?.earnedStickerRecords ?? []).map(record => [
        record.stickerId,
        record,
      ]),
    );

    return records;
  }, [progress?.earnedStickerRecords]);
  const earnedAchievementRecordById = useMemo(() => {
    const records = new Map(
      (progress?.earnedAchievementRecords ?? []).map(record => [
        record.achievementId,
        record,
      ]),
    );

    return records;
  }, [progress?.earnedAchievementRecords]);
  const earnedAchievementIds = useMemo(
    () => new Set(earnedAchievementRecordById.keys()),
    [earnedAchievementRecordById],
  );

  const collectionItems = useMemo(
    () =>
      lessonRewards.map(reward => ({
        isHighlighted: highlightedStickerId === reward.stickerId,
        isUnlocked: earnedStickerIds.has(reward.stickerId),
        lesson: lessons.find(item => item.id === reward.lessonId),
        record: earnedRecordByStickerId.get(reward.stickerId),
        reward,
      })),
    [earnedRecordByStickerId, earnedStickerIds, highlightedStickerId],
  );
  const achievementStats = useMemo(
    () => getAchievementStats(progress, activityLog),
    [activityLog, progress],
  );
  const achievementItems = useMemo(
    () =>
      achievementRewards.map(reward => {
        const current = getAchievementProgress(reward, achievementStats);
        const isUnlocked = isAchievementStickerEarned(
          reward,
          achievementStats,
          earnedAchievementIds,
        );

        return {
          current: Math.min(current, reward.target),
          isUnlocked,
          record: earnedAchievementRecordById.get(reward.id),
          reward,
        };
      }),
    [achievementStats, earnedAchievementIds, earnedAchievementRecordById],
  );
  const missingAchievementIds = useMemo(
    () =>
      achievementItems
        .filter(item => item.isUnlocked && !item.record)
        .map(item => item.reward.id)
        .join('|'),
    [achievementItems],
  );
  const unlockedLessonStickerCount = collectionItems.filter(
    item => item.isUnlocked,
  ).length;
  const unlockedAchievementCount = achievementItems.filter(
    item => item.isUnlocked,
  ).length;
  const unlockedCount = unlockedLessonStickerCount + unlockedAchievementCount;
  const totalCount = collectionItems.length + achievementItems.length;
  const progressPercent =
    totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
  const timelineItems = useMemo(() => {
    const lessonTimelineItems = collectionItems
      .filter(item => item.isUnlocked)
      .map(item => ({
        id: item.reward.id,
        earnedAt: item.record?.earnedAt,
        iconName: item.reward.iconName,
        title: item.reward.stickerName,
        tone: item.reward.tone,
      }));
    const achievementTimelineItems = achievementItems
      .filter(item => item.isUnlocked)
      .map(item => ({
        id: item.reward.id,
        earnedAt: item.record?.earnedAt,
        iconName: item.reward.iconName,
        title: getLocalizedAchievementTitle(item.reward, appLanguage),
        tone: item.reward.tone,
      }));

    return [...lessonTimelineItems, ...achievementTimelineItems].sort(
      (a, b) => {
        const aTime = a.earnedAt ? new Date(a.earnedAt).getTime() : 0;
        const bTime = b.earnedAt ? new Date(b.earnedAt).getTime() : 0;

        return bTime - aTime;
      },
    );
  }, [achievementItems, appLanguage, collectionItems]);
  const achievementSections = useMemo(
    () =>
      (['firstSteps', 'habits', 'bigGoals'] as AchievementCategory[]).map(
        category => ({
          category,
          title: getAchievementSectionTitle(category, t),
        }),
      ),
    [t],
  );
  const lessonStickerItems = useMemo<StickerDisplayItem[]>(
    () =>
      collectionItems.map(
        ({ isHighlighted, isUnlocked, lesson, record, reward }) => {
          const lessonTitle = lesson
            ? getLocalizedLessonTitle(lesson, appLanguage)
            : reward.stickerName;
          const earnedText = record?.earnedAt
            ? t('stickerCollection.earnedOn', {
                date: formatCollectionDate(record.earnedAt, appLanguage),
              })
            : t('stickerCollection.earnedLegacy');

          return {
            cardTitle: isUnlocked
              ? reward.stickerName
              : t('stickerCollection.lockedSticker'),
            detailDescription: t('stickerCollection.lessonMeaning', {
              lessonTitle,
            }),
            detailSubtitle: lessonTitle,
            detailTitle: isUnlocked
              ? reward.stickerName
              : t('stickerCollection.lockedSticker'),
            earnedText: isUnlocked ? earnedText : undefined,
            iconName: reward.iconName,
            id: reward.id,
            isHighlighted,
            isUnlocked,
            pose: 'avatar',
            requirementText: t('stickerCollection.lessonRequirement', {
              lessonTitle,
            }),
            statusText: isUnlocked
              ? t('stickerCollection.unlocked')
              : t('stickerCollection.locked'),
            tone: reward.tone,
          };
        },
      ),
    [appLanguage, collectionItems, t],
  );
  const achievementStickerItems = useMemo<StickerDisplayItem[]>(
    () =>
      achievementItems.map(({ current, isUnlocked, record, reward }) => {
        const progressText = t('stickerCollection.achievementProgress', {
          current: String(current),
          target: String(reward.target),
        });
        const earnedText = record?.earnedAt
          ? t('stickerCollection.earnedOn', {
              date: formatCollectionDate(record.earnedAt, appLanguage),
            })
          : t('stickerCollection.earnedPending');

        return {
          art: reward.art,
          cardTitle: getLocalizedAchievementTitle(reward, appLanguage),
          category: reward.category,
          detailDescription: getLocalizedAchievementDescription(
            reward,
            appLanguage,
          ),
          detailSubtitle: getAchievementSectionTitle(reward.category, t),
          detailTitle: getLocalizedAchievementTitle(reward, appLanguage),
          earnedText: isUnlocked ? earnedText : undefined,
          iconName: reward.iconName,
          id: reward.id,
          isUnlocked,
          pose: reward.art.mascotPose,
          progressText,
          requirementText: getAchievementRequirementText(reward, t),
          statusText: isUnlocked
            ? t('stickerCollection.unlocked')
            : progressText,
          stickerImageSource: achievementStickerAssets[reward.stickerAssetName],
          tone: reward.tone,
        };
      }),
    [achievementItems, appLanguage, t],
  );

  const openStickerDetail = (item: StickerDisplayItem) => {
    const playFeedback = item.isUnlocked ? playCompleteSound : playTapSound;

    playFeedback().catch(() => undefined);
    setSelectedSticker(item);
  };
  const closeStickerDetail = () => {
    setSelectedSticker(null);
  };

  useEffect(() => {
    if (!progress || !activityLog || !missingAchievementIds) {
      return;
    }

    let isMounted = true;
    const earnedAt = new Date().toISOString();
    const records: EarnedAchievementRecord[] = achievementItems
      .filter(item => item.isUnlocked && !item.record)
      .map(item => ({
        achievementId: item.reward.id,
        earnedAt,
        stickerId: item.reward.stickerId,
      }));

    saveEarnedAchievementRecords(records)
      .then(nextProgress => {
        if (isMounted) {
          setProgress(nextProgress);
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, [achievementItems, activityLog, missingAchievementIds, progress]);
  const coverTranslateY = albumOpenAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });
  const coverOpacity = albumOpenAnim.interpolate({
    inputRange: [0, 0.62, 1],
    outputRange: [1, 0.28, 0],
  });
  const pageScale = albumOpenAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1],
  });
  const pageTranslateY = albumOpenAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });

  return (
    <>
      <Screen scroll>
        <View style={styles.container}>
          <View style={styles.hero}>
            <View style={styles.albumStage}>
              <Animated.View
                style={[
                  styles.albumPages,
                  {
                    opacity: albumOpenAnim,
                    transform: [
                      { translateY: pageTranslateY },
                      { scale: pageScale },
                    ],
                  },
                ]}
              >
                <View style={styles.albumPageSticker}>
                  <MascotImage decorative pose="greatJob" size={64} />
                </View>
                <View style={styles.albumPageLines}>
                  <View style={styles.albumLineWide} />
                  <View style={styles.albumLineShort} />
                </View>
              </Animated.View>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.albumCover,
                  {
                    opacity: coverOpacity,
                    transform: [
                      { translateY: coverTranslateY },
                      { scale: pageScale },
                    ],
                  },
                ]}
              >
                <MascotImage decorative pose="avatar" size={58} />
                <Text style={styles.albumCoverText}>
                  {t('stickerCollection.albumCover')}
                </Text>
              </Animated.View>
            </View>
            <KidBadge tone="sun">{t('stickerCollection.badge')}</KidBadge>
            <Text style={styles.title}>{t('stickerCollection.title')}</Text>
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
                accessibilityLabel={t(
                  'stickerCollection.progressAccessibility',
                  {
                    earned: String(unlockedCount),
                    total: String(totalCount),
                  },
                )}
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

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>
              {t('stickerCollection.lessonStickerTitle')}
            </Text>
          </View>

          <View style={styles.grid}>
            {lessonStickerItems.map(item => (
              <Pressable
                key={item.id}
                accessibilityHint={t('stickerCollection.tapForDetails')}
                accessibilityLabel={
                  item.isUnlocked
                    ? t('stickerCollection.unlockedAccessibility', {
                        stickerName: item.detailTitle,
                      })
                    : t('stickerCollection.lockedStickerAccessibility', {
                        stickerName: item.detailTitle,
                      })
                }
                accessibilityRole="button"
                onPress={() => openStickerDetail(item)}
                style={({ pressed }) => [
                  styles.stickerCard,
                  !item.isUnlocked && styles.stickerCardLocked,
                  item.isHighlighted && styles.stickerCardHighlighted,
                  pressed && styles.stickerCardPressed,
                ]}
              >
                <StickerArtwork item={item} size="card" />
                <Text
                  numberOfLines={2}
                  style={[
                    styles.stickerName,
                    !item.isUnlocked && styles.lockedText,
                  ]}
                >
                  {item.cardTitle}
                </Text>
                <KidBadge
                  tone={item.isUnlocked ? 'teal' : 'sky'}
                  style={styles.cardBadge}
                >
                  {item.statusText}
                </KidBadge>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>
              {t('stickerCollection.timelineTitle')}
            </Text>
            <View style={styles.timelineList}>
              {timelineItems.length > 0 ? (
                timelineItems.map(item => (
                  <View key={item.id} style={styles.timelineItem}>
                    <View
                      style={[
                        styles.timelineIcon,
                        getStickerToneStyle(item.tone),
                      ]}
                    >
                      <MascotImage decorative pose="avatar" size={38} />
                      <View style={styles.timelineLessonBadge}>
                        <SKidsIcon name={item.iconName} size={18} />
                      </View>
                    </View>
                    <View style={styles.timelineCopy}>
                      <Text style={styles.timelineTitle}>{item.title}</Text>
                    </View>
                    <Text style={styles.timelineDate}>
                      {item.earnedAt
                        ? formatCollectionDate(item.earnedAt, appLanguage)
                        : t('stickerCollection.earnedLegacyShort')}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptySectionText}>
                  {t('stickerCollection.timelineEmpty')}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>
              {t('stickerCollection.achievementTitle')}
            </Text>
            {achievementSections.map(section => {
              const sectionItems = achievementStickerItems.filter(
                item => item.category === section.category,
              );

              return (
                <View key={section.category} style={styles.achievementSection}>
                  <Text style={styles.achievementCategoryTitle}>
                    {section.title}
                  </Text>
                  <View style={styles.achievementGrid}>
                    {sectionItems.map(item => (
                      <Pressable
                        key={item.id}
                        accessibilityHint={t('stickerCollection.tapForDetails')}
                        accessibilityLabel={
                          item.isUnlocked
                            ? t('stickerCollection.unlockedAccessibility', {
                                stickerName: item.detailTitle,
                              })
                            : t(
                                'stickerCollection.lockedStickerAccessibility',
                                {
                                  stickerName: item.detailTitle,
                                },
                              )
                        }
                        accessibilityRole="button"
                        onPress={() => openStickerDetail(item)}
                        style={({ pressed }) => [
                          styles.stickerCard,
                          !item.isUnlocked && styles.stickerCardLocked,
                          pressed && styles.stickerCardPressed,
                        ]}
                      >
                        <StickerArtwork item={item} size="card" />
                        <Text
                          numberOfLines={2}
                          style={[
                            styles.stickerName,
                            !item.isUnlocked && styles.lockedText,
                          ]}
                        >
                          {item.cardTitle}
                        </Text>
                        <KidBadge
                          tone={item.isUnlocked ? 'teal' : 'sky'}
                          style={styles.cardBadge}
                        >
                          {item.statusText}
                        </KidBadge>
                      </Pressable>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>

          <AppButton
            title={t('stickerCollection.keepLearning')}
            onPress={() => navigation.navigate('Home')}
          />
        </View>
      </Screen>
      <Modal
        animationType="fade"
        onRequestClose={closeStickerDetail}
        transparent
        visible={selectedSticker !== null}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityLabel={t('stickerCollection.closeDetail')}
            accessibilityRole="button"
            onPress={closeStickerDetail}
            style={styles.modalBackdrop}
          />
          <View style={styles.modalSheet}>
            {selectedSticker ? (
              <ScrollView
                contentContainerStyle={styles.modalContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.modalHandle} />
                <StickerArtwork item={selectedSticker} size="modal" />
                <KidBadge
                  tone={selectedSticker.isUnlocked ? 'teal' : 'sky'}
                  style={styles.modalBadge}
                >
                  {selectedSticker.statusText}
                </KidBadge>
                <Text style={styles.modalTitle}>
                  {selectedSticker.detailTitle}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {selectedSticker.detailSubtitle}
                </Text>
                <StickerDetailRow
                  label={t('stickerCollection.detailMeaning')}
                  value={selectedSticker.detailDescription}
                />
                <StickerDetailRow
                  label={t('stickerCollection.detailHowToUnlock')}
                  value={selectedSticker.requirementText}
                />
                {selectedSticker.progressText ? (
                  <StickerDetailRow
                    label={t('stickerCollection.detailProgress')}
                    value={selectedSticker.progressText}
                  />
                ) : null}
                {selectedSticker.earnedText ? (
                  <StickerDetailRow
                    label={t('stickerCollection.detailEarned')}
                    value={selectedSticker.earnedText}
                  />
                ) : null}
                <AppButton
                  title={t('stickerCollection.closeDetail')}
                  onPress={closeStickerDetail}
                  variant="secondary"
                />
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = createThemedStyles(() => ({
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  achievementCategoryTitle: {
    color: colors.primaryDark,
    ...typography.body,
  },
  achievementSection: {
    gap: spacing.sm,
  },
  albumCover: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
    borderRadius: radius.lg,
    borderWidth: 3,
    bottom: 0,
    gap: spacing.xs,
    justifyContent: 'center',
    left: 22,
    position: 'absolute',
    top: 0,
    width: 132,
    ...shadows.warm,
  },
  albumCoverText: {
    color: colors.text,
    textAlign: 'center',
    ...typography.caption,
  },
  albumLineShort: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    height: 7,
    width: 70,
  },
  albumLineWide: {
    backgroundColor: colors.borderWarm,
    borderRadius: radius.pill,
    height: 7,
    width: 94,
  },
  albumPageLines: {
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
  },
  albumPages: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderWarm,
    borderRadius: radius.lg,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 128,
    padding: spacing.md,
    width: 176,
  },
  albumPageSticker: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.secondary,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 74,
    justifyContent: 'center',
    width: 74,
  },
  albumStage: {
    alignItems: 'center',
    height: 132,
    justifyContent: 'center',
    position: 'relative',
    width: 192,
  },
  assetStickerCardFrame: {
    alignItems: 'center',
    height: 104,
    justifyContent: 'center',
    position: 'relative',
    width: 104,
  },
  assetStickerImage: {
    height: 112,
    width: 112,
  },
  assetStickerModalFrame: {
    alignItems: 'center',
    height: 184,
    justifyContent: 'center',
    position: 'relative',
    width: 184,
  },
  assetStickerModalImage: {
    height: 196,
    width: 196,
  },
  coralStickerArt: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  coralMotifGlow: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  container: {
    gap: spacing.lg,
  },
  emptySectionText: {
    color: colors.textSoft,
    ...typography.body,
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
  lessonIconBadge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 2,
    bottom: -4,
    height: 42,
    justifyContent: 'center',
    position: 'absolute',
    right: -4,
    width: 42,
    ...shadows.soft,
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
  lockedAssetStickerImage: {
    opacity: 0.36,
  },
  lockedMascotImage: {
    opacity: 0.42,
  },
  lockedMotifGlow: {
    opacity: 0.28,
  },
  lockedText: {
    color: colors.textSoft,
  },
  cardBadge: {
    alignSelf: 'center',
  },
  companionIconBadge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 2,
    bottom: 6,
    height: 30,
    justifyContent: 'center',
    left: -4,
    position: 'absolute',
    width: 30,
    ...shadows.soft,
  },
  detailLabel: {
    color: colors.primaryDark,
    ...typography.caption,
  },
  detailRow: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 2,
    gap: spacing.xxs,
    padding: spacing.md,
    width: '100%',
  },
  detailValue: {
    color: colors.text,
    ...typography.body,
  },
  modalBackdrop: {
    backgroundColor: 'rgba(37, 54, 66, 0.32)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  modalBadge: {
    alignSelf: 'center',
  },
  modalCompanionIconBadge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 2,
    bottom: 18,
    height: 42,
    justifyContent: 'center',
    left: 2,
    position: 'absolute',
    width: 42,
    ...shadows.soft,
  },
  modalContent: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  modalHandle: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    height: 5,
    width: 54,
  },
  modalLessonIconBadge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 3,
    bottom: 2,
    height: 58,
    justifyContent: 'center',
    position: 'absolute',
    right: -2,
    width: 58,
    ...shadows.soft,
  },
  modalLockBadge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
    width: 40,
  },
  modalLockBadgeText: {
    color: colors.primaryDark,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 26,
  },
  modalMilestoneBadge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.secondary,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 42,
    justifyContent: 'center',
    left: 2,
    paddingHorizontal: spacing.xs,
    position: 'absolute',
    top: 2,
    width: 50,
    ...shadows.soft,
  },
  modalMilestoneText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 18,
    textAlign: 'center',
  },
  modalMotifGlow: {
    height: 108,
    left: 22,
    top: 20,
    width: 108,
  },
  modalMotifRibbon: {
    backgroundColor: colors.white,
    borderColor: colors.borderWarm,
    borderRadius: radius.pill,
    borderWidth: 2,
    bottom: 20,
    height: 22,
    left: 24,
    opacity: 0.72,
    position: 'absolute',
    right: 24,
    transform: [{ rotate: '-5deg' }],
  },
  modalMotifSparkOne: {
    backgroundColor: colors.white,
    borderColor: colors.secondary,
    borderRadius: radius.sm,
    borderWidth: 2,
    height: 18,
    position: 'absolute',
    right: 22,
    top: 34,
    transform: [{ rotate: '45deg' }],
    width: 18,
  },
  modalMotifSparkTwo: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    borderWidth: 2,
    height: 12,
    left: 30,
    position: 'absolute',
    top: 58,
    transform: [{ rotate: '45deg' }],
    width: 12,
  },
  modalMotifTrail: {
    alignItems: 'center',
    bottom: 30,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    left: 30,
    position: 'absolute',
    right: 30,
    transform: [{ rotate: '-10deg' }],
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 2,
    maxHeight: '88%',
    overflow: 'hidden',
    ...shadows.soft,
  },
  modalStickerIconFrame: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 3,
    height: 150,
    justifyContent: 'center',
    position: 'relative',
    width: 150,
  },
  modalSubtitle: {
    color: colors.textSoft,
    textAlign: 'center',
    ...typography.body,
  },
  modalTitle: {
    color: colors.text,
    textAlign: 'center',
    ...typography.subtitle,
  },
  motifGlow: {
    borderRadius: radius.md,
    borderWidth: 2,
    height: 66,
    left: 13,
    opacity: 0.72,
    position: 'absolute',
    top: 13,
    transform: [{ rotate: '-12deg' }],
    width: 66,
  },
  motifRibbon: {
    backgroundColor: colors.white,
    borderColor: colors.borderWarm,
    borderRadius: radius.pill,
    borderWidth: 1,
    bottom: 10,
    height: 15,
    left: 14,
    opacity: 0.74,
    position: 'absolute',
    right: 14,
    transform: [{ rotate: '-5deg' }],
  },
  motifSparkOne: {
    backgroundColor: colors.white,
    borderColor: colors.secondary,
    borderRadius: radius.sm,
    borderWidth: 1,
    height: 12,
    position: 'absolute',
    right: 10,
    top: 18,
    transform: [{ rotate: '45deg' }],
    width: 12,
  },
  motifSparkTwo: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    borderWidth: 1,
    height: 8,
    left: 16,
    position: 'absolute',
    top: 34,
    transform: [{ rotate: '45deg' }],
    width: 8,
  },
  motifTrail: {
    alignItems: 'center',
    bottom: 18,
    flexDirection: 'row',
    gap: spacing.xxs,
    justifyContent: 'center',
    left: 18,
    position: 'absolute',
    right: 18,
    transform: [{ rotate: '-10deg' }],
  },
  motifTrailDot: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 7,
    width: 7,
  },
  milestoneBadge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.secondary,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 32,
    justifyContent: 'center',
    left: -6,
    paddingHorizontal: spacing.xxs,
    position: 'absolute',
    top: -5,
    width: 38,
    ...shadows.soft,
  },
  milestoneText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 15,
    textAlign: 'center',
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
  sectionBlock: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  skyStickerArt: {
    backgroundColor: colors.backgroundCool,
    borderColor: colors.sky,
  },
  skyMotifGlow: {
    backgroundColor: colors.backgroundCool,
    borderColor: colors.skyDeep,
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
    justifyContent: 'center',
    minHeight: 174,
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
  stickerCardPressed: {
    opacity: 0.9,
    transform: [{ translateY: 2 }, { scale: 0.99 }],
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
  stickerMascotImage: {
    transform: [{ translateY: 3 }],
  },
  stickerName: {
    color: colors.text,
    textAlign: 'center',
    ...typography.body,
  },
  sunStickerArt: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
  },
  sunMotifGlow: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.secondary,
  },
  tealStickerArt: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  tealMotifGlow: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  timelineCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  timelineDate: {
    color: colors.primaryDark,
    flexShrink: 0,
    ...typography.caption,
  },
  timelineIcon: {
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 54,
    justifyContent: 'center',
    position: 'relative',
    width: 54,
  },
  timelineItem: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  timelineList: {
    gap: spacing.sm,
  },
  timelineLessonBadge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 1,
    bottom: -3,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: -5,
    width: 24,
  },
  timelineTitle: {
    color: colors.text,
    ...typography.body,
  },
  title: {
    color: colors.text,
    textAlign: 'center',
    ...typography.title,
  },
}));

function StickerArtwork({
  item,
  size,
}: {
  item: StickerDisplayItem;
  size: 'card' | 'modal';
}) {
  const isModal = size === 'modal';
  const assetImageSource = item.stickerImageSource;
  const art = item.art;
  const mascotPose = art?.mascotPose ?? item.pose;
  const accentIconName = art?.accentIconName ?? item.iconName;

  if (assetImageSource) {
    return (
      <View
        style={
          isModal ? styles.assetStickerModalFrame : styles.assetStickerCardFrame
        }
      >
        <Image
          accessibilityIgnoresInvertColors
          blurRadius={item.isUnlocked ? 0 : 3}
          resizeMode="contain"
          source={assetImageSource}
          style={[
            isModal ? styles.assetStickerModalImage : styles.assetStickerImage,
            !item.isUnlocked && styles.lockedAssetStickerImage,
          ]}
        />
        {!item.isUnlocked ? (
          <View style={isModal ? styles.modalLockBadge : styles.lockBadge}>
            <Text
              style={isModal ? styles.modalLockBadgeText : styles.lockBadgeText}
            >
              ?
            </Text>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View
      style={[
        isModal ? styles.modalStickerIconFrame : styles.stickerIconFrame,
        getStickerToneStyle(item.tone),
        !item.isUnlocked && styles.stickerIconFrameLocked,
      ]}
    >
      {art ? (
        <StickerMotifDecoration
          art={art}
          isModal={isModal}
          isUnlocked={item.isUnlocked}
        />
      ) : null}
      <MascotImage
        decorative
        imageStyle={[
          styles.stickerMascotImage,
          !item.isUnlocked && styles.lockedMascotImage,
        ]}
        pose={mascotPose}
        size={isModal ? 112 : 64}
      />
      <View
        style={isModal ? styles.modalLessonIconBadge : styles.lessonIconBadge}
      >
        <SKidsIcon
          name={accentIconName}
          size={isModal ? 40 : 30}
          style={!item.isUnlocked && styles.lockedStickerIcon}
        />
      </View>
      {art?.companionIconName ? (
        <View
          style={
            isModal ? styles.modalCompanionIconBadge : styles.companionIconBadge
          }
        >
          <SKidsIcon
            name={art.companionIconName}
            size={isModal ? 26 : 18}
            style={!item.isUnlocked && styles.lockedStickerIcon}
          />
        </View>
      ) : null}
      {art?.milestoneLabel ? (
        <View
          style={isModal ? styles.modalMilestoneBadge : styles.milestoneBadge}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            style={isModal ? styles.modalMilestoneText : styles.milestoneText}
          >
            {art.milestoneLabel}
          </Text>
        </View>
      ) : null}
      {!item.isUnlocked ? (
        <View style={isModal ? styles.modalLockBadge : styles.lockBadge}>
          <Text
            style={isModal ? styles.modalLockBadgeText : styles.lockBadgeText}
          >
            ?
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function StickerMotifDecoration({
  art,
  isModal,
  isUnlocked,
}: {
  art: StickerArtDirection;
  isModal: boolean;
  isUnlocked: boolean;
}) {
  return (
    <>
      <View
        style={[
          styles.motifGlow,
          isModal && styles.modalMotifGlow,
          getStickerMotifStyle(art.motif),
          !isUnlocked && styles.lockedMotifGlow,
        ]}
      />
      {isTrailMotif(art.motif) ? (
        <View style={isModal ? styles.modalMotifTrail : styles.motifTrail}>
          <View style={styles.motifTrailDot} />
          <View style={styles.motifTrailDot} />
          <View style={styles.motifTrailDot} />
        </View>
      ) : null}
      {isSparkMotif(art.motif) ? (
        <>
          <View
            style={isModal ? styles.modalMotifSparkOne : styles.motifSparkOne}
          />
          <View
            style={isModal ? styles.modalMotifSparkTwo : styles.motifSparkTwo}
          />
        </>
      ) : null}
      {isRibbonMotif(art.motif) ? (
        <View style={isModal ? styles.modalMotifRibbon : styles.motifRibbon} />
      ) : null}
    </>
  );
}

function isTrailMotif(motif: StickerArtMotif) {
  switch (motif) {
    case 'firstMapStop':
    case 'fiveStopTrail':
    case 'littleExplorer':
    case 'fiveLessonPath':
    case 'mapFinisherCrown':
      return true;
    default:
      return false;
  }
}

function isSparkMotif(motif: StickerArtMotif) {
  switch (motif) {
    case 'firstWordSpark':
    case 'fiveWordGlow':
    case 'firstLessonMedal':
    case 'sevenDayRecord':
    case 'hundredWordStar':
    case 'mapFinisherCrown':
      return true;
    default:
      return false;
  }
}

function isRibbonMotif(motif: StickerArtMotif) {
  switch (motif) {
    case 'firstReviewCards':
    case 'wordTreasure':
    case 'cardFlipMaster':
    case 'threeLessonStack':
    case 'fiveLessonPath':
      return true;
    default:
      return false;
  }
}

function getStickerMotifStyle(motif: StickerArtMotif) {
  switch (motif) {
    case 'fiveWordGlow':
    case 'threeDayRhythm':
    case 'wordGarden':
    case 'fiveStopTrail':
    case 'cardFlipMaster':
      return styles.tealMotifGlow;
    case 'firstMapStop':
    case 'firstLessonMedal':
    case 'hundredWordStar':
    case 'fiveLessonPath':
      return styles.coralMotifGlow;
    case 'wordBag':
    case 'twoDayPair':
    case 'littleExplorer':
    case 'mapFinisherCrown':
      return styles.skyMotifGlow;
    case 'firstWordSpark':
    case 'firstReviewCards':
    case 'sevenDayRecord':
    case 'wordTreasure':
    case 'threeLessonStack':
    default:
      return styles.sunMotifGlow;
  }
}

function StickerDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function getStickerToneStyle(tone: StickerArtTone) {
  switch (tone) {
    case 'coral':
      return styles.coralStickerArt;
    case 'sky':
      return styles.skyStickerArt;
    case 'teal':
      return styles.tealStickerArt;
    case 'sun':
    default:
      return styles.sunStickerArt;
  }
}

function formatCollectionDate(value: string, appLanguage: 'en' | 'vi') {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());

  return appLanguage === 'en'
    ? `${month}/${day}/${year}`
    : `${day}/${month}/${year}`;
}

function getLocalizedAchievementTitle(
  reward: AchievementReward,
  appLanguage: 'en' | 'vi',
) {
  return appLanguage === 'en' ? reward.titleEn : reward.titleVi;
}

function getLocalizedAchievementDescription(
  reward: AchievementReward,
  appLanguage: 'en' | 'vi',
) {
  return appLanguage === 'en' ? reward.descriptionEn : reward.descriptionVi;
}

function getAchievementRequirementText(
  reward: AchievementReward,
  t: Translator,
) {
  const target = String(reward.target);

  switch (reward.metric) {
    case 'completedLessons':
      return t('stickerCollection.requirementCompletedLessons', { target });
    case 'completedReviews':
      return t('stickerCollection.requirementCompletedReviews', { target });
    case 'completedScenes':
      return t('stickerCollection.requirementCompletedScenes', { target });
    case 'currentStreak':
      return t('stickerCollection.requirementCurrentStreak', { target });
    case 'longestStreak':
      return t('stickerCollection.requirementLongestStreak', { target });
    case 'learnedWords':
    default:
      return t('stickerCollection.requirementLearnedWords', { target });
  }
}

function getAchievementSectionTitle(
  category: AchievementCategory,
  t: Translator,
) {
  switch (category) {
    case 'habits':
      return t('stickerCollection.achievementHabits');
    case 'bigGoals':
      return t('stickerCollection.achievementBigGoals');
    case 'firstSteps':
    default:
      return t('stickerCollection.achievementFirstSteps');
  }
}
