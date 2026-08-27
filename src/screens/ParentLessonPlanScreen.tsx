import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppCard } from '../components/AppCard';
import { SKidsIcon } from '../components/SKidsIcon';
import { lessons } from '../data/lessons';
import { DEFAULT_THEME_ID, themes } from '../data/themes';
import {
  getParentSettings,
  saveParentSettings,
} from '../engine/ParentSettingsManager';
import { useParentAccessSnapshot } from '../engine/ParentAccessSession';
import {
  getProgress,
  saveActiveThemeId,
} from '../engine/ProgressManager';
import { useI18n, useSavedAppLanguage } from '../i18n';
import {
  getLocalizedLessonTitle,
  getLocalizedThemeTitle,
} from '../i18n/domainCopy';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { useResponsiveLayout } from '../theme/responsive';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Lesson } from '../types/lesson';
import type { RootStackParamList } from '../types/navigation';
import { getLessonIconName } from '../utils/lessonIcons';
import {
  getEnabledLessonIds,
  getLessonPlanSelection,
  getRecommendedLessonIds,
  isOnlyVisibleLessonInTheme,
} from '../utils/lessonPlan';

type Props = NativeStackScreenProps<RootStackParamList, 'ParentLessonPlan'>;
type LessonPlanSelection = 'all' | 'recommended' | 'custom';

const lessonById = new Map(lessons.map(lesson => [lesson.id, lesson]));
const catalogLessonIds = themes.flatMap(theme => theme.lessonIds);
const catalogLessonIdSet = new Set(catalogLessonIds);
const journeyLessons: Lesson[] = [
  ...catalogLessonIds
    .map(lessonId => lessonById.get(lessonId))
    .filter((lesson): lesson is Lesson => Boolean(lesson)),
  ...lessons.filter(lesson => !catalogLessonIdSet.has(lesson.id)),
];
const allLessonIds = journeyLessons.map(lesson => lesson.id);
const recommendedLessonIds = getRecommendedLessonIds(themes);

