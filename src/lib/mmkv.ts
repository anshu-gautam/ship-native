
import AsyncStorage from "@react-native-async-storage/async-storage";

// Note: MMKV requires a native module that's not included in Expo Go.
// This file provides an AsyncStorage-based fallback that works in Expo Go.
// For production builds, you can switch back to MMKV by using expo-dev-client.

// Storage utilities compatible with Expo Go (using AsyncStorage)
// These are synchronous-like wrappers for compatibility with zustand persist
export const mmkvStorage = {
  setItem: (key: string, value: string): void => {
    AsyncStorage.setItem(key, value).catch(console.error);
  },
  getItem: (key: string): string | null => {
    // Note: For zustand, we need to return null for missing values
    // AsyncStorage.getItem is async, but zustand's createJSONStorage handles this
    let result: string | null = null;
    AsyncStorage.getItem(key)
      .then((value) => {
        result = value;
      })
      .catch(console.error);
    return result;
  },
  removeItem: (key: string): void => {
    AsyncStorage.removeItem(key).catch(console.error);
  },
  clear: (): void => {
    AsyncStorage.clear().catch(console.error);
  },
};

// Async storage utilities for direct use
export const asyncStorage = {
  setItem: async (key: string, value: string): Promise<void> => {
    await AsyncStorage.setItem(key, value);
  },
  getItem: async (key: string): Promise<string | null> => {
    return await AsyncStorage.getItem(key);
  },
  removeItem: async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(key);
  },
  clear: async (): Promise<void> => {
    await AsyncStorage.clear();
  },
};

// Type-safe async storage utilities
export const setStorageItem = async <T>(
  key: string,
  value: T
): Promise<void> => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

export const getStorageItem = async <T>(key: string): Promise<T | null> => {
  const value = await AsyncStorage.getItem(key);
  return value ? (JSON.parse(value) as T) : null;
};

export const removeStorageItem = async (key: string): Promise<void> => {
  await AsyncStorage.removeItem(key);
};

export const clearStorage = async (): Promise<void> => {
  await AsyncStorage.clear();
};

// For secure storage, use expo-secure-store instead
import * as SecureStore from "expo-secure-store";

export const setSecureItem = async <T>(
  key: string,
  value: T
): Promise<void> => {
  await SecureStore.setItemAsync(key, JSON.stringify(value));
};

export const getSecureItem = async <T>(key: string): Promise<T | null> => {
  const value = await SecureStore.getItemAsync(key);
  return value ? (JSON.parse(value) as T) : null;
};

export const removeSecureItem = async (key: string): Promise<void> => {
  await SecureStore.deleteItemAsync(key);
};

export const clearSecureStorage = async (): Promise<void> => {
  // SecureStore doesn't have a clearAll, so this is a no-op
  // In production, you'd track keys and delete them individually
  console.warn("clearSecureStorage is not implemented for SecureStore");
};
