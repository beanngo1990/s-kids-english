import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, Switch, Text, View } from 'react-native';

import { AppButton } from './AppButton';
import {
  disableAndDeleteCloudProgress,
  disableCloudProgressSync,
  enableCloudProgressSync,
  getCloudProgressSyncErrorCode,
  initialCloudProgressSyncSnapshot,
  retryCloudProgressSync,
  subscribeCloudProgressSync,
  type CloudProgressSyncErrorCode,
  type CloudProgressSyncSnapshot,
} from '../engine/CloudProgressSyncManager';
import { useI18n, type Translator } from '../i18n';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type ParentCloudSyncSectionProps = {
  compact?: boolean;
  firebaseConfigMissing: boolean;
  isAccountBusy: boolean;
  isSignedIn: boolean;
  onInfoPress?: () => void;
};

type PendingSyncAction = 'delete' | 'disable' | 'enable';

export function ParentCloudSyncSection({
  compact = false,
  firebaseConfigMissing,
  isAccountBusy,
  isSignedIn,
  onInfoPress,
}: ParentCloudSyncSectionProps) {
  useThemeSync();
  const t = useI18n();
  const [syncSnapshot, setSyncSnapshot] = useState(
    initialCloudProgressSyncSnapshot,
  );
  const [pendingAction, setPendingAction] =
    useState<PendingSyncAction | null>(null);

  useEffect(() => subscribeCloudProgressSync(setSyncSnapshot), []);

  const handleError = useCallback(
    (error: unknown) => {
      Alert.alert(
        t('parent.cloudSync.errorTitle'),
        getCloudSyncErrorMessage(
          t,
          getCloudProgressSyncErrorCode(error),
        ),
      );
    },
    [t],
  );

  const enableSync = useCallback(async () => {
    setPendingAction('enable');
    try {
      await enableCloudProgressSync();
    } catch (error) {
      handleError(error);
    } finally {
      setPendingAction(null);
    }
  }, [handleError]);

  const disableSync = useCallback(async () => {
    setPendingAction('disable');
    try {
      await disableCloudProgressSync();
    } catch (error) {
      handleError(error);
    } finally {
      setPendingAction(null);
    }
  }, [handleError]);

  const disableAndDelete = useCallback(async () => {
    setPendingAction('delete');
    try {
      await disableAndDeleteCloudProgress();
      Alert.alert(
        t('parent.cloudSync.cloudDeletedTitle'),
        t('parent.cloudSync.cloudDeletedText'),
      );
    } catch (error) {
      handleError(error);
    } finally {
      setPendingAction(null);
    }
  }, [handleError, t]);

  const handleToggle = useCallback(
    (nextEnabled: boolean) => {
      if (nextEnabled) {
        Alert.alert(
          t('parent.cloudSync.consentTitle'),
          t('parent.cloudSync.consentText'),
          [
            { style: 'cancel', text: t('parent.account.cancel') },
            {
              onPress: () => {
                enableSync();
              },
              text: t('parent.cloudSync.consentAction'),
            },
          ],
        );
        return;
      }

      Alert.alert(
        t('parent.cloudSync.disableTitle'),
        t('parent.cloudSync.disableText'),
        [
          { style: 'cancel', text: t('parent.account.cancel') },
          {
            onPress: () => {
              disableSync();
            },
            text: t('parent.cloudSync.disableKeepCloud'),
          },
          {
            onPress: () => {
              disableAndDelete();
            },
            style: 'destructive',
            text: t('parent.cloudSync.disableDeleteCloud'),
          },
        ],
      );
    },
    [disableAndDelete, disableSync, enableSync, t],
  );

  const clearMismatchedConsent = useCallback(() => {
    Alert.alert(
      t('parent.cloudSync.clearConsentTitle'),
      t('parent.cloudSync.clearConsentText'),
      [
        { style: 'cancel', text: t('parent.account.cancel') },
        {
          onPress: () => {
            disableSync();
          },
          text: t('parent.cloudSync.clearConsentAction'),
        },
      ],
    );
  }, [disableSync, t]);

  const isBusy = pendingAction !== null || isAccountBusy;
  const isAccountMismatch = syncSnapshot.status === 'accountMismatch';
  const switchDisabled =
    isBusy ||
    firebaseConfigMissing ||
    !isSignedIn ||
    !syncSnapshot.isReady ||
    isAccountMismatch;
  const statusText = getCloudSyncStatusText(
    t,
    syncSnapshot,
    pendingAction,
  );

  return (
    <View style={[styles.section, compact && styles.sectionCompact]}>
      <View style={[styles.toggleRow, compact && styles.toggleRowCompact]}>
        <View style={[styles.toggleCopy, compact && styles.toggleCopyCompact]}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, compact && styles.titleCompact]}>
              {t('parent.cloudSync.title')}
            </Text>
            {onInfoPress ? (
              <Pressable
                accessibilityLabel={t('parent.info.openAccessibility')}
                accessibilityRole="button"
                hitSlop={8}
                onPress={onInfoPress}
                style={({ pressed }) => [
                  styles.infoButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.infoButtonText}>i</Text>
              </Pressable>
            ) : null}
          </View>
          {compact ? (
            <Text
              numberOfLines={2}
              style={[
                styles.status,
                styles.statusCompact,
                syncSnapshot.status === 'error' && styles.errorStatus,
              ]}
            >
              {statusText}
            </Text>
          ) : (
            <Text style={styles.description}>
              {t('parent.cloudSync.description')}
            </Text>
          )}
        </View>
        <Switch
          accessibilityLabel={t('parent.cloudSync.accessibilityLabel')}
          disabled={switchDisabled}
          onValueChange={handleToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          value={syncSnapshot.isEnabledForCurrentAccount}
        />
      </View>

      {!compact ? (
        <Text
          style={[
            styles.status,
            syncSnapshot.status === 'error' && styles.errorStatus,
          ]}
        >
          {statusText}
        </Text>
      ) : null}

      {syncSnapshot.status === 'error' && isSignedIn ? (
        <AppButton
          disabled={isBusy}
          onPress={retryCloudProgressSync}
          style={compact && styles.compactAction}
          title={t('parent.cloudSync.retry')}
          variant="ghost"
        />
      ) : null}

      {isAccountMismatch && isSignedIn ? (
        <AppButton
          disabled={isBusy}
          onPress={clearMismatchedConsent}
          style={compact && styles.compactAction}
          title={t('parent.cloudSync.clearConsentAction')}
          variant="ghost"
        />
      ) : null}
    </View>
  );
}

