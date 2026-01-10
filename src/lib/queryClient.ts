/**
 * TanStack Query Client Configuration with Offline Persistence
 *
 * Provides:
 * - Query caching with MMKV storage
 * - Offline-first data fetching
 * - Automatic retry logic
 * - Network state awareness
 */

import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { storage } from './mmkv';

/**
 * Custom MMKV persister for TanStack Query
 */
export const queryPersister = createAsyncStoragePersister({
  storage: {
    getItem: async (key: string) => {
      const value = storage.getString(key);
      return value ?? null;
    },
    setItem: async (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: async (key: string) => {
      storage.delete(key);
    },
  },
  throttleTime: 1000, // Throttle writes to storage
});

/**
 * Configure QueryClient with sensible defaults for offline-first apps
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      gcTime: 1000 * 60 * 5, // Previously cacheTime

      // Stale data after 1 minute
      staleTime: 1000 * 60,

      // Retry failed requests
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Enable network mode for offline support
      networkMode: 'offlineFirst',

      // Refetch on reconnect
      refetchOnReconnect: true,

      // Don't refetch on window focus in mobile apps
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,

      // Enable network mode for offline support
      networkMode: 'offlineFirst',
    },
  },
});

/**
 * Clear all cached query data
 */
export function clearQueryCache(): void {
  queryClient.clear();
  storage.delete('REACT_QUERY_OFFLINE_CACHE');
}

/**
 * Invalidate queries by key pattern
 * @param queryKey Query key or key pattern to invalidate
 */
export function invalidateQueries(queryKey: string | string[]): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
  });
}

/**
 * Prefetch data for offline use
 * @param queryKey Query key
 * @param queryFn Query function
 * @param options Optional configuration
 */
export async function prefetchQuery<TData>(
  queryKey: string | string[],
  queryFn: () => Promise<TData>,
  options?: {
    staleTime?: number;
  }
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn,
    staleTime: options?.staleTime,
  });
}
