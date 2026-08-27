import React, { useEffect, useState } from 'react';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Modal, Platform, Pressable, Text, View } from 'react-native';

import { useI18n } from '../i18n';
import {
  colors,
  createThemedStyles,
  getActiveColorScheme,
  useThemeSync,
} from '../theme/colors';
import { radius, spacing, touchTarget } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';

type Props = {
  isSaving: boolean;
  onClose: () => void;
  onConfirm: (time: string) => void;
  value: string;
  visible: boolean;
};

const DEFAULT_REMINDER_TIME = '19:30';

function getDateForTime(time: string) {
  const [hoursText, minutesText] = time.split(':');
  const hours = Number(hoursText);
  const minutes = Number(minutesText);
  const date = new Date();

  if (
    Number.isInteger(hours) &&
    hours >= 0 &&
    hours <= 23 &&
    Number.isInteger(minutes) &&
    minutes >= 0 &&
    minutes <= 59
  ) {
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  const [fallbackHours, fallbackMinutes] =
    DEFAULT_REMINDER_TIME.split(':').map(Number);
  date.setHours(fallbackHours, fallbackMinutes, 0, 0);
  return date;
}

function getTimeForDate(date: Date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}

export function ReminderTimePickerModal({
  isSaving,
  onClose,
  onConfirm,
  value,
  visible,
}: Props) {
  useThemeSync();
  const t = useI18n();
  const [draftDate, setDraftDate] = useState(() => getDateForTime(value));

  useEffect(() => {
    if (visible) {
      setDraftDate(getDateForTime(value));
    }
  }, [value, visible]);

  const draftTime = getTimeForDate(draftDate);
  const handlePickerChange = (
    _event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (selectedDate) {
      setDraftDate(selectedDate);
    }
  };
  const handleCancel = () => {
    if (!isSaving) {
      onClose();
    }
  };

  if (Platform.OS === 'android') {
    if (!visible) {
      return null;
    }

    return (
      <DateTimePicker
        accessibilityLabel={t(
          'parent.settings.reminderTimePickerAccessibility',
        )}
        display="clock"
        is24Hour
        mode="time"
        negativeButton={{
          label: t('parent.settings.reminderTimeCancelAction'),
        }}
        onChange={(event, selectedDate) => {
          onClose();
          if (event.type === 'set' && selectedDate) {
            onConfirm(getTimeForDate(selectedDate));
          }
        }}
        positiveButton={{
          label: t('parent.settings.reminderTimeConfirmAction'),
        }}
        testID="reminder-time-picker"
        value={getDateForTime(value)}
      />
    );
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={handleCancel}
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Pressable
          accessible={false}
          disabled={isSaving}
          onPress={handleCancel}
          style={styles.backdropDismissArea}
        />
        <View accessibilityViewIsModal style={styles.dialog}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {t('parent.settings.reminderTimePickerTitle')}
            </Text>
            <Text style={styles.subtitle}>
              {t('parent.settings.reminderTimePickerSubtitle')}
            </Text>
          </View>

          <Text accessibilityLiveRegion="polite" style={styles.selectedTime}>
            {draftTime}
          </Text>

          <View style={styles.pickerFrame}>
            <DateTimePicker
              accessibilityLabel={t(
                'parent.settings.reminderTimePickerAccessibility',
              )}
              display="spinner"
              mode="time"
              onChange={handlePickerChange}
              style={styles.picker}
              testID="reminder-time-picker"
              textColor={colors.text}
              themeVariant={getActiveColorScheme()}
              value={draftDate}
            />
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityLabel={t('parent.settings.reminderTimeCancelAction')}
              accessibilityRole="button"
              accessibilityState={{ disabled: isSaving }}
              disabled={isSaving}
              onPress={handleCancel}
              style={({ pressed }) => [
                styles.action,
                styles.cancelAction,
                pressed && styles.pressed,
                isSaving && styles.disabled,
              ]}
            >
              <Text style={styles.cancelActionText}>
                {t('parent.settings.reminderTimeCancelAction')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel={t(
                'parent.settings.reminderTimeConfirmAction',
              )}
              accessibilityRole="button"
              accessibilityState={{ disabled: isSaving }}
              disabled={isSaving}
              onPress={() => onConfirm(draftTime)}
              style={({ pressed }) => [
                styles.action,
                styles.confirmAction,
                pressed && styles.pressed,
                isSaving && styles.disabled,
              ]}
            >
              <Text style={styles.confirmActionText}>
                {isSaving
                  ? t('common.saveInProgress')
                  : t('parent.settings.reminderTimeConfirmAction')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = createThemedStyles(() => ({
  action: {
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 2,
    flex: 1,
    justifyContent: 'center',
    minHeight: touchTarget.minimum,
    paddingHorizontal: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  backdropDismissArea: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  cancelAction: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
  },
  cancelActionText: {
    color: colors.primaryDark,
    ...typography.body,
  },
  confirmAction: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  confirmActionText: {
    color: colors.white,
    ...typography.body,
  },
  dialog: {
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.md,
    maxWidth: 480,
    padding: spacing.lg,
    width: '100%',
    ...shadows.floating,
  },
  disabled: {
    opacity: 0.56,
  },
  header: {
    gap: spacing.xxs,
  },
  overlay: {
    backgroundColor: colors.modalBackdrop,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  picker: {
    height: 180,
    width: '100%',
  },
  pickerFrame: {
    backgroundColor: colors.surfaceBlue,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ translateY: 2 }, { scale: 0.99 }],
  },
  selectedTime: {
    alignSelf: 'center',
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    borderWidth: 1,
    color: colors.primaryDark,
    minWidth: 112,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    textAlign: 'center',
    ...typography.subtitle,
  },
  subtitle: {
    color: colors.textSoft,
    textAlign: 'center',
    ...typography.caption,
  },
  title: {
    color: colors.text,
    textAlign: 'center',
    ...typography.subtitle,
  },
}));
