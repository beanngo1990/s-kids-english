import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { KidBadge } from '../components/KidBadge';
import { APP_SUPPORT_EMAIL } from '../config/appInfo';
import { monetizationConfig } from '../config/monetization';
import {
  getMonetizationSnapshot,
  purchaseMonetizationPackage,
  refreshMonetization,
  restoreMonetizationPurchases,
  useMonetizationSnapshot,
  type MonetizationErrorCode,
  type MonetizationPackage,
  type MonetizationPackageType,
  type MonetizationProductType,
} from '../engine/MonetizationManager';
import {
  getParentAuthErrorCode,
  isAppleSignInAvailable,
  isGoogleSignInConfigured,
  signInParentWithApple,
  signInParentWithGoogle,
  type ParentAuthErrorCode,
} from '../engine/ParentAuthManager';
import {
  setParentExternalFlowActive,
  useParentAccessSnapshot,
} from '../engine/ParentAccessSession';
import {
  useSavedAppLanguage,
  useTranslations,
  type Translator,
} from '../i18n';
import {
  refreshRemoteMonetizationConfig,
  subscribeRemoteMonetizationConfigUpdates,
  useRemoteMonetizationConfig,
} from '../services/RemoteMonetizationConfig';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { AppLanguage } from '../i18n/types';
import type { RootStackParamList } from '../types/navigation';
import {
  getPremiumProductTypeTitle,
  getPremiumStatusDetailLines,
} from '../utils/premiumStatus';
import { Screen } from '../components/Screen';

type Props = NativeStackScreenProps<RootStackParamList, 'Premium'>;
type SignInAction = 'apple' | 'google' | null;

