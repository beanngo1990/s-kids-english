import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Text, View } from 'react-native';

import { AppButton } from './AppButton';
import { AppCard } from './AppCard';
import { KidBadge } from './KidBadge';
import { PremiumStatusBadge } from './PremiumStatusBadge';
import { CloudProgressSyncError } from '../engine/CloudProgressSyncManager';
import {
  getCloudSyncErrorMessage,
  ParentCloudSyncSection,
} from './ParentCloudSyncSection';
import {
  getParentAuthErrorCode,
  getParentAuthProviders,
  initialParentAuthSnapshot,
  isAppleSignInAvailable,
  isGoogleSignInConfigured,
  signInParentWithApple,
  signInParentWithGoogle,
  signOutParent,
  subscribeParentAuth,
  type ParentAuthErrorCode,
  type ParentAuthProvider,
} from '../engine/ParentAuthManager';
import { useMonetizationSnapshot } from '../engine/MonetizationManager';
import { deleteCurrentParentAccountData } from '../services/RevenueCatDataDeletion';
import { useI18n } from '../i18n';
import type { Translator } from '../i18n';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type PendingAction = 'apple' | 'delete' | 'google' | 'signOut';

export function ParentAccountCard() {
  useThemeSync();
  const t = useI18n();
  const monetization = useMonetizationSnapshot();
  const [authSnapshot, setAuthSnapshot] = useState(initialParentAuthSnapshot);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );

  useEffect(() => subscribeParentAuth(setAuthSnapshot), []);

  const isBusy = pendingAction !== null;
  const firebaseConfigMissing =
    authSnapshot.configurationError === 'missingFirebaseConfig';
  const googleConfigMissing = !isGoogleSignInConfigured();
  const appleAvailable = isAppleSignInAvailable();

  const providerLabel = useMemo(() => {
    const user = authSnapshot.user;
    if (!user) {
      return '';
    }

    return getParentAuthProviders(user)
      .map(provider => getProviderLabel(t, provider))
      .filter(Boolean)
      .join(', ');
  }, [authSnapshot.user, t]);

  const handleError = useCallback(
    (error: unknown, action: 'signIn' | 'signOut' | 'delete' = 'signIn') => {
      const code = getParentAuthErrorCode(error);
      if (code === 'cancelled') {
        return;
      }

      let title = t('parent.account.errorTitle');
      let message = getErrorMessageForCode(t, code);

      if (action === 'delete') {
        title = t('parent.account.deleteErrorTitle');
        if (code === 'unknown') {
          message =
            __DEV__ && error instanceof Error
              ? `${t('parent.account.deleteErrorUnknown')} (${error.message})`
              : t('parent.account.deleteErrorUnknown');
        }
      } else if (action === 'signOut') {
        title = t('parent.account.signOutErrorTitle');
        if (code === 'unknown') {
          message = t('parent.account.signOutErrorUnknown');
        }
      }

      Alert.alert(title, message);
    },
    [t],
  );

  const handleGooglePress = useCallback(async () => {
    setPendingAction('google');
    try {
      await signInParentWithGoogle();
    } catch (error) {
      handleError(error);
    } finally {
      setPendingAction(null);
    }
  }, [handleError]);

  const handleApplePress = useCallback(async () => {
    setPendingAction('apple');
    try {
      await signInParentWithApple();
    } catch (error) {
      handleError(error);
    } finally {
      setPendingAction(null);
    }
  }, [handleError]);

  const handleSignOutPress = useCallback(async () => {
    setPendingAction('signOut');
    try {
      await signOutParent();
    } catch (error) {
      handleError(error, 'signOut');
    } finally {
      setPendingAction(null);
    }
  }, [handleError]);

  const handleManageSubscription = useCallback(async () => {
    if (!monetization.managementUrl) {
      return;
    }

    try {
      await Linking.openURL(monetization.managementUrl);
    } catch {
      Alert.alert(
        t('premium.legal.linkErrorTitle'),
        t('premium.legal.linkErrorText'),
      );
    }
  }, [monetization.managementUrl, t]);

  const deleteAccount = useCallback(async () => {
    setPendingAction('delete');
    try {
      const deletionResult = await deleteCurrentParentAccountData();
      if (deletionResult === 'authRequired') {
        Alert.alert(
          t('parent.account.deleteErrorTitle'),
          t('parent.account.deleteAuthRequired'),
        );
        return;
      }

      if (deletionResult === 'appCheckRequired') {
        Alert.alert(
          t('parent.account.deleteErrorTitle'),
          t('parent.account.deleteAppCheckRequired'),
        );
        return;
      }

      if (deletionResult !== 'success') {
        throw new Error('RevenueCat customer deletion could not be confirmed.');
      }

      Alert.alert(
        t('parent.account.deletedTitle'),
        t('parent.account.deletedText'),
      );
    } catch (error) {
      if (error instanceof CloudProgressSyncError) {
        Alert.alert(
          t('parent.cloudSync.errorTitle'),
          getCloudSyncErrorMessage(t, error.code),
        );
      } else {
        handleError(error, 'delete');
      }
    } finally {
      setPendingAction(null);
    }
  }, [handleError, t]);

  const handleDeletePress = useCallback(() => {
    Alert.alert(
      t('parent.account.deleteConfirmTitle'),
      t('parent.account.deleteConfirmText'),
      [
        { style: 'cancel', text: t('parent.account.cancel') },
        {
          onPress: () => {
            deleteAccount();
          },
          style: 'destructive',
          text: t('parent.account.deleteConfirmAction'),
        },
      ],
    );
  }, [deleteAccount, t]);

  const user = authSnapshot.user;
  const displayName = user?.displayName || user?.email || user?.uid;
  const configWarning = firebaseConfigMissing
    ? t('parent.account.firebaseConfigMissing')
    : googleConfigMissing
    ? t('parent.account.googleConfigMissing')
    : '';

  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <KidBadge tone="teal">{t('parent.account.badge')}</KidBadge>
        {!authSnapshot.isReady && (
          <ActivityIndicator color={colors.primaryDark} size="small" />
        )}
      </View>
      <Text style={styles.title}>{t('parent.account.title')}</Text>
      <Text style={styles.subtitle}>{t('parent.account.subtitle')}</Text>

      {configWarning ? (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>
            {t('parent.account.configMissingTitle')}
          </Text>
          <Text style={styles.noticeText}>{configWarning}</Text>
        </View>
      ) : null}

      {user ? (
        <View style={styles.accountBox}>
          <View style={styles.accountTopRow}>
            <Text style={styles.accountLabel}>
              {t('parent.account.signedIn')}
            </Text>
            {monetization.status === 'premium' ? (
              <PremiumStatusBadge compact variant="account" />
            ) : null}
          </View>
          <Text style={styles.accountName}>{displayName}</Text>
          {providerLabel ? (
            <Text style={styles.accountMeta}>
              {t('parent.account.providerSummary', {
                provider: providerLabel,
              })}
            </Text>
          ) : null}
        </View>
      ) : (
        <Text style={styles.signedOut}>{t('parent.account.signedOut')}</Text>
      )}

      <ParentCloudSyncSection
        firebaseConfigMissing={firebaseConfigMissing}
        isAccountBusy={isBusy}
        isSignedIn={Boolean(user)}
      />

      {user ? (
        <View style={styles.actions}>
          {monetization.managementUrl &&
          (monetization.activeProductType === 'monthly' ||
            monetization.activeProductType === 'annual') ? (
            <AppButton
              disabled={isBusy}
              onPress={handleManageSubscription}
              title={t('premium.manage')}
              variant="secondary"
            />
          ) : null}
          <AppButton
            disabled={isBusy || firebaseConfigMissing}
            onPress={handleSignOutPress}
            title={
              pendingAction === 'signOut'
                ? t('parent.account.signingOut')
                : t('parent.account.signOut')
            }
            variant="outlined"
          />
          <AppButton
            disabled={isBusy || firebaseConfigMissing}
            onPress={handleDeletePress}
            textStyle={styles.deleteButtonText}
            title={
              pendingAction === 'delete'
                ? t('parent.account.deleting')
                : t('parent.account.deleteAccount')
            }
            variant="ghost"
          />
        </View>
      ) : (
        <View style={styles.actions}>
          <AppButton
            disabled={isBusy || firebaseConfigMissing || googleConfigMissing}
            onPress={handleGooglePress}
            title={
              pendingAction === 'google'
                ? t('parent.account.signingIn')
                : t('parent.account.signInGoogle')
            }
            variant="secondary"
          />
          {appleAvailable && (
            <AppButton
              disabled={isBusy || firebaseConfigMissing}
              onPress={handleApplePress}
              title={
                pendingAction === 'apple'
                  ? t('parent.account.signingIn')
                  : t('parent.account.signInApple')
              }
              variant="outlined"
            />
          )}
        </View>
      )}
    </AppCard>
  );
}

