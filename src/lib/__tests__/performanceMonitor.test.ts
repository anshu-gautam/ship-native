/**
 * Performance Monitor Tests
 */

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

import { performanceMonitor } from '../performanceMonitor';

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    performanceMonitor.clear();
    performanceMonitor.setEnabled(true);
  });

  describe('startMeasure and endMeasure', () => {
    it('measures duration correctly', () => {
      performanceMonitor.startMeasure('test-operation');

      // Simulate some work
      const start = Date.now();
      while (Date.now() - start < 100) {
        // Wait 100ms
      }

      const duration = performanceMonitor.endMeasure('test-operation');

      expect(duration).toBeGreaterThanOrEqual(100);
      expect(duration).toBeLessThan(200); // Should be close to 100ms
    });

    it('returns null when no start time exists', () => {
      const duration = performanceMonitor.endMeasure('non-existent');
      expect(duration).toBeNull();
    });

    it('records metric with metadata', () => {
      performanceMonitor.startMeasure('api-call');
      performanceMonitor.endMeasure('api-call', { endpoint: '/users', method: 'GET' });

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('api-call');
      expect(metrics[0].metadata).toEqual({ endpoint: '/users', method: 'GET' });
    });
  });

  describe('measureAsync', () => {
    it('measures async operations', async () => {
      const asyncFn = async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return 'result';
      };

      const result = await performanceMonitor.measureAsync('async-op', asyncFn);

      expect(result).toBe('result');
      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('async-op');
      expect(metrics[0].duration).toBeGreaterThanOrEqual(100);
    });

    it('records error in metadata when promise rejects', async () => {
      const failingFn = async () => {
        throw new Error('Test error');
      };

      await expect(performanceMonitor.measureAsync('failing-op', failingFn)).rejects.toThrow(
        'Test error'
      );

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].metadata?.success).toBe(false);
      expect(metrics[0].metadata?.error).toBeDefined();
    });
  });

  describe('getAverageDuration', () => {
    it('calculates average duration correctly', () => {
      performanceMonitor.startMeasure('operation');
      performanceMonitor.endMeasure('operation');

      performanceMonitor.startMeasure('operation');
      performanceMonitor.endMeasure('operation');

      performanceMonitor.startMeasure('operation');
      performanceMonitor.endMeasure('operation');

      const average = performanceMonitor.getAverageDuration('operation');
      expect(average).toBeGreaterThanOrEqual(0);
    });

    it('returns 0 for non-existent metric', () => {
      const average = performanceMonitor.getAverageDuration('non-existent');
      expect(average).toBe(0);
    });
  });

  describe('clear', () => {
    it('clears all metrics', () => {
      performanceMonitor.startMeasure('test');
      performanceMonitor.endMeasure('test');

      expect(performanceMonitor.getMetrics()).toHaveLength(1);

      performanceMonitor.clear();

      expect(performanceMonitor.getMetrics()).toHaveLength(0);
      expect(performanceMonitor.getScreenMetrics()).toHaveLength(0);
    });
  });

  describe('generateReport', () => {
    it('generates a performance report', () => {
      performanceMonitor.startMeasure('operation1');
      performanceMonitor.endMeasure('operation1');

      performanceMonitor.startMeasure('operation2');
      performanceMonitor.endMeasure('operation2');

      const report = performanceMonitor.generateReport();

      expect(report).toContain('Performance Report');
      expect(report).toContain('Total Metrics: 2');
      expect(report).toContain('operation1');
      expect(report).toContain('operation2');
    });
  });
});
