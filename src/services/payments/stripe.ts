/**
 * Stripe Service
 *
 * Handles web-based payments and one-time purchases
 * Opens Stripe Checkout in browser or WebView for subscriptions
 */

import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import { Linking } from 'react-native';

export interface StripeCheckoutOptions {
  /**
   * Price ID from Stripe dashboard
   */
  priceId: string;

  /**
   * User email
   */
  email?: string;

  /**
   * User ID to associate with subscription
   */
  userId?: string;

  /**
   * Success URL (deep link back to app)
   */
  successUrl?: string;

  /**
   * Cancel URL (deep link back to app)
   */
  cancelUrl?: string;

  /**
   * Custom metadata
   */
  metadata?: Record<string, string>;
}

/**
 * Create Stripe Checkout session (via your backend)
 * Returns the checkout URL to open in browser
 */
export async function createCheckoutSession(
  options: StripeCheckoutOptions
): Promise<{ url: string } | null> {
  try {
    // Call your backend endpoint to create Stripe Checkout session
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/api/payments/create-checkout`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: options.priceId,
          email: options.email,
          userId: options.userId,
          successUrl: options.successUrl || `${getAppScheme()}://payment/success`,
          cancelUrl: options.cancelUrl || `${getAppScheme()}://payment/cancel`,
          metadata: options.metadata,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const data = await response.json();
    return { url: data.url };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return null;
  }
}

/**
 * Open Stripe Checkout in browser
 */
export async function openCheckout(options: StripeCheckoutOptions): Promise<boolean> {
  try {
    const session = await createCheckoutSession(options);
    if (!session) {
      return false;
    }

    const canOpen = await Linking.canOpenURL(session.url);
    if (canOpen) {
      await Linking.openURL(session.url);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error opening checkout:', error);
    return false;
  }
}

/**
 * Create Payment Intent for one-time payment (via your backend)
 */
export async function createPaymentIntent(
  amount: number,
  currency = 'usd',
  metadata?: Record<string, string>
): Promise<{ clientSecret: string; publishableKey: string } | null> {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/api/payments/create-payment-intent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          metadata,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    const data = await response.json();
    return {
      clientSecret: data.clientSecret,
      publishableKey: data.publishableKey,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return null;
  }
}

/**
 * Present native payment sheet for one-time payment
 * Uses Stripe React Native SDK
 */
export async function presentPayment(
  amount: number,
  currency = 'usd',
  metadata?: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  try {
    const paymentIntent = await createPaymentIntent(amount, currency, metadata);
    if (!paymentIntent) {
      return { success: false, error: 'Failed to create payment intent' };
    }

    const { error: initError } = await initPaymentSheet({
      merchantDisplayName: process.env.EXPO_PUBLIC_APP_NAME || 'My App',
      paymentIntentClientSecret: paymentIntent.clientSecret,
      allowsDelayedPaymentMethods: true,
    });

    if (initError) {
      return { success: false, error: initError.message };
    }

    const { error: presentError } = await presentPaymentSheet();

    if (presentError) {
      if (presentError.code === 'Canceled') {
        return { success: false, error: 'User cancelled payment' };
      }
      return { success: false, error: presentError.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error presenting payment:', error);
    return { success: false, error: error.message || 'Payment failed' };
  }
}

/**
 * Get app scheme for deep linking
 */
function getAppScheme(): string {
  // Get from app.json scheme or use default
  return process.env.EXPO_PUBLIC_APP_SCHEME || 'myapp';
}

/**
 * Create Customer Portal session (for managing subscriptions)
 * Opens Stripe Customer Portal in browser
 */
export async function openCustomerPortal(customerId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/api/payments/create-portal-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl: `${getAppScheme()}://settings/subscription`,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create portal session');
    }

    const data = await response.json();
    const canOpen = await Linking.canOpenURL(data.url);
    if (canOpen) {
      await Linking.openURL(data.url);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error opening customer portal:', error);
    return false;
  }
}

/**
 * Verify payment status (via your backend)
 */
export async function verifyPayment(paymentIntentId: string): Promise<{
  status: 'succeeded' | 'processing' | 'requires_payment_method' | 'failed';
  amount?: number;
  currency?: string;
}> {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/api/payments/verify/${paymentIntentId}`
    );

    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }

    const data = await response.json();
    return {
      status: data.status,
      amount: data.amount,
      currency: data.currency,
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    return { status: 'failed' };
  }
}
