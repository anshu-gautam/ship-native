# Performance Monitoring & Optimization

Complete guide for monitoring and optimizing app performance.

## Overview

This boilerplate includes comprehensive performance tools:
- **Performance Monitor** - Track render times, API calls, and operations
- **OTA Updates** - Automatic over-the-air update checking and installation
- **Offline Queue** - Queue and retry failed requests when offline

## Performance Monitor

Track app performance metrics and identify bottlenecks.

### Features

- 📊 **Operation Timing** - Measure any operation duration
- 🖼️ **Screen Render Tracking** - Monitor screen load times
- 🌐 **API Call Duration** - Track network request performance
- 📈 **Performance Reports** - Generate detailed performance reports
- ⚠️ **Slow Operation Alerts** - Automatic Sentry reporting for slow operations

### Basic Usage

**Measure Operations:**
```tsx
import { performanceMonitor } from '@/lib/performanceMonitor';

// Start measuring
performanceMonitor.startMeasure('data-processing');

// Do some work
processData();

// End measuring
const duration = performanceMonitor.endMeasure('data-processing');
console.log(`Processing took ${duration}ms`);
```

**Measure Async Operations:**
```tsx
const data = await performanceMonitor.measureAsync(
  'fetch-users',
  async () => {
    return await api.get('/users');
  },
  { endpoint: '/users', method: 'GET' }
);
```

**Track Screen Renders:**
```tsx
import { usePerformanceMonitor } from '@/lib/performanceMonitor';

function ProfileScreen() {
  // Automatically tracks render time
  usePerformanceMonitor('ProfileScreen');

  return <View>...</View>;
}
```

**Manual Screen Tracking:**
```tsx
import { performanceMonitor } from '@/lib/performanceMonitor';

function MyScreen() {
  useEffect(() => {
    const endMeasure = performanceMonitor.measureScreenRender('MyScreen');

    // Component mounted, interactions complete
    return endMeasure;
  }, []);

  return <View>...</View>;
}
```

### Advanced Usage

**Get Metrics:**
```tsx
// Get all metrics
const metrics = performanceMonitor.getMetrics();

// Get screen render metrics
const screenMetrics = performanceMonitor.getScreenMetrics();

// Get average duration for specific operation
const avgDuration = performanceMonitor.getAverageDuration('api-call');

// Get slowest screens
const slowest = performanceMonitor.getSlowestScreens(5);
```

**Generate Reports:**
```tsx
const report = performanceMonitor.generateReport();
console.log(report);

// Output:
// === Performance Report ===
//
// Total Metrics: 45
// Total Screen Renders: 12
//
// Slowest Screens:
// 1. HomeScreen: 1234ms
// 2. ProfileScreen: 876ms
// 3. SettingsScreen: 654ms
//
// Average Metric Durations:
// - fetch-users: 234.56ms (10 calls)
// - process-data: 123.45ms (15 calls)
```

**Clear Metrics:**
```tsx
performanceMonitor.clear();
```

### Configuration

**Enable/Disable Monitoring:**
```tsx
// Disable in production if needed
performanceMonitor.setEnabled(__DEV__);
```

**Custom Thresholds:**

Edit `src/lib/performanceMonitor.ts`:
```tsx
// Report to Sentry if duration exceeds 3 seconds
if (duration > 3000) {
  Sentry.captureMessage(`Slow operation: ${name}`);
}

// Report slow screen renders (2 seconds)
if (renderTime > 2000) {
  Sentry.captureMessage(`Slow screen render: ${screenName}`);
}
```

### Best Practices

1. **Measure Critical Paths:**
   ```tsx
   performanceMonitor.startMeasure('app-startup');
   // App initialization code
   performanceMonitor.endMeasure('app-startup');
   ```

2. **Track Data Processing:**
   ```tsx
   performanceMonitor.measureAsync('image-processing', async () => {
     return await processImage(image);
   });
   ```

3. **Monitor All Screens:**
   ```tsx
   function MyScreen() {
     usePerformanceMonitor('MyScreen');
     // Rest of component
   }
   ```

4. **Add Metadata:**
   ```tsx
   performanceMonitor.endMeasure('api-call', {
     endpoint: '/users',
     method: 'GET',
     cached: false,
   });
   ```

---

## OTA Update Manager

Automatically check for and install over-the-air updates using Expo Updates.

### Features

