/**
 * Update Manager
 *
 * Handles OTA (Over-The-Air) updates using Expo Updates
 * - Check for updates on app launch
 * - Download and apply updates
 * - Notify users about new versions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';
import * as Updates from 'expo-updates';
import { Alert } from 'react-native';

const LAST_UPDATE_CHECK_KEY = '@app/lastUpdateCheck';
const UPDATE_CHECK_INTERVAL = 1000 * 60 * 60 * 24; // 24 hours

export interface UpdateCheckResult {
  isAvailable: boolean;
  manifest?: Updates.Manifest;
}

export interface UpdateManagerConfig {
  /** Whether to check for updates automatically on app launch */
  checkOnLaunch?: boolean;
  /** Whether to show alerts to users */
  showAlerts?: boolean;
  /** Minimum time between update checks (ms) */
  checkInterval?: number;
}

class UpdateManager {
  private config: UpdateManagerConfig = {
    checkOnLaunch: true,
    showAlerts: true,
    checkInterval: UPDATE_CHECK_INTERVAL,
  };

  /**
   * Configure update manager
   */
  configure(config: Partial<UpdateManagerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if updates are enabled
   */
  private isUpdateEnabled(): boolean {
    // Updates only work in production builds, not in Expo Go or development
    if (__DEV__) {
      console.log('[Updates] Disabled in development mode');
      return false;
    }

    if (!Updates.isEnabled) {
      console.log('[Updates] Expo Updates is not enabled');
      return false;
    }

    return true;
  }

  /**
   * Check if we should check for updates based on last check time
   */
  private async shouldCheckForUpdates(): Promise<boolean> {
    if (!this.config.checkInterval) return true;

    try {
      const lastCheck = await AsyncStorage.getItem(LAST_UPDATE_CHECK_KEY);
      if (!lastCheck) return true;

      const timeSinceLastCheck = Date.now() - Number.parseInt(lastCheck, 10);
      return timeSinceLastCheck >= this.config.checkInterval;
    } catch (error) {
      console.error('[Updates] Error checking last update time:', error);
      return true;
    }
  }

  /**
   * Update the last check timestamp
   */
  private async updateLastCheckTime(): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_UPDATE_CHECK_KEY, Date.now().toString());
    } catch (error) {
      console.error('[Updates] Error saving last check time:', error);
    }
  }

  /**
   * Check for available updates
   */
  async checkForUpdates(): Promise<UpdateCheckResult> {
    if (!this.isUpdateEnabled()) {
      return { isAvailable: false };
    }

    try {
      console.log('[Updates] Checking for updates...');

      const update = await Updates.checkForUpdateAsync();

      await this.updateLastCheckTime();

      if (update.isAvailable) {
        console.log('[Updates] Update available:', update.manifest);
        return {
          isAvailable: true,
          manifest: update.manifest,
        };
      }

      console.log('[Updates] No updates available');
      return { isAvailable: false };
    } catch (error) {
      console.error('[Updates] Error checking for updates:', error);
      Sentry.captureException(error);
      return { isAvailable: false };
    }
  }

  /**
   * Download and install update
   */
  async fetchAndApplyUpdate(): Promise<boolean> {
    if (!this.isUpdateEnabled()) {
      return false;
    }

    try {
      console.log('[Updates] Downloading update...');

      const result = await Updates.fetchUpdateAsync();

      if (result.isNew) {
        console.log('[Updates] Update downloaded, reloading app...');

        if (this.config.showAlerts) {
          Alert.alert(
            'Update Ready',
            'A new version has been downloaded. The app will now restart.',
            [
              {
                text: 'OK',
                onPress: async () => {
                  await Updates.reloadAsync();
                },
              },
            ],
            { cancelable: false }
          );
        } else {
          await Updates.reloadAsync();
        }

        return true;
      }

      console.log('[Updates] No new update to apply');
      return false;
    } catch (error) {
      console.error('[Updates] Error fetching update:', error);
      Sentry.captureException(error);
      return false;
    }
  }

  /**
   * Check, download and apply updates automatically
   */
  async checkAndApplyUpdates(showAlerts = this.config.showAlerts): Promise<void> {
    if (!this.isUpdateEnabled()) {
      return;
    }

    const shouldCheck = await this.shouldCheckForUpdates();
    if (!shouldCheck) {
      console.log('[Updates] Skipping check (too soon since last check)');
      return;
    }

    try {
      const { isAvailable } = await this.checkForUpdates();

      if (isAvailable) {
        if (showAlerts) {
          Alert.alert(
            'Update Available',
            'A new version of the app is available. Would you like to download it?',
            [
              {
                text: 'Later',
                style: 'cancel',
              },
              {
                text: 'Update',
                onPress: async () => {
                  await this.fetchAndApplyUpdate();
                },
              },
            ]
          );
        } else {
          await this.fetchAndApplyUpdate();
        }
      }
    } catch (error) {
      console.error('[Updates] Error in checkAndApplyUpdates:', error);
      Sentry.captureException(error);
    }
  }

  /**
   * Check for updates on app launch (call in App.tsx)
   */
  async checkOnLaunch(): Promise<void> {
    if (!this.config.checkOnLaunch) {
      return;
    }

    if (!this.isUpdateEnabled()) {
      return;
    }

    // Wait a bit before checking to avoid blocking app startup
    setTimeout(() => {
      this.checkAndApplyUpdates(this.config.showAlerts);
    }, 3000);
  }

  /**
   * Get current update information
   */
  getCurrentUpdate(): {
    updateId: string | undefined;
    channel: string | undefined;
    runtimeVersion: string | undefined;
    createdAt: Date | undefined;
    manifest: Partial<Updates.Manifest> | undefined;
  } | null {
    if (!Updates.isEnabled) {
      return null;
    }

    try {
      // Return info about current update
      return {
        updateId: Updates.updateId || undefined,
        channel: Updates.channel || undefined,
        runtimeVersion: Updates.runtimeVersion || undefined,
        createdAt: Updates.createdAt || undefined,
        manifest: Updates.manifest || undefined,
      };
    } catch (error) {
      console.error('[Updates] Error getting current update:', error);
      return null;
    }
  }

  /**
   * Manually reload the app
   */
  async reload(): Promise<void> {
    if (!Updates.isEnabled) {
      console.warn('[Updates] Cannot reload - Updates not enabled');
      return;
    }

    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.error('[Updates] Error reloading app:', error);
      Sentry.captureException(error);
    }
  }
}

// Singleton instance
export const updateManager = new UpdateManager();
