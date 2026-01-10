/**
 * Push Notifications Service
 *
 * Handles push notification permissions, token registration,
 * and notification handling.
 *
 * Setup Instructions:
 * 1. Add your FCM credentials in app.json (Android)
 * 2. Configure APNs certificates (iOS)
 * 3. Get push token and send to your backend
 */

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications and get push token
 * @returns Push token string or null if failed
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('Push notifications only work on physical devices');
    return null;
  }

  try {
    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Push notification permission denied');
      return null;
    }

    // Get push token
    const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
    if (!projectId) {
      console.warn('EXPO_PUBLIC_PROJECT_ID not set. Push notifications may not work.');
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: projectId || undefined,
    });

    // Android-specific channel setup
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }

    return token.data;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

/**
 * Schedule a local notification
 * @param title Notification title
 * @param body Notification body
 * @param data Optional data payload
 * @param trigger Optional trigger (default: immediate)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
  trigger?: Notifications.NotificationTriggerInput
) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
      },
      trigger: trigger || null, // null = immediate
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get notification badge count
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set notification badge count
 * @param count Badge number
 */
export async function setBadgeCount(count: number) {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear all badges
 */
export async function clearBadge() {
  await Notifications.setBadgeCountAsync(0);
}

/**
 * Add notification received listener (when app is foregrounded)
 * @param callback Function to call when notification received
 * @returns Subscription object (call .remove() to unsubscribe)
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add notification response listener (when user taps notification)
 * @param callback Function to call when notification tapped
 * @returns Subscription object (call .remove() to unsubscribe)
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