function getCloudSyncStatusText(
  t: Translator,
  snapshot: CloudProgressSyncSnapshot,
  pendingAction: PendingSyncAction | null,
) {
  if (pendingAction === 'enable') {
    return t('parent.cloudSync.statusEnabling');
  }

  if (pendingAction === 'disable' || pendingAction === 'delete') {
    return t('parent.cloudSync.statusDisabling');
  }

  if (snapshot.status === 'waitingForSignIn') {
    return t('parent.cloudSync.statusWaitingForSignIn');
  }

  if (snapshot.status === 'accountMismatch') {
    return t('parent.cloudSync.statusAccountMismatch');
  }

  if (
    snapshot.status === 'connecting' ||
    snapshot.status === 'syncing' ||
    snapshot.status === 'loading'
  ) {
    return t('parent.cloudSync.statusSyncing');
  }

  if (snapshot.status === 'pending') {
    return t('parent.cloudSync.statusPending');
  }

  if (snapshot.status === 'synced') {
    return t('parent.cloudSync.statusSynced');
  }

  if (snapshot.status === 'error') {
    return getCloudSyncErrorMessage(t, snapshot.errorCode ?? 'unknown');
  }

  return t('parent.cloudSync.statusDisabled');
}

export function getCloudSyncErrorMessage(
  t: Translator,
  code: CloudProgressSyncErrorCode,
) {
  if (code === 'notSignedIn') {
    return t('parent.cloudSync.errorNotSignedIn');
  }

  if (code === 'accountMismatch') {
    return t('parent.cloudSync.errorAccountMismatch');
  }

  if (code === 'permissionDenied') {
    return t('parent.cloudSync.errorPermissionDenied');
  }

  if (code === 'networkUnavailable') {
    return t('parent.cloudSync.errorNetwork');
  }

  if (code === 'firebaseUnavailable') {
    return t('parent.cloudSync.errorFirebaseUnavailable');
  }

  if (code === 'invalidRemoteData') {
    return t('parent.cloudSync.errorInvalidData');
  }

  return t('parent.cloudSync.errorUnknown');
}

const styles = createThemedStyles(() => ({
  compactAction: {
    marginBottom: spacing.sm,
    marginHorizontal: spacing.md,
    minHeight: 48,
  },
  description: {
    ...typography.caption,
    color: colors.textSoft,
  },
  errorStatus: {
    color: colors.alert,
  },
  infoButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  infoButtonText: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.72,
  },
  section: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  sectionCompact: {
    gap: 0,
    paddingTop: 0,
  },
  status: {
    ...typography.caption,
    color: colors.primaryDark,
  },
  statusCompact: {
    color: colors.textSoft,
    fontWeight: '600',
  },
  title: {
    ...typography.body,
    color: colors.text,
    flexShrink: 1,
  },
  titleCompact: {
    ...typography.caption,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  toggleCopy: {
    flex: 1,
    gap: spacing.xs,
    paddingRight: spacing.sm,
  },
  toggleCopyCompact: {
    gap: spacing.xxs,
  },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toggleRowCompact: {
    minHeight: 72,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
}));
