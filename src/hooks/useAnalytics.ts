/**
 * React Hook for PostHog Analytics
 *
 * Provides easy access to analytics functions within React components
 */

import {
  AnalyticsEvents,
  getFeatureFlagValue,
  identifyUser,
  isFeatureFlagEnabled,
  resetUser,
  setUserProperties,
  trackEvent,
  trackScreenView,
} from '@/services/analytics';
import { useEffect } from 'react';

/**
 * Hook to track analytics events
 */
export function useAnalytics() {
  return {
    trackEvent,
    identifyUser,
    setUserProperties,
    resetUser,
    isFeatureFlagEnabled,
    getFeatureFlagValue,
    AnalyticsEvents,
  };
}

/**
 * Hook to automatically track screen views when component mounts
 * @param screenName Name of the screen
 * @param properties Optional screen properties
 */
export function useScreenTracking(screenName: string, properties?: Record<string, unknown>) {
  useEffect(() => {
    trackScreenView(screenName, properties);
  }, [screenName, properties]);
}

/**
 * Hook to track when a component mounts/unmounts
 * @param eventName Event name to track
 * @param properties Event properties
 */
export function useEventTracking(eventName: string, properties?: Record<string, unknown>) {
  useEffect(() => {
    trackEvent(eventName, properties);
  }, [eventName, properties]);
}
