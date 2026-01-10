/**
 * Toast Notification Service
 *
 * Provides a simple, customizable toast notification system
 * for displaying temporary messages to users.
 *
 * Features:
 * - Success, error, warning, and info toasts
 * - Customizable duration and position
 * - Queue management for multiple toasts
 * - Haptic feedback integration
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top' | 'bottom';

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
  position?: ToastPosition;
  haptic?: boolean;
}

export interface Toast extends Required<ToastOptions> {
  id: string;
  timestamp: number;
}

type ToastListener = (toasts: Toast[]) => void;

class ToastService {
  private toasts: Toast[] = [];
  private listeners: Set<ToastListener> = new Set();
  private autoHideTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  /**
   * Subscribe to toast updates
   */
  subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of toast updates
   */
  private notify(): void {
    for (const listener of this.listeners) {
      listener([...this.toasts]);
    }
  }

  /**
   * Generate a unique toast ID
   */
  private generateId(): string {
    return `toast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Show a toast notification
   */
  show(options: ToastOptions): string {
    const toast: Toast = {
      id: this.generateId(),
      message: options.message,
      type: options.type ?? 'info',
      duration: options.duration ?? 3000,
      position: options.position ?? 'bottom',
      haptic: options.haptic ?? true,
      timestamp: Date.now(),
    };

    // Trigger haptic feedback
    if (toast.haptic && Platform.OS !== 'web') {
      this.triggerHaptic(toast.type);
    }

    // Add toast to queue
    this.toasts.push(toast);
    this.notify();

    // Auto-hide after duration
    if (toast.duration > 0) {
      const timer = setTimeout(() => {
        this.hide(toast.id);
      }, toast.duration);
      this.autoHideTimers.set(toast.id, timer);
    }

    return toast.id;
  }

  /**
   * Hide a specific toast
   */
  hide(id: string): void {
    // Clear auto-hide timer
    const timer = this.autoHideTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.autoHideTimers.delete(id);
    }

    // Remove toast
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    this.notify();
  }

  /**
   * Hide all toasts
   */
  hideAll(): void {
    // Clear all timers
    for (const timer of this.autoHideTimers.values()) {
      clearTimeout(timer);
    }
    this.autoHideTimers.clear();

    // Clear all toasts
    this.toasts = [];
    this.notify();
  }

  /**
   * Show a success toast
   */
  success(message: string, options?: Omit<ToastOptions, 'message' | 'type'>): string {
    return this.show({ ...options, message, type: 'success' });
  }

  /**
   * Show an error toast
   */
  error(message: string, options?: Omit<ToastOptions, 'message' | 'type'>): string {
    return this.show({ ...options, message, type: 'error' });
  }

  /**
   * Show a warning toast
   */
  warning(message: string, options?: Omit<ToastOptions, 'message' | 'type'>): string {
    return this.show({ ...options, message, type: 'warning' });
  }

  /**
   * Show an info toast
   */
  info(message: string, options?: Omit<ToastOptions, 'message' | 'type'>): string {
    return this.show({ ...options, message, type: 'info' });
  }

  /**
   * Trigger haptic feedback based on toast type
   */
  private async triggerHaptic(type: ToastType): Promise<void> {
    try {
      switch (type) {
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      // Silently fail if haptics are not supported
      console.debug('Haptic feedback not available:', error);
    }
  }
}

// Export singleton instance
export const toast = new ToastService();

// Export for testing
export { ToastService };
