jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    cancelTriggerNotification: jest.fn(),
    createChannel: jest.fn(),
    createTriggerNotification: jest.fn(),
    getNotificationSettings: jest.fn(),
    getTriggerNotificationIds: jest.fn(),
    requestPermission: jest.fn(),
  },
    AuthorizationStatus: {
      AUTHORIZED: 1,
      DENIED: 0,
      NOT_DETERMINED: -1,
      PROVISIONAL: 2,
    },
    RepeatFrequency: { DAILY: 1 },
    TriggerType: { TIMESTAMP: 0 },
}));

jest.mock('../src/engine/ParentSettingsManager', () => ({
  getParentSettings: jest.fn().mockResolvedValue({ appLanguage: 'vi' }),
}));

jest.mock('../src/i18n', () => ({
  createTranslator: jest.fn(() => (key: string) => key),
}));

import notifee from '@notifee/react-native';

import { NotificationService } from '../src/services/NotificationService';

const notificationApi = notifee as unknown as {
  cancelTriggerNotification: jest.Mock;
  createChannel: jest.Mock;
  createTriggerNotification: jest.Mock;
  getNotificationSettings: jest.Mock;
  getTriggerNotificationIds: jest.Mock;
  requestPermission: jest.Mock;
};

beforeEach(() => {
  jest.clearAllMocks();
  notificationApi.cancelTriggerNotification.mockResolvedValue(undefined);
  notificationApi.createChannel.mockResolvedValue('daily-reminder');
  notificationApi.createTriggerNotification.mockResolvedValue(
    'daily-reminder',
  );
  notificationApi.getTriggerNotificationIds.mockResolvedValue([]);
});

test('keeps the reminder disabled when notification permission is denied', async () => {
  notificationApi.requestPermission.mockResolvedValue({
    authorizationStatus: 0,
  });

  await expect(
    NotificationService.scheduleDailyReminder('19:30'),
  ).resolves.toBe(false);

  expect(notificationApi.cancelTriggerNotification).toHaveBeenCalledWith(
    'daily-reminder',
  );
  expect(notificationApi.createChannel).not.toHaveBeenCalled();
  expect(notificationApi.createTriggerNotification).not.toHaveBeenCalled();
});

test('reports success only after creating the daily reminder trigger', async () => {
  notificationApi.requestPermission.mockResolvedValue({
    authorizationStatus: 1,
  });

  await expect(
    NotificationService.scheduleDailyReminder('19:30'),
  ).resolves.toBe(true);

  expect(notificationApi.createChannel).toHaveBeenCalledWith({
    id: 'daily-reminder',
    name: 'notifications.dailyChannel',
  });
  expect(notificationApi.cancelTriggerNotification).toHaveBeenCalledWith(
    'daily-reminder',
  );
  expect(notificationApi.createTriggerNotification).toHaveBeenCalledTimes(1);
});

test('requires both permission and a pending trigger for an active reminder', async () => {
  notificationApi.getNotificationSettings.mockResolvedValue({
    authorizationStatus: 0,
  });

  await expect(NotificationService.isDailyReminderActive()).resolves.toBe(
    false,
  );
  expect(notificationApi.getTriggerNotificationIds).not.toHaveBeenCalled();

  notificationApi.getNotificationSettings.mockResolvedValue({
    authorizationStatus: 1,
  });
  notificationApi.getTriggerNotificationIds.mockResolvedValue([
    'daily-reminder',
  ]);

  await expect(NotificationService.isDailyReminderActive()).resolves.toBe(
    true,
  );
});