- 🔄 **Auto Update Check** - Check for updates on app launch
- 📥 **Background Download** - Download updates in background
- 🔔 **User Notifications** - Optional alerts for available updates
- ⏰ **Smart Timing** - Configurable check intervals
- 📱 **Seamless Install** - Reload app with new version

### Basic Usage

**Initialize on App Launch:**
```tsx
// App.tsx or _layout.tsx
import { updateManager } from '@/lib/updateManager';

export default function App() {
  useEffect(() => {
    // Check for updates on launch (with 3s delay)
    updateManager.checkOnLaunch();
  }, []);

  return <YourApp />;
}
```

**Manual Update Check:**
```tsx
import { updateManager } from '@/lib/updateManager';

async function checkForUpdates() {
  const { isAvailable } = await updateManager.checkForUpdates();

  if (isAvailable) {
    console.log('Update available!');
    await updateManager.fetchAndApplyUpdate();
  }
}
```

**Silent Updates:**
```tsx
// Configure for silent updates (no user prompts)
updateManager.configure({
  checkOnLaunch: true,
  showAlerts: false,
  checkInterval: 1000 * 60 * 60 * 6, // Check every 6 hours
});

// Will auto-download and apply updates
await updateManager.checkAndApplyUpdates(false);
```

**User-Prompted Updates:**
```tsx
// Configure for user-prompted updates
updateManager.configure({
  checkOnLaunch: true,
  showAlerts: true, // Show alerts to user
  checkInterval: 1000 * 60 * 60 * 24, // Check daily
});

// Will show alerts asking user to update
await updateManager.checkAndApplyUpdates(true);
```

### Configuration

**Full Configuration:**
```tsx
updateManager.configure({
  checkOnLaunch: true,          // Check on app launch
  showAlerts: true,             // Show user prompts
  checkInterval: 24 * 60 * 60 * 1000, // 24 hours
});
```

**Get Current Update Info:**
```tsx
const updateInfo = updateManager.getCurrentUpdate();

console.log('Update ID:', updateInfo?.updateId);
console.log('Channel:', updateInfo?.channel);
console.log('Runtime Version:', updateInfo?.runtimeVersion);
```

**Manual Reload:**
```tsx
// Reload app manually
await updateManager.reload();
```

### Settings Screen Integration

Add update checking to your settings screen:

```tsx
import { updateManager } from '@/lib/updateManager';

function SettingsScreen() {
  const [checking, setChecking] = useState(false);

  const handleCheckForUpdates = async () => {
    setChecking(true);

    try {
      const { isAvailable } = await updateManager.checkForUpdates();

      if (isAvailable) {
        Alert.alert(
          'Update Available',
          'Download and install the update?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Update',
              onPress: async () => {
                await updateManager.fetchAndApplyUpdate();
              },
            },
          ]
        );
      } else {
        Alert.alert('No Updates', 'You have the latest version');
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <Pressable onPress={handleCheckForUpdates}>
      <Text>{checking ? 'Checking...' : 'Check for Updates'}</Text>
    </Pressable>
  );
}
```

### Important Notes

- ⚠️ **Only works in production builds** (not Expo Go or development)
- ⚠️ **Requires EAS Update or classic updates to be configured**
- ⚠️ **Updates are downloaded in background**
- ⚠️ **App reloads after update installation**

---

## Offline Queue

Queue and retry failed API requests when the device is offline.

### Features

- 📡 **Network Detection** - Automatically detect online/offline status
- 📦 **Request Queuing** - Store failed requests locally
- 🔁 **Auto Retry** - Retry when network is restored
- 🎯 **Prioritization** - Process high-priority requests first
- 💾 **Persistence** - Queue survives app restarts
- 🚫 **Max Retries** - Prevent infinite retry loops

### Basic Usage

**Initialize:**
```tsx
// App.tsx or _layout.tsx
import { offlineQueue } from '@/lib/offlineQueue';

export default function App() {
  useEffect(() => {
    // Initialize with request handler
    offlineQueue.initialize(async (request) => {
      // Execute the queued request
      await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body ? JSON.stringify(request.body) : undefined,
      });
    });

    return () => {
      offlineQueue.destroy();
    };
  }, []);

  return <YourApp />;
}
```

**Wrap API Calls:**
```tsx
import { withOfflineQueue } from '@/lib/offlineQueue';

async function createPost(data: PostData) {
  return await withOfflineQueue(
    {
      url: '/api/posts',
      method: 'POST',
      body: data,
      priority: 5, // Higher priority
    },
    async () => {
      return await api.post('/posts', data);
    }
  );
}
```

