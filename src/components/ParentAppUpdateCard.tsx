import React, { useCallback, useState } from 'react';
import { Alert, Linking, Text, View } from 'react-native';

import {
  dismissOptionalAppUpdate,
  useAppUpdateSnapshot,
} from '../engine/AppUpdateManager';
import { setParentExternalFlowActive } from '../engine/ParentAccessSession';
import { useI18n } from '../i18n';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { AppButton } from './AppButton';
import { AppCard } from './AppCard';
import { KidBadge } from './KidBadge';
import { SKidsIcon } from './SKidsIcon';

export function ParentAppUpdateCard() {
  useThemeSync();
  const t = useI18n();
  const update = useAppUpdateSnapshot();
  const [isOpeningStore, setIsOpeningStore] = useState(false);

  const openStore = useCallback(async () => {
    if (!update.storeUrl || isOpeningStore) {
      return;
    }

    setIsOpeningStore(true);
    setParentExternalFlowActive(true);
    try {
      await Linking.openURL(update.storeUrl);
    } catch {
      Alert.alert(
        t('appUpdate.storeErrorTitle'),
        t('appUpdate.storeErrorText'),
      );
    } finally {
      setParentExternalFlowActive(false);
      setIsOpeningStore(false);
    }
  }, [isOpeningStore, t, update.storeUrl]);

  if (update.status !== 'optional') {
    return null;
  }

  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconFrame}>
          <SKidsIcon name="parentGate" size={52} />
        </View>
        <View style={styles.copy}>
          <KidBadge tone="teal">{t('appUpdate.optionalBadge')}</KidBadge>
          <Text accessibilityRole="header" style={styles.title}>
            {t('appUpdate.optionalTitle')}
          </Text>
        </View>
      </View>
      <Text style={styles.body}>{t('appUpdate.optionalText')}</Text>
      <View style={styles.versionPanel}>
        <Text style={styles.versionText}>
          {t('appUpdate.versionSummary', {
            currentVersion: update.currentVersion,
            latestVersion: update.latestVersion,
          })}
        </Text>
      </View>
      <View style={styles.actions}>
        <AppButton
          disabled={isOpeningStore}
          onPress={() => openStore().catch(() => undefined)}
          title={
            isOpeningStore
              ? t('appUpdate.openingStore')
              : t('appUpdate.updateAction')
          }
        />
        <AppButton
          disabled={isOpeningStore}
          onPress={() => dismissOptionalAppUpdate().catch(() => undefined)}
          title={t('appUpdate.laterAction')}
          variant="ghost"
        />
      </View>
    </AppCard>
  );
}

const styles = createThemedStyles(() => ({
  actions: {
    gap: spacing.xs,
  },
  body: {
    color: colors.textSoft,
    ...typography.body,
  },
  card: {
    borderColor: colors.primary,
    borderWidth: 2,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconFrame: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  title: {
    color: colors.text,
    ...typography.subtitle,
  },
  versionPanel: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.sm,
  },
  versionText: {
    color: colors.primaryDark,
    textAlign: 'center',
    ...typography.caption,
  },
}));
