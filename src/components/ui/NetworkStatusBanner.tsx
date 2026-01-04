/**
 * Network Status Banner
 *
 * Displays a banner when the device goes offline/online
 * Automatically hides after a few seconds when back online
 */

import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NetworkStatusBannerProps {
  /**
   * Position of the banner
   * @default 'top'
   */
  position?: 'top' | 'bottom';

  /**
   * Duration to show "back online" message before hiding
   * @default 3000ms
   */
  onlineDuration?: number;
}

export function NetworkStatusBanner({
  position = 'top',
  onlineDuration = 3000,
}: NetworkStatusBannerProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const insets = useSafeAreaInsets();

  const translateY = useSharedValue(position === 'top' ? -100 : 100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected && state.isInternetReachable !== false;

      // First time setup - don't show banner
      if (isConnected === null) {
        setIsConnected(connected);
        return;
      }

      // Connection state changed
      if (connected !== isConnected) {
        setIsConnected(connected);
        setShowBanner(true);

        // If back online, hide banner after delay
        if (connected) {
          setTimeout(() => {
            setShowBanner(false);
          }, onlineDuration);
        }
      }
    });

    return () => unsubscribe();
  }, [isConnected, onlineDuration]);

  useEffect(() => {
    if (showBanner && isConnected !== null) {
      // Animate in
      translateY.value = withSpring(0, { damping: 15 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      // Animate out
      translateY.value = withSpring(position === 'top' ? -100 : 100, { damping: 15 });
      opacity.value = withTiming(0, { duration: 300 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBanner, isConnected, position]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (isConnected === null) {
    return null;
  }

  const backgroundColor = isConnected ? '#10b981' : '#ef4444';
  const text = isConnected ? 'Back Online' : 'No Internet Connection';

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'top' ? { top: insets.top } : { bottom: insets.bottom },
        { backgroundColor },
        animatedStyle,
      ]}
    >
      <Text style={styles.text}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    zIndex: 9998, // Below toasts
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
