/**
 * Feature Flags System
 *
 * Manage feature flags for gradual rollouts and A/B testing
 * - Local and remote flag support
 * - User targeting
 * - Percentage-based rollouts
 * - Override in debug menu
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useCallback } from "react";

const REMOTE_FLAGS_KEY = "@app/remoteFeatureFlags";
const FLAGS_LAST_FETCH_KEY = "@app/flagsLastFetch";
const FLAGS_FETCH_INTERVAL = 1000 * 60 * 60; // 1 hour
const FLAG_OVERRIDE_PREFIX = "@app/flag_override_";

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  enabledForPercentage?: number; // 0-100
  enabledForUserIds?: string[];
  enabledForEmails?: string[];
}

export interface FeatureFlagsConfig {
  /** API endpoint to fetch remote flags */
  apiEndpoint?: string;
  /** User ID for targeting */
  userId?: string;
  /** User email for targeting */
  userEmail?: string;
  /** Enable debug overrides */
  allowDebugOverrides?: boolean;
}

class FeatureFlagsManager {
  private config: FeatureFlagsConfig = {
    allowDebugOverrides: __DEV__,
  };

  private defaultFlags: Record<string, FeatureFlag> = {
    // Example flags - customize for your app
    newDesign: {
      key: "newDesign",
      name: "New Design",
      description: "Enable new UI design",
      enabled: false,
      enabledForPercentage: 50, // 50% rollout
    },
    aiChat: {
      key: "aiChat",
      name: "AI Chat",
      description: "Enable AI chat feature",
      enabled: false,
    },
    premiumFeatures: {
      key: "premiumFeatures",
      name: "Premium Features",
      description: "Enable premium features",
      enabled: false,
    },
    darkMode: {
      key: "darkMode",
      name: "Dark Mode",
      description: "Enable dark mode",
      enabled: true, // Enabled by default
    },
  };

  private remoteFlags: Record<string, FeatureFlag> = {};
  private debugOverrides: Record<string, boolean | null> = {};

  /**
   * Configure feature flags
   */
  configure(config: FeatureFlagsConfig): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Initialize debug overrides from AsyncStorage
   */
  async initDebugOverrides(): Promise<void> {
    if (!__DEV__) return;

    try {
      const keys = await AsyncStorage.getAllKeys();
      const overrideKeys = keys.filter((k) =>
        k.startsWith(FLAG_OVERRIDE_PREFIX)
      );
      const pairs = await AsyncStorage.multiGet(overrideKeys);

      for (const [key, value] of pairs) {
        const flagKey = key.replace(FLAG_OVERRIDE_PREFIX, "");
        if (value === "true") this.debugOverrides[flagKey] = true;
        else if (value === "false") this.debugOverrides[flagKey] = false;
      }
    } catch (error) {
      console.error("[FeatureFlags] Error loading debug overrides:", error);
    }
  }

  /**
   * Check if a feature is enabled
   */
  isEnabled(flagKey: string): boolean {
    // 1. Check debug override first (if allowed)
    if (this.config.allowDebugOverrides && __DEV__) {
      const debugOverride = this.debugOverrides[flagKey];
      if (debugOverride !== undefined && debugOverride !== null) {
        return debugOverride;
      }
    }

    // 2. Check remote flags
    const remoteFlag = this.remoteFlags[flagKey];
    if (remoteFlag) {
      return this.evaluateFlag(remoteFlag);
    }

    // 3. Check default flags
    const defaultFlag = this.defaultFlags[flagKey];
    if (defaultFlag) {
      return this.evaluateFlag(defaultFlag);
    }

    // 4. Flag not found, return false
    console.warn(`[FeatureFlags] Flag "${flagKey}" not found`);
    return false;
  }

  /**
   * Evaluate a flag based on its configuration
   */
  private evaluateFlag(flag: FeatureFlag): boolean {
    // If flag is disabled, return false immediately
    if (!flag.enabled) {
      return false;
    }

    // Check user ID targeting
    if (flag.enabledForUserIds && this.config.userId) {
      return flag.enabledForUserIds.includes(this.config.userId);
    }

    // Check email targeting
    if (flag.enabledForEmails && this.config.userEmail) {
      return flag.enabledForEmails.includes(this.config.userEmail);
    }

    // Check percentage rollout
    if (flag.enabledForPercentage !== undefined) {
      return this.isInPercentage(flag.key, flag.enabledForPercentage);
    }

    // Default: enabled
    return true;
  }

  /**
   * Check if user is in percentage rollout
   * Uses consistent hashing to ensure same user always gets same result
   */
  private isInPercentage(flagKey: string, percentage: number): boolean {
    if (percentage >= 100) return true;
    if (percentage <= 0) return false;

    // Use userId or a device-specific identifier for consistency
    const identifier = this.config.userId || "anonymous";
    const hash = this.hashString(`${flagKey}:${identifier}`);
    const bucket = hash % 100;

    return bucket < percentage;
  }