function getProviderLabel(t: Translator, provider: ParentAuthProvider) {
  if (provider === 'google') {
    return t('parent.account.providerGoogle');
  }

  if (provider === 'apple') {
    return t('parent.account.providerApple');
  }

  return t('parent.account.providerUnknown');
}

function getErrorMessageForCode(t: Translator, code: ParentAuthErrorCode) {
  if (code === 'missingFirebaseConfig') {
    return t('parent.account.firebaseConfigMissing');
  }

  if (code === 'missingGoogleWebClientId') {
    return t('parent.account.googleConfigMissing');
  }

  if (code === 'missingGoogleUrlScheme') {
    return t('parent.account.googleUrlSchemeMissing');
  }

  if (code === 'appleUnavailable') {
    return t('parent.account.appleUnavailable');
  }

  if (
    code === 'missingAppleAuthorizationCode' ||
    code === 'missingAppleIdentityToken'
  ) {
    return t('parent.account.appleTokenMissing');
  }

  if (code === 'requiresRecentLogin') {
    return t('parent.account.requiresRecentLogin');
  }

  if (code === 'playServicesUnavailable') {
    return t('parent.account.playServicesUnavailable');
  }

  if (code === 'signInInProgress') {
    return t('parent.account.signInInProgress');
  }

  return t('parent.account.unknownError');
}

const styles = createThemedStyles(() => ({
  accountBox: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  accountLabel: {
    ...typography.caption,
    color: colors.primaryDark,
  },
  accountMeta: {
    ...typography.caption,
    color: colors.textSoft,
  },
  accountName: {
    ...typography.body,
    color: colors.text,
  },
  accountTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'space-between',
  },
  actions: {
    gap: spacing.sm,
  },
  card: {
    gap: spacing.md,
  },
  deleteButtonText: {
    color: colors.alert,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notice: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  noticeText: {
    ...typography.caption,
    color: colors.text,
  },
  noticeTitle: {
    ...typography.caption,
    color: colors.accentDark,
  },
  signedOut: {
    ...typography.caption,
    color: colors.textSoft,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSoft,
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
  },
}));
