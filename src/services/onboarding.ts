/**
 * Onboarding Service
 *
 * Manages first-time user onboarding flow
 * Tracks onboarding completion and provides utilities
 */

import { storage } from '@/lib/mmkv';

const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_VERSION: 'onboarding_version',
  ONBOARDING_SKIPPED: 'onboarding_skipped',
  CURRENT_ONBOARDING_STEP: 'onboarding_current_step',
} as const;

/**
 * Current onboarding version
 * Increment this when you want to show onboarding again to existing users
 */
const CURRENT_ONBOARDING_VERSION = 1;

/**
 * Check if user has completed onboarding
 * @param version Optional version to check (defaults to current)
 */
export function hasCompletedOnboarding(version?: number): boolean {
  const targetVersion = version ?? CURRENT_ONBOARDING_VERSION;
  const completedVersion = storage.getNumber(STORAGE_KEYS.ONBOARDING_VERSION);
  return completedVersion === targetVersion;
}

/**
 * Mark onboarding as completed
 */
export function completeOnboarding(): void {
  storage.set(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
  storage.set(STORAGE_KEYS.ONBOARDING_VERSION, CURRENT_ONBOARDING_VERSION);
  storage.delete(STORAGE_KEYS.CURRENT_ONBOARDING_STEP);
}

/**
 * Mark onboarding as skipped
 */
export function skipOnboarding(): void {
  storage.set(STORAGE_KEYS.ONBOARDING_SKIPPED, true);
  storage.set(STORAGE_KEYS.ONBOARDING_VERSION, CURRENT_ONBOARDING_VERSION);
  storage.delete(STORAGE_KEYS.CURRENT_ONBOARDING_STEP);
}

/**
 * Check if user skipped onboarding
 */
export function hasSkippedOnboarding(): boolean {
  return storage.getBoolean(STORAGE_KEYS.ONBOARDING_SKIPPED) ?? false;
}

/**
 * Reset onboarding (for testing or forcing re-onboarding)
 */
export function resetOnboarding(): void {
  storage.delete(STORAGE_KEYS.ONBOARDING_COMPLETED);
  storage.delete(STORAGE_KEYS.ONBOARDING_VERSION);
  storage.delete(STORAGE_KEYS.ONBOARDING_SKIPPED);
  storage.delete(STORAGE_KEYS.CURRENT_ONBOARDING_STEP);
}

/**
 * Check if user should see onboarding
 */
export function shouldShowOnboarding(): boolean {
  return !hasCompletedOnboarding() && !hasSkippedOnboarding();
}

/**
 * Save current onboarding step (for resuming)
 */
export function saveOnboardingStep(step: number): void {
  storage.set(STORAGE_KEYS.CURRENT_ONBOARDING_STEP, step);
}

/**
 * Get current onboarding step
 */
export function getCurrentOnboardingStep(): number {
  return storage.getNumber(STORAGE_KEYS.CURRENT_ONBOARDING_STEP) ?? 0;
}

/**
 * Get onboarding statistics
 */
export function getOnboardingStats() {
  return {
    completed: storage.getBoolean(STORAGE_KEYS.ONBOARDING_COMPLETED) ?? false,
    skipped: storage.getBoolean(STORAGE_KEYS.ONBOARDING_SKIPPED) ?? false,
    version: storage.getNumber(STORAGE_KEYS.ONBOARDING_VERSION),
    currentStep: storage.getNumber(STORAGE_KEYS.CURRENT_ONBOARDING_STEP),
  };
}
