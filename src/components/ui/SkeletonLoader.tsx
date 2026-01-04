/**
 * Skeleton Loader Component
 *
 * Displays placeholder loading states with shimmer animation
 */

import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

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
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1500 }), -1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmer.value, [0, 1], [-width as number, width as number]);

    return {
      transform: [{ translateX }],
    };
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
      <Animated.View style={[styles.shimmer, animatedStyle]} />
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
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonLoader
          key={`skeleton-${index}`}
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
