# Feature Flags

Complete guide for managing feature flags in your React Native app.

## Overview

Feature flags allow you to:
- **Toggle features** without deploying new code
- **Gradual rollouts** with percentage-based releases
- **A/B testing** for different user segments
- **User targeting** by ID or email
- **Debug overrides** during development

## Features

- 🚀 **Local & Remote Flags** - Default flags + API-based flags
- 🎯 **User Targeting** - Enable for specific users or emails
- 📊 **Percentage Rollouts** - Gradual feature releases (0-100%)
- 🔧 **Debug Overrides** - Test flags in development
- 💾 **Caching** - Offline support with cached flags
- ⚡ **React Hooks** - Reactive flag updates

## Installation

Already set up! Feature flags are ready to use.

**Files:**
- `src/lib/featureFlags.ts` - Feature flags manager
- `src/lib/__tests__/featureFlags.test.ts` - Unit tests

## Basic Usage

### Check if Feature is Enabled

```tsx
import { featureFlags } from '@/lib/featureFlags';

function MyComponent() {
  const isDarkModeEnabled = featureFlags.isEnabled('darkMode');

  return (
    <View>
      {isDarkModeEnabled ? (
        <DarkTheme />
      ) : (
        <LightTheme />
      )}
    </View>
  );
}
```

### Using the React Hook

```tsx
import { useFeatureFlag } from '@/lib/featureFlags';

function MyComponent() {
  const showNewDesign = useFeatureFlag('newDesign');

  return showNewDesign ? <NewDesign /> : <OldDesign />;
}
```

### Conditional Rendering

```tsx
import { featureFlags } from '@/lib/featureFlags';

function SettingsScreen() {
  return (
    <View>
      <GeneralSettings />

      {featureFlags.isEnabled('premiumFeatures') && (
        <PremiumSettings />
      )}

      {featureFlags.isEnabled('aiChat') && (
        <AIChatSettings />
      )}
    </View>
  );
}
```

## Configuration

### Initialize on App Launch

**App.tsx:**
```tsx
import { featureFlags } from '@/lib/featureFlags';
import { useAuth } from '@/hooks/useAuth';

export default function App() {
  const { user } = useAuth();

  useEffect(() => {
    // Configure with user info
    featureFlags.configure({
      apiEndpoint: 'https://api.yourapp.com/feature-flags',
      userId: user?.id,
      userEmail: user?.email,
      allowDebugOverrides: __DEV__,
    });

    // Fetch remote flags
    featureFlags.fetchRemoteFlags();
  }, [user]);

  return <YourApp />;
}
```

## Defining Flags

### Local Flags

Edit `src/lib/featureFlags.ts`:

```tsx
private defaultFlags: Record<string, FeatureFlag> = {
  myNewFeature: {
    key: 'myNewFeature',
    name: 'My New Feature',
    description: 'Enable the amazing new feature',
    enabled: true,  // Enabled for all users
  },

  experimentalUI: {
    key: 'experimentalUI',
    name: 'Experimental UI',
    description: 'Try the new experimental UI',
    enabled: true,
    enabledForPercentage: 20,  // 20% rollout
  },

  betaFeatures: {
    key: 'betaFeatures',
    name: 'Beta Features',
    description: 'Early access features',
    enabled: true,
    enabledForUserIds: ['user-123', 'user-456'],  // Specific users
  },

  vipMode: {
    key: 'vipMode',
    name: 'VIP Mode',
    description: 'VIP-only features',
    enabled: true,
    enabledForEmails: ['vip@example.com'],  // Specific emails
  },
};
```

### Remote Flags

**API Response Format:**
```json
{
  "newCheckout": {
    "key": "newCheckout",
    "name": "New Checkout Flow",
    "description": "Updated checkout experience",
    "enabled": true,
    "enabledForPercentage": 50
  },
  "darkMode": {
    "key": "darkMode",
    "name": "Dark Mode",
    "description": "Dark theme support",
    "enabled": true
  }
}
```