export function PremiumScreen({ navigation }: Props) {
  useThemeSync();
  const appLanguage = useSavedAppLanguage();
  const t = useTranslations(appLanguage);
  const { isGranted } = useParentAccessSnapshot();
  const monetization = useMonetizationSnapshot();
  const remoteConfig = useRemoteMonetizationConfig();
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null,
  );
  const [signInAction, setSignInAction] = useState<SignInAction>(null);

  useEffect(() => {
    if (!isGranted) {
      navigation.replace('Parent', { intent: 'premium' });
    }
  }, [isGranted, navigation]);

  useFocusEffect(
    useCallback(() => {
      if (!isGranted) {
        return undefined;
      }

      refreshRemoteMonetizationConfig().catch(() => undefined);
      refreshMonetization().catch(() => undefined);
      return subscribeRemoteMonetizationConfigUpdates();
    }, [isGranted]),
  );

  const packages = useMemo(
    () => (monetization.status === 'premium' ? [] : monetization.packages),
    [monetization.packages, monetization.status],
  );

  useEffect(() => {
    if (
      selectedPackageId &&
      packages.some(item => item.identifier === selectedPackageId)
    ) {
      return;
    }

    const preferredPackage =
      packages.find(item => item.packageType === 'annual') ?? packages[0];
    setSelectedPackageId(preferredPackage?.identifier ?? null);
  }, [packages, selectedPackageId]);

  const selectedPackage =
    packages.find(item => item.identifier === selectedPackageId) ?? null;
  const annualSavings = useMemo(
    () => calculateAnnualSavings(packages),
    [packages],
  );
  const appleSignInAvailable = isAppleSignInAvailable();
  const googleSignInConfigured = isGoogleSignInConfigured();
  const isBusy =
    signInAction !== null ||
    monetization.pendingAction !== null;
  const canPurchase = Boolean(
    selectedPackage &&
      monetization.isConfigured &&
      monetization.isSignedIn &&
      monetization.status === 'free' &&
      remoteConfig.premiumPurchaseEnabled &&
      !isBusy,
  );
  const showLoadError =
    monetization.status === 'unavailable' ||
    (monetization.status !== 'premium' &&
      monetization.status !== 'initializing' &&
      packages.length === 0);
  const canFounderSignIn = Boolean(
    monetization.founderAccessActive &&
      !monetization.isSignedIn &&
      monetization.isAuthReady &&
      monetization.errorCode !== 'firebaseUnavailable' &&
      (googleSignInConfigured || appleSignInAvailable),
  );

  const openLink = useCallback(
    async (url: string) => {
      try {
        await Linking.openURL(url);
      } catch {
        Alert.alert(
          t('premium.legal.linkErrorTitle'),
          t('premium.legal.linkErrorText'),
        );
      }
    },
    [t],
  );

  const handleGoogleSignIn = useCallback(async () => {
    setSignInAction('google');
    setParentExternalFlowActive(true);
    try {
      await signInParentWithGoogle();
    } catch (error) {
      showParentAuthError(t, error);
    } finally {
      setParentExternalFlowActive(false);
      setSignInAction(null);
    }
  }, [t]);

  const handleFounderSignIn = useCallback(
    async (provider: Exclude<SignInAction, null>) => {
      setSignInAction(provider);
      setParentExternalFlowActive(true);
      try {
        if (provider === 'apple') {
          await signInParentWithApple();
        } else {
          await signInParentWithGoogle();
        }
      } catch (error) {
        showParentAuthError(t, error, { showCancelled: true });
      } finally {
        setParentExternalFlowActive(false);
        setSignInAction(null);
      }
    },
    [t],
  );

  const handleAppleSignIn = useCallback(async () => {
    setSignInAction('apple');
    setParentExternalFlowActive(true);
    try {
      await signInParentWithApple();
    } catch (error) {
      showParentAuthError(t, error);
    } finally {
      setParentExternalFlowActive(false);
      setSignInAction(null);
    }
  }, [t]);

  const handlePurchase = useCallback(async () => {
    if (!selectedPackage || !canPurchase) {
      return;
    }

    const result = await purchaseMonetizationPackage(
      selectedPackage.identifier,
    );

    if (result === 'cancelled') {
      return;
    }

    if (result === 'purchased') {
      Alert.alert(
        t('premium.alert.purchasedTitle'),
        t('premium.alert.purchasedText'),
      );
      return;
    }

    if (result === 'pending') {
      Alert.alert(
        t('premium.alert.pendingTitle'),
        t('premium.alert.pendingText'),
      );
      return;
    }

    if (result === 'alreadyPremium') {
      Alert.alert(t('premium.currentTitle'), t('premium.alert.alreadyPremium'));
      return;
    }

    if (result === 'signInRequired') {
      Alert.alert(t('premium.signInTitle'), t('premium.signInText'));
      return;
    }

    const latestSnapshot = getMonetizationSnapshot();
    Alert.alert(
      t('premium.error.title'),
      getMonetizationErrorMessage(t, latestSnapshot.errorCode),
    );
  }, [canPurchase, selectedPackage, t]);

  const handleRestore = useCallback(async () => {
    const result = await restoreMonetizationPurchases();

    if (result === 'cancelled') {
      return;
    }

    if (result === 'restored') {
      Alert.alert(
        t('premium.alert.restoredTitle'),
        t('premium.alert.restoredText'),
      );
      return;
    }

    if (result === 'withoutPremium') {
      Alert.alert(
        t('premium.alert.withoutPremiumTitle'),
        t('premium.alert.withoutPremiumText'),
      );
      return;
    }

    if (result === 'signInRequired') {
      Alert.alert(t('premium.signInTitle'), t('premium.signInText'));
      return;
    }

    const latestSnapshot = getMonetizationSnapshot();
    Alert.alert(
      t('premium.error.title'),
      getMonetizationErrorMessage(t, latestSnapshot.errorCode),
    );
  }, [t]);

  const handleRetry = useCallback(async () => {
    await Promise.all([
      refreshRemoteMonetizationConfig(),
      refreshMonetization({ invalidate: true }),
    ]);
  }, []);

  const handleSupport = useCallback(() => {
    const subject = encodeURIComponent(t('premium.legal.supportSubject'));
    openLink(`mailto:${APP_SUPPORT_EMAIL}?subject=${subject}`).catch(
      () => undefined,
    );
  }, [openLink, t]);

  if (!isGranted) {
    return (
      <Screen>
        <View style={styles.guardLoading}>
          <ActivityIndicator color={colors.primaryDark} size="large" />
          <Text style={styles.guardLoadingText}>
            {t('parent.gate.challengeTitle')}
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <AppCard style={styles.heroCard}>
        <KidBadge tone="teal">{t('premium.badge')}</KidBadge>
        <Text style={styles.heroTitle}>{t('premium.title')}</Text>
        <Text style={styles.heroSubtitle}>{t('premium.subtitle')}</Text>
      </AppCard>

      <View style={styles.benefits}>
        <BenefitRow
          text={t('premium.benefit.journeyText')}
          title={t('premium.benefit.journeyTitle')}
        />
        <BenefitRow
          text={t('premium.benefit.reviewText')}
          title={t('premium.benefit.reviewTitle')}
        />
        <BenefitRow
          text={t('premium.benefit.accountText')}
          title={t('premium.benefit.accountTitle')}
        />
      </View>

      {monetization.status === 'initializing' && (
        <AppCard style={styles.statusCard}>
          <View style={styles.inlineStatus}>
            <ActivityIndicator color={colors.primaryDark} size="small" />
            <Text style={styles.statusText}>{t('premium.resolving')}</Text>
          </View>
        </AppCard>
      )}

      {monetization.status === 'premium' && (
        <CurrentPremiumCard
          appLanguage={appLanguage}
          expirationDate={monetization.expirationDate}
          productType={monetization.activeProductType}
          t={t}
          willRenew={monetization.willRenew}
        />
      )}

      {monetization.founderAccessActive &&
        !monetization.isSignedIn &&
        monetization.status !== 'premium' && (
          <FounderCampaignCard
            appleSignInAvailable={appleSignInAvailable}
            canInteract={canFounderSignIn && !isBusy}
            googleSignInConfigured={googleSignInConfigured}
            onApplePress={() => handleFounderSignIn('apple')}
            onGooglePress={() => handleFounderSignIn('google')}
            signInAction={signInAction}
            t={t}
          />
        )}

      {!monetization.isSignedIn &&
        monetization.isAuthReady &&
        !monetization.founderAccessActive && (
        <AppCard style={styles.statusCard}>
          <Text style={styles.sectionTitle}>{t('premium.signInTitle')}</Text>
          <Text style={styles.bodyText}>{t('premium.signInText')}</Text>
          {!googleSignInConfigured && !appleSignInAvailable ? (
            <Text style={styles.configWarning}>
              {t('parent.account.googleConfigMissing')}
            </Text>
          ) : null}
          <View style={styles.actions}>
            {appleSignInAvailable && (
              <AppButton
                disabled={
                  isBusy || monetization.errorCode === 'firebaseUnavailable'
                }
                onPress={handleAppleSignIn}
                title={
                  signInAction === 'apple'
                    ? t('parent.account.signingIn')
                    : t('parent.account.signInApple')
                }
                variant="secondary"
              />
            )}
            <AppButton
              disabled={
                isBusy ||
                !googleSignInConfigured ||
                monetization.errorCode === 'firebaseUnavailable'
              }
              onPress={handleGoogleSignIn}
              title={
                signInAction === 'google'
                  ? t('parent.account.signingIn')
                  : t('parent.account.signInGoogle')
              }
              variant={appleSignInAvailable ? 'outlined' : 'secondary'}
            />
          </View>
        </AppCard>
      )}

      {monetization.status !== 'premium' && packages.length > 0 && (
        <View style={styles.packageSection}>
          {packages.map(item => (
            <PackageOption
              annualSavings={annualSavings}
              item={item}
              key={item.identifier}
              onPress={() => setSelectedPackageId(item.identifier)}
              selected={item.identifier === selectedPackageId}
              t={t}
            />
          ))}

          {!remoteConfig.premiumPurchaseEnabled && (
            <AppCard style={styles.warningCard}>
              <Text style={styles.noticeTitle}>
                {t('premium.purchasePausedTitle')}
              </Text>
              <Text style={styles.bodyText}>
                {t('premium.purchasePausedText')}
              </Text>
            </AppCard>
          )}

          {selectedPackage && (
            <>
              <AppButton
                disabled={!canPurchase}
                onPress={handlePurchase}
                title={
                  monetization.pendingAction === 'purchase'
                    ? t('premium.purchasing')
                    : t('premium.purchase', {
                        package: getPackageTitle(
                          t,
                          selectedPackage.packageType,
                        ),
                      })
                }
              />
              <Text style={styles.disclosure}>
                {selectedPackage.packageType === 'lifetime'
                  ? t('premium.disclosure.lifetime')
                  : t('premium.disclosure.subscription')}
              </Text>
            </>
          )}
        </View>
      )}

      {showLoadError && (
        <AppCard style={styles.errorCard}>
          <Text style={styles.noticeTitle}>
            {monetization.status === 'unavailable'
              ? t('premium.error.title')
              : t('premium.offeringUnavailableTitle')}
          </Text>
          <Text style={styles.bodyText}>
            {monetization.errorCode
              ? getMonetizationErrorMessage(t, monetization.errorCode)
              : t('premium.offeringUnavailableText')}
          </Text>
          <AppButton
            disabled={isBusy}
            onPress={handleRetry}
            title={t('premium.retry')}
            variant="secondary"
          />
        </AppCard>
      )}

      <View style={styles.secondaryActions}>
        <AppButton
          disabled={
            isBusy || !monetization.isConfigured || !monetization.isSignedIn
          }
          onPress={handleRestore}
          title={
            monetization.pendingAction === 'restore'
              ? t('premium.restoring')
              : t('premium.restore')
          }
          variant="outlined"
        />
        {monetization.managementUrl &&
          (monetization.activeProductType === 'monthly' ||
            monetization.activeProductType === 'annual') && (
            <AppButton
              disabled={isBusy}
              onPress={() => {
                openLink(monetization.managementUrl ?? '').catch(
                  () => undefined,
                );
              }}
              title={t('premium.manage')}
              variant="secondary"
            />
          )}
      </View>

      <View style={styles.legalActions}>
        {monetizationConfig.privacyPolicyUrl.trim() ? (
          <Pressable
            accessibilityRole="link"
            onPress={() => {
              openLink(monetizationConfig.privacyPolicyUrl).catch(
                () => undefined,
              );
            }}
          >
            <Text style={styles.legalLink}>{t('premium.legal.privacy')}</Text>
          </Pressable>
        ) : null}
        {monetizationConfig.termsOfUseUrl.trim() ? (
          <Pressable
            accessibilityRole="link"
            onPress={() => {
              openLink(monetizationConfig.termsOfUseUrl).catch(() => undefined);
            }}
          >
            <Text style={styles.legalLink}>{t('premium.legal.terms')}</Text>
          </Pressable>
        ) : null}
        <Pressable accessibilityRole="link" onPress={handleSupport}>
          <Text style={styles.legalLink}>{t('premium.legal.support')}</Text>
        </Pressable>
      </View>

      <AppButton
        onPress={navigation.goBack}
        title={t('premium.close')}
        variant="ghost"
      />
    </Screen>
  );
}

