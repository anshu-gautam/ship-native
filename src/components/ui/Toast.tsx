/**
 * Toast Component
 *
 * Displays toast notifications with animations and styling
 * Uses React Native's built-in Animated API for Expo Go compatibility
 */

import { useToast } from '@/hooks/useToast';
import type { Toast as ToastType } from '@/services/toast';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
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
  const translateY = useRef(new Animated.Value(toast.position === 'top' ? -100 : 100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 15,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate out before hiding
    if (toast.duration > 0) {
      const timeout = setTimeout(() => {
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: toast.position === 'top' ? -100 : 100,
            damping: 15,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide(toast.id);
        });
      }, toast.duration - 300);

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [toast.position, toast.duration, toast.id, onHide, translateY, opacity]);

  const colors = TOAST_COLORS[toast.type];

  const handlePress = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: toast.position === 'top' ? -100 : 100,
        damping: 15,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide(toast.id);
    });
  };

  return (
    <Animated.View
      style={[
        styles.toastItem,
        { transform: [{ translateY }], opacity },
      ]}
    >
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