export function ParentLessonPlanScreen({ navigation }: Props) {
  useThemeSync();
  const t = useI18n();
  const appLanguage = useSavedAppLanguage();
  const responsiveLayout = useResponsiveLayout();
  const { isGranted } = useParentAccessSnapshot();
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLessonIds, setSelectedLessonIds] =
    useState<string[]>(allLessonIds);
  const [disabledThemeIds, setDisabledThemeIds] = useState<string[]>([]);
  const [activeThemeId, setActiveThemeId] =
    useState<string>(DEFAULT_THEME_ID);
  const [planSelection, setPlanSelection] =
    useState<LessonPlanSelection>('all');
  const [expandedThemeIds, setExpandedThemeIds] = useState<Set<string>>(
    () => new Set(themes[0] ? [themes[0].id] : []),
  );

  useEffect(() => {
    if (!isGranted) {
      navigation.replace('Parent');
    }
  }, [isGranted, navigation]);

  useEffect(() => {
    if (!isGranted) {
      return undefined;
    }

    let isMounted = true;
    Promise.all([
      getParentSettings(),
      getProgress().catch(() => ({ activeThemeId: DEFAULT_THEME_ID })),
    ])
      .then(([settings, progress]) => {
        if (!isMounted) {
          return;
        }

        const enabledLessonIds = settings.visibleLessonIds ?? allLessonIds;
        const nextDisabledThemeIds = settings.disabledThemeIds ?? [];
        setSelectedLessonIds(enabledLessonIds);
        setDisabledThemeIds(nextDisabledThemeIds);
        setActiveThemeId(progress.activeThemeId);
        setPlanSelection(
          getLessonPlanSelection(
            settings.visibleLessonIds,
            recommendedLessonIds,
            nextDisabledThemeIds,
          ),
        );
      })
      .catch(() => undefined)
      .finally(() => {
        if (isMounted) {
          setIsReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isGranted]);

  const selectedLessonIdSet = useMemo(
    () => new Set(selectedLessonIds),
    [selectedLessonIds],
  );
  const disabledThemeIdSet = useMemo(
    () => new Set(disabledThemeIds),
    [disabledThemeIds],
  );
  const enabledThemeCount = themes.length - disabledThemeIds.length;
  const enabledLessonIds = useMemo(
    () =>
      getEnabledLessonIds(
        allLessonIds,
        selectedLessonIds,
        themes,
        disabledThemeIds,
      ),
    [disabledThemeIds, selectedLessonIds],
  );
  const nextActiveTheme = disabledThemeIdSet.has(activeThemeId)
    ? themes.find(theme => !disabledThemeIdSet.has(theme.id))
    : undefined;
  const contentWidthStyle = {
    maxWidth: responsiveLayout.contentMaxWidth,
    paddingHorizontal: responsiveLayout.screenPadding,
  };

  if (!isGranted) {
    return null;
  }

  const updateSelection = (
    nextLessonIds: string[],
    nextDisabledThemeIds = disabledThemeIds,
  ) => {
    const orderedLessonIds = allLessonIds.filter(id =>
      nextLessonIds.includes(id),
    );
    setSelectedLessonIds(orderedLessonIds);
    setPlanSelection(
      getLessonPlanSelection(
        orderedLessonIds,
        recommendedLessonIds,
        nextDisabledThemeIds,
      ),
    );
  };

  const handleSelectPreset = (selection: LessonPlanSelection) => {
    if (selection === 'recommended') {
      setSelectedLessonIds(recommendedLessonIds);
      setDisabledThemeIds([]);
      setPlanSelection('recommended');
      return;
    }

    if (selection === 'all') {
      setSelectedLessonIds(allLessonIds);
      setDisabledThemeIds([]);
      setPlanSelection('all');
      return;
    }

    setPlanSelection('custom');
  };

  const handleToggleThemeEnabled = (themeId: string, isEnabled: boolean) => {
    const isCurrentlyEnabled = !disabledThemeIdSet.has(themeId);
    if (
      isEnabled === isCurrentlyEnabled ||
      (!isEnabled && isCurrentlyEnabled && enabledThemeCount <= 1)
    ) {
      return;
    }

    const nextDisabledThemeIds = isEnabled
      ? disabledThemeIds.filter(id => id !== themeId)
      : [...disabledThemeIds, themeId];

    setDisabledThemeIds(nextDisabledThemeIds);
    setPlanSelection(
      getLessonPlanSelection(
        selectedLessonIds,
        recommendedLessonIds,
        nextDisabledThemeIds,
      ),
    );
    setExpandedThemeIds(current => {
      const next = new Set(current);
      if (isEnabled) {
        next.add(themeId);
      } else {
        next.delete(themeId);
      }
      return next;
    });
  };

  const handleToggleTheme = (themeId: string) => {
    setExpandedThemeIds(current => {
      const next = new Set(current);
      if (next.has(themeId)) {
        next.delete(themeId);
      } else {
        next.add(themeId);
      }
      return next;
    });
  };

  const handleToggleLesson = (lessonId: string, themeLessonIds: string[]) => {
    if (
      isOnlyVisibleLessonInTheme(lessonId, themeLessonIds, selectedLessonIds)
    ) {
      return;
    }

    const nextLessonIds = selectedLessonIdSet.has(lessonId)
      ? selectedLessonIds.filter(id => id !== lessonId)
      : [...selectedLessonIds, lessonId];
    updateSelection(nextLessonIds);
  };

  const handleSelectAllThemeLessons = (themeLessonIds: string[]) => {
    updateSelection([...selectedLessonIds, ...themeLessonIds]);
  };

  const handleSave = async () => {
    if (!isReady || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      await saveParentSettings({
        disabledThemeIds:
          disabledThemeIds.length > 0 ? disabledThemeIds : undefined,
        visibleLessonIds:
          planSelection === 'all' ? undefined : selectedLessonIds,
      });
      if (nextActiveTheme) {
        await saveActiveThemeId(nextActiveTheme.id).catch(() => undefined);
      }
      navigation.goBack();
    } catch {
      Alert.alert(
        t('parent.lessonPlanEditor.saveErrorTitle'),
        t('parent.lessonPlanEditor.saveErrorText'),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const selectedPresetDescription =
    planSelection === 'recommended'
      ? t('parent.lessonPlanEditor.presetRecommendedDescription')
      : planSelection === 'all'
      ? t('parent.lessonPlanEditor.presetAllDescription')
      : t('parent.lessonPlanEditor.presetCustomDescription');

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.scrollContent, contentWidthStyle]}
        style={styles.scroll}
      >
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            {t('parent.lessonPlanEditor.title')}
          </Text>
          <Text style={styles.heroSubtitle}>
            {t('parent.lessonPlanEditor.subtitle')}
          </Text>
        </View>

        <AppCard style={styles.presetCard}>
          <View style={styles.presetRow}>
            {(
              [
                ['recommended', 'parent.lessonPlanEditor.presetRecommended'],
                ['all', 'parent.lessonPlanEditor.presetAll'],
                ['custom', 'parent.lessonPlanEditor.presetCustom'],
              ] as const
            ).map(([selection, labelKey]) => {
              const isSelected = planSelection === selection;
              return (
                <Pressable
                  key={selection}
                  accessibilityLabel={t(labelKey)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  disabled={!isReady}
                  onPress={() => handleSelectPreset(selection)}
                  style={({ pressed }) => [
                    styles.presetOption,
                    isSelected && styles.presetOptionSelected,
                    !isReady && styles.disabled,
                    pressed && isReady && styles.pressed,
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.presetOptionText,
                      isSelected && styles.presetOptionTextSelected,
                    ]}
                  >
                    {t(labelKey)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.presetDescription}>
            {isReady
              ? selectedPresetDescription
              : t('parent.lessonPlanEditor.loading')}
          </Text>
        </AppCard>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>
            {t('parent.lessonPlanEditor.themesTitle')}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {t('parent.lessonPlanEditor.themesSubtitle')}
          </Text>
        </View>

        <View style={styles.themeList}>
          {themes.map(theme => {
            const themeLessons = theme.lessonIds
              .map(lessonId => lessonById.get(lessonId))
              .filter((lesson): lesson is Lesson => Boolean(lesson));
            const themeLessonIds = themeLessons.map(lesson => lesson.id);
            const selectedCount = themeLessonIds.filter(lessonId =>
              selectedLessonIdSet.has(lessonId),
            ).length;
            const isThemeEnabled = !disabledThemeIdSet.has(theme.id);
            const isLastEnabledTheme =
              isThemeEnabled && enabledThemeCount <= 1;
            const isExpanded =
              isThemeEnabled && expandedThemeIds.has(theme.id);
            const areAllSelected = selectedCount === themeLessons.length;
            const themeTitle = getLocalizedThemeTitle(theme, appLanguage);

            return (
              <AppCard key={theme.id} style={styles.themeCard}>
                <View style={styles.themeHeader}>
                  <View
                    style={[
                      styles.themeSummary,
                      !isThemeEnabled && styles.themeHeaderDisabled,
                    ]}
                  >
                    <View style={styles.themeIcon}>
                      {theme.iconName ? (
                        <SKidsIcon name={theme.iconName} size={42} />
                      ) : (
                        <Text style={styles.themeEmoji}>
                          {theme.thumbnailEmoji}
                        </Text>
                      )}
                    </View>
                    <View style={styles.themeCopy}>
                      <Text numberOfLines={3} style={styles.themeTitle}>
                        {themeTitle}
                      </Text>
                      <Text style={styles.themeCount}>
                        {t(
                          isThemeEnabled
                            ? 'parent.lessonPlanEditor.themeCount'
                            : 'parent.lessonPlanEditor.themeDisabledCount',
                          {
                            selected: String(selectedCount),
                            total: String(themeLessons.length),
                          },
                        )}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    accessibilityHint={
                      isLastEnabledTheme
                        ? t('parent.lessonPlanEditor.keepOneTheme')
                        : undefined
                    }
                    accessibilityLabel={t(
                      isThemeEnabled
                        ? 'parent.lessonPlanEditor.disableThemeAccessibility'
                        : 'parent.lessonPlanEditor.enableThemeAccessibility',
                      { themeTitle },
                    )}
                    disabled={isLastEnabledTheme || !isReady}
                    onValueChange={nextEnabled =>
                      handleToggleThemeEnabled(theme.id, nextEnabled)
                    }
                    trackColor={{
                      false: colors.border,
                      true: colors.primary,
                    }}
                    value={isThemeEnabled}
                  />
                </View>

                {isThemeEnabled ? (
                  <Pressable
                    accessibilityLabel={t(
                      isExpanded
                        ? 'parent.lessonPlanEditor.hideLessons'
                        : 'parent.lessonPlanEditor.showLessons',
                      { count: String(themeLessons.length) },
                    )}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: isExpanded }}
                    disabled={!isReady}
                    onPress={() => handleToggleTheme(theme.id)}
                    style={({ pressed }) => [
                      styles.themeExpandButton,
                      !isReady && styles.disabled,
                      pressed && isReady && styles.pressed,
                    ]}
                  >
                    <Text style={styles.themeExpandButtonText}>
                      {t(
                        isExpanded
                          ? 'parent.lessonPlanEditor.hideLessons'
                          : 'parent.lessonPlanEditor.showLessons',
                        { count: String(themeLessons.length) },
                      )}
                    </Text>
                    <Text style={styles.themeExpandChevron}>
                      {isExpanded ? '▲' : '▼'}
                    </Text>
                  </Pressable>
                ) : null}

                {isExpanded ? (
                  <View style={styles.lessonList}>
                    <View style={styles.themeControls}>
                      <Text style={styles.themeControlsText}>
                        {t('parent.lessonPlanEditor.lessonSectionTitle')}
                      </Text>
                      <Pressable
                        accessibilityLabel={t(
                          'parent.lessonPlanEditor.selectAllAccessibility',
                          { themeTitle },
                        )}
                        accessibilityRole="button"
                        accessibilityState={{ disabled: areAllSelected }}
                        disabled={areAllSelected || !isReady}
                        onPress={() =>
                          handleSelectAllThemeLessons(themeLessonIds)
                        }
                        style={({ pressed }) => [
                          styles.themeSelectAll,
                          areAllSelected && styles.themeSelectAllDisabled,
                          pressed && !areAllSelected && styles.pressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.themeSelectAllText,
                            areAllSelected && styles.themeSelectAllTextDisabled,
                          ]}
                        >
                          {t(
                            areAllSelected
                              ? 'parent.lessonPlanEditor.allSelected'
                              : 'parent.lessonPlanEditor.selectAll',
                          )}
                        </Text>
                      </Pressable>
                    </View>
                    {themeLessons.map((lesson, index) => {
                      const isSelected = selectedLessonIdSet.has(lesson.id);
                      const isRequired = isOnlyVisibleLessonInTheme(
                        lesson.id,
                        themeLessonIds,
                        selectedLessonIds,
                      );
                      const lessonTitle = getLocalizedLessonTitle(
                        lesson,
                        appLanguage,
                      );

                      return (
                        <Pressable
                          key={lesson.id}
                          accessibilityHint={
                            isRequired
                              ? t('parent.lessonPlanEditor.themesSubtitle')
                              : undefined
                          }
                          accessibilityLabel={lessonTitle}
                          accessibilityRole="checkbox"
                          accessibilityState={{
                            checked: isSelected,
                            disabled: isRequired,
                          }}
                          disabled={isRequired || !isReady}
                          onPress={() =>
                            handleToggleLesson(lesson.id, themeLessonIds)
                          }
                          style={({ pressed }) => [
                            styles.lessonRow,
                            index === themeLessons.length - 1 &&
                              styles.lessonRowLast,
                            pressed && !isRequired && styles.lessonRowPressed,
                          ]}
                        >
                          <View style={styles.lessonIcon}>
                            <SKidsIcon
                              name={getLessonIconName(lesson)}
                              size={42}
                            />
                          </View>
                          <View style={styles.lessonCopy}>
                            <Text style={styles.lessonTitle}>
                              {lessonTitle}
                            </Text>
                            <Text
                              style={[
                                styles.lessonSubtitle,
                                isRequired && styles.requiredLessonText,
                              ]}
                            >
                              {isRequired
                                ? t('parent.lessonPlanEditor.requiredLesson')
                                : t('parent.lessonPlanEditor.stations', {
                                    count: String(lesson.scenes.length),
                                  })}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.checkbox,
                              isSelected && styles.checkboxSelected,
                            ]}
                          >
                            {isSelected ? (
                              <Text style={styles.checkboxMark}>✓</Text>
                            ) : null}
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
              </AppCard>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {nextActiveTheme ? (
          <View style={[styles.mapChangeNotice, contentWidthStyle]}>
            <Text style={styles.mapChangeNoticeText}>
              {t('parent.lessonPlanEditor.mapWillSwitch', {
                themeTitle: getLocalizedThemeTitle(
                  nextActiveTheme,
                  appLanguage,
                ),
              })}
            </Text>
          </View>
        ) : null}
        <View style={[styles.bottomBarContent, contentWidthStyle]}>
          <Text style={styles.selectedCount}>
            {t('parent.lessonPlanEditor.selectedCount', {
              count: String(enabledLessonIds.length),
            })}
          </Text>
          <Pressable
            accessibilityLabel={t('parent.lessonPlanEditor.done')}
            accessibilityRole="button"
            accessibilityState={{ disabled: !isReady || isSaving }}
            disabled={!isReady || isSaving}
            onPress={handleSave}
            style={({ pressed }) => [
              styles.doneButton,
              (!isReady || isSaving) && styles.disabled,
              pressed && isReady && !isSaving && styles.pressed,
            ]}
          >
            <Text style={styles.doneButtonText}>
              {isSaving
                ? t('common.saveInProgress')
                : t('parent.lessonPlanEditor.done')}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = createThemedStyles(() => ({
  bottomBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  bottomBarContent: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    paddingBottom: spacing.xs,
    paddingTop: spacing.xs,
    width: '100%',
  },
  checkbox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 2,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  checkboxMark: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 24,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  disabled: {
    opacity: 0.5,
  },
  doneButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 104,
    paddingHorizontal: spacing.md,
  },
  doneButtonText: {
    color: colors.white,
    ...typography.body,
    fontWeight: '900',
  },
  hero: {
    gap: spacing.xs,
  },
  heroSubtitle: {
    color: colors.textSoft,
    ...typography.body,
  },
  heroTitle: {
    color: colors.text,
    ...typography.title,
  },
  lessonCopy: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  lessonIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceBlue,
    borderRadius: radius.md,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  lessonList: {
    backgroundColor: colors.surface,
  },
  lessonRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 76,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  lessonRowLast: {
    borderBottomWidth: 0,
  },
  lessonRowPressed: {
    backgroundColor: colors.surfaceBlue,
  },
  lessonSubtitle: {
    color: colors.textSoft,
    ...typography.caption,
  },
  lessonTitle: {
    color: colors.text,
    ...typography.body,
  },
  mapChangeNotice: {
    alignSelf: 'center',
    backgroundColor: colors.secondarySoft,
    paddingBottom: spacing.xs,
    paddingTop: spacing.xs,
    width: '100%',
  },
  mapChangeNoticeText: {
    color: colors.text,
    textAlign: 'center',
    ...typography.caption,
  },
  presetCard: {
    gap: spacing.sm,
    padding: spacing.md,
  },
  presetDescription: {
    color: colors.textSoft,
    textAlign: 'center',
    ...typography.caption,
  },
  presetOption: {
    alignItems: 'center',
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.xs,
  },
  presetOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  presetOptionText: {
    color: colors.textSoft,
    textAlign: 'center',
    ...typography.caption,
  },
  presetOptionTextSelected: {
    color: colors.white,
  },
  presetRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.72,
  },
  requiredLessonText: {
    color: colors.primaryDark,
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignSelf: 'center',
    gap: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.lg,
    width: '100%',
  },
  sectionHeading: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  sectionSubtitle: {
    color: colors.textSoft,
    ...typography.caption,
  },
  sectionTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  selectedCount: {
    color: colors.textSoft,
    flex: 1,
    ...typography.caption,
  },
  themeCard: {
    borderColor: colors.border,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 0,
  },
  themeCopy: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  themeCount: {
    color: colors.textSoft,
    ...typography.caption,
  },
  themeEmoji: {
    fontSize: 24,
    lineHeight: 30,
  },
  themeControls: {
    alignItems: 'center',
    backgroundColor: colors.surfaceBlue,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    minHeight: 52,
    paddingVertical: spacing.xs,
  },
  themeControlsText: {
    color: colors.textSoft,
    flex: 1,
    ...typography.caption,
  },
  themeHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 92,
    padding: spacing.md,
  },
  themeHeaderDisabled: {
    opacity: 0.56,
  },
  themeSummary: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
  },
  themeExpandButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceBlue,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  themeExpandButtonText: {
    color: colors.primaryDark,
    ...typography.caption,
  },
  themeExpandChevron: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 19,
  },
  themeIcon: {
    alignItems: 'center',
    backgroundColor: colors.backgroundWarm,
    borderRadius: radius.md,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  themeList: {
    gap: spacing.sm,
  },
  themeSelectAll: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: spacing.sm,
  },
  themeSelectAllDisabled: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
  },
  themeSelectAllText: {
    color: colors.primaryDark,
    ...typography.caption,
  },
  themeSelectAllTextDisabled: {
    color: colors.muted,
  },
  themeTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
  },
}));
