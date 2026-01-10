/**
 * Analytics Service using PostHog
 *
 * Provides event tracking, user identification, and feature flags
 *
 * Setup Instructions:
 * 1. Create a PostHog account at https://posthog.com
 * 2. Add your API key and host to .env:
 *    EXPO_PUBLIC_POSTHOG_API_KEY=your-api-key
 *    EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com (or your self-hosted instance)
 * 3. Initialize PostHog in your app entry point (e.g., App.tsx or _layout.tsx)
 */

import type PostHog from 'posthog-react-native';

interface PostHogClient {
  capture: (event: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string, properties?: Record<string, unknown>) => void;
  group: (groupType: string, groupKey: string, properties?: Record<string, unknown>) => void;
  reset: () => void;
  isFeatureEnabled: (flag: string) => boolean | undefined;
  getFeatureFlag: (flag: string) => string | boolean | undefined;
  flush: () => Promise<void>;
}

let posthogClient: PostHogClient | null = null;

/**
 * Initialize PostHog analytics
 * Call this once at app startup
 *
 * Note: The actual initialization should be done using PostHogProvider in your root layout.
 * This function is provided for programmatic initialization if needed.
 */
export async function initializePostHog(): Promise<typeof PostHog | null> {
  try {
    const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;

    if (!apiKey) {
      console.warn('EXPO_PUBLIC_POSTHOG_API_KEY not set. Analytics will be disabled.');
      return null;
    }

    // PostHog React Native uses PostHogProvider for initialization
    // Import and use PostHogProvider in your root layout component
    console.log('PostHog configuration ready. Use PostHogProvider in your root layout.');
    return null;
  } catch (error) {
    console.error('Failed to initialize PostHog:', error);
    return null;
  }
}

/**
 * Set the PostHog client instance (called by PostHogProvider)
 */
export function setPostHog(client: PostHogClient): void {
  posthogClient = client;
}

/**
 * Get the PostHog client instance
 */
export function getPostHog(): PostHogClient | null {
  return posthogClient;
}

/**
 * Track a custom event
 * @param eventName Name of the event
 * @param properties Optional event properties
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  if (!posthogClient) {
    console.warn('PostHog not initialized. Use PostHogProvider first.');
    return;
  }

  posthogClient.capture(eventName, properties);
}

/**
 * Identify a user
 * @param userId Unique user identifier
 * @param properties Optional user properties
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function identifyUser(userId: string, properties?: Record<string, unknown>): void {
  if (!posthogClient) {
    console.warn('PostHog not initialized. Use PostHogProvider first.');
    return;
  }

  posthogClient.identify(userId, properties);
}

/**
 * Track a screen view
 * @param screenName Name of the screen
 * @param properties Optional screen properties
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function trackScreenView(screenName: string, properties?: Record<string, unknown>): void {
  trackEvent('$screen', {
    $screen_name: screenName,
    ...properties,
  });
}

/**
 * Set user properties (without changing the user identity)
 * @param properties User properties to set
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setUserProperties(properties: Record<string, unknown>): void {
  if (!posthogClient) {
    console.warn('PostHog not initialized. Use PostHogProvider first.');
    return;
  }

  // Use group or other methods as needed
  posthogClient.group('user', 'user', properties);
}

/**
 * Reset the user (e.g., on logout)
 * Clears the user identity and generates a new anonymous ID
 */
export function resetUser(): void {
  if (!posthogClient) {
    console.warn('PostHog not initialized. Call initializePostHog() first.');
    return;
  }

  posthogClient.reset();
}

/**
 * Check if a feature flag is enabled
 * @param flagKey The feature flag key
 * @returns Whether the flag is enabled
 */
export async function isFeatureFlagEnabled(flagKey: string): Promise<boolean> {
  if (!posthogClient) {
    console.warn('PostHog not initialized. Call initializePostHog() first.');
    return false;
  }

  return (await posthogClient.isFeatureEnabled(flagKey)) ?? false;
}

/**
 * Get a feature flag value (for multivariate flags)
 * @param flagKey The feature flag key
 * @returns The flag value
 */
export async function getFeatureFlagValue(flagKey: string): Promise<string | boolean | undefined> {
  if (!posthogClient) {
    console.warn('PostHog not initialized. Call initializePostHog() first.');
    return undefined;
  }

  return await posthogClient.getFeatureFlag(flagKey);
}

/**
 * Manually flush all pending events
 * Useful before app closes or important state changes
 */
export async function flushEvents(): Promise<void> {
  if (!posthogClient) {
    console.warn('PostHog not initialized. Call initializePostHog() first.');
    return;
  }

  await posthogClient.flush();
}

/**
 * Common event names for consistency
 */
export const AnalyticsEvents = {
  // User actions
  USER_SIGNED_UP: 'user_signed_up',
  USER_SIGNED_IN: 'user_signed_in',
  USER_SIGNED_OUT: 'user_signed_out',

  // App interactions
  BUTTON_CLICKED: 'button_clicked',
  FEATURE_USED: 'feature_used',
  ERROR_OCCURRED: 'error_occurred',

  // E-commerce (example)
  PRODUCT_VIEWED: 'product_viewed',
  PRODUCT_ADDED_TO_CART: 'product_added_to_cart',
  CHECKOUT_STARTED: 'checkout_started',
  PURCHASE_COMPLETED: 'purchase_completed',
} as const;
