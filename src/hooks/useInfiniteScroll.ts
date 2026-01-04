/**
 * Infinite Scroll Hook
 *
 * Hook for implementing infinite scroll / pagination in FlatList
 */

import { useCallback, useState } from 'react';

interface UseInfiniteScrollOptions<T> {
  /**
   * Function to fetch more data
   * Should return the new items and whether there's more data
   */
  fetchMore: (page: number) => Promise<{ data: T[]; hasMore: boolean }>;

  /**
   * Initial data
   * @default []
   */
  initialData?: T[];

  /**
   * Initial page number
   * @default 1
   */
  initialPage?: number;

  /**
   * Threshold for loading more (distance from end)
   * @default 0.5
   */
  threshold?: number;
}

interface UseInfiniteScrollResult<T> {
  /**
   * Current data array
   */
  data: T[];

  /**
   * Whether currently loading more
   */
  loading: boolean;

  /**
   * Whether there's more data to load
   */
  hasMore: boolean;

  /**
   * Current page number
   */
  page: number;

  /**
   * Load more data (for manual trigger)
   */
  loadMore: () => Promise<void>;

  /**
   * Refresh / reset to first page
   */
  refresh: () => Promise<void>;

  /**
   * Handler for FlatList onEndReached
   */
  onEndReached: () => void;

  /**
   * Distance threshold for FlatList onEndReachedThreshold
   */
  onEndReachedThreshold: number;
}

/**
 * Hook for infinite scroll / pagination
 *
 * @example
 * ```tsx
 * const { data, loading, hasMore, onEndReached, onEndReachedThreshold, refresh } = useInfiniteScroll({
 *   fetchMore: async (page) => {
 *     const response = await fetch(`/api/items?page=${page}`);
 *     const items = await response.json();
 *     return {
 *       data: items,
 *       hasMore: items.length === 20, // Assuming 20 items per page
 *     };
 *   },
 * });
 *
 * const { refreshing, onRefresh } = usePullToRefresh({ onRefresh: refresh });
 *
 * return (
 *   <FlatList
 *     data={data}
 *     onEndReached={onEndReached}
 *     onEndReachedThreshold={onEndReachedThreshold}
 *     ListFooterComponent={loading ? <ActivityIndicator /> : null}
 *     refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
 *   />
 * );
 * ```
 */
export function useInfiniteScroll<T>({
  fetchMore,
  initialData = [],
  initialPage = 1,
  threshold = 0.5,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollResult<T> {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(initialPage);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const result = await fetchMore(page);
      setData((prev) => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error('Error loading more data:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, fetchMore]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setPage(initialPage);
    try {
      const result = await fetchMore(initialPage);
      setData(result.data);
      setHasMore(result.hasMore);
      setPage(initialPage + 1);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  }, [initialPage, fetchMore]);

  const onEndReached = useCallback(() => {
    loadMore();
  }, [loadMore]);

  return {
    data,
    loading,
    hasMore,
    page,
    loadMore,
    refresh,
    onEndReached,
    onEndReachedThreshold: threshold,
  };
}