function FounderCampaignCard({
  appleSignInAvailable,
  canInteract,
  googleSignInConfigured,
  onApplePress,
  onGooglePress,
  signInAction,
  t,
}: {
  appleSignInAvailable: boolean;
  canInteract: boolean;
  googleSignInConfigured: boolean;
  onApplePress: () => void;
  onGooglePress: () => void;
  signInAction: SignInAction;
  t: Translator;
}) {
  return (
    <AppCard style={styles.founderCard}>
      <KidBadge tone="sun">{t('premium.founder.badge')}</KidBadge>
      <Text style={styles.sectionTitle}>{t('premium.founder.title')}</Text>
      <Text style={styles.bodyText}>{t('premium.founder.marketingText')}</Text>
      <Text style={styles.founderTerms}>{t('premium.founder.terms')}</Text>
      <Text style={styles.founderStatus}>
        {t('premium.founder.signInText')}
      </Text>
      <View style={styles.actions}>
        {appleSignInAvailable && (
          <AppButton
            disabled={!canInteract}
            onPress={onApplePress}
            title={
              signInAction === 'apple'
                ? t('parent.account.signingIn')
                : t('parent.account.signInApple')
            }
            variant="secondary"
          />
        )}
        <AppButton
          disabled={!canInteract || !googleSignInConfigured}
          onPress={onGooglePress}
          title={
            signInAction === 'google'
              ? t('parent.account.signingIn')
              : t('parent.account.signInGoogle')
          }
          variant={appleSignInAvailable ? 'outlined' : 'secondary'}
        />
      </View>
    </AppCard>
  );
}

