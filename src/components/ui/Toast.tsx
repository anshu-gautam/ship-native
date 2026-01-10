/**
 * Toast Component
 *
 * Displays toast notifications with animations and styling
 */

import { useToast } from '@/hooks/useToast';
import type { Toast as ToastType } from '@/services/toast';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TOAST_COLORS = {
  success: {
    bg: '#10b981',
    text: '#ffffff',
  },
  error: {
    bg: '#ef4444',
    text: '#ffffff',
  },
  warning: {
    bg: '#f59e0b',
    text: '#ffffff',
  },
  info: {
    bg: '#3b82f6',
    text: '#ffffff',
  },
};

interface ToastItemProps {
  toast: ToastType;
  onHide: (id: string) => void;
}

function ToastItem({ toast, onHide }: ToastItemProps) {
  const translateY = useSharedValue(toast.position === 'top' ? -100 : 100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Animate in
    translateY.value = withSpring(0, { damping: 15 });
    opacity.value = withTiming(1, { duration: 200 });

    // Animate out before hiding
    if (toast.duration > 0) {
      const timeout = setTimeout(() => {
        translateY.value = withSpring(
          toast.position === 'top' ? -100 : 100,
          { damping: 15 },
          () => {
            runOnJS(onHide)(toast.id);
          }
        );
        opacity.value = withTiming(0, { duration: 200 });
      }, toast.duration - 300);

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [toast.position, toast.duration, toast.id, onHide, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const colors = TOAST_COLORS[toast.type];

  const handlePress = () => {
    translateY.value = withSpring(toast.position === 'top' ? -100 : 100, { damping: 15 }, () => {
      runOnJS(onHide)(toast.id);
    });
    opacity.value = withTiming(0, { duration: 200 });
  };

  return (
    <Animated.View style={[styles.toastItem, animatedStyle]}>
      <Pressable
        onPress={handlePress}
        style={[styles.toastContent, { backgroundColor: colors.bg }]}
      >
        <Text style={[styles.toastText, { color: colors.text }]} numberOfLines={3}>
          {toast.message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function ToastContainer() {
  const { toasts, hide } = useToast();
  const insets = useSafeAreaInsets();

  const topToasts = toasts.filter((t) => t.position === 'top');
  const bottomToasts = toasts.filter((t) => t.position === 'bottom');

  return (
    <>
      {/* Top toasts */}
      {topToasts.length > 0 && (
        <View
          style={[styles.container, styles.topContainer, { top: insets.top + 8 }]}
          pointerEvents="box-none"
        >
          {topToasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onHide={hide} />
          ))}
        </View>
      )}

      {/* Bottom toasts */}
      {bottomToasts.length > 0 && (
        <View
          style={[styles.container, styles.bottomContainer, { bottom: insets.bottom + 8 }]}
          pointerEvents="box-none"
        >
          {bottomToasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onHide={hide} />
          ))}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  topContainer: {
    top: 0,
  },
  bottomContainer: {
    bottom: 0,
  },
  toastItem: {
    marginVertical: 4,
    width: '90%',
    maxWidth: 400,
  },
  toastContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
