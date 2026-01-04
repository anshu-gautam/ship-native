# PostHog Analytics Usage Guide

## Setup

### 1. Environment Variables

Add to your `.env` file:

```env
EXPO_PUBLIC_POSTHOG_API_KEY=your_posthog_api_key_here
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 2. Initialize PostHog

In your app's root layout file (e.g., `app/_layout.tsx`):

```typescript
import { useEffect } from 'react';
import { initializePostHog } from '@/services/analytics';

export default function RootLayout() {
  useEffect(() => {
    initializePostHog();
  }, []);

  return (
    // Your app layout
  );
}
```

## Usage Examples

### Track Custom Events

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

function MyComponent() {
  const { trackEvent, AnalyticsEvents } = useAnalytics();

  const handleButtonClick = () => {
    trackEvent(AnalyticsEvents.BUTTON_CLICKED, {
      button_name: 'Get Started',
      screen: 'Home',
    });
  };

  return <Button onPress={handleButtonClick} title="Get Started" />;
}
```

### Identify Users

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

function ProfileScreen() {
  const { identifyUser, setUserProperties } = useAnalytics();

  useEffect(() => {
    if (user) {
      identifyUser(user.id, {
        email: user.email,
        name: user.name,
        plan: user.subscription.plan,
      });
    }
  }, [user]);

  return // Your component
}
```

### Track Screen Views

```typescript
import { useScreenTracking } from '@/hooks/useAnalytics';

function ProductDetailScreen({ productId }) {
  useScreenTracking('Product Detail', {
    product_id: productId,
  });

  return // Your component
}
```

### Use Feature Flags

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

function FeatureComponent() {
  const { isFeatureFlagEnabled } = useAnalytics();
  const [showNewUI, setShowNewUI] = useState(false);

  useEffect(() => {
    isFeatureFlagEnabled('new-ui-redesign').then(setShowNewUI);
  }, []);

  return showNewUI ? <NewUI /> : <OldUI />;
}
```

### Reset User (on Logout)

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

function LogoutButton() {
  const { resetUser } = useAnalytics();

  const handleLogout = async () => {
    await logout();
    resetUser(); // Clear PostHog user identity
  };

  return <Button onPress={handleLogout} title="Logout" />;
}
```

## Best Practices

1. **Event Naming**: Use the predefined `AnalyticsEvents` constants for consistency
2. **Properties**: Keep property names consistent and lowercase with underscores
3. **User Privacy**: Respect user privacy and comply with GDPR/regulations
4. **Error Tracking**: Track errors for debugging and monitoring
5. **Performance**: PostHog batches events automatically, but you can call `flushEvents()` before critical operations

## Common Events to Track

- User authentication (signup, login, logout)
- Feature usage
- Errors and exceptions
- User interactions (button clicks, form submissions)
- Navigation (screen views, tab changes)
- Business events (purchases, subscriptions, etc.)
