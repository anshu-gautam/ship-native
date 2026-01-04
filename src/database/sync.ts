/**
 * Database Sync Layer
 *
 * Synchronizes local WatermelonDB with remote API.
 * Handles offline-first data flow and conflict resolution.
 */

import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from './index';

interface SyncResult {
  success: boolean;
  timestamp: number;
  changes?: {
    created: number;
    updated: number;
    deleted: number;
  };
  error?: string;
}

/**
 * Sync database with remote API
 */
export async function syncDatabase(apiUrl: string, authToken: string): Promise<SyncResult> {
  const startTime = Date.now();

  try {
    await synchronize({
      database,
      pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
        // Fetch changes from API since lastPulledAt
        const response = await fetch(`${apiUrl}/sync/pull`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            lastPulledAt,
            schemaVersion,
            migration,
          }),
        });

        if (!response.ok) {
          throw new Error(`Sync pull failed: ${response.statusText}`);
        }

        const { changes, timestamp } = await response.json();

        return { changes, timestamp };
      },

      pushChanges: async ({ changes, lastPulledAt }) => {
        // Push local changes to API
        const response = await fetch(`${apiUrl}/sync/push`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            changes,
            lastPulledAt,
          }),
        });

        if (!response.ok) {
          throw new Error(`Sync push failed: ${response.statusText}`);
        }
      },

      migrationsEnabledAtVersion: 1,
    });

    return {
      success: true,
      timestamp: Date.now() - startTime,
    };
  } catch (error) {
    console.error('[Sync] Failed to sync database:', error);

    return {
      success: false,
      timestamp: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Pull changes from remote (one-way sync)
 */
export async function pullChanges(
  apiUrl: string,
  authToken: string
): Promise<SyncResult> {
  try {
    const response = await fetch(`${apiUrl}/sync/pull`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        lastPulledAt: null, // Full sync
        schemaVersion: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Pull failed: ${response.statusText}`);
    }

    const { changes } = await response.json();

    // Apply changes to local database
    await database.write(async () => {
      // Process created records
      for (const [table, records] of Object.entries(changes.created || {})) {
        const collection = database.get(table);
        for (const record of records as any[]) {
          await collection.create((obj: any) => {
            Object.assign(obj, record);
          });
        }
      }

      // Process updated records
      for (const [table, records] of Object.entries(changes.updated || {})) {
        const collection = database.get(table);
        for (const record of records as any[]) {
          const obj = await collection.find(record.id);
          await obj.update((updatedObj: any) => {
            Object.assign(updatedObj, record);
          });
        }
      }

      // Process deleted records
      for (const [table, ids] of Object.entries(changes.deleted || {})) {
        const collection = database.get(table);
        for (const id of ids as string[]) {
          const obj = await collection.find(id);
          await obj.markAsDeleted();
        }
      }
    });

    return {
      success: true,
      timestamp: Date.now(),
      changes: {
        created: Object.values(changes.created || {}).reduce(
          (sum: number, arr: any) => sum + arr.length,
          0
        ),
        updated: Object.values(changes.updated || {}).reduce(
          (sum: number, arr: any) => sum + arr.length,
          0
        ),
        deleted: Object.values(changes.deleted || {}).reduce(
          (sum: number, arr: any) => sum + arr.length,
          0
        ),
      },
    };
  } catch (error) {
    return {
      success: false,
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if sync is needed
 */
export function isSyncNeeded(lastSyncTimestamp: number, intervalMs = 300000): boolean {
  // Default: sync every 5 minutes
  return Date.now() - lastSyncTimestamp > intervalMs;
}

/**
 * Get last sync timestamp from local storage
 */
export async function getLastSyncTimestamp(): Promise<number> {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    const timestamp = await AsyncStorage.default.getItem('last_sync_timestamp');
    return timestamp ? parseInt(timestamp, 10) : 0;
  } catch (error) {
    return 0;
  }
}

/**
 * Save last sync timestamp to local storage
 */
export async function saveLastSyncTimestamp(timestamp: number): Promise<void> {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    await AsyncStorage.default.setItem('last_sync_timestamp', timestamp.toString());
  } catch (error) {
    console.error('[Sync] Failed to save sync timestamp:', error);
  }
}
