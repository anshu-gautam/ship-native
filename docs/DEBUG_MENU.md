# Debug Menu

Development-only debug menu for testing, debugging, and app configuration.

## Overview

The Debug Menu provides developers with quick access to:
- App and device information
- Feature flag toggles
- API endpoint switching
- Storage management
- Environment variable inspection

**Note:** Only available in development mode (`__DEV__ === true`).

## Features

- 🔧 **Feature Flags** - Toggle features without code changes
- 🌐 **API Switching** - Switch between production, staging, and local APIs
- 📱 **Device Info** - View device and app information
- 🗑️ **Storage Management** - Clear AsyncStorage and MMKV
- 🔐 **Environment Inspection** - Check which env vars are set
- 🎨 **Dark UI** - Developer-friendly dark interface

## Installation

Already set up! The Debug Menu is included in the boilerplate.

**Components:**
- `src/components/DebugMenu.tsx` - Main debug menu UI
- `src/components/DebugMenuProvider.tsx` - Provider wrapper
- `src/hooks/useDebugMenu.ts` - Hook for menu state

## Usage

### Basic Setup

Wrap your app with `DebugMenuProvider`:

**app/_layout.tsx:**
```tsx
import { DebugMenuProvider } from '@/components/DebugMenuProvider';

export default function RootLayout() {
  return (
    <DebugMenuProvider>
      <YourApp />
    </DebugMenuProvider>
  );
}
```

### Opening the Debug Menu

**Method 1: Dev Menu (Recommended)**

1. Open React Native Dev Menu:
   - iOS Simulator: `Cmd+D`
   - Android Emulator: `Cmd+M` (Mac) or `Ctrl+M` (Windows/Linux)
   - Physical Device: Shake the device

2. Select "Open Debug Menu"

**Method 2: Manual Trigger**

Add a button in development mode:

```tsx
import { useDebugMenu } from '@/hooks/useDebugMenu';

function MyScreen() {
  const { open } = useDebugMenu();

  return (
    <View>
      {__DEV__ && (
        <Button title="Open Debug Menu" onPress={open} />
      )}
    </View>
  );
}
```

**Method 3: Programmatic**

```tsx
const { open, close, toggle } = useDebugMenu();

// Open menu
open();

// Close menu
close();

// Toggle menu
toggle();
```

## Sections

### App Information

Displays app metadata:
- **Version**: App version from `app.json`
- **Build Number**: Build number
- **Bundle ID**: App identifier
- **Expo SDK**: Expo SDK version
- **Environment**: Development or Production

### Device Information

Shows device details:
- **Device**: Device model name
- **OS**: Operating system and version
- **Device Type**: Physical device or simulator

### Feature Flags

Toggle features at runtime:

**Mock Data**
- Enables/disables mock API responses
- Useful for offline development
- Persists across app restarts

**Debug Logging**
- Enables verbose console logging
- Shows network requests, state changes, etc.

**Reading Feature Flags:**
```tsx
import { useMMKVString } from 'react-native-mmkv';

function MyComponent() {
  const [mockDataEnabled] = useMMKVString('debug.mockData');
  const shouldUseMockData = mockDataEnabled === 'true';

  const fetchData = async () => {
    if (shouldUseMockData) {
      return getMockData();
    }
    return fetchRealData();
  };
}
```

### API Configuration

Switch between API environments:

**Production**
- Uses production API endpoint
- Real data, real users

**Staging**
- Uses staging API endpoint
- Test data, safe for testing

**Local**
- Uses local development server
- Typically `http://localhost:3000`

**Reading API Endpoint:**
```tsx
import { useMMKVString } from 'react-native-mmkv';

function useApiUrl() {
  const [endpoint] = useMMKVString('debug.apiEndpoint');

  const baseUrls = {
    production: 'https://api.example.com',
    staging: 'https://staging-api.example.com',
    local: 'http://localhost:3000',
  };

  return baseUrls[endpoint] || process.env.EXPO_PUBLIC_API_URL;
}
```

### Storage Management

Clear stored data:

**Clear AsyncStorage**
- Removes all AsyncStorage data
- Shows confirmation alert
- Useful for testing fresh installs

**Clear MMKV Storage**
- Removes all MMKV data
- Shows confirmation alert
- Resets feature flags and settings

### Environment Variables

Inspect which environment variables are set:
- Shows "Set ✓" if variable exists
- Shows "Not set" if missing
- Helps debug configuration issues

**Checked Variables:**
- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SENTRY_DSN`

## Advanced Usage

### Custom Feature Flags

Add your own feature flags:

```tsx
import { useMMKVString } from 'react-native-mmkv';

