/**
 * Structured Logger Tests
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogCategory, LogLevel, Logger } from '../logger';

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

// Mock global fetch
global.fetch = jest.fn();

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      statusText: 'OK',
    });

    logger = new Logger({
      enableConsole: false, // Disable console output for tests
      enableRemote: false, // Disable remote for most tests
      enableStorage: true,
    });
  });

  afterEach(() => {
    logger.destroy();
  });

  describe('log levels', () => {
    it('logs debug messages', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      logger.configure({ enableConsole: true });
      logger.debug('Debug message', LogCategory.GENERAL, { key: 'value' });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('logs info messages', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

      logger.configure({ enableConsole: true });
      logger.info('Info message', LogCategory.NETWORK);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('logs warning messages', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      logger.configure({ enableConsole: true });
      logger.warn('Warning message', LogCategory.AUTH);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('logs error messages', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      logger.configure({ enableConsole: true });
      logger.error('Error message', LogCategory.DATABASE, {}, new Error('Test error'));

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('respects minimum log level', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      logger.configure({ minLevel: LogLevel.WARN, enableConsole: true });

      logger.debug('Should not log');
      logger.info('Should not log');
      logger.warn('Should log');

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('storage', () => {
    it('stores logs to AsyncStorage', async () => {
      logger.info('Test message');

      // Wait for async storage operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const setItemCall = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      expect(setItemCall[0]).toBe('@app/logs');

      const storedLogs = JSON.parse(setItemCall[1]);
      expect(storedLogs).toHaveLength(1);
      expect(storedLogs[0].message).toBe('Test message');
    });

    it('trims stored logs when exceeding max', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(new Array(1000).fill({ message: 'old' }))
      );

      logger.configure({ maxStoredLogs: 1000 });
      logger.info('New message');

      await new Promise((resolve) => setTimeout(resolve, 100));

      const setItemCall = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const storedLogs = JSON.parse(setItemCall[1]);
      expect(storedLogs).toHaveLength(1000);
    });

    it('gets stored logs', async () => {
      const mockLogs = [
        {
          timestamp: Date.now(),
          level: LogLevel.INFO,
          category: LogCategory.GENERAL,
          message: 'Test 1',
        },
        {
          timestamp: Date.now(),
          level: LogLevel.ERROR,
          category: LogCategory.NETWORK,
          message: 'Test 2',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockLogs));

      const logs = await logger.getStoredLogs();
      expect(logs).toHaveLength(2);
      expect(logs[0].message).toBe('Test 1');
    });

    it('filters stored logs', async () => {
      const mockLogs = [
        {
          timestamp: Date.now() - 1000,
          level: LogLevel.INFO,
          category: LogCategory.GENERAL,
          message: 'Info message',
        },
        {
          timestamp: Date.now(),
          level: LogLevel.ERROR,
          category: LogCategory.NETWORK,
          message: 'Error message',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockLogs));

      const logs = await logger.getStoredLogs({ level: LogLevel.ERROR });
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Error message');
    });

    it('clears stored logs', async () => {
      await logger.clearStoredLogs();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@app/logs');
    });
  });

  describe('remote logging', () => {
    it('flushes logs to remote endpoint', async () => {
      logger.configure({
        enableRemote: true,
        remoteEndpoint: 'https://api.example.com/logs',
      });

      logger.info('Test message 1');
      logger.info('Test message 2');

      await logger.flush();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/logs',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.logs).toHaveLength(2);
    });

    it('handles remote logging failures', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Server Error',
      });

      logger.configure({
        enableRemote: true,
        remoteEndpoint: 'https://api.example.com/logs',
      });

      logger.info('Test message');
      await logger.flush();

      // Logs should be re-added to buffer on failure
      logger.info('Another message');
      await logger.flush();

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('auto-flushes when batch size is reached', async () => {
      logger.configure({
        enableRemote: true,
        remoteEndpoint: 'https://api.example.com/logs',
        batchSize: 3,
      });

      logger.info('Message 1');
      logger.info('Message 2');

      expect(global.fetch).not.toHaveBeenCalled();

      logger.info('Message 3');

      // Wait for async flush
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('user context', () => {
    it('includes user ID in logs', async () => {
      logger.setUserId('user123');

      logger.configure({
        enableRemote: true,
        remoteEndpoint: 'https://api.example.com/logs',
      });

      logger.info('Test message');
      await logger.flush();

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.userId).toBe('user123');
      expect(body.logs[0].userId).toBe('user123');
    });

    it('includes session ID in logs', async () => {
      logger.configure({
        enableRemote: true,
        remoteEndpoint: 'https://api.example.com/logs',
      });

      logger.info('Test message');
      await logger.flush();

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.sessionId).toBeDefined();
      expect(body.logs[0].sessionId).toBe(body.sessionId);
    });
  });

  describe('log statistics', () => {
    it('generates log statistics', async () => {
      const mockLogs = [
        {
          timestamp: Date.now(),
          level: LogLevel.INFO,
          category: LogCategory.GENERAL,
          message: 'Info 1',
        },
        {
          timestamp: Date.now(),
          level: LogLevel.INFO,
          category: LogCategory.NETWORK,
          message: 'Info 2',
        },
        {
          timestamp: Date.now(),
          level: LogLevel.ERROR,
          category: LogCategory.NETWORK,
          message: 'Error 1',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockLogs));

      const stats = await logger.getLogStats();

      expect(stats.total).toBe(3);
      expect(stats.byLevel[LogLevel.INFO]).toBe(2);
      expect(stats.byLevel[LogLevel.ERROR]).toBe(1);
      expect(stats.byCategory[LogCategory.NETWORK]).toBe(2);
      expect(stats.byCategory[LogCategory.GENERAL]).toBe(1);
    });
  });

  describe('export', () => {
    it('exports logs as JSON', async () => {
      const mockLogs = [
        {
          timestamp: Date.now(),
          level: LogLevel.INFO,
          category: LogCategory.GENERAL,
          message: 'Test message',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockLogs));

      const exported = await logger.exportLogs();
      const parsed = JSON.parse(exported);

      expect(parsed).toHaveLength(1);
      expect(parsed[0].message).toBe('Test message');
    });
  });
});
