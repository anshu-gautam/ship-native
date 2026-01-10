# Payment Integration Guide

This guide covers integrating payment and monetization into your Expo app using **RevenueCat + Stripe**, the recommended approach for cross-platform subscription management in 2025.

## Why RevenueCat + Stripe?

After the **Epic v. Apple** court ruling (April 2025), app developers can now use external payment systems on iOS, reducing the 30% fee charged by Apple and Google. RevenueCat provides:

- **Cross-platform subscription management** (iOS, Android, Web)
- **Lower fees** compared to Apple/Google IAP (when using external payments)
- **Unified API** for all platforms
- **Built-in analytics** and revenue tracking
- **Customer support** and subscription management
- **Stripe integration** for web and external payments

## Architecture Overview

```
┌─────────────┐
│   Your App  │
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
       v                 v
┌──────────────┐  ┌──────────────┐
│  RevenueCat  │  │    Stripe    │
└──────┬───────┘  └──────┬───────┘
       │                 │
       v                 v
┌──────────────┐  ┌──────────────┐
│ App Store/   │  │  Web Payment │
│ Play Store   │  │   (Direct)   │
└──────────────┘  └──────────────┘
```

## Setup Steps

### 1. RevenueCat Setup

#### 1.1 Create RevenueCat Account

1. Go to [RevenueCat](https://www.revenuecat.com/)
2. Create a free account
3. Create a new project

#### 1.2 Configure App Platforms

**For iOS:**
1. In RevenueCat dashboard, go to **Projects → Apps**
2. Click **Add App** → **iOS**
3. Enter your **Bundle ID** (from `app.json`)
4. Add **App Store Connect API Key**:
   - Go to App Store Connect → Users & Access → Keys
   - Create new key with "Developer" access
   - Download key file (.p8)
   - Upload to RevenueCat with Issuer ID and Key ID

**For Android:**
1. Click **Add App** → **Android**
2. Enter your **Package Name** (from `app.json`)
3. Add **Google Play Service Account**:
   - Go to Google Play Console → API Access
   - Create service account
   - Grant "Manage orders and subscriptions" permission
   - Download JSON key
   - Upload to RevenueCat

**For Web (Stripe):**
1. Click **Add App** → **Stripe**
2. Connect your Stripe account
3. RevenueCat will sync with Stripe automatically

#### 1.3 Create Products and Offerings

1. In RevenueCat, go to **Products**
2. Create products for each subscription tier:
   - Monthly subscription
   - Yearly subscription
   - Lifetime purchase (optional)

3. Go to **Offerings** and create an offering:
   - Name: "Default"
   - Add products to offering packages

Example:
```
Offering: "Default"
├── Package: "monthly" → Product: "$9.99/month"
├── Package: "annual" → Product: "$79.99/year"
└── Package: "lifetime" → Product: "$299.99"
```

### 2. Install RevenueCat SDK

```bash
npm install react-native-purchases
```

For Expo, also install:
```bash
npx expo install expo-dev-client
```

### 3. Configure App Store Connect / Google Play

#### App Store Connect (iOS)

1. Go to **App Store Connect → My Apps**
2. Select your app
3. Go to **Features → In-App Purchases**
4. Create subscriptions matching your RevenueCat products
5. For each subscription:
   - Product ID must match RevenueCat product ID
   - Set pricing
   - Add localized descriptions
   - Create subscription group

#### Google Play Console (Android)

1. Go to **Google Play Console → Your App → Monetize → Subscriptions**
2. Create products matching RevenueCat products
3. For each subscription:
   - Product ID must match RevenueCat product ID
   - Set pricing
   - Add localized descriptions
   - Set billing period

### 4. Implement RevenueCat in Your App

#### 4.1 Initialize RevenueCat

Create `src/services/subscription.ts`:

```typescript
import Purchases, {
  LOG_LEVEL,
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
} from 'react-native-purchases';
import { Platform } from 'react-native';

const REVENUECAT_API_KEY = Platform.select({
  ios: 'appl_xxxxxxxxxxxxxxxx', // Replace with your iOS key
  android: 'goog_xxxxxxxxxxxxxxxx', // Replace with your Android key
}) || '';

/**
 * Initialize RevenueCat SDK
 * Call this on app launch
 */
export async function initializeRevenueCat(userId?: string): Promise<void> {
  try {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG); // Remove in production

    await Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
      appUserID: userId, // Optional: your app's user ID
    });

    console.log('RevenueCat initialized');
  } catch (error) {
    console.error('Error initializing RevenueCat:', error);
  }
}

/**
 * Get available offerings
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
 * Purchase a package
 */
export async function purchasePackage(
  pkg: PurchasesPackage
): Promise<{ success: boolean; customerInfo?: CustomerInfo }> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { success: true, customerInfo };
  } catch (error: any) {
    if (error.userCancelled) {
      console.log('User cancelled purchase');
    } else {
      console.error('Error purchasing package:', error);
    }
    return { success: false };
  }
}

/**
 * Restore purchases
 */
export async function restorePurchases(): Promise<CustomerInfo | null> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    return null;
  }
}

/**
 * Get customer info (entitlements)
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
 * Check if user has active subscription
 */
export async function hasActiveSubscription(
  entitlementId: string = 'pro'
): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return (
      customerInfo.entitlements.active[entitlementId] !== undefined
    );
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}

/**
 * Set user ID
 */
export async function identifyUser(userId: string): Promise<void> {
  try {
    await Purchases.logIn(userId);
  } catch (error) {
    console.error('Error identifying user:', error);
  }
}

/**
 * Log out user
 */
export async function logoutUser(): Promise<void> {
  try {
    await Purchases.logOut();
  } catch (error) {
    console.error('Error logging out:', error);
  }
}
```

#### 4.2 Initialize on App Launch

In your `app/_layout.tsx`:

```typescript
import { useEffect } from 'react';
import { initializeRevenueCat } from '@/services/subscription';

export default function RootLayout() {
  useEffect(() => {
    initializeRevenueCat();
  }, []);

  // ... rest of layout
}
```

#### 4.3 Create Paywall UI

Create `src/components/Paywall.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import type { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { getOfferings, purchasePackage } from '@/services/subscription';

export function Paywall({ onSuccess }: { onSuccess?: () => void }) {
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    setLoading(true);
    const currentOffering = await getOfferings();
    setOffering(currentOffering);
    setLoading(false);
  };

  const handlePurchase = async (pkg: PurchasesPackage) => {
    setPurchasing(true);
    const result = await purchasePackage(pkg);
    setPurchasing(false);

    if (result.success) {
      onSuccess?.();
    }
  };

  if (loading) {
    return <ActivityIndicator />;
  }

  if (!offering) {
    return <Text>No offerings available</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upgrade to Pro</Text>
      <Text style={styles.subtitle}>Unlock all premium features</Text>

      {offering.availablePackages.map((pkg) => (
        <Pressable
          key={pkg.identifier}
          style={styles.packageButton}
          onPress={() => handlePurchase(pkg)}
          disabled={purchasing}
        >
          <Text style={styles.packageTitle}>{pkg.product.title}</Text>
          <Text style={styles.packagePrice}>{pkg.product.priceString}</Text>
          <Text style={styles.packageDescription}>
            {pkg.product.description}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  packageButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  packagePrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginVertical: 8,
  },
  packageDescription: {
    fontSize: 14,
    color: '#e5e7eb',
  },
});
```

### 5. Stripe Integration (Web Payments)

#### 5.1 Set Up Stripe

1. Create account at [Stripe](https://stripe.com/)
2. Get API keys from Dashboard
3. Connect Stripe to RevenueCat

#### 5.2 Create Stripe Checkout

For web-based payments (or external payment links on iOS post-Epic ruling):

```typescript
// src/services/stripeCheckout.ts
import { Linking } from 'react-native';

export async function createCheckoutSession(
  priceId: string,
  userId: string
): Promise<void> {
  try {
    // Call your backend to create Stripe Checkout session
    const response = await fetch('https://your-api.com/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId,
        userId,
        successUrl: 'yourapp://payment/success',
        cancelUrl: 'yourapp://payment/cancel',
      }),
    });

    const { url } = await response.json();

    // Open Stripe Checkout in browser or WebView
    await Linking.openURL(url);
  } catch (error) {
    console.error('Error creating checkout session:', error);
  }
}
```

Backend example (Node.js):

```javascript
// backend/routes/payments.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/create-checkout', async (req, res) => {
  const { priceId, userId, successUrl, cancelUrl } = req.body;

  const session = await stripe.checkout.sessions.create({
    customer_email: userId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  res.json({ url: session.url });
});
```

## Testing

### iOS Testing

1. Create **Sandbox Test User** in App Store Connect
2. Sign out of App Store on device
3. Test purchase - system will prompt for sandbox credentials

### Android Testing

1. Add test account in Google Play Console
2. Create **Internal Testing** track
3. Upload build and test purchases

### RevenueCat Testing

RevenueCat provides a **sandbox environment** that works automatically with App Store/Play Store sandbox.

## Best Practices

1. **Always restore purchases** on app launch to sync entitlements
2. **Handle subscription states**:
   - Active
   - Expired
   - In grace period
   - In billing retry
3. **Provide restore button** in settings
4. **Show clear pricing** and terms
5. **Handle errors gracefully**
6. **Cache entitlements** for offline access
7. **Use webhooks** for server-side subscription events

## Revenue Optimization Tips

1. **Offer free trial** (7-14 days)
2. **Provide annual plan** with discount (typically 20-30% off monthly)
3. **A/B test pricing** using RevenueCat Experiments
4. **Show value** before paywall (onboarding, feature showcase)
5. **Use promotional offers** for re-engagement
6. **Cross-sell** on web with Stripe (lower fees)

## Alternative Payment Methods

### Google Pay / Apple Pay

For one-time purchases, use:

```bash
npm install @stripe/stripe-react-native
```

Then follow [Stripe React Native docs](https://stripe.com/docs/payments/accept-a-payment?platform=react-native).

### PayPal

For PayPal integration:

```bash
npm install react-native-paypal
```

See [PayPal React Native SDK](https://developer.paypal.com/sdk/mobile/react-native/).

## Resources

- [RevenueCat Documentation](https://docs.revenuecat.com/)
- [Stripe Documentation](https://stripe.com/docs)
- [App Store In-App Purchase](https://developer.apple.com/in-app-purchase/)
- [Google Play Billing](https://developer.android.com/google/play/billing)
- [Epic v. Apple Ruling Impact](https://www.theverge.com/2025/1/16/epic-apple-external-payments)

## Support

For issues with:
- **RevenueCat**: [RevenueCat Support](https://app.revenuecat.com/support)
- **Stripe**: [Stripe Support](https://support.stripe.com/)
- **Apple IAP**: [App Store Connect Support](https://developer.apple.com/support/)
- **Google Play**: [Play Console Help](https://support.google.com/googleplay/android-developer)
