import type { MonetizationProductType } from '../engine/MonetizationManager';
import type { Translator } from '../i18n';
import type { AppLanguage } from '../i18n/types';

type PremiumStatusDetails = {
  expirationDate?: string;
  productType?: MonetizationProductType;
  willRenew: boolean;
};

export function getPremiumProductTypeTitle(
  t: Translator,
  productType: MonetizationProductType | undefined,
) {
  if (productType === 'monthly') {
    return t('premium.currentMonthly');
  }

  if (productType === 'annual') {
    return t('premium.currentAnnual');
  }

  if (productType === 'lifetime') {
    return t('premium.currentLifetime');
  }

  if (productType === 'founder') {
    return t('premium.currentFounder');
  }

  if (productType === 'promotional') {
    return t('premium.currentPromotional');
  }

  return t('premium.currentGeneric');
}

export function formatPremiumExpirationDate(
  expirationDate: string | undefined,
  appLanguage: AppLanguage,
) {
  if (!expirationDate) {
    return '';
  }

  const parsedDate = new Date(expirationDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return parsedDate.toLocaleDateString(
    appLanguage === 'vi' ? 'vi-VN' : 'en-US',
  );
}

export function getPremiumStatusDetailLines(
  t: Translator,
  details: PremiumStatusDetails,
  appLanguage: AppLanguage,
) {
  if (details.productType === 'lifetime') {
    return [t('premium.currentLifetimeText')];
  }

  const lines: string[] = [];
  const formattedExpirationDate = formatPremiumExpirationDate(
    details.expirationDate,
    appLanguage,
  );

  if (formattedExpirationDate) {
    lines.push(
      t('premium.currentUntil', {
        date: formattedExpirationDate,
      }),
    );
  }

  lines.push(
    details.willRenew
      ? t('premium.currentRenews')
      : t('premium.currentNoRenew'),
  );

  return lines;
}
