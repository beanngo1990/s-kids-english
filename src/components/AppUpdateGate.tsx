import React, {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppUpdateSnapshot } from '../engine/AppUpdateManager';
import { playTapSound, speakVi, speakWord } from '../engine/AudioManager';
import {
  setParentExternalFlowActive,
  useParentAccessSnapshot,
} from '../engine/ParentAccessSession';
import { getKidLockAudioPrompt } from '../data/kidLockAudioPrompts';
import { useI18n, useSavedAppLanguage } from '../i18n';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { AppButton } from './AppButton';
import { MascotImage } from './mascot';
import { ParentGateChallengeCard } from './ParentGateChallengeCard';
import { SKidsIcon } from './SKidsIcon';

type AppUpdateGateProps = {
  children: ReactNode;
};

export function AppUpdateGate({ children }: AppUpdateGateProps) {
  useThemeSync();
  const t = useI18n();
  const appLanguage = useSavedAppLanguage();
  const update = useAppUpdateSnapshot();
  const { isGranted: hasParentAccess } = useParentAccessSnapshot();
  const [isParentGateVisible, setIsParentGateVisible] = useState(false);
  const [isOpeningStore, setIsOpeningStore] = useState(false);
  const hasAutoPlayedRef = useRef(false);
  const isVisible = update.status === 'required';
  const childPrompt = getKidLockAudioPrompt('appUpdate', appLanguage);

  useEffect(() => {
    if (!isVisible) {
      hasAutoPlayedRef.current = false;
      setIsParentGateVisible(false);
      setIsOpeningStore(false);
    }
  }, [isVisible]);

  const playChildPrompt = useCallback(
    (withTapSound = false) => {
      const playPrompt = async () => {
        if (withTapSound) {
          await playTapSound().catch(() => undefined);
        }
        const speech =
          appLanguage === 'en' ? speakWord(childPrompt) : speakVi(childPrompt);
        await speech.catch(() => undefined);
      };

      playPrompt().catch(() => undefined);
    },
    [appLanguage, childPrompt],
  );

  useEffect(() => {
    if (!isVisible || hasAutoPlayedRef.current) {
      return;
    }

    hasAutoPlayedRef.current = true;
    playChildPrompt();
  }, [isVisible, playChildPrompt]);

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

  const handleCallParentPress = useCallback(() => {
    if (hasParentAccess) {
      openStore().catch(() => undefined);
      return;
    }

    setIsParentGateVisible(true);
  }, [hasParentAccess, openStore]);

  return (
    <>
      {children}
      {isVisible ? (
        <Modal
          animationType="fade"
          onRequestClose={() => undefined}
          presentationStyle="fullScreen"
          statusBarTranslucent
          visible
        >
          <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.safeArea}
            >
              <ScrollView
                accessibilityViewIsModal
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
              >
                {isParentGateVisible ? (
                  <View style={styles.contentFrame}>
                    <ParentGateChallengeCard
                      hint={t('appUpdate.parentGateHint')}
                      onGranted={() => {
                        setIsParentGateVisible(false);
                        openStore().catch(() => undefined);
                      }}
                    />
                    <AppButton
                      onPress={() => setIsParentGateVisible(false)}
                      title={t('common.back')}
                      variant="ghost"
                    />
                  </View>
                ) : (
                  <View style={styles.childContentFrame}>
                    <View style={styles.mascotFrame}>
                      <MascotImage
                        accessibilityLabel={t(
                          'appUpdate.replayPromptAccessibility',
                        )}
                        onPress={() => playChildPrompt(true)}
                        pose="learn"
                        size="xl"
                      />
                      <View pointerEvents="none" style={styles.speakerBadge}>
                        <SKidsIcon name="speak" size={34} />
                      </View>
                    </View>
                    <Text accessibilityRole="header" style={styles.childTitle}>
                      {t('appUpdate.childTitle')}
                    </Text>
                    <Text style={styles.childHint}>
                      {t('appUpdate.childReplayHint')}
                    </Text>
                    <AppButton
                      disabled={isOpeningStore}
                      iconName="parentGate"
                      iconSize={72}
                      onPress={handleCallParentPress}
                      style={styles.parentButton}
                      title={t('appUpdate.callParentAction')}
                    />
                  </View>
                )}
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>
      ) : null}
    </>
  );
}

const styles = createThemedStyles(() => ({
  childContentFrame: {
    alignItems: 'center',
    gap: spacing.md,
    maxWidth: 560,
    width: '100%',
  },
  childHint: {
    color: colors.textSoft,
    textAlign: 'center',
    ...typography.body,
  },
  childTitle: {
    color: colors.text,
    textAlign: 'center',
    ...typography.title,
  },
  contentFrame: {
    alignItems: 'center',
    gap: spacing.md,
    maxWidth: 640,
    width: '100%',
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  mascotFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  parentButton: {
    marginTop: spacing.sm,
    maxWidth: 440,
    minHeight: 112,
    width: '100%',
  },
  speakerBadge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    borderWidth: 2,
    bottom: spacing.xs,
    height: 58,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.md,
    width: 58,
  },
}));
