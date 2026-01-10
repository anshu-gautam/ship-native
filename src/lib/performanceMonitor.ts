/**
 * Performance Monitor
 *
 * Tracks and reports app performance metrics
 * - Screen render times
 * - API request durations
 * - Memory usage
 * - Frame drops
 */

import * as Sentry from '@sentry/react-native';
import React from 'react';
import { InteractionManager } from 'react-native';

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface ScreenMetrics {
  screenName: string;
  renderTime: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private screenMetrics: ScreenMetrics[] = [];
  private timers: Map<string, number> = new Map();
  private enabled: boolean = __DEV__;

  /**
   * Enable or disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Start measuring a performance metric
   */
  startMeasure(name: string): void {
    if (!this.enabled) return;
    this.timers.set(name, Date.now());
  }

  /**
   * End measuring and record the metric
   */
  endMeasure(name: string, metadata?: Record<string, unknown>): number | null {
    if (!this.enabled) return null;

    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`[Performance] No start time found for: ${name}`);
      return null;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(name);

    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Log in development
    if (__DEV__) {
      console.log(`[Performance] ${name}: ${duration}ms`, metadata || '');
    }

    // Report to Sentry if duration exceeds threshold
    if (duration > 3000) {
      // 3 seconds threshold
      Sentry.captureMessage(`Slow operation: ${name}`, {
        level: 'warning',
        extra: {
          duration,
          ...metadata,
        },
      });
    }

    return duration;
  }

  /**
   * Measure screen render time
   */
  measureScreenRender(screenName: string): () => void {
    if (!this.enabled) {
      return () => {
        // No-op when disabled
      };
    }

    const startTime = Date.now();

    return () => {
      InteractionManager.runAfterInteractions(() => {
        const renderTime = Date.now() - startTime;

        const metric: ScreenMetrics = {
          screenName,
          renderTime,
          timestamp: Date.now(),
        };

        this.screenMetrics.push(metric);

        if (__DEV__) {
          console.log(`[Performance] Screen ${screenName} rendered in ${renderTime}ms`);
        }

        // Report slow screen renders
        if (renderTime > 2000) {
          Sentry.captureMessage(`Slow screen render: ${screenName}`, {
            level: 'warning',
            extra: { renderTime },
          });
        }
      });
    };
  }

  /**
   * Measure API request duration
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    if (!this.enabled) return fn();

    this.startMeasure(name);
    try {
      const result = await fn();
      this.endMeasure(name, { ...metadata, success: true });
      return result;
    } catch (error) {
      this.endMeasure(name, { ...metadata, success: false, error });
      throw error;
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get screen render metrics
   */
  getScreenMetrics(): ScreenMetrics[] {
    return [...this.screenMetrics];
  }

  /**
   * Get average duration for a metric
   */
  getAverageDuration(name: string): number {
    const filtered = this.metrics.filter((m) => m.name === name);
    if (filtered.length === 0) return 0;

    const total = filtered.reduce((sum, m) => sum + m.duration, 0);
    return total / filtered.length;
  }

  /**
   * Get slowest screens
   */
  getSlowestScreens(limit = 5): ScreenMetrics[] {
    return [...this.screenMetrics].sort((a, b) => b.renderTime - a.renderTime).slice(0, limit);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.screenMetrics = [];
    this.timers.clear();
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const totalMetrics = this.metrics.length;
    const totalScreens = this.screenMetrics.length;
    const slowestScreens = this.getSlowestScreens(3);

    let report = '=== Performance Report ===\n\n';
    report += `Total Metrics: ${totalMetrics}\n`;
    report += `Total Screen Renders: ${totalScreens}\n\n`;

    if (slowestScreens.length > 0) {
      report += 'Slowest Screens:\n';
      slowestScreens.forEach((screen, index) => {
        report += `${index + 1}. ${screen.screenName}: ${screen.renderTime}ms\n`;
      });
      report += '\n';
    }

    // Group metrics by name
    const metricsByName = new Map<string, number[]>();
    for (const metric of this.metrics) {
      const durations = metricsByName.get(metric.name) || [];
      durations.push(metric.duration);
      metricsByName.set(metric.name, durations);
    }

    if (metricsByName.size > 0) {
      report += 'Average Metric Durations:\n';
      const sortedMetrics = Array.from(metricsByName.entries()).sort((a, b) => {
        const avgA = a[1].reduce((s, d) => s + d, 0) / a[1].length;
        const avgB = b[1].reduce((s, d) => s + d, 0) / b[1].length;
        return avgB - avgA;
      });

      for (const [name, durations] of sortedMetrics) {
        const avg = durations.reduce((s, d) => s + d, 0) / durations.length;
        report += `- ${name}: ${avg.toFixed(2)}ms (${durations.length} calls)\n`;
      }
    }

    return report;
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook for measuring screen render performance
 */
export function usePerformanceMonitor(screenName: string): void {
  if (!__DEV__) return;

  const endMeasure = performanceMonitor.measureScreenRender(screenName);

  // Call endMeasure when component unmounts or after interactions
  React.useEffect(() => {
    return endMeasure;
  }, [endMeasure]);
}
