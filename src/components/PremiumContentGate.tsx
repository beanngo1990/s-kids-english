import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { useI18n } from '../i18n';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { AppButton } from './AppButton';
import { AppCard } from './AppCard';
import { Screen } from './Screen';
import { SKidsIcon } from './SKidsIcon';

type PremiumContentGateProps = Readonly<{
  isResolving: boolean;
  onAskParent: () => void;
}>;

export function PremiumContentGate({
  isResolving,
  onAskParent,
}: PremiumContentGateProps) {
  useThemeSync();
  const t = useI18n();

  return (
    <Screen>
      <View style={styles.container}>
        <AppCard style={styles.card}>
          <View style={styles.iconBox}>
            {isResolving ? (
              <ActivityIndicator color={colors.primary} size="large" />
            ) : (
              <SKidsIcon name="parentLock" size={64} />
            )}
          </View>
          <Text style={styles.title}>
            {isResolving
              ? t('premium.gate.loading')
              : t('premium.gate.title')}
          </Text>
          <Text style={styles.message}>
            {isResolving
              ? t('premium.gate.loadingMessage')
              : t('premium.gate.message')}
          </Text>
          {!isResolving ? (
            <AppButton
              title={t('premium.gate.askParent')}
              onPress={onAskParent}
            />
          ) : null}
        </AppCard>
      </View>
    </Screen>
  );
}

const styles = createThemedStyles(() => ({
  card: {
    alignItems: 'center',
    gap: spacing.md,
    maxWidth: 520,
    width: '100%',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  iconBox: {
    alignItems: 'center',
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  message: {
    color: colors.textSoft,
    textAlign: 'center',
    ...typography.body,
  },
  title: {
    color: colors.text,
    textAlign: 'center',
    ...typography.title,
  },
}));
