/**
 * Subscription Status Component
 *
 * Displays current subscription status and management options
 */

import { getSubscriptionStatus, manageSubscription } from '@/services/payments';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

interface SubscriptionStatusProps {
  /**
   * Callback when user wants to upgrade
   */
  onUpgrade?: () => void;
}

/**
 * Subscription Status Component
 *
 * @example
 * ```tsx
 * <SubscriptionStatus
 *   onUpgrade={() => navigation.navigate('Paywall')}
 * />
 * ```
 */
export function SubscriptionStatus({ onUpgrade }: SubscriptionStatusProps) {
  const [status, setStatus] = useState<{
    isActive: boolean;
    willRenew: boolean;
    expirationDate?: Date;
    plan?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [managing, setManaging] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    const subscriptionStatus = await getSubscriptionStatus();
    setStatus(subscriptionStatus);
    setLoading(false);
  };

  const handleManage = async () => {
    setManaging(true);
    await manageSubscription();
    setManaging(false);
    // Reload status after managing
    setTimeout(loadStatus, 2000);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#3b82f6" />
      </View>
    );
  }

  if (!status?.isActive) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.statusTitle}>No Active Subscription</Text>
          <Text style={styles.statusDescription}>Upgrade to premium to unlock all features</Text>

          {onUpgrade && (
            <Pressable
              style={({ pressed }) => [styles.upgradeButton, pressed && styles.buttonPressed]}
              onPress={onUpgrade}
            >
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.card, styles.activeCard]}>
        <View style={styles.activeBadge}>
          <Text style={styles.activeBadgeText}>ACTIVE</Text>
        </View>

        <Text style={styles.statusTitle}>Premium Subscription</Text>

        {status.plan && <Text style={styles.planName}>{status.plan}</Text>}

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={styles.detailValue}>
              {status.willRenew ? 'Active - Auto-renews' : 'Active - Cancelled'}
            </Text>
          </View>

          {status.expirationDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {status.willRenew ? 'Renews on:' : 'Expires on:'}
              </Text>
              <Text style={styles.detailValue}>{formatDate(status.expirationDate)}</Text>
            </View>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [styles.manageButton, pressed && styles.buttonPressed]}
          onPress={handleManage}
          disabled={managing}
        >
          {managing ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : (
            <Text style={styles.manageButtonText}>Manage Subscription</Text>
          )}
        </Pressable>

        {!status.willRenew && (
          <Text style={styles.cancelledNote}>
            Your subscription will remain active until{' '}
            {status.expirationDate && formatDate(status.expirationDate)}
          </Text>
        )}
      </View>
    </View>
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeCard: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  activeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  activeBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  planName: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '600',
    marginBottom: 16,
  },
  detailsContainer: {
    marginBottom: 20,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  upgradeButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  manageButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  manageButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  cancelledNote: {
    marginTop: 16,
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
  },
});
