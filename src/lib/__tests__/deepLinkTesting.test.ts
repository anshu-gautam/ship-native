/**
 * Deep Link Testing Utilities Tests
 */

import {
  DeepLinkTestSuite,
  formatTestResults,
  generateAllMaestroTests,
  generateCommonTestCases,
  generateDeepLink,
  generateMaestroTest,
  generateUniversalLink,
  parseDeepLink,
  testDeepLink,
  testDeepLinks,
  validateDeepLink,
} from '../deepLinkTesting';
import type { DeepLinkConfig, DeepLinkTestCase } from '../deepLinkTesting';

// Mock expo-linking
jest.mock('expo-linking', () => ({
  parse: (url: string) => {
    // Simple parser for testing
    try {
      // Handle custom schemes by replacing with https for URL parsing
      let normalizedUrl = url;
      if (url.startsWith('myapp://')) {
        normalizedUrl = url.replace('myapp://', 'https://dummy/');
      }

      const urlObj = new URL(normalizedUrl);
      const params: Record<string, string> = {};

      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });

      // Extract path (remove leading slash and 'dummy/' if present)
      let path = urlObj.pathname.replace(/^\//, '');
      if (path.startsWith('dummy/')) {
        path = path.replace('dummy/', '');
      }

      return {
        path,
        queryParams: params,
      };
    } catch (_error) {
      return {
        path: '',
        queryParams: {},
      };
    }
  },
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  openURL: jest.fn(() => Promise.resolve()),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
}));

