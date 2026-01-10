/**
 * Payment Manager
 *
 * Unified payment service that handles both:
 * 1. Native IAP (RevenueCat) for iOS/Android subscriptions
 * 2. Web payments (Stripe) for web subscriptions and one-time purchases
 *
 * Automatically chooses the best payment method based on platform and user preference
 */

import { Platform } from 'react-native';
import type { CustomerInfo } from 'react-native-purchases';
import * as RevenueCat from './revenueCat';
import * as Stripe from './stripe';

export type PaymentMethod = 'iap' | 'stripe';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  priceValue: number;
  currency: string;
  period: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  // RevenueCat package identifier (for IAP)
  packageId?: string;
  // Stripe price ID (for web payments)
  stripePriceId?: string;
}

/**
 * Initialize payment services
 */
export async function initializePayments(userId?: string): Promise<void> {
  // Initialize RevenueCat for native IAP
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    await RevenueCat.initializeRevenueCat(userId);
  }
}

/**
 * Get available subscription plans
 * Combines offerings from both RevenueCat and custom plans
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const plans: SubscriptionPlan[] = [];

  // Get RevenueCat offerings
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    const offering = await RevenueCat.getOfferings();
    if (offering) {
      for (const pkg of offering.availablePackages) {
        const product = pkg.product;
        plans.push({
          id: pkg.identifier,
          name: product.title,
          description: product.description,
          price: product.priceString,
          priceValue: product.price,
          currency: product.currencyCode,
          period: getPeriodFromPackage(pkg.identifier),
          features: [],
          packageId: pkg.identifier,
        });
      }
    }
  }

  // Add Stripe plans (for web or alternative payment)
  // These should match your Stripe dashboard configuration
  const stripePlans: SubscriptionPlan[] = [
    {
      id: 'monthly',
      name: 'Monthly Subscription',
      description: 'Billed monthly',
      price: '$9.99',
      priceValue: 9.99,
      currency: 'USD',
      period: 'monthly',
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
      stripePriceId: process.env.EXPO_PUBLIC_STRIPE_MONTHLY_PRICE_ID,
    },
    {
      id: 'yearly',
      name: 'Yearly Subscription',
      description: 'Billed annually - Save 20%',
      price: '$79.99',
      priceValue: 79.99,
      currency: 'USD',
      period: 'yearly',
      features: ['Feature 1', 'Feature 2', 'Feature 3', 'Priority Support'],
      stripePriceId: process.env.EXPO_PUBLIC_STRIPE_YEARLY_PRICE_ID,
    },
  ];

  // If no RevenueCat plans found, use Stripe plans
  if (plans.length === 0) {
    plans.push(...stripePlans);
  }

  return plans;
}

/**
 * Purchase subscription
 * Automatically uses the best payment method for the platform
 */
export async function purchaseSubscription(
  plan: SubscriptionPlan,
  options?: {
    method?: PaymentMethod;
    email?: string;
    userId?: string;
  }
): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  // Determine payment method
  const method = options?.method || getDefaultPaymentMethod();

  if (method === 'iap' && plan.packageId) {
    // Use RevenueCat IAP
    const offering = await RevenueCat.getOfferings();
    const pkg = offering?.availablePackages.find((p) => p.identifier === plan.packageId);

    if (!pkg) {
      return { success: false, error: 'Package not found' };
    }

    return await RevenueCat.purchasePackage(pkg);
  }
  if (method === 'stripe' && plan.stripePriceId) {
    // Use Stripe Checkout
    const success = await Stripe.openCheckout({
      priceId: plan.stripePriceId,
      email: options?.email,
      userId: options?.userId,
    });

    return {
      success,
      error: success ? undefined : 'Failed to open checkout',
    };
  }

  return { success: false, error: 'No payment method available' };
}

/**
 * Restore purchases (IAP only)
 */
export async function restorePurchases(): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return await RevenueCat.restorePurchases();
  }
  return { success: false, error: 'Restore not available on this platform' };
}

/**
 * Check if user has active subscription
 */
export async function hasActiveSubscription(): Promise<boolean> {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return await RevenueCat.hasActiveSubscription();
  }

  // For web, check via your backend API
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/subscription/status`);
    const data = await response.json();
    return data.isActive || false;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
}

/**
 * Get subscription status
 */
export async function getSubscriptionStatus(): Promise<{
  isActive: boolean;
  willRenew: boolean;
  expirationDate?: Date;
  plan?: string;
}> {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    const status = await RevenueCat.getSubscriptionStatus();
    return {
      isActive: status.isActive,
      willRenew: status.willRenew,
      expirationDate: status.expirationDate,
      plan: status.productId,
    };
  }

  // For web, check via your backend
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/subscription/status`);
    const data = await response.json();
    return {
      isActive: data.isActive || false,
      willRenew: data.willRenew || false,
      expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
      plan: data.plan,
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return {
      isActive: false,
      willRenew: false,
    };
  }
}

/**
 * Open subscription management page
 */
export async function manageSubscription(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    // Open iOS subscription management
    const { Linking } = await import('react-native');
    return await Linking.openURL('https://apps.apple.com/account/subscriptions');
  }
  if (Platform.OS === 'android') {
    // Open Google Play subscription management
    const { Linking } = await import('react-native');
    const packageName = 'com.yourapp'; // Replace with your package name
    return await Linking.openURL(
      `https://play.google.com/store/account/subscriptions?package=${packageName}`
    );
  }
  // Open Stripe Customer Portal for web
  // You need to get the customer ID from your backend
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/subscription/customer-id`);
    const data = await response.json();
    if (data.customerId) {
      return await Stripe.openCustomerPortal(data.customerId);
    }
    return false;
  } catch (error) {
    console.error('Error opening subscription management:', error);
    return false;
  }
}

/**
 * Get default payment method based on platform
 */
function getDefaultPaymentMethod(): PaymentMethod {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return 'iap';
  }
  return 'stripe';
}

/**
 * Parse period from package identifier
 */
function getPeriodFromPackage(packageId: string): 'monthly' | 'yearly' | 'lifetime' {
  const id = packageId.toLowerCase();
  if (id.includes('annual') || id.includes('year')) return 'yearly';
  if (id.includes('lifetime') || id.includes('permanent')) return 'lifetime';
  return 'monthly';
}

/**
 * Identify user across payment systems
 */
export async function identifyUser(userId: string, email?: string): Promise<void> {
  // Identify in RevenueCat
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    await RevenueCat.identifyUser(userId);
    if (email) {
      await RevenueCat.setEmail(email);
    }
  }

  // You can also sync with your backend for Stripe
}

/**
 * Logout user from payment systems
 */
export async function logoutPaymentUser(): Promise<void> {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    await RevenueCat.logoutUser();
  }
}

// Re-export individual services for advanced use cases
export { RevenueCat, Stripe };
