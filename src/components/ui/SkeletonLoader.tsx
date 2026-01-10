/**
 * Skeleton Loader Component
 *
 * Displays placeholder loading states with shimmer animation
 * Uses React Native's built-in Animated API for Expo Go compatibility
 */

import { useEffect, useRef, useId } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';

interface SkeletonLoaderProps {
  /**
   * Width of the skeleton
   */
  width?: number | string;

  /**
   * Height of the skeleton
   */
  height?: number | string;

  /**
   * Border radius
   * @default 8
   */
  borderRadius?: number;

  /**
   * Custom style
   */
  style?: ViewStyle;

  /**
   * Variant type
   * @default 'rect'
   */
  variant?: 'rect' | 'circle' | 'text';
}

export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
  variant = 'rect',
}: SkeletonLoaderProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    animation.start();

    return () => animation.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'circle':
        return {
          width: typeof width === 'number' ? width : 50,
          height: typeof height === 'number' ? height : 50,
          borderRadius: 9999,
        };
      case 'text':
        return {
          width: typeof width === 'number' ? width : undefined,
          height: 16,
          borderRadius: 4,
        };
      default:
        return {
          width: typeof width === 'number' ? width : undefined,
          height: typeof height === 'number' ? height : undefined,
          borderRadius,
        };
    }
  };

  return (
    <View style={[styles.container, getVariantStyle(), style]}>
      <Animated.View
        style={[
          styles.shimmer,
          { transform: [{ translateX }] },
        ]}
      />
    </View>
  );
}

/**
 * Skeleton Group - Multiple skeleton loaders
 */
interface SkeletonGroupProps {
  /**
   * Number of skeleton items
   * @default 3
   */
  count?: number;

  /**
   * Spacing between items
   * @default 12
   */
  spacing?: number;

  /**
   * Props for each skeleton item
   */
  itemProps?: Omit<SkeletonLoaderProps, 'style'>;
}

export function SkeletonGroup({ count = 3, spacing = 12, itemProps }: SkeletonGroupProps) {
  const id = useId();
  return (
    <View>
      {Array.from({ length: count }, (_, index) => index).map((index) => (
        <SkeletonLoader
          key={`${id}-skeleton-${index}`}
          {...itemProps}
          style={{ marginBottom: index < count - 1 ? spacing : 0 }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
});
