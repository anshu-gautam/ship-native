/**
 * useDebugMenu Hook
 *
 * Manages debug menu visibility and shake-to-open functionality
 */

import { useEffect, useState } from 'react';
import { DevSettings, Platform } from 'react-native';

export function useDebugMenu() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable in development mode
    if (!__DEV__) {
      return;
    }

    // Add dev menu item
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        DevSettings.addMenuItem('Open Debug Menu', () => {
          setIsVisible(true);
        });
      } catch (error) {
        console.warn('Failed to add debug menu item:', error);
      }
    }

    // Note: Shake gesture listener would require additional native module
    // For now, debug menu can be accessed via:
    // 1. Dev menu (cmd+d on iOS, cmd+m on Android)
    // 2. Manual trigger via button in dev mode
  }, []);

  const open = () => setIsVisible(true);
  const close = () => setIsVisible(false);
  const toggle = () => setIsVisible((prev) => !prev);

  return {
    isVisible,
    open,
    close,
    toggle,
  };
}