describe('DeepLinkTesting', () => {
  const config: DeepLinkConfig = {
    scheme: 'myapp',
    prefix: 'myapp://',
    domains: ['example.com', 'www.example.com'],
  };

  describe('parseDeepLink', () => {
    it('parses simple path', () => {
      const result = parseDeepLink('myapp://home');

      expect(result).toEqual({
        path: 'home',
        params: {},
      });
    });

    it('parses path with query params', () => {
      const result = parseDeepLink('myapp://product/123?color=red&size=large');

      expect(result?.path).toBe('product/123');
      expect(result?.params).toEqual({
        color: 'red',
        size: 'large',
      });
    });

    it('parses nested path', () => {
      const result = parseDeepLink('myapp://category/electronics/phones');

      expect(result?.path).toBe('category/electronics/phones');
    });

    it('handles URL encoded params', () => {
      const result = parseDeepLink(
        'myapp://share?url=https%3A%2F%2Fexample.com&title=Hello%20World'
      );

      expect(result?.params).toEqual({
        url: 'https://example.com',
        title: 'Hello World',
      });
    });
  });

  describe('validateDeepLink', () => {
    it('validates correct scheme', () => {
      const result = validateDeepLink('myapp://home', config);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('validates universal link domain', () => {
      const result = validateDeepLink('https://example.com/home', config);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fails for wrong scheme', () => {
      const result = validateDeepLink('wrongapp://home', config);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('fails for wrong domain', () => {
      const result = validateDeepLink('https://wrongdomain.com/home', config);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('testDeepLink', () => {
    it('passes for matching path', () => {
      const testCase: DeepLinkTestCase = {
        name: 'Home',
        url: 'myapp://home',
        expectedPath: 'home',
      };

      const result = testDeepLink(testCase, config);

      expect(result.passed).toBe(true);
      expect(result.parsedPath).toBe('home');
    });

    it('passes for matching params', () => {
      const testCase: DeepLinkTestCase = {
        name: 'Product',
        url: 'myapp://product?id=123&color=red',
        expectedParams: {
          id: '123',
          color: 'red',
        },
      };

      const result = testDeepLink(testCase, config);

      expect(result.passed).toBe(true);
      expect(result.parsedParams).toEqual({
        id: '123',
        color: 'red',
      });
    });

    it('fails for path mismatch', () => {
      const testCase: DeepLinkTestCase = {
        name: 'Home',
        url: 'myapp://about',
        expectedPath: 'home',
      };

      const result = testDeepLink(testCase, config);

      expect(result.passed).toBe(false);
      expect(result.error).toContain('Path mismatch');
    });

    it('fails for param mismatch', () => {
      const testCase: DeepLinkTestCase = {
        name: 'Product',
        url: 'myapp://product?id=123&color=blue',
        expectedParams: {
          color: 'red',
        },
      };

      const result = testDeepLink(testCase, config);

      expect(result.passed).toBe(false);
      expect(result.error).toContain('Param "color" mismatch');
    });
  });

  describe('testDeepLinks', () => {
    it('tests multiple deep links', () => {
      const testCases: DeepLinkTestCase[] = [
        {
          name: 'Home',
          url: 'myapp://home',
          expectedPath: 'home',
        },
        {
          name: 'About',
          url: 'myapp://about',
          expectedPath: 'about',
        },
      ];

      const result = testDeepLinks(testCases, config);

      expect(result.total).toBe(2);
      expect(result.passed).toBe(2);
      expect(result.failed).toBe(0);
    });

    it('counts failures correctly', () => {
      const testCases: DeepLinkTestCase[] = [
        {
          name: 'Passing',
          url: 'myapp://home',
          expectedPath: 'home',
        },
        {
          name: 'Failing',
          url: 'myapp://about',
          expectedPath: 'wrong',
        },
      ];

      const result = testDeepLinks(testCases, config);

      expect(result.total).toBe(2);
      expect(result.passed).toBe(1);
      expect(result.failed).toBe(1);
    });
  });

  describe('generateCommonTestCases', () => {
    it('generates email verification test', () => {
      const testCases = generateCommonTestCases(config);

      const emailVerification = testCases.find((t) => t.name === 'Email Verification');

      expect(emailVerification).toBeDefined();
      expect(emailVerification?.expectedPath).toBe('auth/verify-email');
      expect(emailVerification?.expectedParams).toHaveProperty('token');
      expect(emailVerification?.expectedParams).toHaveProperty('userId');
    });

    it('generates password reset test', () => {
      const testCases = generateCommonTestCases(config);

      const passwordReset = testCases.find((t) => t.name === 'Password Reset');

      expect(passwordReset).toBeDefined();
      expect(passwordReset?.expectedPath).toBe('auth/reset-password');
    });

    it('generates product detail test', () => {
      const testCases = generateCommonTestCases(config);

      const productDetail = testCases.find((t) => t.name === 'Product Detail');

      expect(productDetail).toBeDefined();
      expect(productDetail?.expectedPath).toBe('product/123');
    });

    it('generates all common test cases', () => {
      const testCases = generateCommonTestCases(config);

      expect(testCases.length).toBeGreaterThan(0);
      expect(testCases.every((t) => t.name && t.url)).toBe(true);
    });
  });

  describe('formatTestResults', () => {
    it('formats passing test results', () => {
      const results = [
        {
          passed: true,
          testName: 'Home',
          url: 'myapp://home',
          parsedPath: 'home',
          parsedParams: {},
        },
      ];

      const formatted = formatTestResults(results);

      expect(formatted).toContain('✅');
      expect(formatted).toContain('Home');
      expect(formatted).toContain('myapp://home');
    });

    it('formats failing test results', () => {
      const results = [
        {
          passed: false,
          testName: 'Home',
          url: 'myapp://home',
          parsedPath: 'home',
          parsedParams: {},
          error: 'Path mismatch',
        },
      ];

      const formatted = formatTestResults(results);

      expect(formatted).toContain('❌');
      expect(formatted).toContain('Error: Path mismatch');
    });

    it('includes params in output', () => {
      const results = [
        {
          passed: true,
          testName: 'Product',
          url: 'myapp://product?id=123',
          parsedPath: 'product',
          parsedParams: { id: '123' },
        },
      ];

      const formatted = formatTestResults(results);

      expect(formatted).toContain('Params:');
      expect(formatted).toContain('id');
    });
  });

  describe('generateDeepLink', () => {
    it('generates simple deep link', () => {
      const url = generateDeepLink('home', {}, config);

      expect(url).toBe('myapp://home');
    });

    it('generates deep link with params', () => {
      const url = generateDeepLink('product', { id: '123', color: 'red' }, config);

      expect(url).toContain('myapp://product');
      expect(url).toContain('id=123');
      expect(url).toContain('color=red');
    });

    it('encodes special characters', () => {
      const url = generateDeepLink(
        'share',
        { url: 'https://example.com', title: 'Hello World' },
        config
      );

      expect(url).toContain('url=https%3A%2F%2Fexample.com');
      expect(url).toContain('title=Hello%20World');
    });
  });

  describe('generateUniversalLink', () => {
    it('generates universal link', () => {
      const url = generateUniversalLink('home', {}, config);

      expect(url).toBe('https://example.com/home');
    });

    it('generates universal link with params', () => {
      const url = generateUniversalLink('product', { id: '123' }, config);

      expect(url).toContain('https://example.com/product');
      expect(url).toContain('id=123');
    });

    it('returns null when no domains configured', () => {
      const configNoDomain: DeepLinkConfig = {
        scheme: 'myapp',
        prefix: 'myapp://',
      };

      const url = generateUniversalLink('home', {}, configNoDomain);

      expect(url).toBeNull();
    });
  });

  describe('DeepLinkTestSuite', () => {
    let suite: DeepLinkTestSuite;

    beforeEach(() => {
      suite = new DeepLinkTestSuite(config);
    });

    it('adds test case', () => {
      suite.addTest({
        name: 'Home',
        url: 'myapp://home',
        expectedPath: 'home',
      });

      expect(suite.getTests()).toHaveLength(1);
    });

    it('adds multiple test cases', () => {
      suite.addTests([
        { name: 'Home', url: 'myapp://home' },
        { name: 'About', url: 'myapp://about' },
      ]);

      expect(suite.getTests()).toHaveLength(2);
    });

    it('loads common tests', () => {
      suite.loadCommonTests();

      expect(suite.getTests().length).toBeGreaterThan(0);
    });

    it('runs all tests', () => {
      suite.addTests([
        { name: 'Home', url: 'myapp://home', expectedPath: 'home' },
        { name: 'About', url: 'myapp://about', expectedPath: 'about' },
      ]);

      const result = suite.run();

      expect(result.total).toBe(2);
      expect(result.passed).toBe(2);
    });

    it('clears tests', () => {
      suite.addTest({ name: 'Home', url: 'myapp://home' });
      suite.clear();

      expect(suite.getTests()).toHaveLength(0);
    });
  });

  describe('generateMaestroTest', () => {
    it('generates maestro test YAML', () => {
      const testCase: DeepLinkTestCase = {
        name: 'Email Verification',
        url: 'myapp://auth/verify-email?token=abc123',
        expectedPath: 'auth/verify-email',
        expectedParams: { token: 'abc123' },
        description: 'Test email verification flow',
      };

      const yaml = generateMaestroTest(testCase);

      expect(yaml).toContain('Email Verification');
      expect(yaml).toContain('myapp://auth/verify-email?token=abc123');
      expect(yaml).toContain('launchApp');
      expect(yaml).toContain('link:');
    });

    it('includes expected path assertion', () => {
      const testCase: DeepLinkTestCase = {
        name: 'Home',
        url: 'myapp://home',
        expectedPath: 'home',
      };

      const yaml = generateMaestroTest(testCase);

      expect(yaml).toContain('assertVisible');
      expect(yaml).toContain('home');
    });
  });

  describe('generateAllMaestroTests', () => {
    it('generates tests for all cases', () => {
      const testCases: DeepLinkTestCase[] = [
        { name: 'Home', url: 'myapp://home' },
        { name: 'About', url: 'myapp://about' },
      ];

      const tests = generateAllMaestroTests(testCases);

      expect(tests.size).toBe(2);
      expect(tests.has('home.yaml')).toBe(true);
      expect(tests.has('about.yaml')).toBe(true);
    });

    it('generates valid YAML content', () => {
      const testCases: DeepLinkTestCase[] = [{ name: 'Test Case', url: 'myapp://test' }];

      const tests = generateAllMaestroTests(testCases);
      const yaml = tests.get('test_case.yaml');

      expect(yaml).toBeDefined();
      expect(yaml).toContain('appId:');
      expect(yaml).toContain('launchApp');
    });
  });
});
