import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';
import * as Application from 'expo-application';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
const APP_ENV = process.env.EXPO_PUBLIC_APP_ENV || 'development';
const API_URL = process.env.EXPO_PUBLIC_API_URL || '';

export const initSentry = (): void => {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured. Skipping Sentry initialization.');
    return;
  }

  // Generate release name in format: bundleIdentifier@version+buildNumber
  const bundleId = Application.applicationId || Constants.expoConfig?.slug || 'unknown';
  const version = Constants.expoConfig?.version || '1.0.0';
  const buildNumber = Application.nativeBuildVersion || '1';
  const release = `${bundleId}@${version}+${buildNumber}`;

  // Generate tracePropagationTargets from API_URL
  const tracePropagationTargets: (string | RegExp)[] = ['localhost'];
  if (API_URL) {
    try {
      const apiHost = new URL(API_URL).host;
      tracePropagationTargets.push(new RegExp(`^https?://${apiHost.replace(/\./g, '\\.')}`));
    } catch (error) {
      console.warn('Invalid API_URL for Sentry trace propagation:', API_URL);
    }
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: APP_ENV,
    enabled: APP_ENV !== 'development',
    debug: APP_ENV === 'development',
    release: release,
    dist: buildNumber,
    tracesSampleRate: APP_ENV === 'production' ? 0.2 : 1.0,
    attachStacktrace: true,
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000,
    maxBreadcrumbs: 50,
    integrations: [
      new Sentry.ReactNativeTracing({
        routingInstrumentation: new Sentry.ReactNavigationInstrumentation(),
        tracePropagationTargets,
      }),
    ],
    beforeSend(event) {
      // Filter out events in development
      if (APP_ENV === 'development') {
        return null;
      }
      return event;
    },
    beforeBreadcrumb(breadcrumb) {
      // Filter sensitive data from breadcrumbs
      if (breadcrumb.category === 'console') {
        return null;
      }
      return breadcrumb;
    },
  });

  // Set additional context
  Sentry.setContext('app', {
    version: version,
    buildNumber: buildNumber,
    bundleId: bundleId,
    expoVersion: Constants.expoVersion,
  });
};

export const logError = (error: Error, context?: Record<string, unknown>): void => {
  if (context) {
    Sentry.setContext('error_context', context);
  }
  Sentry.captureException(error);
};

export const logMessage = (
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug' = 'info'
): void => {
  Sentry.captureMessage(message, level);
};

export const setUserContext = (user: {
  id: string;
  email?: string;
  username?: string;
}): void => {
  Sentry.setUser(user);
};

export const clearUserContext = (): void => {
  Sentry.setUser(null);
};

export const addBreadcrumb = (breadcrumb: Sentry.Breadcrumb): void => {
  Sentry.addBreadcrumb(breadcrumb);
};
