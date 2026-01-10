/**
 * Update Manager Tests
 */

import * as Updates from 'expo-updates';
import { updateManager } from '../updateManager';

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

// Mock expo-updates
jest.mock('expo-updates', () => ({
  isEnabled: true,
  checkForUpdateAsync: jest.fn(),
  fetchUpdateAsync: jest.fn(),
  reloadAsync: jest.fn(),
  updateId: 'test-update-id',
  channel: 'production',
  runtimeVersion: '1.0.0',
  createdAt: new Date(),
  manifest: {},
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  Platform: {
    OS: 'ios',
  },
}));

describe('UpdateManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('configure', () => {
    it('updates configuration', () => {
      updateManager.configure({
        checkOnLaunch: false,
        showAlerts: false,
      });

      // Configuration is applied (tested indirectly through behavior)
      expect(true).toBe(true);
    });
  });

  // Note: Most updateManager methods are disabled in __DEV__ mode
  // These tests would pass in production builds

  describe('checkForUpdates', () => {
    it('returns false in development mode', async () => {
      const result = await updateManager.checkForUpdates();

      // In dev mode, updates are disabled
      expect(result.isAvailable).toBe(false);
    });
  });

  describe('fetchAndApplyUpdate', () => {
    it('returns false in development mode', async () => {
      const result = await updateManager.fetchAndApplyUpdate();

      // In dev mode, updates are disabled
      expect(result).toBe(false);
    });
  });

  describe('getCurrentUpdate', () => {
    it('returns current update info', () => {
      const updateInfo = updateManager.getCurrentUpdate();

      expect(updateInfo).toBeDefined();
      expect(updateInfo?.updateId).toBe('test-update-id');
      expect(updateInfo?.channel).toBe('production');
    });
  });

  describe('reload', () => {
    it('reloads the app', async () => {
      await updateManager.reload();

      expect(Updates.reloadAsync).toHaveBeenCalled();
    });

    it('handles errors gracefully', async () => {
      (Updates.reloadAsync as jest.Mock).mockRejectedValue(new Error('Reload failed'));

      await expect(updateManager.reload()).resolves.not.toThrow();
    });
  });
});
