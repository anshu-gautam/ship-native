/**
 * MSW Browser Setup (React Native Web)
 *
 * For use in React Native Web during development
 * Note: This only works in web contexts (Expo Web), not in native mobile apps
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * Create MSW worker instance for browser/web
 */
export const worker = setupWorker(...handlers);

/**
 * Start MSW in development mode (web only)
 * Call this in your app entry point when __DEV__ is true and running on web
 */
export async function startMocking(): Promise<void> {
  if (__DEV__ && typeof window !== 'undefined') {
    await worker.start({
      onUnhandledRequest: 'warn',
    });
    console.log('[MSW] Mocking enabled (web)');
  }
}
