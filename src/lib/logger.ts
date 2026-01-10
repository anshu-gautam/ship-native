/**
 * Structured Logging Infrastructure
 *
 * Production-grade logging system with:
 * - Multiple log levels (debug, info, warn, error)
 * - Log categorization
 * - Remote log aggregation
 * - Performance tracking
 * - Structured metadata
 * - Environment-aware logging
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export enum LogCategory {
  NETWORK = 'network',
  AUTH = 'auth',
  NAVIGATION = 'navigation',
  PERFORMANCE = 'performance',
  DATABASE = 'database',
  UI = 'ui',
  ANALYTICS = 'analytics',
  PAYMENT = 'payment',
  FEATURE_FLAG = 'feature_flag',
  GENERAL = 'general',
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: LogCategory;
  message: string;
  metadata?: Record<string, unknown>;
  error?: Error;
  userId?: string;
  sessionId?: string;
}

export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  enableStorage: boolean;
  remoteEndpoint?: string;
  maxStoredLogs: number;
  batchSize: number;
  flushInterval: number; // ms
}

const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV === 'development';

const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: isDev ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: isDev,
  enableRemote: !isDev,
  enableStorage: true,
  maxStoredLogs: 1000,
  batchSize: 50,
  flushInterval: 30000, // 30 seconds
};

const STORAGE_KEY = '@app/logs';

export class Logger {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private flushTimer?: ReturnType<typeof setInterval>;
  private sessionId: string;
  private userId?: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = this.generateSessionId();

    // Start periodic flush if remote logging is enabled
    if (this.config.enableRemote) {
      this.startPeriodicFlush();
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Set current user ID for log context
   */
  setUserId(userId: string | undefined): void {
    this.userId = userId;
  }

  /**
   * Configure logger
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };

    // Restart flush timer if config changed
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }

    if (this.config.enableRemote) {
      this.startPeriodicFlush();
    }
  }

  /**
   * Log debug message
   */
  debug(
    message: string,
    category: LogCategory = LogCategory.GENERAL,
    metadata?: Record<string, unknown>
  ): void {
    this.log(LogLevel.DEBUG, category, message, metadata);
  }

  /**
   * Log info message
   */
  info(
    message: string,
    category: LogCategory = LogCategory.GENERAL,
    metadata?: Record<string, unknown>
  ): void {
    this.log(LogLevel.INFO, category, message, metadata);
  }

  /**
   * Log warning message
   */
  warn(
    message: string,
    category: LogCategory = LogCategory.GENERAL,
    metadata?: Record<string, unknown>
  ): void {
    this.log(LogLevel.WARN, category, message, metadata);
  }

  /**
   * Log error message
   */
  error(
    message: string,
    category: LogCategory = LogCategory.GENERAL,
    metadata?: Record<string, unknown>,
    error?: Error
  ): void {
    this.log(LogLevel.ERROR, category, message, metadata, error);
  }

  /**
   * Log fatal error message
   */
  fatal(
    message: string,
    category: LogCategory = LogCategory.GENERAL,
    metadata?: Record<string, unknown>,
    error?: Error
  ): void {
    this.log(LogLevel.FATAL, category, message, metadata, error);
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    metadata?: Record<string, unknown>,
    error?: Error
  ): void {
    // Check if level meets minimum threshold
    if (level < this.config.minLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      metadata,
      error,
      userId: this.userId,
      sessionId: this.sessionId,
    };

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Add to buffer for remote/storage
    this.logBuffer.push(entry);

    // Store to local storage
    if (this.config.enableStorage) {
      this.storeLog(entry);
    }

    // Send to Sentry for errors
    if (level >= LogLevel.ERROR && error) {
      Sentry.captureException(error, {
        level: level === LogLevel.FATAL ? 'fatal' : 'error',
        tags: {
          category,
        },
        extra: {
          message,
          ...metadata,
        },
      });
    }

    // Flush if buffer is full
    if (this.logBuffer.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Log to console with formatting
   */
  private logToConsole(entry: LogEntry): void {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
    const levelColors = [
      '\x1b[36m', // DEBUG - Cyan
      '\x1b[32m', // INFO - Green
      '\x1b[33m', // WARN - Yellow
      '\x1b[31m', // ERROR - Red
      '\x1b[35m', // FATAL - Magenta
    ];

    const timestamp = new Date(entry.timestamp).toISOString();
    const levelName = levelNames[entry.level];
    const color = levelColors[entry.level];
    const reset = '\x1b[0m';

    const prefix = `${color}[${timestamp}] [${levelName}] [${entry.category}]${reset}`;
    const message = `${prefix} ${entry.message}`;

    // Use appropriate console method
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.log(message, entry.metadata || '');
        break;
      case LogLevel.INFO:
        console.info(message, entry.metadata || '');
        break;
      case LogLevel.WARN:
        console.warn(message, entry.metadata || '');
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message, entry.metadata || '', entry.error || '');
        break;
    }
  }

  /**
   * Store log entry to AsyncStorage
   */
  private async storeLog(entry: LogEntry): Promise<void> {
    try {
      const storedLogsJson = await AsyncStorage.getItem(STORAGE_KEY);
      const storedLogs: LogEntry[] = storedLogsJson ? JSON.parse(storedLogsJson) : [];

      // Add new log
      storedLogs.push(entry);

      // Trim if exceeds max
      if (storedLogs.length > this.config.maxStoredLogs) {
        storedLogs.splice(0, storedLogs.length - this.config.maxStoredLogs);
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedLogs));
    } catch (error) {
      console.error('[Logger] Failed to store log:', error);
    }
  }

  /**
   * Start periodic flush timer
   */
  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Flush buffered logs to remote endpoint
   */
  async flush(): Promise<void> {
    if (this.logBuffer.length === 0 || !this.config.enableRemote) {
      return;
    }

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      if (this.config.remoteEndpoint) {
        const response = await fetch(this.config.remoteEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            logs: logsToSend,
            sessionId: this.sessionId,
            userId: this.userId,
          }),
        });

        if (!response.ok) {
          console.error('[Logger] Failed to send logs:', response.statusText);
          // Re-add logs to buffer on failure
          this.logBuffer.unshift(...logsToSend);
        }
      }
    } catch (error) {
      console.error('[Logger] Failed to flush logs:', error);
      // Re-add logs to buffer on failure
      this.logBuffer.unshift(...logsToSend);
    }
  }

  /**
   * Get stored logs from AsyncStorage
   */
  async getStoredLogs(filter?: {
    level?: LogLevel;
    category?: LogCategory;
    startTime?: number;
    endTime?: number;
  }): Promise<LogEntry[]> {
    try {
      const storedLogsJson = await AsyncStorage.getItem(STORAGE_KEY);
      let logs: LogEntry[] = storedLogsJson ? JSON.parse(storedLogsJson) : [];

      // Apply filters
      if (filter) {
        logs = logs.filter((log) => {
          if (filter.level !== undefined && log.level < filter.level) {
            return false;
          }
          if (filter.category && log.category !== filter.category) {
            return false;
          }
          if (filter.startTime && log.timestamp < filter.startTime) {
            return false;
          }
          if (filter.endTime && log.timestamp > filter.endTime) {
            return false;
          }
          return true;
        });
      }

      return logs;
    } catch (error) {
      console.error('[Logger] Failed to get stored logs:', error);
      return [];
    }
  }

  /**
   * Clear stored logs
   */
  async clearStoredLogs(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('[Logger] Failed to clear stored logs:', error);
    }
  }

  /**
   * Get log statistics
   */
  async getLogStats(): Promise<{
    total: number;
    byLevel: Record<LogLevel, number>;
    byCategory: Record<LogCategory, number>;
  }> {
    const logs = await this.getStoredLogs();

    const stats = {
      total: logs.length,
      byLevel: {
        [LogLevel.DEBUG]: 0,
        [LogLevel.INFO]: 0,
        [LogLevel.WARN]: 0,
        [LogLevel.ERROR]: 0,
        [LogLevel.FATAL]: 0,
      },
      byCategory: {} as Record<LogCategory, number>,
    };

    for (const log of logs) {
      stats.byLevel[log.level]++;
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
    }

    return stats;
  }

  /**
   * Export logs as JSON
   */
  async exportLogs(): Promise<string> {
    const logs = await this.getStoredLogs();
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Cleanup and stop logger
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
    this.flush();
  }
}

// Export singleton instance
export const logger = new Logger();

// Export utility functions
export const log = {
  debug: (message: string, category?: LogCategory, metadata?: Record<string, unknown>) =>
    logger.debug(message, category, metadata),
  info: (message: string, category?: LogCategory, metadata?: Record<string, unknown>) =>
    logger.info(message, category, metadata),
  warn: (message: string, category?: LogCategory, metadata?: Record<string, unknown>) =>
    logger.warn(message, category, metadata),
  error: (
    message: string,
    category?: LogCategory,
    metadata?: Record<string, unknown>,
    error?: Error
  ) => logger.error(message, category, metadata, error),
  fatal: (
    message: string,
    category?: LogCategory,
    metadata?: Record<string, unknown>,
    error?: Error
  ) => logger.fatal(message, category, metadata, error),
};
