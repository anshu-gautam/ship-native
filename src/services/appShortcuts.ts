/**
 * App Shortcuts Service
 *
 * Provides Quick Actions (iOS) and App Shortcuts (Android)
 * Allows users to quickly access common features from home screen
 *
 * Note: This uses expo-quick-actions which is available in Expo SDK 51+
 */

import * as QuickActions from 'expo-quick-actions';
import { Platform } from 'react-native';

export interface AppShortcut {
  /**
   * Unique identifier for the shortcut
   */
  id: string;

  /**
   * Title displayed to user
   */
  title: string;

  /**
   * Subtitle/description (iOS only)
   */
  subtitle?: string;

  /**
   * Icon name (SF Symbols for iOS, Material Icons for Android)
   */
  icon?: string;

  /**
   * Custom data to pass when shortcut is activated
   */
  params?: Record<string, string | number | boolean | null | undefined>;
}

/**
 * Set up app shortcuts
 * @param shortcuts Array of shortcuts to set
 */
export async function setAppShortcuts(shortcuts: AppShortcut[]): Promise<void> {
  try {
    const quickActions = shortcuts.map((shortcut) => ({
      id: shortcut.id,
      title: shortcut.title,
      subtitle: shortcut.subtitle,
      icon: shortcut.icon,
      params: shortcut.params,
    }));

    await QuickActions.setItems(quickActions);
  } catch (error) {
    console.error('Error setting app shortcuts:', error);
  }
}

/**
 * Get initial shortcut action (if app was launched via shortcut)
 */
export async function getInitialShortcut(): Promise<QuickActions.Action | null> {
  try {
    return QuickActions.initial ?? null;
  } catch (error) {
    console.error('Error getting initial shortcut:', error);
    return null;
  }
}

/**
 * Set up listener for shortcut actions
 * @param handler Function to call when shortcut is activated
 * @returns Cleanup function to remove listener
 */
export function onShortcutAction(handler: (action: QuickActions.Action) => void): () => void {
  const subscription = QuickActions.addListener(handler);
  return () => subscription.remove();
}

/**
 * Clear all app shortcuts
 */
export async function clearAppShortcuts(): Promise<void> {
  try {
    await QuickActions.setItems([]);
  } catch (error) {
    console.error('Error clearing app shortcuts:', error);
  }
}

/**
 * Common shortcut icon names
 *
 * iOS (SF Symbols):
 * - 'symbol:plus'
 * - 'symbol:magnifyingglass'
 * - 'symbol:camera'
 * - 'symbol:heart'
 * - 'symbol:star'
 * - 'symbol:person'
 *
 * Android (Material Icons):
 * - Uses system icons automatically
 */
export const SHORTCUT_ICONS = {
  ADD: Platform.OS === 'ios' ? 'symbol:plus' : undefined,
  SEARCH: Platform.OS === 'ios' ? 'symbol:magnifyingglass' : undefined,
  CAMERA: Platform.OS === 'ios' ? 'symbol:camera' : undefined,
  FAVORITE: Platform.OS === 'ios' ? 'symbol:heart' : undefined,
  STAR: Platform.OS === 'ios' ? 'symbol:star' : undefined,
  PROFILE: Platform.OS === 'ios' ? 'symbol:person' : undefined,
  SETTINGS: Platform.OS === 'ios' ? 'symbol:gearshape' : undefined,
} as const;

/**
 * Example usage:
 *
 * ```tsx
 * // Set up shortcuts on app launch
 * useEffect(() => {
 *   setAppShortcuts([
 *     {
 *       id: 'new-post',
 *       title: 'New Post',
 *       subtitle: 'Create a new post',
 *       icon: SHORTCUT_ICONS.ADD,
 *       params: { screen: 'NewPost' },
 *     },
 *     {
 *       id: 'search',
 *       title: 'Search',
 *       subtitle: 'Search content',
 *       icon: SHORTCUT_ICONS.SEARCH,
 *       params: { screen: 'Search' },
 *     },
 *   ]);
 * }, []);
 *
 * // Handle shortcut actions
 * useEffect(() => {
 *   const cleanup = onShortcutAction((action) => {
 *     console.log('Shortcut activated:', action);
 *     // Navigate to screen based on action.params
 *     if (action.params?.screen) {
 *       navigation.navigate(action.params.screen);
 *     }
 *   });
 *
 *   return cleanup;
 * }, []);
 *
 * // Check if app was launched via shortcut
 * useEffect(() => {
 *   const checkInitialShortcut = async () => {
 *     const action = await getInitialShortcut();
 *     if (action?.params?.screen) {
 *       navigation.navigate(action.params.screen);
 *     }
 *   };
 *   checkInitialShortcut();
 * }, []);
 * ```
 */
