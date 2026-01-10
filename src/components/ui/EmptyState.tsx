/**
 * Empty State Component
 *
 * Displays when there's no data to show
 */

import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

interface EmptyStateProps {
  /**
   * Title text
   */
  title: string;

  /**
   * Description text
   */
  description?: string;

  /**
   * Icon component (optional)
   */
  icon?: React.ReactNode;

  /**
   * Primary action button text
   */
  actionLabel?: string;

  /**
   * Primary action handler
   */
  onAction?: () => void;

  /**
   * Secondary action button text
   */
  secondaryActionLabel?: string;

  /**
   * Secondary action handler
   */
  onSecondaryAction?: () => void;

  /**
   * Custom style for container
   */
  style?: ViewStyle;
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}

      <Text style={styles.title}>{title}</Text>

      {description && <Text style={styles.description}>{description}</Text>}

      {actionLabel && onAction && (
        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
          onPress={onAction}
        >
          <Text style={styles.primaryButtonText}>{actionLabel}</Text>
        </Pressable>
      )}

      {secondaryActionLabel && onSecondaryAction && (
        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
          onPress={onSecondaryAction}
        >
          <Text style={styles.secondaryButtonText}>{secondaryActionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  secondaryButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
