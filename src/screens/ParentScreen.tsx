import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppCard } from '../components/AppCard';
import { ChildProfileCard } from '../components/ChildProfileCard';
import { KidBadge } from '../components/KidBadge';
import { LearningStreakCard } from '../components/LearningStreakCard';
import { Screen } from '../components/Screen';
import { StatTile } from '../components/StatTile';
import { WeeklyChart } from '../components/WeeklyChart';
import { lessons } from '../data/lessons';
import {
  getActivityLog,
  getWeeklyData,
  type ActivityLog,
} from '../engine/DailyActivityTracker';
import {
  AVATAR_EMOJI_OPTIONS,
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
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import type { LearningMode } from '../types/lesson';

const GATE_DURATION_MS = 3000;

type ParentTab = 'stats' | 'lessons' | 'settings';

export function ParentScreen() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [activeTab, setActiveTab] = useState<ParentTab>('stats');

  // Settings State
  const [learningMode, setLearningMode] = useState<LearningMode>('core');
  const [enableSceneEditor, setEnableSceneEditor] = useState(false);
  const [appLanguage, setAppLanguage] = useState<AppLanguage>('vi');
  const [appTheme, setAppTheme] = useState<AppTheme>('system');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('19:30');
  const [visibleLessonIds, setVisibleLessonIds] = useState<string[] | undefined>(undefined);
  const [childProfile, setChildProfile] = useState<ChildProfile>(defaultChildProfile);

  // Activity State
  const [activityLog, setActivityLog] = useState<ActivityLog | null>(null);

  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const [savingMode, setSavingMode] = useState<LearningMode | null>(null);
  const gateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const learnedWordCount = progress?.learnedWordIds.length ?? 0;
  const completedLessonCount = progress?.completedLessonIds.length ?? 0;
  const earnedStickerCount = progress?.earnedStickerIds.length ?? 0;

  const recentLearnedWords = useMemo(() => {
    if (!progress || progress.learnedWordIds.length === 0) {
      return [];
    }
    const allVocabs = lessons.flatMap(lesson => getLessonVocabulary(lesson));
    const words = progress.learnedWordIds
      .map(id => allVocabs.find(v => v.id === id)?.word)
      .filter((word): word is string => !!word);
    return words.slice(-3);
  }, [progress]);

  const recentLessonId = progress?.completedLessonIds[progress?.completedLessonIds.length - 1];
  const recentLesson = lessons.find(l => l.id === recentLessonId);
  const currentDifficulty = getLearningDifficultyOption(learningMode);
  const tipText = recentLesson?.metadata?.parentTipVi ?? (
    recentLearnedWords.length > 0
      ? `Ba mẹ có thể chỉ vào đồ vật thật và hỏi bé: "Where is the ${recentLearnedWords[0]}?" hoặc "What is this?" để giúp bé nhớ lâu hơn.`
      : 'Bé chưa học từ vựng nào. Ba mẹ hãy cùng bé bắt đầu bài học đầu tiên nhé!'
  );

  function clearGateTimer() {
    if (gateTimerRef.current) {
      clearTimeout(gateTimerRef.current);
      gateTimerRef.current = null;
    }
  }

  useEffect(() => {
    if (!isUnlocked) {
      return;
    }

    getProgress()
      .then(setProgress)
      .catch(() => setProgress(null));
    getActivityLog()
      .then(setActivityLog)
      .catch(() => setActivityLog(null));
    getParentSettings()
      .then(settings => {
        setLearningMode(settings.learningMode);
        setEnableSceneEditor(settings.enableSceneEditor || false);
        setAppLanguage(settings.appLanguage);
        setAppTheme(settings.appTheme);
        setReminderEnabled(settings.reminderEnabled);
        setReminderTime(settings.reminderTime);
        setVisibleLessonIds(settings.visibleLessonIds);
        setChildProfile(settings.childProfile);
      })
      .catch(() => {
        setLearningMode('core');
      });
  }, [isUnlocked]);

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
    await saveParentSettings({ appTheme: theme });
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
      nextVisible = currentVisible.filter(id => id !== lessonId);
    } else {
      nextVisible = [...currentVisible, lessonId];
    }
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

          <LearningStreakCard
            currentStreak={activityLog?.currentStreak ?? 0}
            longestStreak={activityLog?.longestStreak ?? 0}
          />

          <View style={styles.grid}>
            <StatTile icon="Aa" label="Từ bé đã học" value={learnedWordCount} />
            <StatTile icon="★" label="Bài hoàn thành" value={completedLessonCount} />
            <StatTile icon="✓" label="Sticker đã nhận" value={earnedStickerCount} />
          </View>

          <WeeklyChart
            data={getWeeklyData(activityLog?.entries ?? [])}
          />

          <AppCard style={styles.summary}>
            <KidBadge tone="sun">Gợi ý ôn tập ngoài đời</KidBadge>
            {recentLearnedWords.length > 0 ? (
              <Text style={styles.summaryValue}>
                Gần đây bé đã học: {recentLearnedWords.join(', ')}.
              </Text>
            ) : null}
            <Text style={styles.tip}>
              {tipText}
            </Text>
          </AppCard>
        </View>
      )}

      {activeTab === 'lessons' && (
        <View style={styles.tabContent}>
          <AppCard style={styles.settingsCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleGroup}>
                <KidBadge tone="sky">Quản lý nội dung</KidBadge>
                <Text style={styles.privacyTitle}>Bài học của bé</Text>
              </View>
            </View>
            <Text style={styles.difficultySubtitle}>
              Chọn các bài học bạn muốn bé tập trung. Tắt các bài học khác để bé không bị phân tâm.
            </Text>
            <View style={styles.lessonList}>
              {lessons.map(lesson => {
                const currentVisible = visibleLessonIds ?? lessons.map(l => l.id);
                const isVisible = currentVisible.includes(lesson.id);

                return (
                  <View key={lesson.id} style={styles.lessonRow}>
                    <View style={styles.lessonTextGroup}>
                      <Text style={styles.difficultyTitle}>{lesson.titleVi}</Text>
                      <Text style={styles.difficultySubtitle}>{lesson.titleEn}</Text>
                    </View>
                    <Switch
                      value={isVisible}
                      onValueChange={() => handleToggleLesson(lesson.id)}
                      trackColor={{ false: colors.border, true: colors.primary }}
                    />
                  </View>
                );
              })}
            </View>
          </AppCard>
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
                onChangeText={(text) => {
                  const next = { ...childProfile, name: text };
                  setChildProfile(next);
                }}
                onBlur={() => {
                  const name = childProfile.name.trim() || defaultChildProfile.name;
                  const next = { ...childProfile, name };
                  setChildProfile(next);
                  saveParentSettings({ childProfile: next });
                }}
                placeholder="Nhập tên bé"
                placeholderTextColor={colors.muted}
                maxLength={20}
              />
            </View>

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

            <View style={styles.settingRow}>
              <View style={styles.settingTextGroup}>
                <Text style={styles.difficultyTitle}>Năm sinh (tuỳ chọn)</Text>
              </View>
              <TextInput
                style={styles.textInputSmall}
                value={childProfile.birthYear?.toString() ?? ''}
                onChangeText={(text) => {
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
                <Text style={styles.privacyTitle}>Độ khó của bé</Text>
              </View>
              <KidBadge tone="sky">Đang dùng: {currentDifficulty.title}</KidBadge>
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
                    onPress={() => handleSelectLearningMode(option.learningMode)}
                    style={({ pressed }) => [
                      styles.difficultyOption,
                      isSelected && styles.difficultyOptionSelected,
                      pressed && !savingMode && styles.pressed,
                      savingMode && !isSavingThisMode && styles.optionDisabled,
                    ]}
                  >
                    <View style={styles.difficultyText}>
                      <Text style={styles.difficultyTitle}>{option.title}</Text>
                      <Text style={styles.difficultySubtitle}>
                        {option.subtitle}
                      </Text>
                    </View>
                    <Text style={styles.difficultyState}>
                      {isSavingThisMode ? 'Đang lưu...' : isSelected ? '✓' : ''}
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
                <Text style={styles.difficultySubtitle}>Ngôn ngữ hiển thị của ứng dụng.</Text>
              </View>
              <View style={styles.switchGroup}>
                <Pressable
                  style={[styles.smallButton, appLanguage === 'vi' && styles.smallButtonActive]}
                  onPress={() => handleUpdateLanguage('vi')}
                >
                  <Text style={[styles.smallButtonText, appLanguage === 'vi' && styles.smallButtonTextActive]}>VI</Text>
                </Pressable>
                <Pressable
                  style={[styles.smallButton, appLanguage === 'en' && styles.smallButtonActive]}
                  onPress={() => handleUpdateLanguage('en')}
                >
                  <Text style={[styles.smallButtonText, appLanguage === 'en' && styles.smallButtonTextActive]}>EN</Text>
                </Pressable>
              </View>
            </View>

            {/* Giao diện */}
            <View style={styles.settingRow}>
              <View style={styles.settingTextGroup}>
                <Text style={styles.difficultyTitle}>Giao diện</Text>
                <Text style={styles.difficultySubtitle}>Sáng, tối hoặc theo hệ thống.</Text>
              </View>
              <View style={styles.switchGroup}>
                <Pressable
                  style={[styles.smallButton, appTheme === 'light' && styles.smallButtonActive]}
                  onPress={() => handleUpdateTheme('light')}
                >
                  <Text style={[styles.smallButtonText, appTheme === 'light' && styles.smallButtonTextActive]}>Sáng</Text>
                </Pressable>
                <Pressable
                  style={[styles.smallButton, appTheme === 'dark' && styles.smallButtonActive]}
                  onPress={() => handleUpdateTheme('dark')}
                >
                  <Text style={[styles.smallButtonText, appTheme === 'dark' && styles.smallButtonTextActive]}>Tối</Text>
                </Pressable>
                <Pressable
                  style={[styles.smallButton, appTheme === 'system' && styles.smallButtonActive]}
                  onPress={() => handleUpdateTheme('system')}
                >
                  <Text style={[styles.smallButtonText, appTheme === 'system' && styles.smallButtonTextActive]}>Auto</Text>
                </Pressable>
              </View>
            </View>

            {/* Nhắc nhở */}
            <View style={styles.settingRow}>
              <View style={styles.settingTextGroup}>
                <Text style={styles.difficultyTitle}>Nhắc nhở học tập ({reminderTime})</Text>
                <Text style={styles.difficultySubtitle}>Nhận thông báo nhắc bé học mỗi ngày.</Text>
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
              Ứng dụng không có quảng cáo, không có link ngoài và không thu thập
              thông tin trẻ em.
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
            style={[styles.bottomTab, activeTab === 'stats' && styles.bottomTabActive]}
          >
            <Text style={styles.bottomTabEmoji}>📊</Text>
            <Text style={[styles.bottomTabText, activeTab === 'stats' && styles.bottomTabTextActive]}>Thống kê</Text>
          </Pressable>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'lessons' }}
            onPress={() => setActiveTab('lessons')}
            style={[styles.bottomTab, activeTab === 'lessons' && styles.bottomTabActive]}
          >
            <Text style={styles.bottomTabEmoji}>📚</Text>
            <Text style={[styles.bottomTabText, activeTab === 'lessons' && styles.bottomTabTextActive]}>Bài học</Text>
          </Pressable>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'settings' }}
            onPress={() => setActiveTab('settings')}
            style={[styles.bottomTab, activeTab === 'settings' && styles.bottomTabActive]}
          >
            <Text style={styles.bottomTabEmoji}>⚙️</Text>
            <Text style={[styles.bottomTabText, activeTab === 'settings' && styles.bottomTabTextActive]}>Cài đặt</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  difficultyList: {
    gap: spacing.sm,
  },
  difficultyOption: {
    alignItems: 'center',
    backgroundColor: colors.white,
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
  lessonRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    backgroundColor: colors.white,
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
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bottomBarSafe: {
    backgroundColor: colors.white,
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
    paddingVertical: spacing.xs,
    gap: spacing.xxs,
    borderRadius: radius.md,
  },
  bottomTabActive: {
    backgroundColor: colors.primarySoft,
  },
  bottomTabEmoji: {
    fontSize: 20,
    lineHeight: 24,
  },
  bottomTabText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
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
});
