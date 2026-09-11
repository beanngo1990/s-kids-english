import React, { useEffect, useRef, useState } from 'react';
import {
  AppState,
  Keyboard,
  Platform,
  Pressable,
  Text,
  TextInput,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { grantParentAccess } from '../engine/ParentAccessSession';
import { useI18n } from '../i18n';
import { colors, createThemedStyles, useThemeSync } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useResponsiveLayout } from '../theme/responsive';
import { AppCard } from './AppCard';
import { KidBadge } from './KidBadge';

const GATE_COOLDOWN_MS = 10_000;

export type ParentGateChallenge = Readonly<{
  answer: number;
  expression: string;
}>;

type ParentGateChallengeCardProps = {
  hint?: string;
  onGranted?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function createParentGateChallenge(): ParentGateChallenge {
  const first = 10 + Math.floor(Math.random() * 90);
  const second = 10 + Math.floor(Math.random() * 90);
  const shouldAdd = Math.random() >= 0.5;

  if (shouldAdd) {
    return {
      answer: first + second,
      expression: `${first} + ${second}`,
    };
  }

  const larger = Math.max(first, second);
  const smaller = Math.min(first, second);
  return {
    answer: larger - smaller,
    expression: `${larger} − ${smaller}`,
  };
}

export function ParentGateChallengeCard({
  hint,
  onGranted,
  style,
}: ParentGateChallengeCardProps) {
  useThemeSync();
  const t = useI18n();
  const responsiveLayout = useResponsiveLayout();
  const [challenge, setChallenge] = useState(createParentGateChallenge);
  const [answer, setAnswer] = useState('');
  const [hasError, setHasError] = useState(false);
  const [wrongAttemptCount, setWrongAttemptCount] = useState(0);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const isSubmittingRef = useRef(false);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keyboardHideSubRef = useRef<{ remove: () => void } | null>(null);

  const isTabletIos =
    Platform.OS === 'ios' && (Platform.isPad || responsiveLayout.isTablet);
  const keyboardType = isTabletIos ? 'numbers-and-punctuation' : 'number-pad';
  const returnKeyType = isTabletIos ? 'default' : 'done';

  useEffect(() => {
    const resetChallenge = () => {
      clearCooldownTimer();
      clearSubmitTimer();
      isSubmittingRef.current = false;
      setChallenge(createParentGateChallenge());
      setAnswer('');
      setHasError(false);
      setWrongAttemptCount(0);
      setIsCoolingDown(false);
    };
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState !== 'active') {
        resetChallenge();
      }
    });

    return () => {
      subscription.remove();
      clearCooldownTimer();
      clearSubmitTimer();
    };
  }, []);

  const submitChallenge = () => {
    if (isSubmittingRef.current || isCoolingDown || answer.trim().length === 0) {
      return;
    }

    if (Number(answer.trim()) === challenge.answer) {
      isSubmittingRef.current = true;
      setHasError(false);
      setWrongAttemptCount(0);
      inputRef.current?.blur();
      Keyboard.dismiss();
      clearSubmitTimer();

      let hasFinished = false;
      const finishUnlock = () => {
        if (hasFinished) {
          return;
        }
        hasFinished = true;
        clearSubmitTimer();
        grantParentAccess();
        onGranted?.();
      };

      const isKeyboardOpen =
        typeof Keyboard.isVisible === 'function' ? Keyboard.isVisible() : false;

      if (!isKeyboardOpen) {
        submitTimerRef.current = setTimeout(finishUnlock, 100);
        return;
      }

      // On iPad, unmounting the view while UIKit is animating keyboard dismissal causes
      // an EXC_BAD_ACCESS crash. Waiting for keyboardDidHide ensures the animation has completed.
      keyboardHideSubRef.current = Keyboard.addListener(
        'keyboardDidHide',
        finishUnlock,
      );
      submitTimerRef.current = setTimeout(finishUnlock, 350);
      return;
    }

    const nextWrongAttemptCount = wrongAttemptCount + 1;
    setHasError(true);
    setAnswer('');
    setWrongAttemptCount(nextWrongAttemptCount);
    setChallenge(createParentGateChallenge());

    if (nextWrongAttemptCount < 3) {
      return;
    }

    setWrongAttemptCount(0);
    setIsCoolingDown(true);
    clearCooldownTimer();
    cooldownTimerRef.current = setTimeout(() => {
      setIsCoolingDown(false);
      setHasError(false);
      cooldownTimerRef.current = null;
    }, GATE_COOLDOWN_MS);
  };

  const isSubmitDisabled = isCoolingDown || answer.trim().length === 0;

  return (
    <AppCard style={[styles.card, style]}>
      <KidBadge tone="teal">{t('parent.gate.badge')}</KidBadge>
      <Text style={styles.title}>{t('parent.gate.challengeTitle')}</Text>
      <Text style={styles.hint}>{hint ?? t('parent.gate.challengeHint')}</Text>
      <Text style={styles.question}>{challenge.expression} = ?</Text>
      <TextInput
        ref={inputRef}
        accessibilityLabel={t('parent.gate.challengePlaceholder')}
        autoCapitalize="none"
        autoCorrect={false}
        blurOnSubmit
        editable={!isCoolingDown}
        keyboardType={keyboardType}
        onChangeText={value => {
          setAnswer(value.replace(/[^0-9-]/g, ''));
          setHasError(false);
        }}
        onSubmitEditing={submitChallenge}
        placeholder={t('parent.gate.challengePlaceholder')}
        placeholderTextColor={colors.muted}
        returnKeyType={returnKeyType}
        spellCheck={false}
        style={styles.answerInput}
        value={answer}
      />
      {isCoolingDown ? (
        <Text style={styles.error}>{t('parent.gate.challengeCooldown')}</Text>
      ) : hasError ? (
        <Text style={styles.error}>{t('parent.gate.challengeWrong')}</Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        disabled={isSubmitDisabled}
        onPress={submitChallenge}
        style={({ pressed }) => [
          styles.button,
          isSubmitDisabled && styles.buttonDisabled,
          pressed && !isSubmitDisabled && styles.buttonPressed,
        ]}
      >
        <Text style={styles.buttonText}>
          {t('parent.gate.challengeSubmit')}
        </Text>
      </Pressable>
    </AppCard>
  );

  function clearCooldownTimer() {
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }
  }

  function clearSubmitTimer() {
    if (submitTimerRef.current) {
      clearTimeout(submitTimerRef.current);
      submitTimerRef.current = null;
    }
    if (keyboardHideSubRef.current) {
      keyboardHideSubRef.current.remove();
      keyboardHideSubRef.current = null;
    }
  }
}

const styles = createThemedStyles(() => ({
  answerInput: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    height: 56,
    paddingHorizontal: spacing.md,
    paddingVertical: 0,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderColor: colors.outlineStrong,
    borderRadius: radius.pill,
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 72,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ translateY: 2 }, { scale: 0.99 }],
  },
  buttonText: {
    color: colors.text,
    textAlign: 'center',
    ...typography.button,
  },
  card: {
    gap: spacing.lg,
    width: '100%',
  },
  error: {
    color: colors.alert,
    textAlign: 'center',
    ...typography.caption,
  },
  hint: {
    color: colors.textSoft,
    ...typography.body,
  },
  question: {
    color: colors.text,
    textAlign: 'center',
    ...typography.hero,
  },
  title: {
    color: colors.text,
    ...typography.title,
  },
}));
