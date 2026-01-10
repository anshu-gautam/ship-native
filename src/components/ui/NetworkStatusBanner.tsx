/**
 * Network Status Banner
 *
 * Displays a banner when the device goes offline/online
 * Automatically hides after a few seconds when back online
 * Uses React Native's built-in Animated API for Expo Go compatibility
 */

import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
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

  const translateY = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected && state.isInternetReachable !== false;

      // First time setup - don't show banner
      if (isConnected === null) {
        setIsConnected(connected ?? false);
        return;
      }

      // Connection state changed
      if (connected !== isConnected) {
        setIsConnected(connected ?? false);
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
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 15,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: position === 'top' ? -100 : 100,
          damping: 15,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showBanner, isConnected, position, translateY, opacity]);

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
        { transform: [{ translateY }], opacity },
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
