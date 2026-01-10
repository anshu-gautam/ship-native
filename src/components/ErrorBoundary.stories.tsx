/**
 * ErrorBoundary Stories
 *
 * Storybook stories for the ErrorBoundary component
 */

import type { Meta, StoryObj } from '@storybook/react-native';
import type React from 'react';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button } from './Button';
import { ErrorBoundary } from './ErrorBoundary';

// Component that throws an error
const ErrorComponent: React.FC = () => {
  throw new Error('This is a simulated error for testing');
};

// Component that can trigger an error on button press
const ConditionalErrorComponent: React.FC = () => {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error('Error triggered by button press');
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>Click the button to trigger an error</Text>
      <Button title="Trigger Error" onPress={() => setShouldError(true)} variant="danger" />
    </View>
  );
};

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Components/ErrorBoundary',
  component: ErrorBoundary,
  decorators: [
    (Story: React.ComponentType) => (
      <View style={{ padding: 20, backgroundColor: '#F5F5F5', flex: 1 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ErrorBoundary>;

export const Default: Story = {
  render: () => (
    <ErrorBoundary>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18 }}>
          This content is wrapped in an ErrorBoundary. No errors here!
        </Text>
      </View>
    </ErrorBoundary>
  ),
};

export const WithError: Story = {
  render: () => (
    <ErrorBoundary>
      <ErrorComponent />
    </ErrorBoundary>
  ),
};

export const WithCustomFallback: Story = {
  render: () => (
    <ErrorBoundary
      fallback={(error) => (
        <View style={{ padding: 20, backgroundColor: '#FFF3CD', borderRadius: 8 }}>
          <Text style={{ fontSize: 16, color: '#856404', fontWeight: '600' }}>
            ⚠️ Custom Error Fallback
          </Text>
          <Text style={{ fontSize: 14, color: '#856404', marginTop: 8 }}>
            This is a custom error message displayed instead of the default error UI.
          </Text>
          <Text style={{ fontSize: 12, color: '#856404', marginTop: 8 }}>
            Error: {error.message}
          </Text>
        </View>
      )}
    >
      <ErrorComponent />
    </ErrorBoundary>
  ),
};

export const InteractiveError: Story = {
  render: () => (
    <ErrorBoundary>
      <ConditionalErrorComponent />
    </ErrorBoundary>
  ),
};
