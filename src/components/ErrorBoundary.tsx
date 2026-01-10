/**
 * Error Boundary Component
 *
 * Catches React errors and displays a fallback UI instead of crashing the app
 * Integrates with Sentry for error reporting
 */

import * as Sentry from '@sentry/react-native';
import type React from 'react';
import { Component, type ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface ErrorBoundaryProps {
  /**
   * Child components to render
   */
  children: ReactNode;

  /**
   * Custom fallback component
   */
  fallback?: (error: Error, resetError: () => void) => ReactNode;

  /**
   * Callback when error occurs
   */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;

  /**
   * Name of the boundary (for tracking)
   */
  name?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 *
 * Wraps components to catch and handle errors gracefully
 *
 * @example
 * ```tsx
 * <ErrorBoundary name="Profile Screen">
 *   <ProfileScreen />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const { onError, name } = this.props;

    // Log to Sentry with context
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
          boundary: name || 'Unknown',
        },
      },
    });

    // Call custom error handler
    onError?.(error, errorInfo);

    // Log to console in development
    if (__DEV__) {
      console.error('Error Boundary caught an error:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, this.resetError);
      }

      // Default fallback UI
      return <DefaultErrorFallback error={error} resetError={this.resetError} />;
    }

    return children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

function DefaultErrorFallback({ error, resetError }: DefaultErrorFallbackProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>😔</Text>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          We've encountered an unexpected error. The error has been reported and we'll look into it.
        </Text>

        {__DEV__ && (
          <ScrollView style={styles.errorDetails}>
            <Text style={styles.errorTitle}>Error Details (Dev Only):</Text>
            <Text style={styles.errorText}>{error.name}</Text>
            <Text style={styles.errorText}>{error.message}</Text>
            {error.stack && <Text style={styles.errorStack}>{error.stack}</Text>}
          </ScrollView>
        )}

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={resetError}
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  errorDetails: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    maxHeight: 200,
    width: '100%',
  },
  errorTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  errorStack: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