function BenefitRow({ text, title }: { text: string; title: string }) {
  return (
    <View style={styles.benefitRow}>
      <View style={styles.benefitMark}>
        <Text style={styles.benefitMarkText}>✓</Text>
      </View>
      <View style={styles.benefitCopy}>
        <Text style={styles.benefitTitle}>{title}</Text>
        <Text style={styles.bodyText}>{text}</Text>
      </View>
    </View>
  );
}

function PackageOption({
  annualSavings,
  item,
  onPress,
  selected,
  t,
}: {
  annualSavings: number | null;
  item: MonetizationPackage;
  onPress: () => void;
  selected: boolean;
  t: Translator;
}) {
  const isAnnual = item.packageType === 'annual';

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.packageCard,
        selected && styles.packageCardSelected,
        pressed && styles.packageCardPressed,
      ]}
    >
      <View style={styles.packageHeader}>
        <View style={styles.packageCopy}>
          <View style={styles.packageTitleRow}>
            <Text style={styles.packageTitle}>
              {getPackageTitle(t, item.packageType)}
            </Text>
            {isAnnual && (
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>
                  {t('premium.package.bestValue')}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.packageBilling}>
            {getPackageBillingCopy(t, item.packageType)}
          </Text>
          {isAnnual && item.pricePerMonthString ? (
            <Text style={styles.packagePerMonth}>
              {t('premium.package.perMonth', {
                price: item.pricePerMonthString,
              })}
            </Text>
          ) : null}
        </View>
        <View style={styles.priceCopy}>
          <Text style={styles.packagePrice}>{item.priceString}</Text>
          {isAnnual && annualSavings ? (
            <Text style={styles.savingsText}>
              {t('premium.package.savePercent', {
                percent: annualSavings,
              })}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function CurrentPremiumCard({
  appLanguage,
  expirationDate,
  productType,
  t,
  willRenew,
}: {
  appLanguage: AppLanguage;
  expirationDate?: string;
  productType?: MonetizationProductType;
  t: Translator;
  willRenew: boolean;
}) {
  const detailLines = getPremiumStatusDetailLines(
    t,
    { expirationDate, productType, willRenew },
    appLanguage,
  );

  return (
    <AppCard style={styles.activeCard}>
      <Text style={styles.sectionTitle}>{t('premium.currentTitle')}</Text>
      <Text style={styles.activePlan}>
        {getPremiumProductTypeTitle(t, productType)}
      </Text>
      {detailLines.map(line => (
        <Text key={line} style={styles.bodyText}>
          {line}
        </Text>
      ))}
    </AppCard>
  );
}

function calculateAnnualSavings(packages: readonly MonetizationPackage[]) {
  const monthly = packages.find(item => item.packageType === 'monthly');
  const annual = packages.find(item => item.packageType === 'annual');

  if (
    !monthly ||
    !annual ||
    monthly.currencyCode !== annual.currencyCode ||
    monthly.price <= 0 ||
    annual.price <= 0
  ) {
    return null;
  }

  const savings = Math.round((1 - annual.price / (monthly.price * 12)) * 100);
  return savings > 0 && savings < 100 ? savings : null;
}

function getPackageTitle(t: Translator, packageType: MonetizationPackageType) {
  if (packageType === 'monthly') {
    return t('premium.package.monthly');
  }

  if (packageType === 'annual') {
    return t('premium.package.annual');
  }

  return t('premium.package.lifetime');
}

function getPackageBillingCopy(
  t: Translator,
  packageType: MonetizationPackageType,
) {
  if (packageType === 'monthly') {
    return t('premium.package.billingMonthly');
  }

  if (packageType === 'annual') {
    return t('premium.package.billingAnnual');
  }

  return t('premium.package.billingLifetime');
}

function getMonetizationErrorMessage(
  t: Translator,
  code: MonetizationErrorCode | undefined,
) {
  if (code === 'configurationMissing') {
    return t('premium.error.configurationMissing');
  }

  if (code === 'firebaseUnavailable') {
    return t('premium.error.firebaseUnavailable');
  }

  if (code === 'identityFailed') {
    return t('premium.error.identityFailed');
  }

  if (code === 'network') {
    return t('premium.error.network');
  }

  if (code === 'offeringsUnavailable') {
    return t('premium.error.offeringsUnavailable');
  }

  if (code === 'purchaseNotAllowed') {
    return t('premium.error.purchaseNotAllowed');
  }

  if (code === 'store') {
    return t('premium.error.store');
  }

  if (code === 'verificationFailed') {
    return t('premium.error.verificationFailed');
  }

  return t('premium.error.unknown');
}

function showParentAuthError(
  t: Translator,
  error: unknown,
  options?: { showCancelled?: boolean },
) {
  const code = getParentAuthErrorCode(error);
  if (code === 'cancelled' && !options?.showCancelled) {
    return;
  }

  Alert.alert(
    t('parent.account.errorTitle'),
    getParentAuthErrorMessage(t, code),
  );
}

function getParentAuthErrorMessage(t: Translator, code: ParentAuthErrorCode) {
  if (code === 'cancelled') {
    return t('parent.account.signInCancelled');
  }

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

  if (code === 'playServicesUnavailable') {
    return t('parent.account.playServicesUnavailable');
  }

  if (code === 'signInInProgress') {
    return t('parent.account.signInInProgress');
  }

  return t('parent.account.unknownError');
}

const styles = createThemedStyles(() => ({
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  activeCard: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderWidth: 2,
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  activePlan: {
    ...typography.subtitle,
    color: colors.primaryDark,
  },
  benefitCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
  benefitMark: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  benefitMarkText: {
    ...typography.body,
    color: colors.primaryDark,
    fontWeight: '900',
  },
  benefitRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  benefitTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '900',
  },
  benefits: {
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
  bodyText: {
    ...typography.body,
    color: colors.textSoft,
  },
  configWarning: {
    ...typography.caption,
    color: colors.accentDark,
  },
  disclosure: {
    ...typography.caption,
    color: colors.textSoft,
    textAlign: 'center',
  },
  errorCard: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
    borderWidth: 1,
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  founderCard: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
    borderWidth: 2,
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  founderStatus: {
    ...typography.body,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  founderTerms: {
    ...typography.caption,
    color: colors.textSoft,
  },
  guardLoading: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  guardLoadingText: {
    ...typography.body,
    color: colors.primaryDark,
    textAlign: 'center',
  },
  heroCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.primary,
    borderWidth: 2,
    gap: spacing.sm,
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.textSoft,
  },
  heroTitle: {
    ...typography.title,
    color: colors.text,
  },
  inlineStatus: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  legalActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  legalLink: {
    ...typography.caption,
    color: colors.primaryDark,
    textDecorationLine: 'underline',
  },
  noticeTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  packageBilling: {
    ...typography.caption,
    color: colors.textSoft,
  },
  packageCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.lg,
  },
  packageCardPressed: {
    opacity: 0.88,
  },
  packageCardSelected: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.primary,
  },
  packageCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
  packageHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  packagePerMonth: {
    ...typography.caption,
    color: colors.primaryDark,
  },
  packagePrice: {
    ...typography.subtitle,
    color: colors.text,
    textAlign: 'right',
  },
  packageSection: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  packageTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  packageTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  priceCopy: {
    alignItems: 'flex-end',
    gap: spacing.xxs,
  },
  recommendedBadge: {
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  recommendedText: {
    ...typography.caption,
    color: colors.secondaryDark,
  },
  savingsText: {
    ...typography.caption,
    color: colors.primaryDark,
  },
  secondaryActions: {
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  statusCard: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  statusText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  warningCard: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.borderWarm,
    borderWidth: 1,
    gap: spacing.sm,
  },
}));
