/**
 * Pull to Refresh Hook
 *
 * Simple hook for pull-to-refresh functionality
 * Works with ScrollView, FlatList, and SectionList
 */

import { useCallback, useState } from 'react';

interface UsePullToRefreshOptions {
  /**
   * Function to call when refreshing
   */
  onRefresh: () => Promise<void> | void;

  /**
   * Initial refreshing state
   * @default false
   */
  initialRefreshing?: boolean;
}

interface UsePullToRefreshResult {
  /**
   * Whether currently refreshing
   */
  refreshing: boolean;

  /**
   * Handler to pass to refreshControl
   */
  onRefresh: () => void;
}

/**
 * Hook for pull-to-refresh functionality
 *
 * @example
 * ```tsx
 * const { refreshing, onRefresh } = usePullToRefresh({
 *   onRefresh: async () => {
 *     await fetchData();
 *   },
 * });
 *
 * return (
 *   <ScrollView
 *     refreshControl={
 *       <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
 *     }
 *   >
 *     {children}
 *   </ScrollView>
 * );
 * ```
 */
export function usePullToRefresh({
  onRefresh: onRefreshProp,
  initialRefreshing = false,
}: UsePullToRefreshOptions): UsePullToRefreshResult {
  const [refreshing, setRefreshing] = useState(initialRefreshing);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefreshProp();
    } catch (error) {
      console.error('Error during pull-to-refresh:', error);
    } finally {
      setRefreshing(false);
    }
  }, [onRefreshProp]);

  return {
    refreshing,
    onRefresh,
  };
}