**Fetch Remote Flags:**
```tsx
// Manual fetch
await featureFlags.fetchRemoteFlags();

// Automatic fetch on app launch
useEffect(() => {
  featureFlags.fetchRemoteFlags();
}, []);
```

## Targeting

### Percentage Rollout

Gradually release features to a percentage of users:

```tsx
{
  key: 'newDesign',
  enabled: true,
  enabledForPercentage: 25,  // 25% of users
}
```

**How it works:**
- Uses consistent hashing based on user ID
- Same user always gets same result
- 0% = disabled for all, 100% = enabled for all

### User ID Targeting

Enable for specific user IDs:

```tsx
{
  key: 'betaAccess',
  enabled: true,
  enabledForUserIds: ['user-123', 'user-456', 'user-789'],
}
```

### Email Targeting

Enable for specific email addresses:

```tsx
{
  key: 'internalTools',
  enabled: true,
  enabledForEmails: [
    'admin@company.com',
    'developer@company.com',
  ],
}
```

## Debug Overrides

Override flags during development:

```tsx
// Enable a flag
featureFlags.setDebugOverride('myFeature', true);

// Disable a flag
featureFlags.setDebugOverride('myFeature', false);

// Clear override (use default behavior)
featureFlags.setDebugOverride('myFeature', null);

// Clear all overrides
featureFlags.resetDebugOverrides();
```

### Debug Menu Integration

Add to your debug menu:

```tsx
import { featureFlags, useFeatureFlags } from '@/lib/featureFlags';

function DebugMenu() {
  const flags = useFeatureFlags();

  return (
    <ScrollView>
      <Text style={styles.title}>Feature Flags</Text>

      {flags.map((flag) => (
        <View key={flag.key} style={styles.flagRow}>
          <View>
            <Text style={styles.flagName}>{flag.name}</Text>
            <Text style={styles.flagDesc}>{flag.description}</Text>
          </View>

          <Switch
            value={featureFlags.isEnabled(flag.key)}
            onValueChange={(value) => {
              featureFlags.setDebugOverride(flag.key, value);
            }}
          />
        </View>
      ))}

      <Button
        title="Reset All Overrides"
        onPress={() => featureFlags.resetDebugOverrides()}
      />
    </ScrollView>
  );
}
```

## Advanced Usage

### Feature Flag with Loading State

```tsx
function MyFeature() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkFlag() {
      await featureFlags.fetchRemoteFlags();
      setIsEnabled(featureFlags.isEnabled('myFeature'));
      setLoading(false);
    }
    checkFlag();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!isEnabled) return null;

  return <NewFeatureUI />;
}
```

### Conditional Navigation

```tsx
import { featureFlags } from '@/lib/featureFlags';

function AppTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />

      {featureFlags.isEnabled('socialFeatures') && (
        <Tab.Screen name="Social" component={SocialScreen} />
      )}

      {featureFlags.isEnabled('marketplace') && (
        <Tab.Screen name="Shop" component={ShopScreen} />
      )}
    </Tab.Navigator>
  );
}
```

### Feature Flag Analytics

Track which features users see:

```tsx
import { analytics } from '@/lib/analytics';
import { featureFlags } from '@/lib/featureFlags';

function trackFeatureUsage(flagKey: string) {
  const isEnabled = featureFlags.isEnabled(flagKey);

  analytics.track('feature_flag_evaluated', {
    flag: flagKey,
    enabled: isEnabled,
    timestamp: new Date().toISOString(),
  });
}
```

## API Backend Example

### Node.js/Express Endpoint

```typescript
// GET /api/feature-flags
app.get('/api/feature-flags', authenticate, (req, res) => {
  const userId = req.user.id;
  const userEmail = req.user.email;

  const flags = {
    newCheckout: {
      key: 'newCheckout',
      name: 'New Checkout',
      description: 'Updated checkout flow',
      enabled: true,
      enabledForPercentage: 50,
    },
    premiumFeatures: {
      key: 'premiumFeatures',
      name: 'Premium Features',
      description: 'Premium user features',
      enabled: true,
      enabledForUserIds: getPremiumUserIds(),
    },
  };

  res.json(flags);
});
```