function MyDebugMenu() {
  const [newFeature, setNewFeature] = useMMKVString('debug.newFeature');

  return (
    <ToggleRow
      label="New Feature (Beta)"
      value={newFeature === 'true'}
      onValueChange={(value) => setNewFeature(value ? 'true' : 'false')}
    />
  );
}
```

### Custom Actions

Add custom debug actions:

```tsx
const resetOnboarding = async () => {
  await AsyncStorage.removeItem('onboarding_completed');
  Alert.alert('Success', 'Onboarding reset');
};

<Pressable style={styles.button} onPress={resetOnboarding}>
  <Text>Reset Onboarding</Text>
</Pressable>
```

### Network Inspector

Add network request logging:

```tsx
import { useMMKVString } from 'react-native-mmkv';

function useNetworkDebug() {
  const [loggingEnabled] = useMMKVString('debug.logging');

  const logRequest = (url: string, method: string) => {
    if (loggingEnabled === 'true' && __DEV__) {
      console.log(`[Network] ${method} ${url}`);
    }
  };

  return { logRequest };
}
```

## Best Practices

### 1. Only in Development

Always check `__DEV__`:
```tsx
{__DEV__ && <DebugButton />}
```

### 2. Persist Settings

Use MMKV for persistence:
```tsx
const [setting, setSetting] = useMMKVString('debug.mySetting');
```

### 3. Clear Data Confirmations

Always confirm destructive actions:
```tsx
Alert.alert(
  'Clear Data',
  'Are you sure?',
  [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Clear', style: 'destructive', onPress: clearData },
  ]
);
```

### 4. Document Feature Flags

Comment what each flag does:
```tsx
// Enable mock data for offline development
const [mockData, setMockData] = useMMKVString('debug.mockData');
```

## Customization

### Styling

Customize the debug menu appearance:

```tsx
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000', // Dark background
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  // ... more styles
});
```

### Add Custom Sections

```tsx
<Section title="My Custom Section">
  <InfoRow label="Custom Info" value="Value" />
  <ToggleRow
    label="Custom Toggle"
    value={myToggle}
    onValueChange={setMyToggle}
  />
</Section>
```

## Troubleshooting

### Debug Menu Not Appearing

1. **Check DEV mode**: Ensure `__DEV__ === true`
2. **Check Provider**: Verify `DebugMenuProvider` is wrapping app
3. **Check Platform**: Dev menu works on iOS/Android, not web

### Feature Flags Not Persisting

1. **Check MMKV**: Ensure `react-native-mmkv` is installed
2. **Check Keys**: Use consistent key names (e.g., `debug.myFlag`)
3. **Check String Values**: Store as `'true'` or `'false'` strings

### Can't Clear Storage

1. **Check Permissions**: Ensure app has storage access
2. **Check Implementation**: Verify `AsyncStorage.clear()` is called
3. **Restart App**: Sometimes requires app restart to take effect

## Examples

### Complete Integration

**app/_layout.tsx:**
```tsx
import { DebugMenuProvider } from '@/components/DebugMenuProvider';
import { useDebugMenu } from '@/hooks/useDebugMenu';

export default function RootLayout() {
  return (
    <DebugMenuProvider>
      <YourAppContent />
    </DebugMenuProvider>
  );
}
```

**Using Feature Flags:**
```tsx
import { useMMKVString } from 'react-native-mmkv';

function ProductList() {
  const [mockData] = useMMKVString('debug.mockData');

  const { data } = useQuery({
    queryKey: ['products'],
    queryFn: mockData === 'true' ? getMockProducts : fetchProducts,
  });

  return <FlatList data={data} />;
}
```

**Using API Endpoint:**
```tsx
import axios from 'axios';
import { useMMKVString } from 'react-native-mmkv';

const api = axios.create({
  baseURL: getApiUrl(),
});

function getApiUrl() {
  const [endpoint] = useMMKVString('debug.apiEndpoint');

  switch (endpoint) {
    case 'production':
      return 'https://api.example.com';
    case 'staging':
      return 'https://staging-api.example.com';
    case 'local':
      return 'http://localhost:3000';
    default:
      return process.env.EXPO_PUBLIC_API_URL;
  }
}
```

## Security

### Production Builds

The debug menu is automatically disabled in production builds:

```tsx
if (!__DEV__) {
  return <>{children}</>;
}
```

### Sensitive Data

Never display sensitive information:
```tsx
// ❌ Bad
<InfoRow label="API Key" value={process.env.API_KEY} />

// ✅ Good
<InfoRow label="API Key" value={process.env.API_KEY ? 'Set ✓' : 'Not set'} />
```

## Resources

- [React Native Dev Menu](https://reactnative.dev/docs/debugging)
- [MMKV Storage](https://github.com/mrousavy/react-native-mmkv)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)

## Next Steps

1. **Add Custom Flags**: Create feature flags for your features
2. **Add Analytics**: Track debug menu usage
3. **Add Shortcuts**: Add quick actions for common tasks
4. **Add Presets**: Save and load debug configurations
