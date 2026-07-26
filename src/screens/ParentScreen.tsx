import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  AppState,
  FlatList,
  Linking,
  Modal,
  Pressable,
  Switch,
  Text,
  TextInput,
  type DimensionValue,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

import { NotificationService } from '../services/NotificationService';

import { AppUiIcon } from '../components/AppUiIcon';
import { AppCard } from '../components/AppCard';
import { ChildProfileCard } from '../components/ChildProfileCard';
import { KidBadge } from '../components/KidBadge';
import { MascotImage } from '../components/mascot';
import { ParentAccountCard } from '../components/ParentAccountCard';
import { PremiumLessonLockIndicator } from '../components/PremiumLessonLockIndicator';
import { PremiumStatusCard } from '../components/PremiumStatusCard';
import { PremiumUpgradeCard } from '../components/PremiumUpgradeCard';
import { ProgressStars } from '../components/ProgressStars';
import { Screen } from '../components/Screen';
import { SKidsIcon } from '../components/SKidsIcon';
import { WeeklyChart } from '../components/WeeklyChart';
import { APP_SUPPORT_EMAIL, APP_VERSION } from '../config/appInfo';
import { monetizationConfig } from '../config/monetization';
import { lessons } from '../data/lessons';
import { themes } from '../data/themes';
import {
  getActivityLog,
  getWeeklyData,
  type ActivityLog,
} from '../engine/DailyActivityTracker';
import {
  canAccessLesson,
  canAccessReview,
} from '../engine/ContentAccessPolicy';
import {
  getParentSettings,
  learningDifficultyOptions,
  saveParentLearningMode,
  saveParentSettings,
  type ChildProfile,
  defaultChildProfile,
} from '../engine/ParentSettingsManager';
import { useMonetizationSnapshot } from '../engine/MonetizationManager';
import {
  grantParentAccess,
  revokeParentAccess,
  useParentAccessSnapshot,
} from '../engine/ParentAccessSession';
import type {
  AppLanguage,
  AppTheme,
  EnglishAccent,
  TeacherPromptMode,
} from '../engine/ParentSettingsManager';
import {
  getLocalizedLessonSubtitle,
  getLocalizedLessonTitle,
  getLocalizedThemeDescription,
  getLocalizedThemeTitle,
} from '../i18n/domainCopy';
import { getLearningModeCopy } from '../i18n/learningModeCopy';
import { useI18n } from '../i18n';
import {
  getLessonVocabularyForLearningMode,
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
import {
  getParentReviewTipText,
  getParentReviewWords,
} from '../utils/parentReviewWords';
import { getEarnedStickerCount } from '../utils/stickerStats';

const GATE_COOLDOWN_MS = 10000;
const WEEKLY_WORD_TARGET = 30;

type ParentGateChallenge = Readonly<{
  answer: number;
  expression: string;
}>;

function createParentGateChallenge(): ParentGateChallenge {
  const first = 10 + Math.floor(Math.random() * 90);
  const second = 10 + Math.floor(Math.random() * 90);
  const shouldAdd = Math.random() >= 0.5;

  if (shouldAdd) {
    return {
      answer: first + second,
      expression: `${first} + ${second}`,
    };
  }

  const larger = Math.max(first, second);
  const smaller = Math.min(first, second);
  return {
    answer: larger - smaller,
    expression: `${larger} − ${smaller}`,
  };
}

function haveSameLessonIds(first: string[], second: string[]) {
  return (
    first.length === second.length && first.every(id => second.includes(id))
  );
}

type ParentTab = 'stats' | 'lessons' | 'settings';
type LearningSettingsSheet = 'journey' | 'difficulty';
type AppSettingsSheet =
  | 'englishAccent'
  | 'language'
  | 'teacherPrompt'
  | 'theme';
type Props = NativeStackScreenProps<RootStackParamList, 'Parent'>;

function getLocalDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function ParentScreen({ navigation, route }: Props) {
  useThemeSync();
  const t = useI18n();
  const { appThemePreference, setAppThemePreference } = useAppTheme();
  const responsiveLayout = useResponsiveLayout();
  const { isGranted: isUnlocked } = useParentAccessSnapshot();
  const monetizationSnapshot = useMonetizationSnapshot();
  const [gateChallenge, setGateChallenge] = useState(
    createParentGateChallenge,
  );
  const [gateAnswer, setGateAnswer] = useState('');
  const [gateError, setGateError] = useState(false);
  const [gateWrongAttemptCount, setGateWrongAttemptCount] = useState(0);
  const [isGateCoolingDown, setIsGateCoolingDown] = useState(false);
  const [isDashboardReady, setIsDashboardReady] = useState(false);
  const [activeTab, setActiveTab] = useState<ParentTab>('stats');
  const [expandedThemeId, setExpandedThemeId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [isCustomPlanMode, setIsCustomPlanMode] = useState(false);

  // Settings State
  const [learningMode, setLearningMode] = useState<LearningMode>('core');
  const [journeyMode, setJourneyMode] = useState<'guided' | 'free'>('guided');
  const [enableSceneEditor, setEnableSceneEditor] = useState(false);
  const [appLanguage, setAppLanguage] = useState<AppLanguage>('vi');
  const [englishAccent, setEnglishAccent] =
    useState<EnglishAccent>('en-US');
  const [teacherPromptMode, setTeacherPromptMode] =
    useState<TeacherPromptMode>('vi');
  const [appTheme, setAppTheme] = useState<AppTheme>('system');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('19:30');
  const [visibleLessonIds, setVisibleLessonIds] = useState<
    string[] | undefined
  >(undefined);
  const [childProfile, setChildProfile] =
    useState<ChildProfile>(defaultChildProfile);
  const childAge = childProfile.birthYear
    ? new Date().getFullYear() - childProfile.birthYear
    : undefined;
  const childDisplayName =
    childProfile.name === defaultChildProfile.name
      ? t('childProfile.defaultName')
      : childProfile.name;
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [learningSettingsSheet, setLearningSettingsSheet] =
    useState<LearningSettingsSheet | null>(null);
  const [appSettingsSheet, setAppSettingsSheet] =
    useState<AppSettingsSheet | null>(null);

  // Activity State
  const [activityLog, setActivityLog] = useState<ActivityLog | null>(null);

  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const [savingMode, setSavingMode] = useState<LearningMode | null>(null);
  const gateCooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const handledIntentRef = useRef<string | null>(null);
  const learnedWordCount = progress?.learnedWordIds.length ?? 0;
  const completedLessonCount = progress?.completedLessonIds.length ?? 0;
  const earnedStickerCount = getEarnedStickerCount(progress, activityLog);
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
  const currentLessonPlanTitle = isFullJourneyEnabled
    ? t('parent.stats.guidedPlanTitle')
    : isGentlePlanEnabled
    ? t('parent.stats.gentlePlanTitle')
    : t('parent.stats.customPlanTitle');
  const currentLessonPlanSubtitle = isFullJourneyEnabled
    ? t('parent.stats.guidedPlanSubtitle')
    : isGentlePlanEnabled
    ? t('parent.stats.gentleLessons', {
        count: String(gentleLessonIds.length),
      })
    : t('parent.stats.customLessons');
  const focusTheme = themes.find(theme =>
    theme.lessonIds.includes(focusLesson?.id ?? ''),
  );
  const learningPathSubtitle =
    themes.length === 1
      ? themes[0]
        ? getLocalizedThemeDescription(themes[0], appLanguage)
        : t('parent.stats.learningPathSubtitleDefault')
      : t('parent.stats.learningPathSubtitleCustom');
  const completedVisibleLessonCount = visibleLessons.filter(lesson =>
    completedLessonIds.has(lesson.id),
  ).length;
  const reviewLesson =
    visibleLessons.find(lesson => lesson.id === recentLesson?.id) ??
    focusLesson;
  const hasFocusLessonAccess = focusLesson
    ? canAccessLesson(focusLesson.id, monetizationSnapshot)
    : false;
  const hasReviewLessonAccess = reviewLesson
    ? canAccessReview(reviewLesson.id, monetizationSnapshot)
    : false;
  const reviewWords = useMemo(() => {
    return getParentReviewWords({
      hasReviewLessonAccess,
      learnedWordIds: progress?.learnedWordIds ?? [],
      learningMode,
      lesson: reviewLesson,
    });
  }, [
    hasReviewLessonAccess,
    learningMode,
    progress?.learnedWordIds,
    reviewLesson,
  ]);
  const isFocusLessonComplete =
    focusSceneCount > 0 && completedFocusSceneCount === focusSceneCount;
  const isReviewLessonReadyForGame = Boolean(
    reviewLesson?.reviewGame &&
      reviewLesson.scenes.every(scene =>
        isSceneProgressComplete(completedSceneIds, reviewLesson.id, scene.id),
      ),
  );
  const focusLessonBadge = !hasFocusLessonAccess
    ? t('premium.badge')
    : isFocusLessonComplete
    ? t('parent.stats.lessonBadgeReview')
    : completedFocusSceneCount > 0
    ? t('parent.stats.lessonBadgeLearning')
    : t('parent.stats.lessonBadgeNext');
  const focusLessonAction = !hasFocusLessonAccess
    ? t('premium.openPlans')
    : isFocusLessonComplete
    ? t('parent.stats.lessonActionReview')
    : t('parent.stats.lessonActionContinue');
  const heroTitle =
    todayWordCount > 0 || todaySceneCount > 0
      ? t('parent.stats.heroTitleGreat', { name: childDisplayName })
      : t('parent.stats.heroTitleGentle');
  const heroSummary = !isDashboardReady
    ? t('parent.stats.heroSummaryLoading')
    : todayWordCount > 0
    ? (todaySceneCount > 0 ? t('parent.stats.heroSummaryWordsAndScenes', { words: String(todayWordCount), scenes: String(todaySceneCount) }) : t('parent.stats.heroSummaryWords', { words: String(todayWordCount) }))
    : todaySceneCount > 0
    ? t('parent.stats.heroSummaryScenes', { scenes: String(todaySceneCount) })
    : t('parent.stats.heroSummaryEmpty');
  const heroAction =
    completedFocusSceneCount > 0 ? t('parent.stats.heroActionContinue') : t('parent.stats.heroActionStart');
  const canOpenFocusLesson = isDashboardReady && Boolean(focusLesson);
  const canReviewTogether = isDashboardReady && Boolean(reviewLesson);
  const todayPrimaryMetricValue =
    todayWordCount > 0 ? todayWordCount : todaySceneCount;
  const todayPrimaryMetricLabel =
    todayWordCount > 0
      ? t('parent.stats.metricWords')
      : todaySceneCount > 0
      ? t('parent.stats.metricScenes')
      : t('parent.stats.metricActivity');
  const currentDifficultyCopy = getLearningModeCopy(learningMode, t);
  const currentJourneyCopy =
    journeyMode === 'guided'
      ? {
          subtitle: t('parent.settings.journeyGuidedSubtitle'),
          title: t('parent.settings.journeyGuidedTitle'),
        }
      : {
          subtitle: t('parent.settings.journeyFreeSubtitle'),
          title: t('parent.settings.journeyFreeTitle'),
        };
  const currentLanguageTitle =
    appLanguage === 'vi'
      ? t('parent.settings.appLanguageVietnamese')
      : t('parent.settings.appLanguageEnglish');
  const currentTeacherPromptTitle =
    teacherPromptMode === 'vi'
      ? t('parent.settings.teacherPromptVietnamese')
      : teacherPromptMode === 'en'
      ? t('parent.settings.teacherPromptEnglish')
      : t('parent.settings.teacherPromptBilingual');
  const currentEnglishAccentTitle =
    englishAccent === 'en-GB'
      ? t('parent.settings.englishAccentBritish')
      : t('parent.settings.englishAccentAmerican');
  const currentThemeTitle =
    appTheme === 'light'
      ? t('parent.settings.themeLight')
      : appTheme === 'dark'
      ? t('parent.settings.themeDark')
      : t('common.auto');
  const focusLessonTitle = focusLesson
    ? getLocalizedLessonTitle(focusLesson, appLanguage)
    : undefined;
  const focusLessonSubtitle = focusLesson
    ? getLocalizedLessonSubtitle(focusLesson, appLanguage)
    : undefined;
  const reviewLessonTitle = reviewLesson
    ? getLocalizedLessonTitle(reviewLesson, appLanguage)
    : undefined;
  const tipText = getParentReviewTipText({
    emptyText: t('parent.stats.tipEmpty'),
    hasReviewLessonAccess,
    lockedText: t('premium.parentLockedMessage'),
    metadataTip: reviewLesson?.metadata?.parentTipVi,
    reviewWordText: word => t('parent.stats.tipReviewWords', { word }),
    reviewWords,
  });

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

  function clearGateCooldownTimer() {
    if (gateCooldownTimerRef.current) {
      clearTimeout(gateCooldownTimerRef.current);
      gateCooldownTimerRef.current = null;
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
        setEnglishAccent(settings.englishAccent);
        setTeacherPromptMode(settings.teacherPromptMode);
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
    return clearGateCooldownTimer;
  }, []);

  useEffect(
    () => () => {
      revokeParentAccess();
    },
    [],
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active' || isUnlocked) {
        return;
      }

      clearGateCooldownTimer();
      setGateChallenge(createParentGateChallenge());
      setGateAnswer('');
      setGateError(false);
      setGateWrongAttemptCount(0);
      setIsGateCoolingDown(false);
    });

    return () => subscription.remove();
  }, [isUnlocked]);

  useEffect(() => {
    if (isUnlocked) {
      return;
    }

    setGateChallenge(createParentGateChallenge());
    setGateAnswer('');
    setGateError(false);
    setGateWrongAttemptCount(0);
    setIsGateCoolingDown(false);
    clearGateCooldownTimer();
  }, [isUnlocked]);

  useEffect(() => {
    if (!isUnlocked || !route.params?.intent) {
      return;
    }

    const intentKey = `${route.params.intent}:${route.params.lessonId ?? ''}`;
    if (handledIntentRef.current === intentKey) {
      return;
    }

    handledIntentRef.current = intentKey;
    if (
      route.params.intent === 'premium' ||
      route.params.intent === 'founderPromo'
    ) {
      navigation.navigate('Premium');
    }
  }, [isUnlocked, navigation, route.params?.intent, route.params?.lessonId]);

  const handleGateChallengeSubmit = () => {
    if (isGateCoolingDown || gateAnswer.trim().length === 0) {
      return;
    }

    if (Number(gateAnswer.trim()) === gateChallenge.answer) {
      setGateError(false);
      setGateWrongAttemptCount(0);
      grantParentAccess();
      return;
    }

    const nextWrongAttemptCount = gateWrongAttemptCount + 1;
    setGateError(true);
    setGateAnswer('');
    setGateWrongAttemptCount(nextWrongAttemptCount);
    setGateChallenge(createParentGateChallenge());

    if (nextWrongAttemptCount < 3) {
      return;
    }

    setGateWrongAttemptCount(0);
    setIsGateCoolingDown(true);
    clearGateCooldownTimer();
    gateCooldownTimerRef.current = setTimeout(() => {
      setIsGateCoolingDown(false);
      setGateError(false);
      gateCooldownTimerRef.current = null;
    }, GATE_COOLDOWN_MS);
  };

  const handleOpenLesson = (lessonId: string) => {
    if (!canAccessLesson(lessonId, monetizationSnapshot)) {
      navigation.navigate('Premium');
      return;
    }

    navigation.navigate('LessonPack', { lessonId, openedFromParent: true });
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

    if (!hasReviewLessonAccess) {
      navigation.navigate('Premium');
      return;
    }

    if (reviewLesson.reviewGame && isReviewLessonReadyForGame) {
      navigation.navigate('ReviewGame', {
        learningMode,
        lessonId: reviewLesson.id,
        openedFromParent: true,
      });
      return;
    }

    navigation.navigate('LessonPack', {
      lessonId: reviewLesson.id,
      openedFromParent: true,
    });
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

    setLearningSettingsSheet(null);
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
    setLearningSettingsSheet(null);
    setJourneyMode(mode);
    await saveParentSettings({ journeyMode: mode });
  };

  const handleToggleSceneEditor = async () => {
    const nextState = !enableSceneEditor;
    setEnableSceneEditor(nextState);
    await saveParentSettings({ enableSceneEditor: nextState });
  };

  const handleUpdateLanguage = async (lang: AppLanguage) => {
    setAppSettingsSheet(null);
    setAppLanguage(lang);
    const nextTeacherMode =
      lang === 'en' && teacherPromptMode === 'bilingual'
        ? 'en'
        : teacherPromptMode;

    if (nextTeacherMode !== teacherPromptMode) {
      setTeacherPromptMode(nextTeacherMode);
      await saveParentSettings({
        appLanguage: lang,
        teacherPromptMode: nextTeacherMode,
      });
    } else {
      await saveParentSettings({ appLanguage: lang });
    }
  };

  const handleUpdateTeacherPromptMode = async (mode: TeacherPromptMode) => {
    setAppSettingsSheet(null);
    setTeacherPromptMode(mode);
    await saveParentSettings({ teacherPromptMode: mode });
  };

  const handleUpdateEnglishAccent = async (accent: EnglishAccent) => {
    setAppSettingsSheet(null);
    setEnglishAccent(accent);
    await saveParentSettings({ englishAccent: accent });
  };

  const handleUpdateTheme = async (theme: AppTheme) => {
    setAppSettingsSheet(null);
    setAppTheme(theme);
    await setAppThemePreference(theme);
  };

  const handleContactSupport = useCallback(() => {
    const subject = encodeURIComponent(t('parent.support.emailSubject'));
    const url = `mailto:${APP_SUPPORT_EMAIL}?subject=${subject}`;

    Linking.openURL(url).catch(() => {
      Alert.alert(
        t('parent.support.emailErrorTitle'),
        t('parent.support.emailErrorText', { email: APP_SUPPORT_EMAIL }),
      );
    });
  }, [t]);

  const handleToggleReminder = async () => {
    const next = !reminderEnabled;
    setReminderEnabled(next);
    await saveParentSettings({ reminderEnabled: next });
    if (next) {
      await NotificationService.scheduleDailyReminder(reminderTime);
    } else {
      await NotificationService.cancelDailyReminder();
    }
  };

  const handleTimeChange = async (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      setReminderTime(timeString);
      await saveParentSettings({ reminderTime: timeString });
      
      if (reminderEnabled) {
        await NotificationService.scheduleDailyReminder(timeString);
      }
    }
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
            t('parent.alert.notice'),
            t('parent.alert.keepOneLesson'),
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

  const renderLearningSettingsCard = () => (
    <AppCard style={styles.learningSettingsCard}>
      <View style={styles.settingsCardHeader}>
        <KidBadge tone="teal">
          {t('parent.settings.journeyBadge')}
        </KidBadge>
        <Text style={styles.learningSettingsTitle}>
          {t('parent.settings.journeyTitle')}
        </Text>
      </View>

      <View style={styles.learningSummaryPanel}>
        <View style={styles.learningSummaryIcon}>
          <AppUiIcon name="journey" size={34} />
        </View>
        <View style={styles.learningSummaryCopy}>
          <Text style={styles.learningSummaryLabel}>
            {t('parent.settings.learningSummaryLabel')}
          </Text>
          <Text style={styles.learningSummaryTitle}>
            {t('parent.settings.learningSummaryTitle', {
              difficulty: currentDifficultyCopy.title,
              journey: currentJourneyCopy.title,
            })}
          </Text>
          <Text style={styles.learningSummarySubtitle}>
            {t('parent.settings.learningSummarySubtitle')}
          </Text>
        </View>
      </View>

      <View style={styles.learningSettingsList}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setLearningSettingsSheet('journey')}
          style={({ pressed }) => [
            styles.learningSettingsRow,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.learningSettingsRowIcon}>
            <AppUiIcon name="journey" size={30} />
          </View>
          <View style={styles.learningSettingsRowCopy}>
            <Text style={styles.learningSettingsRowTitle}>
              {t('parent.settings.journeyModeTitle')}
            </Text>
            <Text
              numberOfLines={2}
              style={styles.learningSettingsRowSubtitle}
            >
              {currentJourneyCopy.subtitle}
            </Text>
          </View>
          <View style={styles.learningSettingsRowValue}>
            <Text
              numberOfLines={2}
              style={styles.learningSettingsValueText}
            >
              {currentJourneyCopy.title}
            </Text>
            <Text style={styles.learningSettingsChevron}>›</Text>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => setLearningSettingsSheet('difficulty')}
          style={({ pressed }) => [
            styles.learningSettingsRow,
            styles.learningSettingsRowLast,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.learningSettingsRowIcon}>
            <AppUiIcon name="difficulty" size={30} />
          </View>
          <View style={styles.learningSettingsRowCopy}>
            <Text style={styles.learningSettingsRowTitle}>
              {t('parent.settings.difficultyTitle')}
            </Text>
            <Text
              numberOfLines={2}
              style={styles.learningSettingsRowSubtitle}
            >
              {currentDifficultyCopy.subtitle}
            </Text>
          </View>
          <View style={styles.learningSettingsRowValue}>
            <Text
              numberOfLines={2}
              style={styles.learningSettingsValueText}
            >
              {savingMode
                ? t('common.saveInProgress')
                : currentDifficultyCopy.title}
            </Text>
            <Text style={styles.learningSettingsChevron}>›</Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.learningInsight}>
        <Text style={styles.learningInsightLabel}>
          {t('parent.settings.difficultyInsightLabel')}
        </Text>
        <Text style={styles.learningInsightText}>
          {currentDifficultyCopy.detail}
        </Text>
      </View>

      <Modal
        visible={learningSettingsSheet !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setLearningSettingsSheet(null)}
      >
        <Pressable
          style={styles.learningSheetOverlay}
          onPress={() => setLearningSettingsSheet(null)}
        >
          <Pressable
            style={styles.learningSheet}
            onPress={event => event.stopPropagation()}
          >
            <View style={styles.learningSheetHeader}>
              <Text style={styles.learningSheetTitle}>
                {learningSettingsSheet === 'journey'
                  ? t('parent.settings.sheetJourneyTitle')
                  : t('parent.settings.sheetDifficultyTitle')}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setLearningSettingsSheet(null)}
                style={styles.learningSheetClose}
              >
                <Text style={styles.learningSheetCloseText}>
                  {t('common.close')}
                </Text>
              </Pressable>
            </View>

            {learningSettingsSheet === 'journey' ? (
              <View style={styles.learningSheetOptions}>
                {(['guided', 'free'] as const).map(mode => {
                  const isSelected = journeyMode === mode;
                  const title =
                    mode === 'guided'
                      ? t('parent.settings.journeyGuidedTitle')
                      : t('parent.settings.journeyFreeTitle');
                  const subtitle =
                    mode === 'guided'
                      ? t('parent.settings.journeyGuidedSubtitle')
                      : t('parent.settings.journeyFreeSubtitle');

                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      key={mode}
                      onPress={() => handleUpdateJourneyMode(mode)}
                      style={({ pressed }) => [
                        styles.learningSheetOption,
                        isSelected && styles.learningSheetOptionSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.learningSheetOptionCopy}>
                        <Text
                          style={[
                            styles.learningSheetOptionTitle,
                            isSelected &&
                              styles.learningSheetOptionTitleSelected,
                          ]}
                        >
                          {title}
                        </Text>
                        <Text style={styles.learningSheetOptionText}>
                          {subtitle}
                        </Text>
                      </View>
                      {isSelected && (
                        <Text style={styles.learningSheetCheck}>✓</Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View style={styles.learningSheetOptions}>
                {learningDifficultyOptions.map(option => {
                  const isSelected =
                    option.learningMode === learningMode;
                  const isSavingThisMode =
                    savingMode === option.learningMode;
                  const optionCopy = getLearningModeCopy(
                    option.learningMode,
                    t,
                  );

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
                        styles.learningSheetOption,
                        isSelected && styles.learningSheetOptionSelected,
                        pressed && !savingMode && styles.pressed,
                        savingMode &&
                          !isSavingThisMode &&
                          styles.optionDisabled,
                      ]}
                    >
                      <View style={styles.learningSheetOptionCopy}>
                        <Text
                          style={[
                            styles.learningSheetOptionTitle,
                            isSelected &&
                              styles.learningSheetOptionTitleSelected,
                          ]}
                        >
                          {isSavingThisMode
                            ? t('common.saveInProgress')
                            : optionCopy.title}
                        </Text>
                        <Text style={styles.learningSheetOptionText}>
                          {optionCopy.detail}
                        </Text>
                      </View>
                      {isSelected && (
                        <Text style={styles.learningSheetCheck}>✓</Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </AppCard>
  );

  if (!isUnlocked) {
    return (
      <Screen scroll withBottomSpace={false} keyboardAvoiding keyboardOffset={90}>
        <View style={styles.gateContainer}>
          <AppCard style={styles.gateCard}>
            <KidBadge tone="teal">{t('parent.gate.badge')}</KidBadge>
            <Text style={styles.title}>
              {t('parent.gate.challengeTitle')}
            </Text>
            <Text style={styles.gateHint}>
              {t('parent.gate.challengeHint')}
            </Text>
            <Text style={styles.gateQuestion}>
              {gateChallenge.expression} = ?
            </Text>
            <TextInput
              accessibilityLabel={t('parent.gate.challengePlaceholder')}
              editable={!isGateCoolingDown}
              keyboardType="number-pad"
              onChangeText={value => {
                setGateAnswer(value.replace(/[^0-9-]/g, ''));
                setGateError(false);
              }}
              onSubmitEditing={handleGateChallengeSubmit}
              placeholder={t('parent.gate.challengePlaceholder')}
              placeholderTextColor={colors.muted}
              returnKeyType="done"
              style={styles.gateAnswerInput}
              value={gateAnswer}
            />
            {isGateCoolingDown ? (
              <Text style={styles.gateError}>
                {t('parent.gate.challengeCooldown')}
              </Text>
            ) : gateError ? (
              <Text style={styles.gateError}>
                {t('parent.gate.challengeWrong')}
              </Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              disabled={isGateCoolingDown || gateAnswer.trim().length === 0}
              onPress={handleGateChallengeSubmit}
              style={({ pressed }) => [
                styles.gateButton,
                (isGateCoolingDown || gateAnswer.trim().length === 0) &&
                  styles.actionDisabled,
                pressed && styles.gateButtonActive,
              ]}
            >
              <Text style={styles.gateButtonText}>
                {t('parent.gate.challengeSubmit')}
              </Text>
            </Pressable>
          </AppCard>
        </View>
      </Screen>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <Screen scroll withBottomSpace={false} safeAreaEdges={['left', 'right']}>
        {activeTab === 'stats' && (
          <View style={styles.tabContent}>
            <ChildProfileCard
              profile={childProfile}
              onEditPress={() => setActiveTab('settings')}
            />

            <PremiumStatusCard
              onPress={() => navigation.navigate('Premium')}
              snapshot={monetizationSnapshot}
            />

            <PremiumUpgradeCard
              onPress={() => navigation.navigate('Premium')}
              snapshot={monetizationSnapshot}
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
                    <Text style={styles.todayEyebrowText}>{t('parent.stats.todayProgress')}</Text>
                  </View>
                  <Text numberOfLines={2} style={styles.todayTitle}>
                    {heroTitle}
                  </Text>
                  <Text numberOfLines={2} style={styles.todaySummary}>
                    {heroSummary}
                  </Text>
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
                        {t('parent.stats.streakDays')}
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
                  focusLessonTitle ?? t('parent.stats.lessonOfChild')
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
                <Text numberOfLines={1} style={styles.todayActionText}>
                  {heroAction}
                </Text>
                <Text style={styles.todayActionArrow}>→</Text>
              </Pressable>
            </AppCard>

            <Pressable
              accessibilityHint={t('parent.stats.openFocusLessonHint')}
              accessibilityLabel={`${focusLessonAction} ${
                focusLessonTitle ?? t('parent.stats.lesson')
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
                        ? focusLessonTitle ?? t('parent.stats.firstLesson')
                        : t('parent.stats.preparingPath')}
                    </Text>
                    {focusLessonSubtitle ? (
                      <Text
                        numberOfLines={2}
                        style={styles.currentLessonSubtitle}
                      >
                        {focusLessonSubtitle}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.lessonProgressMeta}>
                  <Text style={styles.currentLessonProgressText}>
                    {isDashboardReady
                      ? t('parent.stats.stationsProgress', { completed: String(completedFocusSceneCount), total: String(focusSceneCount) })
                      : t('parent.stats.loadingProgress')}
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
                  <AppUiIcon name="words" size={30} />
                  <Text style={styles.milestoneValue}>{learnedWordCount}</Text>
                  <Text style={styles.milestoneLabel}>
                    {t('parent.stats.wordsLearned')}
                  </Text>
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
                  <AppUiIcon name="lessonComplete" size={30} />
                  <Text style={styles.milestoneValue}>
                    {completedLessonCount}
                  </Text>
                  <Text style={styles.milestoneLabel}>
                    {t('parent.stats.lessonsCompleted')}
                  </Text>
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
                  <AppUiIcon name="reward" size={30} />
                  <Text style={styles.milestoneValue}>
                    {earnedStickerCount}
                  </Text>
                  <Text style={styles.milestoneLabel}>
                    {t('parent.stats.stickersEarned')}
                  </Text>
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
                  <KidBadge tone="sun">
                    {t('parent.stats.reviewBadge')}
                  </KidBadge>
                  <Text style={styles.reviewTitle}>
                    {isDashboardReady
                      ? reviewLesson
                        ? t('parent.stats.reviewTitle', {
                            lessonTitle: reviewLessonTitle,
                          })
                        : t('parent.stats.reviewFallbackTitle')
                      : t('parent.stats.reviewLoadingTitle')}
                  </Text>
                </View>
                <View style={styles.reviewIcon}>
                  <AppUiIcon name="review" size={56} />
                </View>
              </View>

              {reviewWords.length > 0 ? (
                <View style={styles.wordSection}>
                  <Text style={styles.wordSectionLabel}>
                    {t('parent.stats.recentWords')}
                  </Text>
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
                <Text style={styles.parentPromptLabel}>
                  {t('parent.stats.parentTip')}
                </Text>
                <Text numberOfLines={3} style={styles.parentPromptText}>
                  {tipText}
                </Text>
              </View>

              <Pressable
                accessibilityLabel={t('parent.stats.openReviewAccessibility')}
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
                  {!hasReviewLessonAccess
                    ? t('premium.openPlans')
                    : isReviewLessonReadyForGame &&
                      reviewLesson?.reviewGame?.type === 'memory'
                    ? t('parent.stats.playMemoryTogether')
                    : t('parent.stats.openReviewActivity')}
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
                  <KidBadge tone="teal">
                    {t('parent.stats.learningPathTitleDefault')}
                  </KidBadge>
                  <Text style={styles.lessonPlanOptionTitle}>
                    {t('parent.stats.allLessons')}
                  </Text>
                  <Text style={styles.learningPathSubtitle}>
                    {learningPathSubtitle}
                  </Text>
                </View>
                <View style={styles.learningPathCount}>
                  <Text style={styles.learningPathCountValue}>
                    {t('parent.stats.enabledLessons', { count: String(visibleLessons.length) })}
                  </Text>
                  {visibleLessons.length < journeyLessons.length ? (
                    <Text style={styles.learningPathCountLabel}>
                      {t('parent.stats.totalLessons', { total: String(journeyLessons.length) })}
                    </Text>
                  ) : null}
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
                {t('parent.stats.completedEnabledLessons', {
                  completed: String(completedVisibleLessonCount),
                  total: String(visibleLessons.length),
                })}
              </Text>
            </AppCard>

            <AppCard style={styles.lessonPlanCard}>
              <View style={styles.settingsCardHeader}>
                <Text style={styles.lessonPlanTitle}>
                  {t('parent.stats.selectLearningPace')}
                </Text>
              </View>

              <View style={styles.learningSummaryPanel}>
                <View style={styles.learningSummaryIcon}>
                  <AppUiIcon name="journey" size={34} />
                </View>
                <View style={styles.learningSummaryCopy}>
                  <Text style={styles.learningSummaryLabel}>
                    {t('parent.stats.currentPlanLabel')}
                  </Text>
                  <Text style={styles.learningSummaryTitle}>
                    {currentLessonPlanTitle}
                  </Text>
                  <Text style={styles.learningSummarySubtitle}>
                    {currentLessonPlanSubtitle}
                  </Text>
                </View>
              </View>

              <View style={styles.learningSettingsList}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: isFullJourneyEnabled }}
                  disabled={!isDashboardReady}
                  onPress={() => handleSelectLessonPlan()}
                  style={({ pressed }) => [
                    styles.learningSettingsRow,
                    isFullJourneyEnabled && styles.learningSettingsRowSelected,
                    !isDashboardReady && styles.optionDisabled,
                    pressed && isDashboardReady && styles.pressed,
                  ]}
                >
                  <View style={styles.learningSettingsRowIcon}>
                    <AppUiIcon name="journey" size={30} />
                  </View>
                  <View style={styles.learningSettingsRowCopy}>
                    <Text style={styles.learningSettingsRowTitle}>
                      {t('parent.stats.guidedPlanTitle')}
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={styles.learningSettingsRowSubtitle}
                    >
                      {t('parent.stats.guidedPlanSubtitle')}
                    </Text>
                  </View>
                  <Text style={styles.learningSettingsChevron}>
                    {isFullJourneyEnabled ? '✓' : '›'}
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: isGentlePlanEnabled }}
                  disabled={!isDashboardReady}
                  onPress={() => handleSelectLessonPlan(gentleLessonIds)}
                  style={({ pressed }) => [
                    styles.learningSettingsRow,
                    isGentlePlanEnabled && styles.learningSettingsRowSelected,
                    !isDashboardReady && styles.optionDisabled,
                    pressed && isDashboardReady && styles.pressed,
                  ]}
                >
                  <View style={styles.learningSettingsRowIcon}>
                    <AppUiIcon name="lesson" size={30} />
                  </View>
                  <View style={styles.learningSettingsRowCopy}>
                    <Text style={styles.learningSettingsRowTitle}>
                      {t('parent.stats.gentlePlanTitle')}
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={styles.learningSettingsRowSubtitle}
                    >
                      {t('parent.stats.gentleLessons', {
                        count: String(gentleLessonIds.length),
                      })}
                    </Text>
                  </View>
                  <Text style={styles.learningSettingsChevron}>
                    {isGentlePlanEnabled ? '✓' : '›'}
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: isCustomPlanActive }}
                  disabled={!isDashboardReady}
                  onPress={handleOpenCustomPlan}
                  style={({ pressed }) => [
                    styles.learningSettingsRow,
                    styles.learningSettingsRowLast,
                    isCustomPlanActive && styles.learningSettingsRowSelected,
                    !isDashboardReady && styles.optionDisabled,
                    pressed && isDashboardReady && styles.pressed,
                  ]}
                >
                  <View style={styles.learningSettingsRowIcon}>
                    <AppUiIcon name="custom" size={30} />
                  </View>
                  <View style={styles.learningSettingsRowCopy}>
                    <Text style={styles.learningSettingsRowTitle}>
                      {t('parent.stats.customPlanTitle')}
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={styles.learningSettingsRowSubtitle}
                    >
                      {t('parent.stats.customLessons')}
                    </Text>
                  </View>
                  <Text style={styles.learningSettingsChevron}>
                    {isCustomPlanActive ? '✓' : '›'}
                  </Text>
                </Pressable>
              </View>

              {isCustomPlanActive ? (
                <View style={styles.customPlanNotice}>
                  <View style={styles.customPlanNoticeDot} />
                  <Text style={styles.customPlanNoticeText}>
                    {t('parent.stats.customLessonsHint')}
                  </Text>
                </View>
              ) : null}
            </AppCard>

            {renderLearningSettingsCard()}

            <View style={styles.lessonSectionHeading}>
              <View style={styles.lessonSectionHeadingCopy}>
                <Text style={styles.lessonSectionHeadingTitle}>
                  {t('parent.stats.themeListTitle')}
                </Text>
              </View>
              {isCustomPlanActive ? (
                <KidBadge tone="sky">
                  {t('parent.stats.customPlanBadge')}
                </KidBadge>
              ) : null}
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
                          {getLocalizedThemeTitle(theme, appLanguage)}
                        </Text>
                        <Text style={styles.lessonSectionSubtitle}>
                          {t('parent.stats.completedLessonsOfTotal', { completed: String(completedCount), total: String(themeLessons.length) })}
                          {' · '}
                          {t('parent.stats.visibleLessonsCount', { count: String(visibleCount) })}
                        </Text>
                      </View>
                      <Text style={styles.lessonSectionExpandIcon}>
                        {isExpanded ? '⌃' : '⌄'}
                      </Text>
                    </Pressable>

                    {isExpanded ? (
                      <View style={styles.managedLessonList}>
                        {themeLessons.map((lesson, index) => {
                          const lessonTitle = getLocalizedLessonTitle(
                            lesson,
                            appLanguage,
                          );
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
                          const hasLessonAccess = canAccessLesson(
                            lesson.id,
                            monetizationSnapshot,
                          );
                          const lessonWords = hasLessonAccess
                            ? getLessonVocabularyForLearningMode(
                                lesson,
                                learningMode,
                              )
                                .slice(0, 3)
                                .map(item => item.word)
                            : [];
                          const lessonState = !hasLessonAccess
                            ? t('premium.lessonRow.badge')
                            : !isVisible
                            ? t('parent.stats.lessonStateHidden')
                            : isCurrentLesson && hasCompletedAllScenes
                            ? t('parent.stats.lessonStateReadyToReview')
                            : isCurrentLesson
                            ? t('parent.stats.lessonStateLearning')
                            : isCompleted
                            ? t('parent.stats.lessonStateCompleted')
                            : hasCompletedAllScenes
                            ? t('parent.stats.lessonStateAwaitingReview')
                            : completedSceneCount > 0
                            ? t('parent.stats.lessonStateContinuing')
                            : t('parent.stats.lessonStateReady');

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
                                  accessibilityLabel={
                                    hasLessonAccess
                                      ? undefined
                                      : t(
                                          'premium.lessonRow.openPlansAccessibility',
                                          { lessonTitle },
                                        )
                                  }
                                  accessibilityRole="button"
                                  accessibilityState={{
                                    expanded: hasLessonAccess
                                      ? isSelected
                                      : false,
                                  }}
                                  onPress={() => {
                                    if (!hasLessonAccess) {
                                      handleOpenLesson(lesson.id);
                                      return;
                                    }

                                    setSelectedLessonId(
                                      isSelected ? null : lesson.id,
                                    );
                                  }}
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
                                    <Text style={styles.managedLessonTitle}>
                                      {lessonTitle}
                                    </Text>
                                    <Text
                                      style={[
                                        styles.managedLessonSubtitle,
                                        isCurrentLesson &&
                                          styles.managedLessonStateCurrent,
                                        isCompleted &&
                                          styles.managedLessonStateDone,
                                        !isVisible &&
                                          styles.managedLessonStateHidden,
                                      ]}
                                    >
                                      {lessonState}
                                      {' · '}
                                      {t('parent.stats.stationsTotal', {
                                        count: String(lesson.scenes.length),
                                      })}
                                    </Text>
                                    {!hasLessonAccess ? (
                                      <PremiumLessonLockIndicator
                                        compact={isCompactDashboard}
                                      />
                                    ) : null}
                                  </View>
                                  <Text style={styles.managedLessonChevron}>
                                    {isSelected ? '⌃' : '›'}
                                  </Text>
                                </Pressable>
                                <Switch
                                  accessibilityLabel={
                                    isVisible
                                      ? t('parent.stats.hideLessonAccessibility', {
                                          lessonTitle,
                                        })
                                      : t('parent.stats.showLessonAccessibility', {
                                          lessonTitle,
                                        })
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
                                    {hasLessonAccess
                                      ? t('parent.stats.lessonPreviewLabel')
                                      : t('premium.parentLockedMessage')}
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
                                      hasLessonAccess
                                        ? t('parent.stats.viewLessonPrefix') +
                                          lessonTitle
                                        : t(
                                            'premium.lessonRow.openPlansAccessibility',
                                            { lessonTitle },
                                          )
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
                                      {hasLessonAccess
                                        ? t('parent.stats.viewLesson')
                                        : t('premium.openPlans')}
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
            <View style={styles.settingsHero}>
              <KidBadge tone="teal">{t('parent.settings.heroBadge')}</KidBadge>
              <Text style={styles.settingsHeroTitle}>
                {t('parent.settings.heroTitle', { name: childDisplayName })}
              </Text>
              <Text style={styles.settingsHeroSubtitle}>
                {t('parent.settings.heroSubtitle')}
              </Text>
            </View>

            <AppCard style={styles.profileSettingsCard}>
              <View style={styles.profileSummary}>
                <View style={styles.profileMascot}>
                  <MascotImage decorative pose="avatar" size={64} />
                </View>
                <View style={styles.profileSummaryCopy}>
                  <KidBadge tone="sky">
                    {t('parent.settings.profileBadge')}
                  </KidBadge>
                  <Text style={styles.profileSummaryName}>
                    {childDisplayName}
                  </Text>
                  <Text style={styles.profileSummaryMeta}>
                    {childAge && childAge > 0
                      ? t('parent.settings.childAge', { age: childAge })
                      : t('parent.settings.profileMissingBirthYear')}
                  </Text>
                </View>
              </View>

              <View style={styles.settingsInputRow}>
                <View style={styles.settingTextGroup}>
                  <Text style={styles.settingsFieldLabel}>
                    {t('parent.settings.displayNameLabel')}
                  </Text>
                </View>
                <TextInput
                  style={styles.settingsTextInput}
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
                  placeholder={t('parent.settings.displayNamePlaceholder')}
                  placeholderTextColor={colors.muted}
                  maxLength={20}
                />
              </View>

              <View style={styles.settingsInputRow}>
                <View style={styles.settingTextGroup}>
                  <Text style={styles.settingsFieldLabel}>
                    {t('parent.settings.birthYearLabel')}
                  </Text>
                </View>
                <Pressable
                  style={styles.settingsTextInputSmall}
                  onPress={() => setShowYearPicker(true)}
                >
                  <Text style={styles.yearPickerButtonText}>
                    {childProfile.birthYear?.toString() ??
                      t('parent.settings.birthYearPlaceholder')}
                  </Text>
                </Pressable>
              </View>

              <Modal
                visible={showYearPicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowYearPicker(false)}
              >
                <Pressable
                  style={styles.yearPickerOverlay}
                  onPress={() => setShowYearPicker(false)}
                >
                  <View style={styles.yearPickerSheet}>
                    <View style={styles.yearPickerHeader}>
                      <Text style={styles.yearPickerTitle}>
                        {t('parent.settings.yearPickerTitle')}
                      </Text>
                    </View>
                    <FlatList
                      data={Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i)}
                      keyExtractor={item => item.toString()}
                      renderItem={({ item }) => {
                        const isSelected = childProfile.birthYear === item;
                        return (
                          <Pressable
                            style={[
                              styles.yearPickerItem,
                              isSelected && styles.yearPickerItemSelected,
                            ]}
                            onPress={() => {
                              const next = { ...childProfile, birthYear: item };
                              setChildProfile(next);
                              saveParentSettings({ childProfile: next });
                              setShowYearPicker(false);
                            }}
                          >
                            <Text
                              style={[
                                styles.yearPickerItemText,
                                isSelected && styles.yearPickerItemTextSelected,
                              ]}
                            >
                              {item}
                            </Text>
                            {isSelected && (
                              <Text style={styles.yearPickerCheckmark}>✓</Text>
                            )}
                          </Pressable>
                        );
                      }}
                    />
                  </View>
                </Pressable>
              </Modal>
            </AppCard>

            <AppCard style={styles.dailySettingsCard}>
              <View style={styles.settingsCardHeader}>
                <KidBadge tone="sun">{t('parent.settings.dailyBadge')}</KidBadge>
                <Text style={styles.dailySettingsTitle}>
                  {t('parent.settings.dailyTitle')}
                </Text>
              </View>

              <View style={styles.learningSummaryPanel}>
                <View style={styles.learningSummaryIcon}>
                  <AppUiIcon name="daily" size={34} />
                </View>
                <View style={styles.learningSummaryCopy}>
                  <Text style={styles.learningSummaryLabel}>
                    {t('parent.settings.dailySummaryLabel')}
                  </Text>
                  <Text style={styles.learningSummaryTitle}>
                    {reminderEnabled
                      ? t('parent.settings.dailySummaryEnabled', {
                          time: reminderTime,
                        })
                      : t('parent.settings.dailySummaryDisabled')}
                  </Text>
                  <Text style={styles.learningSummarySubtitle}>
                    {t('parent.settings.dailySummarySubtitle')}
                  </Text>
                </View>
              </View>

              <View style={styles.learningSettingsList}>
                <View style={styles.learningSettingsRow}>
                  <View style={styles.learningSettingsRowIcon}>
                    <AppUiIcon name="reminder" size={30} />
                  </View>
                  <View style={styles.learningSettingsRowCopy}>
                    <Text style={styles.learningSettingsRowTitle}>
                      {t('parent.settings.reminderTitle')}
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={styles.learningSettingsRowSubtitle}
                    >
                      {reminderEnabled
                        ? t('parent.settings.reminderEnabled', {
                            time: reminderTime,
                          })
                        : t('parent.settings.reminderDisabled')}
                    </Text>
                  </View>
                  <Switch
                    value={reminderEnabled}
                    onValueChange={handleToggleReminder}
                    trackColor={{ false: colors.border, true: colors.primary }}
                  />
                </View>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => setShowTimePicker(true)}
                  style={({ pressed }) => [
                    styles.learningSettingsRow,
                    styles.learningSettingsRowLast,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.learningSettingsRowIcon}>
                    <AppUiIcon name="clock" size={30} />
                  </View>
                  <View style={styles.learningSettingsRowCopy}>
                    <Text style={styles.learningSettingsRowTitle}>
                      {t('parent.settings.reminderTimeTitle')}
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={styles.learningSettingsRowSubtitle}
                    >
                      {t('parent.settings.reminderTimeSubtitle')}
                    </Text>
                  </View>
                  <View style={styles.learningSettingsRowValue}>
                    <Text style={styles.learningSettingsValueText}>
                      {reminderTime}
                    </Text>
                    <Text style={styles.learningSettingsChevron}>›</Text>
                  </View>
                </Pressable>
              </View>

              {showTimePicker && (
                <DateTimePicker
                  value={(() => {
                    const d = new Date();
                    const [h, m] = reminderTime.split(':').map(Number);
                    d.setHours(h);
                    d.setMinutes(m);
                    return d;
                  })()}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                />
              )}
            </AppCard>

            <AppCard style={styles.appExperienceCard}>
              <View style={styles.settingsCardHeader}>
                <KidBadge tone="sky">
                  {t('parent.settings.appExperienceBadge')}
                </KidBadge>
                <Text style={styles.appSettingsTitle}>
                  {t('parent.settings.appExperienceTitle')}
                </Text>
              </View>

              <View style={styles.learningSettingsList}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setAppSettingsSheet('language')}
                  style={({ pressed }) => [
                    styles.learningSettingsRow,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.learningSettingsRowIcon}>
                    <AppUiIcon name="language" size={30} />
                  </View>
                  <View style={styles.learningSettingsRowCopy}>
                    <Text style={styles.learningSettingsRowTitle}>
                      {t('parent.settings.appLanguageTitle')}
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={styles.learningSettingsRowSubtitle}
                    >
                      {t('parent.settings.appLanguageSubtitle')}
                    </Text>
                  </View>
                  <View style={styles.learningSettingsRowValue}>
                    <Text
                      numberOfLines={2}
                      style={styles.learningSettingsValueText}
                    >
                      {currentLanguageTitle}
                    </Text>
                    <Text style={styles.learningSettingsChevron}>›</Text>
                  </View>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => setAppSettingsSheet('teacherPrompt')}
                  style={({ pressed }) => [
                    styles.learningSettingsRow,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.learningSettingsRowIcon}>
                    <AppUiIcon name="teacher" size={30} />
                  </View>
                  <View style={styles.learningSettingsRowCopy}>
                    <Text style={styles.learningSettingsRowTitle}>
                      {t('parent.settings.teacherPromptTitle')}
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={styles.learningSettingsRowSubtitle}
                    >
                      {t('parent.settings.teacherPromptSubtitle')}
                    </Text>
                  </View>
                  <View style={styles.learningSettingsRowValue}>
                    <Text
                      numberOfLines={2}
                      style={styles.learningSettingsValueText}
                    >
                      {currentTeacherPromptTitle}
                    </Text>
                    <Text style={styles.learningSettingsChevron}>›</Text>
                  </View>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => setAppSettingsSheet('englishAccent')}
                  style={({ pressed }) => [
                    styles.learningSettingsRow,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.learningSettingsRowIcon}>
                    <AppUiIcon name="language" size={30} />
                  </View>
                  <View style={styles.learningSettingsRowCopy}>
                    <Text style={styles.learningSettingsRowTitle}>
                      {t('parent.settings.englishAccentTitle')}
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={styles.learningSettingsRowSubtitle}
                    >
                      {t('parent.settings.englishAccentSubtitle')}
                    </Text>
                  </View>
                  <View style={styles.learningSettingsRowValue}>
                    <Text
                      numberOfLines={2}
                      style={styles.learningSettingsValueText}
                    >
                      {currentEnglishAccentTitle}
                    </Text>
                    <Text style={styles.learningSettingsChevron}>›</Text>
                  </View>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => setAppSettingsSheet('theme')}
                  style={({ pressed }) => [
                    styles.learningSettingsRow,
                    styles.learningSettingsRowLast,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.learningSettingsRowIcon}>
                    <AppUiIcon name="theme" size={30} />
                  </View>
                  <View style={styles.learningSettingsRowCopy}>
                    <Text style={styles.learningSettingsRowTitle}>
                      {t('parent.settings.themeTitle')}
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={styles.learningSettingsRowSubtitle}
                    >
                      {t('parent.settings.themeSubtitle')}
                    </Text>
                  </View>
                  <View style={styles.learningSettingsRowValue}>
                    <Text
                      numberOfLines={2}
                      style={styles.learningSettingsValueText}
                    >
                      {currentThemeTitle}
                    </Text>
                    <Text style={styles.learningSettingsChevron}>›</Text>
                  </View>
                </Pressable>
              </View>

              <Modal
                visible={appSettingsSheet !== null}
                transparent
                animationType="slide"
                onRequestClose={() => setAppSettingsSheet(null)}
              >
                <Pressable
                  style={styles.learningSheetOverlay}
                  onPress={() => setAppSettingsSheet(null)}
                >
                  <Pressable
                    style={styles.learningSheet}
                    onPress={event => event.stopPropagation()}
                  >
                    <View style={styles.learningSheetHeader}>
                      <Text style={styles.learningSheetTitle}>
                        {appSettingsSheet === 'language'
                          ? t('parent.settings.sheetLanguageTitle')
                          : appSettingsSheet === 'teacherPrompt'
                          ? t('parent.settings.sheetTeacherPromptTitle')
                          : appSettingsSheet === 'englishAccent'
                          ? t('parent.settings.sheetEnglishAccentTitle')
                          : t('parent.settings.sheetThemeTitle')}
                      </Text>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => setAppSettingsSheet(null)}
                        style={styles.learningSheetClose}
                      >
                        <Text style={styles.learningSheetCloseText}>
                          {t('common.close')}
                        </Text>
                      </Pressable>
                    </View>

                    {appSettingsSheet === 'language' && (
                      <View style={styles.learningSheetOptions}>
                        {(['vi', 'en'] as const).map(language => {
                          const isSelected = appLanguage === language;
                          const title =
                            language === 'vi'
                              ? t('parent.settings.appLanguageVietnamese')
                              : t('parent.settings.appLanguageEnglish');

                          return (
                            <Pressable
                              accessibilityRole="button"
                              accessibilityState={{ selected: isSelected }}
                              key={language}
                              onPress={() => handleUpdateLanguage(language)}
                              style={({ pressed }) => [
                                styles.learningSheetOption,
                                isSelected &&
                                  styles.learningSheetOptionSelected,
                                pressed && styles.pressed,
                              ]}
                            >
                              <View style={styles.learningSheetOptionCopy}>
                                <Text
                                  style={[
                                    styles.learningSheetOptionTitle,
                                    isSelected &&
                                      styles.learningSheetOptionTitleSelected,
                                  ]}
                                >
                                  {title}
                                </Text>
                              </View>
                              {isSelected && (
                                <Text style={styles.learningSheetCheck}>✓</Text>
                              )}
                            </Pressable>
                          );
                        })}
                      </View>
                    )}

                    {appSettingsSheet === 'teacherPrompt' && (
                      <View style={styles.learningSheetOptions}>
                        {(appLanguage === 'en'
                          ? (['en', 'vi'] as const)
                          : (['vi', 'en', 'bilingual'] as const)
                        ).map(mode => {
                          const isSelected = teacherPromptMode === mode;
                          const title =
                            mode === 'vi'
                              ? t('parent.settings.teacherPromptVietnamese')
                              : mode === 'en'
                              ? t('parent.settings.teacherPromptEnglish')
                              : t('parent.settings.teacherPromptBilingual');

                          return (
                            <Pressable
                              accessibilityRole="button"
                              accessibilityState={{ selected: isSelected }}
                              key={mode}
                              onPress={() =>
                                handleUpdateTeacherPromptMode(mode)
                              }
                              style={({ pressed }) => [
                                styles.learningSheetOption,
                                isSelected &&
                                  styles.learningSheetOptionSelected,
                                pressed && styles.pressed,
                              ]}
                            >
                              <View style={styles.learningSheetOptionCopy}>
                                <Text
                                  style={[
                                    styles.learningSheetOptionTitle,
                                    isSelected &&
                                      styles.learningSheetOptionTitleSelected,
                                  ]}
                                >
                                  {title}
                                </Text>
                              </View>
                              {isSelected && (
                                <Text style={styles.learningSheetCheck}>✓</Text>
                              )}
                            </Pressable>
                          );
                        })}
                      </View>
                    )}

                    {appSettingsSheet === 'englishAccent' && (
                      <View style={styles.learningSheetOptions}>
                        {(['en-US', 'en-GB'] as const).map(accent => {
                          const isSelected = englishAccent === accent;
                          const isAmerican = accent === 'en-US';
                          const title = isAmerican
                            ? t('parent.settings.englishAccentAmerican')
                            : t('parent.settings.englishAccentBritish');
                          const subtitle = isAmerican
                            ? t(
                                'parent.settings.englishAccentAmericanSubtitle',
                              )
                            : t(
                                'parent.settings.englishAccentBritishSubtitle',
                              );

                          return (
                            <Pressable
                              accessibilityRole="button"
                              accessibilityState={{ selected: isSelected }}
                              key={accent}
                              onPress={() =>
                                handleUpdateEnglishAccent(accent)
                              }
                              style={({ pressed }) => [
                                styles.learningSheetOption,
                                isSelected &&
                                  styles.learningSheetOptionSelected,
                                pressed && styles.pressed,
                              ]}
                            >
                              <View style={styles.learningSheetOptionCopy}>
                                <Text
                                  style={[
                                    styles.learningSheetOptionTitle,
                                    isSelected &&
                                      styles.learningSheetOptionTitleSelected,
                                  ]}
                                >
                                  {title}
                                </Text>
                                <Text style={styles.learningSheetOptionText}>
                                  {subtitle}
                                </Text>
                              </View>
                              {isSelected && (
                                <Text style={styles.learningSheetCheck}>✓</Text>
                              )}
                            </Pressable>
                          );
                        })}
                      </View>
                    )}

                    {appSettingsSheet === 'theme' && (
                      <View style={styles.learningSheetOptions}>
                        {(['light', 'dark', 'system'] as const).map(theme => {
                          const isSelected = appTheme === theme;
                          const title =
                            theme === 'light'
                              ? t('parent.settings.themeLight')
                              : theme === 'dark'
                              ? t('parent.settings.themeDark')
                              : t('common.auto');

                          return (
                            <Pressable
                              accessibilityRole="button"
                              accessibilityState={{ selected: isSelected }}
                              key={theme}
                              onPress={() => handleUpdateTheme(theme)}
                              style={({ pressed }) => [
                                styles.learningSheetOption,
                                isSelected &&
                                  styles.learningSheetOptionSelected,
                                pressed && styles.pressed,
                              ]}
                            >
                              <View style={styles.learningSheetOptionCopy}>
                                <Text
                                  style={[
                                    styles.learningSheetOptionTitle,
                                    isSelected &&
                                      styles.learningSheetOptionTitleSelected,
                                  ]}
                                >
                                  {title}
                                </Text>
                              </View>
                              {isSelected && (
                                <Text style={styles.learningSheetCheck}>✓</Text>
                              )}
                            </Pressable>
                          );
                        })}
                      </View>
                    )}
                  </Pressable>
                </Pressable>
              </Modal>
            </AppCard>

            <ParentAccountCard />

            <AppCard style={styles.privacyCard}>
              <Text style={styles.privacyTitle}>
                {t('parent.privacy.title')}
              </Text>
              <Text style={styles.privacyText}>
                {t('parent.privacy.text')}
              </Text>
            </AppCard>

            {__DEV__ && (
              <AppCard style={styles.settingsCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleGroup}>
                    <KidBadge tone="alert">DEV ONLY</KidBadge>
                    <Text style={styles.privacyTitle}>
                      {t('parent.dev.internalTools')}
                    </Text>
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
                      {t('parent.dev.editorSubtitle')}
                    </Text>
                  </View>
                  <Text style={styles.difficultyState}>
                    {enableSceneEditor
                      ? t('parent.dev.editorStateOn')
                      : t('parent.dev.editorStateOff')}
                  </Text>
                </Pressable>
              </AppCard>
            )}

            <AppCard style={styles.appExperienceCard}>
              <View style={styles.settingsCardHeader}>
                <KidBadge tone="teal">
                  {t('parent.support.badge')}
                </KidBadge>
                <Text style={styles.appSettingsTitle}>
                  {t('parent.support.title')}
                </Text>
              </View>

              <View style={styles.learningSettingsList}>
                <Pressable
                  accessibilityLabel={t('parent.support.emailAccessibility')}
                  accessibilityRole="button"
                  onPress={handleContactSupport}
                  style={({ pressed }) => [
                    styles.learningSettingsRow,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.learningSettingsRowIcon}>
                    <AppUiIcon name="language" size={30} />
                  </View>
                  <View style={styles.learningSettingsRowCopy}>
                    <Text style={styles.learningSettingsRowTitle}>
                      {t('parent.support.contactTitle')}
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={styles.learningSettingsRowSubtitle}
                    >
                      {t('parent.support.contactSubtitle')}
                    </Text>
                  </View>
                  <Text style={styles.learningSettingsChevron}>›</Text>
                </Pressable>

                <View
                  accessibilityLabel={t('parent.support.versionAccessibility', {
                    version: APP_VERSION,
                  })}
                  style={[
                    styles.learningSettingsRow,
                    styles.learningSettingsRowLast,
                  ]}
                >
                  <View style={styles.learningSettingsRowIcon}>
                    <AppUiIcon name="settings" size={30} />
                  </View>
                  <View style={styles.learningSettingsRowCopy}>
                    <Text style={styles.learningSettingsRowTitle}>
                      {t('parent.support.versionTitle')}
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={styles.learningSettingsRowSubtitle}
                    >
                      {t('parent.support.versionSubtitle')}
                    </Text>
                  </View>
                  <View style={styles.learningSettingsRowValue}>
                    <Text style={styles.learningSettingsValueText}>
                      {t('parent.support.versionValue', {
                        version: APP_VERSION,
                      })}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.legalLinksRow}>
                {monetizationConfig.privacyPolicyUrl.trim() ? (
                  <Pressable
                    accessibilityRole="link"
                    onPress={() => {
                      Linking.openURL(monetizationConfig.privacyPolicyUrl).catch(
                        () => undefined,
                      );
                    }}
                  >
                    <Text style={styles.legalLinkText}>
                      {t('premium.legal.privacy')}
                    </Text>
                  </Pressable>
                ) : null}
                {monetizationConfig.termsOfUseUrl.trim() ? (
                  <Pressable
                    accessibilityRole="link"
                    onPress={() => {
                      Linking.openURL(monetizationConfig.termsOfUseUrl).catch(
                        () => undefined,
                      );
                    }}
                  >
                    <Text style={styles.legalLinkText}>
                      {t('premium.legal.terms')}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </AppCard>
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
            <View
              style={[
                styles.bottomTabIconFrame,
                activeTab === 'stats' && styles.bottomTabIconFrameActive,
              ]}
            >
              <AppUiIcon
                name="stats"
                size={28}
                style={[
                  styles.bottomTabIcon,
                  activeTab !== 'stats' && styles.bottomTabIconInactive,
                ]}
              />
            </View>
            <Text
              style={[
                styles.bottomTabText,
                activeTab === 'stats' && styles.bottomTabTextActive,
              ]}
            >
              {t('parent.tabs.stats')}
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
            <View
              style={[
                styles.bottomTabIconFrame,
                activeTab === 'lessons' && styles.bottomTabIconFrameActive,
              ]}
            >
              <AppUiIcon
                name="lesson"
                size={28}
                style={[
                  styles.bottomTabIcon,
                  activeTab !== 'lessons' && styles.bottomTabIconInactive,
                ]}
              />
            </View>
            <Text
              style={[
                styles.bottomTabText,
                activeTab === 'lessons' && styles.bottomTabTextActive,
              ]}
            >
              {t('parent.tabs.lessons')}
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
            <View
              style={[
                styles.bottomTabIconFrame,
                activeTab === 'settings' && styles.bottomTabIconFrameActive,
              ]}
            >
              <AppUiIcon
                name="settings"
                size={28}
                style={[
                  styles.bottomTabIcon,
                  activeTab !== 'settings' && styles.bottomTabIconInactive,
                ]}
              />
            </View>
            <Text
              style={[
                styles.bottomTabText,
                activeTab === 'settings' && styles.bottomTabTextActive,
              ]}
            >
              {t('parent.tabs.settings')}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = createThemedStyles(() => ({
  achievementCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
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
    gap: spacing.sm,
    padding: spacing.md,
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
    height: 64,
    justifyContent: 'center',
    width: 64,
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
  appSettingsDivider: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: spacing.xs,
  },
  appSettingsTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  appExperienceCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    gap: spacing.md,
  },
  dailySettingsCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderWarm,
    borderWidth: 1,
    gap: spacing.md,
  },
  dailySettingsSubtitle: {
    color: colors.textSoft,
    ...typography.caption,
  },
  dailySettingsTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  difficultyChoice: {
    alignItems: 'center',
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xxs,
    justifyContent: 'center',
    minHeight: 72,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  difficultyChoiceActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  difficultyChoices: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  difficultyChoiceSubtitle: {
    color: colors.textSoft,
    textAlign: 'center',
    ...typography.caption,
  },
  difficultyChoiceSubtitleActive: {
    color: colors.surface,
  },
  difficultyChoiceTitle: {
    color: colors.text,
    textAlign: 'center',
    ...typography.caption,
  },
  difficultyChoiceTitleActive: {
    color: colors.surface,
  },
  difficultyCurrentLabel: {
    color: colors.primaryDark,
    ...typography.caption,
  },
  difficultyHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  difficultyInsight: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xxs,
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  difficultyInsightLabel: {
    color: colors.primaryDark,
    ...typography.caption,
  },
  difficultyInsightText: {
    color: colors.text,
    ...typography.caption,
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  gateHint: {
    color: colors.textSoft,
    ...typography.body,
  },
  gateQuestion: {
    color: colors.text,
    textAlign: 'center',
    ...typography.hero,
  },
  gateAnswerInput: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    color: colors.text,
    minHeight: 56,
    paddingHorizontal: spacing.md,
    textAlign: 'center',
    ...typography.title,
  },
  gateError: {
    color: colors.alert,
    textAlign: 'center',
    ...typography.caption,
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
  journeyChoice: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xxs,
    minHeight: 86,
    padding: spacing.sm,
  },
  journeyChoiceActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  journeyChoiceSubtitle: {
    color: colors.textSoft,
    ...typography.caption,
  },
  journeyChoiceSubtitleActive: {
    color: colors.surface,
  },
  journeyChoices: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  journeyChoiceTitle: {
    color: colors.text,
    ...typography.caption,
  },
  journeyChoiceTitleActive: {
    color: colors.surface,
  },
  journeyChoiceWarm: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
  },
  learningPathCard: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.primary,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  learningPathCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  learningPathCount: {
    alignItems: 'flex-end',
    flexShrink: 1,
    gap: spacing.xxs,
  },
  learningPathCountLabel: {
    color: colors.textSoft,
    ...typography.caption,
  },
  learningPathCountValue: {
    color: colors.primaryDark,
    ...typography.subtitle,
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
  learningSettingsCard: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 1,
    gap: spacing.md,
  },
  learningSettingsDivider: {
    backgroundColor: colors.border,
    height: 1,
  },
  learningSettingsSubtitle: {
    color: colors.textSoft,
    ...typography.caption,
  },
  learningSettingsTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  learningInsight: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xxs,
    padding: spacing.sm,
  },
  learningInsightLabel: {
    color: colors.primaryDark,
    ...typography.caption,
  },
  learningInsightText: {
    color: colors.textSoft,
    ...typography.caption,
  },
  learningSettingsChevron: {
    color: colors.primaryDark,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 28,
  },
  learningSettingsList: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  learningSettingsRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 72,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  learningSettingsRowCopy: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  learningSettingsRowIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceBlue,
    borderRadius: radius.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  learningSettingsRowLast: {
    borderBottomWidth: 0,
  },
  learningSettingsRowSelected: {
    backgroundColor: colors.primarySoft,
  },
  learningSettingsRowSubtitle: {
    color: colors.textSoft,
    ...typography.caption,
  },
  learningSettingsRowTitle: {
    color: colors.text,
    ...typography.caption,
  },
  learningSettingsRowValue: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    gap: spacing.xxs,
    justifyContent: 'flex-end',
    maxWidth: '40%',
    minWidth: 72,
  },
  learningSettingsValueText: {
    color: colors.primaryDark,
    flexShrink: 1,
    textAlign: 'right',
    ...typography.caption,
  },
  learningSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    gap: spacing.md,
    maxHeight: '82%',
    paddingBottom: spacing.xl,
  },
  learningSheetCheck: {
    color: colors.primaryDark,
    fontSize: 20,
    fontWeight: '900',
  },
  learningSheetClose: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  learningSheetCloseText: {
    color: colors.primaryDark,
    ...typography.caption,
  },
  learningSheetHeader: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  learningSheetOption: {
    alignItems: 'center',
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 72,
    padding: spacing.md,
  },
  learningSheetOptionCopy: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  learningSheetOptionSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  learningSheetOptionText: {
    color: colors.textSoft,
    ...typography.caption,
  },
  learningSheetOptionTitle: {
    color: colors.text,
    ...typography.body,
  },
  learningSheetOptionTitleSelected: {
    color: colors.primaryDark,
  },
  learningSheetOptions: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  learningSheetOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  learningSheetTitle: {
    color: colors.text,
    flex: 1,
    ...typography.subtitle,
  },
  learningSummaryCopy: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  learningSummaryIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  learningSummaryLabel: {
    color: colors.primaryDark,
    ...typography.caption,
  },
  learningSummaryPanel: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  learningSummarySubtitle: {
    color: colors.textSoft,
    ...typography.caption,
  },
  learningSummaryTitle: {
    color: colors.text,
    ...typography.body,
  },
  lessonPlanCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    gap: spacing.md,
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
  preferenceChoice: {
    alignItems: 'center',
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
    minWidth: 52,
    paddingHorizontal: spacing.sm,
  },
  preferenceChoiceActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  preferenceChoices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxs,
    justifyContent: 'flex-end',
    maxWidth: '64%',
  },
  preferenceChoiceText: {
    color: colors.textSoft,
    textAlign: 'center',
    ...typography.caption,
  },
  preferenceChoiceTextActive: {
    color: colors.surface,
  },
  preferenceCopy: {
    flex: 1,
    gap: spacing.xxs,
    paddingRight: spacing.sm,
  },
  preferenceRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
  },
  preferenceSubtitle: {
    color: colors.textSoft,
    ...typography.caption,
  },
  preferenceTitle: {
    color: colors.text,
    ...typography.caption,
  },
  profileMascot: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 76,
    justifyContent: 'center',
    width: 76,
  },
  profileSettingsCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    gap: spacing.md,
  },
  profileSummary: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  profileSummaryCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  profileSummaryMeta: {
    color: colors.textSoft,
    ...typography.caption,
  },
  profileSummaryName: {
    color: colors.text,
    ...typography.subtitle,
  },
  reminderClock: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.lg,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  reminderClockText: {
    fontSize: 26,
  },
  reminderCopy: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  reminderPanel: {
    alignItems: 'center',
    backgroundColor: colors.backgroundWarm,
    borderColor: colors.borderWarm,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  reminderSubtitle: {
    color: colors.textSoft,
    ...typography.caption,
  },
  reminderTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
  settingSection: {
    gap: spacing.sm,
  },
  settingSectionTitle: {
    color: colors.text,
    ...typography.body,
  },
  settingsCardHeader: {
    gap: spacing.xs,
  },
  settingsFieldLabel: {
    color: colors.text,
    ...typography.caption,
  },
  settingsHero: {
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  settingsHeroSubtitle: {
    color: colors.textSoft,
    ...typography.caption,
  },
  settingsHeroTitle: {
    color: colors.text,
    ...typography.title,
  },
  settingsInputRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  settingsTextInput: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    color: colors.text,
    minWidth: 136,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    textAlign: 'right',
    ...typography.caption,
  },
  settingsTextInputSmall: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    color: colors.text,
    minWidth: 108,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    textAlign: 'right',
    ...typography.caption,
  },
  gateButton: {
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
  gateButtonActive: {
    backgroundColor: colors.secondaryDark,
  },
  gateButtonText: {
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
  legalLinksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  legalLinkText: {
    color: colors.primary,
    textDecorationLine: 'underline',
    ...typography.caption,
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
    backgroundColor: colors.border,
    width: 1,
  },
  milestoneItem: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
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
    padding: spacing.sm,
  },
  parentPromptLabel: {
    color: colors.primaryDark,
    ...typography.caption,
  },
  parentPromptText: {
    color: colors.textSoft,
    ...typography.caption,
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
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxs,
    paddingHorizontal: spacing.md,
  },
  bottomTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxs,
    gap: spacing.xxs,
    borderRadius: radius.md,
  },
  bottomTabActive: {},
  bottomTabIcon: {
    opacity: 1,
  },
  bottomTabIconFrame: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 32,
    justifyContent: 'center',
    width: 48,
  },
  bottomTabIconFrameActive: {
    backgroundColor: colors.surfaceBlue,
  },
  bottomTabIconInactive: {
    opacity: 0.54,
  },
  bottomTabText: {
    color: colors.muted,
    fontSize: 13,
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
    minHeight: 50,
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
    ...typography.body,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderWarm,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  reviewCopy: {
    flex: 1,
    gap: spacing.xxs,
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
    height: 56,
    justifyContent: 'center',
    width: 56,
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
    minHeight: 48,
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
    ...typography.body,
  },
  todayCard: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderWidth: 1,
    gap: spacing.sm,
    overflow: 'hidden',
    padding: spacing.md,
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
  yearPickerButtonText: {
    color: colors.text,
    textAlign: 'right',
    ...typography.caption,
  },
  yearPickerCheckmark: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  yearPickerHeader: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  yearPickerItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  yearPickerItemSelected: {
    backgroundColor: colors.primarySoft ?? colors.surfaceBlue,
  },
  yearPickerItemText: {
    color: colors.text,
    ...typography.body,
  },
  yearPickerItemTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  yearPickerOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  yearPickerSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: 380,
    paddingBottom: spacing.xl,
  },
  yearPickerTitle: {
    color: colors.text,
    ...typography.subtitle,
  },
}));
