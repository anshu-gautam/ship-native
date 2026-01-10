/**
 * Offline Queue Manager
 *
 * Queues failed requests and retries them when network is available
 * - Stores requests in AsyncStorage
 * - Listens to network connectivity
 * - Auto-retries queued requests
 * - Handles request prioritization
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as Sentry from '@sentry/react-native';

const QUEUE_STORAGE_KEY = '@app/offlineQueue';
const MAX_QUEUE_SIZE = 50;
const MAX_RETRY_ATTEMPTS = 3;

export interface QueuedRequest {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  priority: number; // Higher number = higher priority
  attempts: number;
  createdAt: number;
  lastAttemptAt?: number;
}

export type RequestHandler = (request: QueuedRequest) => Promise<void>;

class OfflineQueue {
  private queue: QueuedRequest[] = [];
  private isProcessing = false;
  private isOnline = true;
  private requestHandler?: RequestHandler;
  private unsubscribeNetInfo?: () => void;

  /**
   * Initialize the offline queue
   */
  async initialize(requestHandler: RequestHandler): Promise<void> {
    this.requestHandler = requestHandler;

    // Load persisted queue
    await this.loadQueue();

    // Listen to network changes
    this.unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      console.log('[OfflineQueue] Network status:', this.isOnline ? 'Online' : 'Offline');

      // If we just came online, process the queue
      if (wasOffline && this.isOnline) {
        console.log('[OfflineQueue] Back online, processing queue');
        this.processQueue();
      }
    });

    // Process queue if we're already online
    if (this.isOnline) {
      this.processQueue();
    }
  }

  /**
   * Cleanup and unsubscribe from listeners
   */
  destroy(): void {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
    }
  }

  /**
   * Add request to the queue
   */
  async addRequest(request: Omit<QueuedRequest, 'id' | 'attempts' | 'createdAt'>): Promise<string> {
    // Check queue size limit
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      // Remove lowest priority items
      this.queue.sort((a, b) => b.priority - a.priority);
      this.queue = this.queue.slice(0, MAX_QUEUE_SIZE - 1);
    }

    const queuedRequest: QueuedRequest = {
      ...request,
      id: this.generateId(),
      attempts: 0,
      createdAt: Date.now(),
    };

    this.queue.push(queuedRequest);
    await this.saveQueue();

    console.log(`[OfflineQueue] Added request: ${queuedRequest.method} ${queuedRequest.url}`);

    // Try to process immediately if online
    if (this.isOnline) {
      this.processQueue();
    }

    return queuedRequest.id;
  }

  /**
   * Remove request from queue
   */
  async removeRequest(id: string): Promise<boolean> {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter((req) => req.id !== id);

    if (this.queue.length !== initialLength) {
      await this.saveQueue();
      return true;
    }

    return false;
  }

  /**
   * Get all queued requests
   */
  getQueue(): QueuedRequest[] {
    return [...this.queue];
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Clear the entire queue
   */
  async clearQueue(): Promise<void> {
    this.queue = [];
    await this.saveQueue();
    console.log('[OfflineQueue] Queue cleared');
  }

  /**
   * Process the queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || !this.isOnline || !this.requestHandler) {
      return;
    }

    if (this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`[OfflineQueue] Processing ${this.queue.length} queued requests`);

    // Sort by priority (highest first)
    const sortedQueue = [...this.queue].sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return a.createdAt - b.createdAt; // FIFO for same priority
    });

    for (const request of sortedQueue) {
      if (!this.isOnline) {
        console.log('[OfflineQueue] Lost connection, stopping queue processing');
        break;
      }

      try {
        console.log(`[OfflineQueue] Processing: ${request.method} ${request.url}`);

        request.attempts += 1;
        request.lastAttemptAt = Date.now();

        await this.requestHandler(request);

        // Success - remove from queue
        await this.removeRequest(request.id);
        console.log(`[OfflineQueue] Successfully processed: ${request.id}`);
      } catch (error) {
        console.error(`[OfflineQueue] Failed to process request ${request.id}:`, error);

        // Check if we should retry
        if (request.attempts >= MAX_RETRY_ATTEMPTS) {
          console.log(`[OfflineQueue] Max retries reached for ${request.id}, removing from queue`);
          await this.removeRequest(request.id);

          Sentry.captureException(error, {
            extra: {
              request,
              reason: 'Max retries exceeded',
            },
          });
        } else {
          // Save updated attempt count
          await this.saveQueue();
        }
      }
    }

    this.isProcessing = false;
  }

  /**
   * Load queue from storage
   */
  private async loadQueue(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        console.log(`[OfflineQueue] Loaded ${this.queue.length} requests from storage`);
      }
    } catch (error) {
      console.error('[OfflineQueue] Error loading queue:', error);
      this.queue = [];
    }
  }

  /**
   * Save queue to storage
   */
  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('[OfflineQueue] Error saving queue:', error);
    }
  }

  /**
   * Generate unique ID for requests
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const offlineQueue = new OfflineQueue();

/**
 * Helper function to wrap API calls with offline queue support
 */
export async function withOfflineQueue<T>(
  request: {
    url: string;
    method: QueuedRequest['method'];
    headers?: Record<string, string>;
    body?: unknown;
    priority?: number;
  },
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    // Check if it's a network error
    const isNetworkError =
      error instanceof Error &&
      (error.message.includes('Network') ||
        error.message.includes('timeout') ||
        error.message.includes('ECONNREFUSED'));

    if (isNetworkError) {
      console.log('[OfflineQueue] Network error, adding request to queue');
      await offlineQueue.addRequest({
        url: request.url,
        method: request.method,
        headers: request.headers,
        body: request.body,
        priority: request.priority || 0,
      });
    }

    throw error;
  }
}
