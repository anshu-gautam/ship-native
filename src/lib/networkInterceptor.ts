/**
 * Advanced Network Request Interceptor
 *
 * Features:
 * - Automatic retry with exponential backoff
 * - Request deduplication
 * - Network error classification
 * - Rate limiting
 * - Request timeout handling
 */

import NetInfo from '@react-native-community/netinfo';
import * as Sentry from '@sentry/react-native';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Network error types
export enum NetworkErrorType {
  TIMEOUT = 'TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  CLIENT_ERROR = 'CLIENT_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  CANCELLED = 'CANCELLED',
  UNKNOWN = 'UNKNOWN',
}

export interface NetworkError extends Error {
  type: NetworkErrorType;
  status?: number;
  retryable: boolean;
  retryAfter?: number;
}

interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryableStatuses: number[];
  shouldRetry?: (error: AxiosError) => boolean;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RequestCacheEntry {
  promise: Promise<unknown>;
  timestamp: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second base delay
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60000, // 1 minute
};

export class NetworkInterceptor {
  private requestCache = new Map<string, RequestCacheEntry>();
  private requestTimestamps: number[] = [];
  private retryConfig: RetryConfig;
  private rateLimitConfig: RateLimitConfig;
  private isOnline = true;

  constructor(
    retryConfig: Partial<RetryConfig> = {},
    rateLimitConfig: Partial<RateLimitConfig> = {}
  ) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
    this.rateLimitConfig = { ...DEFAULT_RATE_LIMIT, ...rateLimitConfig };

    // Monitor network connectivity
    NetInfo.addEventListener((state) => {
      this.isOnline = state.isConnected ?? false;
    });
  }

  /**
   * Classify network error type
   */
  classifyError(error: AxiosError): NetworkError {
    const networkError = error as unknown as NetworkError;

    // Check if it's a timeout
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      networkError.type = NetworkErrorType.TIMEOUT;
      networkError.retryable = true;
      return networkError;
    }

    // Check if it's a network error (no response)
    if (!error.response) {
      networkError.type = NetworkErrorType.NETWORK_ERROR;
      networkError.retryable = true;
      return networkError;
    }

    const status = error.response.status;

    // Rate limited
    if (status === 429) {
      networkError.type = NetworkErrorType.RATE_LIMITED;
      networkError.retryable = true;
      networkError.retryAfter = Number.parseInt(error.response.headers['retry-after'] || '60', 10);
      return networkError;
    }

    // Server errors (5xx)
    if (status >= 500) {
      networkError.type = NetworkErrorType.SERVER_ERROR;
      networkError.retryable = true;
      networkError.status = status;
      return networkError;
    }

    // Client errors (4xx)
    if (status >= 400) {
      networkError.type = NetworkErrorType.CLIENT_ERROR;
      networkError.retryable = false;
      networkError.status = status;
      return networkError;
    }

    networkError.type = NetworkErrorType.UNKNOWN;
    networkError.retryable = false;
    return networkError;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(retryCount: number, retryAfter?: number): number {
    if (retryAfter) {
      return retryAfter * 1000;
    }

    // Exponential backoff: delay * 2^retryCount with jitter
    const exponentialDelay = this.retryConfig.retryDelay * 2 ** retryCount;
    const jitter = Math.random() * 1000; // Add up to 1 second of jitter
    return exponentialDelay + jitter;
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: AxiosError): boolean {
    const networkError = this.classifyError(error);

    // Custom retry logic if provided
    if (this.retryConfig.shouldRetry) {
      return this.retryConfig.shouldRetry(error);
    }

    // Check if error type is retryable
    if (!networkError.retryable) {
      return false;
    }

    // Check if status code is in retryable list
    if (error.response?.status) {
      return this.retryConfig.retryableStatuses.includes(error.response.status);
    }

    return true;
  }

  /**
   * Retry request with exponential backoff
   */
  async retryRequest(error: AxiosError, retryCount = 0): Promise<unknown> {
    const networkError = this.classifyError(error);

    // Check if we should retry
    if (retryCount >= this.retryConfig.maxRetries || !this.isRetryableError(error)) {
      console.error(
        '[NetworkInterceptor] Max retries reached or error not retryable:',
        networkError.type
      );
      Sentry.captureException(error, {
        tags: {
          errorType: networkError.type,
          retryCount,
        },
      });
      throw error;
    }

    // Calculate delay
    const delay = this.calculateRetryDelay(retryCount, networkError.retryAfter);

    console.log(
      `[NetworkInterceptor] Retrying request (${retryCount + 1}/${this.retryConfig.maxRetries}) after ${delay}ms`
    );

    // Wait before retrying
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Check if we're online before retrying
    if (!this.isOnline) {
      console.log('[NetworkInterceptor] Offline, not retrying');
      throw error;
    }

    // Add retry count to config
    const config = error.config as InternalAxiosRequestConfig & { __retryCount?: number };
    if (config) {
      config.__retryCount = retryCount + 1;
    }

    throw error; // Will be caught by axios interceptor
  }

  /**
   * Generate cache key for request deduplication
   */
  private getCacheKey(config: InternalAxiosRequestConfig): string {
    const { method, url, params, data } = config;
    return JSON.stringify({ method, url, params, data });
  }

  /**
   * Deduplicate identical requests
   */
  async deduplicateRequest<T>(
    config: InternalAxiosRequestConfig,
    executeRequest: () => Promise<T>
  ): Promise<T> {
    // Only deduplicate GET requests
    if (config.method?.toLowerCase() !== 'get') {
      return executeRequest();
    }

    const cacheKey = this.getCacheKey(config);
    const cached = this.requestCache.get(cacheKey);

    // Return cached promise if it exists and is recent (< 5 seconds old)
    if (cached && Date.now() - cached.timestamp < 5000) {
      console.log('[NetworkInterceptor] Returning deduplicated request');
      return cached.promise as Promise<T>;
    }

    // Execute new request and cache it
    const promise = executeRequest();
    this.requestCache.set(cacheKey, {
      promise,
      timestamp: Date.now(),
    });

    // Clean up cache after request completes
    promise
      .then(() => {
        setTimeout(() => this.requestCache.delete(cacheKey), 5000);
      })
      .catch(() => {
        this.requestCache.delete(cacheKey);
      });

    return promise;
  }

  /**
   * Check rate limit
   */
  checkRateLimit(): boolean {
    const now = Date.now();
    const windowStart = now - this.rateLimitConfig.windowMs;

    // Remove old timestamps
    this.requestTimestamps = this.requestTimestamps.filter((ts) => ts > windowStart);

    // Check if we've exceeded the limit
    if (this.requestTimestamps.length >= this.rateLimitConfig.maxRequests) {
      console.warn('[NetworkInterceptor] Rate limit exceeded');
      return false;
    }

    // Add current timestamp
    this.requestTimestamps.push(now);
    return true;
  }

  /**
   * Clear request cache
   */
  clearCache(): void {
    this.requestCache.clear();
  }

  /**
   * Reset rate limit
   */
  resetRateLimit(): void {
    this.requestTimestamps = [];
  }

  /**
   * Get retry count from config
   */
  getRetryCount(config: InternalAxiosRequestConfig & { __retryCount?: number }): number {
    return config.__retryCount || 0;
  }
}

// Export singleton instance
export const networkInterceptor = new NetworkInterceptor();
