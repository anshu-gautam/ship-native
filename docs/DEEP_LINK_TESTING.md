# Deep Link Testing Guide

Complete guide to testing deep links, universal links (iOS), and app links (Android) in your React Native app.

## Overview

Deep links allow users to navigate directly to specific content in your app from external sources like emails, websites, push notifications, and other apps. This guide covers testing all types of deep links comprehensively.

## Quick Start

```typescript
import { DeepLinkTestSuite } from '@/lib/deepLinkTesting';

// Configure your deep link scheme
const config = {
  scheme: 'myapp',
  prefix: 'myapp://',
  domains: ['example.com', 'www.example.com'],
};

// Create test suite
const suite = new DeepLinkTestSuite(config);

// Load common test cases
suite.loadCommonTests();

// Run tests
const results = suite.run();

console.log(`Passed: ${results.passed}/${results.total}`);
console.log(`Failed: ${results.failed}/${results.total}`);
```

## Deep Link Types

### 1. Custom URL Schemes

Basic deep links using your app's custom scheme:

```
myapp://home
myapp://product/123
myapp://auth/verify-email?token=abc123
```

**Platform Support:** iOS, Android
**Reliability:** Good for app-to-app, but requires app installed

### 2. Universal Links (iOS)

HTTPS URLs that open your app when installed:

```
https://example.com/home
https://example.com/product/123
```

**Platform:** iOS only
**Reliability:** Best - graceful fallback to web

### 3. App Links (Android)

Android's equivalent of universal links:

```
https://example.com/home
https://example.com/product/123
```

**Platform:** Android only
**Reliability:** Best - graceful fallback to web

## Configuration

### App Configuration

**app.json:**
```json
{
  "expo": {
    "scheme": "myapp",
    "ios": {
      "associatedDomains": ["applinks:example.com"]
    },
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "https",
              "host": "example.com"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

### Test Configuration

```typescript
import { DeepLinkConfig } from '@/lib/deepLinkTesting';

const config: DeepLinkConfig = {
  scheme: 'myapp',              // Your app's custom scheme
  prefix: 'myapp://',           // Prefix for custom scheme
  domains: [                    // Domains for universal/app links
    'example.com',
    'www.example.com'
  ],
};
```

## Testing Deep Links

### Manual Testing

#### Test Individual Deep Link

```typescript
import { testDeepLink } from '@/lib/deepLinkTesting';

const testCase = {
  name: 'Product Detail',
  url: 'myapp://product/123',
  expectedPath: 'product/123',
};

const result = testDeepLink(testCase, config);

if (result.passed) {
  console.log('✅ Test passed');
} else {
  console.log('❌ Test failed:', result.error);
}
```

#### Test Multiple Deep Links

```typescript
import { testDeepLinks } from '@/lib/deepLinkTesting';

const testCases = [
  {
    name: 'Home',
    url: 'myapp://home',
    expectedPath: 'home',
  },
  {
    name: 'Email Verification',
    url: 'myapp://auth/verify-email?token=abc123&userId=user456',
    expectedPath: 'auth/verify-email',
    expectedParams: {
      token: 'abc123',
      userId: 'user456',
    },
  },
];

const results = testDeepLinks(testCases, config);

console.log(`Passed: ${results.passed}/${results.total}`);
results.results.forEach(result => {
  console.log(`${result.passed ? '✅' : '❌'} ${result.testName}`);
});
```

### Using Test Suite

```typescript
import { DeepLinkTestSuite } from '@/lib/deepLinkTesting';

const suite = new DeepLinkTestSuite(config);

// Add custom test cases
suite.addTest({
  name: 'Custom Feature',
  url: 'myapp://custom/feature?param=value',
  expectedPath: 'custom/feature',
  expectedParams: { param: 'value' },
});

// Load common test cases (auth, sharing, etc.)
suite.loadCommonTests();

// Run all tests
const results = suite.run();

// Format results for display
const formatted = formatTestResults(results.results);
console.log(formatted);
```

## Common Test Cases

The library includes pre-built test cases for common scenarios:

### Authentication

```typescript
// Email Verification
myapp://auth/verify-email?token=abc123&userId=user456

// Password Reset
myapp://auth/reset-password?token=xyz789

// Magic Link Login
myapp://auth/magic-link?token=magic123&email=user@example.com
```

### Content

```typescript
// Product Detail
myapp://product/123

// User Profile
myapp://profile/johndoe

