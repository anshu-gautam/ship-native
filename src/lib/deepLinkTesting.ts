/**
 * Deep Link Testing Utilities
 *
 * Utilities for testing deep links, universal links (iOS), and app links (Android).
 * Supports testing email verification, password reset, social sharing, and custom schemes.
 */

import * as Linking from 'expo-linking';

export interface DeepLinkConfig {
  scheme: string;
  prefix: string;
  domains?: string[];
}

export interface DeepLinkTestCase {
  name: string;
  url: string;
  expectedPath?: string;
  expectedParams?: Record<string, string>;
  description?: string;
}

export interface DeepLinkTestResult {
  passed: boolean;
  testName: string;
  url: string;
  parsedPath?: string;
  parsedParams?: Record<string, any>;
  expectedPath?: string;
  expectedParams?: Record<string, string>;
  error?: string;
}

/**
 * Parse deep link URL
 */
export function parseDeepLink(url: string): {
  path: string;
  params: Record<string, any>;
} | null {
  try {
    const parsed = Linking.parse(url);

    return {
      path: parsed.path || '',
      params: parsed.queryParams || {},
    };
  } catch (error) {
    console.error('[DeepLink] Failed to parse URL:', url, error);
    return null;
  }
}

/**
 * Validate deep link format
 */
export function validateDeepLink(url: string, config: DeepLinkConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check if URL starts with scheme or domain
  const hasScheme = url.startsWith(`${config.scheme}://`);
  const hasDomain = config.domains?.some((domain) => url.startsWith(`https://${domain}`));

  if (!hasScheme && !hasDomain) {
    errors.push(
      `URL must start with scheme "${config.scheme}://" or one of domains: ${config.domains?.join(', ')}`
    );
  }

  // Check URL format (skip validation for custom schemes)
  if (!hasScheme) {
    try {
      new URL(url);
    } catch (error) {
      errors.push('Invalid URL format');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Test a single deep link
 */
export function testDeepLink(
  testCase: DeepLinkTestCase,
  config: DeepLinkConfig
): DeepLinkTestResult {
  const result: DeepLinkTestResult = {
    passed: false,
    testName: testCase.name,
    url: testCase.url,
    expectedPath: testCase.expectedPath,
    expectedParams: testCase.expectedParams,
  };

  // Validate format
  const validation = validateDeepLink(testCase.url, config);
  if (!validation.valid) {
    result.error = validation.errors.join(', ');
    return result;
  }

  // Parse URL
  const parsed = parseDeepLink(testCase.url);
  if (!parsed) {
    result.error = 'Failed to parse URL';
    return result;
  }

  result.parsedPath = parsed.path;
  result.parsedParams = parsed.params;

  // Check path
  if (testCase.expectedPath && parsed.path !== testCase.expectedPath) {
    result.error = `Path mismatch: expected "${testCase.expectedPath}", got "${parsed.path}"`;
    return result;
  }

  // Check params
  if (testCase.expectedParams) {
    for (const [key, expectedValue] of Object.entries(testCase.expectedParams)) {
      const actualValue = parsed.params[key];

      if (actualValue !== expectedValue) {
        result.error = `Param "${key}" mismatch: expected "${expectedValue}", got "${actualValue}"`;
        return result;
      }
    }
  }

  result.passed = true;
  return result;
}

/**
 * Test multiple deep links
 */
export function testDeepLinks(
  testCases: DeepLinkTestCase[],
  config: DeepLinkConfig
): {
  passed: number;
  failed: number;
  total: number;
  results: DeepLinkTestResult[];
} {
  const results = testCases.map((testCase) => testDeepLink(testCase, config));

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return {
    passed,
    failed,
    total: testCases.length,
    results,
  };
}

/**
 * Generate test cases for common deep link patterns
 */
export function generateCommonTestCases(config: DeepLinkConfig): DeepLinkTestCase[] {
  return [
    // Authentication
    {
      name: 'Email Verification',
      url: `${config.scheme}://auth/verify-email?token=abc123&userId=user456`,
      expectedPath: 'auth/verify-email',
      expectedParams: {
        token: 'abc123',
        userId: 'user456',
      },
      description: 'Email verification deep link',
    },
    {
      name: 'Password Reset',
      url: `${config.scheme}://auth/reset-password?token=xyz789`,
      expectedPath: 'auth/reset-password',
      expectedParams: {
        token: 'xyz789',
      },
      description: 'Password reset deep link',
    },
    {
      name: 'Magic Link Login',
      url: `${config.scheme}://auth/magic-link?token=magic123&email=user@example.com`,
      expectedPath: 'auth/magic-link',
      expectedParams: {
        token: 'magic123',
        email: 'user@example.com',
      },
      description: 'Magic link authentication',
    },

    // Content
    {
      name: 'Product Detail',
      url: `${config.scheme}://product/123`,
      expectedPath: 'product/123',
      description: 'Product detail page',
    },
    {
      name: 'User Profile',
      url: `${config.scheme}://profile/johndoe`,
      expectedPath: 'profile/johndoe',
      description: 'User profile page',
    },
    {
      name: 'Article',
      url: `${config.scheme}://article/how-to-get-started`,
      expectedPath: 'article/how-to-get-started',
      description: 'Article page',
    },

    // Actions
    {
      name: 'Share',
      url: `${config.scheme}://share?url=https://example.com&title=Check%20this%20out`,
      expectedPath: 'share',
      expectedParams: {
        url: 'https://example.com',
        title: 'Check this out',
      },
      description: 'Share content',
    },
    {
      name: 'Referral',
      url: `${config.scheme}://referral?code=FRIEND20`,
      expectedPath: 'referral',
      expectedParams: {
        code: 'FRIEND20',
      },
      description: 'Referral link',
    },

    // Notifications
    {
      name: 'Notification',
      url: `${config.scheme}://notification/message-received?messageId=msg789`,
      expectedPath: 'notification/message-received',
      expectedParams: {
        messageId: 'msg789',
      },
      description: 'Push notification deep link',
    },
  ];
}

/**
 * Simulate deep link opening (for testing)
 */
export function simulateDeepLink(url: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          reject(new Error(`Cannot open URL: ${url}`));
          return;
        }

        return Linking.openURL(url);
      })
      .then(() => resolve(true))
      .catch((error) => reject(error));
  });
}

