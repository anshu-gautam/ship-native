# Animated Splash Screen Setup

This guide explains how to set up an animated splash screen for your Expo app.

## Configuration in app.json

### Basic Splash Screen

```json
{
  "expo": {
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    }
  }
}
```

### Dark Mode Support

```json
{
  "expo": {
    "splash": {
      "image": "./assets/splash.png",
      "dark": {
        "image": "./assets/splash-dark.png",
        "backgroundColor": "#000000"
      },
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    }
  }
}
```

## Animated Splash Screen Implementation

### 1. Install Dependencies

```bash
npm install lottie-react-native
npm install expo-splash-screen
```

### 2. Create Animated Splash Component

```typescript
// components/AnimatedSplash.tsx
import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import LottieView from 'lottie-react-native';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    // Hide splash screen after animation
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/animations/splash.json')}
        autoPlay
        loop={false}
        style={styles.animation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: 200,
    height: 200,
  },
});
```

### 3. Use in Root Layout

```typescript
// app/_layout.tsx
import { useState } from 'react';
import { AnimatedSplash } from '../components/AnimatedSplash';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  if (!isReady) {
    return <AnimatedSplash onFinish={() => setIsReady(true)} />;
  }

  return (
    // Your app layout
  );
}
```

## Best Practices

### 1. Image Specifications

- **iOS**:
  - `splash.png` - 2048x2048px (PNG)
  - Place in `assets/` directory

- **Android**:
  - Adaptive icon approach recommended
  - Multiple densities supported

### 2. Performance Tips

- Keep splash image file size under 200KB
- Use PNG or JPEG formats
- Optimize images before adding to project
- Preload critical resources during splash

### 3. Loading States

```typescript
export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make API calls, etc.
        await Font.loadAsync(customFonts);
        await initializeApp();

        // Artificial delay for splash (optional)
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      {/* Your app content */}
    </View>
  );
}
```

## Advanced: Video Splash Screen

For a video splash screen, use `expo-av`:

```typescript
import { Video } from 'expo-av';

export function VideoSplash({ onFinish }: { onFinish: () => void }) {
  return (
    <Video
      source={require('../assets/splash-video.mp4')}
      rate={1.0}
      volume={0}
      shouldPlay
      resizeMode="cover"
      onPlaybackStatusUpdate={(status) => {
        if (status.isLoaded && status.didJustFinish) {
          onFinish();
        }
      }}
      style={StyleSheet.absoluteFillObject}
    />
  );
}
```

## Resources

- [Expo Splash Screen Documentation](https://docs.expo.dev/guides/splash-screens/)
- [Lottie Animations](https://lottiefiles.com/)
- [Splash Screen Generator](https://www.appicon.co/)
