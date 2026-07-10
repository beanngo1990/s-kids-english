import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Pressable,
  Switch,
  Text,
  TextInput,
  type DimensionValue,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppCard } from '../components/AppCard';
import { ChildProfileCard } from '../components/ChildProfileCard';
import { KidBadge } from '../components/KidBadge';
import { MascotImage } from '../components/mascot';
import { ProgressStars } from '../components/ProgressStars';
import { Screen } from '../components/Screen';
import { SKidsIcon } from '../components/SKidsIcon';
import { WeeklyChart } from '../components/WeeklyChart';
import { lessons } from '../data/lessons';
import { themes } from '../data/themes';
import {
  getActivityLog,
  getWeeklyData,
  type ActivityLog,
} from '../engine/DailyActivityTracker';
import {
  getLearningDifficultyOption,
  getParentSettings,
  learningDifficultyOptions,
  saveParentLearningMode,
  saveParentSettings,
  type ChildProfile,
  defaultChildProfile,
} from '../engine/ParentSettingsManager';
import type { AppLanguage, AppTheme } from '../engine/ParentSettingsManager';
import {
  getLessonVocabulary,
  getProgress,
  type LocalProgress,
} from '../engine/ProgressManager';
import { useAppTheme } from '../theme/AppTheme';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import { useResponsiveLayout } from '../theme/responsive';
import type { LearningMode } from '../types/lesson';
import type { RootStackParamList } from '../types/navigation';
import { getLessonIconName } from '../utils/lessonIcons';
import { isSceneProgressComplete } from '../utils/lessonProgress';

const GATE_DURATION_MS = 3000;
const WEEKLY_WORD_TARGET = 30;

function haveSameLessonIds(first: string[], second: string[]) {
  return (
    first.length === second.length && first.every(id => second.includes(id))
  );
}

type ParentTab = 'stats' | 'lessons' | 'settings';
type Props = NativeStackScreenProps<RootStackParamList, 'Parent'>;

function getLocalDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function ParentScreen({ navigation }: Props) {
  useThemeSync();
  const { appThemePreference, setAppThemePreference } = useAppTheme();
  const responsiveLayout = useResponsiveLayout();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isDashboardReady, setIsDashboardReady] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [activeTab, setActiveTab] = useState<ParentTab>('stats');
  const [expandedThemeId, setExpandedThemeId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [isCustomPlanMode, setIsCustomPlanMode] = useState(false);

  // Settings State
  const [learningMode, setLearningMode] = useState<LearningMode>('core');
  const [journeyMode, setJourneyMode] = useState<'guided' | 'free'>('guided');
  const [enableSceneEditor, setEnableSceneEditor] = useState(false);
  const [appLanguage, setAppLanguage] = useState<AppLanguage>('vi');
  const [appTheme, setAppTheme] = useState<AppTheme>('system');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('19:30');
  const [visibleLessonIds, setVisibleLessonIds] = useState<
    string[] | undefined
  >(undefined);
  const [childProfile, setChildProfile] =
    useState<ChildProfile>(defaultChildProfile);

  // Activity State
  const [activityLog, setActivityLog] = useState<ActivityLog | null>(null);

  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const [savingMode, setSavingMode] = useState<LearningMode | null>(null);
  const gateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const learnedWordCount = progress?.learnedWordIds.length ?? 0;
  const completedLessonCount = progress?.completedLessonIds.length ?? 0;
  const earnedStickerCount = progress?.earnedStickerIds.length ?? 0;
  const isCompactDashboard = responsiveLayout.width <= 360;
  const weeklyData = useMemo(
    () => getWeeklyData(activityLog?.entries ?? []),
    [activityLog?.entries],
  );
  const todayActivity = useMemo(
    () =>
      activityLog?.entries.find(entry => entry.date === getLocalDateString()),
    [activityLog?.entries],
  );
  const todayWordCount = todayActivity?.wordsLearned ?? 0;
  const todaySceneCount = todayActivity?.scenesCompleted ?? 0;
  const journeyLessons = useMemo(() => {
    const orderedIds = [
      ...themes.flatMap(theme => theme.lessonIds),
      ...lessons.map(lesson => lesson.id),
    ];
    const knownIds = new Set<string>();
    const result: Array<(typeof lessons)[number]> = [];

    orderedIds.forEach(id => {
      if (knownIds.has(id)) {
        return;
      }

      const lesson = lessons.find(item => item.id === id);
      if (lesson) {
        knownIds.add(id);
        result.push(lesson);
      }
    });

    return result;
  }, []);

  const recentLessonId =
    progress?.completedLessonIds[progress?.completedLessonIds.length - 1];
  const recentLesson = lessons.find(l => l.id === recentLessonId);
  const visibleLessons = useMemo(
    () =>
      journeyLessons.filter(
        lesson => !visibleLessonIds || visibleLessonIds.includes(lesson.id),
      ),
    [journeyLessons, visibleLessonIds],
  );
  const completedLessonIds = useMemo(
    () => new Set(progress?.completedLessonIds ?? []),
    [progress?.completedLessonIds],
  );
  const completedSceneIds = useMemo(
    () => new Set(progress?.completedSceneIds ?? []),
    [progress?.completedSceneIds],
  );
  const focusLesson = useMemo(() => {
    const resumedLesson = progress?.currentLessonProgress
      ? visibleLessons.find(
          lesson => lesson.id === progress.currentLessonProgress?.lessonId,
        )
      : undefined;
    const partiallyCompletedLesson = visibleLessons.find(lesson => {
      const completedSceneCount = lesson.scenes.filter(scene =>
        isSceneProgressComplete(completedSceneIds, lesson.id, scene.id),
      ).length;

      return (
        completedSceneCount > 0 && completedSceneCount < lesson.scenes.length
      );
    });
    const firstIncompleteLesson = visibleLessons.find(
      lesson => !completedLessonIds.has(lesson.id),
    );
    const recentVisibleLesson = visibleLessons.find(
      lesson => lesson.id === recentLesson?.id,
    );

    return (
      resumedLesson ??
      partiallyCompletedLesson ??
      firstIncompleteLesson ??
      recentVisibleLesson ??
      visibleLessons[0]
    );
  }, [
    completedLessonIds,
    completedSceneIds,
    progress?.currentLessonProgress,
    recentLesson,
    visibleLessons,
  ]);
  const completedFocusSceneCount = useMemo(() => {
    if (!focusLesson) {
      return 0;
    }

    return focusLesson.scenes.filter(scene =>
      isSceneProgressComplete(completedSceneIds, focusLesson.id, scene.id),
    ).length;
  }, [completedSceneIds, focusLesson]);
  const focusSceneCount = focusLesson?.scenes.length ?? 0;
  const focusProgress =
    focusSceneCount > 0
      ? Math.round((completedFocusSceneCount / focusSceneCount) * 100)
      : 0;
  const allLessonIds = useMemo(
    () => journeyLessons.map(lesson => lesson.id),
    [journeyLessons],
  );
  const gentleLessonIds = useMemo(() => {
    const focusIndex = Math.max(
      journeyLessons.findIndex(lesson => lesson.id === focusLesson?.id),
      0,
    );
    const startIndex = Math.min(
      focusIndex,
      Math.max(journeyLessons.length - 3, 0),
    );

    return journeyLessons
      .slice(startIndex, startIndex + 3)
      .map(lesson => lesson.id);
  }, [focusLesson, journeyLessons]);
  const enabledLessonIds = visibleLessonIds ?? allLessonIds;
  const isFullJourneyEnabled = haveSameLessonIds(
    enabledLessonIds,
    allLessonIds,
  );
  const isGentlePlanEnabled = haveSameLessonIds(
    enabledLessonIds,
    gentleLessonIds,
  );
  const isCustomPlanActive =
    isCustomPlanMode || (!isFullJourneyEnabled && !isGentlePlanEnabled);
  const focusTheme = themes.find(theme =>
    theme.lessonIds.includes(focusLesson?.id ?? ''),
  );
  const learningPathTitle =
    themes.length === 1
      ? themes[0]?.titleVi ?? 'Lộ trình học của bé'
      : String(themes.length) + ' chủ đề học';
  const learningPathSubtitle =
    themes.length === 1
      ? themes[0]?.descriptionVi ?? 'Bé học theo hành trình ba mẹ đã chọn.'
      : 'Bé chỉ thấy những chủ đề và bài học ba mẹ đang bật.';
  const completedVisibleLessonCount = visibleLessons.filter(lesson =>
    completedLessonIds.has(lesson.id),
  ).length;
  const reviewLesson =
    visibleLessons.find(lesson => lesson.id === recentLesson?.id) ??
    focusLesson;
  const reviewWords = useMemo(() => {
    if (!reviewLesson) {
      return [];
    }

    const vocabulary = getLessonVocabulary(reviewLesson);
    const vocabularyById = new Map(
      vocabulary.map(item => [item.id, item.word]),
    );
    const learnedWordsInLesson = (progress?.learnedWordIds ?? [])
      .filter(id => vocabularyById.has(id))
      .slice(-3)
      .map(id => vocabularyById.get(id))
      .filter((word): word is string => Boolean(word));

    return learnedWordsInLesson.length > 0
      ? learnedWordsInLesson
      : vocabulary.slice(0, 3).map(item => item.word);
  }, [progress?.learnedWordIds, reviewLesson]);
  const isFocusLessonComplete =
    focusSceneCount > 0 && completedFocusSceneCount === focusSceneCount;
  const isReviewLessonReadyForGame = Boolean(
    reviewLesson?.reviewGame &&
      reviewLesson.scenes.every(scene =>
        isSceneProgressComplete(completedSceneIds, reviewLesson.id, scene.id),
      ),
  );
  const focusLessonBadge = isFocusLessonComplete
    ? 'Sẵn sàng ôn lại'
    : completedFocusSceneCount > 0
    ? 'Bài đang học'
    : 'Bài tiếp theo';
  const focusLessonAction = isFocusLessonComplete ? 'Ôn lại' : 'Tiếp tục';
  const heroTitle =
    todayWordCount > 0 || todaySceneCount > 0
      ? `Tuyệt vời, ${childProfile.name}!`
      : 'Một ngày học thật nhẹ nhàng';
  const heroSummary = !isDashboardReady
    ? 'Đang tải tiến độ gần đây của bé…'
    : todayWordCount > 0
    ? `Bé đã khám phá ${todayWordCount} từ mới${
        todaySceneCount > 0 ? ` và hoàn thành ${todaySceneCount} trạm` : ''
      } hôm nay.`
    : todaySceneCount > 0
    ? `Bé đã hoàn thành ${todaySceneCount} trạm học hôm nay.`
    : 'Một bài học ngắn hôm nay sẽ giúp bé giữ nhịp thật vui.';
  const heroAction =
    completedFocusSceneCount > 0 ? 'Tiếp tục cùng bé' : 'Cùng bé bắt đầu';
  const canOpenFocusLesson = isDashboardReady && Boolean(focusLesson);
  const canReviewTogether = isDashboardReady && Boolean(reviewLesson);
  const todayPrimaryMetricValue =
    todayWordCount > 0 ? todayWordCount : todaySceneCount;
  const todayPrimaryMetricLabel =
    todayWordCount > 0
      ? 'từ mới'
      : todaySceneCount > 0
      ? 'trạm học'
      : 'hoạt động';
  const currentDifficulty = getLearningDifficultyOption(learningMode);
  const tipText =
    reviewLesson?.metadata?.parentTipVi ??
    (reviewWords.length > 0
      ? `Ba mẹ có thể chỉ vào đồ vật thật và hỏi bé: "Where is the ${reviewWords[0]}?" hoặc "What is this?" để giúp bé nhớ lâu hơn.`
      : 'Bé chưa học từ vựng nào. Ba mẹ hãy cùng bé bắt đầu bài học đầu tiên nhé!');

  useEffect(() => {
    if (!isDashboardReady || !focusTheme?.id || !focusLesson?.id) {
      return;
    }

    setExpandedThemeId(current => current ?? focusTheme.id);
    setSelectedLessonId(current => current ?? focusLesson.id);
  }, [focusLesson?.id, focusTheme?.id, isDashboardReady]);

  useEffect(() => {
    setAppTheme(appThemePreference);
  }, [appThemePreference]);

  function clearGateTimer() {
    if (gateTimerRef.current) {
      clearTimeout(gateTimerRef.current);
      gateTimerRef.current = null;
    }
  }

  const refreshParentData = useCallback(() => {
    setIsDashboardReady(false);
    Promise.all([
      getProgress().catch(() => null),
      getActivityLog().catch(() => null),
      getParentSettings().catch(() => null),
    ]).then(([nextProgress, nextActivityLog, settings]) => {
      setProgress(nextProgress);
      setActivityLog(nextActivityLog);

      if (settings) {
        setLearningMode(settings.learningMode);
        setJourneyMode(settings.journeyMode);
        setEnableSceneEditor(settings.enableSceneEditor || false);
        setAppLanguage(settings.appLanguage);
        setAppTheme(settings.appTheme);
        setReminderEnabled(settings.reminderEnabled);
        setReminderTime(settings.reminderTime);
        setVisibleLessonIds(settings.visibleLessonIds);
        setChildProfile(settings.childProfile);
      } else {
        setLearningMode('core');
      }

      setIsDashboardReady(true);
    });
  }, []);

  useEffect(() => {
    if (!isUnlocked) {
      return;
    }

    refreshParentData();
    return navigation.addListener('focus', refreshParentData);
  }, [isUnlocked, navigation, refreshParentData]);

  useEffect(() => {
    return clearGateTimer;
  }, []);

  const handleHoldStart = () => {
    clearGateTimer();
    setIsHolding(true);
    gateTimerRef.current = setTimeout(() => {
      setIsUnlocked(true);
      setIsHolding(false);
    }, GATE_DURATION_MS);
  };

  const handleHoldEnd = () => {
    if (!isUnlocked) {
      setIsHolding(false);
    }

    clearGateTimer();
  };

  const handleOpenLesson = (lessonId: string) => {
    setIsUnlocked(false);
    navigation.navigate('LessonPack', { lessonId });
  };

  const handleOpenFocusLesson = () => {
    if (!focusLesson) {
      return;
    }

    handleOpenLesson(focusLesson.id);
  };

  const handleReviewTogether = () => {
    if (!reviewLesson) {
      return;
    }

    if (reviewLesson.reviewGame && isReviewLessonReadyForGame) {
      setIsUnlocked(false);
      navigation.navigate('ReviewGame', { lessonId: reviewLesson.id });
      return;
    }

    setIsUnlocked(false);
    navigation.navigate('LessonPack', { lessonId: reviewLesson.id });
  };

  const handleSelectLessonPlan = async (lessonIds?: string[]) => {
    setIsCustomPlanMode(false);
    setVisibleLessonIds(lessonIds);
    await saveParentSettings({ visibleLessonIds: lessonIds });
  };

  const handleOpenCustomPlan = () => {
    setIsCustomPlanMode(true);
    setExpandedThemeId(focusTheme?.id ?? themes[0]?.id ?? null);
    setSelectedLessonId(null);
  };

  const handleSelectLearningMode = async (nextLearningMode: LearningMode) => {
    if (savingMode) {
      return;
    }

    setSavingMode(nextLearningMode);
    try {
      const nextSettings = await saveParentLearningMode(nextLearningMode);
      setLearningMode(nextSettings.learningMode);
    } catch {
      // Settings are local best-effort; keep the current mode if saving fails.
    } finally {
      setSavingMode(null);
    }
  };

  const handleUpdateJourneyMode = async (mode: 'guided' | 'free') => {
    setJourneyMode(mode);
    await saveParentSettings({ journeyMode: mode });
  };

  const handleToggleSceneEditor = async () => {
    const nextState = !enableSceneEditor;
    setEnableSceneEditor(nextState);
    await saveParentSettings({ enableSceneEditor: nextState });
  };

  const handleUpdateLanguage = async (lang: AppLanguage) => {
    setAppLanguage(lang);
    await saveParentSettings({ appLanguage: lang });
  };

  const handleUpdateTheme = async (theme: AppTheme) => {
    setAppTheme(theme);
    await setAppThemePreference(theme);
  };

  const handleToggleReminder = async () => {
    const next = !reminderEnabled;
    setReminderEnabled(next);
    await saveParentSettings({ reminderEnabled: next });
  };

  const handleToggleLesson = async (lessonId: string) => {
    const currentVisible = visibleLessonIds ?? lessons.map(l => l.id);
    let nextVisible: string[];

    if (currentVisible.includes(lessonId)) {
      const lesson = lessons.find(l => l.id === lessonId);
      if (lesson) {
        const themeLessons = lessons.filter(l => l.themeId === lesson.themeId);
        const visibleInTheme = themeLessons.filter(l =>
          currentVisible.includes(l.id),
        );
        if (visibleInTheme.length <= 1) {
          Alert.alert(
            'Lưu ý',
            'Cần giữ ít nhất 1 bài học được bật trong chủ đề này.',
          );
          return;
        }
      }
      nextVisible = currentVisible.filter(id => id !== lessonId);
    } else {
      nextVisible = [...currentVisible, lessonId];
    }

    setIsCustomPlanMode(true);
    setVisibleLessonIds(nextVisible);
    await saveParentSettings({ visibleLessonIds: nextVisible });
  };

  if (!isUnlocked) {
    return (
      <Screen>
        <View style={styles.gateContainer}>
          <AppCard style={styles.gateCard}>
            <KidBadge tone="teal">Góc phụ huynh</KidBadge>
            <Text style={styles.title}>Khu vực dành cho ba mẹ</Text>
            <Text style={styles.gateHint}>
              Giữ nút trong 3 giây để mở thống kê và cài đặt học tập.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPressIn={handleHoldStart}
              onPressOut={handleHoldEnd}
              style={({ pressed }) => [
                styles.holdButton,
                (pressed || isHolding) && styles.holdButtonActive,
              ]}
            >
              <Text style={styles.holdButtonText}>
                {isHolding ? 'Đang giữ...' : 'Giữ để mở'}
              </Text>
            </Pressable>
          </AppCard>
        </View>
      </Screen>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <Screen scroll>
        {activeTab === 'stats' && (
          <View style={styles.tabContent}>
            <ChildProfileCard
              profile={childProfile}
              onEditPress={() => setActiveTab('settings')}
            />

            <AppCard
              style={[
                styles.todayCard,
                isCompactDashboard && styles.dashboardCardCompact,
              ]}
            >
              <View style={styles.todayTopRow}>
                <View style={styles.todayCopy}>
                  <View style={styles.todayEyebrow}>
                    <Text style={styles.todayEyebrowText}>TIẾN ĐỘ HÔM NAY</Text>
                  </View>
                  <Text style={styles.todayTitle}>{heroTitle}</Text>
                  <Text style={styles.todaySummary}>{heroSummary}</Text>
                  <View style={styles.todayMetrics}>
                    <View style={styles.todayMetric}>
                      <Text style={styles.todayMetricValue}>
                        {todayPrimaryMetricValue}
                      </Text>
                      <Text style={styles.todayMetricLabel}>
                        {todayPrimaryMetricLabel}
                      </Text>
                    </View>
                    <View style={styles.todayMetricDivider} />
                    <View style={styles.todayMetric}>
                      <Text style={styles.todayMetricValue}>
                        {activityLog?.currentStreak ?? 0}
                      </Text>
                      <Text style={styles.todayMetricLabel}>
                        ngày liên tiếp
                      </Text>
                    </View>
                  </View>
                </View>
                <MascotImage
                  decorative
                  pose={
                    todayWordCount > 0 || todaySceneCount > 0
                      ? 'greatJob'
                      : 'letsGo'
                  }
                  size={isCompactDashboard ? 84 : 112}
                  style={styles.todayMascot}
                />
              </View>
              <Pressable
                accessibilityLabel={`${heroAction}: ${
                  focusLesson?.titleVi ?? 'bài học của bé'
                }`}
                accessibilityRole="button"
                accessibilityState={{ disabled: !canOpenFocusLesson }}
                disabled={!canOpenFocusLesson}
                onPress={handleOpenFocusLesson}
                style={({ pressed }) => [
                  styles.todayAction,
                  !canOpenFocusLesson && styles.actionDisabled,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.todayActionText}>{heroAction}</Text>
                <Text style={styles.todayActionArrow}>→</Text>
              </Pressable>
            </AppCard>

            <Pressable
              accessibilityHint="Mở bài học bé đang học"
              accessibilityLabel={`${focusLessonAction} ${
                focusLesson?.titleVi ?? 'bài học'
              }`}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canOpenFocusLesson }}
              disabled={!canOpenFocusLesson}
              onPress={handleOpenFocusLesson}
              style={({ pressed }) => [
                styles.cardPressable,
                pressed && styles.pressed,
              ]}
            >
              <AppCard
                style={[
                  styles.currentLessonCard,
                  isCompactDashboard && styles.dashboardCardCompact,
                ]}
              >
                <View
                  style={[
                    styles.currentLessonTopRow,
                    isCompactDashboard && styles.currentLessonTopRowCompact,
                  ]}
                >
                  <View
                    style={[
                      styles.currentLessonIcon,
                      isCompactDashboard && styles.currentLessonIconCompact,
                    ]}
                  >
                    {focusLesson ? (
                      <SKidsIcon
                        name={getLessonIconName(focusLesson)}
                        size={isCompactDashboard ? 52 : 64}
                      />
                    ) : (
                      <SKidsIcon
                        name="focusLesson"
                        size={isCompactDashboard ? 52 : 64}
                      />
                    )}
                  </View>
                  <View style={styles.currentLessonCopy}>
                    <KidBadge tone={isFocusLessonComplete ? 'teal' : 'sun'}>
                      {focusLessonBadge}
                    </KidBadge>
                    <Text style={styles.currentLessonTitle}>
                      {isDashboardReady
                        ? focusLesson?.titleVi ?? 'Bài học đầu tiên'
                        : 'Đang chuẩn bị lộ trình'}
                    </Text>
                    <Text style={styles.currentLessonSubtitle}>
                      {focusLesson?.titleEn ?? 'Let’s learn together'}
                    </Text>
                  </View>
                </View>

                <View style={styles.lessonProgressMeta}>
                  <Text style={styles.currentLessonProgressText}>
                    {isDashboardReady
                      ? `${completedFocusSceneCount}/${focusSceneCount} trạm`
                      : 'Đang tải tiến độ'}
                  </Text>
                  <Text style={styles.currentLessonPercent}>
                    {focusProgress}%
                  </Text>
                </View>

                <View style={styles.lessonProgressTrack}>
                  {focusProgress > 0 ? (
                    <View
                      style={[
                        styles.lessonProgressFill,
                        { width: `${focusProgress}%` },
                      ]}
                    />
                  ) : null}
                </View>

                <View style={styles.currentLessonFooter}>
                  <View style={styles.currentLessonStars}>
                    <ProgressStars
                      completed={completedFocusSceneCount}
                      total={focusSceneCount}
                    />
                  </View>
                  <Text style={styles.currentLessonAction}>
                    {focusLessonAction} →
                  </Text>
                </View>
              </AppCard>
            </Pressable>

            <AppCard
              style={[
                styles.achievementCard,
                isCompactDashboard && styles.dashboardCardCompact,
              ]}
            >
              <View style={styles.achievementHeader}>
                <View style={styles.achievementCopy}>
                  <Text style={styles.achievementTitle}>Hành trình của bé</Text>
                  <Text style={styles.achievementSubtitle}>
                    Mỗi lần học là một bước tiến đáng yêu.
                  </Text>
                </View>
                <SKidsIcon name="star" size={44} />
              </View>
              <View
                style={[
                  styles.milestoneRow,
                  isCompactDashboard && styles.milestoneRowCompact,
                ]}
              >
                <View
                  style={[
                    styles.milestoneItem,
                    isCompactDashboard && styles.milestoneItemCompact,
                  ]}
                >
                  <SKidsIcon name="school" size={36} />
                  <Text style={styles.milestoneValue}>{learnedWordCount}</Text>
                  <Text style={styles.milestoneLabel}>Từ đã học</Text>
                </View>
                {!isCompactDashboard ? (
                  <View style={styles.milestoneDivider} />
                ) : null}
                <View
                  style={[
                    styles.milestoneItem,
                    isCompactDashboard && styles.milestoneItemCompact,
                  ]}
                >
                  <SKidsIcon name="acorn" size={36} />
                  <Text style={styles.milestoneValue}>
                    {completedLessonCount}
                  </Text>
                  <Text style={styles.milestoneLabel}>Bài hoàn thành</Text>
                </View>
                {!isCompactDashboard ? (
                  <View style={styles.milestoneDivider} />
                ) : null}
                <View
                  style={[
                    styles.milestoneItem,
                    isCompactDashboard && styles.milestoneItemCompact,
                    isCompactDashboard && styles.milestoneItemLastCompact,
                  ]}
                >
                  <SKidsIcon name="sticker" size={36} />
                  <Text style={styles.milestoneValue}>
                    {earnedStickerCount}
                  </Text>
                  <Text style={styles.milestoneLabel}>Sticker nhận được</Text>
                </View>
              </View>
            </AppCard>

            <WeeklyChart data={weeklyData} weeklyTarget={WEEKLY_WORD_TARGET} />

            <AppCard
              style={[
                styles.reviewCard,
                isCompactDashboard && styles.dashboardCardCompact,
              ]}
            >
              <View style={styles.reviewHeader}>
                <View style={styles.reviewCopy}>
                  <KidBadge tone="sun">Ôn cùng bé · 3 phút</KidBadge>
                  <Text style={styles.reviewTitle}>
                    {isDashboardReady
                      ? reviewLesson
                        ? `Cùng ôn ${reviewLesson.titleVi}`
                        : 'Một hoạt động nhỏ hôm nay'
                      : 'Đang chuẩn bị gợi ý ôn tập'}
                  </Text>
                </View>
                <View style={styles.reviewIcon}>
                  <SKidsIcon name="speak" size={56} />
                </View>
              </View>

              {reviewWords.length > 0 ? (
                <View style={styles.wordSection}>
                  <Text style={styles.wordSectionLabel}>Từ bé vừa gặp</Text>
                  <View style={styles.wordChipRow}>
                    {reviewWords.map((word, index) => (
                      <View key={`${word}-${index}`} style={styles.wordChip}>
                        <Text style={styles.wordChipText}>{word}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              <View style={styles.parentPrompt}>
                <Text style={styles.parentPromptLabel}>Gợi ý cho ba mẹ</Text>
                <Text style={styles.parentPromptText}>{tipText}</Text>
              </View>

              <Pressable
                accessibilityLabel="Mở hoạt động ôn tập cùng bé"
                accessibilityRole="button"
                accessibilityState={{ disabled: !canReviewTogether }}
                disabled={!canReviewTogether}
                onPress={handleReviewTogether}
                style={({ pressed }) => [
                  styles.reviewAction,
                  !canReviewTogether && styles.actionDisabled,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.reviewActionText}>
                  {isReviewLessonReadyForGame
                    ? 'Chơi lật thẻ cùng bé'
                    : 'Mở hoạt động ôn tập'}
                </Text>
                <Text style={styles.reviewActionArrow}>→</Text>
              </Pressable>
            </AppCard>
          </View>
        )}

        {activeTab === 'lessons' && (
          <View style={styles.tabContent}>
            <AppCard style={styles.learningPathCard}>
              <View style={styles.learningPathTopRow}>
                <View style={styles.learningPathCopy}>
                  <KidBadge tone="teal">Lộ trình học của bé</KidBadge>
                  <Text style={styles.learningPathTitle}>
                    {learningPathTitle}
                  </Text>
                  <Text style={styles.learningPathSubtitle}>
                    {learningPathSubtitle}
                  </Text>
                </View>
                <View style={styles.learningPathCount}>
                  <Text style={styles.learningPathCountValue}>
                    {visibleLessons.length}
                  </Text>
                  <Text style={styles.learningPathCountLabel}>
                    /{journeyLessons.length} bài
                  </Text>
                </View>
              </View>
              <View style={styles.learningPathTrack}>
                {journeyLessons.length > 0 ? (
                  <View
                    style={[
                      styles.learningPathFill,
                      {
                        width: (String(
                          Math.round(
                            (visibleLessons.length / journeyLessons.length) *
                              100,
                          ),
                        ) + '%') as DimensionValue,
                      },
                    ]}
                  />
                ) : null}
              </View>
              <Text style={styles.learningPathFootnote}>
                Đã hoàn thành {completedVisibleLessonCount}/
                {visibleLessons.length} bài đang bật.
              </Text>
            </AppCard>

            <AppCard style={styles.lessonPlanCard}>
              <Text style={styles.lessonPlanTitle}>Chọn nhịp học</Text>
              <Text style={styles.lessonPlanSubtitle}>
                Ba mẹ có thể chọn một nhịp phù hợp hoặc tự tinh chỉnh từng bài.
              </Text>
              <View
                style={[
                  styles.lessonPlanOptions,
                  isCompactDashboard && styles.lessonPlanOptionsCompact,
                ]}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: isFullJourneyEnabled }}
                  disabled={!isDashboardReady}
                  onPress={() => handleSelectLessonPlan()}
                  style={({ pressed }) => [
                    styles.lessonPlanOption,
                    isCompactDashboard && styles.lessonPlanOptionCompact,
                    isFullJourneyEnabled && styles.lessonPlanOptionActive,
                    !isDashboardReady && styles.optionDisabled,
                    pressed && isDashboardReady && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.lessonPlanOptionTitle,
                      isFullJourneyEnabled &&
                        styles.lessonPlanOptionTitleActive,
                    ]}
                  >
                    Theo lộ trình
                  </Text>
                  <Text
                    style={[
                      styles.lessonPlanOptionSubtitle,
                      isFullJourneyEnabled &&
                        styles.lessonPlanOptionSubtitleActive,
                    ]}
                  >
                    Tất cả bài
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: isGentlePlanEnabled }}
                  disabled={!isDashboardReady}
                  onPress={() => handleSelectLessonPlan(gentleLessonIds)}
                  style={({ pressed }) => [
                    styles.lessonPlanOption,
                    isCompactDashboard && styles.lessonPlanOptionCompact,
                    isGentlePlanEnabled && styles.lessonPlanOptionWarm,
                    !isDashboardReady && styles.optionDisabled,
                    pressed && isDashboardReady && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.lessonPlanOptionTitle,
                      isGentlePlanEnabled && styles.lessonPlanOptionWarmText,
                    ]}
                  >
                    Nhẹ nhàng
                  </Text>
                  <Text
                    style={[
                      styles.lessonPlanOptionSubtitle,
                      isGentlePlanEnabled && styles.lessonPlanOptionWarmText,
                    ]}
                  >
                    {gentleLessonIds.length} bài gần nhất
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: isCustomPlanActive }}
                  disabled={!isDashboardReady}
                  onPress={handleOpenCustomPlan}
                  style={({ pressed }) => [
                    styles.lessonPlanOption,
                    isCompactDashboard && styles.lessonPlanOptionCompact,
                    isCompactDashboard && styles.lessonPlanOptionLastCompact,
                    isCustomPlanActive && styles.lessonPlanOptionCustom,
                    !isDashboardReady && styles.optionDisabled,
                    pressed && isDashboardReady && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.lessonPlanOptionTitle,
                      isCustomPlanActive && styles.lessonPlanOptionCustomText,
                    ]}
                  >
                    Tự chọn
                  </Text>
                  <Text
                    style={[
                      styles.lessonPlanOptionSubtitle,
                      isCustomPlanActive && styles.lessonPlanOptionCustomText,
                    ]}
                  >
                    Từng bài
                  </Text>
                </Pressable>
              </View>
              {isCustomPlanActive ? (
                <View style={styles.customPlanNotice}>
                  <View style={styles.customPlanNoticeDot} />
                  <Text style={styles.customPlanNoticeText}>
                    Đang tự chọn từng bài. Dùng công tắc trong các chủ đề bên
                    dưới để ẩn hoặc hiện bài cho bé.
                  </Text>
                </View>
              ) : null}
            </AppCard>

            {focusLesson ? (
              <Pressable
                accessibilityHint="Mở bài học bé đang học"
                accessibilityLabel={'Mở ' + focusLesson.titleVi}
                accessibilityRole="button"
                accessibilityState={{ disabled: !canOpenFocusLesson }}
                disabled={!canOpenFocusLesson}
                onPress={handleOpenFocusLesson}
                style={({ pressed }) => [
                  styles.learningFocusPressable,
                  pressed && styles.pressed,
                ]}
              >
                <AppCard style={styles.learningFocusCard}>
                  <View style={styles.learningFocusIcon}>
                    <SKidsIcon
                      name={getLessonIconName(focusLesson)}
                      size={58}
                    />
                  </View>
                  <View style={styles.learningFocusCopy}>
                    <Text style={styles.learningFocusLabel}>
                      {isFocusLessonComplete
                        ? 'Bài bé có thể ôn lại'
                        : 'Bài bé đang học'}
                    </Text>
                    <Text style={styles.learningFocusTitle}>
                      {focusLesson.titleVi}
                    </Text>
                    <Text style={styles.learningFocusProgress}>
                      {completedFocusSceneCount}/{focusSceneCount} trạm ·{' '}
                      {focusProgress}% hoàn thành
                    </Text>
                  </View>
                  <Text style={styles.learningFocusArrow}>→</Text>
                </AppCard>
              </Pressable>
            ) : null}

            <View style={styles.lessonSectionHeading}>
              <View style={styles.lessonSectionHeadingCopy}>
                <Text style={styles.lessonSectionHeadingTitle}>
                  Các chủ đề bé đang học
                </Text>
                <Text style={styles.lessonSectionHeadingSubtitle}>
                  Mỗi chủ đề chứa các bài học và từ vựng riêng của bé.
                </Text>
              </View>
              <KidBadge tone="sky">Tự chọn</KidBadge>
            </View>

            <View style={styles.lessonSectionList}>
              {themes.map(theme => {
                const themeLessons = journeyLessons.filter(lesson =>
                  theme.lessonIds.includes(lesson.id),
                );
                const visibleCount = themeLessons.filter(lesson =>
                  enabledLessonIds.includes(lesson.id),
                ).length;
                const completedCount = themeLessons.filter(lesson =>
                  completedLessonIds.has(lesson.id),
                ).length;
                const isExpanded = expandedThemeId === theme.id;

                return (
                  <AppCard
                    key={theme.id}
                    style={[
                      styles.lessonSectionCard,
                      isExpanded && styles.lessonSectionCardExpanded,
                    ]}
                  >
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ expanded: isExpanded }}
                      onPress={() =>
                        setExpandedThemeId(isExpanded ? null : theme.id)
                      }
                      style={({ pressed }) => [
                        styles.lessonSectionHeader,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.lessonSectionEmoji}>
                        <Text style={styles.lessonSectionEmojiText}>
                          {theme.thumbnailEmoji}
                        </Text>
                      </View>
                      <View style={styles.lessonSectionCopy}>
                        <Text style={styles.lessonSectionTitle}>
                          {theme.titleVi}
                        </Text>
                        <Text style={styles.lessonSectionSubtitle}>
                          {completedCount}/{themeLessons.length} bài hoàn thành
                          {' · '}
                          {visibleCount} bài bật
                        </Text>
                      </View>
                      <Text style={styles.lessonSectionExpandIcon}>
                        {isExpanded ? '⌃' : '⌄'}
                      </Text>
                    </Pressable>

                    {isExpanded ? (
                      <View style={styles.managedLessonList}>
                        {themeLessons.map((lesson, index) => {
                          const isVisible = enabledLessonIds.includes(
                            lesson.id,
                          );
                          const completedSceneCount = lesson.scenes.filter(
                            scene =>
                              isSceneProgressComplete(
                                completedSceneIds,
                                lesson.id,
                                scene.id,
                              ),
                          ).length;
                          const hasCompletedAllScenes =
                            lesson.scenes.length > 0 &&
                            completedSceneCount === lesson.scenes.length;
                          const isCompleted = completedLessonIds.has(lesson.id);
                          const isCurrentLesson = focusLesson?.id === lesson.id;
                          const isSelected = selectedLessonId === lesson.id;
                          const isLast = index === themeLessons.length - 1;
                          const lessonWords = getLessonVocabulary(lesson)
                            .slice(0, 3)
                            .map(item => item.word);
                          const lessonState = !isVisible
                            ? 'Đang ẩn'
                            : isCurrentLesson && hasCompletedAllScenes
                            ? 'Sẵn sàng ôn'
                            : isCurrentLesson
                            ? 'Đang học'
                            : isCompleted
                            ? 'Đã hoàn thành'
                            : hasCompletedAllScenes
                            ? 'Chờ ôn tập'
                            : completedSceneCount > 0
                            ? 'Đang tiếp tục'
                            : 'Sẵn sàng';

                          return (
                            <View
                              key={lesson.id}
                              style={[
                                styles.managedLesson,
                                isSelected && styles.managedLessonSelected,
                                !isVisible && styles.managedLessonHidden,
                                isLast && styles.managedLessonLast,
                              ]}
                            >
                              <View style={styles.managedLessonRow}>
                                <Pressable
                                  accessibilityRole="button"
                                  accessibilityState={{ expanded: isSelected }}
                                  onPress={() =>
                                    setSelectedLessonId(
                                      isSelected ? null : lesson.id,
                                    )
                                  }
                                  style={({ pressed }) => [
                                    styles.managedLessonPressable,
                                    pressed && styles.pressed,
                                  ]}
                                >
                                  <View style={styles.managedLessonIcon}>
                                    <SKidsIcon
                                      name={getLessonIconName(lesson)}
                                      size={48}
                                    />
                                  </View>
                                  <View style={styles.managedLessonCopy}>
                                    <Text
                                      style={[
                                        styles.managedLessonState,
                                        isCurrentLesson &&
                                          styles.managedLessonStateCurrent,
                                        isCompleted &&
                                          styles.managedLessonStateDone,
                                        !isVisible &&
                                          styles.managedLessonStateHidden,
                                      ]}
                                    >
                                      {lessonState}
                                    </Text>
                                    <Text style={styles.managedLessonTitle}>
                                      {lesson.titleVi}
                                    </Text>
                                    <Text style={styles.managedLessonSubtitle}>
                                      {completedSceneCount}/
                                      {lesson.scenes.length} trạm ·{' '}
                                      {getLessonVocabulary(lesson).length} từ
                                    </Text>
                                  </View>
                                  <Text style={styles.managedLessonChevron}>
                                    {isSelected ? '⌃' : '›'}
                                  </Text>
                                </Pressable>
                                <Switch
                                  accessibilityLabel={
                                    (isVisible ? 'Ẩn ' : 'Hiện ') +
                                    lesson.titleVi
                                  }
                                  disabled={!isDashboardReady}
                                  value={isVisible}
                                  onValueChange={() =>
                                    handleToggleLesson(lesson.id)
                                  }
                                  trackColor={{
                                    false: colors.border,
                                    true: colors.primary,
                                  }}
                                />
                              </View>

                              {isSelected && isVisible ? (
                                <View style={styles.lessonPreview}>
                                  <Text style={styles.lessonPreviewLabel}>
                                    Bé sẽ khám phá
                                  </Text>
                                  <View style={styles.lessonPreviewWords}>
                                    {lessonWords.map((word, wordIndex) => (
                                      <View
                                        key={lesson.id + '-' + wordIndex}
                                        style={styles.lessonPreviewWord}
                                      >
                                        <Text
                                          style={styles.lessonPreviewWordText}
                                        >
                                          {word}
                                        </Text>
                                      </View>
                                    ))}
                                  </View>
                                  <Pressable
                                    accessibilityLabel={
                                      'Xem bài ' + lesson.titleVi
                                    }
                                    accessibilityRole="button"
                                    disabled={!isDashboardReady}
                                    onPress={() => handleOpenLesson(lesson.id)}
                                    style={({ pressed }) => [
                                      styles.lessonPreviewAction,
                                      !isDashboardReady &&
                                        styles.actionDisabled,
                                      pressed && styles.pressed,
                                    ]}
                                  >
                                    <Text
                                      style={styles.lessonPreviewActionText}
                                    >
                                      Xem bài học
                                    </Text>
                                    <Text
                                      style={styles.lessonPreviewActionArrow}
                                    >
                                      →
                                    </Text>
                                  </Pressable>
                                </View>
                              ) : null}
                            </View>
                          );
                        })}
                      </View>
                    ) : null}
                  </AppCard>
                );
              })}
            </View>
          </View>
        )}

        {activeTab === 'settings' && (
          <View style={styles.tabContent}>
            <AppCard style={styles.settingsCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleGroup}>
                  <KidBadge tone="sky">Hồ sơ bé</KidBadge>
                  <Text style={styles.privacyTitle}>Thông tin cá nhân</Text>
                </View>
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingTextGroup}>
                  <Text style={styles.difficultyTitle}>Tên bé</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={childProfile.name}
                  onChangeText={text => {
                    const next = { ...childProfile, name: text };
                    setChildProfile(next);
                  }}
                  onBlur={() => {
                    const name =
                      childProfile.name.trim() || defaultChildProfile.name;
                    const next = { ...childProfile, name };
                    setChildProfile(next);
                    saveParentSettings({ childProfile: next });
                  }}
                  placeholder="Nhập tên bé"
                  placeholderTextColor={colors.muted}
                  maxLength={20}
                />
              </View>

              {/*
            <View style={styles.settingRow}>
              <View style={styles.settingTextGroup}>
                <Text style={styles.difficultyTitle}>Avatar</Text>
              </View>
            </View>
            <View style={styles.emojiGrid}>
              {AVATAR_EMOJI_OPTIONS.map(emoji => {
                const isSelected = childProfile.avatarEmoji === emoji;
                return (
                  <Pressable
                    key={emoji}
                    onPress={() => {
                      const next = { ...childProfile, avatarEmoji: emoji };
                      setChildProfile(next);
                      saveParentSettings({ childProfile: next });
                    }}
                    style={[
                      styles.emojiOption,
                      isSelected && styles.emojiOptionSelected,
                    ]}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </Pressable>
                );
              })}
            </View>
            */}

              <View style={styles.settingRow}>
                <View style={styles.settingTextGroup}>
                  <Text style={styles.difficultyTitle}>
                    Năm sinh (tuỳ chọn)
                  </Text>
                </View>
                <TextInput
                  style={styles.textInputSmall}
                  value={childProfile.birthYear?.toString() ?? ''}
                  onChangeText={text => {
                    const num = parseInt(text, 10);
                    const next = {
                      ...childProfile,
                      birthYear: Number.isNaN(num) ? undefined : num,
                    };
                    setChildProfile(next);
                  }}
                  onBlur={() => {
                    saveParentSettings({ childProfile });
                  }}
                  placeholder="VD: 2021"
                  placeholderTextColor={colors.muted}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>
            </AppCard>

            <AppCard style={styles.settingsCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleGroup}>
                  <KidBadge tone="teal">Cài đặt học tập</KidBadge>
                  <Text style={styles.privacyTitle}>Hành trình</Text>
                </View>
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingTextGroup}>
                  <Text style={styles.difficultyTitle}>Chế độ mở khóa</Text>
                  <Text style={styles.difficultySubtitle}>
                    Lộ trình (từng bước) hoặc Tự do (mở tất cả).
                  </Text>
                </View>
                <View style={styles.switchGroup}>
                  <Pressable
                    style={[
                      styles.smallButton,
                      journeyMode === 'guided' && styles.smallButtonActive,
                    ]}
                    onPress={() => handleUpdateJourneyMode('guided')}
                  >
                    <Text
                      style={[
                        styles.smallButtonText,
                        journeyMode === 'guided' &&
                          styles.smallButtonTextActive,
                      ]}
                    >
                      Lộ trình
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.smallButton,
                      journeyMode === 'free' && styles.smallButtonActive,
                    ]}
                    onPress={() => handleUpdateJourneyMode('free')}
                  >
                    <Text
                      style={[
                        styles.smallButtonText,
                        journeyMode === 'free' && styles.smallButtonTextActive,
                      ]}
                    >
                      Tự do
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
                <View style={styles.sectionTitleGroup}>
                  <Text style={styles.privacyTitle}>Độ khó của bé</Text>
                </View>
                <KidBadge tone="sky">
                  Đang dùng: {currentDifficulty.title}
                </KidBadge>
              </View>
              <View style={styles.difficultyList}>
                {learningDifficultyOptions.map(option => {
                  const isSelected = option.learningMode === learningMode;
                  const isSavingThisMode = savingMode === option.learningMode;

                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      disabled={Boolean(savingMode)}
                      key={option.learningMode}
                      onPress={() =>
                        handleSelectLearningMode(option.learningMode)
                      }
                      style={({ pressed }) => [
                        styles.difficultyOption,
                        isSelected && styles.difficultyOptionSelected,
                        pressed && !savingMode && styles.pressed,
                        savingMode &&
                          !isSavingThisMode &&
                          styles.optionDisabled,
                      ]}
                    >
                      <View style={styles.difficultyText}>
                        <Text style={styles.difficultyTitle}>
                          {option.title}
                        </Text>
                        <Text style={styles.difficultySubtitle}>
                          {option.subtitle}
                        </Text>
                      </View>
                      <Text style={styles.difficultyState}>
                        {isSavingThisMode
                          ? 'Đang lưu...'
                          : isSelected
                          ? '✓'
                          : ''}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </AppCard>

            <AppCard style={styles.settingsCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleGroup}>
                  <KidBadge tone="teal">Cài đặt Ứng dụng</KidBadge>
                  <Text style={styles.privacyTitle}>Hệ thống</Text>
                </View>
              </View>

              {/* Ngôn ngữ */}
              <View style={styles.settingRow}>
                <View style={styles.settingTextGroup}>
                  <Text style={styles.difficultyTitle}>Ngôn ngữ</Text>
                  <Text style={styles.difficultySubtitle}>
                    Ngôn ngữ hiển thị của ứng dụng.
                  </Text>
                </View>
                <View style={styles.switchGroup}>
                  <Pressable
                    style={[
                      styles.smallButton,
                      appLanguage === 'vi' && styles.smallButtonActive,
                    ]}
                    onPress={() => handleUpdateLanguage('vi')}
                  >
                    <Text
                      style={[
                        styles.smallButtonText,
                        appLanguage === 'vi' && styles.smallButtonTextActive,
                      ]}
                    >
                      VI
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.smallButton,
                      appLanguage === 'en' && styles.smallButtonActive,
                    ]}
                    onPress={() => handleUpdateLanguage('en')}
                  >
                    <Text
                      style={[
                        styles.smallButtonText,
                        appLanguage === 'en' && styles.smallButtonTextActive,
                      ]}
                    >
                      EN
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Giao diện */}
              <View style={styles.settingRow}>
                <View style={styles.settingTextGroup}>
                  <Text style={styles.difficultyTitle}>Giao diện</Text>
                  <Text style={styles.difficultySubtitle}>
                    Sáng, tối hoặc theo hệ thống.
                  </Text>
                </View>
                <View style={styles.switchGroup}>
                  <Pressable
                    style={[
                      styles.smallButton,
                      appTheme === 'light' && styles.smallButtonActive,
                    ]}
                    onPress={() => handleUpdateTheme('light')}
                  >
                    <Text
                      style={[
                        styles.smallButtonText,
                        appTheme === 'light' && styles.smallButtonTextActive,
                      ]}
                    >
                      Sáng
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.smallButton,
                      appTheme === 'dark' && styles.smallButtonActive,
                    ]}
                    onPress={() => handleUpdateTheme('dark')}
                  >
                    <Text
                      style={[
                        styles.smallButtonText,
                        appTheme === 'dark' && styles.smallButtonTextActive,
                      ]}
                    >
                      Tối
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.smallButton,
                      appTheme === 'system' && styles.smallButtonActive,
                    ]}
                    onPress={() => handleUpdateTheme('system')}
                  >
                    <Text
                      style={[
                        styles.smallButtonText,
                        appTheme === 'system' && styles.smallButtonTextActive,
                      ]}
                    >
                      Auto
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Nhắc nhở */}
              <View style={styles.settingRow}>
                <View style={styles.settingTextGroup}>
                  <Text style={styles.difficultyTitle}>
                    Nhắc nhở học tập ({reminderTime})
                  </Text>
                  <Text style={styles.difficultySubtitle}>
                    Nhận thông báo nhắc bé học mỗi ngày.
                  </Text>
                </View>
                <Switch
                  value={reminderEnabled}
                  onValueChange={handleToggleReminder}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
            </AppCard>

            <AppCard style={styles.privacyCard}>
              <Text style={styles.privacyTitle}>An toàn cho trẻ</Text>
              <Text style={styles.privacyText}>
                Ứng dụng không có quảng cáo, không có link ngoài và không thu
                thập thông tin trẻ em.
              </Text>
            </AppCard>

            {__DEV__ && (
              <AppCard style={styles.settingsCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleGroup}>
                    <KidBadge tone="alert">DEV ONLY</KidBadge>
                    <Text style={styles.privacyTitle}>Công cụ nội bộ</Text>
                  </View>
                </View>
                <Pressable
                  accessibilityRole="switch"
                  accessibilityState={{ checked: enableSceneEditor }}
                  onPress={handleToggleSceneEditor}
                  style={({ pressed }) => [
                    styles.difficultyOption,
                    enableSceneEditor && styles.difficultyOptionSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.difficultyText}>
                    <Text style={styles.difficultyTitle}>Scene Editor</Text>
                    <Text style={styles.difficultySubtitle}>
                      Hiển thị nút Edit trong bài học để chỉnh toạ độ vật thể.
                    </Text>
                  </View>
                  <Text style={styles.difficultyState}>
                    {enableSceneEditor ? 'Đang bật' : 'Đang tắt'}
                  </Text>
                </Pressable>
              </AppCard>
            )}
          </View>
        )}
      </Screen>

      <SafeAreaView edges={['bottom']} style={styles.bottomBarSafe}>
        <View style={styles.bottomBar}>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'stats' }}
            onPress={() => setActiveTab('stats')}
            style={[
              styles.bottomTab,
              activeTab === 'stats' && styles.bottomTabActive,
            ]}
          >
            <Text
              style={[
                styles.bottomTabText,
                activeTab === 'stats' && styles.bottomTabTextActive,
              ]}
            >
              Thống kê
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'lessons' }}
            onPress={() => setActiveTab('lessons')}
            style={[
              styles.bottomTab,
              activeTab === 'lessons' && styles.bottomTabActive,
            ]}
          >
            <Text
              style={[
                styles.bottomTabText,
                activeTab === 'lessons' && styles.bottomTabTextActive,
              ]}
            >
              Bài học
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'settings' }}
            onPress={() => setActiveTab('settings')}
            style={[
              styles.bottomTab,
              activeTab === 'settings' && styles.bottomTabActive,
            ]}
          >
            <Text
              style={[
                styles.bottomTabText,
                activeTab === 'settings' && styles.bottomTabTextActive,
              ]}
            >
              Cài đặt
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = createThemedStyles(() => ({
  achievementCard: {
    backgroundColor: colors.backgroundWarm,
    borderColor: colors.borderWarm,
    borderWidth: 1,
    gap: spacing.md,
  },
  actionDisabled: {
    opacity: 0.56,
  },
  achievementCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
  achievementHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  achievementSubtitle: {
    color: colors.textSoft,
    ...typography.caption,
  },
  achievementTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  cardPressable: {
    borderRadius: radius.xl,
  },
  currentLessonAction: {
    color: colors.primaryDark,
    ...typography.caption,
  },
  currentLessonCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    gap: spacing.md,
  },
  currentLessonCopy: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  currentLessonFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  currentLessonIcon: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 76,
    justifyContent: 'center',
    width: 76,
  },
  currentLessonIconCompact: {
    height: 60,
    width: 60,
  },
  currentLessonPercent: {
    color: colors.primaryDark,
    ...typography.subtitle,
  },
  currentLessonProgressText: {
    color: colors.textSoft,
    ...typography.caption,
  },
  currentLessonStars: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    minWidth: 0,
  },
  currentLessonSubtitle: {
    color: colors.textSoft,
    ...typography.caption,
  },
  currentLessonTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  currentLessonTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  currentLessonTopRowCompact: {
    alignItems: 'flex-start',
  },
  customPlanNotice: {
    alignItems: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  customPlanNoticeDot: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 10,
    marginTop: 4,
    width: 10,
  },
  customPlanNoticeText: {
    color: colors.primaryDark,
    flex: 1,
    ...typography.caption,
  },
  dashboardCardCompact: {
    padding: spacing.md,
  },
  difficultyList: {
    gap: spacing.sm,
  },
  difficultyOption: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    minHeight: 76,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  difficultyOptionSelected: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
  },
  difficultyState: {
    color: colors.primaryDark,
    minWidth: 72,
    textAlign: 'right',
    ...typography.caption,
  },
  difficultySubtitle: {
    color: colors.textSoft,
    ...typography.caption,
  },
  difficultyText: {
    flex: 1,
    gap: spacing.xxs,
  },
  difficultyTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  eyebrow: {
    color: colors.accent,
    ...typography.caption,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  gateCard: {
    gap: spacing.lg,
  },
  gateContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  gateHint: {
    color: colors.textSoft,
    ...typography.body,
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  headerCopy: {
    color: colors.textSoft,
    ...typography.body,
  },
  lessonProgressFill: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: '100%',
  },
  lessonProgressMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lessonProgressTrack: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 12,
    overflow: 'hidden',
    width: '100%',
  },
  learningFocusArrow: {
    color: colors.primaryDark,
    fontSize: 24,
    fontWeight: '900',
  },
  learningFocusCard: {
    alignItems: 'center',
    backgroundColor: colors.backgroundWarm,
    borderColor: colors.borderWarm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
  },
  learningFocusCopy: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  learningFocusIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 68,
    justifyContent: 'center',
    width: 68,
  },
  learningFocusLabel: {
    color: colors.primaryDark,
    ...typography.caption,
  },
  learningFocusPressable: {
    borderRadius: radius.xl,
  },
  learningFocusProgress: {
    color: colors.textSoft,
    ...typography.caption,
  },
  learningFocusTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  learningPathCard: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.primary,
    borderWidth: 1,
    gap: spacing.md,
  },
  learningPathCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  learningPathCount: {
    alignItems: 'flex-end',
    gap: spacing.xxs,
  },
  learningPathCountLabel: {
    color: colors.textSoft,
    ...typography.caption,
  },
  learningPathCountValue: {
    color: colors.primaryDark,
    ...typography.title,
  },
  learningPathFill: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: '100%',
  },
  learningPathFootnote: {
    color: colors.textSoft,
    ...typography.caption,
  },
  learningPathSubtitle: {
    color: colors.textSoft,
    ...typography.caption,
  },
  learningPathTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  learningPathTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  learningPathTrack: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 10,
    overflow: 'hidden',
  },
  lessonPlanCard: {
    gap: spacing.sm,
  },
  lessonPlanOption: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xxs,
    justifyContent: 'center',
    minHeight: 82,
    padding: spacing.sm,
  },
  lessonPlanOptionCompact: {
    flexBasis: '46%',
  },
  lessonPlanOptionLastCompact: {
    flexBasis: '100%',
  },
  lessonPlanOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  lessonPlanOptionCustom: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  lessonPlanOptionCustomText: {
    color: colors.primaryDark,
  },
  lessonPlanOptionSubtitle: {
    color: colors.textSoft,
    ...typography.caption,
  },
  lessonPlanOptionSubtitleActive: {
    color: colors.surface,
  },
  lessonPlanOptionTitle: {
    color: colors.text,
    ...typography.caption,
  },
  lessonPlanOptionTitleActive: {
    color: colors.surface,
  },
  lessonPlanOptionWarm: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
  },
  lessonPlanOptionWarmText: {
    color: colors.text,
  },
  lessonPlanOptions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  lessonPlanOptionsCompact: {
    flexWrap: 'wrap',
  },
  lessonPlanSubtitle: {
    color: colors.textSoft,
    ...typography.caption,
  },
  lessonPlanTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  lessonPreview: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  lessonPreviewAction: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 46,
    paddingHorizontal: spacing.md,
  },
  lessonPreviewActionArrow: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  lessonPreviewActionText: {
    color: colors.text,
    ...typography.caption,
  },
  lessonPreviewLabel: {
    color: colors.textSoft,
    ...typography.caption,
  },
  lessonPreviewWord: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  lessonPreviewWordText: {
    color: colors.text,
    ...typography.caption,
  },
  lessonPreviewWords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  lessonSectionCard: {
    borderColor: colors.border,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 0,
  },
  lessonSectionCardExpanded: {
    borderColor: colors.primary,
  },
  lessonSectionCopy: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  lessonSectionEmoji: {
    alignItems: 'center',
    backgroundColor: colors.backgroundWarm,
    borderRadius: radius.md,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  lessonSectionEmojiText: {
    fontSize: 26,
    lineHeight: 32,
  },
  lessonSectionExpandIcon: {
    color: colors.primaryDark,
    fontSize: 22,
    fontWeight: '900',
  },
  lessonSectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  lessonSectionHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  lessonSectionHeadingCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
  lessonSectionHeadingSubtitle: {
    color: colors.textSoft,
    ...typography.caption,
  },
  lessonSectionHeadingTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  lessonSectionList: {
    gap: spacing.sm,
  },
  lessonSectionSubtitle: {
    color: colors.textSoft,
    ...typography.caption,
  },
  lessonSectionTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  managedLesson: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  managedLessonChevron: {
    color: colors.primaryDark,
    fontSize: 22,
    fontWeight: '900',
  },
  managedLessonCopy: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  managedLessonHidden: {
    opacity: 0.56,
  },
  managedLessonIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceBlue,
    borderRadius: radius.md,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  managedLessonLast: {
    borderBottomWidth: 0,
  },
  managedLessonList: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  managedLessonPressable: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
  },
  managedLessonRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  managedLessonSelected: {
    backgroundColor: colors.surfaceBlue,
  },
  managedLessonState: {
    color: colors.textSoft,
    ...typography.caption,
  },
  managedLessonStateCurrent: {
    color: colors.primaryDark,
  },
  managedLessonStateDone: {
    color: colors.secondaryDark,
  },
  managedLessonStateHidden: {
    color: colors.muted,
  },
  managedLessonSubtitle: {
    color: colors.textSoft,
    ...typography.caption,
  },
  managedLessonTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  holdButton: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderColor: colors.white,
    borderWidth: 2,
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 72,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  holdButtonActive: {
    backgroundColor: colors.secondaryDark,
  },
  holdButtonText: {
    color: colors.text,
    textAlign: 'center',
    ...typography.button,
  },
  privacyCard: {
    backgroundColor: colors.surfaceBlue,
    marginTop: spacing.lg,
  },
  privacyText: {
    color: colors.textSoft,
    ...typography.body,
  },
  privacyTitle: {
    color: colors.text,
    marginBottom: spacing.xs,
    ...typography.subtitle,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ translateY: 2 }, { scale: 0.99 }],
  },
  optionDisabled: {
    opacity: 0.56,
  },
  milestoneDivider: {
    alignSelf: 'stretch',
    backgroundColor: colors.borderWarm,
    width: 1,
  },
  milestoneItem: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  milestoneItemCompact: {
    flexBasis: '45%',
    minHeight: 88,
  },
  milestoneItemLastCompact: {
    flexBasis: '100%',
  },
  milestoneLabel: {
    color: colors.textSoft,
    textAlign: 'center',
    ...typography.caption,
  },
  milestoneRow: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  milestoneRowCompact: {
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  milestoneValue: {
    color: colors.text,
    ...typography.subtitle,
  },
  parentPrompt: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xxs,
    padding: spacing.md,
  },
  parentPromptLabel: {
    color: colors.primaryDark,
    ...typography.caption,
  },
  parentPromptText: {
    color: colors.text,
    ...typography.body,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  sectionTitleGroup: {
    flex: 1,
    gap: spacing.xs,
  },
  settingsCard: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  summary: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  summaryLabel: {
    color: colors.accent,
    ...typography.subtitle,
  },
  summaryValue: {
    color: colors.text,
    ...typography.body,
  },
  tip: {
    color: colors.textSoft,
    ...typography.body,
  },
  title: {
    color: colors.text,
    ...typography.title,
  },
  settingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingTextGroup: {
    flex: 1,
    paddingRight: spacing.md,
  },
  switchGroup: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  smallButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceBlue,
    borderWidth: 1,
    borderColor: colors.border,
  },
  smallButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  smallButtonText: {
    color: colors.textSoft,
    ...typography.caption,
  },
  smallButtonTextActive: {
    color: colors.white,
    fontWeight: 'bold',
  },
  lessonList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  themeGroup: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surfaceBlue,
  },
  themeHeaderExpanded: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  themeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  themeEmoji: {
    fontSize: 20,
  },
  themeTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  expandIcon: {
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: 'bold',
  },
  themeLessons: {
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  lessonRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lessonRowLast: {
    borderBottomWidth: 0,
  },
  lessonTextGroup: {
    flex: 1,
    paddingRight: spacing.md,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.pill,
    padding: spacing.xs,
    marginBottom: spacing.md,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  tabButtonActive: {
    backgroundColor: colors.surface,
    ...shadows.soft,
  },
  tabButtonText: {
    color: colors.textSoft,
    ...typography.button,
  },
  tabButtonTextActive: {
    color: colors.primaryDark,
  },
  tabContent: {
    paddingBottom: 10,
    gap: spacing.md,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bottomBarSafe: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  bottomTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xxs,
    borderRadius: radius.md,
  },
  bottomTabActive: {},
  bottomTabText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  bottomTabTextActive: {
    color: colors.primaryDark,
    fontWeight: '900',
  },
  textInput: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.text,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 120,
    textAlign: 'right',
    ...typography.caption,
  },
  textInputSmall: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.text,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 80,
    textAlign: 'right',
    ...typography.caption,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  emojiOption: {
    alignItems: 'center',
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 2,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  emojiOptionSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  emojiText: {
    fontSize: 24,
    lineHeight: 30,
  },
  reviewAction: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderColor: colors.secondaryDark,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: spacing.md,
  },
  reviewActionArrow: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 28,
  },
  reviewActionText: {
    color: colors.text,
    ...typography.button,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderWarm,
    borderWidth: 1,
    gap: spacing.md,
  },
  reviewCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  reviewHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  reviewIcon: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.lg,
    height: 68,
    justifyContent: 'center',
    width: 68,
  },
  reviewTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  todayAction: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  todayActionArrow: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 28,
  },
  todayActionText: {
    color: colors.text,
    ...typography.button,
  },
  todayCard: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderWidth: 1,
    gap: spacing.md,
    overflow: 'hidden',
  },
  todayCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  todayEyebrow: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    borderWidth: 1,
    maxWidth: '100%',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  todayEyebrowText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    lineHeight: 15,
  },
  todayMascot: {
    alignSelf: 'flex-end',
    flexShrink: 0,
    marginBottom: -spacing.xs,
    marginRight: -spacing.sm,
  },
  todayMetric: {
    gap: spacing.xxs,
  },
  todayMetricDivider: {
    backgroundColor: colors.primary,
    height: 34,
    marginHorizontal: spacing.xs,
    width: 1,
  },
  todayMetricLabel: {
    color: colors.textSoft,
    ...typography.caption,
  },
  todayMetrics: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  todayMetricValue: {
    color: colors.text,
    ...typography.subtitle,
  },
  todaySummary: {
    color: colors.textSoft,
    ...typography.caption,
  },
  todayTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  todayTopRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  wordChip: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  wordChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  wordChipText: {
    color: colors.primaryDark,
    ...typography.caption,
  },
  wordSection: {
    gap: spacing.xs,
  },
  wordSectionLabel: {
    color: colors.textSoft,
    ...typography.caption,
  },
}));
