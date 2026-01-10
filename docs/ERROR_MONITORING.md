# Error Monitoring with Sentry

This boilerplate includes production-ready error monitoring and crash reporting using Sentry.

## Features

- **Automatic Error Tracking**: Catches and reports uncaught errors and promise rejections
- **React Error Boundaries**: Gracefully handles component errors with fallback UI
- **Performance Monitoring**: Tracks app performance and navigation
- **Release Tracking**: Correlates errors with specific app versions and builds
- **Source Maps**: Automatically uploads source maps for readable stack traces
- **User Context**: Track which users are affected by errors
- **Breadcrumbs**: See user actions leading up to errors
- **Environment Separation**: Different tracking for dev, preview, and production

## Setup

### 1. Create a Sentry Account

1. Sign up at [sentry.io](https://sentry.io)
2. Create a new project for React Native
3. Copy your DSN (Data Source Name)

### 2. Configure Environment Variables

Add to your `.env.production` (and `.env.preview` if needed):

```bash
# Sentry Error Monitoring
EXPO_PUBLIC_SENTRY_DSN=https://your_sentry_dsn@o000000.ingest.sentry.io/0000000
SENTRY_DSN=https://your_sentry_dsn@o000000.ingest.sentry.io/0000000

# App Configuration
EXPO_PUBLIC_APP_ENV=production
```

### 3. Update Sentry Organization and Project

Update these files with your Sentry organization and project slug:

**app.json**:
```json
{
  "expo": {
    "plugins": [
      [
        "@sentry/react-native/expo",
        {
          "organization": "your-sentry-org",
          "project": "your-sentry-project"
        }
      ]
    ]
  }
}
```

**eas.json**:
```json
{
  "build": {
    "preview": {
      "env": {
        "SENTRY_ORG": "your-sentry-org",
        "SENTRY_PROJECT": "your-sentry-project"
      }
    },
    "production": {
      "env": {
        "SENTRY_ORG": "your-sentry-org",
        "SENTRY_PROJECT": "your-sentry-project"
      }
    }
  }
}
```

### 4. Configure Sentry Auth Token

For source map uploads, you need a Sentry auth token:

1. Go to Sentry → Settings → Account → API → Auth Tokens
2. Create a new token with `project:releases` and `project:write` scopes
3. Add to your EAS secrets:

```bash
eas secret:create --scope project --name SENTRY_AUTH_TOKEN --value your_auth_token_here
```

### 5. Build Your App

When building with EAS, source maps will be automatically uploaded:

```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

## Usage

### Automatic Error Tracking

Errors are automatically caught and reported:

```typescript
// This error will be automatically caught and sent to Sentry
throw new Error('Something went wrong!');
```

### Manual Error Reporting

```typescript
import { reportError, reportMessage } from '@/lib/errorHandler';

// Report an error with context
try {
  await fetchUserData(userId);
} catch (error) {
  reportError(error as Error, {
    tags: { feature: 'user-profile' },
    extra: { userId },
    level: 'error'
  });
}

// Report a message (non-error event)
reportMessage('User completed onboarding', {
  level: 'info',
  tags: { feature: 'onboarding' },
  extra: { userId, completedSteps: 5 }
});
```

### Using Sentry Helper Functions

```typescript
import { logError, logMessage, setUserContext, clearUserContext, addBreadcrumb } from '@/lib/sentry';

// Log an error with context
logError(new Error('Payment failed'), {
  userId: user.id,
  amount: 99.99
});

// Log a message
logMessage('User viewed premium features', 'info');

// Set user context (useful after login)
setUserContext({
  id: user.id,
  email: user.email,
  username: user.username
});

// Clear user context (on logout)
clearUserContext();

// Add custom breadcrumb
addBreadcrumb({
  category: 'navigation',
  message: 'User navigated to settings',
  level: 'info'
});
```

### Error Boundary Component

Wrap components with ErrorBoundary to catch React errors:

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary name="Payment Flow">
      <PaymentScreen />
    </ErrorBoundary>
  );
}
```

Custom fallback UI:

```typescript
<ErrorBoundary
  name="User Profile"
  fallback={(error, resetError) => (
    <View>
      <Text>Failed to load profile</Text>
      <Button onPress={resetError} title="Retry" />
    </View>
  )}
  onError={(error, errorInfo) => {
    console.log('Profile error:', error);
  }}
>
  <ProfileScreen />
</ErrorBoundary>
```

## Configuration

### Release Tracking

Releases are automatically tracked using this format:
```
{bundleId}@{version}+{buildNumber}
```

Example: `com.yourcompany.app@1.0.0+42`

### Sample Rates

Configured in `src/lib/sentry.ts`:

- **Production**: 20% of transactions (to reduce quota usage)
- **Development**: 100% of transactions (disabled in beforeSend)

### Environments

- `development`: Sentry disabled, errors only logged to console
- `preview`: Sentry enabled, full tracking
- `production`: Sentry enabled, full tracking

### Breadcrumbs

- **Max breadcrumbs**: 50
- **Filtered**: Console breadcrumbs are filtered out for privacy

### Performance Monitoring

- **Navigation tracking**: Automatically tracks route changes
- **Network requests**: Tracks requests to configured API endpoints
- **Custom spans**: Available via Sentry SDK

## Best Practices

### 1. Set User Context After Login

```typescript
import { setUserContext } from '@/lib/sentry';

async function handleLogin(user) {
  // After successful login
  setUserContext({
    id: user.id,
    email: user.email,
    username: user.username
  });
}
```

### 2. Clear User Context on Logout

```typescript
import { clearUserContext } from '@/lib/sentry';

async function handleLogout() {
  clearUserContext();
  // Rest of logout logic
}
```

### 3. Add Context to Errors

```typescript
import { reportError } from '@/lib/errorHandler';

try {
  await processPayment(amount);
} catch (error) {
  reportError(error as Error, {
    tags: {
      feature: 'payments',
      paymentMethod: 'card'
    },
    extra: {
      amount,
      currency: 'USD',
      userId: currentUser.id
    }
  });
}
```

### 4. Use Breadcrumbs for User Actions

```typescript
import { addBreadcrumb } from '@/lib/sentry';

function onButtonPress() {
  addBreadcrumb({
    category: 'user-action',
    message: 'User clicked checkout button',
    level: 'info',
    data: { cartTotal: 99.99 }
  });
}
```

### 5. Filter Sensitive Data

The boilerplate already filters:
- Development environment errors
- Console breadcrumbs

Add more filters in `beforeSend` and `beforeBreadcrumb` hooks in `src/lib/sentry.ts`.

## Troubleshooting

### Source Maps Not Uploading

1. Verify `SENTRY_AUTH_TOKEN` is set in EAS secrets
2. Check `SENTRY_ORG` and `SENTRY_PROJECT` match your Sentry project
3. Ensure you're building with `preview` or `production` profile
4. Check build logs for Sentry upload errors

### Errors Not Appearing in Sentry

1. Verify `EXPO_PUBLIC_SENTRY_DSN` is set correctly
2. Check you're not in development mode (`APP_ENV=development` disables Sentry)
3. Verify the error isn't being caught and swallowed
4. Check Sentry quota limits

### Duplicate Errors

If you see the same error reported multiple times, it might be due to:
- Both global error handler and error boundary catching it
- Error occurring in a component that re-renders frequently

Consider adjusting your error boundaries or error reporting logic.

## Resources

- [Sentry React Native Docs](https://docs.sentry.io/platforms/react-native/)
- [Sentry Expo Docs](https://docs.sentry.io/platforms/react-native/manual-setup/expo/)
- [Sentry Error Tracking Best Practices](https://docs.sentry.io/product/issues/)
- [Performance Monitoring](https://docs.sentry.io/platforms/react-native/performance/)

## Files

- `src/lib/sentry.ts` - Sentry initialization and helpers
- `src/lib/errorHandler.ts` - Global error handlers
- `src/components/ErrorBoundary.tsx` - React error boundary
- `app/_layout.tsx` - Sentry initialization call
- `app.json` - Sentry plugin configuration
- `eas.json` - Source map upload configuration
