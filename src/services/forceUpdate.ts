/**
 * Force Update Service
 *
 * Checks for required app updates and prompts users to update
 * Supports both hard (required) and soft (optional) updates
 */

import Constants from 'expo-constants';
import { Linking, Platform } from 'react-native';

export interface VersionInfo {
  /**
   * Current app version (from app config)
   */
  currentVersion: string;

  /**
   * Latest available version
   */
  latestVersion: string;

  /**
   * Minimum required version (for hard updates)
   */
  minimumVersion: string;

  /**
   * Whether update is required
   */
  updateRequired: boolean;

  /**
   * Whether update is recommended
   */
  updateRecommended: boolean;

  /**
   * Release notes for the update
   */
  releaseNotes?: string;

  /**
   * Store URL for update
   */
  storeUrl?: string;
}

/**
 * Compare version strings (semver-like)
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map((n) => Number.parseInt(n, 10));
  const parts2 = v2.split('.').map((n) => Number.parseInt(n, 10));

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;

    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }

  return 0;
}

/**
 * Get current app version from Constants
 */
export function getCurrentVersion(): string {
  return Constants.expoConfig?.version ?? '1.0.0';
}

/**
 * Get app store URL based on platform
 */
export function getStoreUrl(customUrl?: string): string {
  if (customUrl) return customUrl;

  const packageName = Constants.expoConfig?.android?.package;

  if (Platform.OS === 'ios') {
    // Replace with your actual App Store ID
    const appStoreId = Constants.expoConfig?.extra?.appStoreId || 'YOUR_APP_STORE_ID';
    return `https://apps.apple.com/app/id${appStoreId}`;
  }
  return `https://play.google.com/store/apps/details?id=${packageName}`;
}

/**
 * Open app store for update
 */
export async function openStore(customUrl?: string): Promise<boolean> {
  try {
    const url = getStoreUrl(customUrl);
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error opening store:', error);
    return false;
  }
}

/**
 * Fetch version info from your backend
 * Replace this with your actual API endpoint
 */
export async function fetchVersionInfo(apiUrl?: string): Promise<VersionInfo | null> {
  try {
    const currentVersion = getCurrentVersion();
    const platform = Platform.OS;

    // Replace with your actual version check endpoint
    const url = apiUrl || `https://your-api.com/version-check?platform=${platform}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch version info');
    }

    const data = await response.json();

    const updateRequired = compareVersions(currentVersion, data.minimumVersion) < 0;
    const updateRecommended = compareVersions(currentVersion, data.latestVersion) < 0;

    return {
      currentVersion,
      latestVersion: data.latestVersion,
      minimumVersion: data.minimumVersion,
      updateRequired,
      updateRecommended,
      releaseNotes: data.releaseNotes,
      storeUrl: data.storeUrl,
    };
  } catch (error) {
    console.error('Error fetching version info:', error);
    return null;
  }
}

/**
 * Check if update is available
 * @param minimumVersion Minimum required version
 * @param latestVersion Latest available version
 */
export function checkUpdateAvailable(
  minimumVersion: string,
  latestVersion: string
): {
  updateRequired: boolean;
  updateRecommended: boolean;
} {
  const currentVersion = getCurrentVersion();

  return {
    updateRequired: compareVersions(currentVersion, minimumVersion) < 0,
    updateRecommended: compareVersions(currentVersion, latestVersion) < 0,
  };
}

/**
 * Example version info response format for your backend:
 *
 * {
 *   "latestVersion": "2.0.0",
 *   "minimumVersion": "1.5.0",
 *   "releaseNotes": "Bug fixes and improvements",
 *   "storeUrl": "https://apps.apple.com/app/id123456789"
 * }
 */
