import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import {
  cancelAllNotifications,
  clearBadge,
  getBadgeCount,
  registerForPushNotificationsAsync,
  scheduleLocalNotification,
  setBadgeCount,
} from '../notifications';

// Mock modules
jest.mock('expo-device');
jest.mock('expo-notifications');

describe('Notification Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerForPushNotificationsAsync', () => {
    it('should return null if not on a physical device', async () => {
      (Device.isDevice as unknown as boolean) = false;

      const result = await registerForPushNotificationsAsync();

      expect(result).toBeNull();
    });

    it('should return null if permission is denied', async () => {
      (Device.isDevice as unknown as boolean) = true;
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await registerForPushNotificationsAsync();

      expect(result).toBeNull();
    });

    it('should return push token if permission is granted', async () => {
      (Device.isDevice as unknown as boolean) = true;
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
      });
      (Notifications.setNotificationChannelAsync as jest.Mock).mockResolvedValue({});

      const result = await registerForPushNotificationsAsync();

      expect(result).toBe('ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]');
      expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      (Device.isDevice as unknown as boolean) = true;
      (Notifications.getPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('Permission error')
      );

      const result = await registerForPushNotificationsAsync();

      expect(result).toBeNull();
    });
  });

  describe('scheduleLocalNotification', () => {
    it('should schedule a notification with default trigger', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('notification-id');

      await scheduleLocalNotification('Test Title', 'Test Body');

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Test Title',
          body: 'Test Body',
          data: {},
          sound: 'default',
        },
        trigger: null,
      });
    });

    it('should schedule a notification with custom data and trigger', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('notification-id');
      const customData = { key: 'value' };
      const trigger = {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 60,
      } as Notifications.TimeIntervalTriggerInput;

      await scheduleLocalNotification('Test Title', 'Test Body', customData, trigger);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Test Title',
          body: 'Test Body',
          data: customData,
          sound: 'default',
        },
        trigger,
      });
    });

    it('should handle errors gracefully', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValue(
        new Error('Schedule error')
      );

      await expect(scheduleLocalNotification('Title', 'Body')).resolves.not.toThrow();
    });
  });

  describe('cancelAllNotifications', () => {
    it('should cancel all scheduled notifications', async () => {
      (Notifications.cancelAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue(
        undefined
      );

      await cancelAllNotifications();

      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });
  });

  describe('getBadgeCount', () => {
    it('should return badge count', async () => {
      (Notifications.getBadgeCountAsync as jest.Mock).mockResolvedValue(5);

      const count = await getBadgeCount();

      expect(count).toBe(5);
    });
  });

  describe('setBadgeCount', () => {
    it('should set badge count', async () => {
      (Notifications.setBadgeCountAsync as jest.Mock).mockResolvedValue(undefined);

      await setBadgeCount(10);

      expect(Notifications.setBadgeCountAsync).toHaveBeenCalledWith(10);
    });
  });

  describe('clearBadge', () => {
    it('should clear badge by setting count to 0', async () => {
      (Notifications.setBadgeCountAsync as jest.Mock).mockResolvedValue(undefined);

      await clearBadge();

      expect(Notifications.setBadgeCountAsync).toHaveBeenCalledWith(0);
    });
  });
});
