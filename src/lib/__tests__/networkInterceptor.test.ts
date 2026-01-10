/**
 * Network Interceptor Tests
 */

import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { NetworkErrorType, NetworkInterceptor } from '../networkInterceptor';

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
    })
  ),
}));

describe('NetworkInterceptor', () => {
  let interceptor: NetworkInterceptor;

  beforeEach(() => {
    jest.clearAllMocks();
    interceptor = new NetworkInterceptor();
  });

  describe('classifyError', () => {
    it('classifies timeout errors correctly', () => {
      const error = {
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded',
        config: {},
      } as AxiosError;

      const result = interceptor.classifyError(error);

      expect(result.type).toBe(NetworkErrorType.TIMEOUT);
      expect(result.retryable).toBe(true);
    });

    it('classifies network errors correctly', () => {
      const error = {
        code: 'ERR_NETWORK',
        message: 'Network Error',
        config: {},
      } as AxiosError;

      const result = interceptor.classifyError(error);

      expect(result.type).toBe(NetworkErrorType.NETWORK_ERROR);
      expect(result.retryable).toBe(true);
    });

    it('classifies rate limit errors correctly', () => {
      const error = {
        message: 'Too Many Requests',
        response: {
          status: 429,
          headers: { 'retry-after': '60' },
          data: {},
          statusText: 'Too Many Requests',
          config: {} as InternalAxiosRequestConfig,
        },
        config: {},
      } as unknown as AxiosError;

      const result = interceptor.classifyError(error);

      expect(result.type).toBe(NetworkErrorType.RATE_LIMITED);
      expect(result.retryable).toBe(true);
      expect(result.retryAfter).toBe(60);
    });

    it('classifies server errors correctly', () => {
      const error = {
        message: 'Internal Server Error',
        response: {
          status: 500,
          data: {},
          statusText: 'Internal Server Error',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        config: {},
      } as AxiosError;

      const result = interceptor.classifyError(error);

      expect(result.type).toBe(NetworkErrorType.SERVER_ERROR);
      expect(result.retryable).toBe(true);
      expect(result.status).toBe(500);
    });

    it('classifies client errors correctly', () => {
      const error = {
        message: 'Not Found',
        response: {
          status: 404,
          data: {},
          statusText: 'Not Found',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        config: {},
      } as AxiosError;

      const result = interceptor.classifyError(error);

      expect(result.type).toBe(NetworkErrorType.CLIENT_ERROR);
      expect(result.retryable).toBe(false);
      expect(result.status).toBe(404);
    });
  });

  describe('retryRequest', () => {
    it('retries with exponential backoff', async () => {
      const error = {
        message: 'Internal Server Error',
        response: {
          status: 500,
          data: {},
          statusText: 'Internal Server Error',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        config: {},
      } as AxiosError;

      const startTime = Date.now();

      try {
        await interceptor.retryRequest(error, 0);
      } catch {
        // Expected to throw after delay
      }

      const elapsed = Date.now() - startTime;

      // Should have waited at least 1 second (base delay)
      expect(elapsed).toBeGreaterThanOrEqual(900);
    });

    it('stops retrying after max retries', async () => {
      const error = {
        name: 'AxiosError',
        message: 'Internal Server Error',
        response: {
          status: 500,
          data: {},
          statusText: 'Internal Server Error',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        config: {},
        isAxiosError: true,
      } as AxiosError;

      try {
        await interceptor.retryRequest(error, 3);
        fail('Should have thrown an error');
      } catch (e) {
        expect(e).toBeDefined();
      }
    });

    it('does not retry non-retryable errors', async () => {
      const error = {
        name: 'AxiosError',
        message: 'Not Found',
        response: {
          status: 404,
          data: {},
          statusText: 'Not Found',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        config: {},
        isAxiosError: true,
      } as AxiosError;

      try {
        await interceptor.retryRequest(error, 0);
        fail('Should have thrown an error');
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });

  describe('deduplicateRequest', () => {
    it('deduplicates identical GET requests', async () => {
      const config = {
        method: 'get',
        url: '/api/test',
        params: { id: 1 },
        headers: {},
      } as InternalAxiosRequestConfig;

      let executionCount = 0;
      const executeRequest = jest.fn(async () => {
        executionCount++;
        return { data: 'result' };
      });

      // Make two identical requests
      const promise1 = interceptor.deduplicateRequest(config, executeRequest);
      const promise2 = interceptor.deduplicateRequest(config, executeRequest);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      // Both should return the same result
      expect(result1).toEqual(result2);

      // But the request should only execute once
      expect(executionCount).toBe(1);
    });

    it('does not deduplicate POST requests', async () => {
      const config = {
        method: 'post',
        url: '/api/test',
        data: { name: 'test' },
        headers: {},
      } as InternalAxiosRequestConfig;

      let executionCount = 0;
      const executeRequest = jest.fn(async () => {
        executionCount++;
        return { data: 'result' };
      });

      // Make two identical POST requests
      await interceptor.deduplicateRequest(config, executeRequest);
      await interceptor.deduplicateRequest(config, executeRequest);

      // Both should execute
      expect(executionCount).toBe(2);
    });
  });

  describe('checkRateLimit', () => {
    it('allows requests within rate limit', () => {
      const customInterceptor = new NetworkInterceptor({}, { maxRequests: 5, windowMs: 60000 });

      // Should allow first 5 requests
      expect(customInterceptor.checkRateLimit()).toBe(true);
      expect(customInterceptor.checkRateLimit()).toBe(true);
      expect(customInterceptor.checkRateLimit()).toBe(true);
      expect(customInterceptor.checkRateLimit()).toBe(true);
      expect(customInterceptor.checkRateLimit()).toBe(true);

      // 6th request should be blocked
      expect(customInterceptor.checkRateLimit()).toBe(false);
    });

    it('resets rate limit after reset', () => {
      const customInterceptor = new NetworkInterceptor({}, { maxRequests: 2, windowMs: 60000 });

      expect(customInterceptor.checkRateLimit()).toBe(true);
      expect(customInterceptor.checkRateLimit()).toBe(true);
      expect(customInterceptor.checkRateLimit()).toBe(false);

      customInterceptor.resetRateLimit();

      expect(customInterceptor.checkRateLimit()).toBe(true);
    });
  });

  describe('clearCache', () => {
    it('clears request cache', async () => {
      const config = {
        method: 'get',
        url: '/api/test',
        headers: {},
      } as InternalAxiosRequestConfig;

      let executionCount = 0;
      const executeRequest = jest.fn(async () => {
        executionCount++;
        return { data: 'result' };
      });

      // Make first request
      await interceptor.deduplicateRequest(config, executeRequest);
      expect(executionCount).toBe(1);

      // Clear cache
      interceptor.clearCache();

      // Make second request - should not use cache
      await interceptor.deduplicateRequest(config, executeRequest);
      expect(executionCount).toBe(2);
    });
  });

  describe('getRetryCount', () => {
    it('returns 0 for new requests', () => {
      const config = {
        headers: {},
      } as InternalAxiosRequestConfig;

      expect(interceptor.getRetryCount(config)).toBe(0);
    });

    it('returns correct retry count', () => {
      const config = {
        headers: {},
        __retryCount: 2,
      } as InternalAxiosRequestConfig & { __retryCount?: number };

      expect(interceptor.getRetryCount(config)).toBe(2);
    });
  });
});
