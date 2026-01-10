/**
 * Database Sync Layer
 *
 * Synchronizes local WatermelonDB with remote API.
 * Handles offline-first data flow and conflict resolution.
 */

import type { Model } from '@nozbe/watermelondb';
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

interface RawRecord {
  id: string;
  updatedAt?: number;
  [key: string]: unknown;
}

interface RawModel {
  updated_at?: number;
  [key: string]: unknown;
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
export async function pullChanges(apiUrl: string, authToken: string): Promise<SyncResult> {
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

    // Apply changes to local database with conflict resolution
    await database.write(async () => {
      // Process created records
      for (const [table, records] of Object.entries(changes.created || {})) {
        const collection = database.get(table);
        for (const record of records as RawRecord[]) {
          // Check if record already exists (created offline)
          try {
            const existing = await collection.find(record.id);
            // Conflict: record exists locally - use timestamp to resolve
            const existingRaw = existing._raw as RawModel;
            if (
              record.updatedAt &&
              existingRaw.updated_at &&
              record.updatedAt > existingRaw.updated_at
            ) {
              await existing.update((obj: Model) => Object.assign(obj, record));
            }
          } catch {
            // Record doesn't exist, create it
            await collection.create((obj: Model) => Object.assign(obj, record));
          }
        }
      }

      // Process updated records with conflict resolution
      for (const [table, records] of Object.entries(changes.updated || {})) {
        const collection = database.get(table);
        for (const record of records as RawRecord[]) {
          try {
            const local = await collection.find(record.id);
            const localRaw = local._raw as RawModel;
            const localUpdatedAt = localRaw.updated_at || 0;
            const remoteUpdatedAt = record.updatedAt || 0;

            // Conflict resolution: newest timestamp wins, local wins on tie
            if (remoteUpdatedAt > localUpdatedAt) {
              await local.update((obj: Model) => Object.assign(obj, record));
            } else {
              console.log(
                `[Sync] Conflict: keeping local version of ${table}/${record.id} (local: ${localUpdatedAt}, remote: ${remoteUpdatedAt})`
              );
            }
          } catch {
            console.warn(`[Sync] Record not found for update: ${table}/${record.id}`);
          }
        }
      }

      // Process deleted records
      for (const [table, ids] of Object.entries(changes.deleted || {})) {
        const collection = database.get(table);
        for (const id of ids as string[]) {
          try {
            const obj = await collection.find(id);
            await obj.markAsDeleted();
          } catch {
            // Already deleted locally, ignore
          }
        }
      }
    });

    return {
      success: true,
      timestamp: Date.now(),
      changes: {
        created: Object.values(changes.created || {}).reduce<number>(
          (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
          0
        ),
        updated: Object.values(changes.updated || {}).reduce<number>(
          (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
          0
        ),
        deleted: Object.values(changes.deleted || {}).reduce<number>(
          (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
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
    return timestamp ? Number.parseInt(timestamp, 10) : 0;
  } catch (_error) {
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
