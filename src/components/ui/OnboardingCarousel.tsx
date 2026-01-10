/**
 * Onboarding Carousel Component
 *
 * A beautiful onboarding flow with swipeable slides
 */

import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface OnboardingSlide {
  /**
   * Unique identifier for the slide
   * If not provided, a combination of title and index will be used as the key
   */
  id?: string;

  /**
   * Slide title
   */
  title: string;

  /**
   * Slide description
   */
  description: string;

  /**
   * Icon/image component to display
   */
  icon?: React.ReactNode;

  /**
   * Background color for this slide
   */
  backgroundColor?: string;
}

interface OnboardingCarouselProps {
  /**
   * Onboarding slides
   */
  slides: OnboardingSlide[];

  /**
   * Callback when onboarding is completed
   */
  onComplete: () => void;

  /**
   * Callback when onboarding is skipped
   */
  onSkip?: () => void;

  /**
   * Show skip button
   * @default true
   */
  showSkip?: boolean;

  /**
   * Text for the final button
   * @default "Get Started"
   */
  finalButtonText?: string;
}

/**
 * Onboarding Carousel Component
 *
 * @example
 * ```tsx
 * const slides = [
 *   {
 *     title: 'Welcome',
 *     description: 'Welcome to our app!',
 *     icon: <Icon name="hand-wave" />,
 *     backgroundColor: '#3b82f6',
 *   },
 *   {
 *     title: 'Feature 1',
 *     description: 'Amazing feature description',
 *     icon: <Icon name="star" />,
 *     backgroundColor: '#10b981',
 *   },
 * ];
 *
 * <OnboardingCarousel
 *   slides={slides}
 *   onComplete={handleComplete}
 *   onSkip={handleSkip}
 * />
 * ```
 */
export function OnboardingCarousel({
  slides,
  onComplete,
  onSkip,
  showSkip = true,
  finalButtonText = 'Get Started',
}: OnboardingCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const isLastSlide = activeIndex === slides.length - 1;

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(slideIndex);
  };

  const handleNext = () => {
    if (isLastSlide) {
      onComplete();
    } else {
      flatListRef.current?.scrollToOffset({
        offset: (activeIndex + 1) * SCREEN_WIDTH,
        animated: true,
      });
    }
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={[styles.slide, { backgroundColor: item.backgroundColor || '#ffffff' }]}>
      {item.icon && <View style={styles.iconContainer}>{item.icon}</View>}
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Skip button */}
      {showSkip && !isLastSlide && onSkip && (
        <Pressable style={[styles.skipButton, { top: insets.top + 16 }]} onPress={onSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(slide, index) => slide.id || `${slide.title}-${index}`}
      />

      {/* Footer with pagination and buttons */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        {/* Pagination dots */}
        <View style={styles.pagination}>
          {slides.map((slide, index) => (
            <PaginationDot
              key={slide.id || `${slide.title}-${index}`}
              index={index}
              activeIndex={activeIndex}
            />
          ))}
        </View>

        {/* Next/Get Started button */}
        <Pressable
          style={({ pressed }) => [styles.nextButton, pressed && styles.buttonPressed]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>{isLastSlide ? finalButtonText : 'Next'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

interface PaginationDotProps {
  index: number;
  activeIndex: number;
}

function PaginationDot({ index, activeIndex }: PaginationDotProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [index - 1, index, index + 1];
    const scale = interpolate(activeIndex, inputRange, [0.6, 1, 0.6], Extrapolate.CLAMP);
    const opacity = interpolate(activeIndex, inputRange, [0.4, 1, 0.4], Extrapolate.CLAMP);

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
    flex: 1,
    backgroundColor: '#ffffff',
  },
  skipButton: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 32,
    paddingTop: 24,
    backgroundColor: '#ffffff',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  activeDot: {
    backgroundColor: '#3b82f6',
  },
  nextButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
