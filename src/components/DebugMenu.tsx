/**
 * Debug Menu Component
 *
 * Development-only menu for testing and debugging
 * Access via shake gesture or dev menu
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Async storage keys for debug settings
const DEBUG_API_ENDPOINT_KEY = '@debug/apiEndpoint';
const DEBUG_MOCK_DATA_KEY = '@debug/mockData';
const DEBUG_LOGGING_KEY = '@debug/logging';

export interface DebugMenuProps {
  /** Callback when menu is closed */
  onClose: () => void;
}

// Custom hook for async storage string value
function useAsyncStorageString(key: string): [string | undefined, (value: string) => void] {
  const [value, setValue] = useState<string | undefined>(undefined);

  useEffect(() => {
    AsyncStorage.getItem(key).then((storedValue) => {
      if (storedValue !== null) {
        setValue(storedValue);
      }
    });
  }, [key]);

  const setStoredValue = useCallback((newValue: string) => {
    setValue(newValue);
    AsyncStorage.setItem(key, newValue).catch(console.error);
  }, [key]);

  return [value, setStoredValue];
}

export const DebugMenu: React.FC<DebugMenuProps> = ({ onClose }) => {
  const [apiEndpoint, setApiEndpoint] = useAsyncStorageString(DEBUG_API_ENDPOINT_KEY);
  const [mockDataEnabled, setMockDataEnabled] = useAsyncStorageString(DEBUG_MOCK_DATA_KEY);
  const [loggingEnabled, setLoggingEnabled] = useAsyncStorageString(DEBUG_LOGGING_KEY);

  const appVersion = Application.nativeApplicationVersion || '1.0.0';
  const buildNumber = Application.nativeBuildVersion || '1';
  const bundleId = Application.applicationId || 'unknown';

  const clearAsyncStorage = async () => {
    Alert.alert('Clear AsyncStorage', 'This will delete all cached data. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          Alert.alert('Success', 'AsyncStorage cleared');
        },
      },
    ]);
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  const ToggleRow = ({
    label,
    value,
    onValueChange,
  }: {
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛠️ Debug Menu</Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        {/* App Info */}
        <Section title="App Information">
          <InfoRow label="Version" value={appVersion} />
          <InfoRow label="Build Number" value={buildNumber} />
          <InfoRow label="Bundle ID" value={bundleId} />
          <InfoRow label="Expo SDK" value={Constants.expoConfig?.sdkVersion || 'Unknown'} />
          <InfoRow label="Environment" value={__DEV__ ? 'Development' : 'Production'} />
        </Section>

        {/* Device Info */}
        <Section title="Device Information">
          <InfoRow label="Device" value={Device.modelName || 'Unknown'} />
          <InfoRow label="OS" value={`${Platform.OS} ${Platform.Version}`} />
          <InfoRow label="Device Type" value={Device.isDevice ? 'Physical Device' : 'Simulator'} />
        </Section>

        {/* Feature Flags */}
        <Section title="Feature Flags">
          <ToggleRow
            label="Mock Data"
            value={mockDataEnabled === 'true'}
            onValueChange={(value) => setMockDataEnabled(value ? 'true' : 'false')}
          />
          <ToggleRow
            label="Debug Logging"
            value={loggingEnabled === 'true'}
            onValueChange={(value) => setLoggingEnabled(value ? 'true' : 'false')}
          />
        </Section>

        {/* API Configuration */}
        <Section title="API Configuration">
          <View style={styles.apiButtons}>
            <Pressable
              style={[styles.apiButton, apiEndpoint === 'production' && styles.apiButtonActive]}
              onPress={() => setApiEndpoint('production')}
            >
              <Text
                style={[
                  styles.apiButtonText,
                  apiEndpoint === 'production' && styles.apiButtonTextActive,
                ]}
              >
                Production
              </Text>
            </Pressable>
            <Pressable
              style={[styles.apiButton, apiEndpoint === 'staging' && styles.apiButtonActive]}
              onPress={() => setApiEndpoint('staging')}
            >
              <Text
                style={[
                  styles.apiButtonText,
                  apiEndpoint === 'staging' && styles.apiButtonTextActive,
                ]}
              >
                Staging
              </Text>
            </Pressable>
            <Pressable
              style={[styles.apiButton, apiEndpoint === 'local' && styles.apiButtonActive]}
              onPress={() => setApiEndpoint('local')}
            >
              <Text
                style={[
                  styles.apiButtonText,
                  apiEndpoint === 'local' && styles.apiButtonTextActive,
                ]}
              >
                Local
              </Text>
            </Pressable>
          </View>
        </Section>

        {/* Storage Management */}
        <Section title="Storage Management">
          <Pressable style={styles.dangerButton} onPress={clearAsyncStorage}>
            <Text style={styles.dangerButtonText}>Clear All Storage</Text>
          </Pressable>
        </Section>

        {/* Environment Variables */}
        <Section title="Environment Variables">
          <InfoRow label="API URL" value={process.env.EXPO_PUBLIC_API_URL || 'Not set'} />
          <InfoRow
            label="Clerk Key"
            value={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Set ✓' : 'Not set'}
          />
          <InfoRow
            label="Supabase URL"
            value={process.env.EXPO_PUBLIC_SUPABASE_URL ? 'Set ✓' : 'Not set'}
          />
          <InfoRow
            label="Sentry DSN"
            value={process.env.EXPO_PUBLIC_SENTRY_DSN ? 'Set ✓' : 'Not set'}
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999999',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  value: {
    fontSize: 16,
    color: '#999999',
  },
  apiButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  apiButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },
  apiButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  apiButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  apiButtonTextActive: {
    color: '#FFFFFF',
  },
  dangerButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
    marginTop: 8,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
