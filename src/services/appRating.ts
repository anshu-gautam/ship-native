/**
 * App Rating Service
 *
 * Manages in-app rating prompts with smart timing and frequency controls
 *
 * Features:
 * - Smart timing (don't annoy users)
 * - Frequency limits (max 3 times per year)
 * - Minimum app usage before prompting
 * - Respect user's "Don't ask again" choice
 * - Native iOS/Android rating dialogs
 */

import { storage } from '@/lib/mmkv';
import * as StoreReview from 'expo-store-review';
import { Linking, Platform } from 'react-native';

const STORAGE_KEYS = {
  LAST_PROMPT_DATE: 'app_rating_last_prompt',
  PROMPT_COUNT: 'app_rating_prompt_count',
  NEVER_ASK: 'app_rating_never_ask',
  APP_OPEN_COUNT: 'app_open_count',
  FIRST_OPEN_DATE: 'app_first_open_date',
};

interface RatingConfig {
  /**
   * Minimum number of days between prompts
   * @default 60
   */
  minDaysBetweenPrompts?: number;

  /**
   * Maximum number of prompts per year
   * @default 3
   */
  maxPromptsPerYear?: number;

  /**
   * Minimum number of app opens before first prompt
   * @default 10
   */
  minAppOpens?: number;

  /**
   * Minimum number of days since first app open
   * @default 7
   */
  minDaysSinceFirstOpen?: number;
}

const DEFAULT_CONFIG: Required<RatingConfig> = {
  minDaysBetweenPrompts: 60,
  maxPromptsPerYear: 3,
  minAppOpens: 10,
  minDaysSinceFirstOpen: 7,
};

/**
 * Initialize app rating tracking
 * Call this on app startup
 */
export function initializeAppRating(): void {
  // Track app opens
  const currentCount = storage.getNumber(STORAGE_KEYS.APP_OPEN_COUNT) || 0;
  storage.set(STORAGE_KEYS.APP_OPEN_COUNT, currentCount + 1);

  // Set first open date if not set
  if (!storage.contains(STORAGE_KEYS.FIRST_OPEN_DATE)) {
    storage.set(STORAGE_KEYS.FIRST_OPEN_DATE, Date.now());
  }
}

/**
 * Check if the rating dialog is available on this device
 */
export async function isRatingAvailable(): Promise<boolean> {
  return await StoreReview.isAvailableAsync();
}

/**
 * Check if we should show the rating prompt
 * @param config Optional configuration
 */
export function shouldShowRatingPrompt(config?: RatingConfig): boolean {
  const settings = { ...DEFAULT_CONFIG, ...config };

  // Check if user opted out
  if (storage.getBoolean(STORAGE_KEYS.NEVER_ASK)) {
    return false;
  }

  // Check app open count
  const appOpenCount = storage.getNumber(STORAGE_KEYS.APP_OPEN_COUNT) || 0;
  if (appOpenCount < settings.minAppOpens) {
    return false;
  }

  // Check days since first open
  const firstOpenDate = storage.getNumber(STORAGE_KEYS.FIRST_OPEN_DATE);
  if (firstOpenDate) {
    const daysSinceFirstOpen = (Date.now() - firstOpenDate) / (1000 * 60 * 60 * 24);
    if (daysSinceFirstOpen < settings.minDaysSinceFirstOpen) {
      return false;
    }
  }

  // Check last prompt date
  const lastPromptDate = storage.getNumber(STORAGE_KEYS.LAST_PROMPT_DATE);
  if (lastPromptDate) {
    const daysSinceLastPrompt = (Date.now() - lastPromptDate) / (1000 * 60 * 60 * 24);
    if (daysSinceLastPrompt < settings.minDaysBetweenPrompts) {
      return false;
    }
  }

  // Check prompts per year
  const promptCount = storage.getNumber(STORAGE_KEYS.PROMPT_COUNT) || 0;
  const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;

  if (lastPromptDate && lastPromptDate > oneYearAgo) {
    if (promptCount >= settings.maxPromptsPerYear) {
      return false;
    }
  } else {
    // Reset counter if more than a year has passed
    storage.set(STORAGE_KEYS.PROMPT_COUNT, 0);
  }

  return true;
}

/**
 * Request an in-app review
 * Shows native iOS/Android rating dialog
 */
export async function requestInAppReview(): Promise<boolean> {
  try {
    const isAvailable = await isRatingAvailable();
    if (!isAvailable) {
      console.warn('In-app review is not available on this device');
      return false;
    }

    // Request review
    await StoreReview.requestReview();

    // Update tracking
    const currentCount = storage.getNumber(STORAGE_KEYS.PROMPT_COUNT) || 0;
    storage.set(STORAGE_KEYS.PROMPT_COUNT, currentCount + 1);
    storage.set(STORAGE_KEYS.LAST_PROMPT_DATE, Date.now());

    return true;
  } catch (error) {
    console.error('Error requesting in-app review:', error);
    return false;
  }
}

/**
 * Request review only if conditions are met
 * @param config Optional configuration
 */
export async function requestReviewIfAppropriate(config?: RatingConfig): Promise<boolean> {
  if (shouldShowRatingPrompt(config)) {
    return await requestInAppReview();
  }
  return false;
}

/**
 * Open the app store for manual rating
 * Use this as a fallback or explicit "Rate Us" button
 */
export async function openAppStore(): Promise<boolean> {
  try {
    const hasAction = await StoreReview.hasAction();
    if (hasAction) {
      await StoreReview.requestReview();
      return true;
    }

    // Fallback: Open app store page directly
    const storeUrl = Platform.select({
      ios: `https://apps.apple.com/app/id${process.env.EXPO_PUBLIC_IOS_APP_ID}`,
      android: `market://details?id=${process.env.EXPO_PUBLIC_ANDROID_PACKAGE_NAME}`,
    });

    if (storeUrl) {
      await Linking.openURL(storeUrl);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error opening app store:', error);
    return false;
  }
}

/**
 * Mark that user doesn't want to be asked again
 */
export function neverAskAgain(): void {
  storage.set(STORAGE_KEYS.NEVER_ASK, true);
}

/**
 * Reset rating prompt tracking (for testing)
 */
export function resetRatingTracking(): void {
  storage.delete(STORAGE_KEYS.LAST_PROMPT_DATE);
  storage.delete(STORAGE_KEYS.PROMPT_COUNT);
  storage.delete(STORAGE_KEYS.NEVER_ASK);
}

/**
 * Get current rating statistics
 */
export function getRatingStats(): {
  appOpenCount: number;
  promptCount: number;
  lastPromptDate: number | null;
  firstOpenDate: number | null;
  neverAsk: boolean;
} {
  return {
    appOpenCount: storage.getNumber(STORAGE_KEYS.APP_OPEN_COUNT) || 0,
    promptCount: storage.getNumber(STORAGE_KEYS.PROMPT_COUNT) || 0,
    lastPromptDate: storage.getNumber(STORAGE_KEYS.LAST_PROMPT_DATE) || null,
    firstOpenDate: storage.getNumber(STORAGE_KEYS.FIRST_OPEN_DATE) || null,
    neverAsk: storage.getBoolean(STORAGE_KEYS.NEVER_ASK) || false,
  };
}
