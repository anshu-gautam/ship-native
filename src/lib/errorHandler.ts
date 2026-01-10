/**
 * Global Error Handler
 *
 * Catches unhandled JavaScript errors and Promise rejections
 * Reports them to Sentry and logs them appropriately
 */

import * as Sentry from '@sentry/react-native';
import { Alert } from 'react-native';

/**
 * Set up global error handlers
 * Call this in your app entry point (app/_layout.tsx)
 */
export function setupGlobalErrorHandlers(): void {
  // Handle uncaught JavaScript errors
  const defaultErrorHandler = ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    // Report to Sentry
    Sentry.captureException(error, {
      level: isFatal ? 'fatal' : 'error',
      tags: {
        errorType: 'uncaughtException',
      },
    });

    // Log to console in development
    if (__DEV__) {
      console.error('Uncaught Error:', error);
      console.error('Is Fatal:', isFatal);
    }

    // Show alert for fatal errors in production
    if (isFatal && !__DEV__) {
      Alert.alert('Unexpected Error', 'An unexpected error occurred. Please restart the app.', [
        {
          text: 'OK',
          onPress: () => {
            // In a real app, you might want to restart or force quit here
          },
        },
      ]);
    }

    // Call default handler
    if (defaultErrorHandler) {
      defaultErrorHandler(error, isFatal);
    }
  });

  // Handle unhandled promise rejections
  const handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));

    // Report to Sentry
    Sentry.captureException(error, {
      level: 'error',
      tags: {
        errorType: 'unhandledRejection',
      },
    });

    // Log to console in development
    if (__DEV__) {
      console.error('Unhandled Promise Rejection:', error);
    }
  };

  // TypeScript doesn't have PromiseRejectionEvent in React Native
  // but we can still listen to the event
  const rejectionHandlerName = 'unhandledRejection';
  // @ts-expect-error - addEventListener exists but types are incomplete
  global.addEventListener?.(rejectionHandlerName, handleUnhandledRejection);

  // Also handle console.error to catch more issues in development
  if (__DEV__) {
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      // Still call original console.error
      originalConsoleError(...args);

      // If first arg is an Error, report to Sentry
      if (args[0] instanceof Error) {
        Sentry.captureException(args[0], {
          level: 'error',
          tags: {
            errorType: 'consoleError',
          },
          extra: {
            args: args.slice(1),
          },
        });
      }
    };
  }
}

/**
 * Manually report an error to Sentry
 */
export function reportError(
  error: Error,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    level?: 'fatal' | 'error' | 'warning' | 'info';
  }
): void {
  Sentry.captureException(error, {
    level: context?.level || 'error',
    tags: context?.tags,
    extra: context?.extra,
  });

  if (__DEV__) {
    console.error('Reported Error:', error, context);
  }
}

/**
 * Report a message to Sentry (for non-error events)
 */
export function reportMessage(
  message: string,
  context?: {
    level?: 'fatal' | 'error' | 'warning' | 'info';
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  }
): void {
  Sentry.captureMessage(message, {
    level: context?.level || 'info',
    tags: context?.tags,
    extra: context?.extra,
  });

  if (__DEV__) {
    console.log('Reported Message:', message, context);
  }
}