**Manual Queue Management:**
```tsx
import { offlineQueue } from '@/lib/offlineQueue';

// Add request manually
const requestId = await offlineQueue.addRequest({
  url: '/api/analytics',
  method: 'POST',
  body: { event: 'screen_view' },
  priority: 1, // Low priority
});

// Get queue status
const queueSize = offlineQueue.getQueueSize();
const allRequests = offlineQueue.getQueue();

// Remove specific request
await offlineQueue.removeRequest(requestId);

// Clear entire queue
await offlineQueue.clearQueue();
```

### Priority System

Requests are processed by priority (highest first):

```tsx
// High priority (critical user actions)
await offlineQueue.addRequest({
  url: '/api/purchase',
  method: 'POST',
  body: purchaseData,
  priority: 10, // Process first
});

// Medium priority (user content)
await offlineQueue.addRequest({
  url: '/api/posts',
  method: 'POST',
  body: postData,
  priority: 5,
});

// Low priority (analytics)
await offlineQueue.addRequest({
  url: '/api/analytics',
  method: 'POST',
  body: analyticsData,
  priority: 1, // Process last
});
```

### Integration with React Query

```tsx
import { withOfflineQueue } from '@/lib/offlineQueue';
import { useMutation } from '@tanstack/react-query';

function useCreatePost() {
  return useMutation({
    mutationFn: async (data: PostData) => {
      return await withOfflineQueue(
        {
          url: '/api/posts',
          method: 'POST',
          body: data,
          priority: 5,
        },
        async () => {
          return await api.post('/posts', data);
        }
      );
    },
    onError: (error) => {
      // Error already handled by offline queue
      // Just show user feedback
      toast.error('Post will be created when back online');
    },
  });
}
```

### Queue Status UI

Show queue status to users:

```tsx
import { offlineQueue } from '@/lib/offlineQueue';

function QueueStatus() {
  const [queueSize, setQueueSize] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQueueSize(offlineQueue.getQueueSize());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (queueSize === 0) return null;

  return (
    <View style={styles.banner}>
      <Text>{queueSize} requests pending (offline)</Text>
    </View>
  );
}
```

### Configuration

Edit constants in `src/lib/offlineQueue.ts`:

```tsx
const MAX_QUEUE_SIZE = 50;        // Max number of queued requests
const MAX_RETRY_ATTEMPTS = 3;     // Max retries per request
```

### Best Practices

1. **Prioritize User Actions:**
   ```tsx
   priority: 10  // Purchase, critical actions
   priority: 5   // User content (posts, comments)
   priority: 1   // Analytics, non-critical
   ```

2. **Handle Idempotency:**
   Ensure your API endpoints can handle duplicate requests safely.

3. **User Feedback:**
   ```tsx
   try {
     await createPost(data);
     toast.success('Post created');
   } catch (error) {
     toast.info('Post will be created when online');
   }
   ```

4. **Monitor Queue Size:**
   Clear old/stale requests periodically.

5. **Test Offline Scenarios:**
   - Enable Airplane mode
   - Check queue persists after app restart
   - Verify requests process when online

## Resources

- [React Native Performance](https://reactnative.dev/docs/performance)
- [Expo Updates](https://docs.expo.dev/versions/latest/sdk/updates/)
- [Network Connectivity](https://github.com/react-native-netinfo/react-native-netinfo)
- [Sentry Performance Monitoring](https://docs.sentry.io/platforms/react-native/performance/)

## Troubleshooting

### Performance Monitor

**Metrics not recording:**
- Check if monitoring is enabled: `performanceMonitor.setEnabled(true)`
- Verify `__DEV__` is true in development

**Sentry not receiving slow operations:**
- Ensure Sentry is configured
- Check threshold values

### OTA Updates

**Updates not working:**
- Only works in production builds (not Expo Go)
- Check EAS Update configuration
- Verify `Updates.isEnabled` is true

**Updates not applying:**
- Check network connectivity
- Verify update channel matches app build

### Offline Queue

**Requests not queuing:**
- Ensure queue is initialized
- Check request handler is set
- Verify network error detection

**Queue not processing:**
- Check if device is online
- Verify request handler doesn't throw errors
- Check max retries not exceeded
