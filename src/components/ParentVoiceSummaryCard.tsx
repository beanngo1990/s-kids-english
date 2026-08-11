import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { lessons } from '../data/lessons';
import { cancelNarration } from '../engine/AudioManager';
import {
  getVoiceRecordingWords,
  subscribeVoiceRecordings,
  type VoiceRecordingWordEntry,
} from '../engine/VoiceRecordingStore';
import { playVoiceRecording } from '../engine/VoiceRecorder';
import { getLocalizedLessonTitle } from '../i18n/domainCopy';
import { useI18n, useSavedAppLanguage } from '../i18n';
import { formatVoiceRecordingDate } from '../screens/parentVoiceLibraryModel';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { AppCard } from './AppCard';
import { AppUiIcon } from './AppUiIcon';
import { KidBadge } from './KidBadge';

type Props = {
  onOpen: () => void;
};

export function ParentVoiceSummaryCard({ onOpen }: Props) {
  useThemeSync();
  const t = useI18n();
  const appLanguage = useSavedAppLanguage();
  const [entries, setEntries] = useState<VoiceRecordingWordEntry[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [playingSampleId, setPlayingSampleId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    getVoiceRecordingWords()
      .then(nextEntries => setEntries(nextEntries.slice(0, 3)))
      .catch(() => setEntries([]))
      .finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    refresh();
    return subscribeVoiceRecordings(refresh);
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      setPlayingSampleId(null);
      return () => {
        cancelNarration().catch(() => undefined);
      };
    }, []),
  );

  const handlePlayLatest = useCallback(
    async (entry: VoiceRecordingWordEntry) => {
      if (playingSampleId) {
        return;
      }

      const sample = entry.latest ?? entry.first;
      setPlayingSampleId(sample.id);
      try {
        await playVoiceRecording(sample.uri);
      } catch {
        Alert.alert(
          t('parent.voice.playErrorTitle'),
          t('parent.voice.playErrorText'),
        );
      } finally {
        setPlayingSampleId(null);
      }
    },
    [playingSampleId, t],
  );

  const handleOpen = useCallback(() => {
    cancelNarration().catch(() => undefined);
    setPlayingSampleId(null);
    onOpen();
  }, [onOpen]);

  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <KidBadge tone="teal">{t('parent.voice.summaryBadge')}</KidBadge>
          <Text style={styles.title}>{t('parent.voice.title')}</Text>
          <Text style={styles.subtitle}>
            {t('parent.voice.summarySubtitle')}
          </Text>
        </View>
        <View style={styles.iconFrame}>
          <AppUiIcon name="gameListen" size={44} />
        </View>
      </View>

      {entries.length > 0 ? (
        <View style={styles.entries}>
          {entries.map(entry => {
            const lesson = lessons.find(item => item.id === entry.lessonId);
            const lessonTitle = lesson
              ? getLocalizedLessonTitle(lesson, appLanguage)
              : entry.lessonId;
            const date = formatVoiceRecordingDate(
              entry.latestCreatedAt,
              appLanguage,
            );
            const latestSample = entry.latest ?? entry.first;
            const isPlaying = playingSampleId === latestSample.id;

            return (
              <View key={entry.key} style={styles.entry}>
                <Pressable
                  accessibilityLabel={
                    isPlaying
                      ? t('parent.voice.playing')
                      : t('parent.voice.playAccessibility', {
                          word: entry.word,
                        })
                  }
                  accessibilityRole="button"
                  accessibilityState={{
                    busy: isPlaying,
                    disabled: playingSampleId !== null,
                  }}
                  disabled={playingSampleId !== null}
                  onPress={() => handlePlayLatest(entry)}
                  style={({ pressed }) => [
                    styles.playDot,
                    isPlaying && styles.playDotPlaying,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.playDotText,
                      isPlaying && styles.playDotTextPlaying,
                    ]}
                  >
                    {isPlaying ? '…' : '▶'}
                  </Text>
                </Pressable>
                <View style={styles.entryCopy}>
                  <Text numberOfLines={1} style={styles.word}>
                    {entry.word}
                  </Text>
                  <Text numberOfLines={1} style={styles.meta}>
                    {t('parent.voice.summaryMeta', {
                      date,
                      lesson: lessonTitle,
                    })}
                  </Text>
                </View>
                {entry.latest ? (
                  <Text style={styles.milestoneBadge}>
                    {t('parent.voice.twoMilestones')}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyPanel}>
          <Text style={styles.emptyText}>
            {isReady
              ? t('parent.voice.summaryEmpty')
              : t('parent.voice.loading')}
          </Text>
        </View>
      )}

      <Pressable
        accessibilityLabel={t('parent.voice.viewAll')}
        accessibilityRole="button"
        onPress={handleOpen}
        style={({ pressed }) => [styles.action, pressed && styles.pressed]}
      >
        <Text style={styles.actionText}>{t('parent.voice.viewAll')}</Text>
        <Text style={styles.actionArrow}>→</Text>
      </Pressable>
    </AppCard>
  );
}

const styles = createThemedStyles(() => ({
  action: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: 54,
    paddingHorizontal: spacing.lg,
  },
  actionArrow: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '900',
    marginLeft: spacing.sm,
  },
  actionText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '900',
  },
  card: {
    borderColor: colors.primarySoft,
    borderWidth: 1,
    gap: spacing.md,
  },
  emptyPanel: {
    backgroundColor: colors.surfaceBlue,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSoft,
    fontWeight: '600',
  },
  entries: {
    gap: spacing.xs,
  },
  entry: {
    alignItems: 'center',
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 64,
    padding: spacing.sm,
  },
  entryCopy: {
    flex: 1,
    minWidth: 0,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  iconFrame: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  meta: {
    ...typography.caption,
    color: colors.textSoft,
    fontWeight: '600',
  },
  milestoneBadge: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '900',
  },
  playDot: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  playDotPlaying: {
    backgroundColor: colors.primary,
  },
  playDotText: {
    color: colors.primaryDark,
    fontSize: 14,
    marginLeft: 2,
  },
  playDotTextPlaying: {
    color: colors.white,
    marginLeft: 0,
  },
  pressed: {
    opacity: 0.76,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSoft,
    fontWeight: '600',
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
  },
  word: {
    ...typography.body,
    color: colors.text,
    fontWeight: '900',
  },
}));