/**
 * Get current deep link URL (for testing)
 */
export async function getCurrentURL(): Promise<string | null> {
  try {
    return await Linking.getInitialURL();
  } catch (error) {
    console.error('[DeepLink] Failed to get initial URL:', error);
    return null;
  }
}

/**
 * Listen for deep link events (for testing)
 */
export function addDeepLinkListener(
  callback: (event: { url: string }) => void
): { remove: () => void } {
  const subscription = Linking.addEventListener('url', callback);

  return {
    remove: () => subscription.remove(),
  };
}

/**
 * Format deep link test results for display
 */
export function formatTestResults(results: DeepLinkTestResult[]): string {
  const lines: string[] = [];

  results.forEach((result, index) => {
    const statusEmoji = result.passed ? '✅' : '❌';

    lines.push('');
    lines.push(`${statusEmoji} Test ${index + 1}: ${result.testName}`);
    lines.push(`   URL: ${result.url}`);

    if (result.parsedPath) {
      lines.push(`   Path: ${result.parsedPath}`);
    }

    if (result.parsedParams && Object.keys(result.parsedParams).length > 0) {
      lines.push(`   Params: ${JSON.stringify(result.parsedParams, null, 2)}`);
    }

    if (!result.passed && result.error) {
      lines.push(`   Error: ${result.error}`);
    }
  });

  return lines.join('\n');
}

/**
 * Generate deep link
 */
export function generateDeepLink(
  path: string,
  params: Record<string, any> = {},
  config: DeepLinkConfig
): string {
  const queryString = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  const url = `${config.scheme}://${path}`;

  return queryString ? `${url}?${queryString}` : url;
}

/**
 * Generate universal link (iOS) or app link (Android)
 */
export function generateUniversalLink(
  path: string,
  params: Record<string, any> = {},
  config: DeepLinkConfig
): string | null {
  if (!config.domains || config.domains.length === 0) {
    console.warn('[DeepLink] No domains configured for universal links');
    return null;
  }

  const domain = config.domains[0];
  const queryString = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  const url = `https://${domain}/${path}`;

  return queryString ? `${url}?${queryString}` : url;
}

/**
 * Deep link test suite
 */
export class DeepLinkTestSuite {
  private config: DeepLinkConfig;
  private testCases: DeepLinkTestCase[] = [];

  constructor(config: DeepLinkConfig) {
    this.config = config;
  }

  /**
   * Add test case
   */
  addTest(testCase: DeepLinkTestCase): void {
    this.testCases.push(testCase);
  }

  /**
   * Add multiple test cases
   */
  addTests(testCases: DeepLinkTestCase[]): void {
    this.testCases.push(...testCases);
  }

  /**
   * Load common test cases
   */
  loadCommonTests(): void {
    const commonTests = generateCommonTestCases(this.config);
    this.addTests(commonTests);
  }

  /**
   * Run all tests
   */
  run(): {
    passed: number;
    failed: number;
    total: number;
    results: DeepLinkTestResult[];
  } {
    return testDeepLinks(this.testCases, this.config);
  }

  /**
   * Get test cases
   */
  getTests(): DeepLinkTestCase[] {
    return this.testCases;
  }

  /**
   * Clear all tests
   */
  clear(): void {
    this.testCases = [];
  }
}

/**
 * Maestro test generator for deep links
 */
export function generateMaestroTest(testCase: DeepLinkTestCase): string {
  const params = testCase.expectedParams || {};
  const paramsStr = Object.entries(params)
    .map(([key, value]) => `    ${key}: ${value}`)
    .join('\n');

  return `# ${testCase.name}
# ${testCase.description || 'Deep link test'}

appId: com.yourcompany.yourapp

---

# Open deep link
- launchApp:
    link: "${testCase.url}"

# Wait for app to process deep link
- waitForAnimationToEnd

# Verify correct screen is displayed
${testCase.expectedPath ? `- assertVisible: "${testCase.expectedPath}"` : '# Add assertions here'}

# Verify parameters are passed correctly
${paramsStr ? `# Expected params:\n${paramsStr}` : '# No params to verify'}

# Take screenshot for verification
- takeScreenshot: ${testCase.name.toLowerCase().replace(/\s+/g, '_')}
`;
}

/**
 * Generate Maestro tests for all test cases
 */
export function generateAllMaestroTests(testCases: DeepLinkTestCase[]): Map<string, string> {
  const tests = new Map<string, string>();

  testCases.forEach((testCase) => {
    const filename = `${testCase.name.toLowerCase().replace(/\s+/g, '_')}.yaml`;
    const content = generateMaestroTest(testCase);
    tests.set(filename, content);
  });

  return tests;
}
