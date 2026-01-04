/**
 * Paywall Component
 *
 * Beautiful subscription paywall with both IAP and web payment options
 */

import {
  type PaymentMethod,
  type SubscriptionPlan,
  getSubscriptionPlans,
  purchaseSubscription,
  restorePurchases,
} from '@/services/payments';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PaywallProps {
  /**
   * Callback when subscription is successful
   */
  onSuccess?: () => void;

  /**
   * Callback when paywall is dismissed
   */
  onDismiss?: () => void;

  /**
   * Force specific payment method
   */
  paymentMethod?: PaymentMethod;

  /**
   * User email (for Stripe checkout)
   */
  userEmail?: string;

  /**
   * User ID
   */
  userId?: string;

  /**
   * Show close button
   * @default false
   */
  showClose?: boolean;
}

/**
 * Paywall Component
 *
 * @example
 * ```tsx
 * <Paywall
 *   onSuccess={() => {
 *     console.log('Subscription successful!');
 *     navigation.goBack();
 *   }}
 *   userEmail="user@example.com"
 *   userId="user123"
 * />
 * ```
 */
export function Paywall({
  onSuccess,
  onDismiss,
  paymentMethod,
  userEmail,
  userId,
  showClose = false,
}: PaywallProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    const availablePlans = await getSubscriptionPlans();
    setPlans(availablePlans);
    // Auto-select the yearly plan (usually best value)
    const defaultPlan = availablePlans.find((p) => p.period === 'yearly') || availablePlans[0];
    setSelectedPlan(defaultPlan);
    setLoading(false);
  };

  const handlePurchase = async () => {
    if (!selectedPlan) return;

    setPurchasing(true);
    const result = await purchaseSubscription(selectedPlan, {
      method: paymentMethod,
      email: userEmail,
      userId,
    });
    setPurchasing(false);

    if (result.success) {
      onSuccess?.();
    } else {
      // Show error toast
      console.error('Purchase failed:', result.error);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    const result = await restorePurchases();
    setRestoring(false);

    if (result.success) {
      onSuccess?.();
    } else {
      console.error('Restore failed:', result.error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {showClose && onDismiss && (
        <Pressable style={styles.closeButton} onPress={onDismiss}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Upgrade to Premium</Text>
          <Text style={styles.subtitle}>Unlock all features and get the most out of the app</Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {[
            'Unlimited access to all features',
            'Priority customer support',
            'Ad-free experience',
            'Advanced analytics',
            'Cloud sync across devices',
            'Early access to new features',
          ].map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Plans */}
        <View style={styles.plans}>
          {plans.map((plan) => (
            <Pressable
              key={plan.id}
              style={[styles.planCard, selectedPlan?.id === plan.id && styles.planCardSelected]}
              onPress={() => setSelectedPlan(plan)}
            >
              {plan.period === 'yearly' && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>BEST VALUE</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planPrice}>{plan.price}</Text>
              </View>

              <Text style={styles.planDescription}>{plan.description}</Text>

              {selectedPlan?.id === plan.id && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.selectedText}>✓</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        {/* Subscribe Button */}
        <Pressable
          style={({ pressed }) => [
            styles.subscribeButton,
            pressed && styles.buttonPressed,
            purchasing && styles.buttonDisabled,
          ]}
          onPress={handlePurchase}
          disabled={purchasing || !selectedPlan}
        >
          {purchasing ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.subscribeButtonText}>
              {Platform.OS === 'web' || paymentMethod === 'stripe'
                ? 'Continue to Checkout'
                : 'Subscribe Now'}
            </Text>
          )}
        </Pressable>

        {/* Restore Button (iOS/Android only) */}
        {(Platform.OS === 'ios' || Platform.OS === 'android') && (
          <Pressable style={styles.restoreButton} onPress={handleRestore} disabled={restoring}>
            {restoring ? (
              <ActivityIndicator size="small" color="#6b7280" />
            ) : (
              <Text style={styles.restoreButtonText}>Restore Purchases</Text>
            )}
          </Pressable>
        )}

        {/* Legal */}
        <Text style={styles.legal}>
          Subscriptions automatically renew unless cancelled at least 24 hours before the end of the
          current period. Manage your subscription in your account settings.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  closeButton: {
    position: 'absolute',
    top: 48,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  features: {
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkmark: {
    fontSize: 20,
    color: '#10b981',
    marginRight: 12,
    fontWeight: '700',
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
  },
  plans: {
    marginBottom: 24,
    gap: 12,
  },
  planCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3b82f6',
  },
  planDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  subscribeButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  subscribeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  restoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  restoreButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  legal: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
});
