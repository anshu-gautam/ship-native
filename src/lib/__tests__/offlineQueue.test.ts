/**
 * Offline Queue Tests
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { offlineQueue, withOfflineQueue } from '../offlineQueue';

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock NetInfo
const mockNetInfoState = {
  isConnected: false, // Start as offline for tests
};

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn((callback) => {
    // Call callback immediately with current state
    callback(mockNetInfoState);
    return jest.fn();
  }),
  fetch: jest.fn(() => Promise.resolve(mockNetInfoState)),
}));

describe('OfflineQueue', () => {
  const mockRequestHandler = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    await offlineQueue.initialize(mockRequestHandler);
    await offlineQueue.clearQueue();
  });

  afterEach(() => {
    offlineQueue.destroy();
  });

  describe('addRequest', () => {
    it('adds request to queue', async () => {
      const requestId = await offlineQueue.addRequest({
        url: '/api/users',
        method: 'POST',
        body: { name: 'Test' },
        priority: 1,
      });

      expect(requestId).toBeDefined();
      expect(offlineQueue.getQueueSize()).toBe(1);

      const queue = offlineQueue.getQueue();
      expect(queue[0].url).toBe('/api/users');
      expect(queue[0].method).toBe('POST');
    });

    it('assigns unique IDs to requests', async () => {
      const id1 = await offlineQueue.addRequest({
        url: '/api/test1',
        method: 'GET',
        priority: 1,
      });

      const id2 = await offlineQueue.addRequest({
        url: '/api/test2',
        method: 'GET',
        priority: 1,
      });

      expect(id1).not.toBe(id2);
    });
  });

  describe('removeRequest', () => {
    it('removes request from queue', async () => {
      const requestId = await offlineQueue.addRequest({
        url: '/api/test',
        method: 'GET',
        priority: 1,
      });

      expect(offlineQueue.getQueueSize()).toBe(1);

      const removed = await offlineQueue.removeRequest(requestId);

      expect(removed).toBe(true);
      expect(offlineQueue.getQueueSize()).toBe(0);
    });

    it('returns false when request not found', async () => {
      const removed = await offlineQueue.removeRequest('non-existent-id');
      expect(removed).toBe(false);
    });
  });

  describe('getQueue', () => {
    it('returns all queued requests', async () => {
      await offlineQueue.addRequest({
        url: '/api/test1',
        method: 'GET',
        priority: 1,
      });

      await offlineQueue.addRequest({
        url: '/api/test2',
        method: 'POST',
        priority: 2,
      });

      const queue = offlineQueue.getQueue();

      expect(queue).toHaveLength(2);
      expect(queue[0].url).toBe('/api/test1');
      expect(queue[1].url).toBe('/api/test2');
    });
  });

  describe('clearQueue', () => {
    it('clears all requests from queue', async () => {
      await offlineQueue.addRequest({
        url: '/api/test1',
        method: 'GET',
        priority: 1,
      });

      await offlineQueue.addRequest({
        url: '/api/test2',
        method: 'GET',
        priority: 1,
      });

      expect(offlineQueue.getQueueSize()).toBe(2);

      await offlineQueue.clearQueue();

      expect(offlineQueue.getQueueSize()).toBe(0);
    });
  });

  describe('withOfflineQueue', () => {
    it('executes function and returns result on success', async () => {
      const mockFn = jest.fn().mockResolvedValue({ data: 'success' });

      const result = await withOfflineQueue(
        {
          url: '/api/test',
          method: 'GET',
          priority: 1,
        },
        mockFn
      );

      expect(result).toEqual({ data: 'success' });
      expect(mockFn).toHaveBeenCalled();
      expect(offlineQueue.getQueueSize()).toBe(0);
    });

    it('adds request to queue on network error', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Network request failed'));

      await expect(
        withOfflineQueue(
          {
            url: '/api/test',
            method: 'POST',
            body: { test: 'data' },
            priority: 2,
          },
          mockFn
        )
      ).rejects.toThrow('Network request failed');

      // Request should be added to queue
      expect(offlineQueue.getQueueSize()).toBe(1);

      const queue = offlineQueue.getQueue();
      expect(queue[0].url).toBe('/api/test');
      expect(queue[0].method).toBe('POST');
      expect(queue[0].priority).toBe(2);
    });

    it('does not queue non-network errors', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Validation error'));

      await expect(
        withOfflineQueue(
          {
            url: '/api/test',
            method: 'POST',
            priority: 1,
          },
          mockFn
        )
      ).rejects.toThrow('Validation error');

      // Request should NOT be added to queue
      expect(offlineQueue.getQueueSize()).toBe(0);
    });
  });
});
