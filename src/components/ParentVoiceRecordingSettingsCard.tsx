import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, Switch, Text, View } from 'react-native';

import {
  getParentSettings,
  saveParentSettings,
  VOICE_RECORDING_LIBRARY_CONSENT_VERSION,
  type VoiceRecordingLibraryPreference,
} from '../engine/ParentSettingsManager';
import { useI18n } from '../i18n';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { AppCard } from './AppCard';

export function ParentVoiceRecordingSettingsCard() {
  useThemeSync();
  const t = useI18n();
  const [preference, setPreference] =
    useState<VoiceRecordingLibraryPreference>({ enabled: false });
  const [isPending, setIsPending] = useState(true);

  const refresh = useCallback(() => {
    setIsPending(true);
    getParentSettings()
      .then(settings => setPreference(settings.voiceRecordingLibrary))
      .catch(() => undefined)
      .finally(() => setIsPending(false));
  }, []);

  useEffect(refresh, [refresh]);

  const persistEnabled = useCallback(
    async (enabled: boolean) => {
      setIsPending(true);
      try {
        const settings = await getParentSettings();
        const currentPreference = settings.voiceRecordingLibrary;
        const now = new Date().toISOString();
        const hasCurrentConsent =
          currentPreference.consentVersion ===
            VOICE_RECORDING_LIBRARY_CONSENT_VERSION &&
          Boolean(currentPreference.consentedAt);
        const nextPreference: VoiceRecordingLibraryPreference = enabled
          ? {
              ...currentPreference,
              consentVersion: VOICE_RECORDING_LIBRARY_CONSENT_VERSION,
              consentedAt: hasCurrentConsent
                ? currentPreference.consentedAt
                : now,
              enabled: true,
              updatedAt: now,
            }
          : {
              ...currentPreference,
              enabled: false,
              updatedAt: now,
            };

        await saveParentSettings(
          { voiceRecordingLibrary: nextPreference },
          { touchUpdatedAt: false },
        );
        setPreference(nextPreference);
      } catch {
        Alert.alert(
          t('parent.voice.settingErrorTitle'),
          t('parent.voice.settingErrorText'),
        );
      } finally {
        setIsPending(false);
      }
    },
    [t],
  );

  const handleToggle = useCallback(
    (nextEnabled: boolean) => {
      if (isPending) {
        return;
      }

      if (!nextEnabled) {
        persistEnabled(false).catch(() => undefined);
        return;
      }

      const hasCurrentConsent =
        preference.consentVersion ===
          VOICE_RECORDING_LIBRARY_CONSENT_VERSION &&
        Boolean(preference.consentedAt);
      if (hasCurrentConsent) {
        persistEnabled(true).catch(() => undefined);
        return;
      }

      Alert.alert(
        t('parent.voice.enableTitle'),
        t('parent.voice.enableText'),
        [
          {
            style: 'cancel',
            text: t('parent.voice.cancel'),
          },
          {
            onPress: () => {
              persistEnabled(true).catch(() => undefined);
            },
            text: t('parent.voice.enableAction'),
          },
        ],
      );
    },
    [isPending, persistEnabled, preference, t],
  );

  const handleShowInfo = useCallback(() => {
    Alert.alert(
      t('parent.voice.localOnlyTitle'),
      t('parent.voice.localOnlyText'),
      [{ text: t('common.close') }],
    );
  }, [t]);

  return (
    <AppCard style={styles.card}>
      <View style={styles.settingRow}>
        <View style={styles.settingCopy}>
          <View style={styles.titleRow}>
            <Text style={styles.settingTitle}>
              {t('parent.voice.autoSaveTitle')}
            </Text>
            <Pressable
              accessibilityLabel={t('parent.voice.infoAccessibility')}
              accessibilityRole="button"
              hitSlop={spacing.sm}
              onPress={handleShowInfo}
              style={({ pressed }) => [
                styles.infoAction,
                pressed && styles.pressed,
              ]}
            >
              <Text accessibilityElementsHidden style={styles.infoIcon}>
                ⓘ
              </Text>
            </Pressable>
          </View>
          <Text style={styles.settingSubtitle}>
            {preference.enabled
              ? t('parent.voice.autoSaveEnabled')
              : t('parent.voice.autoSaveDisabled')}
          </Text>
        </View>
        <Switch
          accessibilityLabel={t('parent.voice.autoSaveTitle')}
          disabled={isPending}
          onValueChange={handleToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          value={preference.enabled}
        />
      </View>
    </AppCard>
  );
}

const styles = createThemedStyles(() => ({
  card: {
    borderColor: colors.accentSoft,
    borderWidth: 1,
  },
  infoAction: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  infoIcon: {
    color: colors.primaryDark,
    fontSize: 22,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.68,
  },
  settingCopy: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  settingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 64,
  },
  settingSubtitle: {
    ...typography.caption,
    color: colors.textSoft,
    fontWeight: '600',
  },
  settingTitle: {
    ...typography.body,
    color: colors.text,
    flexShrink: 1,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xxs,
  },
}));
