/**
 * RevenueCat Service
 *
 * Handles native in-app purchases (iOS App Store, Google Play Store)
 * using RevenueCat SDK for cross-platform subscription management
 */

import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type PurchasesOffering,
  type PurchasesPackage,
  type CustomerInfo,
  type PurchasesStoreProduct,
} from 'react-native-purchases';

const REVENUECAT_API_KEYS = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || '',
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '',
};

/**
 * Initialize RevenueCat SDK
 * Call this on app launch
 */
export async function initializeRevenueCat(userId?: string): Promise<void> {
  try {
    const apiKey = Platform.select(REVENUECAT_API_KEYS);

    if (!apiKey) {
      console.warn('RevenueCat API key not found');
      return;
    }

    // Enable debug logs in development
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    await Purchases.configure({
      apiKey,
      appUserID: userId,
    });

    console.log('RevenueCat initialized');
  } catch (error) {
    console.error('Error initializing RevenueCat:', error);
  }
}

/**
 * Get available offerings (subscription plans)
 */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error('Error getting offerings:', error);
    return null;
  }
}

/**
 * Get all available offerings
 */
export async function getAllOfferings(): Promise<{
  current: PurchasesOffering | null;
  all: Record<string, PurchasesOffering>;
}> {
  try {
    const offerings = await Purchases.getOfferings();
    return {
      current: offerings.current,
      all: offerings.all,
    };
  } catch (error) {
    console.error('Error getting all offerings:', error);
    return { current: null, all: {} };
  }
}

/**
 * Purchase a package
 */
export async function purchasePackage(
  pkg: PurchasesPackage
): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { success: true, customerInfo };
  } catch (error: unknown) {
    const err = error as { userCancelled?: boolean; message?: string };
    if (err.userCancelled) {
      return { success: false, error: 'User cancelled purchase' };
    }
    console.error('Error purchasing package:', error);
    return { success: false, error: err.message || 'Purchase failed' };
  }
}

/**
 * Purchase a product by ID
 */
export async function purchaseProduct(
  productId: string
): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> {
  try {
    const products = await Purchases.getProducts([productId]);
    if (products.length === 0) {
      return { success: false, error: 'Product not found' };
    }
    const { customerInfo } = await Purchases.purchaseStoreProduct(products[0]);
    return { success: true, customerInfo };
  } catch (error: unknown) {
    const err = error as { userCancelled?: boolean; message?: string };
    if (err.userCancelled) {
      return { success: false, error: 'User cancelled purchase' };
    }
    console.error('Error purchasing product:', error);
    return { success: false, error: err.message || 'Purchase failed' };
  }
}

/**
 * Restore purchases
 */
export async function restorePurchases(): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return { success: true, customerInfo };
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Error restoring purchases:', error);
    return { success: false, error: err.message || 'Restore failed' };
  }
}

/**
 * Get customer info (entitlements and subscriptions)
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('Error getting customer info:', error);
    return null;
  }
}

/**
 * Check if user has active entitlement
 */
export async function hasActiveEntitlement(entitlementId: string): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[entitlementId] !== undefined;
  } catch (error) {
    console.error('Error checking entitlement:', error);
    return false;
  }
}

/**
 * Check if user has any active subscription
 */
export async function hasActiveSubscription(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return Object.keys(customerInfo.entitlements.active).length > 0;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}

/**
 * Get products by IDs
 */
export async function getProducts(productIds: string[]): Promise<PurchasesStoreProduct[]> {
  try {
    const products = await Purchases.getProducts(productIds);
    return products;
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
}

/**
 * Identify user (link RevenueCat user to your app user)
 */
export async function identifyUser(userId: string): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  try {
    const { customerInfo } = await Purchases.logIn(userId);
    return { success: true, customerInfo };
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Error identifying user:', error);
    return { success: false, error: err.message };
  }
}

/**
 * Log out user (clear user association)
 */
export async function logoutUser(): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  try {
    const customerInfo = await Purchases.logOut();
    return { success: true, customerInfo };
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Error logging out user:', error);
    return { success: false, error: err.message };
  }
}

/**
 * Set user attributes (for analytics and targeting)
 */
export async function setUserAttributes(attributes: Record<string, string | null>): Promise<void> {
  try {
    await Purchases.setAttributes(attributes);
  } catch (error) {
    console.error('Error setting user attributes:', error);
  }
}

/**
 * Set email for customer
 */
export async function setEmail(email: string): Promise<void> {
  try {
    await Purchases.setEmail(email);
  } catch (error) {
    console.error('Error setting email:', error);
  }
}

/**
 * Check if billing is available on this device
 */
export function isBillingAvailable(): boolean {
  // On iOS, billing is always available
  // On Android, Google Play Services must be installed
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

/**
 * Get subscription status details
 */
export async function getSubscriptionStatus(): Promise<{
  isActive: boolean;
  willRenew: boolean;
  expirationDate?: Date;
  productId?: string;
  entitlements: string[];
}> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const activeEntitlements = Object.keys(customerInfo.entitlements.active);

    if (activeEntitlements.length === 0) {
      return {
        isActive: false,
        willRenew: false,
        entitlements: [],
      };
    }

    // Get the first active entitlement for details
    const firstEntitlement = customerInfo.entitlements.active[activeEntitlements[0]];

    return {
      isActive: true,
      willRenew: firstEntitlement.willRenew,
      expirationDate: firstEntitlement.expirationDate
        ? new Date(firstEntitlement.expirationDate)
        : undefined,
      productId: firstEntitlement.productIdentifier,
      entitlements: activeEntitlements,
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return {
      isActive: false,
      willRenew: false,
      entitlements: [],
    };
  }
}
