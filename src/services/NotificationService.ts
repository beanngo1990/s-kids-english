import notifee, { TriggerType, RepeatFrequency, AuthorizationStatus } from '@notifee/react-native';

import { getParentSettings } from '../engine/ParentSettingsManager';
import { createTranslator } from '../i18n';

const DAILY_REMINDER_ID = 'daily-reminder';

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
  }

  static async scheduleDailyReminder(time: string): Promise<boolean> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      await this.cancelDailyReminder().catch(() => undefined);
      return false;
    }
    const t = await getNotificationTranslator();

    const [hours, minutes] = time.split(':').map(Number);

    const channelId = await notifee.createChannel({
      id: DAILY_REMINDER_ID,
      name: t('notifications.dailyChannel'),
    });

    const date = new Date(Date.now());
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);

    if (date.getTime() <= Date.now()) {
      date.setDate(date.getDate() + 1);
    }

    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    } as const;

    await this.cancelDailyReminder();

    await notifee.createTriggerNotification(
      {
        id: DAILY_REMINDER_ID,
        title: t('notifications.dailyTitle'),
        body: t('notifications.dailyBody'),
        android: {
          channelId,
          smallIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
          },
        },
      },
      trigger,
    );

    return true;
  }

  static async isDailyReminderActive(): Promise<boolean> {
    const settings = await notifee.getNotificationSettings();
    if (settings.authorizationStatus < AuthorizationStatus.AUTHORIZED) {
      return false;
    }

    const triggerIds = await notifee.getTriggerNotificationIds();
    return triggerIds.includes(DAILY_REMINDER_ID);
  }

  static async cancelDailyReminder() {
    await notifee.cancelTriggerNotification(DAILY_REMINDER_ID);
  }
}

async function getNotificationTranslator() {
  try {
    const settings = await getParentSettings();
    return createTranslator(settings.appLanguage);
  } catch {
    return createTranslator('vi');
  }
}
