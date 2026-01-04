/**
 * Biometric Authentication Service
 *
 * Provides Face ID, Touch ID, and fingerprint authentication
 *
 * Features:
 * - Check biometric availability
 * - Authenticate with biometrics
 * - Secure credential storage with biometric protection
 */

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export type BiometricType = LocalAuthentication.AuthenticationType;

/**
 * Check if biometric authentication is available
 */
export async function isBiometricAvailable(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) {
    return false;
  }

  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return enrolled;
}

/**
 * Get available biometric types
 * @returns Array of available biometric types
 */
export async function getAvailableBiometricTypes(): Promise<BiometricType[]> {
  return await LocalAuthentication.supportedAuthenticationTypesAsync();
}

/**
 * Get a user-friendly name for the biometric type
 * @param types Available biometric types
 */
export function getBiometricName(types: BiometricType[]): string {
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return 'Face ID';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return 'Touch ID / Fingerprint';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'Iris Recognition';
  }
  return 'Biometric';
}

/**
 * Authenticate user with biometrics
 * @param options Authentication options
 */
export async function authenticateWithBiometrics(options?: {
  promptMessage?: string;
  cancelLabel?: string;
  fallbackLabel?: string;
  disableDeviceFallback?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const isAvailable = await isBiometricAvailable();
    if (!isAvailable) {
      return {
        success: false,
        error: 'Biometric authentication is not available on this device',
      };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: options?.promptMessage || 'Authenticate to continue',
      cancelLabel: options?.cancelLabel || 'Cancel',
      fallbackLabel: options?.fallbackLabel || 'Use Passcode',
      disableDeviceFallback: options?.disableDeviceFallback ?? false,
    });

    if (result.success) {
      return { success: true };
    }

    return {
      success: false,
      error: result.error || 'Authentication failed',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Store sensitive data with biometric protection
 * @param key Storage key
 * @param value Value to store
 * @param options Storage options
 */
export async function storeSensitiveData(
  key: string,
  value: string,
  options?: {
    requireAuthentication?: boolean;
    authenticationPrompt?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    await SecureStore.setItemAsync(key, value, {
      requireAuthentication: options?.requireAuthentication ?? true,
      authenticationPrompt: options?.authenticationPrompt ?? 'Authenticate to save this data',
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to store data',
    };
  }
}

/**
 * Retrieve sensitive data with biometric protection
 * @param key Storage key
 * @param options Retrieval options
 */
export async function retrieveSensitiveData(
  key: string,
  options?: {
    requireAuthentication?: boolean;
    authenticationPrompt?: string;
  }
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const value = await SecureStore.getItemAsync(key, {
      requireAuthentication: options?.requireAuthentication ?? true,
      authenticationPrompt: options?.authenticationPrompt ?? 'Authenticate to access this data',
    });

    if (value === null) {
      return {
        success: false,
        error: 'No data found for this key',
      };
    }

    return { success: true, data: value };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve data',
    };
  }
}

/**
 * Delete sensitive data
 * @param key Storage key
 */
export async function deleteSensitiveData(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}

/**
 * Example: Enable biometric login
 * Stores user credentials securely with biometric protection
 */
export async function enableBiometricLogin(
  userId: string,
  authToken: string
): Promise<{ success: boolean; error?: string }> {
  return await storeSensitiveData(`biometric_auth_${userId}`, authToken, {
    requireAuthentication: true,
    authenticationPrompt: 'Enable biometric login',
  });
}

/**
 * Example: Login with biometrics
 * Retrieves stored credentials after biometric authentication
 */
export async function loginWithBiometrics(
  userId: string
): Promise<{ success: boolean; authToken?: string; error?: string }> {
  const result = await retrieveSensitiveData(`biometric_auth_${userId}`, {
    requireAuthentication: true,
    authenticationPrompt: 'Authenticate to login',
  });

  if (result.success && result.data) {
    return { success: true, authToken: result.data };
  }

  return { success: false, error: result.error };
}

/**
 * Example: Disable biometric login
 * Removes stored credentials
 */
export async function disableBiometricLogin(userId: string): Promise<void> {
  await deleteSensitiveData(`biometric_auth_${userId}`);
}