// Article
myapp://article/how-to-get-started
```

### Actions

```typescript
// Share
myapp://share?url=https://example.com&title=Check%20this%20out

// Referral
myapp://referral?code=FRIEND20
```

### Notifications

```typescript
// Notification
myapp://notification/message-received?messageId=msg789
```

## Parsing Deep Links

```typescript
import { parseDeepLink } from '@/lib/deepLinkTesting';

const parsed = parseDeepLink('myapp://product/123?color=red&size=large');

console.log(parsed?.path);    // "product/123"
console.log(parsed?.params);  // { color: "red", size: "large" }
```

## Validating Deep Links

```typescript
import { validateDeepLink } from '@/lib/deepLinkTesting';

const validation = validateDeepLink('myapp://home', config);

if (validation.valid) {
  console.log('✅ Valid deep link');
} else {
  console.log('❌ Invalid:', validation.errors.join(', '));
}
```

## Generating Deep Links

### Custom Scheme

```typescript
import { generateDeepLink } from '@/lib/deepLinkTesting';

const url = generateDeepLink(
  'product',
  { id: '123', color: 'red' },
  config
);

// Result: "myapp://product?id=123&color=red"
```

### Universal Link

```typescript
import { generateUniversalLink } from '@/lib/deepLinkTesting';

const url = generateUniversalLink(
  'product',
  { id: '123', color: 'red' },
  config
);

// Result: "https://example.com/product?id=123&color=red"
```

## Maestro E2E Testing

Generate Maestro test flows for deep links:

```typescript
import { generateMaestroTest } from '@/lib/deepLinkTesting';

const testCase = {
  name: 'Email Verification',
  url: 'myapp://auth/verify-email?token=abc123',
  expectedPath: 'auth/verify-email',
  description: 'Test email verification flow',
};

const yaml = generateMaestroTest(testCase);

// Save to .maestro/deep-links/email-verification.yaml
```

Generated Maestro YAML:

```yaml
# Email Verification
# Test email verification flow

appId: com.yourcompany.yourapp

---

# Open deep link
- launchApp:
    link: "myapp://auth/verify-email?token=abc123"

# Wait for app to process deep link
- waitForAnimationToEnd

# Verify correct screen is displayed
- assertVisible: "auth/verify-email"

# Take screenshot for verification
- takeScreenshot: email_verification
```

### Generate All Maestro Tests

```typescript
import { generateAllMaestroTests } from '@/lib/deepLinkTesting';

const testCases = [
  { name: 'Home', url: 'myapp://home', expectedPath: 'home' },
  { name: 'Product', url: 'myapp://product/123' },
];

const tests = generateAllMaestroTests(testCases);

// Save each test
tests.forEach((yaml, filename) => {
  fs.writeFileSync(`.maestro/deep-links/${filename}`, yaml);
});
```

## Jest Integration

```typescript
// __tests__/deepLinks.test.ts

import { testDeepLink } from '@/lib/deepLinkTesting';

describe('Deep Links', () => {
  const config = {
    scheme: 'myapp',
    prefix: 'myapp://',
    domains: ['example.com'],
  };

  it('handles email verification link', () => {
    const result = testDeepLink(
      {
        name: 'Email Verification',
        url: 'myapp://auth/verify-email?token=abc123',
        expectedPath: 'auth/verify-email',
        expectedParams: { token: 'abc123' },
      },
      config
    );

    expect(result.passed).toBe(true);
  });

  it('handles product detail link', () => {
    const result = testDeepLink(
      {
        name: 'Product',
        url: 'myapp://product/123',
        expectedPath: 'product/123',
      },
      config
    );

    expect(result.passed).toBe(true);
  });
});
```

## Real Device Testing

### iOS

**Terminal:**
```bash
xcrun simctl openurl booted "myapp://home"
xcrun simctl openurl booted "https://example.com/home"
```

**Safari:**
1. Open Safari on device/simulator
2. Enter deep link in address bar
3. Tap "Open in App"

**adb (for testing app links):**
```bash
adb shell am start -W -a android.intent.action.VIEW \
  -d "https://example.com/home" com.yourcompany.yourapp
```

### Android

**Terminal:**
```bash
adb shell am start -W -a android.intent.action.VIEW \
  -d "myapp://home" com.yourcompany.yourapp

adb shell am start -W -a android.intent.action.VIEW \
  -d "https://example.com/home" com.yourcompany.yourapp
