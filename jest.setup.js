/**
 * Jest Setup File
 *
 * Runs before all tests to configure the testing environment
 */

// Setup MSW for API mocking
import { setupMockServer } from './src/mocks/server';
setupMockServer();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console methods in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Mock React Native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock Expo modules
jest.mock('expo-font');
jest.mock('expo-asset');
jest.mock('expo-constants', () => ({
  expoConfig: {
    version: '1.0.0',
  },
}));

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

// Set test environment variables
process.env.EXPO_PUBLIC_API_URL = 'http://localhost:3000/api';
process.env.NODE_ENV = 'test';
