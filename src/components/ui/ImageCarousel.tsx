/**
 * Image Carousel Component
 *
 * Swipeable image carousel with pagination dots
 * Uses react-native-reanimated for smooth animations
 */

import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  type ImageStyle,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface CarouselImage {
  /**
   * Unique identifier for the image
   * If not provided, a combination of uri and index will be used as the key
   */
  id?: string;

  /**
   * Image URI
   */
  uri: string;

  /**
   * Optional alt text / description
   */
  alt?: string;
}

interface ImageCarouselProps {
  /**
   * Array of images to display
   */
  images: CarouselImage[];

  /**
   * Height of the carousel
   * @default 300
   */
  height?: number;

  /**
   * Width of each item
   * @default screen width
   */
  width?: number;

  /**
   * Show pagination dots
   * @default true
   */
  showPagination?: boolean;

  /**
   * Auto-play interval in milliseconds
   * Set to 0 to disable auto-play
   * @default 0
   */
  autoPlayInterval?: number;

  /**
   * Border radius for images
   * @default 0
   */
  borderRadius?: number;

  /**
   * Custom style for container
   */
  style?: ViewStyle;

  /**
   * Custom style for images
   */
  imageStyle?: ImageStyle;

  /**
   * Callback when active index changes
   */
  onIndexChange?: (index: number) => void;
}

/**
 * Image Carousel Component
 *
 * @example
 * ```tsx
 * const images = [
 *   { uri: 'https://example.com/image1.jpg', alt: 'Image 1' },
 *   { uri: 'https://example.com/image2.jpg', alt: 'Image 2' },
 *   { uri: 'https://example.com/image3.jpg', alt: 'Image 3' },
 * ];
 *
 * <ImageCarousel
 *   images={images}
 *   height={250}
 *   autoPlayInterval={3000}
 *   borderRadius={12}
 * />
 * ```
 */
export function ImageCarousel({
  images,
  height = 300,
  width = SCREEN_WIDTH,
  showPagination = true,
  autoPlayInterval = 0,
  borderRadius = 0,
  style,
  imageStyle,
  onIndexChange,
}: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Auto-play functionality
  const autoPlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startAutoPlay = () => {
    if (autoPlayInterval > 0 && images.length > 1) {
      autoPlayTimer.current = setInterval(() => {
        const nextIndex = (activeIndex + 1) % images.length;
        flatListRef.current?.scrollToOffset({
          offset: nextIndex * width,
          animated: true,
        });
      }, autoPlayInterval);
    }
  };

  const stopAutoPlay = () => {
    if (autoPlayTimer.current) {
      clearInterval(autoPlayTimer.current);
      autoPlayTimer.current = null;
    }
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (slideIndex !== activeIndex) {
      setActiveIndex(slideIndex);
      onIndexChange?.(slideIndex);
    }
  };

  const renderItem = ({ item }: { item: CarouselImage }) => (
    <View style={[styles.itemContainer, { width, height }]}>
      <Image
        source={{ uri: item.uri }}
        style={[styles.image, { width, height, borderRadius }, imageStyle]}
        resizeMode="cover"
      />
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item, index) => item.id || `${item.uri}-${index}`}
        onScrollBeginDrag={stopAutoPlay}
        onScrollEndDrag={startAutoPlay}
        onMomentumScrollEnd={onScroll}
      />

      {showPagination && images.length > 1 && (
        <View style={styles.pagination}>
          {images.map((image, index) => (
            <PaginationDot
              key={image.id || `${image.uri}-${index}`}
              index={index}
              activeIndex={activeIndex}
            />
          ))}
        </View>
      )}
    </View>
  );
}

interface PaginationDotProps {
  index: number;
  activeIndex: number;
}

function PaginationDot({ index, activeIndex }: PaginationDotProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(Math.abs(activeIndex - index), [0, 1], [1, 0.6], Extrapolate.CLAMP);

    const opacity = interpolate(Math.abs(activeIndex - index), [0, 1], [1, 0.4], Extrapolate.CLAMP);

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.dot, activeIndex === index && styles.activeDot, animatedStyle]} />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  activeDot: {
    backgroundColor: '#3b82f6',
  },
});