```

**Chrome:**
1. Open Chrome on device/emulator
2. Enter deep link in address bar
3. Tap "Open in App"

## Debugging

### Enable Deep Link Logging

```typescript
import { parseDeepLink, validateDeepLink } from '@/lib/deepLinkTesting';

// Parse and log
const parsed = parseDeepLink('myapp://product/123');
console.log('[DeepLink] Parsed:', parsed);

// Validate and log
const validation = validateDeepLink('myapp://product/123', config);
console.log('[DeepLink] Valid:', validation.valid);
if (!validation.valid) {
  console.log('[DeepLink] Errors:', validation.errors);
}
```

### Check Deep Link Registration

**iOS:**
```bash
# Check if universal links are working
swcutil show --all
```

**Android:**
```bash
# Check if app links are verified
adb shell pm get-app-links com.yourcompany.yourapp
```

## Common Issues

### Issue 1: Deep Link Not Opening App

**Causes:**
- App not installed
- Scheme not registered
- Universal link not verified

**Solutions:**
- Verify `app.json` configuration
- Check iOS Associated Domains
- Verify Android Intent Filters
- Test with `adb` or `xcrun`

### Issue 2: Wrong Screen Displayed

**Causes:**
- Incorrect navigation logic
- Path parsing issue
- Parameter missing

**Solutions:**
```typescript
// Debug parsing
const parsed = parseDeepLink(url);
console.log('Path:', parsed?.path);
console.log('Params:', parsed?.params);

// Verify expected vs actual
const result = testDeepLink(testCase, config);
console.log('Expected path:', result.expectedPath);
console.log('Actual path:', result.parsedPath);
```

### Issue 3: Parameters Not Working

**Causes:**
- URL encoding issues
- Parameter name mismatch
- Type conversion issues

**Solutions:**
```typescript
// URL encode special characters
const url = generateDeepLink(
  'share',
  { url: 'https://example.com', title: 'Hello World' },
  config
);
// Result: myapp://share?url=https%3A%2F%2Fexample.com&title=Hello%20World

// Test parameter matching
const result = testDeepLink(
  {
    name: 'Share',
    url,
    expectedParams: {
      url: 'https://example.com',
      title: 'Hello World',
    },
  },
  config
);
```

## Best Practices

### Do's

✅ Test all deep link scenarios before release
✅ Use meaningful, RESTful paths
✅ Validate parameters before navigation
✅ Handle missing or invalid parameters gracefully
✅ Provide fallback behavior
✅ Log deep link events for debugging
✅ Test on real devices
✅ Test universal/app links in production
✅ Document all deep link patterns
✅ Use consistent naming conventions

### Don'ts

❌ Don't hardcode URLs
❌ Don't skip validation
❌ Don't expose sensitive data in URLs
❌ Don't forget to test edge cases
❌ Don't ignore URL encoding
❌ Don't assume parameters exist
❌ Don't forget error handling
❌ Don't skip universal link setup
❌ Don't test only on simulator
❌ Don't change deep link structure without versioning

## Testing Checklist

Before releasing:

- [ ] All deep link types tested (custom, universal, app links)
- [ ] Authentication flows (email verification, password reset)
- [ ] Content links (products, profiles, articles)
- [ ] Sharing and referral links
- [ ] Notification deep links
- [ ] Parameter parsing works correctly
- [ ] URL encoding handled properly
- [ ] Error cases handled gracefully
- [ ] Fallback behavior implemented
- [ ] Tested on iOS simulator
- [ ] Tested on iOS real device
- [ ] Tested on Android emulator
- [ ] Tested on Android real device
- [ ] Universal links verified (iOS)
- [ ] App links verified (Android)
- [ ] Deep link analytics tracking
- [ ] Documentation updated

## Analytics Integration

Track deep link usage:

```typescript
import { parseDeepLink } from '@/lib/deepLinkTesting';
import analytics from '@/services/analytics';

const parsed = parseDeepLink(url);

if (parsed) {
  analytics.track('Deep Link Opened', {
    path: parsed.path,
    params: parsed.params,
    source: parsed.params.utm_source,
    campaign: parsed.params.utm_campaign,
  });
}
```

## Resources

- [React Native Linking](https://reactnative.dev/docs/linking)
- [Expo Linking](https://docs.expo.dev/guides/linking/)
- [iOS Universal Links](https://developer.apple.com/ios/universal-links/)
- [Android App Links](https://developer.android.com/training/app-links)
- [Branch.io Deep Linking](https://branch.io/resources/deep-linking/)

---

**Last Updated:** 2025-01-15
**Maintainer:** Development Team
