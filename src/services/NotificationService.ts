import notifee, { TriggerType, RepeatFrequency, AuthorizationStatus } from '@notifee/react-native';

import { getParentSettings } from '../engine/ParentSettingsManager';
import { createTranslator } from '../i18n';

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
  }

  static async scheduleDailyReminder(time: string) {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;
    const t = await getNotificationTranslator();

    const [hours, minutes] = time.split(':').map(Number);
    
    const channelId = await notifee.createChannel({
      id: 'daily-reminder',
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
        id: 'daily-reminder',
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
  }

  static async cancelDailyReminder() {
    await notifee.cancelTriggerNotification('daily-reminder');
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