### Firebase Remote Config

```tsx
import remoteConfig from '@react-native-firebase/remote-config';

async function fetchFirebaseFlags() {
  await remoteConfig().fetchAndActivate();

  const flags = {
    newDesign: {
      key: 'newDesign',
      enabled: remoteConfig().getValue('new_design_enabled').asBoolean(),
      enabledForPercentage: remoteConfig().getValue('new_design_rollout').asNumber(),
    },
  };

  return flags;
}
```

## Best Practices

### 1. Clear Naming

```tsx
// ✅ Good
featureFlags.isEnabled('darkModeEnabled')
featureFlags.isEnabled('aiChatBeta')

// ❌ Bad
featureFlags.isEnabled('feature1')
featureFlags.isEnabled('test')
```

### 2. Document Flags

```tsx
{
  key: 'newPaymentFlow',
  name: 'New Payment Flow',
  description: 'Redesigned payment experience with Apple Pay support',
  enabled: true,
}
```

### 3. Clean Up Old Flags

Remove flags that are:
- Fully rolled out (100% enabled)
- Deprecated or no longer used
- Experiment concluded

### 4. Test Both States

Always test your app with flags both enabled and disabled:

```tsx
describe('MyFeature', () => {
  it('works when flag is enabled', () => {
    featureFlags.setDebugOverride('myFeature', true);
    // Test enabled state
  });

  it('works when flag is disabled', () => {
    featureFlags.setDebugOverride('myFeature', false);
    // Test disabled state
  });
});
```

### 5. Use TypeScript

Create a type-safe wrapper:

```tsx
type FeatureFlagKey =
  | 'darkMode'
  | 'aiChat'
  | 'premiumFeatures'
  | 'newDesign';

export function useTypedFeatureFlag(key: FeatureFlagKey): boolean {
  return useFeatureFlag(key);
}
```

## Troubleshooting

### Flags Not Updating

```tsx
// Force refresh
await featureFlags.fetchRemoteFlags();

// Check last fetch time
const lastFetch = await AsyncStorage.getItem('@app/flagsLastFetch');
console.log('Last fetch:', new Date(parseInt(lastFetch)));
```

### Debug Override Not Working

```tsx
// Ensure debug overrides are enabled
featureFlags.configure({ allowDebugOverrides: true });

// Check current override
const override = featureFlags.getDebugOverride('myFlag');
console.log('Override:', override);
```

### Inconsistent Rollout

Percentage rollouts use user ID for consistency. Ensure:
- User ID is set: `featureFlags.configure({ userId: user.id })`
- User ID doesn't change
- Same user always sees same flag state

## Examples

### Simple Toggle

```tsx
if (featureFlags.isEnabled('showBanner')) {
  return <PromotionalBanner />;
}
```

### Gradual Rollout

```tsx
// Week 1: 10% rollout
{ enabled: true, enabledForPercentage: 10 }

// Week 2: 50% rollout
{ enabled: true, enabledForPercentage: 50 }

// Week 3: 100% rollout
{ enabled: true, enabledForPercentage: 100 }

// Week 4: Remove flag, make permanent
```

### Beta Program

```tsx
const betaUsers = [
  'user-123',
  'user-456',
  'user-789',
];

{
  key: 'betaFeatures',
  enabled: true,
  enabledForUserIds: betaUsers,
}
```

## Resources

- [LaunchDarkly](https://launchdarkly.com/) - Feature flag service
- [Firebase Remote Config](https://firebase.google.com/docs/remote-config)
- [Optimizely](https://www.optimizely.com/) - A/B testing platform
- [Split.io](https://www.split.io/) - Feature delivery platform

## Next Steps

1. **Define your flags** in `src/lib/featureFlags.ts`
2. **Add to debug menu** for easy testing
3. **Set up remote API** for dynamic flags
4. **Implement analytics** to track flag usage
5. **Document rollout plans** for your team