  /**
   * Simple string hash function
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Set debug override (dev only)
   */
  async setDebugOverride(
    flagKey: string,
    value: boolean | null
  ): Promise<void> {
    if (!__DEV__) {
      console.warn(
        "[FeatureFlags] Debug overrides only available in development"
      );
      return;
    }

    try {
      const storageKey = `${FLAG_OVERRIDE_PREFIX}${flagKey}`;
      if (value === null) {
        await AsyncStorage.removeItem(storageKey);
        delete this.debugOverrides[flagKey];
      } else {
        await AsyncStorage.setItem(storageKey, value ? "true" : "false");
        this.debugOverrides[flagKey] = value;
      }
    } catch (error) {
      console.error("[FeatureFlags] Error setting debug override:", error);
    }
  }

  /**
   * Fetch remote flags from API
   */
  async fetchRemoteFlags(): Promise<void> {
    if (!this.config.apiEndpoint) {
      console.log("[FeatureFlags] No API endpoint configured");
      return;
    }

    try {
      // Check if we should fetch (based on interval)
      const shouldFetch = await this.shouldFetchRemoteFlags();
      if (!shouldFetch) {
        console.log(
          "[FeatureFlags] Skipping fetch (too soon since last fetch)"
        );
        return;
      }

      console.log("[FeatureFlags] Fetching remote flags...");

      const response = await fetch(this.config.apiEndpoint, {
        headers: {
          "Content-Type": "application/json",
          // Add auth headers if needed
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const flags = await response.json();
      this.remoteFlags = flags;

      // Cache the flags
      await AsyncStorage.setItem(REMOTE_FLAGS_KEY, JSON.stringify(flags));
      await AsyncStorage.setItem(FLAGS_LAST_FETCH_KEY, Date.now().toString());

      console.log("[FeatureFlags] Remote flags updated");
    } catch (error) {
      console.error("[FeatureFlags] Error fetching remote flags:", error);

      // Load from cache on error
      await this.loadCachedFlags();
    }
  }

  /**
   * Load cached flags from storage
   */
  private async loadCachedFlags(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(REMOTE_FLAGS_KEY);
      if (cached) {
        this.remoteFlags = JSON.parse(cached);
        console.log("[FeatureFlags] Loaded cached flags");
      }
    } catch (error) {
      console.error("[FeatureFlags] Error loading cached flags:", error);
    }
  }

  /**
   * Check if we should fetch remote flags
   */
  private async shouldFetchRemoteFlags(): Promise<boolean> {
    try {
      const lastFetch = await AsyncStorage.getItem(FLAGS_LAST_FETCH_KEY);
      if (!lastFetch) return true;

      const timeSinceLastFetch = Date.now() - Number.parseInt(lastFetch, 10);
      return timeSinceLastFetch >= FLAGS_FETCH_INTERVAL;
    } catch {
      return true;
    }
  }

  /**
   * Get all flags (for debug menu)
   */
  getAllFlags(): FeatureFlag[] {
    const allFlags = { ...this.defaultFlags, ...this.remoteFlags };
    return Object.values(allFlags);
  }

  /**
   * Get flag details
   */
  getFlag(flagKey: string): FeatureFlag | null {
    return this.remoteFlags[flagKey] || this.defaultFlags[flagKey] || null;
  }

  /**
   * Reset all debug overrides
   */
  async resetDebugOverrides(): Promise<void> {
    if (!__DEV__) return;

    const allFlags = this.getAllFlags();
    for (const flag of allFlags) {
      await this.setDebugOverride(flag.key, null);
    }
    this.debugOverrides = {};
  }

  /**
   * Get debug override value
   */
  getDebugOverride(flagKey: string): boolean | null {
    return this.debugOverrides[flagKey] ?? null;
  }
}

// Singleton instance
export const featureFlags = new FeatureFlagsManager();

// Initialize on load
featureFlags.initDebugOverrides().catch(console.error);

/**
 * Hook to check if feature is enabled
 * Uses polling to check for updates (since we can't use MMKV reactive hooks)
 */
export function useFeatureFlag(flagKey: string): boolean {
  const [isEnabled, setIsEnabled] = useState(() =>
    featureFlags.isEnabled(flagKey)
  );

  useEffect(() => {
    // Recompute on mount and when flagKey changes
    setIsEnabled(featureFlags.isEnabled(flagKey));
  }, [flagKey]);

  return isEnabled;
}

/**
 * Hook to get all flags (for settings)
 */
export function useFeatureFlags(): FeatureFlag[] {
  return featureFlags.getAllFlags();
}
