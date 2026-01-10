/**
 * Background Tasks Service
 *
 * Provides background execution capabilities using Expo Task Manager and Background Fetch
 *
 * Features:
 * - Background fetch for periodic data sync
 * - Task registration and management
 * - Background execution limits
 *
 * Setup:
 * 1. Define your background tasks using defineTask()
 * 2. Register tasks in your app entry point
 * 3. Configure intervals and options
 */

import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

// Task name constants
export const BACKGROUND_FETCH_TASK = 'background-fetch-task';

export type BackgroundTaskResult = BackgroundFetch.BackgroundFetchResult;

/**
 * Register a background fetch task
 * @param taskName Unique task name
 * @param taskFunction Function to execute in background
 */
export function defineBackgroundTask(
  taskName: string,
  taskFunction: () => Promise<BackgroundTaskResult>
): void {
  TaskManager.defineTask(taskName, async () => {
    try {
      const result = await taskFunction();
      return result;
    } catch (error) {
      console.error(`Background task ${taskName} failed:`, error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
}

/**
 * Register the default background fetch task
 * @param minimumInterval Minimum interval in seconds (default: 15 minutes)
 */
export async function registerBackgroundFetch(
  taskName: string = BACKGROUND_FETCH_TASK,
  minimumInterval: number = 60 * 15 // 15 minutes
): Promise<void> {
  try {
    const status = await BackgroundFetch.getStatusAsync();

    if (status === BackgroundFetch.BackgroundFetchStatus.Available) {
      await BackgroundFetch.registerTaskAsync(taskName, {
        minimumInterval,
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log(`Background fetch task "${taskName}" registered successfully`);
    } else {
      console.warn('Background fetch is not available:', status);
    }
  } catch (error) {
    console.error('Error registering background fetch:', error);
  }
}

/**
 * Unregister a background fetch task
 * @param taskName Task name to unregister
 */
export async function unregisterBackgroundFetch(
  taskName: string = BACKGROUND_FETCH_TASK
): Promise<void> {
  try {
    await BackgroundFetch.unregisterTaskAsync(taskName);
    console.log(`Background fetch task "${taskName}" unregistered`);
  } catch (error) {
    console.error('Error unregistering background fetch:', error);
  }
}

/**
 * Check if a task is registered
 * @param taskName Task name to check
 */
export async function isTaskRegistered(taskName: string): Promise<boolean> {
  try {
    return await TaskManager.isTaskRegisteredAsync(taskName);
  } catch (error) {
    console.error('Error checking task registration:', error);
    return false;
  }
}

/**
 * Get background fetch status
 */
export async function getBackgroundFetchStatus(): Promise<BackgroundFetch.BackgroundFetchStatus | null> {
  return await BackgroundFetch.getStatusAsync();
}

/**
 * Example background task: Sync data
 */
export async function syncDataInBackground(): Promise<BackgroundTaskResult> {
  try {
    // TODO: Implement your data sync logic here
    // Example: Fetch new data from API, update local cache, etc.
    console.log('Background sync started');

    // Simulate async work
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('Background sync completed');
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background sync failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
}

/**
 * Example background task: Clean up old data
 */
export async function cleanupDataInBackground(): Promise<BackgroundTaskResult> {
  try {
    console.log('Background cleanup started');

    // TODO: Implement your cleanup logic here
    // Example: Remove expired cache, old logs, etc.

    console.log('Background cleanup completed');
    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('Background cleanup failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
}
