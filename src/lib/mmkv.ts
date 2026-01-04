import { MMKV } from 'react-native-mmkv';

// Create the default MMKV instance
export const storage = new MMKV({
  id: 'default',
});

// Create a secure MMKV instance for sensitive data
export const secureStorage = new MMKV({
  id: 'secure',
  encryptionKey: 'your-encryption-key-here', // Replace with a secure key in production
});

// Storage utilities
export const mmkvStorage = {
  setItem: (key: string, value: string): void => {
    storage.set(key, value);
  },
  getItem: (key: string): string | null => {
    return storage.getString(key) ?? null;
  },
  removeItem: (key: string): void => {
    storage.delete(key);
  },
  clear: (): void => {
    storage.clearAll();
  },
};

// Type-safe storage utilities
export const setStorageItem = <T>(key: string, value: T): void => {
  storage.set(key, JSON.stringify(value));
};

export const getStorageItem = <T>(key: string): T | null => {
  const value = storage.getString(key);
  return value ? (JSON.parse(value) as T) : null;
};

export const removeStorageItem = (key: string): void => {
  storage.delete(key);
};

export const clearStorage = (): void => {
  storage.clearAll();
};

// Secure storage utilities
export const setSecureItem = <T>(key: string, value: T): void => {
  secureStorage.set(key, JSON.stringify(value));
};

export const getSecureItem = <T>(key: string): T | null => {
  const value = secureStorage.getString(key);
  return value ? (JSON.parse(value) as T) : null;
};

export const removeSecureItem = (key: string): void => {
  secureStorage.delete(key);
};

export const clearSecureStorage = (): void => {
  secureStorage.clearAll();
};
